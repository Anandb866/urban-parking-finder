import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Parking in Seconds
          </h1>
          <p className="text-xl text-gray-500 mb-10">
            Discover available parking spots near you and book instantly
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 max-w-2xl mx-auto">
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Enter location or address"
                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400"
              />
              <select className="px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white outline-none">
                <option>2-Wheeler</option>
                <option>4-Wheeler</option>
                <option>EV</option>
              </select>
              <Link
                href="/map"
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 text-sm"
              >
                Find Parking
              </Link>
            </div>
          </div>
          <div className="flex justify-center gap-10 mt-10 text-sm text-gray-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div>Parking Spots</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10</div>
              <div>Cities</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50k+</div>
              <div>Bookings</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-center text-gray-500 mb-14">
            Book your parking spot in 3 simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "1",
                title: "Search Location",
                desc: "Enter your destination and find nearby parking spots on the map",
              },
              {
                n: "2",
                title: "Select Time",
                desc: "Choose your parking duration and see real-time availability",
              },
              {
                n: "3",
                title: "Book & Park",
                desc: "Confirm your booking and arrive with guaranteed parking",
              },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-blue-600">
                    {s.n}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 flex items-start gap-5">
          <div className="text-3xl">🛡️</div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Safe &amp; Secure Parking
            </h3>
            <p className="text-gray-500 text-sm">
              All our parking partners are verified with 24/7 CCTV surveillance
              and security
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Own a parking space?
          </h2>
          <p className="text-blue-100 mb-8">
            List your parking lot and start earning today
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 inline-block"
          >
            List Your Parking
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        © 2026 ParkKing. Built for Indian cities.
      </footer>
    </div>
  );
}
