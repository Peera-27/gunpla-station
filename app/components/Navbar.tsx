/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
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
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/cartStore";
import { useSearchStore } from "@/store/searchStore";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme(); // 🌟 เพิ่ม resolvedTheme เข้ามา
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (pathname !== "/") {
        router.push("/");
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        if (
          session.user.email === "admin@gmail.com" ||
          session.user.email === "crbrsonline@gmail.com"
        ) {
          setIsAdmin(true);
        }
      }
    };
    checkUser();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    // 🌟 เติม dark:bg-gray-900 และ dark:border-gray-800
    <nav className="bg-white dark:bg-gray-900 border-b border-transparent dark:border-gray-800 shadow-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-red-600 text-4xl font-bold tracking-wider">
                G
              </span>
              {/* 🌟 เติม dark:text-blue-400 */}
              <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold tracking-wider">
                UNPLA STATION
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
            >
              Home
            </Link>
            <Link
              href="/promotions"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
            >
              Promotions
            </Link>
            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
            >
              About Us
            </Link>
          </div>

          {/* ฝั่งขวา (รวม Icons, Theme Toggle และ Mobile Menu) */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* กล่อง Icons สำหรับ Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {/* 1. ช่องค้นหา */}
              <div className="relative w-48 lg:w-64">
                <input
                  type="text"
                  placeholder="ค้นหากันพลา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  // 🌟 เติมสีกล่องค้นหาโหมดมืด
                  className="w-full pl-4 pr-10 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white transition-all"
                />
                <Search className="absolute right-3 top-2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              </div>

              {/* 2. ระบบ Role */}
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                {user ? (
                  <div className="flex items-center gap-4">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="hidden sm:flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin
                      </Link>
                    )}
                    <Link
                      href="/history"
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {user.user_metadata?.avatar_url ||
                      user.user_metadata?.picture ? (
                        <img
                          src={
                            user.user_metadata.avatar_url ||
                            user.user_metadata.picture
                          }
                          alt="User Profile"
                          className="w-9 h-9 rounded-full border-2 border-blue-200 dark:border-blue-900 object-cover shadow-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800 hidden sm:block">
                          {user.email?.split("@")[0]}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                      title="ออกจากระบบ"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <User className="h-6 w-6" />
                  </Link>
                )}
              </div>

              {/* 3. ตะกร้าสินค้า */}
              <Link href="/cart">
                <button className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition relative mt-1">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    {mounted ? totalItems : 0}
                  </span>
                </button>
              </Link>
            </div>

            {/* 🌟 ปุ่มสลับ Theme (โชว์ทั้งมือถือและ Desktop) */}
            {mounted && (
              <button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none">
                <Menu className="h-7 w-7 " />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
