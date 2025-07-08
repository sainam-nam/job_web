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

function Emp_Pf() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("emp_id");

  //const [selectedTab, setSelectedTab] = useState("job"); // 'job' หรือ 'volunteer'

    
  const [emp, setEmp] = useState([]);
  const [post, setPost] = useState([]);
  const [review, setReview] = useState([]);
  const [postCount, setPostCount] = useState([]);
  const [findvolun, setFinedVolun] = useState([]);
  const [volun_post, setVolunPost] = useState([]);
  const [volun_review, setVolunReview] = useState([]);
  const [volunCount, setVolunCount] = useState([]);

  useEffect(() => {
          fetchData();
        }, [id]);
        // findvolun,
        //volun_post,
        //volun_review,
        //volunCount: volunCount[0].volunCount
      
  
  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8081/emp_pf?emp_id=${id}`);
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
    navigate(`/Emp_Pf?emp_id=${id}&type=${type}`);
    window.scrollTo(0,0);
  };
  const queryType = queryParams.get("type") || "job"; // default เป็น "job"


  const goToProfile = (val) => {
    navigate(`/Job_Post?pi=${val}`);
    window.scrollTo(0,0);
  };
  const goToVolunDetails = (val) => {
    navigate(`/Volun_Post?pi=${val}`);
    window.scrollTo(0,0);
  };
    return (
      <div>
        <Navbar />
        <div className="bg-[#7B6ADA] pl-2 md:pl-4 lg:pl-6 xl:pl-8">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl border-white p-2 md:p-3 lg:p-4 xl:p-5  bg-white text-[#7B6ADA] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
          >
            <HiChevronLeft size={15}/> ย้อนกลับ
          </button>
        </div>
        {/* <center><h1>Job post {id}</h1></center> */}
        <div className="flex gap-4 bg-[#7B6ADA] px-7 py-5 md:px-20 md:py-7 lg:px-30 lg:py-14 xl:px-50 xl:py-20"> 
          
          <img src="gray.png" className="w-50 h-30 md:w-60 md:h-40 lg:w-80 lg:h-55 xl:w-90 xl:h-65 rounded-2xl lg:rounded-4xl"></img>
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
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-3 lg:pt-4">เพศ {emp[0]?.gender}</a>
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold">ค่าการจับคู่ {emp[0]?.pc_match} %</a>

            </div>

            <div className="flex justify-end gap-2 mt-2 md:mt-5">
                <button 
                  onClick={() => document.getElementById("section2").scrollIntoView({ behavior: "smooth" })} 
                  className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-20 lg:w-30 xl:w-40 border border-white bg-white text-[#7B6ADA] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                >แผนที่</button>
                
            </div>
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
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{emp[0]?.about}</div>
              </div>
              {/* image */}
              <div className="flex justify-center gap-2">
                <img src="gray.png" 
                  className="w-50 h-50 md:w-60 md:h-60 lg:w-80 lg:h-80 xl:w-90 xl:h-90 rounded-2xl lg:rounded-4xl">
                </img>
                <div className="grid grid-cols-2 gap-1">
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                </div>
              </div>

              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">สวัสดิการพื้นฐาน</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{emp[0]?.benefits}</div>
              </div>
              
              {/* table job */}
              <div className="flex flex-col justify-center items-center py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">งาน</p>
                <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      งานทั้งหมด {postCount} งาน
                </div>
                {/* งานแต่ละแถวเริ่มนี่ วนงาน */}
                  {post.map((post) => (
                    <div key={post.post_id} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold">{post.position_name ? (post.position_name) : 'ตำแหน่งงาน'}</p>
                        <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : 'ไม่มีวันที่'}</p>
                      </div>
                      <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                        <table>
                          <tbody>
                            <tr className="lg:h-10 xl:h-12">
                              <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                              <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">เงินเดือน</a></td>
                              <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.salary} บาท/เดือน</a></td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#7B6ADA" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">จำนวน</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.num_position} อัตรา</a></td>
                            </tr>
                            
                          </tbody>
                        </table>
                        
                      </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => goToProfile(post.post_id)}
                            className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                          >รายละเอียด</button>
                        </div>
                    </div>
                  ))}
                  {/* /end loop for job/ */}
              </div>
              {/* /end flex job/ */}

              {/* table review */}

              <div className="flex flex-col justify-center items-center py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">รีวิวจากผู้ที่ทำงาน</p>
                <div className="flex flex-col gap-1 justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <span>คะแนนเฉลี่ย</span><EmpRating emp_id={id} cl="#7B6ADA" />
                </div>
                {/* reviewแต่ละแถวเริ่มนี่ loop review */}
                  {review.map((re , index) => (
                    <div key={index} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <div className="flex gap-4 p-2">   
                        <img src="gray.png" className="w-25 h-18 md:w-32 md:h-25 lg:w-34 lg:h-28 xl:w-40 xl:h-35 rounded-2xl lg:rounded-4xl"></img>
                        <div className="w-full pl-2 md:pl-4 lg:pl-6 xl:pl-10">
                          <div className="flex flex-col gap-1 lg:gap-2 xl:gap-3 pt-2 md:pt-4">
                            <div className="flex justify-between">
                              <a className="text-sm md:text-xl lg:text-3xl xl:text-4xl font-bold">{re.fullname}</a>
                              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold">{re.date ? formatDateToThaiShort(re.date) : 'ไม่มีวันที่'}</a>
                            </div>
                            <a className="text-xs md:text-sm lg:text-xl xl:text-2xl">{re.message}</a>
                            
                          </div>
                            <div className="flex justify-end pt-4">
                                    <EmpRating_one score={re.score} cl="#7B6ADA"/>
                            </div>
                          
                        </div> 
                      </div> 
                    </div>
                  ))}
                  {/* /end loop for review/ */}
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
                    <div 
                      className="flex flex-col justify-center w-full h-30 md:h-30 lg:h-40 mb-2 p-4 bg-[#D9D9D9] rounded-3xl" 
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                      
                    </div>
                  </div>
              </div>    
              
        </div>
        )}

        {queryType === "volunteer" && (
          <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:py-14">
          
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">เกี่ยวกับ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{findvolun[0]?.about_volun}</div>
              </div>
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">วิสัยทัศน์</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{findvolun[0]?.vission}</div>
              </div>

              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">พันธกิจ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{findvolun[0]?.mission}</div>
              </div>
              {/* image */}
              <div className="flex justify-center gap-2">
                <img src="gray.png" 
                  className="w-50 h-50 md:w-60 md:h-60 lg:w-80 lg:h-80 xl:w-90 xl:h-90 rounded-2xl lg:rounded-4xl">
                </img>
                <div className="grid grid-cols-2 gap-1">
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                  <img src="gray.png" 
                    className="w-25 h-24 md:w-30 md:h-30 lg:w-40 lg:h-40 xl:w-45 xl:h-45 rounded-2xl lg:rounded-4xl">
                  </img>
                </div>
              </div>
              {/* table job */}
              <div className="flex flex-col justify-center items-center py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">กิจกรรมจิตอาสา</p>
                <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      ทั้งหมด {volunCount} กิจกรรม
                </div>
                {/* งานแต่ละแถวเริ่มนี่ วนงาน */}
                  {volun_post.map((post) => (
                    <div key={post.post_id} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold">{post.activity_name ? (post.activity_name) : 'ชื่อกิจกรรม'}</p>
                        <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : 'ไม่มีวันที่'}</p>
                      </div>
                      <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                        <table>
                          <tbody>
                            <tr className="lg:h-10 xl:h-12">
                              <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                              <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">วัน เวลา</a></td>
                              <td className="w-50 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.date ? formatDateToThaiShort(post.date) : 'ไม่มีวันที่'} {post.time}</a></td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#7B6ADA" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">สถานที่</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.location} ต.{post.tb} อ.{post.ap} จ.{post.jw}</a></td>
                            </tr>
                            
                          </tbody>
                        </table>
                        
                      </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => goToVolunDetails(post.post_id)}
                            className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                          >รายละเอียด</button>
                        </div>
                    </div>
                  ))}
                  {/* /end loop for job/ */}
              </div>
              {/* /end flex job/ */}

              {/* table review */}

              <div className="flex flex-col justify-center items-center py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">รีวิวจากผู้ที่ทำกิจกรรม</p>
                <div className="flex flex-col gap-1 justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <span>คะแนนเฉลี่ย</span><EmpRating_volun emp_id={id} cl="#7B6ADA" />
                </div>
                {/* reviewแต่ละแถวเริ่มนี่ loop review */}
                  {volun_review.map((re , index) => (
                    <div key={index} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <div className="flex gap-4 p-2">   
                        <img src="gray.png" className="w-25 h-18 md:w-32 md:h-25 lg:w-34 lg:h-28 xl:w-40 xl:h-35 rounded-2xl lg:rounded-4xl"></img>
                        <div className="w-full pl-2 md:pl-4 lg:pl-6 xl:pl-10">
                          <div className="flex flex-col gap-1 lg:gap-2 xl:gap-3 pt-2 md:pt-4">
                            <div className="flex justify-between">
                              <a className="text-sm md:text-xl lg:text-3xl xl:text-4xl font-bold">{re.fullname}</a>
                              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold">{re.date ? formatDateToThaiShort(re.date) : 'ไม่มีวันที่'}</a>
                            </div>
                            <a className="text-xs md:text-sm lg:text-xl xl:text-2xl">{re.message}</a>
                            
                          </div>
                            <div className="flex justify-end pt-4">
                                    <EmpRating_one score={re.score} cl="#7B6ADA"/>
                            </div>
                          
                        </div> 
                      </div> 
                    </div>
                  ))}
                  {/* /end loop for review/ */}
              </div>
              {/* /end review/ */}

              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ติดต่อ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{emp[0]?.address} ต.{emp[0]?.tb} อ.{emp[0]?.ap} จ.{emp[0]?.jw}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{emp[0]?.contact}</div>
              </div>
              <div id="section2">
                  <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">แผนที่สถานที่ทำกิจกรรม</p>
                    <div 
                      className="flex flex-col justify-center w-full h-30 md:h-30 lg:h-40 mb-2 p-4 bg-[#D9D9D9] rounded-3xl" 
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                      
                    </div>
                  </div>
              </div>    
              
        </div>
        )}

        

        <Footer />
      </div>
    )
}

export default Emp_Pf