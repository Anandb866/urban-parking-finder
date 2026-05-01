"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <span className="font-bold text-gray-900 text-lg">ParkKing</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/map"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Find Parking
          </Link>

          {user ? (
            <>
              <Link
                href={user.role === "OWNER" ? "/owner/dashboard" : "/dashboard"}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                {user.role === "OWNER" ? "Dashboard" : "My Bookings"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Sign out
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
