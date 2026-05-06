import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status },
        include: { slot: true },
      });

      if (status === "CANCELLED") {
        await tx.parkingSlot.update({
          where: { id: updated.slot.id },
          data: { isAvailable: true },
        });
      }

      return updated;
    });

    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
