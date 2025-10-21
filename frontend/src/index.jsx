import React, { useState , useEffect } from "react"
import Navbar_Belogin from "./comp/nav_be"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { FaBriefcaseMedical, FaCheckDouble, FaCheckSquare, FaCircle, FaHandHoldingHeart, FaUser, FaUserFriends } from "react-icons/fa";
import EmpRating from "./comp/emp_star";
import Index_Footer from "./jobber_comp/index_footer";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FaUserCheck, FaBriefcase, FaPeopleCarry } from "react-icons/fa";
import StatsBar from "./statsBar";


function Index() {
  // “จำนวนผู้สมัครทั้งหมด” หรือ “ผู้สมัครที่ลงทะเบียนแล้ว”
// 🏢 ผู้จ้างทั้งหมด	“จำนวนผู้ว่าจ้างทั้งหมด” หรือ “องค์กร/ผู้ว่าจ้างที่ลงทะเบียนแล้ว”
// ✅ ผู้สมัครที่ได้งานแล้ว	“จำนวนผู้สมัครที่ได้งานสำเร็จ”
// 💼 งานที่ได้คนแล้ว	“จำนวนงานที่มีผู้สมัครครบแล้ว”
  const jobstats = [
    {
      icon: <FaUser className="text-[#8E80FF] text-4xl" />,
      number: 20,
      label: "จำนวนผู้สมัครทั้งหมด",
    },
    {
      icon: <FaUserCheck className="text-[#8E80FF] text-4xl" />,
      number: 11,
      label: "จำนวนผู้สมัครที่ได้งานสำเร็จ",
    },
    {
      icon: <FaBriefcase className="text-[#8E80FF] text-4xl" />,
      number: 38,
      label: "จำนวนผู้ว่าจ้างทั้งหมด",
    },{
      icon: <FaCheckSquare className="text-[#8E80FF] text-4xl" />,
      number: 5,
      label: "จำนวนงานที่มีผู้สมัครครบแล้ว",
    },
  ];
  const volunstats = [
    {
      icon: <FaUserFriends className="text-[#8E80FF] text-4xl" />,
      number: 15,
      label: "จำนวนจิตอาสาทั้งหมด",
    },
    {
      icon: <FaHandHoldingHeart className="text-[#8E80FF] text-4xl" />,
      number: 25,
      label: "จำนวนผู้จัดกิจกรรมทั้งหมด",
    },
    {
      icon: <FaPeopleCarry className="text-[#8E80FF] text-4xl" />,
      number: 2,
      label: "กิจกรรมจิตอาสาที่มีผู้เข้าร่วม",
    },
  ];
    const [data, setData] = useState([]);
    const [volunTypeHit, setVolunTypeHit] = useState([]);
    const [lastpost, setLastpost] = useState([]);
    const [jobCount, setJobCount] = useState(0);
    const [volunteerCount, setVolunteerCount] = useState(0);
    const [jobTypeCount, setJobTypeCount] = useState(0);
    const [volunTypeCount, setVolunTypeCount] = useState(0);
    const navigate = useNavigate();
    const counts = [jobCount, volunteerCount, jobTypeCount];
    const maxLength = counts.some(count => String(count).length >= 3);
    const gapClass = maxLength >= 5 ? "gap-6" 
                      : maxLength >= 3 ? "gap-10"
                      : "gap-15";
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    /*const Star = ({ filled }) => (
      <FaStar color={filled ? '#8E80FF' : '#e5e7eb'} size={15} style={{ borderRadius: '5px' }} />
    );*/
    useEffect(() => {
        fetchData();
      }, []);
    

const fetchData = async () => {
  try {
    const res = await fetch(`${apiUrl}/apibelogin`);
    const result = await res.json();

    if (typeof result === 'object' && 'jobCount' in result && 'volunteerCount' in result && 'jobTypeCount' in result) {
      setJobCount(result.jobCount);
      setVolunteerCount(result.volunteerCount);
      setJobTypeCount(result.jobTypeCount);
      setVolunTypeCount(result.volunTypeCount);
    } else {
      console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
    }
    if(Array.isArray(result.data)){
        //console.log("sql", res)
        setData(result.data);
      } else {
        console.error("Data format error:", result);
        setData([]);
      }
    if(Array.isArray(result.voluntypehit)){
        //console.log("sql", res)
        setVolunTypeHit(result.voluntypehit);
      } else {
        console.error("Data format error:", result);
        setVolunTypeHit([]);
      }
    if(Array.isArray(result.lastpost)){
        //console.log("sql", res)
        //console.log("🔥 lastpost from API:", result.lastpost);
        setLastpost(result.lastpost);
      } else {
        console.error("Data format error:", result);
        setLastpost([]);
      }

  } catch (err) {
    console.error('Fetch error:', err);
  }
};
  const handleLogin = () => {
    //console.log("Modal login ถูกเรียก");
    document.getElementById("gologin_modal").showModal();
  };
  const handleclose= () => {
    document.getElementById("gologin_modal").close();
  };
    
    return (
      <div className="flex min-h-screen">
      <div onClick={handleLogin}>
        <Navbar_Belogin />
        <div className="relative w-full group">
          <img src="/belogin2.png" className="w-full" />
          <button className="hidden md:btn md:btn-sm md:bg-white md:border-white md:text-[#8E80FF] md:text-sm md:rounded-xl absolute top-9/13 left-4/7 ">
            เริ่มการหางาน
          </button>
        </div>
        <div className="p-4 sm:pl-4 sm:pt-4 sm:p-0 md:pl-4 md:pt-4 md:p-0 lg:pl-8 xl:pl-12 bg-white ">
            <h1 className="text-[#8E80FF] font-bold mb-6 lg:text-2xl lg:mb-10 xl:mb-15">เว็บเราทำอะไรได้บ้าง ?</h1>
            <div className="md:flex md:justify-center">
              <div className="flex justify-center gap-7 mb-4 md:mr-5 lg:gap-10 lg:mr-9 xl:gap-20 xl:mr-9">
                <div className="indicator">
                    <span className="indicator-item badge bg-[#8E80FF] border-[#8E80FF] w-12 h-12 lg:w-20 lg:h-20 xl:w-25 xl:h-25 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                    </span>
                    <div className="bg-[#D9D9D9] grid h-23 w-23 lg:w-35 lg:h-35 xl:w-45 xl:h-45 place-items-center rounded-2xl">
                        <img src="/1.png" className="w-21 lg:w-30 xl:w-40 " />
                    </div>
                </div>
                <div className="indicator">
                    <span className="indicator-item badge bg-[#8E80FF] border-[#8E80FF] w-12 h-12 lg:w-20 lg:h-20 xl:w-25 xl:h-25 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>

                    </span>
                    <div className="bg-[#D9D9D9] grid h-23 w-23 lg:w-35 lg:h-35 xl:w-45 xl:h-45 place-items-center rounded-2xl">
                        <img src="/2.png" className="w-21 lg:w-30 xl:w-40" />
                    </div>
                </div>
                <div className="indicator">
                    <span className="indicator-item badge bg-[#8E80FF] border-[#8E80FF] w-12 h-12 lg:w-20 lg:h-20 xl:w-25 xl:h-25 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>

                    </span>
                    <div className="bg-[#D9D9D9] grid h-23 w-23 lg:w-35 lg:h-35 xl:w-45 xl:h-45 place-items-center rounded-2xl">
                        <img src="/3.png" className="w-21 lg:w-30 xl:w-40" />
                    </div>
                </div>
              </div>
              
                {/* <div className="relative w-full group flex justify-center">
                  <div className="flex items-center justify-center h-30 w-90 md:h-23 lg:h-35 xl:h-45 md:w-full bg-[#8E80FF] text-white rounded-bl-full rounded-tl-full pl-14 py-3 md:py-0 md:pl-20 md:pl-23 xl:pl-30">
                    
                    <div className="mr-6 absolute top-1/9 left-4/17">
                      <div className="rotate-[-20deg] text-xl md:text-sm lg:text-xl xl:text-2xl font-bold opacity-50">จำนวน</div>
                    </div>

                    <div className={`flex justify-center items-center ${gapClass} text-center`}>
                    
                      <div className="xl:mr-10">
                        <div className="text-3xl lg:text-4xl xl:text-5xl font-bold">{jobCount}</div>
                        <div className="text-xs lg:text-sm xl:text-md font-bold">งาน</div>
                      </div>
                      <div className="xl:mr-10">
                        <div className="text-3xl lg:text-4xl xl:text-5xl font-bold">{volunteerCount}</div>
                        <div className="text-xs lg:text-sm xl:text-md font-bold">กิจกรรมจิตอาสา</div>
                      </div>
                      <div className="">
                        <div className="text-3xl lg:text-4xl xl:text-5xl font-bold">{jobTypeCount}</div>
                        <div className="text-xs lg:text-sm xl:text-md font-bold">ประเภทงาน</div>
                      </div>
                    </div>
                  </div>
              </div> */}
              <StatsBar jobCount={jobCount} volunteerCount={volunteerCount} jobTypeCount={jobTypeCount} volunTypeCount={volunTypeCount} />

          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-gradient-to-b from-white to-[#8E80FF]  px-5 lg:px-10 py-5 pb-10 pt-12 gap-2">
          <div className="max-w-6xl mx-auto text-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
              {jobstats.map((stat, i) => {
                const fillPercent = Math.min((stat.number / 50) * 100, 100);

                return (
                  <motion.div
                    key={i}
                    className="relative flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    {/* 💧 คลื่นน้ำ */}
                    <div
                      className="absolute bottom-0 left-0 w-full"
                      style={{ height: `${fillPercent}%` }}
                    >
                      <svg
                        viewBox="0 0 120 28"
                        preserveAspectRatio="none"
                        className="absolute bottom-0 left-0 w-full h-full blur-[1px]"
                      >
                        {/* คลื่นชั้น 1 */}
                        <motion.path
                          d="M0 20 
                            Q30 10 60 20 
                            T120 20 
                            T180 20 
                            T240 20 
                            L240 40 L0 40 Z"
                          fill="url(#waveGrad1)"
                          animate={{ y: ["0%", "10%"] }}
                          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                        />
                        {/* คลื่นชั้น 2 */}
                        <motion.path
                          d="M240 20 
                            Q210 10 180 20 
                            T120 20 
                            T60 20 
                            T0 20 
                            L0 40 L240 40 Z"
                          fill="url(#waveGrad2)"
                          animate={{ y: ["0%", "20%"] }}
                          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        />
                        {/* คลื่นชั้น 3 */}
                        <motion.path
                          d="M0 20 
                            Q30 10 60 20 
                            T120 20 
                            T180 20 
                            T240 20 
                            L240 40 L0 40 Z"
                          fill="url(#waveGrad3)"
                          animate={{ y: ["0%", "-20%"] }}
                          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                        />
                        {/* gradient */}
                        <defs>
                          <linearGradient id="waveGrad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A899FF" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#8E80FF" stopOpacity="0.7" />
                          </linearGradient>
                          <linearGradient id="waveGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#B7AFFF" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#7F72F7" stopOpacity="0.6" />
                          </linearGradient>
                          <linearGradient id="waveGrad3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#CFC8FF" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#A28BFF" stopOpacity="0.5" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* 💨 ฟองอากาศ */}
                      {[...Array(5)].map((_, b) => (
                        <motion.span
                          key={b}
                          className="absolute bottom-0 rounded-full bg-white/50"
                          style={{
                            left: `${Math.random() * 90}%`,
                            width: "8px",
                            height: "8px",
                          }}
                          animate={{
                            y: [-10, -100],
                            opacity: [1, 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4 + Math.random() * 2,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </div>

                    {/* ✨ เนื้อหา */}
                    <div className="z-10 py-8 flex flex-col items-center text-center">
                      <div className="mb-3 drop-shadow-md">{stat.icon}</div>
                      <h3 className="text-4xl font-bold text-[#8E80FF] drop-shadow-md">
                        <CountUp start={0} end={stat.number} duration={2.5} separator="," />
                      </h3>
                      <p className="mt-2 text-gray-700 font-medium">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="mt-5">
            <a className="text-lg lg:text-2xl xl:text-4xl text-[#8E80FF] font-bold">ประเภทงาน</a>
            <a className="text-sm lg:text-lg xl:text-xl text-[#8E80FF] font-bold pl-1 pt-0.5">ยอดนิยม</a>
          </div>

          {/* //เพิ่มสถิติคนได้งาน จำนวนงานที่ได้คนไปแล้วเพิ่มในหน้าแรกของเว็บ */}
          <a className="text-xs lg:text-sm xl:text-lg text-[#8E80FF] font-bold mb-1">จากทั้งหมด {jobTypeCount} ประเภท</a>
          <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-4 gap-4 my-1">
            {data.map((jobtype) => (
              //const [thai, englishRaw] = jobtype.jobtype_name.split(" (");
              //const english = englishRaw?.replace(")", "");
              <button
                key={jobtype.jobtype_id}
                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                className="btn btn-md text-[10px] lg:text-xs xl:text-[15px] w-80 lg:btn-lg xl:btn-xl bg-white border-[#8E80FF] border-3 rounded-xl hover:bg-[#8E80FF] hover:text-white text-[#8E80FF] py-2 px-4"
              >
                <div>{jobtype.jobtype_name}</div>
              </button>
            ))}
            <button
                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                className="btn btn-md text-[10px] lg:text-xs xl:text-[15px] w-80 lg:btn-lg xl:btn-xl bg-[#8E80FF] border-white text-white border-3 rounded-xl hover:bg-white hover:text-[#8E80FF]  py-2 px-4"
              >
                ทั้งหมด
              </button>
          </div>
          {/* <div className="mt-5 flex justify-center">
            <div className="w-full max-w-4xl text-center bg-[#8E80FF] rounded-2xl shadow-lg p-8 lg:p-12">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
                พบกับฟีเจอร์ ✨  
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">
                  กิจกรรมจิตอาสา
                </span>
                ได้ในเร็วๆนี้
              </h2>

              <p className="text-white text-base lg:text-xl opacity-90 drop-shadow">
                เรากำลังพัฒนาเพื่อให้คุณได้เข้าร่วมกิจกรรมดีๆ ที่สร้างประโยชน์ต่อสังคม
              </p>

            </div>
          </div> */}
          <div className="max-w-6xl mx-auto text-center mt-10 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {volunstats.map((stat, i) => {
                const fillPercent = Math.min((stat.number / 50) * 100, 100);

                return (
                  <motion.div
                    key={i}
                    className="relative flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    {/* 💧 คลื่นน้ำ */}
                    <div
                      className="absolute bottom-0 left-0 w-full"
                      style={{ height: `${fillPercent}%` }}
                    >
                      <svg
                        viewBox="0 0 120 28"
                        preserveAspectRatio="none"
                        className="absolute bottom-0 left-0 w-full h-full blur-[1px]"
                      >
                        {/* คลื่นชั้น 1 */}
                        <motion.path
                          d="M0 20 
                            Q30 10 60 20 
                            T120 20 
                            T180 20 
                            T240 20 
                            L240 40 L0 40 Z"
                          fill="url(#waveGrad1)"
                          animate={{ y: ["0%", "10%"] }}
                          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                        />
                        {/* คลื่นชั้น 2 */}
                        <motion.path
                          d="M240 20 
                            Q210 10 180 20 
                            T120 20 
                            T60 20 
                            T0 20 
                            L0 40 L240 40 Z"
                          fill="url(#waveGrad2)"
                          animate={{ y: ["0%", "20%"] }}
                          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        />
                        {/* คลื่นชั้น 3 */}
                        <motion.path
                          d="M0 20 
                            Q30 10 60 20 
                            T120 20 
                            T180 20 
                            T240 20 
                            L240 40 L0 40 Z"
                          fill="url(#waveGrad3)"
                          animate={{ y: ["0%", "-20%"] }}
                          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                        />
                        {/* gradient */}
                        <defs>
                          <linearGradient id="waveGrad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A899FF" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#8E80FF" stopOpacity="0.7" />
                          </linearGradient>
                          <linearGradient id="waveGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#B7AFFF" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#7F72F7" stopOpacity="0.6" />
                          </linearGradient>
                          <linearGradient id="waveGrad3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#CFC8FF" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#A28BFF" stopOpacity="0.5" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* 💨 ฟองอากาศ */}
                      {[...Array(5)].map((_, b) => (
                        <motion.span
                          key={b}
                          className="absolute bottom-0 rounded-full bg-white/50"
                          style={{
                            left: `${Math.random() * 90}%`,
                            width: "8px",
                            height: "8px",
                          }}
                          animate={{
                            y: [-10, -100],
                            opacity: [1, 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4 + Math.random() * 2,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </div>

                    {/* ✨ เนื้อหา */}
                    <div className="z-10 py-8 flex flex-col items-center text-center">
                      <div className="mb-3 drop-shadow-md">{stat.icon}</div>
                      <h3 className="text-4xl font-bold text-[#8E80FF] drop-shadow-md">
                        <CountUp start={0} end={stat.number} duration={2.5} separator="," />
                      </h3>
                      <p className="mt-2 text-gray-700 font-medium">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <a className="text-lg lg:text-2xl xl:text-4xl text-white font-bold">ประเภทกิจกรรมจิตอาสา</a>
            <a className="text-sm lg:text-lg xl:text-xl text-white font-bold pl-1 pt-0.5">ยอมนิยม</a>
          </div>
          <a className="text-xs lg:text-sm xl:text-lg text-white font-bold mb-1">จากทั้งหมด {volunTypeCount} ประเภท</a>
          <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-4 gap-4 my-1">
            {volunTypeHit.map((jobtype) => (
              //const [thai, englishRaw] = jobtype.jobtype_name.split(" (");
              //const english = englishRaw?.replace(")", "");
              <button
                key={jobtype.voluntype_id}
                style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 1)' }}
                className="btn btn-md text-[10px] lg:text-xs xl:text-[15px] w-80 lg:btn-lg xl:btn-xl bg-[#8E80FF] border-white text-white border-3 rounded-xl hover:bg-white hover:text-[#8E80FF]  py-2 px-4"
              >
                <div>{jobtype.voluntype_name}</div>
              </button>
            ))}
            <button
                style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 1)' }}
                className="btn btn-md text-[10px] lg:text-xs xl:text-[15px] w-80 lg:btn-lg xl:btn-xl bg-white border-[#8E80FF] text-[#8E80FF] border-3 rounded-xl hover:bg-[#8E80FF] hover:text-white  py-2 px-4"
              >
                ทั้งหมด
              </button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-white p-4 gap-2">
          
          <a className="text-lg lg:text-2xl xl:text-4xl text-[#8E80FF] font-bold">ประกาศล่าสุด</a>
          <div className="relative flex items-center mb-3">
            <button  className="z-10 btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-full pt-0.5 px-5 w-30 lg:w-40 hover:w-40 lg:text-sm">งาน</button>
            <button  className="z-0 -ml-5 btn btn-xs bg-white text-[#8E80FF] border-3 pt-0.5 px-5 w-30 lg:w-40 border-[#8E80FF] rounded-full hover:w-40 lg:text-sm">กิจกรรมจิตอาสา</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-1 mb-5">
            {lastpost.map((post) => (
              <div 
                key={post.post_id} 
                style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.24)' }}
                className="card card-xs bg-white w-45 md:w-52 lg:w-55 xl:w-70 shadow-sm rounded-3xl"
              >
                <figure >
                    {post.job_pic ? (
                          <img src={`/uploads/emp_pic/${post.job_pic}`}  className="w-full h-30 lg:h-60 object-cover" />
                        ) : (
                          <img src={`/uploads/nopic.png`}  className="w-full h-30 lg:h-60 object-cover" />
                        )}
                </figure>
                <div className="card-body justify-between">
                  <a className="card-title text-sm text-[#8E80FF]">{post.position_name}</a>
                    <div className="flex gap-2">
                      {post.picture ? (
                              <img src={`/uploads/emp_pic/${post.picture}`}  className="w-8 h-8 object-cover rounded-full" />
                            ) : (
                              <img src={`/uploads/nopic.png`}  className="w-8 h-8 object-cover rounded-full" />
                            )}
                      <a className="card-title text-[10px] text-black">{post.fullname}</a>
                    </div>
                  {/* <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} filled={i <= 3} />
                    ))}
                  </div> */}
                  {/* <div className="flex justify-center">
                  <EmpRating emp_id={post.emp_id} cl="#8E80FF" />
                    
                  </div> */}
                  <div className="flex justify-center gap-1 ml-2">
                        <a className="p-2 text-[10px] lg:text-sm text-white font-bold bg-[#8E80FF]  rounded-full">
                          รับทั้งหมด {post.num_position}
                          </a>
                        {post.accepted_count != 0 && (
                          <a className="p-2 text-[10px] lg:text-sm text-white font-bold bg-green-700  rounded-full">
                            รับไปแล้ว {post.accepted_count}
                          </a>
                        )}
                          

                      </div>
                      <div className="flex gap-1 ml-2">
                        <FaCircle color="#D9D9D9"/><a className="card-title lg:pl-2 text-[10px] text-black">
                          
                          {(() => {
                                      const salaryStr = post.salary || '';
                                      if (!salaryStr || salaryStr === '0') return 'ไม่ระบุค่าตอบแทน';
                                      const [min, max] = salaryStr.split('-').map(s => Number(s));
                                      if ((min || 0) === 0 && (max || 0) === 0) return 'ไม่ระบุ';
                                      if ((min || 0) === 0) return `${max.toLocaleString()} บาท`;
                                      if ((max || 0) === 0) return `${min.toLocaleString()} บาท`;
                                      if (min === max) return `${min.toLocaleString()} บาท`;
                                      return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
                                    })()} 
                          
                          </a>
                      </div>
                      
                    <div className="flex gap-1 ml-2">
                      <FaCircle color="#D9D9D9" />
                      <a className="card-title lg:pl-2 text-[10px] text-black">
                        ต.{post.tb} อ.{post.ap} จ.{post.jw}
                      </a>
                    </div>
                  
                  <div className="card-actions justify-center">
                    <button 
                      
                      className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-lg"
                    >รายละเอียด</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <center className="flex gap-0.5">
            <div className="text-[#8E80FF]"><FaCircle /></div>
            <div className="text-[#D9D9D9]"><FaCircle /></div><div className="text-[#D9D9D9]"><FaCircle /></div><div className="text-[#D9D9D9]"><FaCircle /></div>
          </center>
        </div>
        <Index_Footer />
        </div>
        {/* Modal ให้ไปล็อกอินนน */}
          <dialog id="gologin_modal" className="modal">
            <div className="modal-box  bg-white">
              <center><h2 className="text-xl md:text-2xl lg:text-3xl text-[#8E80FF] font-bold mb-4">กรุณาเข้าสู่ระบบก่อนเพื่อเข้าถึงข้อมูล</h2></center>
                
              <div className="modal-action flex flex-col justify-center items-center">
                
                <button className="btn btn-sm md:btn-md w-1/3 bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-md" onClick={() => {navigate("/login");}}>
                  เข้าสู่ระบบ
                </button>
                <button className="btn btn-sm md:btn-sm bg-white border border-[#8E80FF] text-[#8E80FF] px-4 py-2 rounded-md" onClick={handleclose}>
                  ยกเลิก
                </button>
              </div>
            </div>
          </dialog>
      
      </div>
    )
}

export default Index