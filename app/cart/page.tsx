/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import {
  Trash2,
  ArrowLeft,
  CreditCard,
  QrCode,
  CheckCircle,
  Upload,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);

  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // --- State ใหม่สำหรับอัปโหลดสลิป ---
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("guest@example.com");

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ดึงอีเมลผู้ใช้ที่ล็อกอินอยู่
  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setUserEmail(session.user.email || "guest@example.com");
    };
    getUser();
  }, []);

  // --- ฟังก์ชันอัปโหลดสลิปและสร้างออเดอร์ ---
  const handlePaymentSubmit = async () => {
    if (!slipFile) {
      alert("กรุณาแนบรูปสลิปโอนเงินก่อนครับ!");
      return;
    }

    setIsUploading(true);

    try {
      // 1. อัปโหลดรูปสลิปขึ้น Supabase Storage (ชื่อไฟล์ไม่ให้ซ้ำด้วย Date.now)
      const fileName = `slip-${Date.now()}-${slipFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("slips") // ชื่อ Bucket ที่เราสร้าง
        .upload(fileName, slipFile);

      if (uploadError) throw uploadError;

      // 2. ดึง URL ของรูปที่เพิ่งอัปโหลด
      const { data: publicUrlData } = supabase.storage
        .from("slips")
        .getPublicUrl(fileName);

      const slipUrl = publicUrlData.publicUrl;

      // 3. บันทึกข้อมูลลงตาราง orders
      const { error: insertError } = await supabase.from("orders").insert([
        {
          customer_email: userEmail,
          total_amount: totalPrice,
          slip_url: slipUrl,
          status: "pending", // รอแอดมินตรวจสอบ
          items: cart,
        },
      ]);

      if (insertError) throw insertError;
      for (const item of cart) {
        // ดึงสต็อกปัจจุบันของสินค้านั้นๆ ออกมาก่อน
        const { data: productData } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (productData) {
          // คำนวณสต็อกใหม่ (สต็อกเดิม - จำนวนที่ซื้อ)
          const newStock = productData.stock - item.quantity;

          // อัปเดตกลับไปที่ฐานข้อมูล
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
        }
      }
      // 4. แสดงหน้าจอสำเร็จ
      setPaymentSuccess(true);
      setTimeout(() => {
        clearCart();
        router.push("/");
      }, 3000);
    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการอัปโหลด: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* ... (ส่วนหัวและรายการสินค้าในตะกร้า เหมือนเดิม) ... */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            ตะกร้าสินค้าของคุณ
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-500 mb-6">
              ยังไม่มีสินค้าในตะกร้า
            </h2>
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors"
            >
              ไปเลือกซื้อสินค้ากันเลย
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ฝั่งซ้าย: รายการสินค้า */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 font-bold mt-1">
                      ฿{item.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      จำนวน: {item.quantity} ชิ้น
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>

            {/* ฝั่งขวา: สรุปยอดและปุ่มจ่ายเงิน */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="space-y-4 mb-6 border-b pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  <span className="text-green-600 font-bold">ฟรี</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-black text-gray-900 mb-8">
                <span>ยอดสุทธิ</span>
                <span className="text-red-600">
                  ฿{totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setShowQR(true)}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
              >
                <CreditCard className="w-6 h-6" /> ยืนยันคำสั่งซื้อ
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- Modal: QR Code และ อัปโหลดสลิป --- */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl overflow-y-auto max-h-[90vh]">
            {!paymentSuccess ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">แสกนเพื่อชำระเงิน</h3>
                  <button
                    onClick={() => setShowQR(false)}
                    className="text-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                {/* รูป QR Code จำลอง */}
                <div className="bg-gray-100 p-4 rounded-2xl mb-4 inline-block">
                  <QrCode className="w-40 h-40 text-gray-800" />
                </div>

                <p className="text-gray-600 mb-1">ยอดที่ต้องชำระ</p>
                <p className="text-3xl font-black text-red-600 mb-6">
                  ฿{totalPrice.toLocaleString()}
                </p>

                {/* --- ส่วนอัปโหลดสลิป --- */}
                <div className="border-t pt-6 mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3 text-left">
                    แนบหลักฐานการโอนเงิน (สลิป)
                  </p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {slipFile ? (
                          <span className="text-blue-600 font-bold">
                            {slipFile.name}
                          </span>
                        ) : (
                          "คลิกเพื่อเลือกไฟล์รูปภาพ"
                        )}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setSlipFile(e.target.files ? e.target.files[0] : null)
                      }
                    />
                  </label>
                </div>

                {/* ปุ่มส่งข้อมูล */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isUploading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2"
                >
                  {isUploading ? "กำลังอัปโหลดข้อมูล..." : "แจ้งชำระเงิน"}
                </button>
              </>
            ) : (
              <div className="py-8">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-bounce" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ส่งสลิปสำเร็จ!
                </h3>
                <p className="text-gray-500">ระบบกำลังรอแอดมินตรวจสอบยอดเงิน</p>
                <p className="text-sm text-gray-400 mt-4">
                  กำลังพากลับไปหน้าหลัก...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
