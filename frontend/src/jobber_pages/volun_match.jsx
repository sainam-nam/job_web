import { useLocation } from "react-router-dom";
import React, { useState , useEffect, useRef } from "react"

import { FaCircle, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import axios from "axios";
import Navbar from "../jobber_comp/navbar";
import EmpRating from "../jobber_comp/emp_star";
import { MapView } from "../comp/map_view";
import Footer from "../jobber_comp/footer";
import { FaHeart } from "react-icons/fa";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Volun_Match() {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [applied, setApplied] = useState(false);
  const [favorite, setFavorite] = useState(false);

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
      setUserId(res.data.user.jobber_id);
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
  const id = queryParams.get("i");
  const inter_volun_id = queryParams.get("inter_volun");
  const position_id = queryParams.get("posi");
  const matchPercent = queryParams.get("percent");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
    
  const [data, setData] = useState([]);
  const [hs, setHS] = useState([]);
  const [ss, setSS] = useState([]);

  const [matchedAttributes, setMatchedAttributes] = useState([]);
  const [unmatchedAttributes, setUnmatchedAttributes] = useState([]);

  useEffect(() => {
          fetchData();
        }, [id]);
      
  useEffect(() => {
      if(userId){
        MatchList_fetchData();
      }
          
        }, [userId , id , inter_volun_id]); //ต่อนี่ ดึงข้อมูลมาโชว์ แล้วให้แยก 0 กับ 1 แล้วเอางานมาโชว์ด้วย

  const fetchData = async () => {
    try {

      const res = await fetch(`${apiUrl}/volunpost?post_id=${id}`);
      const result = await res.json();
  
      // if (typeof result === 'object' && 'jobCount' in result && 'volunteerCount' in result && 'jobTypeCount' in result) {
      //   setJobCount(result.jobCount);
      //   setVolunteerCount(result.volunteerCount);
      //   setJobTypeCount(result.jobTypeCount);
      //   setVolunTypeCount(result.volunTypeCount);
      // } else {
      //   console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      // }
      if(Array.isArray(result.volunpost)){
          //console.log("sql", res)
          setData(result.volunpost);
        } else {
          console.error("Data format error:", result);
          setData([]);
        }
      if(Array.isArray(result.volun_HS)){
          //console.log("sql", res)
          setHS(result.volun_HS);
        } else {
          console.error("Data format error:", result);
          setHS([]);
        }
      if(Array.isArray(result.volun_SS)){
          //console.log("sql", res)
          setSS(result.volun_SS);
        } else {
          console.error("Data format error:", result);
          setSS([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const [matchList, setMatchList] = useState([]);
  const [hardskills, setHardskills] = useState([]);
  const [softskills, setSoftskills] = useState([]);
  const [showDe , setShowDe] = useState(false);

  const MatchList_fetchData = async () => {
    try {
      
      const res = await fetch(`${apiUrl}/volun_matchlist?jobber_id=${userId}&post_id=${id}&inter_volun_id=${inter_volun_id}&position_id=${position_id}`);
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

  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    if (!matchList || matchList.length === 0) return;

    const matchStr = matchList[0].matching;
    if (!matchStr || matchStr.length !== 3) return;
    const fields = [
      { label: 'เวลา', volun:`${data[0].time} น.`, value: `${matchList[0].hours} - ${matchList[0].end_hour} น.` },
      { label: 'อายุ', volun:`${data[0]?.age}`, value: calculateAge(matchList[0].birthday) + ' ปี' },
      { label: 'เพศ', volun:`${data[0].gender === 'M' ? 'ชาย' : matchList[0].gender === 'F' ? 'หญิง' : 'ไม่ระบุ'}`, value: matchList[0].gender === 'M' ? 'ชาย' : matchList[0].gender === 'F' ? 'หญิง' : 'ไม่ระบุ' },
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
  }, [matchList]);

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


 const goToProfile = (val) => {
    navigate(`/viewEmp_Pf?emp_id=${val}`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };

  

const unmatchedHardskills = hs.filter(skill => !hardskills.includes(skill.hardskill_name)).map(skill => skill.hardskill_name);
const unmatchedSoftskills = ss.filter(skill => !softskills.includes(skill.softskill_name)).map(skill => skill.softskill_name);
// console.log("hs =", hs);
// console.log("hardskills =", hardskills);
// console.log("unmatchedHardskills =", unmatchedHardskills);
const [status , setStatus] = useState('');
const [expire_time , setExpire_time] = useState('');
const [message , setMessage] = useState('');

useEffect(() => {
  if (userId && id) {
    checkIfApplied();
    checkstatus();
  }
}, [userId, id]); // รอให้ค่าเต็มก่อนค่อยยิง

async function checkstatus() {
  try {
    const res = await fetch(`${apiUrl}/api/check-applyvolun?jobber_id=${userId}&post_id=${id}`);
    const data = await res.json();
    
    console.log('data from api', data);

    if (data.results) {
      setStatus(data.results.status || '');
      setExpire_time(data.results.expire_time || '');
      setMessage(data.results.message || '');
    }
  } catch (error) {
    console.error("Error checking apply status:", error);
  }
}

async function checkIfApplied() {
  try {
    const res = await fetch(`${apiUrl}/api/check-applyvolun?jobber_id=${userId}&post_id=${id}`);
    const data = await res.json();
    setApplied(data.applied); // true = สมัครแล้ว
    
  } catch (error) {
    console.error("Error checking apply status:", error);
  }
}

async function handleApplyToggle(post_id) {
  try {
    if (applied) {
      
      await fetch(`${apiUrl}/api/apply-volun`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobber_id: userId, post_id , type: 'm' })
      });
      setApplied(false);
      document.getElementById("cancel_modal").close();
    } else {
      const res = await fetch(`${apiUrl}/api/apply-volun`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobber_id: userId, // ไอดีผู้สมัคร (ดึงจาก session หรือ state)
          post_id: post_id,
          type: "m"
        })
        
      });
      const data = await res.json();
      setApplied(true);
      document.getElementById("apply_modal").close();
    }
  } catch (error) {
    console.error(error);
    //alert("สมัครไม่สำเร็จ");
  }
}

const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);

  useEffect(() => {
  if (userId && id) {
    checkIfFav();
  }
}, [userId, id]);

async function checkIfFav() {
  try {
    const res = await fetch(`${apiUrl}/api/check-applyvolun?jobber_id=${userId}&post_id=${id}&type=f`);
    const data = await res.json();
    setFavorite(data.applied); // true = สมัครแล้ว
  } catch (error) {
    console.error("Error checking apply status:", error);
  }
}


  async function handleFavToggle(post_id) {
  try {
    if (favorite) {
      // ลบออก
      await fetch(`${apiUrl}/api/apply-volun`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobber_id: userId, post_id , type: "f" })
      });
      setFavorite(false);
      setAlertMessage("ยกเลิกการถูกใจแล้ว");
      setAlertType("warning");
      setTimeout(() => {
        setAlertMessage(null);
        setAlertType(null);
      }, 3000);
    } else {
      const res = await fetch(`${apiUrl}/api/apply-volun`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobber_id: userId, // ไอดีผู้สมัคร (ดึงจาก session หรือ state)
          post_id: post_id,
          type: "f"
        })
        
      });
      const data = await res.json();
      setFavorite(true);
      setAlertMessage("ถูกใจแล้ว");
      setAlertType("success");
      setTimeout(() => {
        setAlertMessage(null);
        setAlertType(null);
      }, 3000);
    }
  } catch (error) {
    console.error(error);
    setAlertMessage("เกิดข้อผิดพลาด");
    setAlertType("error");
    setTimeout(() => {
      setAlertMessage(null);
      setAlertType(null);
    }, 3000);
  }
}
const section2Ref = useRef(null);

  const scrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


    return (
      <main>
        <div>
          {userData && <Navbar user={userData} />}
          <div className="bg-[#8E80FF] pl-2 md:pl-4 lg:pl-6 xl:pl-8">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl border-white p-2 md:p-3 lg:p-4 xl:p-5  bg-white text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="6">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {/* <center><h1>Job post {id}</h1></center> */}
          <div className="flex justify-center gap-3 px-5 pb-5 md:px-20 md:pb-7 lg:px-35 lg:pb-14 xl:py-0">
            <div className="w-full flex flex-col gap-2 "> 
                
                <div className="flex justify-center items-center">
                  {/* ตำแหน่งด้านซ้าย */}
                  <p className="text-xs md:text-xl lg:text-3xl font-bold">
                    {data[0]?.activity_name}
                  </p>
                  
                  
                </div>
                <div className="flex justify-center items-center">
                  <p className="text-xs md:text-xl font-bold">
                    {data[0]?.voluntype_name}
                  </p>
                </div>
                
                  
                <div className="flex justify-center mt-5">
                  <p className="text-[8px] md:text-sm lg:text-xl font-bold">
                      วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}
                  </p>
                </div>

            </div>
            <div className="text-right">
                    <a>ความสอดคล้อง</a>
                    <p className="text-2xl md:text-4xl lg:text-7xl font-extrabold text-white">
                      {matchPercent}%
                    </p>
                    
                  </div>
        </div>


          <div className="bg-gradient-to-b from-[#8E80FF] to-white px-5 py-3 md:px-15  lg:px-25  xl:px-35">
            <div className="flex gap-4 w-full py-2 md:py-4 lg:py-6">

              <div className="w-1/2">
                <div className="flex items-end justify-between">
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-4">
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
                          {item.label}: <span className="text-green-600">{item.volun}</span>
                        </p>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-400">คุณสมบัติของคุณ</p>
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
                          {item.label}: <span className="text-red-600">{item.volun}</span>
                        </p>
                      </div>
                      {/* คุณสมบัติของคุณ */}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-400">คุณสมบัติของคุณ</p>
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

            

          <div className="bg-white px-5 py-3 md:px-15 md:pb-6 lg:px-25 lg:pb-12 xl:px-35 xl:pb-14">
            
            <div className="flex flex-col justify-center items-center w-full mb-2 p-4 md:mb-4 md:p-8 lg:mb-8 lg:p-10 xl:p-12 text-[#8E80FF] ">
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-4/5 px-7 pb-5 md:px-20 md:pb-7 lg:px-30 lg:pb-14 xl:px-50 xl:py-10 rounded-3xl lg:rounded-4xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}> 
            
                <div className="avatar">
                  <div className="w-24 sm:w-28 md:w-35 lg:w-55 rounded-full">
                    {data[0]?.picture ? (
                                  <img src={`/uploads/emp_pic/${data[0]?.picture}`} />
                                ) : (
                                  <img src={`/uploads/nophoto.png`}  />
                                )}
                  </div>
                </div>          
                <div className="w-full pl-2 md:pl-4 lg:pl-6 xl:pl-10">
                  <div className="flex flex-col gap-1 lg:gap-2 xl:gap-3">
                    <a className="text-md md:text-xl lg:text-3xl xl:text-5xl font-bold">{data[0]?.fullname}</a>
                    {/* <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-3 lg:pt-4">คะแนนรีวิว</a> */}
                    <div className="flex flex-col justify-between">
                            <EmpRating emp_id={data[0]?.emp_id} cl="#FFD400"/>
                            <div className="flex justify-end gap-2 mt-2 md:mt-5">
                                {/* <button 
                                  onClick={() => document.getElementById("section2").scrollIntoView({ behavior: "smooth" })} 
                                  className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-20 lg:w-30 xl:w-40 border border-white bg-[#8E80FF] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                                >แผนที่</button> */}
                                <button 
                                  onClick={() => goToProfile(data[0]?.emp_id)}
                                  className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-white bg-[#8E80FF] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                                >ดูโปร์ไฟล์</button>
                                <button 
                                  onClick={() => setShowDe(!showDe)}
                                  className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-60 border border-white bg-[#8E80FF] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                                >
                                  {showDe ? 'ซ่อนรายละเอียดกิจกรรม':'ดูรายละเอียดกิจกรรม'}
                                </button>
                            </div>
                    </div>
                  </div>

              
            </div>  
          </div>
            </div>
          {showDe && (
            <>
            <div className="flex items-end justify-center w-full"> 
              <div className="flex items-end justify-between"> 
            <div className="flex mt-2 md:mt-4 lg:mt-8">
                              <table>
                                <tbody>
                                  <tr className="lg:h-10 xl:h-12">
                                    <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                                    <td className="w-30 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">วัน เวลาที่ทำกิจกรรม </a></td>
                                    <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{data[0]?.date_start && formatDateToThaiShort(data[0].date_start)} {data[0]?.date_end && 'ถึง'} {data[0]?.date_end && formatDateToThaiShort(data[0].date_end)}</a></td>
                                  </tr>
                                  <tr className="lg:h-10 xl:h-12">
                                    <td><FaCircle color="#7B6ADA" size={12} /></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">จำนวน</a></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{data[0]?.num_position} อัตรา</a></td>
                                  </tr>
                                  <tr className="lg:h-10 xl:h-12">
                                    <td><FaCircle color="#7B6ADA" size={12} /></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">สถานที่ทำกิจกรรม</a></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</a></td>
                                  </tr>
                                </tbody>
                              </table>
                              
                            </div>
                            {/* button for appply        */}
                            
            
                          </div> 
                        </div> 
                        
                          {data[0]?.details && (
                      <div className="py-2 md:py-4 lg:py-6">
                        <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">รายละเอียด</p>
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
            
                                <div
                                  className="prose prose-sm md:prose lg:prose-lg"
                                  dangerouslySetInnerHTML={{ __html: data[0].details }}
                                ></div>
             </div>
                      </div>
                              )}
                       
                      <div className="py-2 md:py-4 lg:py-6">
                        <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">เกณฑ์การเข้าร่วม</p>
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                          อายุ {
                            (() => {
                              const age = data[0]?.age || "";
                              if (age === "0" || age === "0-0") return "ไม่กำหนดอายุ";
                              const [start, end] = age.split("-").map(Number);
                              if (start === 0 && end > 0) return `ไม่เกิน ${end} ปี`;
                              if (end === 0 && start > 0) return `${start} ปีขึ้นไป`;
                              return age;
                            })()
                          }
                          </div>
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                          เพศ {data[0]?.gender === "M"
                                  ? " ชาย"
                                  : data[0]?.gender === "F"
                                  ? " หญิง"
                                  : 'ไม่จำกัดเพศ'|| "ไม่ระบุ"}
                        </div>
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                          
                          {data[0]?.experience && (
                                <div
                                  className="prose prose-sm md:prose lg:prose-lg"
                                  dangerouslySetInnerHTML={{ __html: data[0].experience }}
                                ></div>
                              )}
                        </div>
            
                      </div>
                          
                          {data[0]?.how_to_join && (
                      <div className="py-2 md:py-4 lg:py-6">
                        <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">วิธีการเข้าร่วม</p>
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
            
                                <div
                                  className="prose prose-sm md:prose lg:prose-lg"
                                  dangerouslySetInnerHTML={{ __html: data[0].how_to_join }}
                                ></div>
                        </div>
                      </div>        
                              )}
                        
                          
                          {data[0]?.prepare && (
                      <div className="py-2 md:py-4 lg:py-6">
                        <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">สิ่งที่ผู้เข้าร่วมต้องเตรียม</p>
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
            
                                <div
                                  className="prose prose-sm md:prose lg:prose-lg"
                                  dangerouslySetInnerHTML={{ __html: data[0].prepare }}
                                ></div>
                         </div>
                      </div>       
                              )}
                        
                      <div className="py-2 md:py-4 lg:py-6">
                        <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ติดต่อ</p>
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{data[0]?.location} ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</div>
                          
                          {data[0]?.contact && (
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
            
                                <div
                                  className="prose prose-sm md:prose lg:prose-lg"
                                  dangerouslySetInnerHTML={{ __html: data[0].contact }}
                                ></div>
                           </div>     
                              )}
                        
                      </div>
                      <div id="section2" ref={section2Ref}>
                          <div className="py-2 md:py-4 lg:py-6">
                            <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">แผนที่สถานที่ทำกิจกรรม</p>
                            {data.length > 0 && data[0].latitude && data[0].longitude && (
                                                                <div className="flex flex-col justify-center w-full mb-2 p-4 bg-[#7B6ADA] rounded-3xl" 
                                                                    style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                                                  <MapView
                                                                    latitude={data[0].latitude}
                                                                    longitude={data[0].longitude}
                                                                    name=""
                                                                    h="500px"
                                                                  />
                                                                </div>
                                                              )}
                          </div>
                          
                      </div>  
            
            </>
          )}  
          <div className="flex flex-col items-center gap-3">   
            <hr className="w-1/2 border border-[#D9D9D9] mb-4" />        
                    {(status === "waitemp" || status === "waitjobber" || status === null) ? (
                  <>
                  {status === "waitemp" ? (
                   <span className="text-[#8E80FF] text-4xl font-bold">รอการตอบกลับจากนายจ้าง</span>

                  ) : (
                    <>
                    
                      {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากนายจ้าง</label>
                          <a
                            className="text-[#8E80FF] text-xl font-bold p-5 rounded-xl"
                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        </>
                        
                      )}
                    <span className="text-green-500 text-4xl font-bold">รอการตอบกลับจากคุณ สามารถตอบกลับจากกระดิ่งแจ้งเตือน</span>
                    </>
                  )}

                    <button
                      onClick={() => {
                        if (applied) {
                          document.getElementById("cancel_modal").showModal();
                        } else {
                          document.getElementById("apply_modal").showModal();
                        }
                      }}
                      className={`btn btn-xs md:btn-sm lg:btn-lg border-green-500 w-50 p-2 md:p-3 lg:p-4 xl:p-5 ${
                        applied ? "bg-red-500" : "bg-green-500"
                      } text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl`}
                    >
                      {applied ? "ยกเลิก" : "ลงทะเบียนกิจกรรม"}
                    </button>
                    <a className="text-red-500">
                      {applied
                        ? "ท่านสามารถยกเลิกการลงทะเบียนได้ หากเปลี่ยนความประสงค์"
                        : "โปรดตรวจสอบรายละเอียดกิจกรรมให้ครบถ้วนก่อนกดลงทะเบียน"}
                    </a>
                  </>
                  ) : status === "accepted" ? (
                    <>
                      {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากนายจ้าง</label>
                          <a
                            className="text-[#8E80FF] text-xl font-bold p-5 rounded-xl"
                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        </>
                        
                      )}
                      <span className="text-green-500 text-6xl font-bold">คุณได้ตกลงรับงานนี้แล้ว</span>
                    </>
                  ) : status === "rejected" ? (
                    <span className="text-red-500 text-6xl font-bold">การสมัครถูกปฏิเสธ</span>
                  ) : status === "expired" ? (
                    <>
                    {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากนายจ้าง</label>
                          <a
                            className="text-[#8E80FF] text-xl font-bold p-5 rounded-xl"
                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        </>
                        
                      )}
                    <span className="text-gray-500 text-6xl font-bold">หมดอายุการยืนยัน หมดไปวันที่ ${expire_time}</span>
                    </>
                  ) : status === "jb_rejected" ? (
                    <>
                    {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากนายจ้าง</label>
                          <a
                            className="text-[#8E80FF] text-xl font-bold p-5 rounded-xl"
                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        </>
                        
                      )}
                    <span className="text-red-500 text-6xl font-bold">คุณปฏิเสธไปแล้ว</span>
                    </>
                    
                  ) : (
                    <>
                      <button
                      onClick={() => {
                        if (applied) {
                          document.getElementById("cancel_modal").showModal();
                        } else {
                          document.getElementById("apply_modal").showModal();
                        }
                      }}
                      className={`btn btn-xs md:btn-sm lg:btn-lg border-green-500 w-50 p-2 md:p-3 lg:p-4 xl:p-5 ${
                        applied ? "bg-red-500" : "bg-green-500"
                      } text-white rounded-xl md:rounded-2xl`}
                    >
                      {applied ? "ยกเลิก" : "ลงทะเบียนกิจกรรม"}
                    </button>
                    <a className="text-red-500">
                      {applied
                        ? "ท่านสามารถยกเลิกการลงทะเบียนได้ หากเปลี่ยนความประสงค์"
                        : "โปรดตรวจสอบรายละเอียดกิจกรรมให้ครบถ้วนก่อนกดลงทะเบียน"}
                    </a>
                    </>
                  )}
                  </div> 

          </div>

          <Footer />
          
        </div>
       {/* Modal สำหรับสมัคร */}
        <dialog id="apply_modal" className="modal">
          <div className="modal-box bg-white rounded-2xl shadow-xl">
            {/* หัวข้อ */}
            <center>
              <h2 className="text-base md:text-xl text-green-600 font-bold mb-4 flex items-center justify-center gap-2">
                
                ต้องการสมัครงานนี้?
              </h2>
            </center>

            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 md:w-20 md:h-20 text-white bg-green-500 rounded-full p-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="modal-action flex justify-center gap-4">
              <button
                className="btn btn-sm md:btn-md bg-green-500 hover:bg-green-700 border border-green-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => handleApplyToggle(parseInt(id))}
              >
                ยืนยันการสมัคร
              </button>
              <button
                className="btn btn-sm md:btn-md bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => document.getElementById("apply_modal").close()}
              >
                ดูก่อนละกัน
              </button>
            </div>
          </div>
        </dialog>

        {/* Modal สำหรับยกเลิก */}
        <dialog id="cancel_modal" className="modal">
          <div className="modal-box bg-white rounded-2xl shadow-xl">
            {/* หัวข้อ */}
            <center>
              <h2 className="text-base md:text-xl text-red-600 font-bold mb-4 flex items-center justify-center gap-2">
                <span className="text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 md:w-8 md:h-8"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" />
                  </svg>
                </span>
                ต้องการยกเลิกการสมัครงานนี้?
              </h2>
            </center>

            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 md:w-20 md:h-20 text-white bg-red-500 rounded-full p-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>


            <div className="modal-action flex justify-center gap-4">
              <button
                className="btn btn-sm md:btn-md bg-red-600 hover:bg-red-700 border border-red-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => handleApplyToggle(parseInt(id))}
              >
                ยืนยันการยกเลิก
              </button>
              <button
                className="btn btn-sm md:btn-md bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => document.getElementById("cancel_modal").close()}
              >
                ดูก่อนละกัน
              </button>
            </div>
          </div>
        </dialog>

      </main>
    )
}

export default Volun_Match