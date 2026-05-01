export type Role = "DRIVER" | "OWNER";
export type VehicleType = "TWO_WHEELER" | "FOUR_WHEELER" | "EV";
export type BookingStatus = "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  createdAt: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  vehicleTypes: VehicleType[];
  amenities: string[];
  images: string[];
  isActive: boolean;
  ownerId: string;
  owner?: { name: string };
  createdAt: string;
}

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  vehicleType: VehicleType;
  isAvailable: boolean;
  lotId: string;
}

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
  vehicleNo: string;
  qrCode?: string;
  createdAt: string;
  userId: string;
  slotId: string;
  slot?: {
    slotNumber: string;
    vehicleType: VehicleType;
    lot?: ParkingLot;
  };
  user?: Pick<User, "id" | "name" | "email">;
}
