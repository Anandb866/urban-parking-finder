import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleType = searchParams.get("vehicleType");
    const city = searchParams.get("city");

    const lots = await prisma.parkingLot.findMany({
      where: {
        isActive: true,
        ...(city && { city: { contains: city, mode: "insensitive" } }),
        ...(vehicleType && { vehicleTypes: { has: vehicleType as any } }),
      },
      include: {
        owner: { select: { name: true } },
        slots: { select: { isAvailable: true } },
      },
    });

    const result = lots.map((lot: any) => ({
      ...lot,
      availableSlots: lot.slots.filter((s: any) => s.isAvailable).length,
      slots: undefined,
    }));

    return NextResponse.json({ lots: result });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch lots" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      address,
      city,
      latitude,
      longitude,
      totalSlots,
      pricePerHour,
      vehicleTypes,
      amenities,
    } = body;

    const lot = await prisma.parkingLot.create({
      data: {
        name,
        address,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        totalSlots: parseInt(totalSlots),
        pricePerHour: parseFloat(pricePerHour),
        vehicleTypes: vehicleTypes || ["FOUR_WHEELER"],
        amenities: amenities || [],
        images: [],
        ownerId: (session.user as any).id,
      },
    });

    const slots = [];
    for (let i = 1; i <= lot.totalSlots; i++) {
      slots.push({
        slotNumber: `${lot.id.slice(-4).toUpperCase()}-${String(i).padStart(3, "0")}`,
        vehicleType: (vehicleTypes?.[0] || "FOUR_WHEELER") as any,
        lotId: lot.id,
      });
    }
    await prisma.parkingSlot.createMany({ data: slots });

    return NextResponse.json({ lot }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create lot" },
      { status: 500 },
    );
  }
}
