import { useLocation } from "react-router-dom";
import React, { useState , useEffect } from "react"

import { FaPhone, FaEnvelope, FaBriefcase, FaUserShield , FaAward, FaBook, FaCalendarAlt, FaCircle, FaGraduationCap, FaTrash, FaUniversity, FaCheckCircle, FaSearch, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import axios from "axios";
import Navbar from "../emp_comp/navbar";
import EmpRating from "../jobber_comp/emp_star";
import { MapView } from "../comp/map_view";
import Footer from "../emp_comp/footer";
import { MdSchool } from "react-icons/md";
import { AlertTriangle, Brain, Smile } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import LoadingOverlay from "../comp/LoadingOverlay";
import TiptapEditor from "../comp/tiptap";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Jobber_match() {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [applied, setApplied] = useState(false);
  const [showWork , setShowWork] =useState(0);  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ถ้าไม่มี token อาจ redirect ไป login

      window.location.href = "/login";
      return;
    }

    axios.get(`${apiUrl}/emp_profile`, { //error
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUserData(res.data.user);
      setUserId(res.data.user.emp_id);
      //console.log(res.data.user);
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
  const fromStack = location.state?.fromStack || [];
  const queryParams = new URLSearchParams(location.search);
  const post_id = queryParams.get("pi");
  const jobber_id = queryParams.get("ji");
  const inter_work_id = queryParams.get("inter_id");
  const almessage = queryParams.get("message");
  const matchPercent = queryParams.get("matchper");
  const status = queryParams.get("status");

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
    
  const [data, setData] = useState([]);
  const [jobberData , setJobberData] = useState([]);
  const [hs, setHS] = useState([]);
  const [ss, setSS] = useState([]);

  const [confirm , setConfirm] = useState("");

  //แบ่งหน้า
  const [limit, setLimit] = useState(4);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState([]);
  const [totalPages, setTotalPages] = useState({
    work: 0,
    interests: 0,
    edu: 0,
  });

  const [matchedAttributes, setMatchedAttributes] = useState([]);
  const [unmatchedAttributes, setUnmatchedAttributes] = useState([]);

  //ข้อมูลใส่โปรไฟล์
    const [jobber, setJobber] = useState([]);
    const [interests_work, setInterWork] = useState([]);
    const [Pfhs, setHs] = useState([]);
    const [Pfss, setSs] = useState([]);
    const [hd, setHd] = useState();
    const [interests_volun, setInterVolun] = useState([]);
    const [work_exper, setWorkExper] = useState([]);
    const [edu, setEdu] = useState([]);

    const [loading, setLoading] = useState(false);    

    const PFfetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/jobber_pf?jobber_id=${jobber_id}&page=${page}&limit=${limit}`);
      const result = await res.json();

      if (typeof result === 'object' && 
        'hd' in result ) {
        setHd(result.hd);
      } else {
        console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      }

      
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

//ต่อหน้านี้
  useEffect(() => {
          fetchData();
          PFfetchData();
        }, [post_id , jobber_id , page , limit]);
      
  useEffect(() => {
          MatchList_fetchData();
        }, [userData , post_id , jobber_id ]); //ต่อนี่ ดึงข้อมูลมาโชว์ แล้วให้แยก 0 กับ 1 แล้วเอางานมาโชว์ด้วย

  const fetchData = async () => {
    try {

      const res = await fetch(`${apiUrl}/jobpost?post_id=${post_id}`);
      const result = await res.json();
  
      if(Array.isArray(result.jobpost)){
          //console.log("sql", res)
          setData(result.jobpost);
        } else {
          console.error("Data format error:", result);
          setData([]);
        }
      if(Array.isArray(result.job_HS)){
          //console.log("sql", res)
          setHS(result.job_HS);
        } else {
          console.error("Data format error:", result);
          setHS([]);
        }
      if(Array.isArray(result.job_SS)){
          //console.log("sql", res)
          setSS(result.job_SS);
        } else {
          console.error("Data format error:", result);
          setSS([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const [jobber_year_expe, setYear] = useState("");
  const [edu_max, setEdu_max] = useState([]);
  const [matchList, setMatchList] = useState([]);
  const [hardskills, setHardskills] = useState([]);
  const [softskills, setSoftskills] = useState([]);

  const MatchList_fetchData = async () => {
    try {
      
      const res = await fetch(`${apiUrl}/job_matchlist?jobber_id=${jobber_id}&post_id=${post_id}&inter_work_id=${inter_work_id}`);
      const result = await res.json();

// SELECT tempWork.* , salary , hour , end_hour , days , tambon_name as tb , ampher_name as ap , jangwat_name as jw , age , gender , LG , year_expe , edu_name FROM tempWork LEFT JOIN job_posting on tempWork.post_id = job_posting.post_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN education_level on job_posting.education_code = education_level.edu_id
        if (result.matchList && Array.isArray(result.matchList)) {
          setMatchList(result.matchList);
        } else {
          setMatchList([]); // ถ้าไม่มีข้อมูลให้ตั้งเป็น array ว่าง
        }
        if (result.hardskills && Array.isArray(result.hardskills)) {
          setHardskills(result.hardskills);
        } else {
          setHardskills([]); // ถ้าไม่มีข้อมูลให้ตั้งเป็น array ว่าง
        }

        if (result.softskills && Array.isArray(result.softskills)) {
          setSoftskills(result.softskills);
        } else {
          setSoftskills([]); // ถ้าไม่มีข้อมูลให้ตั้งเป็น array ว่าง
        }

        setEdu_max(result.edu_max);
        setYear(result.workYearExpe);
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };


  useEffect(() => {
    if (!matchList || matchList.length === 0) return;

    const matchStr = matchList[0].matching;
    if (!matchStr || matchStr.length !== 8) return;
        //console.log("edu_max = ",edu_max);
    const fields = [
      { label: 'ค่าแรง', job:`${data[0]?.salary}` , value: `${matchList[0].salary_min} - ${matchList[0].salary_max} บาท` },
      { label: 'เวลา', job:`${data[0].hour} - ${data[0].end_hour} น.`, value: `${matchList[0].hour} - ${matchList[0].end_hour} น.` },
      { label: 'วันทำงาน', job: renderWorkSchedule(data[0].days), value: renderWorkSchedule(matchList[0].days) },
      { label: 'สถานที่', job:`ต.${data[0].tb} อ.${data[0].ap}`, value: `ต.${matchList[0].tb} อ.${matchList[0].ap}` },
      { label: 'อายุ', job:`${data[0]?.age}`, value: calculateAge(matchList[0].birthday) + ' ปี' },
      { label: 'เพศ', job:`${data[0].gender === 'M' ? 'ชาย' : matchList[0].gender === 'F' ? 'หญิง' : 'ไม่ระบุ'}`, value: matchList[0].gender === 'M' ? 'ชาย' : matchList[0].gender === 'F' ? 'หญิง' : 'ไม่ระบุ' },
      { label: 'ประสบการณ์', job:`${data[0]?.year_expe} ปี`, value: `${jobber_year_expe} ปี` },
      { label: 'การศึกษา', job:`${data[0]?.edu_name}`, value: matchStr[7] === '1' ? `${data[0]?.edu_name}` : edu_max }
    ];

    const matched = [];
    const unmatched = [];

    matchStr.split('').forEach((ch, index) => {
      if (ch === '1') {
        matched.push(fields[index]);
      } else if (ch === '0') {
        unmatched.push(fields[index]);
      }
    });

    setMatchedAttributes(matched);
    setUnmatchedAttributes(unmatched);
  }, [matchList, edu_max, jobber_year_expe]);

  function calculateAge(birthday) {
    if (!birthday) return '-';
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  function formatDateToThaiShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
    const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

    return `${day}/${month}/${year}`;
  }

  const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

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


const unmatchedHardskills = hs.filter(skill => !hardskills.includes(skill.hardskill_name)).map(skill => skill.hardskill_name);
const unmatchedSoftskills = ss.filter(skill => !softskills.includes(skill.softskill_name)).map(skill => skill.softskill_name);
// console.log("hs =", hs);
// console.log("hardskills =", hardskills);
// console.log("unmatchedHardskills =", unmatchedHardskills);
4
useEffect(() => {
  if (userId && post_id && jobber_id) {
    checkIfApplied();
    jobberDataFetchData();
  }
}, [userId, post_id , jobber_id]);

async function checkIfApplied() {
  try {
    const res = await fetch(`${apiUrl}/api/check-apply?jobber_id=${jobber_id}&post_id=${post_id}`);
    const data = await res.json();
    setApplied(data.applied); // true = สมัครแล้ว
  } catch (error) {
    console.error("Error checking apply status:", error);
  }
}

const [jobberHsData , setJobberHsData] = useState([]);
const [jobberSsData , setJobberSsData] = useState([]);
const jobberDataFetchData = async () => {
    try {
      
      const res = await fetch(`${apiUrl}/user_profile?jobber_id=${jobber_id}`);
      const reshs = await fetch(`${apiUrl}/user_hardskill?jobber_id=${jobber_id}`);
      const resss = await fetch(`${apiUrl}/user_softskill?jobber_id=${jobber_id}`);
      const result = await res.json();
      const resulths = await reshs.json();
      const resultss = await resss.json();

// SELECT tempWork.* , salary , hour , end_hour , days , tambon_name as tb , ampher_name as ap , jangwat_name as jw , age , gender , LG , year_expe , edu_name FROM tempWork LEFT JOIN job_posting on tempWork.post_id = job_posting.post_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN education_level on job_posting.education_code = education_level.edu_id
        if (result.data && Array.isArray(result.data)) {
          setJobberData(result.data);
          // console.log("ลองหน่อยโปรไฟล์ผู็สมัครงาน",result.data);
        } else {
          setJobberData([]); // ถ้าไม่มีข้อมูลให้ตั้งเป็น array ว่าง
        }
        if (resulths.data && Array.isArray(resulths.data)) {
          setJobberHsData(resulths.data);
        } else {
          setJobberHsData([]);
        }
        if (resultss.data && Array.isArray(resultss.data)) {
          setJobberSsData(resultss.data);
        } else {
          setJobberSsData([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };
  
const jobberhsFetchData = async () => {
    try {
      
      const res = await fetch(`${apiUrl}/user_hardskill?jobber_id=${jobber_id}`);
      const result = await res.json();

// SELECT tempWork.* , salary , hour , end_hour , days , tambon_name as tb , ampher_name as ap , jangwat_name as jw , age , gender , LG , year_expe , edu_name FROM tempWork LEFT JOIN job_posting on tempWork.post_id = job_posting.post_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN education_level on job_posting.education_code = education_level.edu_id
        if (result.data && Array.isArray(result.data)) {
          setJobberData(result.data);
        } else {
          setJobberData([]); // ถ้าไม่มีข้อมูลให้ตั้งเป็น array ว่าง
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const [activeTab, setActiveTab] = useState("info");

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
    const [selectedJobberId, setSelectedJobberId] = useState(null);
    const [message, setMessage] = useState("");


    return (
      <main>
        <div>
          {userData && <Navbar user={userData} />}
                    <div
                      className="relative w-full h-70 bg-cover bg-bottom"
                      style={{ backgroundImage: "url('/empty.png')" }}
                    >
                      <button
                        onClick={() => navigate(-1)}
                        className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl border-white p-2 md:p-3 lg:p-4 xl:p-5 bg-white text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl absolute top-4 left-4"
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="6">
                          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <div className="flex  justify-between gap-5 w-3/4 absolute top-8 left-1/8 text-white">
                        <div className="flex items-start w-auto space-x-6">
                                            <div className="w-50 h-50">
                                              {jobberData?.[0]?.picture ? (
                                                <img src={`/uploads/user_pic/${jobberData?.[0]?.picture}`}  className="w-full h-full object-cover rounded-3xl" />
                                              ) : (
                                                <img src={`/uploads/nopic.png`}  className="w-full h-full object-cover rounded-3xl" />
                                              )}
                                            </div>
                                          </div>
                                            {/* ข้อมูลฝั่งซ้าย */}
                                            <div className="flex flex-col justify-center items-start w-3/4 text-sm text-gray-700 gap-8">
                                              <div className="flex items-center gap-10">
                                                <h2 className="font-semibold text-white text-4xl">
                                                  คุณ {jobberData?.[0]?.fullname}
                                                </h2>
                                               
                                                <button 
                                                  onClick={() => {
                                                    setShowWork(prev => {
                                                      const next = prev === 1 ? 0 : 1;
                                                      // ถ้าค่าต่อไปคือ 1 (แสดงรายละเอียด) ค่อยเลื่อน
                                                      if (next === 1) {
                                                        // ใช้ setTimeout เพื่อให้ React render เสร็จก่อนแล้วค่อยเลื่อน
                                                        setTimeout(() => {
                                                          document.getElementById("section1")?.scrollIntoView({ behavior: "smooth" });
                                                        }, 0);
                                                      }
                                                      return next;
                                                    });
                                                  }}
                                                  className="btn btn-xs sm:btn-sm lg:btn-lg border border-white bg-white text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition hover:bg-[#7B6ADA] hover:text-white"
                                                >
                                                  {showWork === 1 ? 'ซ่อนโปรไฟล์' : 'ดูโปรไฟล์'}
                                                </button>
                                              </div>

                                              <div className="flex flex-col items-center justify-center w-full items-start gap-7 ml-4">
                                                <div className="flex items-center justify-start gap-25 w-full space-x-2">
                                                  <div className="flex">
                                                    <span className="text-2xl text-white">●</span>
                                                    <p className="text-2xl text-white font-bold ml-2">อายุ</p>
                                                  </div>
                                                  <p className="text-2xl text-white font-bold">{calculateAge(jobberData?.[0]?.birthday)} ปี</p>
                                                </div>
                                                <div className="flex items-center justify-start gap-25 w-full space-x-2">
                                                  <div className="flex ">
                                                    <span className="text-2xl text-white">●</span>
                                                    <p className="text-2xl text-white font-bold ml-2">ที่อยู่</p>
                                                  </div>
                                                  <p className="text-2xl text-white font-bold">ต. {jobberData?.[0]?.tb} อ. {jobberData?.[0]?.ap} จ. {jobberData?.[0]?.jw}</p>
                                                </div>
                                                
                                              </div>
                                            
                                          </div>

                                          {/* ฝั่งขวา */}
                                          <div className="flex flex-col justify-center items-center w-1/6 gap-5">
                                            <div className="">
                                              <p className="text-white text-lg">ความสอดคล้อง</p>
                                              <p className="text-8xl font-bold text-white">{matchPercent}%</p>
                                            </div>
                                            
                                          </div>
                      </div>
                    </div>

          {/* โปรไฟล์ */}
          {showWork === 1 && (
            <>
              <div className="flex justify-center items-center bg-white">
                <FaUserCircle className="w-8 h-8 text-[#8E80FF] mx-5" />
                <h1 className=" py-5 text-2xl text-[#8E80FF] font-bold">โปรไฟล์</h1>
              </div>
              <div className="bg-white px-5 pb-1 md:px-15 lg:px-30  xl:px-50">
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
                      <div className="flex flex-col bg-[#8E80FF] rounded-b-3xl rounded-tr-3xl p-5 mb-5">
                        {jobber.length > 0 ? (
                          <div className="flex flex-col bg-white rounded-3xl justify-center items-center">
                            
                              {/* ชื่อ */}
                              <div className="flex mt-4 text-center">
                                <div>
                                  <h2 className="text-2xl font-bold text-[#8E80FF]">{jobber?.[0]?.fullname}</h2>
                                  <p className="text-sm text-[#8E80FF]">{jobber?.[0]?.fullname_eng}</p>
                                  
                                </div>
                                <div className="opacity-10 ">
                                  {jobber?.[0]?.gender === "M"
                                    ? <img src='/man.png' className='w-10 mt-2' />
                                    : jobber?.[0]?.gender === "F"
                                    ? <img src='/woman.png' className='w-10 rotate-50 -mt-1' />
                                    : ""}
                                              
                                </div>
                              </div>
                              

                              {/* ข้อมูลติดต่อ */}
                              <div className=" rounded-xl p-4 w-full text-gray-700">
                                <div className="grid grid-cols-4 gap-4">
                                    {/* Card 1 */}
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                      <FaPhone className="inline-block mr-1 text-[#8E80FF]" />
                                      <div>
                                        <p className="text-xs text-gray-500">เบอร์โทร</p>
                                        <p className="font-semibold text-gray-700">{jobber?.[0]?.phone}</p>
                                      </div>
                                    </div>

                                    {/* Card 2 */}
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                      <FaEnvelope className="inline-block mr-1 text-[#8E80FF]" />
                                      <div>
                                        <p className="text-xs text-gray-500">อีเมล</p>
                                        <p className="font-semibold text-gray-700">{jobber?.[0]?.email}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Card 3 */}
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                      <FaBriefcase className="inline-block mr-1 text-[#8E80FF]" />
                                      <div>
                                        <p className="text-xs text-gray-500">สถานะการทำงาน</p>
                                        <p className="font-semibold text-gray-700">
                                          {(jobber?.[0]?.work_status) === "JOB" ? (
                                            <a className="flex items-center gap-2 text-green-500">
                                              ได้งานแล้ว
                                              <FaCheckCircle className="text-green-500" />
                                            </a>
                                          ) : (
                                            <a className="flex items-center gap-2 text-[#8E80FF]">
                                              หางานอยู่
                                              <FaSearch className="text-[#8E80FF]" />
                                              
                                            </a>
                                          )}                                          
                                        </p>
                                      </div>
                                    </div>

                                    {/* Card 4 */}
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                      <FaUserShield className="inline-block mr-1 text-[#8E80FF]" />
                                      <div>
                                        <p className="text-xs text-gray-500">สถานะบัญชี</p>
                                        <p className="font-semibold text-gray-700">
                                          {(jobber?.[0]?.status) === "ON" ? (
                                            <a className="flex items-center gap-2 text-[#8E80FF]">
                                              ใช้งานปกติ
                                              <FaCheckCircle className="text-[#8E80FF]" />
                                            </a>
                                          ) : (
                                            <a className="flex items-center gap-2 text-red-500">
                                              ถูกระงับ
                                              <FaTimesCircle className="text-red-500" />
                                              
                                            </a>
                                          )}  
                                        </p>
                                      </div>
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
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            ยังไม่ได้ลงข้อมูลงานที่สนใจไว้
                          </div>
                        )}
                      </div>

                    )}

                    {activeTab === "work" && (
                      <div className="flex flex-col bg-[#8E80FF] rounded-b-3xl rounded-tr-3xl p-5 mb-5">
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
                          <div className="flex items-center justify-center text-[#7B6ADA] gap-2 text-sm md:text-lg lg:text-xl font-semibold mt-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
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
                      <div className="flex flex-col bg-[#8E80FF] rounded-b-3xl rounded-tr-3xl p-5 mb-5">
                        
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
            

            </>
          )}
            

          {/* <center><h1>Job post {id}</h1></center> */}
          <div className="bg-white text-[#8E80FF] w-full flex flex-col gap-2 px-5 pb-5 md:px-20 md:pb-7 lg:px-35 lg:pb-14 xl:py-2"> 
              
            <div className="flex flex-col justify-center items-center">
              <button className="btn btn-xs md:btn-sm lg:btn-lg text-2xl w-30 p-2 md:p-3 lg:p-4 xl:p-5 bg-[#8E80FF] border border-[#8E80FF] my-4 rounded-xl">
                จับคู่กับ
              </button>
              <div>
                <p>ตำแหน่งงาน</p>
                <p className="text-xs md:text-xl lg:text-3xl font-bold">
                  {data[0]?.position_name}
                </p>
              </div>
              
            </div>
            <div className="flex justify-center mt-2">
            <p className="text-[8px] md:text-sm lg:text-xl font-bold">
                วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}
            </p>
            </div>

            <div className="flex justify-center gap-3">
              <div className="flex flex-col items-center gap-3">         
                    {/* <button
                      // onClick={() => handleApplyToggle(parseInt(id))}
                      onClick={() => {
                        if (applied) {
                          document.getElementById("cancel_modal").showModal();
                        } else {
                          document.getElementById("apply_modal").showModal();
                        }                      
                      }}
                      className={`btn btn-xs md:btn-sm lg:btn-lg  w-30 p-2 md:p-3 lg:p-4 xl:p-5 ${applied ? "bg-red-500 border-red-500" : "bg-green-500 border-green-500"} text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl`}
                    >
                      {applied ? "ยกเลิก" : "สมัคร"}
                    </button>
                    <a>{applied ? "ท่านสามารถยกเลิกการสมัครได้ หากเปลี่ยนความประสงค์" : "โปรดตรวจสอบรายละเอียดงานให้ครบถ้วนก่อนกดสมัคร"}</a> */}
                  </div> 
            
            </div>
        </div>


          <div className="bg-white text-[#8E80FF] px-5 py-3 md:px-15  lg:px-25  xl:px-35">
            <div className="flex gap-4 w-full py-2 md:py-4 lg:py-6">

              <div className="w-1/2">
                <div className="flex items-end justify-between">
                  <h2 className="text-green-500 text-lg md:text-2xl lg:text-3xl font-bold mb-4">
                    คุณสมบัติที่สอดคล้องกัน
                  </h2>
                  
                </div>
                <div className="flex flex-col gap-4">
                  {matchedAttributes.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center md:flex-row gap-3 md:gap-6 bg-green-50 rounded-2xl p-4 pl-15 shadow"
                    >
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-400">งานต้องการ</p>
                        <p className="text-[#8E80FF] text-base md:text-lg">
                          {item.label}: <span className="text-green-600">{item.job}</span>
                        </p>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-400">คุณสมบัติของผู้สมัคร</p>
                        <p className="text-gray-800 text-base md:text-lg">{item.value}</p>
                      </div>
                    </div>
                  ))}

                  {hardskills.length > 0 && (
                    <div className="bg-green-50 rounded-2xl p-4 shadow pl-15">
                      <p className="text-sm font-bold text-gray-600 mb-2">ทักษะด้านความรู้ที่ตรง</p>
                      {hardskills.map((skill, index) => (
                        <p key={index} className="text-gray-800">{index + 1}. {skill}</p>
                      ))}
                    </div>
                  )}

                  {softskills.length > 0 && (
                    <div className="bg-green-50 rounded-2xl p-4 shadow pl-15">
                      <p className="text-sm font-bold text-gray-600 mb-2">ทักษะด้านอารมณ์ที่ตรง</p>
                      {softskills.map((skill, index) => (
                        <p key={index} className="text-gray-800">{index + 1}. {skill}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              {/* คุณสมบัติที่ไม่สอดคล้องกัน */}
              <div className="w-1/2">
                <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-red-500 mb-4">
                  คุณสมบัติที่ไม่สอดคล้องกัน
                </h2>

                <div className="flex flex-col gap-4">
                  {unmatchedAttributes.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-row gap-3 md:gap-6 pl-15 bg-red-50 rounded-2xl p-4 shadow"
                    >
                      {/* งานต้องการ */}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-400">งานต้องการ</p>
                        <p className="text-gray-600 text-base md:text-lg">
                          {item.label}: <span className="text-red-600">{item.job}</span>
                        </p>
                      </div>
                      {/* คุณสมบัติของคุณ */}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-400">คุณสมบัติของผู้สมัคร</p>
                        <p className="text-gray-800 text-base md:text-lg">{item.value}</p>
                      </div>
                    </div>
                  ))}

                  {unmatchedHardskills.length > 0 && (
                    <div className="bg-red-50 rounded-2xl p-4 shadow pl-15">
                      <p className="text-sm font-bold text-gray-600 mb-2">ทักษะด้านความรู้ที่ไม่ตรง</p>
                      {unmatchedHardskills.map((skill, index) => (
                        <p key={index} className="text-gray-800">{index + 1}. {skill}</p>
                      ))}
                    </div>
                  )}

                  {unmatchedSoftskills.length > 0 && (
                    <div className="bg-red-50 rounded-2xl p-4 shadow pl-15">
                      <p className="text-sm font-bold text-gray-600 mb-2">ทักษะด้านอารมณ์ที่ไม่ตรง</p>
                      {unmatchedSoftskills.map((skill, index) => (
                        <p key={index} className="text-gray-800">{index + 1}. {skill}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              </div>
            </div>

          <div className="flex flex-col w-full bg-white p-4 items-center">
            <hr className="w-1/2 border border-[#D9D9D9] mb-2" />
            <div className="flex gap-3">
              {/* {status} */}
              {(status === "waitemp" || status === "" || status === "null") && (
                  <>
                    <button
                      className="btn btn-xs sm:btn-sm lg:btn-lg border border-green-500 bg-green-500 text-white hover:border-green-500 hover:bg-white hover:!text-green-500 rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition "
                      onClick={() => {
                        // เปิด modal เลือก
                        document.getElementById("choose_modal").showModal();
                      }}
                    >
                      เลือก
                    </button>
                    <button
                      className="btn btn-xs sm:btn-sm lg:btn-lg border border-red-500 bg-red-500 text-white hover:border-red-500 hover:bg-white hover:!text-red-500 rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition "
                      onClick={() => {
                        // เปิด modal ปฏิเสธ
                        document.getElementById("reject_modal").showModal();
                      }}
                    >
                      ปฏิเสธ
                    </button>
                  </>
                )}
                {(status === "waitjobber") && (
                  <>
                    
                    <button
                      className="btn btn-xs sm:btn-sm lg:btn-lg border border-red-500 bg-red-500 text-white hover:border-red-500 hover:bg-white hover:!text-red-500 rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition "
                      onClick={() => {
                        // เปิด modal ปฏิเสธ
                        document.getElementById("cancelchoose_modal").showModal();
                      }}
                    >
                      ยกเลิกการเลือก
                    </button>
                  </>
                )}
              <div className="tooltip" data-tip="กลับไปยังหน้าก่อนหน้า">
                <button 
                  onClick={() => navigate(-1)}
                  className="btn btn-xs sm:btn-sm lg:btn-lg border border-[#8E80FF] bg-[#8E80FF] text-white hover:border-[#8E80FF] hover:bg-white hover:!text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition"
                >
                  ย้อนกลับ
                </button>                
              </div>
            </div>  

          </div>

          

          <Footer />
          
        </div>
        {/* Modal เลือกผู้สมัครพร้อมส่งข้อความ */}
                <dialog id="choose_modal" className="modal">
                  <div className="modal-box bg-white max-w-6xl w-full">
                    <div className="flex flex-col items-center">
                      <p className="text-4xl font-bold text-[#8E80FF]">ส่งข้อความถึงผู้สมัคร</p>
                      
                      <div className="w-full flex flex-col items-center justify-center my-6">
                        <TiptapEditor
                          value={message}
                          onEditorChange={(content) => setMessage(content)}
                        /> 
                        
                        {/* <div className="flex flex-col w-1/2 mt-5">
                          <p className="text-[#8E80FF] ">ยืนยันการเลือกผู้สมัครโดยการพิมพ์คำว่า ยืนยัน</p>
                          <input 
                            type='text'
                            className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                            name="confirm"
                            placeholder='พิมพ์คำว่า ยืนยัน เพื่อส่งข้อความถึงผู้สมัครที่คุณเลือก'
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                          />
                        </div> */}
                      </div>
                    </div>   
                    <p className="text-lg text-[#8E80FF] text-center">
                        โปรดตรวจสอบข้อความของคุณให้เรียบร้อยก่อนกดยืนยัน
                        เนื่องจากหลังจากยืนยันแล้วจะไม่สามารถแก้ไขหข้อความได้
                      </p>
                    <div className="modal-action flex justify-center gap-4">
                      <button 
                        type="button"
                        className={`btn px-4 py-2 rounded-lg bg-green-500 border border-green-500 text-white`}
                        disabled={message === ""} // disable ถ้าไม่ตรง
                        onClick={() => document.getElementById("conchoose_modal").showModal()}
                      >
                        ยืนยัน
                      </button>
        
                      <button 
                        type="button"
                        className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                        onClick={() => document.getElementById("choose_modal").close()}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </dialog>
        {/* Modal คอนการเลือก */}
                    <dialog id="conchoose_modal" className="modal">
                    <div className="modal-box bg-white">
                        <center>
                            <p className="text-2xl font-bold text-green-500 p-5">ยืนยันที่จะส่งข้อความให้ผู้สมัครที่คุณเลือก</p>
                        
                            <div className="flex flex-col w-full">
                                {/* <p className="text-[#8E80FF] ">ยืนยันการเลือกผู้สมัคร</p> */}
                                <input 
                                  type='text'
                                  className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                  name="confirm"
                                  placeholder='พิมพ์คำว่า ยืนยัน เพื่อเลือกผู้สมัครคนนี้'
                                  value={confirm}
                                  onChange={(e) => setConfirm(e.target.value)}
                                  required
                                />
                              </div>
                        
                        </center>   
                        <div className="modal-action flex justify-center gap-4">
                          {selectedJobberId}
                          <button 
                        type="button"
                        className={`btn px-4 py-2 rounded-lg ${confirm === "ยืนยัน" ? "bg-green-500 border border-green-500 text-white" : "bg-gray-300 border border-gray-300 text-black cursor-not-allowed"}`}
                        disabled={confirm !== "ยืนยัน"} // disable ถ้าไม่ตรง
                        onClick={async () => {
                          try {
                            setLoading(true);
                            // const expireDate = new Date();
                            // expireDate.setDate(expireDate.getDate() + 3); 
                            // const expireDateString = expireDate.toISOString();
        
                            const res = await fetch(`${apiUrl}/api/send_message`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                post_id: post_id,
                                jobber_id: jobber_id,
                                message: message,
                                type: "m",
                                status: "waitjobber"
                              })
                            });
        
                            const data = await res.json();
                            if (data.success) {
                              // alert("ส่งข้อความสำเร็จ!");
                              setMessage("");
                              setSelectedJobberId(null);
                              setConfirm("");

                              navigate(`/Emp_Job_Post?pi=${post_id}`);
                              document.getElementById("conchoose_modal").close();
                              document.getElementById("choose_modal").close();
                              
                              
                            } else {
                              // alert("เกิดข้อผิดพลาด: " + data.error);
                            }
                          } catch (error) {
                            console.error("Error:", error);
                            // alert("ส่งไม่สำเร็จ");
                          }  finally {
                                        setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                      }
                        }}
                      >
                        ยืนยัน
                      </button>
        
                          <button 
                            type="button"
                            className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                            onClick={() => {
                              document.getElementById("conchoose_modal").close()
                            }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                    </div>
                    {loading && <LoadingOverlay />}
                    </dialog>
                {/* Modal ปฏิเสธ */}
                    <dialog id="reject_modal" className="modal">
                    <div className="modal-box bg-white">
                        <center>
                            <p className="text-3xl font-bold text-red-500 p-5">ยืนยันที่จะปฏิเสธผู้สมัครคนนี้</p>
                        
                            <div className="flex flex-col w-full">
                                {/* <p className="text-[#8E80FF] ">ยืนยันการเลือกผู้สมัคร</p> */}
                                {/* <input 
                                  type='text'
                                  className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                  name="confirm"
                                  placeholder='พิมพ์คำว่า ยืนยัน เพื่อปฏิเสธผู้สมัครคนนี้'
                                  value={confirm}
                                  onChange={(e) => setConfirm(e.target.value)}
                                  required
                                /> */}
                              </div>
                        
                        </center>   
                        <div className="modal-action flex justify-center gap-4">
                          {selectedJobberId}
                          <button 
                            type="button"
                            className={`btn px-4 py-2 rounded-lg bg-red-700 border border-red-300 text-white cursor-not-allowed`}
                            
                            onClick={async () => {
                               try {
                                setLoading(true);
                                const res = await fetch(`${apiUrl}/api/send_message`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json"
                                  },
                                  body: JSON.stringify({
                                    post_id: post_id,
                                    jobber_id: jobber_id,
                                    status: "rejected"
                                  })
                                });
        
                                const data = await res.json();
                                if (data.success) {
                                  // alert("ปฏิเสธสำเร็จ!");
                                  setSelectedJobberId(null);

                                  navigate(`/Emp_Job_Post?pi=${post_id}`);

                                  document.getElementById("reject_modal").close();
                                  
                                  
                                } else {
                                  // alert("เกิดข้อผิดพลาด: " + data.error);
                                }
                              } catch (error) {
                                console.error("Error:", error);
                                // alert("ส่งไม่สำเร็จ");
                              } finally {
                                        setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                      }
                            }}
                          >
                            ยืนยัน
                          </button>
        
                          <button 
                            type="button"
                            className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                            onClick={() => {
                              document.getElementById("reject_modal").close()
                            }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                    </div>
                    {loading && <LoadingOverlay />}
                    </dialog>

       {/* Modal ยกเลิกการเลือก */} 
       {/* ทำตรงนี้ต่อ ทำปุ่มให้ยกเลิก ดึงข้อความมาใส่ แก้ไขข้อความไม่ได้ ใให้ยกเลิกเอา ทำเอพีไอยกเลิกดวยแจ้งเตือนด้วย */}
                    <dialog id="cancelchoose_modal" className="modal">
                    <div className="modal-box bg-white">
                        <center>
                            <p className="text-3xl font-bold text-red-500 p-5">ต้องการยกเลิกการเลือกหรือไม่?</p>
                        
                            <div className="flex flex-col items-center  w-full">
                                <p className="text-[#8E80FF] ">ข้อความที่คุณเคยส่งให้ผู้สมัคร</p>
                                <div
                                  className="prose prose-sm md:prose lg:prose-lg rounded-xl p-4 text-[#8E80FF]" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                  dangerouslySetInnerHTML={{ __html: almessage }}
                                ></div>
                              </div>
                        
                        </center>   
                        <div className="modal-action flex justify-center gap-4">
                          {selectedJobberId}
                          <button 
                            type="button"
                            className={`btn px-4 py-2 rounded-lg bg-red-500 border border-red-500 text-white`}
                            onClick={() => {
                              document.getElementById("concon_modal").showModal()
                            }}
                          >
                            ยืนยัน
                          </button>
        
                          <button 
                            type="button"
                            className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                            onClick={() => {
                              document.getElementById("cancelchoose_modal").close()
                            }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                    </div>
                    </dialog>
                  <dialog id="concon_modal" className="modal">
                    <div className="modal-box bg-white">
                        <center>
                            <p className="text-3xl font-bold text-red-500 p-5">ยืนยันการยกเลิกการเลือกหรือไม่?</p>
                        
                        </center>   
                        <div className="modal-action flex justify-center gap-4">
                          {selectedJobberId}
                          <button 
                            type="button"
                            className={`btn px-4 py-2 rounded-lg bg-green-500 border border-green-500 text-white`}
                            onClick={async () => {
                               try {
                                setLoading(true);
                                const res = await fetch(`${apiUrl}/api/send_message`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json"
                                  },
                                  body: JSON.stringify({
                                    post_id: post_id,
                                    jobber_id: jobber_id,
                                    status: "waitemp"
                                  })
                                });
        
                                const data = await res.json();
                                if (data.success) {
                                  // alert("ยกเลิกการเลือก!");
                                  setSelectedJobberId(null);

                                  navigate(`/Emp_Job_Post?pi=${post_id}`);

                                  document.getElementById("concon_modal").close();
                                  document.getElementById("cancelchoose_modal").close();
                                  
                                } else {
                                  // alert("เกิดข้อผิดพลาด: " + data.error);
                                }
                              } catch (error) {
                                console.error("Error:", error);
                                //alert("ส่งไม่สำเร็จ");
                              }  finally {
                                        setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                      }
                            }}
                          >
                            ยืนยัน
                          </button>
        
                          <button 
                            type="button"
                            className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                            onClick={() => {
                              document.getElementById("cancelchoose_modal").close()
                            }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                    </div>
                    {loading && <LoadingOverlay />}
                    </dialog>
      </main>
    )
}

export default Jobber_match