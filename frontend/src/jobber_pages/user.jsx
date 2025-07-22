import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../jobber_comp/navbar";
import Menu from "../jobber_comp/menu";
import Footer from "../jobber_comp/footer";
import SideBar_Type from "../jobber_comp/sidebar_type";
import { Outlet } from "react-router-dom";
import { MdOutlineSearch } from "react-icons/md";
import EmpCard from "../jobber_comp/emp_card";
import EmpRating_volun from "../jobber_comp/emp_star_volun";
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_BASE_URL;


function User() {
  const [userData, setUserData] = useState([]);
  const [limit, setLimit] = useState(4);
  const [empData, setEmpData] = useState([]);
  const [empPage, setEmpPage] = useState(1);
  const [empTotal, setEmpTotal] = useState();
  const [empTotalPages, setEmpTotalPages] = useState(1);
  const [empSearch, setEmpSearch ] = useState("");

  const [findVolunData, setFindVolunData] = useState([]);
  const [findVolunPage, setFindVolunPage] = useState(1);
  const [findVolunTotal, setFindVolunTotal] = useState();
  const [findVolunTotalPages, setFindVolunTotalPages] = useState(1);
  const [findVolunSearch, setFindVolunSearch ] = useState("");
  const [isProfileComplete, setIsProfileComplete] = useState(false);
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
      //console.log(res.data.user);
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
    empDataCard();
    findVolunDataCard();
    
    const updateLimit = () => {
      const width = window.innerWidth;

      if (width >= 640) {
        // sm: < 640px
        setLimit(6);
      } else if (width >= 768) {
        // md: < 768px
        setLimit(8);
      } else if (width >= 1024) {
        // lg: < 1024px
        setLimit(12);
      } else {
        // xl และใหญ่กว่า
        setLimit(15);
      }
    };

    // รันตอนแรก
    updateLimit();

    // ฟัง event resize
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, [findVolunPage , empPage , limit , findVolunSearch , empSearch]);

  const empDataCard = async () => {
    try {
      const res = await fetch(`${apiUrl}/emp_card?page=${empPage}&limit=${limit}&keyword=${empSearch}`);
      const result = await res.json();

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setEmpData(result.data);
        //console.log(result.data);
      } else {
        console.error("Data format error:", result);
        setEmpData([]);
      }
      setEmpTotal(result.totalRecords);
      setEmpTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    }
  };

  const findVolunDataCard = async () => {
    try {
      const res = await fetch(`${apiUrl}/findvolun_card?page=${findVolunPage}&limit=${limit}&keyword=${findVolunSearch}`);
      const result = await res.json();

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setFindVolunData(result.data);
        //console.log(result.data);
      } else {
        console.error("Data format error:", result);
        setFindVolunData([]);
      }
      setFindVolunTotal(result.totalRecords);
      setFindVolunTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    }
  };

  // if (!userData) return <div>Loading...</div>;

  const checkProfileCompletion = async () => {
    if (!userData.jobber_id) return;

    const sections = ['info', 'edu', 'work_ex', 'inter_work', 'inter_volun'];
    let complete = true;

    for (let section of sections) {
      try {
        const res = await fetch(`${apiUrl}/api/profile_check/${section}?jobber_id=${userData.jobber_id}`);
        const result = await res.json();
        if (!result.exists) {
          complete = false;
          break;
        }
      } catch (err) {
        console.error("Error checking section:", section, err);
        complete = false;
        break;
      }
    }

    setIsProfileComplete(complete);
  };

  useEffect(() => {
    if (userData.jobber_id) {
      checkProfileCompletion(); // ตรวจว่ากรอกครบไหม
    }
  }, [userData?.jobber_id]);

  if (!userData) {
  return <div>Loading...</div>;
}
  return (
    <div>
        {userData && <Navbar user={userData} />}
        <div className="relative w-full group">
          <img src="/user.png" className="w-full" />
          {!isProfileComplete ? (
              <>
                <button 
                  className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-15 h-4.5 sm:w-18 sm:h-5 md:w-25 md:h-7 lg:w-30 lg:h-9 xl:w-40 xl:h-10 bg-white border-white text-[7px] md:text-xs lg:text-sm xl:text-2xl text-[#7B6ADA] rounded-lg xl:rounded-3xl absolute top-8/11 left-3/5 xl:top-10/14 xl:left-9/15 -translate-x-1/2 -translate-y-1/2"
                  onClick={() => navigate("/profile/status")}
                >
                  กรอกข้อมูล
                </button>

                <p className="text-[7px] md:text-xs lg:text-sm xl:text-md text-white absolute top-8/11 left-3/5 xl:top-12/14 xl:left-2/4 -translate-x-1/5 -translate-y-1/2">
                  กรอกข้อมูลให้ครบถ้วนเพื่อความแม่นยำในการจับคู่งานหรือกิจกรรมจิตอาสา
                </p>
              </>
            ) : (
              <p className="text-sm md:text-md lg:text-lg xl:text-2xl text-white font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                ✅ คุณพร้อมสำหรับการสมัครงานหรือเข้าร่วมกิจกรรมจิตอาสาแล้ว!
              </p>
            )}

        </div>
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex flex-col lg:flex-row justify-center ">
              <div className="flex px-10 sm:px-20 md:px-35 lg:px-0"><SideBar_Type /></div>
              <div className="flex-1 sm:px-3 md:px-10 lg:px-0">
                <Outlet />
              </div>
            </div>
            {/* ad */}
            <div className="flex justify-center items-center py-5 sm:px-5 md:px-8 lg:px-10">
              <div className="carousel w-full h-50 sm:h-60 md:h-70 lg:h-90">
                <div id="slide1" className="carousel-item relative w-full">
                  <img src="/gray.png" className="w-full" />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a href="#slide3" className="text-[#7B6ADA]">❮</a>
                    <a href="#slide2" className="text-[#7B6ADA]">❯</a>
                  </div>
                </div> 
                <div id="slide2" className="carousel-item relative w-full">
                  <img src="/gray.png" className="w-full" />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a href="#slide1" className="text-[#7B6ADA]">❮</a>
                    <a href="#slide3" className="text-[#7B6ADA]">❯</a>
                  </div>
                </div> 
                <div id="slide3" className="carousel-item relative w-full">
                  <img src="/gray.png" className="w-full" />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a href="#slide2" className="text-[#7B6ADA]">❮</a>
                    <a href="#slide1" className="text-[#7B6ADA]">❯</a>
                  </div>
                </div>
              </div>
            </div>
            {/* ad */}

            {/* employer's card */}
              <div className="flex flex-col justify-center items-center w-full px-5 pt-3 sm:px-6 md:px-10">
                    <div className="flex items-center justify-center">
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#7B6ADA] font-bold">🔥นายจ้าง</span>
                      <span className="text-xs sm:text-sm md:text-lg lg:text-xl text-[#7B6ADA] font-bold pl-1 pt-1">สุดฮอต </span>
                    </div>

                    <label className="input w-50 md:w-70 h-7 lg:h-9 bg-white mb-2 rounded-lg border border-[#7B6ADA]">
                              <button>
                                <MdOutlineSearch className="fill-[#7B6ADA] mt-0 md:size-5" />
                              </button>
                              <input 
                                type="search" 
                                className="text-[#7B6ADA] text-xs md:text-sm lg:text-lg" 
                                placeholder="ชื่อนายจ้าง" 
                                value={empSearch}
                                onChange={(e) => {
                                  setEmpSearch(e.target.value);
                                  setEmpPage(1);
                                }}
                                
                              /> 
                    </label>
                    <div className="text-right text-[#7B6ADA] text-xs md:text-lg w-full mb-1 " >
                      เรียง : ..............
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {empData.map(emp => <EmpCard key={emp.emp_id} emp={emp} />)}
                    </div>
                    <center>
                      <div className="join items-center gap-2 my-2">
                        {empPage > 1 && (
                          <button onClick={() => setEmpPage(empPage - 1)}><img src="/up.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                        )}

                      {empTotal > 0 ? (
                        <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">{empPage}/{empTotalPages}</button>
                      ) : (
                        <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                      )
                      }

                        {empPage < empTotalPages && (
                          <button onClick={() => setEmpPage(empPage + 1)}><img src="/down.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                        )}
                      </div>
                    </center>
                  </div>
            {/* employer's card */}

            {/* findvolun's card */}
              <div className="flex flex-col justify-center items-center w-full px-5 pt-3 pb-3 sm:px-6 md:px-10 lg:pt-8">
                    <div className="flex items-center justify-center">
                      <span className="text-xs sm:text-sm md:text-lg lg:text-xl text-[#7B6ADA] font-bold pr-1 pt-1 lg:pt-2">ตัวตึง </span>
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#7B6ADA] font-bold">จัดกิจกรรม 🎯</span>
                    </div>

                    <label className="input w-50 md:w-70 h-7 lg:h-9 bg-white mb-2 rounded-lg border border-[#7B6ADA]">
                              <button>
                                <MdOutlineSearch className="fill-[#7B6ADA] mt-0 md:size-5" />
                              </button>
                              <input 
                                type="search" 
                                className="text-[#7B6ADA] text-xs md:text-sm lg:text-lg" 
                                placeholder="ชื่อผู้จัดกิจกรรม" 
                                value={empSearch}
                                onChange={(e) => {
                                  setFindVolunSearch(e.target.value);
                                  setFindVolunPage(1);
                                }}
                                
                              /> 
                    </label>
                    <div className="text-right text-[#7B6ADA] text-xs md:text-lg w-full mb-1 " >
                      เรียง : ..............
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {findVolunData.map(emp =>
                        <div key={emp.emp_id} className="card card-xs bg-white w-full shadow-lg rounded-2xl lg:rounded-3xl py-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                  
                          <div className="card-body">
                            <a className="flex justify-center font-bold text-xs  md:text-sm lg:text-lg text-[#7B6ADA]">{emp.fullname}</a>
                            <figure className="w-full p-0 m-0">
                              {emp.picture ? (
                                <img src={`/uploads/${emp.picture}`}  className="w-full rounded-3xl object-cover block" />
                              ) : (
                                <img src={`/uploads/nophoto.png`}  className="w-full rounded-3xl object-cover block" />
                              )}
                            </figure>
                            
                            <div className="flex justify-center lg:py-4">
                              <EmpRating_volun emp_id={emp.emp_id} cl="#7B6ADA" />
                              
                            </div>
                            
                            <div className="card-actions justify-center px-15">
                              <button 
                                
                                className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#7B6ADA] border-[#7B6ADA] rounded-lg"
                              >เยี่ยมชม</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <center>
                      <div className="join items-center gap-2 my-2">
                        {findVolunPage > 1 && (
                          <button onClick={() => setEmpPage(findVolunPage - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                        )}

                      {findVolunTotal > 0 ? (
                        <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">{findVolunPage}/{findVolunTotalPages}</button>
                      ) : (
                        <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                      )
                      }

                        {findVolunPage < findVolunTotalPages && (
                          <button onClick={() => setEmpPage(findVolunPage + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                        )}
                      </div>
                    </center>
                  </div>
            {/* findvolun's card */}
         </div>
          
            <Footer />
          
    </div>
  );
}

export default User;
