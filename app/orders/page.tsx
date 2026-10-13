"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl?: string;
}

interface OrderDetail {
  orderDetailId: number;
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  address?: string; // 🌟 ฟิลด์ที่อยู่จัดส่ง
  orderDetails: OrderDetail[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      alert("กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อ");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    fetchUserOrders(parsedUser.userId, token);
  }, [router]);

  // ดึงรายการคำสั่งซื้อเฉพาะของลูกค้ารายนี้
  const fetchUserOrders = async (userId: number, token: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/orders/user/${userId}`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        // เรียงคำสั่งซื้อล่าสุดขึ้นก่อน
        setOrders(data.sort((a: Order, b: Order) => b.orderId - a.orderId));
      } else if (res.status === 403 || res.status === 401) {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        router.push("/login");
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // แถบสถานะความคืบหน้า (Status Stepper) - รองรับทั้งอังกฤษและไทย
  const renderStatusTracker = (status: string) => {
    const upperStatus = (status || "").toUpperCase();

    // ดักจับสถานะยกเลิก
    if (
      upperStatus === "CANCELLED" ||
      status === "ยกเลิกคำสั่งซื้อ" ||
      status === "ยกเลิก"
    ) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded text-xs tracking-wider font-medium inline-block">
          ❌ คำสั่งซื้อนี้ถูกยกเลิกแล้ว
        </div>
      );
    }

    const steps = [
      { label: "รอดำเนินการ", key: "PENDING" },
      { label: "ชำระเงินแล้ว", key: "PAID" },
      { label: "จัดส่งสินค้าแล้ว", key: "SHIPPED" },
    ];

    // ตรวจสอบลำดับขั้นตอนสถานะ
    const getStepIndex = (st: string) => {
      const s = (st || "").toUpperCase();
      if (s === "SHIPPED" || s === "จัดส่งสินค้าแล้ว" || s === "จัดส่งแล้ว")
        return 2;
      if (s === "PAID" || s === "ชำระเงินแล้ว") return 1;
      return 0; // PENDING หรือ รอดำเนินการ
    };

    const currentStepIndex = getStepIndex(status);

    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-between relative">
          {/* เส้นขีดเชื่อมแต่ละขั้นตอน */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-[2px] bg-black -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width:
                currentStepIndex === 0
                  ? "0%"
                  : currentStepIndex === 1
                    ? "50%"
                    : "100%",
            }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                    isCompleted
                      ? "bg-black text-white"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-2 tracking-wider font-medium ${
                    isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 tracking-widest text-sm">
        กำลังโหลดรายการคำสั่งซื้อ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-4 md:px-12 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-light tracking-wider text-gray-900 mb-2">
            คำสั่งซื้อของฉัน
          </h1>
          <p className="text-gray-500 font-light text-sm">
            ติดตามสถานะและตรวจสอบประวัติการสั่งซื้อสินค้าของคุณ
          </p>
          <div className="w-10 h-[1px] bg-black mx-auto mt-4" />
        </div>

        {orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm transition hover:shadow-md"
              >
                {/* แถบหัวการ์ดคำสั่งซื้อ */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                  <div>
                    <span className="text-xs tracking-wider text-gray-400 block mb-1">
                      หมายเลขคำสั่งซื้อ
                    </span>
                    <h3 className="text-lg font-mono font-medium text-gray-900">
                      #{order.orderId}
                    </h3>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-xs tracking-wider text-gray-400 block mb-1">
                      วันที่สั่งซื้อ
                    </span>
                    <p className="text-sm text-gray-600 font-mono">
                      {new Date(order.orderDate).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                {/* แถบ Tracking สถานะคำสั่งซื้อ */}
                <div className="my-6 px-2 md:px-6">
                  {renderStatusTracker(order.status)}
                </div>

                {/* กล่องแสดงที่อยู่จัดส่งสินค้า */}
                {order.address && (
                  <div className="my-4 p-4 bg-gray-50 border border-gray-100 rounded-xs text-xs font-light text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900 tracking-wider text-[11px] block mb-1">
                      📌 ที่อยู่สำหรับจัดส่งสินค้า:
                    </span>
                    {order.address}
                  </div>
                )}

                {/* รายการสินค้าที่สั่งซื้อ */}
                <div className="divide-y divide-gray-100 my-6">
                  {order.orderDetails?.map((item) => (
                    <div
                      key={item.orderDetailId}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.productName}
                            className="w-14 h-14 object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.product?.productName}
                          </h4>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            ฿{item.priceAtPurchase?.toLocaleString()} &times;{" "}
                            {item.quantity} ชิ้น
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-sm font-medium text-gray-900">
                        ฿
                        {(item.priceAtPurchase * item.quantity).toLocaleString(
                          undefined,
                          { minimumFractionDigits: 2 },
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* สรุปยอดเงินรวม */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs tracking-wider text-gray-500">
                    ยอดรวมสุทธิ
                  </span>
                  <span className="text-2xl font-mono font-medium text-gray-900">
                    ฿
                    {Number(order.totalAmount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 p-16 text-center shadow-sm">
            <p className="text-gray-400 tracking-wider text-sm mb-6 font-light">
              คุณยังไม่มีรายการสั่งซื้อสินค้า
            </p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-8 py-3 text-xs tracking-widest hover:bg-neutral-800 transition"
            >
              เลือกซื้อสินค้า
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
