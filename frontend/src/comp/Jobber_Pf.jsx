import { useLocation } from "react-router-dom";
import React, { useState , useEffect } from "react"
import Navbar from "./navbar";
import Footer from "./footer";
import EmpRating from "./emp_star";
import EmpRating_one from "./emp_star_one";
import EmpRating_volun from "./emp_star_volun";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import { CheckIcon } from '@heroicons/react/24/outline';
import axios from "axios";
import { FaGraduationCap, FaUniversity, FaBook, FaCalendarAlt, FaAward , FaCheckCircle, FaSearch } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import { AlertTriangle } from 'lucide-react';
import { Brain, Smile } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function jobber_Pf() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ถ้าไม่มี token อาจ redirect ไป login

      window.location.href = "/login";
      return;
    }

    axios.get(`${apiUrl}/jobber_profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUserData(res.data.user);
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("i");

  //const [selectedTab, setSelectedTab] = useState("job"); // 'job' หรือ 'volunteer'

    
  const [jobber, setJobber] = useState([]);
  const [interests_work, setInterWork] = useState([]);
  const [hs, setHs] = useState([]);
  const [ss, setSs] = useState([]);
  const [hd, setHd] = useState();
  const [job_matched, setJobMatched] = useState([]);
  const [interests_volun, setInterVolun] = useState([]);
  const [volun_matched, setVolunMatched] = useState([]);
  const [job_matchedCount, setJobMCount] = useState([]);
  const [volun_matchedCount, setVolunMCount] = useState([]);
  const [work_exper, setWorkExper] = useState([]);
  const [edu, setEdu] = useState([]);
  const limit = 5;

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const [totalPages, setTotalPages] = useState(1);

  const [workPage, setWorkPage] = useState(1);
  const [workTotal, setWorkTotal] = useState();
  const [workTotalPages, setWorkTotalPages] = useState();

  const [eduPage, setEduPage] = useState(1);
  const [eduTotal, setEduTotal] = useState();
  const [eduTotalPages, setEduTotalPages] = useState();

  const [interestsPage, setInterestsPage] = useState(1);
  const [interestsTotal, setInterestsTotal] = useState();
  const [interestsTotalPages, setInterestsTotalPages] = useState();
  

  useEffect(() => {
          fetchData();
         }, [id , page , workPage , eduPage , interestsPage]);
      
  
  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/Adminview_jobber_pf?jobber_id=${id}&page=${page}&workPage=${workPage}&eduPage=${eduPage}&interestsPage=${interestsPage}&limit=${limit}`);
      const result = await res.json();   //page ไว้รับงานที่จับคู๋แล้ว

      if (typeof result === 'object' && 
        'job_matchedCount' in result && 
        'volun_matchedCount' in result && 
        'hd' in result ) {
        setJobMCount(result.job_matchedCount);
        setHd(result.hd);
        setVolunMCount(result.volun_matchedCount);
      } else {
        console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      }
      

    // ---------- set total counts ----------
    if (result.counts) {
      setWorkTotal(result.counts.work);
      setEduTotal(result.counts.edu);
      setInterestsTotal(result.counts.interests);
      setTotal(result.counts.match);
    }

    // ---------- set total pages ----------
    if (result.totalPages) {
      setWorkTotalPages(result.totalPages.work);
      setEduTotalPages(result.totalPages.edu);
      setInterestsTotalPages(result.totalPages.interests);
      setTotalPages(result.totalPages.match);
    }

    // ---------- set array data (เหมือนเดิม) ----------
    setWorkExper(Array.isArray(result.work_exper) ? result.work_exper : []);
    setEdu(Array.isArray(result.edu) ? result.edu : []);
    setInterWork(Array.isArray(result.interests_work) ? result.interests_work : []);
    setJobber(Array.isArray(result.jobber) ? result.jobber : []);
    setHs(Array.isArray(result.hs) ? result.hs : []);
    setSs(Array.isArray(result.ss) ? result.ss : []);
    setJobMatched(Array.isArray(result.job_matched) ? result.job_matched : []);
    setInterVolun(Array.isArray(result.interests_volun) ? result.interests_volun : []);
    setVolunMatched(Array.isArray(result.volun_matched) ? result.volun_matched : []);

      
      
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };
  function formatDateToThaiShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
    const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

    return `${day}/${month}/${year}`;
  }
  


  const queryType = queryParams.get("type") || "job"; // default เป็น "job"

  function renderWorkSchedule(code) {
  if (!code || code.length !== 7) return "ข้อมูลไม่ถูกต้อง";

  const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
  const chars = code.split("");

  // ถ้าทำงานครบทั้ง 7 วัน
  if (chars.every(char => char === "1")) {
    return <span>ทำงานได้ทุกวัน</span>;
  }

  // เก็บวันทำงาน (เลข 1)
  const workingDays = chars.map((char, index) => char === "1" ? index : -1).filter(index => index !== -1);

  // ตรวจเช็คว่าเป็นช่วงต่อเนื่องไหม
  const ranges = [];
  let start = workingDays[0];
  let end = start;

  for (let i = 1; i < workingDays.length; i++) {
    if (workingDays[i] === end + 1) {
      end = workingDays[i];
    } else {
      ranges.push([start, end]);
      start = workingDays[i];
      end = start;
    }
  }
  ranges.push([start, end]); // push ช่วงสุดท้าย

  // สร้างข้อความ
  const result = ranges.map(([startIdx, endIdx]) => {
    if (startIdx === endIdx) {
      return daysOfWeek[startIdx]; // วันเดียว
    } else {
      return `${daysOfWeek[startIdx]}-${daysOfWeek[endIdx]}`; // ช่วงวัน
    }
  });

  return <span>{result.join(", ")}</span>;
}
  const handleTabClick = (type) => {
    navigate(`/Jobber_Pf?i=${id}&type=${type}`);
    window.scrollTo(0,0);
  };

  const goToProfile = (val) => {
    navigate(`/Job_Post?pi=${val}&i=${id}`,
      {state: { from: location.pathname }});
    window.scrollTo(0,0);
  };
  const goToVolunPost = (val) => {
    navigate(`/Volun_Post?pi=${val}&i=${id}`,
      {state: { from: location.pathname }});
    window.scrollTo(0,0);
  };

  const handleBack = () => {
  const from = location.state?.from;
  if (from) {
    navigate(from);
  } else {
    navigate('/Admin/jobber'); // fallback หน้าหลัก
  }
};

    return (
      <div className="">
        {userData && <Navbar user={userData} />}
        <div className="relative w-full group">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl border-white p-2 md:p-3 lg:p-4 xl:p-5  bg-white text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl absolute top-8/11 left-3/5 xl:top-2 xl:left-8"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="6">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
          </div>
        {/* <center><h1>Job post {id}</h1></center> */}
        <div className="flex flex-col md:flex-row items-center bg-[#7B6ADA] justify-center gap-2  px-7 pb-5 md:px-20 md:pb-7 lg:px-30 lg:pb-14 xl:px-50 xl:pb-20"> 
          
          <div className="avatar">
            <div className="w-24 sm:w-28 md:w-35 lg:w-40 rounded-full">
              {jobber[0]?.picture ? (
                            <img src={`/uploads/user_pic/${jobber[0]?.picture}`} />
                          ) : (
                            <img src={`/uploads/nophoto.png`}  />
                          )}
            </div>
          </div>
          <div className="pl-2 md:pl-4 lg:pl-6 xl:pl-10">
            <div className="flex flex-col gap-1 lg:gap-2 xl:gap-3">
              <div className="flex gap-1 lg:gap-2 xl:gap-3">
                <a className="text-lg md:text-2xl lg:text-3xl xl:text-5xl font-bold">{jobber[0]?.fullname}</a>
                  {jobber[0]?.status === "ON" ? (
                          <button className="text-success w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-13 xl:h-13">
                            <CheckIcon strokeWidth={6} />
                          </button>
                      ) : (
                          <button className="text-error w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-13 xl:h-13">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                      )
                      }
                </div>
              {(jobber[0]?.work_status) === "JOB" ? (
                  <button className="flex items-center justify-center gap-2 bg-green-500 text-white text-xs md:text-sm lg:text-xl xl:text-2xl font-bold px-4 py-2 rounded-full shadow-md">
                    <FaCheckCircle className="text-white" />
                    ได้งานแล้ว
                  </button>
                ) : (
                  <button className="flex items-center justify-center gap-2 bg-gray-400 text-white text-xs md:text-sm lg:text-xl xl:text-2xl font-bold px-4 py-2 rounded-full shadow-md">
                    <FaSearch className="text-white" />
                    หางานอยู่
                  </button>
                )}
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-2">
                เพศ {jobber[0]?.gender === "M"
                      ? "ชาย"
                      : jobber[0]?.gender === "F"
                      ? "หญิง"
                      : "ไม่ระบุ"}
                      
                     
              </a>
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-2">ที่อยู่ ต.{jobber[0]?.tb} อ.{jobber[0]?.ap} จ.{jobber[0]?.jw}</a>

            </div>
          </div>  
        </div>

        <div className="relative flex items-center justify-center bg-white p-3">
          <button onClick={() => handleTabClick("job")} className={`z-10 btn btn-xs md:btn-sm ${queryType  === "job" ? "bg-[#7B6ADA] text-white" : "bg-white text-[#7B6ADA]"} border-[#7B6ADA] border-3 rounded-full pt-0.5 px-5 w-25 md:w-35 lg:w-40 hover:w-40 lg:text-sm`}>งาน</button>
          <button onClick={() => handleTabClick("volunteer")} className={`-ml-5 btn btn-xs md:btn-sm ${queryType  === "volunteer" ? "bg-[#7B6ADA] text-white z-10" : "bg-white text-[#7B6ADA] z-0"} border-3 pt-0.5 pl-5 md:w-40  border-[#7B6ADA] rounded-full hover:w-40 lg:text-sm`}>กิจกรรมจิตอาสา</button>
        </div>
        {queryType === "job" && (
          <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-30 lg:py-12 xl:px-50 xl:py-14">
          
              {/* งานที่สนใจ */}
                <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold  text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">
                    งานที่สนใจ
                  </p>

                  {interests_work.length > 0 ? (
                    <div className="flex flex-col justify-center items-center">
                      <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-xl">
                        <div className="flex items-center justify-center w-full">
                          <div className="overflow-hidden rounded-2xl w-full">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-[#7B6ADA] text-white h-10">
                                  <th className="text-center p-2">ที่</th>
                                  <th className="text-center p-2">ตำแหน่งงาน</th>
                                  <th className="text-center p-2">เงินเดือน</th>
                                  <th className="text-center p-2">วัน เวลาที่ต้องการ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {interests_work.map((work, index) => (
                                  <tr key={index + 1} className="bg-white border-b hover:bg-[#f1f0ff]">
                                    <td className="text-center align-middle p-2 text-[10px] md:text-sm lg:text-lg">{index + 1}</td>
                                    <td className="text-center align-middle p-2 text-[10px] md:text-sm lg:text-lg">{work.position_name}</td>
                                    <td className="text-center align-middle p-2 text-[10px] md:text-sm lg:text-lg">{work.salary_min} - {work.salary_max}</td>
                                    <td className="text-center align-middle p-2 text-[10px] md:text-sm lg:text-lg">
                                      {renderWorkSchedule(work.days)} {work.hour} - {work.end_hour} น.
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <center>
                              <div className="join items-center gap-2 mb-3">
                                {interestsPage > 1 && (
                                  <button
                                    onClick={() => setInterestsPage(interestsPage - 1)}
                                    className="btn btn-xs bg-white border-white text-purple-800 rounded-3xl join-item hover:bg-[#5945c7]"
                                  >
                                    «
                                  </button>
                                )}

                                {Array.from({ length: interestsTotalPages || 0 }, (_, i) => i + 1).map((pageNum) => (
                                  <button
                                    key={pageNum}
                                    onClick={() => setInterestsPage(pageNum)}
                                    className={`btn btn-xs rounded-3xl join-item transition-colors
                                      ${interestsPage === pageNum
                                        ? "bg-[#6C5CE7] border-[#6C5CE7] text-white hover:bg-[#5945c7]"
                                        : "bg-white border-white text-purple-800 hover:bg-white hover:text-[#6C5CE7]"}
                                    `}
                                  >
                                    {pageNum}
                                  </button>
                                ))}

                                {interestsPage < interestsTotalPages && (
                                  <button
                                    onClick={() => setInterestsPage(interestsPage + 1)}
                                    className="btn btn-xs bg-white border-white text-purple-800 rounded-3xl join-item hover:bg-[#5945c7]"
                                  >
                                    »
                                  </button>
                                )}
                              </div>
                            </center>

                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-[#7B6ADA] gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                      <AlertTriangle className="w-6 h-6  text-yellow-500" />
                      ยังไม่ได้ลงข้อมูลงานที่สนใจไว้
                    </div>
                  )}
                </div>

              <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold  text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">
                  งานที่จับคู่แล้ว
                </p>
                <div className="p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl">
                  <table className="w-full table-auto border-separate border-spacing-0 overflow-hidden rounded-3xl shadow-md">
                    <thead>
                      <tr>
                        <th className="bg-[#7B6ADA] text-white text-left p-3 text-xs font-bold lg:text-xl">
                          ทั้งหมด {total} งาน
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {job_matched.map((post , index) => {
                                  const matchingCount = post.matching.split("").filter(ch => ch === "1").length;

                                  const hsCount = post.hs ? post.hs.split(",").filter(id => id.trim() !== "").length : 0;
                                  const ssCount = post.ss ? post.ss.split(",").filter(id => id.trim() !== "").length : 0;

                                  const totalMatch = matchingCount + hsCount + ssCount;

                                  const matchPercent = Math.round((totalMatch / hd) * 100);
                                  const notMatchPercent = 100 - matchPercent;
                                  return(
                                    <div key={index} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs sm:text-sm md:text-lg lg:text-2xl  font-bold">{post.position_name ? (post.position_name) : 'ตำแหน่งงาน'}</p>
                                        <p className="text-[8px] font-bold sm:text-sm md:text-sm lg:text-xl  text-right pt-1">วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : 'ไม่มีวันที่'}</p>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs sm:text-sm md:text-lg lg:text-xl  font-bold">ผู้โพสต์ {post.fullname ? (post.fullname) : 'ตำแหน่งงาน'}</p>
                                      </div>
                                      <div className="flex items-center justify-center mt-2 md:mt-4">
                                        <div className="my-2 w-3/4">
                                            {/* หัวข้อ */}
                                            
                                            <p className="text-[10px] md:text-sm text-[#7B6ADA] font-semibold mb-1">
                                              ค่าความตรงกับคุณสมบัติ
                                            </p>

                                            {/* แถบรวมตรง-ไม่ตรง */}
                                            <div className="w-full bg-[#C0BBEB] rounded-full h-10 relative overflow-hidden">
                                              {/* แถบฝั่งตรง */}
                                              <div
                                                className="bg-[#7B6ADA] h-10 rounded-full"
                                                style={{ width: `${matchPercent}%` }}
                                              ></div>

                                              {/* ข้อความกำกับซ้าย-ขวา */}
                                              <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] md:text-xs font-bold">
                                                <span className="text-white">ตรง {matchPercent}%</span>
                                                <span className="text-[#7B6ADA]">ไม่ตรง {notMatchPercent}%</span>
                                              </div>
                                            </div>
                                          </div>
                                        
                                      </div>
                                        
                                    </div>
                                  )
                      })}
                    </tbody>
                  </table>
                      <center>
                        <div className="join items-center gap-2 mb-3">
                          {page > 1 && (
                            <button
                              onClick={() => setPage(page - 1)}
                              className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                            >
                              «
                            </button>
                          )}

                          {Array.from({ length: totalPages || 0 }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`btn btn-xs rounded-3xl join-item transition-colors
                                ${page === pageNum
                                  ? "bg-[#6C5CE7] border-[#6C5CE7] text-white hover:bg-[#5945c7]"
                                  : "bg-transparent border-white text-white hover:bg-white hover:text-[#6C5CE7]"}
                              `}
                            >
                              {pageNum}
                            </button>
                          ))}

                          {page < totalPages && (
                            <button
                              onClick={() => setPage(page + 1)}
                              className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                            >
                              »
                            </button>
                          )}
                        </div>
                      </center>
                  

                </div>
                
                {/* /end flex job/ */}
              </div>

              {/* ประสบการณ์การทำงาน */}
                <div className="flex flex-col bg-[#D9D9D9] p-5 mb-5 rounded-3xl p-4 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold  text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">
                    ประสบการณ์การทำงาน
                  </p>

                  {work_exper.length > 0 ? (
                    <div className="flex flex-col justify-center items-center">
                      <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-xl">
                        <div className="flex items-center justify-center w-full">
                          <div className="overflow-hidden rounded-2xl w-full overflow-y-auto max-h-[700px]">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-[#7B6ADA] text-white h-10">
                                  <th className="text-center p-2">ที่</th>
                                  <th className="text-center p-2">ตำแหน่งงาน</th>
                                  <th className="text-center p-2">บริษัท</th>
                                  <th className="text-center p-2">ระยะเวลา</th>
                                  <th className="text-center p-2">รายละเอียดงาน</th>
                                </tr>
                              </thead>
                              <tbody>
                                {work_exper.map((work) => (
                                  <tr key={work.no} className="bg-white border-b hover:bg-[#f1f0ff]">
                                    <td className="text-center p-2 text-[10px] md:text-sm lg:text-lg">{work.no}</td>
                                    <td className="text-center p-2 text-[10px] md:text-sm lg:text-lg">{work.position_name}</td>
                                    <td className="text-center p-2 text-[10px] md:text-sm lg:text-lg">{work.company}</td>
                                    <td className="text-center p-2 text-[10px] md:text-sm lg:text-lg">{work.duration}</td>
                                    <td className="text-center p-2 text-[10px] md:text-sm lg:text-lg">{work.job_description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <center>
  <div className="join items-center gap-2 mb-3">
    {workPage > 1 && (
      <button
        onClick={() => setWorkPage(workPage - 1)}
        className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
      >
        «
      </button>
    )}

    {Array.from({ length: workTotalPages || 0 }, (_, i) => i + 1).map((pageNum) => (
      <button
        key={pageNum}
        onClick={() => setWorkPage(pageNum)}
        className={`btn btn-xs rounded-3xl join-item transition-colors
          ${workPage === pageNum
            ? "bg-[#6C5CE7] border-[#6C5CE7] text-white hover:bg-[#5945c7]"
            : "bg-transparent border-white text-white hover:bg-white hover:text-[#6C5CE7]"}
        `}
      >
        {pageNum}
      </button>
    ))}

    {workPage < workTotalPages && (
      <button
        onClick={() => setWorkPage(workPage + 1)}
        className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
      >
        »
      </button>
    )}
  </div>
</center>

                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-[#7B6ADA] gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                      <AlertTriangle className="w-6 h-6  text-yellow-500" />
                      ยังไม่ได้ลงข้อมูลประสบการณ์การทำงานไว้
                    </div>
                  )}
                </div>
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:p-6 lg:p-8 shadow-md">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#7B6ADA] mb-4 flex items-center">
                  <FaGraduationCap className="mr-2" /> ประวัติการศึกษา
                </p>
                <div className="flex grid grid-cols-2 gap-5  overflow-y-auto max-h-[700px]">
                  {edu.map((jobber , index) => (
                    <div key={index} className="flex bg-white p-8 rounded-2xl justify-start">
                      <div className="space-y-3 flex flex-col text-[#7B6ADA] text-sm md:text-base lg:text-xl">
                        <div className="flex items-center">
                          <MdSchool className="mr-2" />
                          <b className="w-40 inline-block">ระดับการศึกษา:</b> {jobber.edu_name}
                        </div>

                        <div className="flex items-center">
                          <FaAward className="mr-2" />
                          <b className="w-40 inline-block">วุฒิการศึกษา:</b> {jobber.qualification}
                        </div>

                        <div className="flex items-center">
                          <FaUniversity className="mr-2" />
                          <b className="w-40 inline-block">สถาบัน:</b> {jobber.institution}
                        </div>

                        <div className="flex items-center">
                          <FaBook className="mr-2" />
                          <b className="w-40 inline-block">คณะ / สาขา:</b> {jobber.major}
                        </div>

                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          <b className="w-40 inline-block">วันที่จบการศึกษา:</b> {jobber.year_graduat}
                        </div>

                        <div className="flex items-center">
                          <FaAward className="mr-2" />
                          <b className="w-40 inline-block">เกรด / ผลการเรียน:</b> {jobber.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <center>
  <div className="join items-center gap-2 mb-3">
    {eduPage > 1 && (
      <button
        onClick={() => setEduPage(eduPage - 1)}
        className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
      >
        «
      </button>
    )}

    {Array.from({ length: eduTotalPages || 0 }, (_, i) => i + 1).map((pageNum) => (
      <button
        key={pageNum}
        onClick={() => setEduPage(pageNum)}
        className={`btn btn-xs rounded-3xl join-item transition-colors
          ${eduPage === pageNum
            ? "bg-[#6C5CE7] border-[#6C5CE7] text-white hover:bg-[#5945c7]"
            : "bg-transparent border-white text-white hover:bg-white hover:text-[#6C5CE7]"}
        `}
      >
        {pageNum}
      </button>
    ))}

    {eduPage < eduTotalPages && (
      <button
        onClick={() => setEduPage(eduPage + 1)}
        className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
      >
        »
      </button>
    )}
  </div>
</center>

              </div>
              


              

              <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold  text-[#7B6ADA] ml-2 mb-1">
                  ทักษะ
                </p>

                {/* กล่องพื้นหลังทักษะ */}
                <div className="p-4 text-[#7B6ADA]">
                  
                  {/* ทักษะด้านความรู้ */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 md:w-6 md:h-6" />
                      <p className="text-sm md:text-base lg:text-xl font-semibold">ทักษะด้านความรู้</p>
                    </div>

                    {hs.length > 0 ? (
                      hs.map((hs, index) => (
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

                    {ss.length > 0 ? (
                      ss.map((ss, index) => (
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
              </div>
              
             </div> 
        </div>
        )}

        {queryType === "volunteer" && (
          <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-30 lg:py-12 xl:px-50 xl:py-14">
          
              
              {/* กิจกรรมจิตอาสาที่สนใจ */}
              <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">กิจกรรมจิตอาสาที่สนใจ</p>
                {interests_volun.length > 0 ? (
                  <div className="flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-xl">
                      <div className="flex items-center justify-center w-full">
                        <div className="overflow-hidden rounded-2xl w-full">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-[#7B6ADA] text-white h-10">
                                <th className="text-center p-2">ที่</th>
                                <th className="text-center p-2">ประเภทกิจกรรมจิตอาสา</th>
                                <th className="text-center p-2">วัน เวลาที่สะดวก</th>
                              </tr>
                            </thead>
                            <tbody>
                              {interests_volun.map((volun, index) => (
                                <tr key={index + 1} className="bg-white border-b hover:bg-[#f1f0ff]">
                                  <td className="text-center align-middle p-2 text-[10px] md:text-sm lg:text-lg">{index + 1}</td>
                                  <td className="text-center align-middle p-2 text-[10px] md:text-sm lg:text-lg">{volun.voluntype_name}</td>
                                  <td className="text-center align-middle p-2 text-[10px] md:text-sm lg:text-lg">
                                    <a>{renderWorkSchedule(volun.days)}</a> {volun.hours} - {volun.end_hour} น.
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-[#7B6ADA] gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    ยังไม่ได้ลงข้อมูลกิจกรรมจิตอาสาที่สนใจไว้
                  </div>
                )}
              </div>

              {/* กิจกรรมที่จับคู่แล้ว */}
              <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">กิจกรรมที่จับคู่แล้ว</p>
                <div className="p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl">
                  <table className="w-full table-auto border-separate border-spacing-0 overflow-hidden rounded-3xl shadow-md">
                    <thead>
                      <tr>
                        <th className="bg-[#7B6ADA] text-white text-left p-3 text-xs font-bold lg:text-xl">
                          ทั้งหมด {volun_matchedCount} งาน
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {volun_matched.map((post) => (
                        <tr key={post.post_id} className="border-t border-gray-200">
                          <td className="p-4 text-[#7B6ADA] text-xs font-bold lg:text-xl">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">{post.activity_name || 'ตำแหน่งงาน'}</span>
                              <span className="text-[8px] md:text-sm text-right pt-1">
                                วันที่จับคู่ {post.date_time ? formatDateToThaiShort(post.date_time) : 'ไม่มีวันที่'}
                              </span>
                            </div>

                            <div className="mt-2 w-full">
                              <p className="text-[10px] md:text-sm text-[#7B6ADA] font-semibold mb-1">ค่าความตรงกับคุณสมบัติ</p>
                              <div className="w-full bg-[#C0BBEB] rounded-full h-7 relative overflow-hidden">
                                <div className="bg-[#7B6ADA] h-7 rounded-full" style={{ width: `${post.match}%` }}></div>
                                <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] md:text-xs font-bold">
                                  <span className="text-white">ตรง {post.match}%</span>
                                  <span className="text-[#7B6ADA]">ไม่ตรง {post.not_match}%</span>
                                </div>
                              </div>
                            </div>

                            {/* <div className="flex justify-end mt-2">
                              <button
                                onClick={() => goToVolunPost(post.post_id)}
                                className="btn btn-sm lg:btn-lg border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl"
                              >
                                รายละเอียดกิจกรรม
                              </button>
                            </div> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              
        </div>
        )}

        

        <Footer />
      </div>
    )
}

export default jobber_Pf