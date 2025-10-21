
import React, { useState , useEffect } from "react";
import { FaPhone, FaEnvelope, FaBriefcase, FaUserShield , FaAward, FaBook, FaCalendarAlt, FaCircle, FaGraduationCap, FaTrash, FaUniversity, FaCheckCircle, FaSearch, FaTimesCircle } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { AlertTriangle, Brain, Smile } from "lucide-react";
import { MdSchool } from "react-icons/md";

function JobberProfile({ jobberId }) {
  //ข้อมูลใส่โปรไฟล์
      const [jobber, setJobber] = useState([]);
      const [interests_work, setInterWork] = useState([]);
      const [Pfhs, setHs] = useState([]);
      const [Pfss, setSs] = useState([]);
      const [interests_volun, setInterVolun] = useState([]);
      const [work_exper, setWorkExper] = useState([]);
      const [edu, setEdu] = useState([]);

      const [activeTab, setActiveTab] = useState("info");

        //แบ่งหน้า
        const [limit, setLimit] = useState(4);
        const [page, setPage] = useState(1);
        const [total, setTotal] = useState([]);
        const [totalPages, setTotalPages] = useState({
          work: 0,
          interests: 0,
          edu: 0,
        });

const PFfetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/jobber_pf?jobber_id=${jobberId}&page=${page}&limit=${limit}`);
      const result = await res.json();

      
      if(result.counts && typeof result.counts === "object"){
          //console.log("หน้า", result)
          setTotal(result.counts);
        } else {
          console.error("Data format error:", result);
          setTotal([]);
        }

      if(result.totalPages && typeof result.totalPages === "object"){
          //console.log("sql", res)
          setTotalPages(result.totalPages);
        } else {
          console.error("Data format error:", result);
          setTotalPages([]);
        }

      if(Array.isArray(result.jobber)){
          //console.log("sql", res)
          setJobber(result.jobber);
        } else {
          console.error("Data format error:", result);
          setJobber([]);
        }
        if(Array.isArray(result.edu)){
          //console.log("sql", res)
          setEdu(result.edu);
        } else {
          console.error("Data format error:", result);
          setEdu([]);
        }

      if(Array.isArray(result.interests_work)){
          //console.log("sql", res)
          setInterWork(result.interests_work);
        } else {
          console.error("Data format error:", result);
          setInterWork([]);
        }

      if(Array.isArray(result.hs)){
          //console.log("sql", res)
          setHs(result.hs);
        } else {
          console.error("Data format error:", result);
          setHs([]);
        }
      if(Array.isArray(result.ss)){
          //console.log("sql", res)
          setSs(result.ss);
        } else {
          console.error("Data format error:", result);
          setSs([]);
        }
      

      if(Array.isArray(result.interests_volun)){
          //console.log("sql", res)
          setInterVolun(result.interests_volun);
        } else {
          console.error("Data format error:", result);
          setInterVolun([]);
        }

      
      if(Array.isArray(result.work_exper)){
          //console.log("sql", res)
          setWorkExper(result.work_exper);
        } else {
          console.error("Data format error:", result);
          setWorkExper([]);
        }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    if (!jobberId) return;
    PFfetchData();
  }, [jobberId , page , limit]);

  if (!jobber) return <p>กำลังโหลดโปรไฟล์...</p>;


  const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

function formatDuration(duration) {
      if (!duration) return "";

      // แยกช่วงด้วย " - "
      const [start, end] = duration.split(" - ");

      // ฟังก์ชันย่อยแปลง yyyy-mm → mm-yyyy
      const formatPart = (part) => {
        if (!part) return "";
        const [year, month] = part.split("-");
        return `${month}-${year}`;
      };

      return `${formatPart(start)} - ${formatPart(end)}`;
    }

function period(duration) {
      if (!duration) return "";

      // แยกช่วงด้วย " - "
      const [start, end] = duration.split(" - ");
      const [startYear, startMonth] = start.split("-").map(Number);
      const [endYear, endMonth] = end.split("-").map(Number);

      let totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
      let years = Math.floor(totalMonths / 12);
      let months = totalMonths % 12;

      return `${years > 0 ? years + " ปี " : ""}${months > 0 ? months + " เดือน" : ""}`.trim() || "0 เดือน";
    }

function renderWorkSchedule(code) {
  if (!code || code.length !== 7) return "ข้อมูลไม่ถูกต้อง";

  const chars = code.split("");
  const workRanges = [];

  let rangeStart = null;
  let rangeEnd = null;

  chars.forEach((char, index) => {
    if (char === "1") {
      if (rangeStart === null) {
        rangeStart = index;
        rangeEnd = index;
      } else {
        rangeEnd = index;
      }
    } else {
      if (rangeStart !== null) {
        workRanges.push({ start: rangeStart, end: rangeEnd });
        rangeStart = null;
        rangeEnd = null;
      }
    }
  });

  // Add the last range if still open
  if (rangeStart !== null) {
    workRanges.push({ start: rangeStart, end: rangeEnd });
  }

  const displayRanges = workRanges.map(range => {
    if (range.start === range.end) {
      return daysOfWeek[range.start];
    } else {
      return `${daysOfWeek[range.start]} - ${daysOfWeek[range.end]}`;
    }
  });

  return (
    <span>
      {displayRanges.length > 0 ? displayRanges.join(", ") : "ไม่มีวันที่ทำงาน"}
    </span>
  );
}

function calculateAge(birthday) {
    if (!birthday) return '-';
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  return (
    <div className="w-full">
      <div className="flex justify-center items-center bg-white w-full">
                      <FaUserCircle className="w-8 h-8 text-[#8E80FF] mx-5" />
                      <h1 className=" py-5 text-2xl text-[#8E80FF] font-bold">โปรไฟล์</h1>
                    </div>
                    <div className="flex flex-col bg-white w-full">
                      {/* แถบเมนูเลือกแท็บ */}
                        <div role="tablist" className="tabs tabs-lift">
                          <a
                            role="tab"
                            onClick={() => setActiveTab("info")}
                            className={`tab  [--tab-bg:#8E80FF] font-semibold [--tab-border-color:#8E80FF] ${
                              activeTab === "info" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                            }`}
                          >
                            ข้อมูลส่วนตัว
                          </a>
                          <a
                            role="tab"
                            onClick={() => {setActiveTab("interests"); setPage(1);}}
                            className={`tab  [--tab-bg:#8E80FF] font-semibold [--tab-border-color:#8E80FF] ${
                              activeTab === "interests" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                            }`}
                          >
                            งานที่สนใจ ( {total.interests} )
                          </a>
                          <a
                            role="tab"
                            onClick={() => {setActiveTab("work"); setPage(1);}}
                            className={`tab  [--tab-bg:#8E80FF] font-semibold [--tab-border-color:#8E80FF] ${
                              activeTab === "work" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                            }`}
                          >
                            ประสบการณ์ทำงาน ( {total.work} )
                          </a>
                          <a
                            role="tab"
                            onClick={() => {setActiveTab("edu"); setPage(1);}}
                            className={`tab  [--tab-bg:#8E80FF] font-semibold [--tab-border-color:#8E80FF] ${
                              activeTab === "edu" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                            }`}
                          >
                            ประวัติการศึกษา ( {total.edu} )
                          </a>
                          <a
                            role="tab"
                            onClick={() => setActiveTab("skills")}
                            className={`tab  [--tab-bg:#8E80FF] font-semibold [--tab-border-color:#8E80FF] ${
                              activeTab === "skills" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                            }`}
                          >
                            ทักษะทั้งหมด ( {Pfhs.length + Pfss.length} )
                          </a>
                        </div>
                        {/* เนื้อหาของแต่ละแท็บ */}
                          {activeTab === "info" && (
                            <div className="flex flex-col bg-[#8E80FF] rounded-b-3xl w-full rounded-tr-3xl p-5 mb-5">
                              {jobber.length > 0 ? (
                                <div className="flex flex-col bg-white rounded-3xl justify-center items-center">
                                    
                                    {/* ชื่อ */}
                                    <div className="flex mt-4 text-center gap-2">
                                        <div className="w-30 h-30 rounded-lg">
                                            {jobber?.[0]?.picture ? (
                                                <img src={`/uploads/user_pic/${jobber?.[0]?.picture}`}  className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <img src={`/uploads/nopic.png`}  className="w-full h-full object-cover rounded-xl" />
                                            )}
                                        </div>  
                                      <div className="flex flex-col items-start gap-1">
                                        <h2 className="text-2xl font-bold text-[#8E80FF]">{jobber?.[0]?.fullname}</h2>
                                        <p className="font-semibold text-sm text-[#8E80FF]">{jobber?.[0]?.fullname_eng}</p>
                                        <p className="font-semibold text-gray-400 text-sm">อายุ {calculateAge(jobber?.[0]?.birthday)} ปี </p>
                                        <p className="font-semibold text-gray-400 text-sm">ต. {jobber?.[0]?.tb} อ. {jobber?.[0]?.ap} จ. {jobber?.[0]?.jw}</p>                                        
                                      </div>
                                      
                                    </div>
                                    
      
                                    {/* ข้อมูลติดต่อ */}
                                    <div className="rounded-xl p-4 text-gray-700">
                                      <div className="flex flex-wrap gap-4">
                                        
                                        {/* Card 1 */}
                                        <div className="bg-white rounded-xl p-4 flex items-center gap-2 shadow-md" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                          <FaPhone className="inline-block mr-1 text-[#8E80FF]" />
                                          <div>
                                            <p className="text-xs text-gray-500">เบอร์โทร</p>
                                            <p className="font-semibold text-gray-700">{jobber?.[0]?.phone}</p>
                                          </div>
                                        </div>

                                        {/* Card 2 */}
                                        <div className="bg-white rounded-xl p-4 flex items-center gap-2 shadow-md "style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                          <FaEnvelope className="inline-block mr-1 text-[#8E80FF]" />
                                          <div>
                                            <p className="text-xs text-gray-500">อีเมล</p>
                                            <p className="font-semibold text-gray-700">{jobber?.[0]?.email}</p>
                                          </div>
                                        </div>

                                        {/* Card 3 */}
                                        <div className="bg-white rounded-xl p-4 flex items-center gap-2 shadow-md"style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                          <FaBriefcase className="inline-block mr-1 text-[#8E80FF]" />
                                          <div>
                                            <p className="text-xs text-gray-500">สถานะการทำงาน</p>
                                            <p className="font-semibold text-gray-700">
                                              {(jobber?.[0]?.work_status) === "JOB" ? (
                                                <span className="flex items-center gap-2 text-green-500">
                                                  ได้งานแล้ว <FaCheckCircle className="text-green-500" />
                                                </span>
                                              ) : (
                                                <span className="flex items-center gap-2 text-[#8E80FF]">
                                                  หางานอยู่ <FaSearch className="text-[#8E80FF]" />
                                                </span>
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Card 4 */}
                                        <div className="bg-white rounded-xl p-4 flex items-center gap-2 shadow-md"style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                          <FaUserShield className="inline-block mr-1 text-[#8E80FF]" />
                                          <div>
                                            <p className="text-xs text-gray-500">สถานะบัญชี</p>
                                            <p className="font-semibold text-gray-700">
                                              {(jobber?.[0]?.status) === "ON" ? (
                                                <span className="flex items-center gap-2 text-[#8E80FF]">
                                                  ใช้งานปกติ <FaCheckCircle className="text-[#8E80FF]" />
                                                </span>
                                              ) : (
                                                <span className="flex items-center gap-2 text-red-500">
                                                  ถูกระงับ <FaTimesCircle className="text-red-500" />
                                                </span>
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                      </div>
                                    </div>

                                    <div className="absolute top-35 right-1/14 opacity-5 text-[10rem] pr-4 pt-2 pointer-events-none select-none">
                                        {jobber?.[0]?.gender === "M"
                                          ? <img src='/man.png' className='w-30 mt-2 ' />
                                          : jobber?.[0]?.gender === "F"
                                          ? <img src='/woman.png' className='w-25 rotate-50 -mb-20' />
                                          : ""}  
                                      </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center text-[#7B6ADA] gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                                  <AlertTriangle className="w-6 h-6  text-yellow-500" />
                                   ยังไม่ได้ลงข้อมูลงานที่สนใจไว้
                                </div>
                              )}
                              
                            </div>
                          )}
                          
                          {activeTab === "interests" && (
                            <div className="flex flex-col bg-[#8E80FF] rounded-b-3xl rounded-tr-3xl p-5 mb-5">
                              {interests_work.length > 0 ? (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    {interests_work.map((work, index) => (
                                      <div
                                        key={index}
                                        className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition duration-300"
                                      >
                                        <div className="flex items-center mb-3">
                                          {/* รูปภาพ/ไอคอนงาน */}
                                          <div className="w-12 h-12 rounded-full bg-[#8E80FF] flex items-center justify-center text-white font-bold mr-3">
                                            {index + 1}
                                          </div>
                                          <div>
                                            <p className="text-lg font-bold text-[#7B6ADA]">
                                              {work.position_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {work.salary_min} - {work.salary_max} บาท
                                            </p>
                                          </div>
                                        </div>
      
                                        <div className="text-center text-sm text-gray-700 space-y-1">
                                          <p>
                                            <span className="font-semibold text-[#7B6ADA]">วัน เวลาที่ต้องการทำงาน:</span>{" "}
                                            {renderWorkSchedule(work.days)} {work.hour} - {work.end_hour} น.
                                          </p>
                                        </div>
      
                                        {/* ปุ่มหรือข้อมูลเพิ่มเติม */}
                                        {/* <button className="mt-3 px-3 py-1 bg-[#8E80FF] text-white rounded-lg">
                                          ดูรายละเอียด
                                        </button> */}
                                      </div>
                                    ))}
                                  </div>
                                  <center>
                                    <div className="join items-center gap-2 my-2">
                                      {/* ปุ่มย้อนกลับ */}
                                      {page > 1 && (
                                        <button
                                          onClick={() => setPage(page - 1)}
                                          className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item"
                                        >
                                          «
                                        </button>
                                      )}
      
                                      {/* ปุ่มเลขเพจ */}
                                      {Array.from({ length: totalPages.interests }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                          key={pageNum}
                                          onClick={() => setPage(pageNum)}
                                          className={`btn btn-xs rounded-3xl join-item 
                                            ${page === pageNum ? "bg-white border-white text-[#8E80FF]" : "bg-gray-300 border-gray-300 text-white"}`}
                                        >
                                          {pageNum}
                                        </button>
                                      ))}
      
                                      {/* ปุ่มถัดไป */}
                                      {page < totalPages.interests && (
                                        <button
                                          onClick={() => setPage(page + 1)}
                                          className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item"
                                        >
                                          »
                                        </button>
                                      )}
                                    </div>
                                  </center>
      
                                </>
                              ) : (
                                <div className="flex items-center justify-center text-white gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                                  <AlertTriangle className="w-6 h-6 text-white" />
                                  ยังไม่ได้ลงข้อมูลงานที่สนใจไว้
                                </div>
                              )}
                            </div>
      
                          )}
      
                          {activeTab === "work" && (
                            <div className="flex flex-col bg-[#8E80FF] w-full rounded-b-3xl rounded-tr-3xl p-5 mb-5">
                              {work_exper.length > 0 ? (
                                <div className="flex flex-col bg-[#8E80FF] rounded-b-3xl rounded-tr-3xl p-5 mb-5">
                                  <div className="columns-1 md:columns-2 gap-4">
                                    {work_exper.map((work) => (
                                      <div
                                        key={work.no}
                                        className="mb-4 break-inside-avoid bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition duration-300"
                                      >
                                        {/* หัวการ์ด */}
                                        <div className="flex items-center mb-3">
                                          <div className="w-12 h-12 rounded-full bg-[#8E80FF] flex items-center justify-center text-white font-bold mr-3">
                                            {work.no}
                                          </div>
                                          <div>
                                            <p className="text-lg font-bold text-[#7B6ADA]">
                                              {work.position_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {work.company}
                                            </p>
                                          </div>
                                        </div>
      
                                        {/* เนื้อหาในการ์ด */}
                                        <div className="flex flex-col items-center text-sm text-gray-700 space-y-1">
                                          <p>
                                            <span className="font-semibold text-[#7B6ADA]">ระยะเวลา:</span>{" "}
                                            {period(work.duration)}{" "}
                                            <span className="font-semibold text-[#7B6ADA]">ตั้งแต่:</span>{" "}
                                            {formatDuration(work.duration)}
                                          </p>
                                          {work.job_description != "" && (
                                            <p className="">
                                              <span className="font-semibold text-[#7B6ADA]">
                                                รายละเอียดงาน:
                                              </span>{" "}
                                              {work.job_description}
                                            </p>
                                          )}
                                          {/* line-clamp-1 */}
      
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center w-full justify-center text-white gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                                  <AlertTriangle className="w-6 h-6 text-white" />
                                  ยังไม่ได้ลงข้อมูลประสบการณ์การทำงานไว้
                                </div>
                              )}
                                  <center>
                                    <div className="join items-center gap-2 my-2">
                                      {/* ปุ่มย้อนกลับ */}
                                      {page > 1 && (
                                        <button
                                          onClick={() => setPage(page - 1)}
                                          className="btn btn-xs bg-white border-white text-[#8E80FF] text-lg rounded-3xl join-item"
                                        >
                                          «
                                        </button>
                                      )}
      
                                      {/* ปุ่มเลขเพจ */}
                                      {Array.from({ length: totalPages.work }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                          key={pageNum}
                                          onClick={() => setPage(pageNum)}
                                          className={`btn btn-xs rounded-3xl join-item 
                                            ${page === pageNum ? "bg-white border-white text-[#8E80FF]" : "bg-gray-300 border-gray-300 text-white"}`}
                                        >
                                          {pageNum}
                                        </button>
                                      ))}
      
                                      {/* ปุ่มถัดไป */}
                                      {page < totalPages.work && (
                                        <button
                                          onClick={() => setPage(page + 1)}
                                          className="btn btn-xs bg-white border-white text-[#8E80FF] text-lg rounded-3xl join-item"
                                        >
                                          »
                                        </button>
                                      )}
                                    </div>
                                  </center>
      
                            </div>
                          )}
      
                          {activeTab === "edu" && (
                            <div className="flex flex-col bg-[#8E80FF] rounded-b-3xl w-full rounded-tr-3xl p-5 mb-5">
                                {edu.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-5 overflow-y-auto max-h-[700px]">
                                            {edu.map((jobber, index) => (
                                            <div
                                                key={index}
                                                className="flex bg-white p-8 rounded-2xl justify-start shadow-md"
                                            >
                                                <div className="space-y-3 flex flex-col text-[#7B6ADA] text-sm md:text-base lg:text-xl">
                                                <div className="flex items-center">
                                                    <MdSchool className="mr-2" />
                                                    <b className="w-40 inline-block">ระดับการศึกษา:</b> {jobber.edu_name}
                                                </div>
                
                                                {/* status !== 0 ถึงจะโชว์ข้อมูลอื่น */}
                                                {jobber.status !== 0 && (
                                                    <>
                                                    <div className="flex items-center">
                                                        <FaAward className="mr-2" />
                                                        <b className="w-40 inline-block">วุฒิการศึกษา:</b>{" "}
                                                        {jobber.qualification}
                                                    </div>
                
                                                    <div className="flex items-center">
                                                        <FaUniversity className="mr-2" />
                                                        <b className="w-40 inline-block">สถาบัน:</b> {jobber.institution}
                                                    </div>
                
                                                    {/* status === 2 เท่านั้นถึงจะโชว์คณะ / สาขา */}
                                                    {jobber.status === 2 && (
                                                        <div className="flex items-center">
                                                        <FaBook className="mr-2" />
                                                        <b className="w-40 inline-block">คณะ / สาขา:</b>{" "}
                                                        {jobber.major}
                                                        </div>
                                                    )}
                
                                                    <div className="flex items-center">
                                                        <FaCalendarAlt className="mr-2" />
                                                        <b className="w-40 inline-block">วันที่จบการศึกษา:</b>{" "}
                                                        {jobber.year_graduat}
                                                    </div>
                
                                                    <div className="flex items-center">
                                                        <FaAward className="mr-2" />
                                                        <b className="w-40 inline-block">เกรด / ผลการเรียน:</b>{" "}
                                                        {jobber.grade}
                                                    </div>
                                                    </>
                                                )}
                                                </div>
                                            </div>
                                            ))}
                                        </div>
                                        
                                            <center>
                                                <div className="join items-center gap-2 my-2">
                                                {/* ปุ่มย้อนกลับ */}
                                                {page > 1 && (
                                                    <button
                                                    onClick={() => setPage(page - 1)}
                                                    className="btn btn-xs bg-white border-white text-[#8E80FF] text-lg rounded-3xl join-item"
                                                    >
                                                    «
                                                    </button>
                                                )}
                
                                                {/* ปุ่มเลขเพจ */}
                                                {Array.from({ length: totalPages.edu }, (_, i) => i + 1).map((pageNum) => (
                                                    <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`btn btn-xs rounded-3xl join-item 
                                                        ${page === pageNum ? "bg-white border-white text-[#8E80FF]" : "bg-gray-300 border-gray-300 text-white"}`}
                                                    >
                                                    {pageNum}
                                                    </button>
                                                ))}
                
                                                {/* ปุ่มถัดไป */}
                                                {page < totalPages.edu && (
                                                    <button
                                                    onClick={() => setPage(page + 1)}
                                                    className="btn btn-xs bg-white border-white text-[#8E80FF] text-lg rounded-3xl join-item"
                                                    >
                                                    »
                                                    </button>
                                                )}
                                                </div>
                                            </center>
                                    </>
                                ):(
                                    <>
                                        <div className="flex items-center justify-center w-full text-white gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                                            <AlertTriangle className="w-6 h-6 text-white" />
                                            ยังไม่ได้ลงข้อมูลการศึกษาไว้
                                        </div>
                                    </>
                                )}
                            </div>
                          )}
      
                          {activeTab === "skills" && (
                            <div className="flex justify-center gap-20 text-white bg-[#8E80FF] rounded-b-3xl rounded-tr-3xl p-10 mb-5">
                              {/* กล่องพื้นหลังทักษะ */}
                              
                                
                                {/* ทักษะด้านความรู้ */}
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-5 h-5 md:w-6 md:h-6" />
                                    <p className="text-sm md:text-base lg:text-xl font-semibold">ทักษะด้านความรู้</p>
                                  </div>
      
                                  {Pfhs.length > 0 ? (
                                    Pfhs.map((hs, index) => (
                                      <div key={index} className="ml-6 md:ml-10 text-[10px] md:text-sm lg:text-lg">
                                        {index + 1}. {hs.hardskill_name}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-center gap-2 ml-6 mt-2 text-sm md:text-lg font-medium">
                                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                      ยังไม่ได้ลงข้อมูลทักษะด้านความรู้
                                    </div>
                                  )}
                                </div>
      
                                {/* ทักษะด้านอารมณ์ */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Smile className="w-5 h-5 md:w-6 md:h-6" />
                                    <p className="text-sm md:text-base lg:text-xl font-semibold">ทักษะด้านอารมณ์</p>
                                  </div>
      
                                  {Pfss.length > 0 ? (
                                    Pfss.map((ss, index) => (
                                      <div key={index} className="ml-6 md:ml-10 text-[10px] md:text-sm lg:text-lg">
                                        {index + 1}. {ss.softskill_name}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-center gap-2 ml-6 mt-2 text-sm md:text-lg font-medium">
                                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                      ยังไม่ได้ลงข้อมูลทักษะด้านอารมณ์
                                    </div>
                                  )}
                                </div>
      
                              
                            </div>
                          )}
                        
                    </div>
    </div>
  );
}

export default JobberProfile;