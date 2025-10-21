import { useLocation } from "react-router-dom";
import React, { useState , useEffect } from "react"
  // State for review score and message

import Navbar from "../jobber_comp/navbar";
import Footer from "../jobber_comp/footer";
import EmpRating from "./emp_star";
import { FaCircle , FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import axios from "axios";
import { MapView } from "../comp/map_view";
import { FaHeart } from "react-icons/fa";
import RatingReview from "./RatingReview";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Review_emp() {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [applied, setApplied] = useState(false);
  const [stars, setStars] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [showDe , setShowDe] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
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
      
      const res = await fetch(`${apiUrl}/jobpost?post_id=${id}`);
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
    navigate(`/viewEmp_Pf?emp_id=${val}`, {
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
    navigate("/Admin/jjob"); // หรือ default fallback
  }
};



useEffect(() => {
    fetch(`${apiUrl}/emp_rating?emp_id=${data[0]?.emp_id}`)
      .then(res => res.json())
      .then(data => setStars(data.stars || 0));
  }, [data[0]?.emp_id ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/api/jobber_review`, {
        jobber_id: userId,
        emp_id: data[0]?.emp_id,
        message: reviewMessage,
        score: reviewScore,
        post_id: id,
      });
      if (res.data.success) {
        // setStatus('ส่งรีวิวเรียบร้อยแล้ว');
        // alert('ส่งรีวิวเรียบร้อยแล้ว');
        // setReviewScore(0);
        // setReviewMessage('');
        document.getElementById('success_modal').showModal();
        navigate("/User/alljob");
      } else {
        // setStatus('ส่งไม่สำเร็จ: ' + res.data.message);
      }
    } catch (err) {
      console.error(err);
    //   setStatus('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const [date , setDate] = useState([]); 
  useEffect(() => {
      const dateaccpted = async () => {
        try {
          
          const res = await fetch(`${apiUrl}/date_accptedjob?jobber_id=${userId}&post_id=${id}`);
          const result = await res.json();
      
          if(Array.isArray(result.data)){
              //console.log("sql", res)
              setDate(result.data);
            } else {
              console.error("Data format error:", result);
              setDate([]);
            }
      
        } catch (err) {
          console.error('Fetch error:', err);
        }
      };
      dateaccpted();
    }, [userId]);
    
   function formatDateTimeToThaiShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543; // ปี พ.ศ.
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

    return (
      <div>
        {userData && <Navbar user={userData} />}

        <div className="bg-[#8E80FF] pl-2 md:pl-4 lg:pl-6 xl:pl-8">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl border-white p-2 md:p-3 lg:p-4 xl:p-5  bg-white text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl "
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="6">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="relative w-full group">
          <img src="/jobber_review.png" className="w-full" />
        </div>
        {/* <center><h1>Job post {id}</h1></center> */}
        <div className="flex justify-between bg-white text-[#8E80FF] items-center w-full px-35 py-5">
              <div className="flex flex-col text-xs md:text-xl lg:text-3xl font-bold">
                <a className="text-sm">
                    ตำแหน่งงาน
                </a> 
                <div className="flex items-center gap-1">
                    {data[0]?.position_name}
                    <button 
                        onClick={() => setShowDe(!showDe)}
                        className="btn btn-lg text-white bg-[#8E80FF] border border-[#8E80FF] rounded-xl p-1 md:p-2 lg:p-3">
                        {showDe ? 'ซ่อนรายละเอียดงาน':'ดูรายละเอียดงาน'}
                    </button>
                </div>
              </div>
              <p className="text-[8px] font-bold md:text-sm lg:text-xl text-right pt-1">วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}</p>
            </div>
        <div className="flex flex-row bg-white text-[#8E80FF] items-center justify-center gap-2  px-7 pb-5 md:px-20 md:pb-7 lg:px-30 lg:pb-14 xl:px-50 xl:pb-10 py-10"> 
          
          <div className="avatar">
            <div className="w-24 sm:w-28 md:w-35 lg:w-60 rounded-4xl">
              {data[0]?.picture ? (
                            <img src={`/uploads/emp_pic/${data[0]?.picture}`} />
                          ) : (
                            <img src={`/uploads/nophoto.png`}  />
                          )}
            </div>
          </div>          
          <div className="w-full pl-2 md:pl-4 lg:pl-6 xl:pl-10">
            <div className="flex flex-col gap-1 lg:gap-2 xl:gap-5">
                <div className="flex gap-5 items-center">          
                    <a className="text-md md:text-xl lg:text-3xl xl:text-5xl font-bold">
                        {data[0]?.fullname}
                    </a>
                    
                    <button 
                        onClick={() => goToProfile(data[0]?.emp_id)}
                        className="btn btn-lg text-white bg-[#8E80FF] border border-[#8E80FF] rounded-xl p-1 md:p-2 lg:p-3"
                    >ดูโปร์ไฟล์</button>      
                    </div>
              {stars !== 0 && (
                        <>
                            {/* <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-3 lg:pt-4">คะแนนรีวิว</a> */}
                            <div className="flex justify-between">
                                <EmpRating emp_id={data[0]?.emp_id} cl="#FFD400"/>
                            </div>
                        </>
                    )}
              <table>
                <tbody>
                  <tr className="lg:h-10 xl:h-12">
                    <td><FaCircle color="#8E80FF" size={12} /></td>
                    <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">วันที่ตอบตกลงทำงาน</a></td>
                    <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">{date[0]?.date_time && formatDateTimeToThaiShort(date[0]?.date_time)}</a></td>
                  </tr>
                  <tr className="lg:h-10 xl:h-12">
                    <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#8E80FF" size={12} /></td>
                    <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">ค่าตอบแทน</a></td>
                    <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">
                        {(() => {
                                      const salaryStr = data[0]?.salary || '';
                                      if (!salaryStr || salaryStr === '0') return 'ไม่ระบุค่าตอบแทน';
                                      const [min, max] = salaryStr.split('-').map(s => Number(s));
                                      if ((min || 0) === 0 && (max || 0) === 0) return 'ไม่ระบุ';
                                      if ((min || 0) === 0) return `${max.toLocaleString()} บาท`;
                                      if ((max || 0) === 0) return `${min.toLocaleString()} บาท`;
                                      if (min === max) return `${min.toLocaleString()} บาท`;
                                      return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
                                    })()} 
                    </a></td>
                  </tr>
                  <tr className="lg:h-10 xl:h-12">
                    <td><FaCircle color="#8E80FF" size={12} /></td>
                    <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">สถานที่ทำงาน</a></td>
                    <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</a></td>
                  </tr>
                </tbody>
              </table>

              
              <div className="flex justify-end gap-2 mt-2 md:mt-5">
                
              </div>
              
            </div>

            
          </div>  
        </div>
        {showDe && (
            <>
                <div className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:py-14">
                
                <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">รายละเอียด</p>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                    {data[0]?.details && (
                            <div
                            className="prose prose-sm md:prose lg:prose-lg"
                            dangerouslySetInnerHTML={{ __html: data[0].details }}
                            ></div>
                        )}
                    </div>
                </div>
                <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">คุณสมบัติ</p>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10"><b>อายุ</b> {data[0]?.age}</div>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                    <b>เพศ</b>
                    {data[0]?.gender === "M"
                            ? " ชาย"
                            : data[0]?.gender === "F"
                            ? " หญิง"
                            : data[0]?.gender || "ไม่ระบุ"}
                            
                            
                    </div>
                    {data[0]?.experience && (  
                      <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                        <b>ประสบการณ์</b> 
                          <div
                            className="prose prose-sm md:prose lg:prose-lg ml-3"
                            dangerouslySetInnerHTML={{ __html: data[0].experience }}
                          ></div>
                      </div>
                    )}

                    
                    {data[0]?.education_code === 0 ? (
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10 mt-2">
                        <b>การศึกษา</b>  ไม่จำกัดวุฒิการศึกษา
                        </div>
                    ) : (
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10 mt-2">
                        <b>การศึกษา</b> {data[0]?.edu_name}
                        </div>
                    )}
                    
                                
                    {hs.length === 0 ?  (
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10 mt-2">
                        ไม่มีการกำหนดทักษะด้านความรู้
                        </div>
                    ):(
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10 mt-2 ">
                        <a>ทักษะด้านความรู้ที่ควรมี</a>
                        {hs.map((hs , index) =>(

                            <p className="ml-4">{index+1}.{hs.hardskill_name} </p>
                            
                        ))}
                        </div>
                    )}

                    {ss.length === 0 ?  (
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10 mt-2">
                        ไม่มีการกำหนดทักษะด้านอารมณ์
                        </div>
                    ):(
                        <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10 mt-2 ">
                        <a>ทักษะด้านความรู้ที่ควรมี</a>
                        {ss.map((ss , index) =>(

                            <p className="ml-4">{index+1}.{ss.softskill_name} </p>
                            
                        ))}
                        </div>
                    )}

                    {data[0]?.notes && (
                          <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10 mt-2">
                            <b>หมายเหตุ</b> {data[0]?.notes && (
                              <div
                                className="prose prose-sm md:prose lg:prose-lg ml-3"
                                dangerouslySetInnerHTML={{ __html: data[0].notes }}
                              ></div>
                            )}
                          </div>
                        )}


                </div>
                <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">สวัสดิการพื้นฐาน</p>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                    {data[0]?.benefits && (
                            <div
                            className="prose prose-sm md:prose lg:prose-lg"
                            dangerouslySetInnerHTML={{ __html: data[0].benefits }}
                            ></div>
                        )}
                    </div>
                </div>
                <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">เวลาทำงาน</p>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">{renderWorkSchedule(data[0]?.days)}</div>
                    {data[0]?.hour && data[0]?.end_hour ? (
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                        เวลา {data[0]?.hour} - {data[0]?.end_hour} น.
                    </div>
                    ):(
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                        เวลาการทำงานไม่ตายตัว / ตามตกลง
                    </div>
                    )}
                    

                </div>
                <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">ติดต่อ</p>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">{data[0]?.location} ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</div>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                    
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
                        <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">แผนที่สถานที่ทำงาน</p>
                        {data.length > 0 && data[0].latitude && data[0].longitude && (
                                            <div className="flex flex-col justify-center w-full mb-2 p-4 bg-[#8E80FF] rounded-3xl" 
                                                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                            <MapView
                                                latitude={data[0].latitude}
                                                longitude={data[0].longitude}
                                                name=""
                                                h="300px"
                                            />
                                            </div>
                                        )}
                    </div>
                </div> 
                    <div className="flex justify-center mb-10">
                        <button 
                            onClick={() => setShowDe(!showDe)}
                            className="btn btn-lg text-white bg-[#8E80FF] border border-[#8E80FF] rounded-xl p-1 md:p-2 lg:p-3">
                            {showDe ? 'ซ่อนรายละเอียดงาน':'ดูรายละเอียดงาน'}
                        </button>
                    </div>
                </div>
                
            </>
        )}      
        <form onSubmit={(e) => {
            e.preventDefault();
            document.getElementById('confirm_modal').showModal();
            }}>

            <div className="bg-white text-[#8E80FF] flex flex-col justify-center px-5 md:px-15 lg:px-25 xl:px-35 pb-10">  
                <div className="flex items-center justify-center gap-5">
                    <a className="text-3xl font-bold ">ให้คะแนน</a>
            <RatingReview
            initialScore={reviewScore}
            onChange={setReviewScore}
            />
                </div>
                <div className="flex flex-col items-center justify-center w-full mt-5">
                    <div className="flex flex-col w-1/2">
                        <a className="text-2xl font-bold ">ความคิดเห็นเพิ่มเติม</a>
            <textarea 
                className="w-full h-40 border-2 border-[#8E80FF] rounded-xl p-3 text-sm md:text-lg"
                value={reviewMessage}
                onChange={e => setReviewMessage(e.target.value)}
            />
                    </div>
                </div>
                <div className="flex justify-center mt-10">
                    <button 
                        //onClick={() => saveReview()}
                        className="btn btn-lg text-white bg-[#8E80FF] border border-[#8E80FF] rounded-xl p-1 md:p-2 lg:p-3"
                    >ให้คะแนน</button> 
                </div>
            </div>
        </form>
        <Footer />

        {/* Modal ยืนยันก่อนส่งคะแนน */}
    <dialog id="confirm_modal" className="modal">
      <div className="modal-box bg-white">
        <div className="flex flex-col items-center justify-center"> 
            <h3 className="font-bold text-2xl text-[#8E80FF] text-center">ยืนยันการให้คะแนน</h3>
        </div>
        <div className="modal-action flex justify-center gap-2">
          <button className="btn bg-[#8E80FF] border border-[#8E80FF] rounded-lg text-white" 
                onClick={(e) => handleSubmit(e)}>
            ยืนยัน</button>
          <button className="btn bg-gray-300 border border-gray-300 text-black" 
            onClick={() => document.getElementById('confirm_modal').close()}>
            ยกเลิก</button>
        </div>
      </div>
    </dialog>


    <dialog id="success_modal" className="modal">
      <div className="modal-box bg-white max-w-6xl">
        <div className="flex flex-col items-center justify-center"> 
            <h3 className="font-bold text-lg text-[#8E80FF] text-center">ยืนยันการให้คะแนน</h3>
        </div>
        <div className="modal-action flex justify-center gap-2">
          <button className="btn bg-[#8E80FF] border border-[#8E80FF] rounded-lg text-white" 
                onClick={(e) => handleSubmit(e)}>
            ยืนยัน</button>
          <button className="btn bg-gray-300 border border-gray-300 text-black" 
            onClick={() => document.getElementById('confirm_modal').close()}>
            ยกเลิก</button>
        </div>
      </div>
    </dialog>
        <dialog id="success_modal" className="modal">
            <div className="modal-box bg-white max-w-md">
                <div className="flex flex-col items-center justify-center space-y-4 p-6">
                {/* ไอคอนใหญ่ */}
                <FaCheckCircle className="text-[#8E80FF] text-6xl" />
                
                <h3 className="font-bold text-lg text-center text-[#8E80FF]">
                    บันทึกคะแนนและความคิดเห็นเรียบร้อยแล้ว
                </h3>

                <button
                    className="btn bg-[#8E80FF] border border-[#8E80FF] text-white mt-4"
                    onClick={() => document.getElementById('success_modal').close()}
                >
                    ปิด
                </button>
                </div>
            </div>
        </dialog>
      </div>
    )
}

export default Review_emp