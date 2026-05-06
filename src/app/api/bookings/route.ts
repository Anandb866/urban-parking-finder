import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const bookings = await prisma.booking.findMany({
      where:
        role === "OWNER" ? { slot: { lot: { ownerId: userId } } } : { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        slot: {
          include: {
            lot: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                pricePerHour: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { lotId, vehicleType, startTime, endTime, vehicleNo } = body;

    if (!lotId || !vehicleType || !startTime || !endTime || !vehicleNo) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );

    if (hours <= 0) {
      return NextResponse.json(
        { error: "Invalid time range" },
        { status: 400 },
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.parkingSlot.findFirst({
        where: { lotId, vehicleType: vehicleType as any, isAvailable: true },
      });

      if (!slot) throw new Error("NO_SLOTS");

      await tx.parkingSlot.update({
        where: { id: slot.id },
        data: { isAvailable: false },
      });

      const lot = await tx.parkingLot.findUnique({ where: { id: lotId } });
      if (!lot) throw new Error("LOT_NOT_FOUND");

      const totalAmount = Math.round(hours * lot.pricePerHour);
      const qrCode = `BK${Date.now().toString(36).toUpperCase()}`;

      return tx.booking.create({
        data: {
          startTime: start,
          endTime: end,
          totalAmount,
          vehicleNo,
          qrCode,
          userId,
          slotId: slot.id,
          status: "CONFIRMED",
        },
        include: {
          slot: {
            include: {
              lot: { select: { name: true, address: true, city: true } },
            },
          },
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: any) {
    if (err.message === "NO_SLOTS") {
      return NextResponse.json(
        { error: "No slots available" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
