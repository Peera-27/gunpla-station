/* eslint-disable @next/next/no-img-element */
export default function AboutPage() {
  return (
    <main className="transition-colors duration-300">
      {/* HERO */}
      <section className="py-24 text-center bg-white dark:bg-[#0f172a]">
        <h1 className="text-5xl font-bold tracking-wide">
          <span className="text-red-500">G</span>
          <span className="text-blue-500">UNPLA STATION</span>
        </h1>

        <p className="mt-6 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          ศูนย์รวมกันพลาแท้ 100% พร้อมบริการมืออาชีพ
        </p>
      </section>

      {/* ABOUT INTRO */}
      <section className="bg-gray-50 dark:bg-[#111827] py-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
              Who We Are
            </h2>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Gunpla Station คือร้านจำหน่ายกันพลาและอุปกรณ์ต่อโมเดลครบวงจร
              เราคัดสรรสินค้าของแท้ 100% พร้อมแพ็คอย่างปลอดภัย
              และจัดส่งทั่วประเทศ
            </p>
          </div>

          <div className="bg-white dark:bg-[#1f2937] p-10 rounded-2xl shadow-sm hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Our Vision
            </h3>

            <p className="text-gray-600 dark:text-gray-400">
              เรามุ่งมั่นเป็นศูนย์กลางของนักสะสมกันพลาในประเทศไทย
              พร้อมบริการที่เชื่อถือได้และทันสมัย
            </p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white dark:bg-[#0f172a] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800 dark:text-white">
            Why Choose Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-[#1f2937] p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">
                ของแท้ 100%
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                จำหน่ายเฉพาะสินค้าลิขสิทธิ์แท้จากผู้ผลิตโดยตรง
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#1f2937] p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">
                แพ็คอย่างปลอดภัย
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                ป้องกันกล่องบุบเสียหายระหว่างจัดส่ง
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#1f2937] p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">
                จัดส่งทั่วประเทศ
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                รวดเร็ว ตรวจสอบสถานะได้
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-24 bg-gray-50 dark:bg-[#111827] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-16 text-gray-800 dark:text-white">
            Member
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Person 1 */}
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
              <img
                src="/team/profiletiw.jpg"
                alt="person1"
                className="w-32 h-32 mx-auto rounded-full object-cover mb-6 border-4 border-blue-500"
              />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Tiw 56
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                รหัสนักศึกษา: 66162110128-7
              </p>
            </div>

            {/* Person 2 */}
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
              <img
                src="/team/profile.jpg"
                alt="person2"
                className="w-32 h-32 mx-auto rounded-full object-cover mb-6 border-4 border-blue-500"
              />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                นศ. P
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                รหัสนักศึกษา: 66162110163-8
              </p>
            </div>

            {/* Person 3 */}
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
              <img
                src="/team/m.jpg"
                alt="person3"
                className="w-32 h-32 mx-auto rounded-full object-cover mb-6 border-4 border-blue-500"
              />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                หลวง M วัดซับแมน
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                รหัสนักศึกษา: 66162110045-4
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
