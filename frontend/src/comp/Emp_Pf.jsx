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
import { CheckIcon } from '@heroicons/react/24/outline'
import axios from "axios";
import { MapView } from "./map_view";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Emp_Pf() {
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
  const id = queryParams.get("emp_id");

  //const [selectedTab, setSelectedTab] = useState("job"); // 'job' หรือ 'volunteer'
  const handleBack = () => {
  const prev = fromStack.pop();
  if (prev) {
    navigate(prev, { state: { fromStack } });
  } else {
    navigate("/Admin/emp"); // หรือ default fallback
  }
};
    
  const [emp, setEmp] = useState([]);
  const [post, setPost] = useState([]);
  const [review, setReview] = useState([]);
  const [postCount, setPostCount] = useState([]);
  const [findvolun, setFinedVolun] = useState([]);
  const [volun_post, setVolunPost] = useState([]);
  const [volun_review, setVolunReview] = useState([]);
  const [volunCount, setVolunCount] = useState([]);
  const [volun_pic, setVolun_pic] = useState([]);
  const [job_pic, setJob_pic] = useState([]);

  useEffect(() => {
          fetchData();
        }, [id]);
        // findvolun,
        //volun_post,
        //volun_review,
        //volunCount: volunCount[0].volunCount
      
  
  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/emp_pf?emp_id=${id}`);
      const result = await res.json();

      if (typeof result === 'object' && 
        'postCount' in result && 
        'volunCount' in result ) {
        setPostCount(result.postCount);
        setVolunCount(result.volunCount);
      } else {
        console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      }

      if(Array.isArray(result.Emp_pf)){
          //console.log("sql", res)
          

          setEmp(result.Emp_pf);
        } else {
          console.error("Data format error:", result);
          setEmp([]);
        }

      if(Array.isArray(result.job_post)){
          //console.log("sql", res)
          setPost(result.job_post);
        } else {
          console.error("Data format error:", result);
          setPost([]);
        }

      if(Array.isArray(result.jobber_review)){
          //console.log("sql", res)
          setReview(result.jobber_review);
        } else {
          console.error("Data format error:", result);
          setReview([]);
        }
      if(Array.isArray(result.findvolun)){
          //console.log("sql", res)
          setFinedVolun(result.findvolun);
        } else {
          console.error("Data format error:", result);
          setFinedVolun([]);
        }

      if(Array.isArray(result.volun_post)){
          //console.log("sql", res)
          setVolunPost(result.volun_post);
        } else {
          console.error("Data format error:", result);
          setVolunPost([]);
        }

      if(Array.isArray(result.volun_review)){
          //console.log("sql", res)
          setVolunReview(result.volun_review);
        } else {
          console.error("Data format error:", result);
          setVolunReview([]);
        }
      
      if(Array.isArray(result.job_pic)){
          //console.log("sql", result.job_pic)
          setJob_pic(result.job_pic);
        } else {
          console.error("Data format error:", result);
          setJob_pic([]);
        }

      if(Array.isArray(result.volun_pic)){
          //console.log("sql", res)
          setVolun_pic(result.volun_pic);
        } else {
          console.error("Data format error:", result);
          setVolun_pic([]);
        }
  
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
  
  const handleTabClick = (type) => {
    navigate(`/Emp_Pf?emp_id=${id}&type=${type}`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };
  const queryType = queryParams.get("type") || "job"; // default เป็น "job"


  const goToProfile = (val) => {
    navigate(`/Job_Post?pi=${val}`, {
  state: {
    fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
  }
});
    window.scrollTo(0,0);
  };
  const goToVolunDetails = (val) => {
    navigate(`/Volun_Post?pi=${val}`, {
  state: {
    fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
  }
});
    window.scrollTo(0,0);
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
              {emp[0]?.picture ? (
                            <img src={`/uploads/${emp[0]?.picture}`} />
                          ) : (
                            <img src={`/uploads/nophoto.png`}  />
                          )}
            </div>
          </div>
          <div className="w-full pl-2 md:pl-4 lg:pl-6 xl:pl-10">
            <div className="flex flex-col gap-1 lg:gap-2 xl:gap-3">
              <div className="flex gap-1 lg:gap-2 xl:gap-3">
                <a className="text-md md:text-xl lg:text-3xl xl:text-5xl font-bold">{emp[0]?.fullname}</a>
                  {emp[0]?.status === "ON" ? (
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
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold">ต.{emp[0]?.tb} อ.{emp[0]?.ap} จ.{emp[0]?.jw}</a>
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-2">
                เพศ {emp[0]?.gender === "M"
                      ? "ชาย"
                      : emp[0]?.gender === "F"
                      ? "หญิง"
                      : emp[0]?.gender || "ไม่ระบุ"}
                      
                      {emp[0]?.LG
                        ? "  🌈 เป็นส่วนหนึ่งของ LGBTQ+"
                        : "  ไม่เป็นส่วนหนึ่งของ LGBTQ+"}
              </a>
              <div className="w-full mt-2">
                <p className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold text-white mb-1">
                  ค่าการจับคู่ที่ผู้ใช้เลือกไว้
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 md:h-5 lg:h-6 xl:h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-white to-green-500 h-full rounded-full text-right px-2 py-1 text-[10px] md:text-xs lg:text-base font-bold text-white"
                    style={{ width: `${emp[0]?.pc_match || 0}%` }}
                  >
                    {emp[0]?.pc_match || 0}%
                  </div>
                </div>
              </div>

            </div>
            {queryType === "job" && (              
              <div className="flex justify-end gap-2 mt-2 md:mt-5">
                  <button 
                    onClick={() => document.getElementById("section2").scrollIntoView({ behavior: "smooth" })} 
                    className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-20 lg:w-30 xl:w-40 border border-white bg-white text-[#7B6ADA] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                  >แผนที่</button>
                  
              </div>
            )}
          </div>  
        </div>

        <div className="relative flex items-center justify-center bg-white p-3">
          <button onClick={() => handleTabClick("job")} className={`z-10 btn btn-xs md:btn-sm ${queryType  === "job" ? "bg-[#7B6ADA] text-white" : "bg-white text-[#7B6ADA]"} border-[#7B6ADA] border-3 rounded-full pt-0.5 px-5 w-25 md:w-35 lg:w-40 hover:w-40 lg:text-sm`}>งาน</button>
          <button onClick={() => handleTabClick("volunteer")} className={`-ml-5 btn btn-xs md:btn-sm ${queryType  === "volunteer" ? "bg-[#7B6ADA] text-white z-10" : "bg-white text-[#7B6ADA] z-0"} border-3 pt-0.5 px-5 w-30 md:w-40  border-[#7B6ADA] rounded-full hover:w-40 lg:text-sm`}>กิจกรรมจิตอาสา</button>
        </div>
        {queryType === "job" && (
          <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:py-14">
          
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">เกี่ยวกับ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  {emp[0]?.about && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: emp[0].about }}
                    ></div>
                  )}

                </div>
              </div>
              {/* image */}
              {job_pic && job_pic.length > 0 && (
                <div className="flex justify-center mt-4">
                  {job_pic.length === 1 && (
                    <img
                      src={`/uploads/${job_pic}`}
                      alt="job"
                      className="w-full max-w-md h-auto rounded-2xl object-cover"
                    />
                  )}

                  {(job_pic.length === 2 || job_pic.length === 3) && (
                    <div className={`grid gap-2 grid-cols-${job_pic.length}`}>
                      {job_pic.map((pic, index) => (
                        <img
                          key={index}
                          src={`/uploads/${pic}`}
                          alt={`job-${index}`}
                          className="w-full h-48 md:h-56 lg:h-64 xl:h-72 rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {job_pic.length === 4 && (
                    <div className="grid grid-cols-2 gap-2">
                      {job_pic.map((pic, index) => (
                        <img
                          key={index}
                          src={`/uploads/${pic}`}
                          alt={`job-${index}`}
                          className="w-full h-44 md:h-52 lg:h-60 xl:h-64 rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {job_pic.length >= 5 && (
                    <div className="flex flex-col lg:flex-row gap-2 w-full max-w-6xl">
                      <img
                        src={`/uploads/${job_pic[0]}`}
                        alt="main"
                        className="w-full lg:w-1/2 h-72 md:h-80 xl:h-96 rounded-2xl object-cover"
                      />
                      <div className="grid grid-cols-2 gap-2 w-full lg:w-1/2">
                        {job_pic.slice(1, 5).map((pic, index) => (
                          <img
                            key={index}
                            src={`/uploads/${pic}`}
                            alt={`job-sub-${index}`}
                            className="w-full h-32 md:h-36 lg:h-40 xl:h-44 rounded-2xl object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}


              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">สวัสดิการพื้นฐาน</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  {emp[0]?.benefits && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: emp[0].benefits }}
                    ></div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">
                  งาน
                </p>

                <div className="p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl">
                  <table className="w-full border-collapse overflow-hidden rounded-3xl shadow-md">
                    <thead>
                      <tr>
                        <th className="bg-[#7B6ADA] text-white text-left p-3 text-xs font-bold lg:text-xl">
                          งานทั้งหมด {postCount} งาน
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      
                      
                      {post.length === 0 ? (
                        <tr>
                          <td className="p-4 text-center text-[#7B6ADA] font-bold">ผู้ใช้คนนี้ยังไม่ได้ลงประกาศงาน</td>
                        </tr>
                      ) : (
                        post.map((post) => (
                        <tr key={post.post_id} className="border border-t border-[#7B6ADA] hover:bg-[#f1f0ff]">
                          <td className="p-4 text-[#7B6ADA] text-xs font-bold lg:text-xl">
                            <div className="flex justify-between items-center">
                              <p className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold">
                                {post.position_name ? post.position_name : 'ตำแหน่งงาน'}
                              </p>
                              <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">
                                วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : '-'}
                              </p>
                            </div>

                            <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                              <table>
                                <tbody>
                                  <tr className="lg:h-10 xl:h-12">
                                    <td className="w-5 md:w-10 lg:w-10 xl:w-15">
                                      <FaCircle color="#7B6ADA" size={12} />
                                    </td>
                                    <td className="w-20 md:w-40 lg:w-50 xl:w-60">
                                      <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">เงินเดือน</a>
                                    </td>
                                    <td className="w-40 md:w-80 lg:w-90 xl:w-100">
                                      <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">
                                        {post.salary} บาท/เดือน
                                      </a>
                                    </td>
                                  </tr>
                                  <tr className="lg:h-10 xl:h-12">
                                    <td><FaCircle color="#7B6ADA" size={12} /></td>
                                    <td>
                                      <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">จำนวน</a>
                                    </td>
                                    <td>
                                      <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">
                                        {post.num_position} อัตรา
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => goToProfile(post.post_id)}
                                className="btn btn-sm lg:btn-lg border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl"
                              >
                                รายละเอียด
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>



            <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 mb-5 md:py-4 lg:py-6 shadow-md">
              <p className="text-xl text-center md:text-2xl lg:text-3xl font-bold text-[#7B6ADA] mb-4">
                รีวิวจากผู้ที่ทำงาน
              </p>

              {/* คะแนนรวม */}
              <div className="flex flex-col items-center justify-center mb-6">
                <span className="text-sm md:text-xl text-[#7B6ADA] font-bold">คะแนนเฉลี่ย</span>
                <EmpRating emp_id={id} cl="#7B6ADA" />
              </div>

              {/* รายการรีวิวแบบการ์ด */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {review.map((re, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between h-full">
                    <div className="flex gap-3 items-start">
                      <img
                        src={`/uploads/${re.picture || "nophoto.png"}`}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover"
                        alt="user"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-sm md:text-base lg:text-xl text-[#7B6ADA]">{re.fullname}</p>
                          <p className="text-[10px] md:text-sm text-gray-500">{re.date ? formatDateToThaiShort(re.date) : 'ไม่มีวันที่'}</p>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">{re.message}</p>
                      </div>
                    </div>

                    {/* คะแนนเฉพาะรายการ */}
                    <div className="flex justify-end mt-4">
                      <EmpRating_one score={re.score} cl="#7B6ADA" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

              {/* /end review/ */}

              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ติดต่อ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{emp[0]?.address} ต.{emp[0]?.tb} อ.{emp[0]?.ap} จ.{emp[0]?.jw}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{emp[0]?.contact}</div>
              </div>
              <div id="section2">
                  <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">แผนที่สถานที่ทำงาน</p>
                    {emp.length > 0 && emp[0].latitude && emp[0].longitude && (
                    <div className="flex flex-col justify-center w-full mb-2 p-4 bg-[#7B6ADA] rounded-3xl" 
                        style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                      <MapView
                        latitude={emp[0].latitude}
                        longitude={emp[0].longitude}
                        name=""
                        h="500px"
                      />
                    </div>
                  )}

                  </div>
              </div>    
              
        </div>
        )}

        {queryType === "volunteer" && (
          <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:py-14">
          
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">เกี่ยวกับ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  {findvolun[0]?.about_volun && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: findvolun[0].about_volun }}
                    ></div>
                  )}
                </div>
              </div>
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">วิสัยทัศน์</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  
                  {findvolun[0]?.vission && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: findvolun[0].vission }}
                    ></div>
                  )}
                </div>
              </div>

              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">พันธกิจ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  {findvolun[0]?.mission && (
                    <div
                      className="prose prose-sm md:prose lg:prose-lg"
                      dangerouslySetInnerHTML={{ __html: findvolun[0].mission }}
                    ></div>
                  )}
                </div>
              </div>
              {/* image */}
              {volun_pic && volun_pic.length > 0 && (
                <div className="flex justify-center mt-4">
                  {volun_pic.length === 1 && (
                    <img
                      src={`/uploads/${volun_pic}`}
                      alt="job"
                      className="w-full max-w-md h-auto rounded-2xl object-cover"
                    />
                  )}

                  {(volun_pic.length === 2 || volun_pic.length === 3) && (
                    <div className={`grid gap-2 grid-cols-${volun_pic.length}`}>
                      {volun_pic.map((pic, index) => (
                        <img
                          key={index}
                          src={`/uploads/${pic}`}
                          alt={`job-${index}`}
                          className="w-full h-48 md:h-56 lg:h-64 xl:h-72 rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {volun_pic.length === 4 && (
                    <div className="grid grid-cols-2 gap-2">
                      {volun_pic.map((pic, index) => (
                        <img
                          key={index}
                          src={`/uploads/${pic}`}
                          alt={`job-${index}`}
                          className="w-full h-44 md:h-52 lg:h-60 xl:h-64 rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {volun_pic.length >= 5 && (
                    <div className="flex flex-col lg:flex-row gap-2 w-full max-w-6xl">
                      <img
                        src={`/uploads/${volun_pic[0]}`}
                        alt="main"
                        className="w-full lg:w-1/2 h-72 md:h-80 xl:h-96 rounded-2xl object-cover"
                      />
                      <div className="grid grid-cols-2 gap-2 w-full lg:w-1/2">
                        {volun_pic.slice(1, 5).map((pic, index) => (
                          <img
                            key={index}
                            src={`/uploads/${pic}`}
                            alt={`job-sub-${index}`}
                            className="w-full h-32 md:h-36 lg:h-40 xl:h-44 rounded-2xl object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* table job */}
              <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 my-8 md:py-4 lg:py-6" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <p className="text-xl text-center md:text-2xl lg:text-3xl font-bold text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">
                  กิจกรรมจิตอาสา
                </p>

                <div className="p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl">
                  <table className="w-full border-collapse overflow-hidden rounded-3xl shadow-md">
                    <thead>
                      <tr>
                        <th className="bg-[#7B6ADA] text-white text-left p-3 text-xs font-bold lg:text-xl">
                          ทั้งหมด {volunCount} กิจกรรม
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {volun_post.length === 0 ? (
                        <tr>
                          <td className="p-4 text-center text-[#7B6ADA] font-bold">ยังไม่มีกิจกรรม</td>
                        </tr>
                      ) : (
                        volun_post.map((post) => (
                          <tr key={post.post_id} className="border border-t border-[#7B6ADA] hover:bg-[#f1f0ff]">
                            <td className="p-4 text-[#7B6ADA] text-xs font-bold lg:text-xl">
                              <div className="flex justify-between items-center">
                                <p className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold">
                                  {post.activity_name || 'ชื่อกิจกรรม'}
                                </p>
                                <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">
                                  วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : 'ไม่มีวันที่'}
                                </p>
                              </div>

                              <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                                <table>
                                  <tbody>
                                    <tr className="lg:h-10 xl:h-12">
                                      <td className="w-5 md:w-10 lg:w-10 xl:w-15">
                                        <FaCircle color="#7B6ADA" size={12} />
                                      </td>
                                      <td className="w-20 md:w-40 lg:w-50 xl:w-60">
                                        <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">วัน เวลา</a>
                                      </td>
                                      <td className="w-50 md:w-80 lg:w-90 xl:w-100">
                                        <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">
                                          {post.date ? formatDateToThaiShort(post.date) : 'ไม่มีวันที่'} {post.time}
                                        </a>
                                      </td>
                                    </tr>
                                    <tr className="lg:h-10 xl:h-12">
                                      <td><FaCircle color="#7B6ADA" size={12} /></td>
                                      <td>
                                        <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">สถานที่</a>
                                      </td>
                                      <td>
                                        <a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">
                                          {post.location} ต.{post.tb} อ.{post.ap} จ.{post.jw}
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => goToVolunDetails(post.post_id)}
                                  className="btn btn-sm lg:btn-lg border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl"
                                >
                                  รายละเอียด
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col bg-[#D9D9D9] rounded-3xl p-5 mt-7 mb-5 md:py-4 lg:py-6 shadow-md">
                <p className="text-xl text-center md:text-2xl lg:text-3xl font-bold text-[#7B6ADA] mb-4">
                  รีวิวจากผู้ที่ทำกิจกรรม
                </p>

                {/* คะแนนรวม */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <span className="text-sm md:text-xl text-[#7B6ADA] font-bold">คะแนนเฉลี่ย</span>
                  <EmpRating_volun emp_id={id} cl="#7B6ADA" />
                </div>

                {/* รายการรีวิวแบบการ์ด */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {volun_review.map((re, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between h-full">
                      <div className="flex gap-3 items-start">
                        <img
                          src={`/uploads/${re.picture || "nophoto.png"}`}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover"
                          alt="user"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-sm md:text-base lg:text-xl text-[#7B6ADA]">{re.fullname}</p>
                            <p className="text-[10px] md:text-sm text-gray-500">{re.date ? formatDateToThaiShort(re.date) : 'ไม่มีวันที่'}</p>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mt-1">{re.message}</p>
                        </div>
                      </div>

                      {/* คะแนนเฉพาะรายการ */}
                      <div className="flex justify-end mt-4">
                        <EmpRating_one score={re.score} cl="#7B6ADA" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

        </div>
        )}

        

        <Footer />
      </div>
    )
}

export default Emp_Pf