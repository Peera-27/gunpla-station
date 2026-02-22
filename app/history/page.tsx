/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Package, Clock, CheckCircle, ArrowLeft, XCircle } from "lucide-react";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      // 1. เช็คว่าใครล็อกอินอยู่
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const email = session.user.email || null;
      setUserEmail(email);

      // 2. ดึงออเดอร์เฉพาะของอีเมลนี้ เรียงจากใหม่ไปเก่า
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", email)
        .order("created_at", { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // ฟังก์ชันแปลงรูปแบบวันที่ให้ดูง่ายขึ้น
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ฟังก์ชันเลือกป้ายสถานะ (Badge) ให้เข้ากับ status และรองรับ Dark Mode
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-bold transition-colors">
            <Clock className="w-4 h-4" /> รอตรวจสอบสลิป
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold transition-colors">
            <CheckCircle className="w-4 h-4" /> ชำระเงินแล้ว (เตรียมจัดส่ง)
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold transition-colors">
            <XCircle className="w-4 h-4" /> สลิปไม่ถูกต้อง (ยกเลิก)
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold transition-colors">
            {status}
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 transition-colors">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    // 🌟 เติม dark:bg-gray-900 ที่พื้นหลังหลัก
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ประวัติคำสั่งซื้อของคุณ
          </h1>
        </div>

        {!userEmail ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-4">
              กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อ
            </h2>
            <Link
              href="/login"
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-full font-bold inline-block hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <Package className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">
              ยังไม่มีประวัติการสั่งซื้อ
            </h2>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              เริ่มช้อปปิ้งกันพลาตัวแรกของคุณได้เลย!
            </p>
            <Link
              href="/"
              className="bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-block"
            >
              ไปเลือกร้านค้า
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all"
              >
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    รหัสคำสั่งซื้อ:{" "}
                    <span className="font-mono text-gray-900 dark:text-gray-200">
                      #{order.id}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    สั่งเมื่อ: {formatDate(order.created_at)}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ยอดรวม:{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      ฿{order.total_amount?.toLocaleString() || 0}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                  {getStatusBadge(order.status)}

                  {/* ปุ่มกดดูสลิปที่แนบไป */}
                  {order.slip_url && (
                    <a
                      href={order.slip_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
                    >
                      ดูหลักฐานการโอนเงิน
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
