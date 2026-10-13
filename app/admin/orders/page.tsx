"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

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

interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  address?: string;
  user: User;
  orderDetails: OrderDetail[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.trim().toUpperCase() !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/orders", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.sort((a: Order, b: Order) => b.orderId - a.orderId));
      } else if (response.status === 403) {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8080/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.orderId === orderId ? { ...ord, status: newStatus } : ord,
          ),
        );
      } else {
        const errorMsg = await res.text();
        alert(errorMsg || "ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อได้");
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setUpdatingId(null);
    }
  };

  // 🌟 กำหนดสี Dropdown ตามสถานะ
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

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center tracking-widest text-gray-500">
        กำลังโหลดรายการคำสั่งซื้อ...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-8 pb-12 flex flex-col md:flex-row gap-8">
      <Sidebar />

      <main className="flex-1 bg-white border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-light tracking-widest text-gray-900 mb-2 uppercase">
              Orders
            </h1>
            <p className="text-gray-500 font-light">
              จัดการและติดตามรายการคำสั่งซื้อของลูกค้า
            </p>
          </div>
          <span className="text-xs tracking-wider font-mono text-gray-400">
            ทั้งหมด: {orders.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Order ID
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Date
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Customer & Address
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Total
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Status
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4 font-mono text-sm text-gray-900 font-medium">
                      #{order.orderId}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800 max-w-xs">
                      <div className="font-medium">
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {order.user?.email}
                      </div>
                      <div className="text-[11px] text-gray-700 mt-1 bg-gray-50 p-2 border border-gray-200 rounded-xs leading-relaxed">
                        📌{" "}
                        {order.address || (
                          <span className="text-gray-400 italic">
                            ไม่มีข้อมูลที่อยู่
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900 font-mono">
                      ฿
                      {Number(order.totalAmount || 0).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {/* 🌟 Dropdown สถานะภาษาไทย */}
                      <select
                        value={order.status}
                        disabled={updatingId === order.orderId}
                        onChange={(e) =>
                          handleStatusChange(order.orderId, e.target.value)
                        }
                        className={`text-xs py-1.5 px-3 border tracking-wider transition cursor-pointer focus:outline-none font-medium ${getStatusBadge(
                          order.status,
                        )}`}
                      >
                        <option value="PENDING">รอดำเนินการ</option>
                        <option value="PAID">ชำระเงินแล้ว</option>
                        <option value="SHIPPED">จัดส่งสินค้าแล้ว</option>
                        <option value="CANCELLED">ยกเลิกคำสั่งซื้อ</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs uppercase tracking-wider text-black border border-black px-3 py-1.5 hover:bg-black hover:text-white transition cursor-pointer"
                      >
                        View Items ({order.orderDetails?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400 font-light tracking-widest"
                  >
                    ไม่พบรายการคำสั่งซื้อ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal ป๊อปอัปแสดงรายละเอียดสินค้า + ที่อยู่จัดส่ง */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 md:p-8 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-light uppercase tracking-wider">
                  Order Details #{selectedOrder.orderId}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Customer: {selectedOrder.user?.firstName}{" "}
                  {selectedOrder.user?.lastName} ({selectedOrder.user?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-black text-2xl font-light leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* กล่องแสดงที่อยู่จัดส่งใน Modal */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-xs">
              <span className="font-semibold text-gray-700 block uppercase tracking-wider text-[10px] mb-1">
                📍 ที่อยู่สำหรับจัดส่ง:
              </span>
              <p className="text-gray-800 leading-relaxed font-light">
                {selectedOrder.address || (
                  <span className="text-gray-400 italic">
                    ไม่มีข้อมูลที่อยู่จัดส่ง
                  </span>
                )}
              </p>
            </div>

            {/* รายการสินค้า */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {selectedOrder.orderDetails?.map((item) => (
                <div
                  key={item.orderDetailId}
                  className="flex items-center justify-between pb-3 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.productName}
                        className="w-12 h-12 object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                        NO IMG
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product?.productName}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        ฿{item.priceAtPurchase.toLocaleString()} &times;{" "}
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    ฿
                    {(item.priceAtPurchase * item.quantity).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-gray-400">
                Total Amount
              </span>
              <span className="text-xl font-medium text-gray-900 font-mono">
                ฿
                {Number(selectedOrder.totalAmount || 0).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 },
                )}
              </span>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-black text-white py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
