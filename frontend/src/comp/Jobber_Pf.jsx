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

function jobber_Pf() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("i");

  //const [selectedTab, setSelectedTab] = useState("job"); // 'job' หรือ 'volunteer'

    
  const [jobber, setJobber] = useState([]);
  const [interests_work, setInterWork] = useState([]);
  const [hs, setHs] = useState([]);
  const [ss, setSs] = useState([]);
  const [job_matched, setJobMatched] = useState([]);
  const [interests_volun, setInterVolun] = useState([]);
  const [volun_matched, setVolunMatched] = useState([]);
  const [job_matchedCount, setJobMCount] = useState([]);
  const [volun_matchedCount, setVolunMCount] = useState([]);
  const [work_exper, setWorkExper] = useState([]);

  useEffect(() => {
          fetchData();
         }, [id]);
// jobber,
//interests_work,
//hs,
//ss,
//job_matched,
//interests_volun,
//volun_matched,
//job_matchedCount: job_matchedCount[0].job_matchedCount,
//volun_matchedCount: volun_matchedCount[0].volun_matchedCount
      
  
  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8081/jobber_pf?jobber_id=${id}`);
      const result = await res.json();

      if (typeof result === 'object' && 
        'job_matchedCount' in result && 
        'volun_matchedCount' in result ) {
        setJobMCount(result.job_matchedCount);
        setVolunMCount(result.volun_matchedCount);
      } else {
        console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      }

      if(Array.isArray(result.jobber)){
          //console.log("sql", res)
          setJobber(result.jobber);
        } else {
          console.error("Data format error:", result);
          setJobber([]);
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
      if(Array.isArray(result.job_matched)){
          //console.log("sql", res)
          setJobMatched(result.job_matched);
        } else {
          console.error("Data format error:", result);
          setJobMatched([]);
        }

      if(Array.isArray(result.interests_volun)){
          //console.log("sql", res)
          setInterVolun(result.interests_volun);
        } else {
          console.error("Data format error:", result);
          setInterVolun([]);
        }

      if(Array.isArray(result.volun_matched)){
          //console.log("sql", res)
          setVolunMatched(result.volun_matched);
        } else {
          console.error("Data format error:", result);
          setVolunMatched([]);
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
  function formatDateToThaiShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
    const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

    return `${day}/${month}/${year}`;
  }
  
  const handleTabClick = (type) => {
    navigate(`/Jobber_Pf?i=${id}&type=${type}`);
    window.scrollTo(0,0);
  };
  const queryType = queryParams.get("type") || "job"; // default เป็น "job"

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
    navigate(`/Job_Post?pi=${val}`);
    window.scrollTo(0,0);
  };
  const goToVolunPost = (val) => {
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
                <a className="text-md md:text-xl lg:text-3xl xl:text-5xl font-bold">{jobber[0]?.fullname}</a>
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
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-3 lg:pt-4">เพศ {jobber[0]?.gender}</a>
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold">ต.{jobber[0]?.tb} อ.{jobber[0]?.ap} จ.{jobber[0]?.jw}</a>
              <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-2">{(jobber[0]?.work_status) === "JOB" ? "ได้งานแล้ว" : "หางานอยู่"}</a>

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
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ประวัติการศึกษา</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10"><b>ระดับการศึกษา</b> {jobber[0]?.edu_name}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10"><b>วุฒิการศึกษา</b> {jobber[0]?.qualification}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10"><b>สถานบัน</b> {jobber[0]?.institution}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10"><b>คณะ / สาขา</b> {jobber[0]?.major}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10"><b>วันที่จบการศึกษา</b> {jobber[0]?.year_graduat}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10"><b>เกรด / ผลการเรียน</b> {jobber[0]?.grade}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10"><b>ระดับการศึกษา</b> {jobber[0]?.edu_cert}</div>
              </div>
              

              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ประสบการณ์การทำงาน</p>
                {/* table experjob */}
              <div className="flex flex-col justify-center items-center">
                
                {/* ประสบการณ์งานแต่ละแถวเริ่มนี่ วนปสกงาน */}
                  
                    <div  className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl" >
                      
                      <div className="flex items-center justify-center ">
                        <table >
                          <tbody>
                            <tr className="bg-[#7B6ADA] text-white h-8 border-b">
                              <th className="w-5 md:w-10 lg:w-10 xl:w-15">ที่</th>
                              <th className="w-40 md:w-40 lg:w-50 xl:w-60">ตำแหน่งงาน</th>
                              <th className="w-30 md:w-80 lg:w-90 xl:w-100">บริษัท</th>
                              <th className="w-20 md:w-80 lg:w-90 xl:w-100">ระยะเวลา</th>
                            </tr>
                            {work_exper.map((work) => (
                              <tr key={work.no} className="h-15 lg:h-15 xl:h-12 border-b">
                                <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{work.no}</a></td>
                                <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{work.position_name}</a></td>
                                <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{work.company}</a></td>
                                <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{work.duration}</a></td>

                              </tr>
                            ))}
                            

                          </tbody>
                        </table>
                        
                      </div>
                        
                    </div>
                  
                  {/* /end loop for exper/ */}
              </div>
              {/* /end flex exper/ */}
              </div>
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">งานที่สนใจ</p>
                  {/* table interest_work */}
                  <div className="flex flex-col justify-center items-center">
                    
                    {/* ประสบการณ์งานแต่ละแถวเริ่มนี่ วนปสกงาน */}
                      
                        <div  className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl" >
                          
                          <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                            <table>
                              <tbody>
                                <tr className="bg-[#7B6ADA] text-white h-8 border-b">
                                  <th className="w-5 md:w-10 lg:w-10 xl:w-15">ที่</th>
                                  <th className="w-50 md:w-40 lg:w-50 xl:w-60">ตำแหน่งงาน</th>
                                  <th className="w-20 md:w-80 lg:w-90 xl:w-100">เงินเดือน</th>
                                  <th className="w-30 md:w-80 lg:w-90 xl:w-100">วัน เวลาที่ต้องการ</th>
                                  
                                  
                                </tr>
                                {interests_work.map((work , index) => (
                                  <tr key={index+1} className="h-15 lg:h-10 xl:h-12 border-b">
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{index+1}</a></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{work.position_name}</a></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{work.salary}</a></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{work.hours}{renderWorkSchedule(work.days)}</a></td>
                                    
                                    

                                  </tr>
                                ))}
                                

                              </tbody>
                            </table>
                        
                      </div>
                        
                    </div>
                  
                  {/* /end loop for exper/ */}
              </div>
              {/* /end flex exper/ */}              </div>
              

              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ทักษะ</p>
                <p className="text-sm md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-5 mb-1 md:ml-4 md:mb-2">ทักษะด้านความรู้</p>
                {hs.map((hs , index) => (
                  <div key={index+1} className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-7 md:ml-10">{index+1}. {hs.hardskill_name}</div>
                ))}
                <p className="text-sm md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-5 mb-1 md:ml-4 md:mb-2">ทักษะด้านอารมณ์</p>
                {ss.map((ss , index) => (
                  <div key={index+1} className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-7 md:ml-10">{index+1}. {ss.softskill_name}</div>
                ))}              </div>
              
              {/* table job */}
              <div className="flex flex-col py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-2 md:ml-4 md:mb-2">งานที่จับคู่แล้ว</p>
                <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      ทั้งหมด {job_matchedCount} งาน
                </div>
                {/* งานแต่ละแถวเริ่มนี่ วนงาน */}
                  {job_matched.map((post) => (
                    <div key={post.post_id} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold">{post.position_name ? (post.position_name) : 'ตำแหน่งงาน'}</p>
                        <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่จับคู่ {post.date_time ? formatDateToThaiShort(post.date_time) : 'ไม่มีวันที่'}</p>
                      </div>
                      <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                        <table>
                          <tbody>
                            <tr className="lg:h-10 xl:h-12">
                              <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                              <td className="w-30 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">ค่าที่คุณสมบัติตรง</a></td>
                              <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.match} %</a></td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#7B6ADA" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">ค่าที่คุณสมบัติไม่ตรง</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.not_match} %</a></td>
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
              
        </div>
        )}

        {queryType === "volunteer" && (
          <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:py-14">
          
              
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">กิจกรรมจิตอาสาที่สนใจ</p>
                  {/* table interest_work */}
                  <div className="flex flex-col justify-center items-center">
                    
                    {/* ประสบการณ์งานแต่ละแถวเริ่มนี่ วนปสกงาน */}
                      
                        <div  className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl" >
                          
                          <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                            <table>
                              <tbody>
                                <tr className="bg-[#7B6ADA] text-white h-8 border-b">
                                  <th className="w-5 md:w-10 lg:w-10 xl:w-15">ที่</th>
                                  <th className="w-50 md:w-40 lg:w-50 xl:w-60">ประเภทกิจกรรมจิตอาสา</th>
                                  <th className="w-30 md:w-80 lg:w-90 xl:w-100">วัน เวลาที่สะดวก</th>
                                  
                                  
                                </tr>
                                {interests_volun.map((volun , index) => (
                                  <tr key={index+1} className="h-15 lg:h-10 xl:h-12 border-b">
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{index+1}</a></td>
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{volun.voluntype_name}</a></td>
                                    
                                    <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{volun.hours}{renderWorkSchedule(volun.days)}</a></td>
                           
                                  </tr>
                                ))}
                                

                              </tbody>
                            </table>
                        
                      </div>
                        
                    </div>
                  
                  {/* /end loop for exper/ */}
              </div>
              {/* /end flex exper/ */}              </div>
              

              
              {/* table job */}
              <div className="flex flex-col py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-2 md:ml-4 md:mb-2">กิจกรรมที่จับคู่แล้ว</p>
                <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      ทั้งหมด {volun_matchedCount} งาน
                </div>
                {/* งานแต่ละแถวเริ่มนี่ วนงาน */}
                  {volun_matched.map((post) => (
                    <div key={post.post_id} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold">{post.activity_name ? (post.activity_name) : 'ตำแหน่งงาน'}</p>
                        <p className="text-[8px] font-bold md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่จับคู่ {post.date_time ? formatDateToThaiShort(post.date_time) : 'ไม่มีวันที่'}</p>
                      </div>
                      <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                        <table>
                          <tbody>
                            <tr className="lg:h-10 xl:h-12">
                              <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                              <td className="w-30 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">ค่าที่คุณสมบัติตรง</a></td>
                              <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.match} %</a></td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#7B6ADA" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">ค่าที่คุณสมบัติไม่ตรง</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.not_match} %</a></td>
                            </tr>
                            
                          </tbody>
                        </table>
                        
                      </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => goToVolunPost(post.post_id)}
                            className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                          >รายละเอียด</button>
                        </div>
                    </div>
                  ))}
                  {/* /end loop for job/ */}
              </div>
              {/* /end flex job/ */}
              
        </div>
        )}

        

        <Footer />
      </div>
    )
}

export default jobber_Pf