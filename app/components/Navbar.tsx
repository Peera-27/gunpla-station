/* eslint-disable react-hooks/set-state-in-effect */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Menu,
  User,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/cartStore"; // 👈 นำเข้าด้านบนสุด
export default function Navbar() {
  // --- เพิ่ม State สำหรับระบบ Login & Role ---
  const [user, setUser] = useState<any>(null); // เก็บข้อมูลคนล็อกอิน
  const [isAdmin, setIsAdmin] = useState(false); // เช็คว่าเป็น Admin ไหม
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // 1. เช็คสถานะการล็อกอิน
  useEffect(() => {
    // ดึงข้อมูล User ปัจจุบัน
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // กำหนดอีเมลที่เป็น Admin (เปลี่ยนเป็นอีเมลของคุณได้เลย)
        if (
          session.user.email === "admin@gmail.com" ||
          session.user.email === "crbrsonline@gmail.com"
        ) {
          setIsAdmin(true);
        }
      }
    };
    checkUser();

    // ให้ระบบดักฟัง (Listen) ว่ามีการ Login/Logout เกิดขึ้นไหม
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
          setIsAdmin(
            session.user.email === "admin@gmail.com" ||
              session.user.email === "crbrsonline@gmail.com",
          );
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // รีเฟรชหน้าเว็บ 1 รอบ
  };
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="  flex items-center">
            <Link href="/" className="">
              <span className="text-red-600 text-4xl font-bold tracking-wider">
                G
              </span>

              <span className="text-blue-600 text-2xl font-bold tracking-wider">
                UNPLA STATION
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Home
            </Link>

            <Link
              href="/promotions"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Promotions
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              About Us
            </Link>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 1. ปุ่มค้นหา */}
            <button className="text-gray-600 hover:text-blue-600 transition">
              <Search className="h-6 w-6" />
            </button>

            {/* 2. --- ระบบแสดงผลตาม Role (User / Admin / Guest) --- */}
            <div className="flex items-center gap-4 text-gray-600">
              {user ? (
                // กรณี: ล็อกอินแล้ว
                <div className="flex items-center gap-4">
                  {/* ปุ่มเฉพาะ Admin เท่านั้น */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
                    >
                      <ShieldAlert className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}

                  {/* โชว์ชื่ออีเมลแบบย่อ */}
                  <Link
                    href="/history"
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    {user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture ? (
                      <img
                        src={
                          user.user_metadata.avatar_url ||
                          user.user_metadata.picture
                        }
                        alt="User Profile"
                        className="w-9 h-9 rounded-full border-2 border-blue-200 object-cover shadow-sm"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hidden sm:block">
                        {user.email?.split("@")[0]}
                      </span>
                    )}
                  </Link>
                  {/* ปุ่ม Logout */}
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-500 transition-colors flex items-center gap-1"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                // กรณี: ยังไม่ได้ล็อกอิน (Guest)
                <Link
                  href="/login"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <User className="h-6 w-6" />
                </Link>
              )}
            </div>
            {/* ----------------------------------------------- */}

            {/* 3. ตะกร้าสินค้า (แยกออกมาอันเดียวชัดๆ) */}
            <Link href="/cart">
              <button className="text-gray-600 hover:text-blue-600 transition relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {mounted ? totalItems : 0}
                </span>
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
              <Menu className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
