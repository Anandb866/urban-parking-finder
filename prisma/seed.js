const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("seeding...");

  await prisma.booking.deleteMany();
  await prisma.parkingSlot.deleteMany();
  await prisma.parkingLot.deleteMany();
  await prisma.user.deleteMany();

  const driverPass = await bcrypt.hash("password123", 12);
  const ownerPass = await bcrypt.hash("password123", 12);

  const driver = await prisma.user.create({
    data: {
      name: "Anand Sharma",
      email: "driver@parkease.com",
      password: driverPass,
      role: "DRIVER",
      phone: "9876543210",
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Ravi Gupta",
      email: "owner@parkease.com",
      password: ownerPass,
      role: "OWNER",
      phone: "9123456780",
    },
  });

  const lots = [
    {
      name: "Phoenix MarketCity Basement P1",
      address: "LBS Marg, Kurla West",
      city: "Mumbai",
      latitude: 19.088,
      longitude: 72.8898,
      totalSlots: 30,
      pricePerHour: 40,
      vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
      amenities: ["CCTV", "Covered", "24/7", "Security Guard"],
    },
    {
      name: "BKC Corporate Parking",
      address: "G Block, Bandra Kurla Complex",
      city: "Mumbai",
      latitude: 19.0659,
      longitude: 72.8682,
      totalSlots: 50,
      pricePerHour: 60,
      vehicleTypes: ["FOUR_WHEELER", "EV"],
      amenities: ["CCTV", "Covered", "EV Charging", "Valet"],
    },
    {
      name: "Indiranagar 100ft Road Parking",
      address: "100 Feet Road, Indiranagar",
      city: "Bengaluru",
      latitude: 12.9784,
      longitude: 77.6408,
      totalSlots: 20,
      pricePerHour: 30,
      vehicleTypes: ["TWO_WHEELER", "FOUR_WHEELER"],
      amenities: ["CCTV", "Open Air"],
    },
    {
      name: "UB City Mall Parking",
      address: "Vittal Mallya Road, Bengaluru",
      city: "Bengaluru",
      latitude: 12.9716,
      longitude: 77.5946,
      totalSlots: 40,
      pricePerHour: 50,
      vehicleTypes: ["FOUR_WHEELER", "EV"],
      amenities: ["CCTV", "Covered", "EV Charging", "24/7"],
    },
    {
      name: "Connaught Place Underground",
      address: "Block A, Connaught Place",
      city: "Delhi",
      latitude: 28.6315,
      longitude: 77.2167,
      totalSlots: 60,
      pricePerHour: 35,
      vehicleTypes: ["TWO_WHEELER", "FOUR_WHEELER"],
      amenities: ["CCTV", "Covered", "24/7", "Security"],
    },
    {
      name: "Select City Walk Parking",
      address: "Saket District Centre, Delhi",
      city: "Delhi",
      latitude: 28.527,
      longitude: 77.219,
      totalSlots: 80,
      pricePerHour: 45,
      vehicleTypes: ["FOUR_WHEELER", "EV", "TWO_WHEELER"],
      amenities: ["CCTV", "Covered", "EV Charging", "Valet", "24/7"],
    },
  ];

  for (const lotData of lots) {
    const lot = await prisma.parkingLot.create({
      data: {
        ...lotData,
        images: [],
        ownerId: owner.id,
      },
    });

    const slots = [];
    for (let i = 1; i <= lot.totalSlots; i++) {
      const vtIndex = i % lotData.vehicleTypes.length;
      slots.push({
        slotNumber: `${lot.id.slice(-4).toUpperCase()}-${String(i).padStart(3, "0")}`,
        vehicleType: lotData.vehicleTypes[vtIndex],
        isAvailable: i > Math.floor(lot.totalSlots * 0.3),
        lotId: lot.id,
      });
    }

    await prisma.parkingSlot.createMany({ data: slots });
    console.log(`created: ${lot.name} (${lot.totalSlots} slots)`);
  }

  console.log("\ndone!");
  console.log("driver: driver@parkease.com / password123");
  console.log("owner:  owner@parkease.com  / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
