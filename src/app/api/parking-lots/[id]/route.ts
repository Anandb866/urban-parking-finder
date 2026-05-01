import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const lot = await prisma.parkingLot.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { name: true, email: true } },
        slots: {
          select: {
            id: true,
            slotNumber: true,
            vehicleType: true,
            isAvailable: true,
          },
          orderBy: { slotNumber: "asc" },
        },
      },
    });

    if (!lot) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      lot: {
        ...lot,
        availableSlots: lot.slots.filter((s: any) => s.isAvailable).length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch lot" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const lot = await prisma.parkingLot.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ lot });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update lot" },
      { status: 500 },
    );
  }
}
