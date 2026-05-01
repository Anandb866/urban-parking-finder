# urban-parking-finder

Full-stack urban parking finder for Indian tier-1 cities — Next.js 14, PostgreSQL, Prisma, Mapbox, NextAuth

User Roles:

- Super Admin
- Admin
- Customer (User)

  Entities:

- User
- Parking
- Slot
- Booking
- Payment
- Review / Rating
- Notification

  Pages:

  With Login:

- Dashboard (role-based)
- Users (Super Admin)
- Parking Management (Admin/Super Admin)
- Slots (Admin)
- Bookings (User -> own, Admin -> all)
- Payments
- Reviews & Ratings
- Notifications
- Analytics

  Without Login:

- Home (search + map)
- About
- Parking Listing (filters + search)
- Parking Details (map, slots, reviews, book now)
- Checkout / Booking
- Contact
- Signin / Signup
- Terms & Privacy

  Key Features / Changes:
  Session Management:

- Not logged in -> show Signin/Signup
- Logged in -> show Profile (dashboard, bookings, logout)
- Protect routes

  Admin Dashboard:

- Total bookings, cancelled, active
- Charts + top parking locations

  Bookings:

- User -> own bookings
- Admin -> all bookings
- Filters (date, status)

  Real-Time Slots:

- Show available/full
- Prevent double booking

  Parking Details:

- Price, slots, reviews
- Nearby parking (carousel)

  Map Integration:

- Show parking on map
- Click marker -> details
  Notifications:
- Booking confirmation + reminder
