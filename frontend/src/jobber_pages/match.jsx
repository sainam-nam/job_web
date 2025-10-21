import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../jobber_comp/navbar";
import Footer from "../jobber_comp/footer";
import { jwtDecode } from "jwt-decode";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaHandsHelping } from "react-icons/fa";

function Match() {
  const [post, setPost] = useState([]);
  //const [postCount, setPostCount] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState([]);
  const [jvtype, setJVType ] = useState("job");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const [hd, setHd] = useState();
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [volunPost, setVolunPost] = useState([]);
  const [volunPage, setVolunPage] = useState(1);
  const [volunTotal, setVolunTotal] = useState();
  const [volunTotalPages, setVolunTotalPages] = useState(1);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [profileStatusCode, setProfileStatusCode] = useState(null);
  const navigate = useNavigate();

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
        //console.log(res.data.user.jobber_id);
        })
        .catch(err => {
        console.error(err);
        // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
        alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
        window.location.href = "/login";
        });
        
        
    
      }, []);

  useEffect(() => {
    if (userId) {
      fetchData(userId);
    }
  }, [userId , page]);

  useEffect(() => {
    if (userId) {
      volunFetchData(userId);
    }
  }, [userId , volunPage]);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileStatus = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/profile_check_all?jobber_id=${userId}`);
        const data = await res.json();
        if (data.code) {
          setProfileStatusCode(data.code); // เช่น "11110"
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchProfileStatus();
  }, [userId]);


  function formatDateToThaiShort(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
        const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

        return `${day}/${month}/${year}`;
    }
  const fetchData = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/user_job_match?jobber_id=${id}&page=${page}&limit=${limit}`);
      const result = await res.json();

      if (typeof result === 'object' && 
        'totalRecords' in result && 
        'totalPages' in result  ) {
        setTotal(result.totalRecords);
        setTotalPages(result.totalPages || 1);
      } else {
        console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      }

      if(Array.isArray(result.postMatch)){
          //console.log("sql", res)
          setPost(result.postMatch);
            
        } else {
          console.error("Data format error:", result);
          setPost([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };
const volunFetchData = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/user_volun_match?jobber_id=${id}&page=${volunPage}&limit=${limit}`);
      const result = await res.json();

      if (typeof result === 'object' && 
        'totalRecords' in result && 
        'totalPages' in result ) {
        setVolunTotal(result.totalRecords);
        setVolunTotalPages(result.totalPages || 1);
      } else {
        console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      }

      if(Array.isArray(result.postMatch)){
          //console.log("sql", res)
          setVolunPost(result.postMatch);
        } else {
          console.error("Data format error:", result);
          setVolunPost([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleMenuClick = async (type) => {
    try {
      const res = await fetch(`${apiUrl}/api/profile_check/${type}?jobber_id=${userId}`); // เช่น personal, education
      const data = await res.json();

      if (data.exists) {
        navigate(`/profile/${type}/view`);
      } else {
        navigate(`/profile/${type}/add`);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาด", err);
    }
  };

  const goToProfile = (val , inter,posi ,matchPercent) => {
    navigate(`/job_match?i=${val}&inter_work=${inter}&posi=${posi}&percent=${matchPercent}`,
      {state: { from: location.pathname }});
    window.scrollTo(0,0);
  };

    

  return (
    <div>
        {userData && <Navbar user={userData} />}
        
          <img src="/match2.png" className="w-full" />
          
        <div className="flex flex-col min-h-screen bg-white xl:px-15">
            <div className="flex items-center justify-center mt-5">
                <a className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl text-[#8E80FF] font-bold">ผลการจับคู่</a>
                {/* <a className="text-xs sm:text-sm md:text-lg text-[#8E80FF] font-bold pl-1 pt-0.5">จับคู่ งาน กับ คุณสมบัติที่คุณได้ลงไว้</a> */}
            </div>
            <div className="relative flex items-center justify-center mb-3 lg:mb-2 lg:mt-2 xl:mb-4 xl:mt-4">
                <button onClick={() =>{setJVType("job");}} className={`-ml-5 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl text-sm sm:text-md md:text-lg lg:text-xl border-3 pt-0.5 px-12 w-1/3 rounded-full  ${jvtype === "job" ? "z-10 bg-[#8E80FF] border-[#8E80FF]" : "z-0 bg-white text-[#8E80FF] border-[#8E80FF]"}`}>งาน</button>
                <button onClick={() =>{setJVType("volun");}} className={`-ml-5 md:-ml-7 lg:-ml-9 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl text-sm sm:text-md md:text-lg lg:text-lg border-3 pt-0.5 px-5 lg:px-0 lg:pl-4  w-1/3 rounded-full ${jvtype === "job" ? "z-0 bg-white text-[#8E80FF] border-[#8E80FF]" : "z-10 bg-[#8E80FF] border-[#8E80FF]"}`}>กิจกรรมจิตอาสา</button>
            </div>
            {jvtype === 'job' ? (
              <>
                <div className="flex flex-col items-center justify-center pt-2">
                  <a className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-[#8E80FF] font-bold">จับคู่ งาน กับ คุณสมบัติที่คุณได้ลงไว้</a> 
              </div>
              { profileStatusCode?.substring(0, 4).includes("0") ? (
                <>
                    <div className="bg-white p-4 sm:p-8 lg:px-12 xl:px-20">
                      <div className="flex flex-col items-center justify-center w-full bg-[#D9D9D9] rounded-3xl lg:rounded-4xl py-5 gap-2">
                        <img src="nodata.png" className="w-2/3 lg:w-3/5 xl:w-3/7" />
                        <a className="text-xs sm:text-sm md:text-lg lg:text-2xl text-[#8E80FF] font-bold">คุณยังกรอกข้อมูลไม่ครบโปรดกรอกข้อมูลก่อน</a> 
                        <button 
                          onClick={() => handleMenuClick("info")}
                          className=" btn btn-xs sm:btn-sm md:btn-lg lg:btn-xl text-white border-[#8E80FF] bg-[#8E80FF] rounded-lg xl:rounded-3xl">
                          กรอกข้อมูลก่อน
                        </button>
                    
                      </div>
                    </div>
                  </>
                ) : total > 0 ? (
                <>
                  <div className="flex flex-col items-center justify-center gap-2 mt-2">        
                    <button 
                      onClick={() => navigate("/profile/info/view")}
                      className=" btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl text-white border-[#8E80FF] bg-[#8E80FF] rounded-lg xl:rounded-3xl">
                      ดูคุณสมบัติของคุณเอง
                    </button>
                    <a className="text-[7px] sm:text-xs md:text-sm lg:text-lg xl:text-xl text-[#8E80FF] font-bold">เผื่อคุณจะลืมว่าตัวเองลงคุณสมบัติอะไรไว้บ้าง สามารถแก้ไขได้</a> 
                  </div>
              
                  {/* table job */}
                            <div className="flex flex-col justify-center items-center mx-3 py-2 sm:p-4 md:px-8 lg:py-6 lg:px-12 xl:px-40">
                              <div className="flex flex-col justify-center w-full p-2 sm:p-3 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#8E80FF] text-xs font-bold sm:text-sm lg:text-2xl border-b rounded-t-3xl" >
                                    จับคู่ได้ทั้งหมด {total} งาน
                              </div>
                              {/* งานแต่ละแถวเริ่มนี่ วนงาน */}
                                {post.map((post , index) => {
                                  const matchingCount = post.matching.split("").filter(ch => ch === "1").length;
                                  //console.log("matching =", post.matching, "matchingCount =", matchingCount);

                                  const hsCount = post.hs ? post.hs.split(",").filter(id => id.trim() !== "").length : 0;
                                  //console.log("hs =", post.hs, "hsCount =", hsCount);

                                  const ssCount = post.ss ? post.ss.split(",").filter(id => id.trim() !== "").length : 0;
                                  //console.log("ss =", post.ss, "ssCount =", ssCount);

                                  const totalMatch = matchingCount + hsCount + ssCount;
                                  //console.log("totalMatch =", totalMatch);

                                  const matchPercent = Math.round((totalMatch / post.hd) * 100);
                                  //console.log("matchPercent =", matchPercent);

                                  const notMatchPercent = 100 - matchPercent;
                                  //console.log("notMatchPercent =", notMatchPercent);

                                  return(
                                    <div key={index} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#8E80FF] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-bold">{post.position_name ? (post.position_name) : 'ตำแหน่งงาน'}</p>
                                        <p className="text-[8px] font-bold sm:text-sm md:text-sm lg:text-xl xl:text-xl text-right pt-1">วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : 'ไม่มีวันที่'}</p>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-xl font-bold">ผู้โพสต์ {post.fullname ? (post.fullname) : 'ตำแหน่งงาน'}</p>
                                      </div>
                                      <div className="flex items-center justify-center mt-2 md:mt-4">
                                        <div className="my-2 w-3/4">
                                            {/* หัวข้อ */}
                                            
                                            <p className="text-[10px] md:text-sm text-[#8E80FF] font-semibold mb-1">
                                              ค่าความตรงกับคุณสมบัติ
                                            </p>

                                            {/* แถบรวมตรง-ไม่ตรง */}
                                            <div className="w-full bg-[#C0BBEB] rounded-full h-10 relative overflow-hidden">
                                              {/* แถบฝั่งตรง */}
                                              <div
                                                className="bg-[#8E80FF] h-10 rounded-full"
                                                style={{ width: `${matchPercent}%` }}
                                              ></div>

                                              {/* ข้อความกำกับซ้าย-ขวา */}
                                              <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] md:text-xs font-bold">
                                                <span className="text-white">ตรง {matchPercent}%</span>
                                                <span className="text-[#8E80FF]">ไม่ตรง {notMatchPercent}%</span>
                                              </div>
                                            </div>
                                          </div>
                                        
                                      </div>
                                        <div className="flex mt-2 justify-end">
                                          <button 
                                            onClick={() => goToProfile(post.post_id  , post.inter_work_id , post.position_id , matchPercent)}
                                            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-[#8E80FF] bg-[#8E80FF] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                                          >รายละเอียด</button>
                                        </div>
                                    </div>
                                  )
                                })}
                                {/* /end loop for job/ */}
                            </div>
                            {/* /end flex  job/ */}
              
                            {/* table review */}

                            <center>
                              <div className="join items-center gap-2 my-2">
                                {page > 1 && (
                                  <button onClick={() => setPage(page - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#8E80FF] transition-shadow" /></button>
                                )}

                              
                                <button className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">{page}/{totalPages}</button>
                              

                                {page < totalPages && (
                                  <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#8E80FF] transition-shadow" /></button>
                                )}
                              </div>
                            </center>
                </>
                ) :  (
                  <>
                    <div className="bg-white p-4 sm:p-8 lg:px-12 xl:px-20">
                      <div className="flex flex-col items-center justify-center w-full bg-[#D9D9D9] rounded-3xl lg:rounded-4xl py-5 gap-2">
                        <img src="nodata.png" className="w-2/3 lg:w-3/5 xl:w-3/7" />
                        <a className="text-xs sm:text-sm md:text-lg lg:text-2xl text-[#8E80FF] font-bold">ยังไม่มีงานที่ตรงกับคุณสมบัติของคุณ</a> 
                        <button 
                          onClick={() => navigate("/User/alljob")}
                          className=" btn btn-xs sm:btn-sm md:btn-lg lg:btn-xl text-white border-[#8E80FF] bg-[#8E80FF] rounded-lg xl:rounded-3xl">
                          ดูงานอื่นๆ
                        </button>
                        <a className="text-[7px] sm:text-xs md:text-sm lg:text-lg text-[#8E80FF] font-bold">แต่คุณสามารถดูงานและสมัครงานได้โดยตัวคุณเอง</a> 
                    
                      </div>
                    </div>
                  </>
                )
              }
                    {/* <div className="flex flex-col items-center justify-center w-full bg-[#D9D9D9] rounded-3xl py-5 gap-2">
                      <img src="nodata.png" className="w-2/3" />
                      <a className="text-xs sm:text-sm md:text-lg text-[#8E80FF] font-bold">อุ๊บ!!! ไม่พบข้อมูลคุณสมบัติของคุณ</a> 
                      <button 
                        className=" btn btn-xs sm:btn-sm md:btn-md lg:btn-lg text-white border-[#8E80FF] bg-[#8E80FF] rounded-lg xl:rounded-3xl">
                        ลงข้อมูล
                      </button>
                      <a className="text-[7px] sm:text-xs md:text-sm text-[#8E80FF] font-bold">โปรดลงข้อมูลคุณสมบัติเพื่อจับคู่งาน</a> 
                  
                    </div> */}
              </>
            ):(
              <>
                <div className="bg-white p-6 sm:p-10 lg:px-16 xl:px-24">
                  <div className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-[#EDEAFF] to-[#D9D9D9] rounded-3xl lg:rounded-4xl py-12 gap-4 text-center shadow-lg">
                    
                    {/* ไอคอนในวงกลม */}
                    <div className="flex items-center justify-center w-20 h-20 sm:w-50 sm:h-50 rounded-full bg-white shadow-md">
                      <FaHandsHelping className="text-[#8E80FF] text-4xl sm:text-6xl" size={120}/>
                    </div>

                    {/* ข้อความหลัก */}
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-[#8E80FF] mt-4">
                      ฟีเจอร์กิจกรรมจิตอาสา
                    </h2>

                    {/* ข้อความรอง */}
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
                      กำลังจะมาในเร็วๆนี้ โปรดรอติดตาม ✨
                    </p>

                    {/* ปุ่มย้อนกลับ */}
                    <button 
                    onClick={() => navigate("/User/alljob")}
                    className="mt-6 px-6 py-2 rounded-full bg-[#8E80FF] text-white font-semibold shadow-md hover:bg-[#7768e5] transition">
                      กลับไปดูงานอื่นๆ
                    </button>
                  </div>
                </div>

              </>
            )}
              
                      

         </div>
          
            <Footer />
          
    </div>
  );
}

export default Match;
