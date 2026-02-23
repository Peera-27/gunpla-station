/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  ArrowLeft,
  XCircle,
  User,
  MapPin,
  Phone,
  Edit,
} from "lucide-react";

import Swal from "sweetalert2";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 🌟 State สำหรับเก็บข้อมูลผู้ใช้
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      setUserData(session.user);
      const email = session.user.email || null;
      setUserEmail(email);

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

  // 🌟 ฟังก์ชันเปิดฟอร์มแก้ไขข้อมูลส่วนตัว (ชื่อ, เบอร์โทร, ที่อยู่)
  const handleEditProfile = () => {
    // ดึงข้อมูลเดิมมาเป็นค่าเริ่มต้นในช่องกรอก
    const currentName =
      userData?.user_metadata?.custom_name ||
      userData?.user_metadata?.full_name ||
      userData?.user_metadata?.name ||
      userEmail?.split("@")[0] ||
      "";
    const currentPhone = userData?.user_metadata?.phone || "";
    const currentAddress = userData?.user_metadata?.address || "";

    Swal.fire({
      title: "แก้ไขข้อมูลส่วนตัว",
      html: `
        <div class="flex flex-col gap-4 text-left mt-4">
          <div>
            <label class="text-sm font-bold text-gray-700">ชื่อ-นามสกุล</label>
            <input id="swal-name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-1" value="${currentName}" placeholder="ชื่อของคุณ">
          </div>
          <div>
            <label class="text-sm font-bold text-gray-700">เบอร์โทรศัพท์</label>
            <input id="swal-phone" type="tel" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-1" value="${currentPhone}" placeholder="08X-XXX-XXXX">
          </div>
          <div>
            <label class="text-sm font-bold text-gray-700">ที่อยู่จัดส่ง</label>
            <textarea id="swal-address" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-1 resize-none" placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์">${currentAddress}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึกข้อมูล",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const name = (document.getElementById("swal-name") as HTMLInputElement)
          .value;
        const phone = (
          document.getElementById("swal-phone") as HTMLInputElement
        ).value;
        const address = (
          document.getElementById("swal-address") as HTMLTextAreaElement
        ).value;

        if (!name || !phone || !address) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วนครับ");
          return false;
        }
        return { name, phone, address };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { name, phone, address } = result.value;

        // 1. อัปเดตข้อมูลลงใน user_metadata ของ Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            custom_name: name,
            phone: phone,
            address: address,
          },
        });

        // 2. อัปเดตข้อมูลลงในตาราง users ของเราด้วย (เพื่อให้ข้อมูลซิงค์กัน)
        if (userData?.id) {
          await supabase
            .from("users")
            .update({ full_name: name, phone: phone, address: address })
            .eq("id", userData.id);
        }

        if (!authError) {
          // อัปเดตหน้าจอทันที
          setUserData((prev: any) => ({
            ...prev,
            user_metadata: {
              ...prev.user_metadata,
              custom_name: name,
              phone: phone,
              address: address,
            },
          }));

          Swal.fire({
            icon: "success",
            title: "อัปเดตข้อมูลสำเร็จ!",
            text: "ข้อมูลส่วนตัวของคุณถูกบันทึกเรียบร้อยแล้ว",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: authError.message,
          });
        }
      }
    });
  };

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
            บัญชีของฉัน
          </h1>
        </div>

        {!userEmail ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-4">
              กรุณาเข้าสู่ระบบเพื่อดูข้อมูลส่วนตัว
            </h2>
            <Link
              href="/login"
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-full font-bold inline-block hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <>
            {/* 🌟 ส่วนที่ 1: การ์ดโปรไฟล์ผู้ใช้งาน (อัปเดตใหม่) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center gap-8 transition-colors relative">
              {/* ปุ่มแก้ไขโปรไฟล์ มุมขวาบน */}
              <button
                onClick={handleEditProfile}
                className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-sm font-bold"
              >
                <Edit className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">แก้ไขข้อมูล</span>
              </button>

              {/* รูป Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-50 dark:border-blue-900/50 overflow-hidden shrink-0 shadow-sm relative mx-auto sm:mx-0">
                {userData?.user_metadata?.avatar_url ||
                userData?.user_metadata?.picture ? (
                  <img
                    src={
                      userData.user_metadata.avatar_url ||
                      userData.user_metadata.picture
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* ข้อมูลชื่อ เบอร์ และอีเมล */}
              <div className="text-center sm:text-left w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {userData?.user_metadata?.custom_name ||
                    userData?.user_metadata?.full_name ||
                    userData?.user_metadata?.name ||
                    userEmail?.split("@")[0]}
                </h2>

                <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>อีเมล: {userEmail}</span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>
                      เบอร์โทร:{" "}
                      {userData?.user_metadata?.phone || (
                        <span className="text-red-400 italic">
                          ยังไม่ได้ระบุเบอร์โทรศัพท์
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-start justify-center sm:justify-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-left">
                      ที่อยู่:{" "}
                      {userData?.user_metadata?.address || (
                        <span className="text-red-400 italic">
                          ยังไม่ได้ระบุที่อยู่จัดส่ง
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 ส่วนที่ 2: ประวัติคำสั่งซื้อ */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ประวัติคำสั่งซื้อล่าสุด
            </h2>

            {orders.length === 0 ? (
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
          </>
        )}
      </main>
    </div>
  );
}
