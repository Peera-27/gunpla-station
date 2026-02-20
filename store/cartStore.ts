import { create } from 'zustand'

// โครงสร้างของสินค้าในตะกร้า
export interface CartItem {
  id: number
  name: string
  price: number
  image_url: string
  quantity: number
}

interface CartStore {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  // ฟังก์ชันเพิ่มลงตะกร้า
 addToCart: (item) => set((state) => {
    const existingItem = state.cart.find((i) => i.id === item.id)
    if (existingItem) {
      // 🌟 เปลี่ยนจาก + 1 เป็น + item.quantity (บวกตามจำนวนที่ส่งมา)
      return { cart: state.cart.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) }
    }
    // ถ้ายังไม่มีในตะกร้า ก็ยัด item ลงไปเลย (เพราะใน item มี quantity มาให้แล้ว)
    return { cart: [...state.cart, item] }
  }),
  // ฟังก์ชันลบออกจากตะกร้า
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
  // ฟังก์ชันล้างตะกร้า (ใช้ตอนจ่ายเงินเสร็จ)
  clearCart: () => set({ cart: [] })
}))