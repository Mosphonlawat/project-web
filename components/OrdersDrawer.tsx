"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
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
  address?: string;
  orderDetails: OrderDetail[];
}

interface OrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function OrdersDrawer({
  isOpen,
  onClose,
  user,
}: OrdersDrawerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.userId) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/orders/user/${user.userId}`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setOrders(data.sort((a: Order, b: Order) => b.orderId - a.orderId));
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 ฟังก์ชันแปลงสถานะเป็นภาษาไทย
  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "ชำระเงินแล้ว":
        return "ชำระเงินแล้ว";
      case "SHIPPED":
      case "จัดส่งสินค้าแล้ว":
      case "จัดส่งแล้ว":
        return "จัดส่งสินค้าแล้ว";
      case "CANCELLED":
      case "ยกเลิกคำสั่งซื้อ":
      case "ยกเลิก":
        return "ยกเลิกคำสั่งซื้อ";
      default:
        return "รอดำเนินการ"; // PENDING
    }
  };

  // กำหนดสี Badge ตามสถานะ
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "ชำระเงินแล้ว":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SHIPPED":
      case "จัดส่งสินค้าแล้ว":
      case "จัดส่งแล้ว":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
      case "ยกเลิกคำสั่งซื้อ":
      case "ยกเลิก":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200"; // PENDING
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* พื้นหลังมืดโปร่งแสง */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* หน้าต่าง Drawer ฝั่งขวา */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 text-gray-900 border-l border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-light tracking-widest uppercase text-gray-900">
              My Orders
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-light">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl font-light leading-none transition cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* รายการคำสั่งซื้อ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
          {isLoading ? (
            <div className="py-24 text-center text-xs tracking-widest text-gray-400">
              กำลังโหลดรายการคำสั่งซื้อ...
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border border-gray-200 p-5 shadow-xs space-y-3 transition hover:border-black"
              >
                {/* แถวบน: หมายเลขคำสั่งซื้อ และ ป้ายสถานะภาษาไทย */}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-medium text-gray-900 tracking-wider">
                    #ORD{String(order.orderId).padStart(5, "0")}
                  </span>
                  {/* 🌟 แสดงข้อความสถานะเป็นภาษาไทย */}
                  <span
                    className={`text-[10px] tracking-wider px-2.5 py-0.5 border font-medium ${getStatusBadge(
                      order.status,
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* รายการสินค้าในบิล */}
                <div className="py-2 border-y border-gray-50 text-xs text-gray-600 space-y-1.5 font-light">
                  {order.orderDetails?.map((item) => (
                    <div
                      key={item.orderDetailId}
                      className="flex justify-between items-center"
                    >
                      <span className="truncate pr-2">
                        {item.product?.productName}
                      </span>
                      <span className="font-mono text-gray-400 whitespace-nowrap">
                        &times; {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ที่อยู่สำหรับจัดส่ง */}
                {order.address && (
                  <div className="text-[11px] text-gray-600 bg-gray-50 p-2.5 border border-gray-100 rounded-xs font-light leading-relaxed">
                    <span className="font-medium text-gray-800 block text-[10px] tracking-wider mb-0.5">
                      📍 ที่อยู่สำหรับจัดส่ง:
                    </span>
                    {order.address}
                  </div>
                )}

                {/* วันที่ และ ยอดรวมเงิน */}
                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-gray-400 font-mono text-[11px]">
                    {new Date(order.orderDate).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="font-mono font-semibold text-gray-900 text-sm">
                    ฿
                    {Number(order.totalAmount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-20">
              <p className="text-xs tracking-widest font-light mb-6 text-gray-500">
                ยังไม่มีรายการคำสั่งซื้อ
              </p>
              <button
                onClick={() => {
                  onClose();
                  router.push("/products");
                }}
                className="border border-black text-black px-6 py-2.5 text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition cursor-pointer"
              >
                เลือกซื้อสินค้า
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
