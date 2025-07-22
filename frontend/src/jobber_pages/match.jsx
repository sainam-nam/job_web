import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../jobber_comp/navbar";
import Footer from "../jobber_comp/footer";
import { jwtDecode } from "jwt-decode";
import { FaCircle } from "react-icons/fa";


function Match() {
  const [post, setPost] = useState([]);
  //const [postCount, setPostCount] = useState([]);
  const [userId, setUserId] = useState(null);
  const [jvtype, setJVType ] = useState("job");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [volunPost, setVolunPost] = useState([]);
  const [volunPage, setVolunPage] = useState(1);
  const [volunTotal, setVolunTotal] = useState();
  const [volunTotalPages, setVolunTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ถ้าไม่มี token อาจ redirect ไป login

      window.location.href = "/login";
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.jobber_id); // ✅ สมมุติว่า backend ใส่ user_id มาใน token
    } catch (error) {
      console.error("Invalid token", error);
      window.location.href = "/login";
    }
    
    // const updateLimit = () => {
    //   const width = window.innerWidth;

    //   if (width >= 640) {
    //     // sm: < 640px
    //     setLimit(6);
    //   } else if (width >= 768) {
    //     // md: < 768px
    //     setLimit(8);
    //   } else if (width >= 1024) {
    //     // lg: < 1024px
    //     setLimit(12);
    //   } else {
    //     // xl และใหญ่กว่า
    //     setLimit(15);
    //   }
    // };

    // // รันตอนแรก
    // updateLimit();

    // // ฟัง event resize
    // window.addEventListener("resize", updateLimit);
    // return () => window.removeEventListener("resize", updateLimit);

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
        'totalPages' in result ) {
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

  return (
    <div>
        <Navbar />
        
          <img src="/match.png" className="w-full" />
          
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex items-center justify-center mt-5">
                <a className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl text-[#7B6ADA] font-bold">ผลการจับคู่</a>
                {/* <a className="text-xs sm:text-sm md:text-lg text-[#7B6ADA] font-bold pl-1 pt-0.5">จับคู่ งาน กับ คุณสมบัติที่คุณได้ลงไว้</a> */}
            </div>
            <div className="relative flex items-center justify-center mb-3 lg:mb-2 lg:mt-2 xl:mb-4 xl:mt-4">
                <button onClick={() =>{setJVType("job");}} className={`-ml-5 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl text-sm sm:text-md md:text-lg lg:text-xl border-3 pt-0.5 px-12 w-1/3 rounded-full  ${jvtype === "job" ? "z-10 bg-[#7B6ADA] border-[#7B6ADA]" : "z-0 bg-white text-[#7B6ADA] border-[#7B6ADA]"}`}>งาน</button>
                <button onClick={() =>{setJVType("volun");}} className={`-ml-5 md:-ml-7 lg:-ml-9 btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl text-sm sm:text-md md:text-lg lg:text-lg border-3 pt-0.5 px-5 lg:px-0 lg:pl-4  w-1/3 rounded-full ${jvtype === "job" ? "z-0 bg-white text-[#7B6ADA] border-[#7B6ADA]" : "z-10 bg-[#7B6ADA] border-[#7B6ADA]"}`}>กิจกรรมจิตอาสา</button>
            </div>
            {jvtype === 'job' ? (
              <>
                <div className="flex flex-col items-center justify-center pt-2">
                  <a className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-[#7B6ADA] font-bold">จับคู่ งาน กับ คุณสมบัติที่คุณได้ลงไว้</a> 
              </div>
              {total > 0 ? (
                <>
                  <div className="flex flex-col items-center justify-center gap-2 mt-2">        
                    <button 
                      className=" btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl text-white border-[#7B6ADA] bg-[#7B6ADA] rounded-lg xl:rounded-3xl">
                      ดูคุณสมบัติของคุณเอง
                    </button>
                    <a className="text-[7px] sm:text-xs md:text-sm lg:text-lg xl:text-xl text-[#7B6ADA] font-bold">เผื่อคุณจะลืมว่าตัวเองลงคุณสมบัติอะไรไว้บ้าง สามารถแก้ไขได้</a> 
                  </div>
              
                  {/* table job */}
                            <div className="flex flex-col justify-center items-center mx-3 py-2 sm:p-4 md:px-8 lg:py-6 lg:px-12 xl:px-30">
                              <div className="flex flex-col justify-center w-full p-2 sm:p-3 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold sm:text-sm lg:text-2xl xl:text-3xl border-b" >
                                    จับคู๋ได้ทั้งหมด {total} งาน
                              </div>
                              {/* งานแต่ละแถวเริ่มนี่ วนงาน */}
                                {post.map((post) => (
                                  <div key={post.post_id} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-3xl font-bold">{post.position_name ? (post.position_name) : 'ตำแหน่งงาน'}</p>
                                      <p className="text-[8px] font-bold sm:text-sm md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : 'ไม่มีวันที่'}</p>
                                    </div>
                                    <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                                      <table>
                                        <tbody>
                                          <tr className="sm:h-6 lg:h-9 xl:h-10">
                                            <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                                            <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">เงินเดือน</a></td>
                                            <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.salary} บาท/เดือน</a></td>
                                          </tr>
                                          <tr className="sm:h-6 lg:h-9 xl:h-10">
                                            <td><FaCircle color="#7B6ADA" size={12} /></td>
                                            <td><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">จำนวน</a></td>
                                            <td><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.num_position} อัตรา</a></td>
                                          </tr>
                                          <tr className="sm:h-6 lg:h-9 xl:h-10">
                                            <td><FaCircle color="#7B6ADA" size={12} /></td>
                                            <td><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">สถานที่</a></td>
                                            <td><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.address} ต.{post.tb} อ.{post.ap} จ.{post.jw}</a></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      
                                    </div>
                                      <div className="flex justify-end">
                                        <button 
                                          onClick={() => goToProfile(post.post_id)}
                                          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                                        >รายละเอียด</button>
                                      </div>
                                  </div>
                                ))}
                                {/* /end loop for job/ */}
                            </div>
                            {/* /end flex  job/ */}
              
                            {/* table review */}

                            <center>
                              <div className="join items-center gap-2 my-2">
                                {page > 1 && (
                                  <button onClick={() => setPage(page - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                                )}

                              
                                <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">{page}/{totalPages}</button>
                              

                                {page < totalPages && (
                                  <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                                )}
                              </div>
                            </center>
                </>
                ) : (
                  <>
                    <div className="bg-white p-4 sm:p-8 lg:px-12 xl:px-20">
                      <div className="flex flex-col items-center justify-center w-full bg-[#D9D9D9] rounded-3xl lg:rounded-4xl py-5 gap-2">
                        <img src="nodata.png" className="w-2/3 lg:w-3/5 xl:w-3/7" />
                        <a className="text-xs sm:text-sm md:text-lg lg:text-2xl text-[#7B6ADA] font-bold">ยังไม่มีงานที่ตรงกับคุณสมบัติของคุณ</a> 
                        <button 
                          className=" btn btn-xs sm:btn-sm md:btn-lg lg:btn-xl text-white border-[#7B6ADA] bg-[#7B6ADA] rounded-lg xl:rounded-3xl">
                          ดูงานอื่นๆ
                        </button>
                        <a className="text-[7px] sm:text-xs md:text-sm lg:text-lg text-[#7B6ADA] font-bold">แต่คุณสามารถดูงานและสมัครงานได้โดยตัวคุณเอง</a> 
                    
                      </div>
                    </div>
                  </>
                )
              }
                    {/* <div className="flex flex-col items-center justify-center w-full bg-[#D9D9D9] rounded-3xl py-5 gap-2">
                      <img src="nodata.png" className="w-2/3" />
                      <a className="text-xs sm:text-sm md:text-lg text-[#7B6ADA] font-bold">อุ๊บ!!! ไม่พบข้อมูลคุณสมบัติของคุณ</a> 
                      <button 
                        className=" btn btn-xs sm:btn-sm md:btn-md lg:btn-lg text-white border-[#7B6ADA] bg-[#7B6ADA] rounded-lg xl:rounded-3xl">
                        ลงข้อมูล
                      </button>
                      <a className="text-[7px] sm:text-xs md:text-sm text-[#7B6ADA] font-bold">โปรดลงข้อมูลคุณสมบัติเพื่อจับคู่งาน</a> 
                  
                    </div> */}
              </>
            ):(
              <>
              <div className="flex flex-col items-center justify-center pt-2">
                  <a className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-[#7B6ADA] font-bold">จับคู่ กิจกรรมจิตอาสา กับ คุณสมบัติที่คุณได้ลงไว้</a> 
              </div>
              {volunTotal > 0 ? (
                <>
                  <div className="flex flex-col items-center justify-center gap-2 mt-2">        
                    <button 
                      className=" btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl text-white border-[#7B6ADA] bg-[#7B6ADA] rounded-lg xl:rounded-3xl">
                      ดูคุณสมบัติของคุณเอง
                    </button>
                    <a className="text-[7px] sm:text-xs md:text-sm lg:text-lg xl:text-xl text-[#7B6ADA] font-bold">เผื่อคุณจะลืมว่าตัวเองลงคุณสมบัติอะไรไว้บ้าง สามารถแก้ไขได้</a> 
                  </div>
              
                  {/* table job */}
                            <div className="flex flex-col justify-center items-center mx-3 py-2 sm:p-4 md:px-8 lg:py-6 lg:px-12 xl:px-30">
                              <div className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-[#D9D9D9] text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                                    จับคู๋ได้ทั้งหมด {volunTotal} กิจกรรม
                              </div>
                              {/* งานแต่ละแถวเริ่มนี่ วนงาน */}
                                {volunPost.map((post) => (
                                  <div key={post.post_id} className="flex flex-col justify-center w-full p-2 lg:p-4 xl:p-6 bg-white text-[#7B6ADA] text-xs font-bold lg:text-2xl xl:text-3xl border-b" >
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-3xl font-bold">{post.activity_name ? (post.activity_name) : 'ตำแหน่งงาน'}</p>
                                      <p className="text-[8px] font-bold sm:text-sm md:text-sm lg:text-xl xl:text-2xl text-right pt-1">วันที่ลงประกาศ {post.post_day ? formatDateToThaiShort(post.post_day) : 'ไม่มีวันที่'}</p>
                                    </div>
                                    <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                                      <table>
                                        <tbody>
                                          <tr className="sm:h-6 lg:h-9 xl:h-10">
                                            <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                                            <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">วัน เวลา</a></td>
                                            <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{formatDateToThaiShort(post.date)} {post.time}</a></td>
                                          </tr>
                                          
                                          <tr className="sm:h-6 lg:h-9 xl:h-10">
                                            <td><FaCircle color="#7B6ADA" size={12} /></td>
                                            <td><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">สถานที่</a></td>
                                            <td><a className="text-[10px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">{post.location} ต.{post.tb} อ.{post.ap} จ.{post.jw}</a></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      
                                    </div>
                                      <div className="flex justify-end">
                                        <button 
                                          onClick={() => goToProfile(post.post_id)}
                                          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-[#7B6ADA] bg-[#7B6ADA] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl"
                                        >รายละเอียด</button>
                                      </div>
                                  </div>
                                ))}
                                {/* /end loop for job/ */}
                            </div>
                            {/* /end flex  job/ */}
              
                            {/* table review */}

                            <center>
                              <div className="join items-center gap-2 my-2">
                                {page > 1 && (
                                  <button onClick={() => setPage(page - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                                )}

                              
                                <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">{page}/{totalPages}</button>
                              

                                {page < totalPages && (
                                  <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                                )}
                              </div>
                            </center>
                </>
                ) : (
                  <>
                    <div className="bg-white p-4 sm:p-8 lg:px-12 xl:px-20">
                      <div className="flex flex-col items-center justify-center w-full bg-[#D9D9D9] rounded-3xl lg:rounded-4xl py-5 gap-2">
                        <img src="nodata.png" className="w-2/3 lg:w-3/5 xl:w-3/7" />
                        <a className="text-xs sm:text-sm md:text-lg lg:text-2xl text-[#7B6ADA] font-bold">ยังไม่มีกิจกรรมที่ตรงกับคุณสมบัติของคุณ</a> 
                        <button 
                          className=" btn btn-xs sm:btn-sm md:btn-lg lg:btn-xl text-white border-[#7B6ADA] bg-[#7B6ADA] rounded-lg xl:rounded-3xl">
                          ดูกิจกรรมอื่นๆ
                        </button>
                        <a className="text-[7px] sm:text-xs md:text-sm lg:text-lg text-[#7B6ADA] font-bold">แต่คุณสามารถดูกิจกรรมจิตอาสาและลงทะเบียนกิจกรรมได้โดยตัวคุณเอง</a> 
                    
                      </div>
                    </div>
                  </>
                )
              }
                    {/* <div className="flex flex-col items-center justify-center w-full bg-[#D9D9D9] rounded-3xl py-5 gap-2">
                      <img src="nodata.png" className="w-2/3" />
                      <a className="text-xs sm:text-sm md:text-lg text-[#7B6ADA] font-bold">อุ๊บ!!! ไม่พบข้อมูลคุณสมบัติของคุณ</a> 
                      <button 
                        className=" btn btn-xs sm:btn-sm md:btn-md lg:btn-lg text-white border-[#7B6ADA] bg-[#7B6ADA] rounded-lg xl:rounded-3xl">
                        ลงข้อมูล
                      </button>
                      <a className="text-[7px] sm:text-xs md:text-sm text-[#7B6ADA] font-bold">โปรดลงข้อมูลคุณสมบัติเพื่อจับคู่งาน</a> 
                  
                    </div> */}
              </>
            )}
              
                      

         </div>
          
            <Footer />
          
    </div>
  );
}

export default Match;
