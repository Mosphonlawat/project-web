import "./globals.css";
import Navbar from "@/components/Navbar"; // นำเข้า Navbar
import Footer from "@/components/Footer"; // นำเข้า Footer

export const metadata = {
  title: "FitPROTEIN | Premium Sports Nutrition", // 👈 เปลี่ยนชื่อตรงนี้
  description: "อาหารเสริมและเวย์โปรตีนสำหรับคนรักการออกกำลังกาย",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased relative">
        {/* แถบเมนูด้านบนสุด */}
        <Navbar />

        {/* เนื้อหาหลักของแต่ละหน้า */}
        <div className="min-h-screen">{children}</div>

        {/* แถบส่วนท้ายด้านล่างสุด */}
        <Footer />
      </body>
    </html>
  );
}
