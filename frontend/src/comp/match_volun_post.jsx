import { useLocation } from "react-router-dom";
import React, { useState , useEffect } from "react"
import Navbar from "./navbar";
import Footer from "./footer";
import EmpRating from "./emp_star";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import axios from "axios";
import { MapView } from "./map_view";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Match_Volun_Post() {
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

  const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

  function renderWorkSchedule(code) {
    if (!code || code.length !== 7) return "ข้อมูลไม่ถูกต้อง";

    const chars = code.split("");
    const workDays = [];
    const offDays = [];

    chars.forEach((char, index) => {
      if (char === "1") {
        workDays.push(daysOfWeek[index]);
      } else {
        offDays.push(daysOfWeek[index]);
      }
    });

    const showOffDays = offDays.length <= 3;
    const daysToShow = showOffDays ? offDays : workDays;
    const label = showOffDays ? "วันหยุด" : "วันทำงาน";

    return (
      <div>
        {label}: {daysToShow.length > 0 ? daysToShow.join(", ") : "ไม่มี"}
      </div>
    );
  }
  const goToProfile = (val) => {
    navigate(`/Emp_Pf?emp_id=${val}`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };

  const handleBack = () => {
  const prev = fromStack.pop();
  if (prev) {
    navigate(prev, { state: { fromStack } });
  } else {
    navigate("/Admin/vvolun"); // หรือ default fallback
  }
};

    return (
      <div>
        {userData && <Navbar user={userData} />}
        <div className="bg-[#7B6ADA] pl-2 md:pl-4 lg:pl-6 xl:pl-8">
          <button
            onClick={handleBack}
            className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl border-white p-2 md:p-3 lg:p-4 xl:p-5  bg-white text-[#7B6ADA] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
          >
            <HiChevronLeft size={15}/> ย้อนกลับ
          </button>
        </div>
        {/* <center><h1>Job post {id}</h1></center> */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2  px-7 pb-5 md:px-20 md:pb-7 lg:px-30 lg:pb-14 xl:px-50 xl:pb-10"> 
          
          <div className="avatar">
            <div className="w-24 sm:w-28 md:w-35 lg:w-55 rounded-full">
              {data[0]?.picture ? (
                            <img src={`/uploads/${data[0]?.picture}`} />
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
                          onClick={() => document.getElementById("section2").scrollIntoView({ behavior: "smooth" })} 
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
              <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}</p>
            </div>
            <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
              <table>
                <tbody>
                  <tr className="lg:h-10 xl:h-12">
                    <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                    <td className="w-30 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">วัน เวลาที่ทำกิจกรรม</a></td>
                    <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{data[0]?.date_time}</a></td>
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
          </div>
          <div className="py-2 md:py-4 lg:py-6">
            <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">รายละเอียด</p>
            <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
              {data[0]?.details && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: data[0].details }}
                    ></div>
                  )}
            </div>
          </div>
          <div className="py-2 md:py-4 lg:py-6">
            <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">เกณฑ์การเข้าร่วม</p>
            <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">อายุ {data[0]?.age}</div>
            <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
              เพศ {data[0]?.gender === "M"
                      ? " ชาย"
                      : data[0]?.gender === "F"
                      ? " หญิง"
                      : data[0]?.gender || "ไม่ระบุ"}
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
          <div className="py-2 md:py-4 lg:py-6">
            <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">วิธีการเข้าร่วม</p>
            <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
              
              {data[0]?.how_to_join && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: data[0].how_to_join }}
                    ></div>
                  )}
            </div>
          </div>
          <div className="py-2 md:py-4 lg:py-6">
            <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">สิ่งที่ผู้เข้าร่วมต้องเตรียม</p>
            <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
              
              {data[0]?.prepare && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: data[0].prepare }}
                    ></div>
                  )}
            </div>
          </div>
          <div className="py-2 md:py-4 lg:py-6">
            <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ติดต่อ</p>
            <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{data[0]?.location} ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</div>
            <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
              
              {data[0]?.contact && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: data[0].contact }}
                    ></div>
                  )}
            </div>
          </div>
          <div id="section2">
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
        </div>

        <Footer />
      </div>
    )
}

export default Match_Volun_Post