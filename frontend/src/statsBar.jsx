import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FaBriefcase, FaHandsHelping, FaListUl } from "react-icons/fa";

export default function StatsBar({ jobCount, volunteerCount, jobTypeCount , volunTypeCount }) {
  const stats = [
    { label: "งาน", value: jobCount },
    { label: "กิจกรรมจิตอาสา", value: volunteerCount },
    { label: "ประเภทงาน", value: jobTypeCount },
    { label: "ประเภทกิจกรรม", value: volunTypeCount },
  ];

  return (
    <div className="relative w-full flex justify-center">
      <motion.div
        className="h-30 w-90 md:h-23 lg:h-35 xl:h-45 md:w-full flex items-center justify-center bg-[#8E80FF] text-white rounded-bl-full rounded-tl-full py-6 md:py-8 lg:py-10 px-10 md:px-16 xl:px-20 shadow-lg overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* แถบคำว่า “จำนวน” มุมเฉียง */}
        <motion.div
          className="absolute bottom-5 right-5 text-white/70 font-bold"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-lg md:text-xl lg:text-2xl">จำนวน</span>
        </motion.div>

        {/* ตัวเลขหลัก */}
        <div className="flex justify-center items-center gap-12 md:gap-16 lg:gap-20 text-center">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="hover:scale-110 transition-transform duration-300"
            >
              <div className="text-4xl md:text-5xl xl:text-6xl font-bold drop-shadow-md">
                <CountUp
                  start={0}
                  end={item.value}
                  duration={2.2}
                  separator=","
                />
              </div>
              <div className="text-sm md:text-base xl:text-lg font-semibold mt-1 tracking-wide">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
    //  <div className="flex flex-wrap justify-center gap-10 py-10 bg-[#F5F3FF]">
    //   {stats.map((item, i) => (
    //     <motion.div
    //       key={i}
    //       className="relative w-36 h-36 flex flex-col items-center justify-center rounded-full
    //                  bg-gradient-to-br from-[#C8B8FF] to-[#8E80FF] text-white shadow-lg
    //                  hover:rotate-3 hover:scale-105 transition-all duration-300"
    //       initial={{ opacity: 0, scale: 0.8 }}
    //       whileInView={{ opacity: 1, scale: 1 }}
    //       transition={{ delay: i * 0.2 }}
    //     >
    //       <div className="text-4xl font-bold">
    //         <CountUp end={item.value} duration={2.2} />
    //       </div>
    //       <p className="text-sm mt-1">{item.label}</p>
    //     </motion.div>
    //   ))}
    // </div>


    // <div className="w-full flex flex-wrap justify-center gap-6 py-10 bg-gradient-to-b from-[#EEE9FF] to-white">
    //   {data.map((item, i) => (
    //     <motion.div
    //       key={i}
    //       className="flex flex-col items-center justify-center w-56 h-40 rounded-3xl 
    //                  bg-white/40 backdrop-blur-md shadow-lg border border-white/60 
    //                  hover:scale-105 hover:shadow-xl transition-transform duration-300"
    //       initial={{ opacity: 0, y: 30 }}
    //       whileInView={{ opacity: 1, y: 0 }}
    //       transition={{ delay: i * 0.2 }}
    //     >
    //       <div className="text-4xl text-[#8E80FF] mb-2">{item.icon}</div>
    //       <div className="text-5xl font-bold text-[#5C4B99] drop-shadow-sm">
    //         <CountUp end={item.value} duration={2} />
    //       </div>
    //       <p className="text-gray-700 mt-1 font-semibold">{item.label}</p>
    //     </motion.div>
    //   ))}
    // </div>



  );
}
