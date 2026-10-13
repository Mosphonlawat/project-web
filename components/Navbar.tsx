"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import CartDrawer from "./CartDrawer";
import OrdersDrawer from "./OrdersDrawer";
import UserDrawer from "./UserDrawer";

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  stock: number;
  imageUrl?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    const handleAddToCart = (e: Event) => {
      const incomingProduct = (e as CustomEvent).detail as Product;

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.product.productId === incomingProduct.productId,
        );

        if (existingItem) {
          if (existingItem.quantity >= incomingProduct.stock) {
            setTimeout(
              () =>
                alert(
                  `ขออภัยครับ ${incomingProduct.productName} มีจำนวนสูงสุดเท่าที่มีในสต๊อกแล้ว (${incomingProduct.stock} ชิ้น)`,
                ),
              0,
            );
            return prevCart;
          }
          return prevCart.map((item) =>
            item.product.productId === incomingProduct.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        } else {
          return [...prevCart, { product: incomingProduct, quantity: 1 }];
        }
      });

      setIsCartOpen(true);
    };

    window.addEventListener("add-to-cart", handleAddToCart);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("add-to-cart", handleAddToCart);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");

    setUser(null);
    setCart([]);
    setIsCartOpen(false);
    setIsOrdersOpen(false);
    setIsUserDrawerOpen(false);

    router.push("/login");
  };

  const totalItemsCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const isHome = pathname === "/";
  const textColor = isHome && !isScrolled ? "text-white" : "text-gray-900";
  const hoverColor =
    isHome && !isScrolled ? "hover:text-gray-300" : "hover:text-gray-500";
  const dividerColor =
    isHome && !isScrolled ? "text-white/50" : "text-gray-300";

  return (
    <>
      <nav
        className={`fixed w-full z-40 transition-all duration-300 ${
          isScrolled || !isHome
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* โลโก้แบรนด์ Fit-PROTEIN */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className={`text-2xl tracking-widest uppercase transition-colors flex items-center ${textColor}`}
              >
                FIT<span className="font-bold">-PROTEIN</span>
              </Link>
            </div>

            <div
              className={`flex items-center space-x-6 text-sm uppercase tracking-widest transition-colors ${textColor}`}
            >
              <Link href="/" className={`${hoverColor} transition`}>
                HOME
              </Link>

              {/* ลิงก์ SHOP */}
              <Link href="/products" className={`${hoverColor} transition`}>
                SHOP
              </Link>

              {/* แสดงไอคอนตะกร้าสินค้าเฉพาะเมื่อล็อกอินแล้ว และไม่ใช่หน้า Login/Register */}
              {user && !isAuthPage && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`relative flex items-center ${hoverColor} transition cursor-pointer`}
                  title="Cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {totalItemsCount}
                    </span>
                  )}
                </button>
              )}

              <span className={dividerColor}>|</span>

              {user ? (
                <div className="flex items-center gap-3">
                  {/* 🌟 ปุ่มชื่อ User: ปรับเป็นทรงแคปซูลมินิมอล มีไอคอน Profile สวยงาม (เอาลูกศรออกแล้ว) */}
                  <button
                    onClick={() => setIsUserDrawerOpen(true)}
                    className={`flex items-center gap-2 py-1 px-3 rounded-full text-xs tracking-wider transition cursor-pointer select-none border ${
                      isHome && !isScrolled
                        ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                        : "border-gray-200 text-gray-800 hover:border-black hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    <span className="font-medium">
                      HI,{" "}
                      {user.firstName
                        ? user.firstName.toUpperCase()
                        : user.role}
                    </span>
                  </button>

                  {/* ไอคอน Logout */}
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className={`flex items-center ${hoverColor} transition cursor-pointer p-1.5 hover:opacity-75`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link href="/login" className={`${hoverColor} transition`}>
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* หน้าต่างตะกร้าสินค้า CartDrawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        user={user}
      />

      {/* หน้าต่างประวัติคำสั่งซื้อ OrdersDrawer */}
      <OrdersDrawer
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        user={user}
      />

      {/* หน้าต่างแถบ Account/User Drawer จากด้านขวา */}
      <UserDrawer
        isOpen={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        user={user}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
      />
    </>
  );
}
