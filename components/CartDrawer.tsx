"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: any;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  setCart,
  user,
}: CartDrawerProps) {
  const router = useRouter();
  const [address, setAddress] = useState(""); // 🌟 State สำหรับเก็บที่อยู่จัดส่ง
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // คำนวณยอดเงินรวม
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.product.productPrice * item.quantity,
    0,
  );

  // เพิ่มจำนวนสินค้า
  const handleIncrease = (productId: number, stock: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.productId === productId) {
          if (item.quantity >= stock) {
            alert(`ขออภัย สินค้านี้เหลือสต็อกเพียง ${stock} ชิ้น`);
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    );
  };

  // ลดจำนวนสินค้า
  const handleDecrease = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // ลบสินค้าชิ้นนั้นออกจากตะกร้า
  const handleRemove = (productId: number) => {
    setCart((prev) =>
      prev.filter((item) => item.product.productId !== productId),
    );
  };

  // 🌟 ฟังก์ชันกดยืนยันการสั่งซื้อ (ส่งข้อมูลเข้า API Orders -> บันทึกลงตาราง -> โผล่ที่ Admin ทันที)
  const handleCheckout = async () => {
    // 1. ตรวจสอบว่าล็อกอินหรือยัง
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า");
      onClose();
      router.push("/login");
      return;
    }

    // 2. ตรวจสอบว่ามีสินค้าในตะกร้าหรือไม่
    if (cart.length === 0) {
      alert("ไม่มีสินค้าในตะกร้า");
      return;
    }

    // 🌟 3. ตรวจสอบว่าระบุที่อยู่จัดส่งหรือยัง
    if (!address.trim()) {
      alert("กรุณาระบุที่อยู่สำหรับจัดส่งสินค้า");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      onClose();
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🌟 4. แนบ address เข้ากับ orderPayload
      const orderPayload = {
        userId: user.userId,
        address: address.trim(),
        items: cart.map((item) => ({
          productId: item.product.productId,
          quantity: item.quantity,
        })),
      };

      // 5. ยิง API บันทึกคำสั่งซื้อและตัดสต็อก
      const res = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const orderData = await res.json();
        alert(
          `🎉 สั่งซื้อสินค้าสำเร็จ!\nหมายเลขคำสั่งซื้อ: #${orderData.orderId}\nยอดชำระ: ฿${orderData.totalAmount?.toLocaleString()}\nจัดส่งไปที่: ${address.trim()}`,
        );

        // เคลียร์ตะกร้าสินค้า และล้างช่องที่อยู่
        setCart([]);
        setAddress("");
        onClose();

        // หากผู้ใช้ปัจจุบันเป็น ADMIN สามารถพาไปดูที่หน้ารายการสั่งซื้อได้เลย
        if (user.role === "ADMIN") {
          router.push("/admin/orders");
        } else {
          // รีเฟรชหน้าเพื่อให้สต็อกสินค้าบนหน้าร้านอัปเดตตามจริง
          window.location.reload();
        }
      } else {
        const errorMsg = await res.text();
        alert(errorMsg || "ไม่สามารถทำการสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* พื้นหลังสีดำโปร่งใส (กดปิดได้) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* หน้าต่าง Drawer ตะกร้าสินค้า */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        {/* ส่วนหัว Drawer */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-light tracking-widest uppercase text-gray-900">
              Shopping Cart
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {cart.length} {cart.length === 1 ? "item" : "items"} in cart
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl font-light leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* รายการสินค้าในตะกร้า */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.product.productId}
                className="flex items-center gap-4 pb-4 border-b border-gray-100"
              >
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.productName}
                    className="w-16 h-16 object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                    NO IMG
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.product.productName}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    ฿{item.product.productPrice.toLocaleString()}
                  </p>

                  {/* ปุ่มเพิ่ม / ลดจำนวน */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleDecrease(item.product.productId)}
                      className="w-6 h-6 border border-gray-200 flex items-center justify-center text-xs hover:border-black transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleIncrease(
                          item.product.productId,
                          item.product.stock,
                        )
                      }
                      className="w-6 h-6 border border-gray-200 flex items-center justify-center text-xs hover:border-black transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    ฿
                    {(
                      item.product.productPrice * item.quantity
                    ).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(item.product.productId)}
                    className="text-[11px] text-gray-400 hover:text-red-500 uppercase tracking-wider mt-2 transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-12 h-12 mb-3 stroke-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="text-xs uppercase tracking-widest font-light">
                Your cart is empty
              </p>
            </div>
          )}
        </div>

        {/* ส่วนสรุปราคาและปุ่มยืนยันสั่งซื้อ */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
            {/* 🌟 กล่องกรอกที่อยู่สำหรับจัดส่ง */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5 font-medium">
                Shipping Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="ระบุชื่อผู้รับ, เบอร์โทรศัพท์ และที่อยู่สำหรับจัดส่ง..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xs focus:outline-none focus:border-black transition resize-none placeholder:text-gray-300"
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-gray-500 uppercase tracking-wider text-xs">
                Total Amount
              </span>
              <span className="text-xl font-medium text-gray-900 font-mono">
                ฿
                {totalPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition disabled:bg-gray-400 cursor-pointer"
            >
              {isSubmitting ? "Processing Order..." : "Checkout & Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
