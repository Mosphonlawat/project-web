import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        {/* ส่วนที่ 1: ชื่อแบรนด์และคำอธิบาย */}
        <div>
          <h2 className="text-xl tracking-widest mb-4">
            FIT<span className="font-bold">-PROTEIN</span>
          </h2>
          <p className="text-gray-400 text-sm font-light leading-relaxed">
            Premium Sports Nutrition & Whey Protein. <br />
            Fuel every rep, power your progress.
          </p>
        </div>

        {/* ส่วนที่ 2: เมนู Quick Links */}
        <div>
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase mb-6 text-gray-300">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm text-gray-400 font-light">
            <li>
              <Link
                href="/"
                className="hover:text-white transition duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-white transition duration-300"
              >
                Shop
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition duration-300"
              >
                About Me
              </Link>
            </li>
          </ul>
        </div>

        {/* ส่วนที่ 3: ช่องทางการติดต่อ */}
        <div>
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase mb-6 text-gray-300">
            Contact Us
          </h3>
          <ul className="space-y-3 text-sm text-gray-400 font-light">
            <li>Email: support@fitprotein.com</li>
            <li>Phone: 080-123-4567</li>
            <li>Location: Chiang Mai, Thailand</li>
          </ul>
        </div>
      </div>

      {/* ส่วนลิขสิทธิ์ (Copyright) ด้านล่างสุด */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500 font-light tracking-widest">
          &copy; {new Date().getFullYear()} FITPROTEIN. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
