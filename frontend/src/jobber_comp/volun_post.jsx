import { useLocation } from "react-router-dom";
import React, { useState , useEffect, useRef } from "react"
import Navbar from "./navbar";
import Footer from "./footer";
import EmpRating from "./emp_star";
import { FaCircle, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import axios from "axios";
import { MapView } from "../comp/map_view";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Volun_Post_de() {
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
  const id = queryParams.get("pi");
    
  const [data, setData] = useState([]);
  const [hs, setHS] = useState([]);
  const [ss, setSS] = useState([]);

  useEffect(() => {
          fetchData();
        }, [id]);
      
  
  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

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
      // if(Array.isArray(result.lastpost)){
      //     //console.log("sql", res)
      //     //console.log("🔥 lastpost from API:", result.lastpost);
      //     setLastpost(result.lastpost);
      //   } else {
      //     console.error("Data format error:", result);
      //     setLastpost([]);
      //   }
  
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

  
  const goToProfile = (val) => {
    navigate(`/viewEmp_Pf?emp_id=${val}`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };

  

const section2Ref = useRef(null);

  const scrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [status , setStatus] = useState('');
  const [expire_time , setExpire_time] = useState('');
  const [message , setMessage] = useState('');
  
  useEffect(() => {
    if (userId && id) {
      checkIfFav();
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

async function checkIfFav() {
  try {
    const res = await fetch(`${apiUrl}/api/check-applyvolun?jobber_id=${userId}&post_id=${id}&type=f`);
    const data = await res.json();
    
    // console.log('data from api', data);

    setFavorite(data.applied);
  } catch (error) {
    console.error("Error checking apply status:", error);
  }
}

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);

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
useEffect(() => {
  if (userId && id) {
    checkIfApplied();
  }
}, [userId, id]);

async function checkIfApplied() {
  try {
    const res = await fetch(`${apiUrl}/api/check-applyvolun?jobber_id=${userId}&post_id=${id}&type=j`);
    const data = await res.json();
    setApplied(data.applied); // true = สมัครแล้ว
  } catch (error) {
    console.error("Error checking apply status:", error);
  }
}

async function handleApplyToggle(post_id) {
  try {
    if (applied) {
      // ลบออก
      await fetch(`${apiUrl}/api/apply-volun`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobber_id: userId, post_id })
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
          type: "j"
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

    return (
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-2  px-7 pb-5 md:px-20 md:pb-7 lg:px-30 lg:pb-14 xl:px-50 xl:pb-10"> 
          
          <div className="avatar">
            <div className="w-24 sm:w-28 md:w-35 lg:w-55 rounded-full">
              {data[0]?.picture ? (
                            <img src={`/uploads/emp_pic/${data[0]?.picture}`} />
                          ) : (
                            <img src={`/uploads/nophoto.png`}  />
                          )}
            </div>
          </div>           <div className="w-full pl-2 md:pl-4 lg:pl-6 xl:pl-10">
            <div className="flex flex-col gap-1 lg:gap-2 xl:gap-3">
              <a className="text-md md:text-xl lg:text-3xl xl:text-5xl font-bold">{data[0]?.fullname}</a>
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-3 lg:pt-4">การรีวิว</a>
              <div className="flex justify-between">
                      <EmpRating emp_id={data[0]?.emp_id} cl="#FFD400"/>
                      <div className="flex justify-end gap-2 mt-2 md:mt-5">
                        <button 
                         onClick={scrollToSection2} 
                          className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-20 lg:w-30 xl:w-40 border border-white bg-white text-[#7B6ADA] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                        >แผนที่</button>
                        <button 
                          onClick={() => goToProfile(data[0]?.emp_id)}
                          className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-white bg-white text-[#7B6ADA] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                        >ดูโปร์ไฟล์</button>
                    </div>
              </div>
            </div>

            
          </div>  
        </div>

        <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:py-14">
          <div className="flex flex-col justify-center w-full mb-2 p-4 md:mb-4 md:p-8 lg:mb-8 lg:p-10 xl:p-14 bg-[#D9D9D9] text-[#7B6ADA] rounded-3xl lg:rounded-4xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="flex justify-between items-center">
              <p className="text-xs md:text-xl lg:text-3xl xl:text-5xl font-bold">{data[0]?.activity_name}</p>
              <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : '-'}</p>
            </div>
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
            <div className="flex items-end justify-end -mt-20">
                <div className="tooltip tooltip-top" data-tip={`${favorite ? "คลิกเพื่อลบจากงานที่สนใจ" : "คลิกเพื่อบันทึกไว้ในงานที่สนใจ"}`}>
                                  <button
                                    onClick={() => handleFavToggle(parseInt(id))}
                                    className="transition-transform duration-200"
                                  >
                                    <FaHeart
                                      className={`w-17 h-15 ${favorite ? "text-red-500" : "text-black"}`}
                                      style={{
                                        fill: favorite ? "red" : "white",
                                        stroke: "none",
                                        strokeWidth: 50
                                      }}
                                    />
                                  </button>
                </div>
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
            {/* <div className="flex flex-col items-center gap-3">   
              <hr className="w-1/2 border border-[#D9D9D9] mb-4" />        
              <p className="text-center text-gray-600 text-sm">
                ขณะนี้ระบบสมัครเข้าร่วมกิจกรรมจิตอาสายังไม่เปิดให้ใช้งาน <br />
                คุณสามารถติดต่อผู้ประกาศได้โดยตรง และรอพบฟีเจอร์ใหม่ ๆ เร็ว ๆ นี้
              </p>
            </div> */}
            <div className="flex flex-col items-center gap-3">
            <hr className="w-1/2 border border-[#D9D9D9] mb-4" />  
                  {/* button for appply        */}

                {(status === "waitemp" || status === "waitjobber" || status === null) ? (
                  <>
                  {status === "waitemp" ? (
                   <span className="text-[#8E80FF] text-4xl font-bold">รอการตอบกลับจากผู้จัดกิจกรรม</span>

                  ) : (
                    <>
                    
                      {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากผู้จัดกิจกรรม</label>
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
                      } text-white rounded-xl md:rounded-2xl`}
                    >
                      {applied ? "ยกเลิก" : "ลงทะเบียนกิจกรรม"}
                    </button>
                    <a className="text-red-500">
                      {applied
                        ? "ท่านสามารถยกเลิกการลงทะเบียนได้ หากเปลี่ยนความประสงค์"
                        : "โปรดตรวจสอบรายละเอียดงานให้ครบถ้วนก่อนกดลงทะเบียน"}
                    </a>
                  </>
                  ) : status === "accepted" ? (
                    <>
                      {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากผู้จัดกิจกรรม</label>
                          <a
                            className="text-[#8E80FF] text-xl font-bold p-5 rounded-xl"
                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        </>
                        
                      )}
                      <span className="text-green-500 text-6xl font-bold">คุณได้ตกลงรับกิจกรรมนี้แล้ว</span>
                    </>
                  ) : status === "rejected" ? (
                    <span className="text-red-500 text-6xl font-bold">การลงทะเบียนถูกปฏิเสธ</span>
                  ) : status === "expired" ? (
                    <>
                    {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากผู้จัดกิจกรรม</label>
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
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากผู้จัดกิจกรรม</label>
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
                        : "โปรดตรวจสอบรายละเอียดงานให้ครบถ้วนก่อนกดลงทะเบียน"}
                    </a>
                    </>
                  )}

                </div>   
 
        </div>

        <Footer />
        {/* Modal สำหรับสมัคร */}
        <dialog id="apply_modal" className="modal">
          <div className="modal-box bg-white rounded-2xl shadow-xl">
            {/* หัวข้อ */}
            <center>
              <h2 className="text-base md:text-xl text-green-600 font-bold mb-4 flex items-center justify-center gap-2">
                
                ต้องการสมัครกิจกรรมนี้?
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
                ต้องการยกเลิกการสมัครกิจกรรมนี้?
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
      </div>
    )
}

export default Volun_Post_de