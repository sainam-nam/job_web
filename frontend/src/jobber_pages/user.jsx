import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../jobber_comp/navbar";
import Footer from "../jobber_comp/footer";
import Menu from "../jobber_comp/menu";
import { Outlet } from "react-router-dom";
import { MdOutlineSearch } from "react-icons/md";
import EmpCard from "../jobber_comp/emp_card";
import EmpRating_volun from "../jobber_comp/emp_star_volun";
import { useNavigate } from 'react-router-dom';
import JobCard from "../jobber_comp/job_card";
import VolunCard from "../jobber_comp/volun_card";
import { MdWorkOff } from "react-icons/md";
import One_volunCard from "../jobber_comp/onevolun_card";

const apiUrl = import.meta.env.VITE_API_BASE_URL;


function User() {
  const [data, setData] = useState([]);
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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const [totalPages, setTotalPages] = useState(1);

  const [jvtype, setJVType ] = useState("job");

  const [filterConditions, setFilterConditions] = useState({});
  const [volunfilterConditions, setVolunFilterConditions] = useState({});

  const [userId, setUserId] = useState([]);
  const [MJlimit, setMJLimit] = useState(3);
  const [MJdata, setMJData] = useState([]);
  const [MJpage, setMJPage] = useState(1);
  const [MJtotal, setMJTotal] = useState();
  const [MJtotalPages, setMJTotalPages] = useState(1);
  const [MVdata, setMVData] = useState([]);
  const [MVpage, setMVPage] = useState(1);
  const [MVtotal, setMVTotal] = useState();
  const [MVtotalPages, setMVTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  const [type, setType] = useState("j");

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

      if (width <= 640) {
        // sm: < 640px
        setLimit(6);
      } else if (width <= 768) {
        // md: < 768px
        setLimit(6);
      } else if (width <= 1024) {
        // lg: < 1024px
        setLimit(4);
      } else {
        // xl และใหญ่กว่า
        setLimit(4);
      }
    };

    // รันตอนแรก
    updateLimit();

    // ฟัง event resize
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, [findVolunPage , empPage , limit , findVolunSearch , empSearch]);

// ยิงครั้งแรกตอน mount
// useEffect(() => {
//   fetchData();
// }, []);

// ยิงเมื่อเปลี่ยน filter
useEffect(() => {
  if (userId) { // เช็คว่ามี userId ก่อน
    if (jvtype === 'job') {
       fetchData();
    } else {
      fetchVolunData();
    }
   
  }
}, [jvtype, limit, page, JSON.stringify(filterConditions), userId]);


  

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

  const handleFilterChange = (filters) => {
    console.log("🔍 Filters updated:", filters);
    setFilterConditions(filters);
  };



  const encodeBitString = (obj, order) => {
    return order.map(key => (obj[key] ? "1" : "0")).join("");
  };

  const weekdaysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat",  "Sun"];
  const employmentTypeOrder = ["fulltime", "parttime", "contract", "daily"];
  const experienceOrder = ["none", "year1", "year2", "year3plus"];
  const genderOrder = ["male", "female", "all"];

  const buildQueryParams = (params) => {
    const convertCheckedObjectToArray = (obj) => {
      return Object.entries(obj)
        .filter(([_, checked]) => checked === true)
        .map(([key]) => key);
    };
    return Object.entries(params)
      .filter(([_, value]) => value !== "" && value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === "boolean") {
          return `${encodeURIComponent(key)}=${value ? 1 : 0}`;
        } else if (typeof value === "object" && !Array.isArray(value)) {
          // กำหนด order ให้ตรงกับ key แต่ละ filter
          let bitString = "";
          if (key === "weekdays") {
            bitString = encodeBitString(value, weekdaysOrder);
          } else if (key === "employment_type") {
            bitString = encodeBitString(value, employmentTypeOrder);
          } else if (key === "experience") {
            bitString = encodeBitString(value, experienceOrder);
          } else if (key === "gender") {
            bitString = encodeBitString(value, genderOrder);
          } else {
            // กรณีอื่น ส่งเป็นค่าว่าง
            bitString = "";
          }
          return bitString ? `${encodeURIComponent(key)}=${bitString}` : null;
        } else if (Array.isArray(value)) {
          return value.length > 0 ? `${encodeURIComponent(key)}=${value.join(",")}` : null;
        } else {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
      })
      .filter(Boolean)
      .join("&");
  };

  const handleJVTypeChange = (type) => {
    setJVType(type);
    //console.log("JV Type ที่เลือก:", type);
  };


  const fetchData = async () => {
    try {
      const filters = buildQueryParams(filterConditions);
      const res = await fetch(`${apiUrl}/alljob_card?page=${page}&limit=6&${filters}&jobber_id=${userId}`);
      const result = await res.json();

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setData(result.data);
        console.log("comcomcom",result.data);
      } else {
        console.error("Data format error:", result);
        setData([]);
      }
      setTotal(result.totalRecords);
      setTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    }
  };

  const fetchVolunData = async () => {
    try {
      const filters = buildQueryParams(filterConditions);
      const res = await fetch(`${apiUrl}/allvolun_card?page=${page}&limit=6&${filters}&jobber_id=${userId}`);
      const result = await res.json();

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setData(result.data);
        //console.log(result.data);
      } else {
        console.error("Data format error:", result);
        setData([]);
      }
      setTotal(result.totalRecords);
      setTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    }
  };


  

  const goToProfile = (val , type) => {
    navigate(`/viewEmp_Pf?emp_id=${val}&type=${type}`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };

useEffect(() => {
    if (!userId) return;
    if (jvtype === 'job') {
       MJfetchData();
    } else {
      MVfetchData();
    }
    
  }, [jvtype , userId, MJpage, MJlimit, MVpage, search, type]);

  const MJfetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/myapply_job?jobber_id=${userId}&page=${MJpage}&limit=${MJlimit}&keyword=${search}&type=${type}`);
      const result = await res.json();
      //console.log("result=",result);

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setMJData(result.data);
        //console.log(result.data);
      } else {
        console.error("Data format error:", result);
        setMJData([]);
      }
      setMJTotal(result.totalRecords);
      setMJTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    }
  };

  const MVfetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/myapply_volun?jobber_id=${userId}&page=${MVpage}&limit=${MJlimit}&keyword=${search}&type=${type}`);
      const result = await res.json();
      //console.log("result=",result);

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setMVData(result.data);
        //console.log(result.data);
      } else {
        console.error("Data format error:", result);
        setMVData([]);
      }
      setMVTotal(result.totalRecords);
      setMVTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
        {userData && <Navbar user={userData} />}
        <div className="relative w-full group">
          <img src="/user2.png" className="w-full" />
          {!isProfileComplete ? (
              <>
                <button 
                  className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-15 h-4.5 sm:w-18 sm:h-5 md:w-25 md:h-7 lg:w-30 lg:h-9 xl:w-40 xl:h-10 bg-white border-white text-[7px] md:text-xs lg:text-sm xl:text-2xl text-[#8E80FF] rounded-lg xl:rounded-3xl absolute top-8/11 left-3/5 xl:top-10/15 xl:left-8/15"
                  onClick={() => navigate("/profile/info/view")}
                >
                  กรอกข้อมูล
                </button>

                <p className="text-[7px] md:text-xs lg:text-sm xl:text-md text-white absolute top-8/11 left-3/5 xl:top-12/14 xl:left-2/4 -translate-x-1/5 -translate-y-1/2">
                  กรอกข้อมูลให้ครบถ้วนเพื่อความแม่นยำในการจับคู่งานหรือกิจกรรมจิตอาสา
                </p>
              </>
            ) : (
              <p className="text-sm md:text-md lg:text-lg xl:text-xl text-white font-semibold absolute top-3/4 left-4/7 -translate-x-1/3 -translate-y-1/4">
                ✅ คุณพร้อมสำหรับการสมัครงานหรือเข้าร่วมกิจกรรมจิตอาสาแล้ว!
              </p>
            )}

        </div>
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex flex-col lg:flex-row justify-center px-40 gap-2 ">
              <div className="flex px-10 sm:px-20 md:px-35 lg:px-0 bg-white "><Menu onFilterChange={handleFilterChange} onJVTypeChange={handleJVTypeChange} /></div>
              <div className="flex-1 sm:px-3 md:px-10 lg:px-0">
                {jvtype === 'job' ? (
                  <div className="flex flex-col justify-center items-center w-full px-5 pt-3 lg:pt-5 lg:px-0 lg:pr-4">
                        <h1 className="text-lg md:text-3xl font-bold mb-2 text-[#8E80FF] my-3">งานที่ประกาศรับสมัคร [ {total} ]</h1>
                        
                        {/* <div className="text-right text-[#8E80FF] text-xs md:text-lg w-full mb-1 " >
                          เรียง : ..............
                        </div> */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-7">
                          {data.map((post, idx) => (
                            <JobCard key={idx} post={post} jobber_id={userId} />
                          ))}

                        </div>
                        <center>
                          <div className="join items-center gap-2 my-2">
                            {page > 1 && (
                              <button onClick={() => setPage(page - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
                            )}
                  
                          {total > 0 ? (
                            <button className="btn btn-xs  bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">{page}/{totalPages}</button>
                          ) : (
                            <button className="btn btn-xs  bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                          )
                          }
                  
                            {page < totalPages && (
                              <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
                            )}
                          </div>
                        </center>
                  </div>
                ):(
                  <div className="flex flex-col justify-center items-center w-full px-5 pt-3 lg:pt-5 lg:px-0 lg:pr-4">
                        <h1 className="text-lg md:text-3xl font-bold mb-2 my-3 text-[#8E80FF] ">กิจกรรมจิตอาสา [ {total} ]</h1>
                        
                        {/* <div className="text-right text-[#8E80FF] text-xs md:text-lg w-full mb-1 " >
                          เรียง : ..............
                        </div> */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-7">
                            {data.map(post => <VolunCard key={post.post_id} post={post} jobber_id={userId} />)}
                        </div>
                              <center>
                                <div className="join items-center gap-2 my-2">
                                  {page > 1 && (
                                    <button onClick={() => setPage(page - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
                                  )}
                        
                                {total > 0 ? (
                                  <button className="btn btn-xs  bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">{page}/{totalPages}</button>
                                ) : (
                                  <button className="btn btn-xs  bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                                )
                                }
                        
                                  {page < totalPages && (
                                    <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
                                  )}
                                </div>
                              </center>
                  </div>
                )}
                  

              </div>
            </div>
          {jvtype === 'job' ? (
            <div className="flex flex-col items-center w-full gap-2 bg-white">
                            
                            <div className="flex flex-col justify-center items-center w-full px-5 pt-3 lg:pt-5 lg:px-0 lg:pr-4">
                              <h1 className="text-lg md:text-3xl font-bold mb-2 text-[#8E80FF] my-3">
                                {type === "j" ? (
                                  <>งานที่สมัครเอง [ {MJtotal ? (MJtotal):("0")} ]</>
                                ) : type === "m" ? (
                                  <>งานที่สมัครจากการจับคู่ [ {MJtotal ? (MJtotal):("0")} ]</>
                                ) : type === "f" ? (
                                  <>งานที่สนใจ [ {MJtotal ? (MJtotal):("0")} ]</>
                                ) : (
                                  <>งานที่ปิดประกาศแล้ว [ {MJtotal ? (MJtotal):("0")} ]</>
                                )}
                              </h1>
                              <div className="tabs tabs-lift mb-3">
                                <button
                                  className={`tab  [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF]  ${type === "j" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("j");
                                    setMJPage(1);
                                  }}
                                >
                                  งานที่สมัครเอง
                                </button>
                                <button
                                  className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${type === "m" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("m");
                                    setMJPage(1);
                                  }}
                                >
                                  งานที่สมัครจากการจับคู่
                                </button>
                                <button
                                  className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${type === "f" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("f");
                                    setMJPage(1);
                                  }}
                                >
                                  งานที่สนใจ
                                </button>
                                {/* <button
                                  className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${type === "f" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("f");
                                    setMJPage(1);
                                  }}
                                >
                                  งานที่ปิดประกาศแล้ว
                                </button> */}
                              </div>
            
                                                    <div className="mb-3">
                                                      {MJdata.length === 0 && type === 'no' ? (
                                                        <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                                          <MdWorkOff className="text-7xl mb-6" />
                                                          <h2 className="text-xl font-semibold mb-2">
                                                            ยังไม่มีงานที่คุณเคยสมัครและจบไป
                                                          </h2>
                                                          <p className="text-sm text-gray-500">
                                                            คุณสามารถเลือกชมงานได้จากงานที่ประกาศด้านบน
                                                          </p>
                                                        </div>
                                                      ) : MJdata.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                                          <MdWorkOff className="text-7xl mb-6" />
                                                          <h2 className="text-xl font-semibold mb-2">
                                                            ยังไม่มีงานในหมวดนี้
                                                          </h2>
                                                          <p className="text-sm text-gray-500">
                                                            คุณสามารถเลือกชมงานได้จากงานที่ประกาศด้านบน
                                                          </p>
                                                          {/* <a
                                                            href="/User/alljob"
                                                            className="mt-4 px-5 py-2 bg-[#8E80FF] text-white rounded-full hover:bg-[#695bd6] transition"
                                                          >
                                                            ไปที่หน้าหลัก
                                                          </a> */}
                                                        </div>
                                                      ) : (
                                                        <div className="flex flex-col items-center">
                                                          {MJdata.length > 0 && (
                                                            <label className="input w-50 md:w-70 h-7 lg:h-9 bg-white my-5 rounded-lg border border-[#8E80FF]">
                                                              <button>
                                                                <MdOutlineSearch className="fill-[#8E80FF] mt-0 md:size-5" />
                                                              </button>
                                                              <input 
                                                                type="search" 
                                                                className="text-[#8E80FF] text-xs md:text-sm lg:text-lg" 
                                                                placeholder="ชื่อตำแหน่งงาน" 
                                                                value={search}
                                                                onChange={(e) => {
                                                                  setSearch(e.target.value);
                                                                  setMJPage(1);
                                                                }}
                                                            /> 
                                                            </label>
                                                          )}
                                                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 px-35">
                                                            {MJdata.map((post) => (
                                                              // <div key={post.post_id} className="indicator relative">
                                                              //   <span className="indicator-item badge badge-primary">{post.status}</span>
                                                              
                                                              <div className="relative">
                                                                <span 
                                                                  className={`absolute -top-4 -right-4 ${(post.type === 'f' && post.status === 'waitemp') ? '': post.status === 'waitemp'? 'bg-[#8E80FF]': post.status ==='waitjobber' ? 'bg-sky-500': post.status ==='accepted' ? 'bg-green-500' : post.status ==='rejected' ? 'bg-red-500' : post.status ==='expried' ? 'bg-gray-500' : 'bg-[#8E80FF]'} text-white text-base font-semibold px-3 py-1 rounded-full shadow z-50`}>
                                                                    {(post.type === 'f' && post.status === 'waitemp') ? '': 
                                                                    (post.status === 'waitemp' || post.status === '') ? 'รอนายจ้างตอบกลับ': 
                                                                    post.status ==='waitjobber' ? 'รอคุณตอบกลับ': 
                                                                    post.status ==='accepted' ? 'รับงานนี้แล้ว' : 
                                                                    post.status ==='rejected' ? 'นายจ้างปฏิเสธ' : 
                                                                    post.status ==='jb_rejected' ? 'คุณปฏิเสธ' :
                                                                    post.status ==='expried' ? 'หมดเวลาในการตอบกลับ' : 'รอนายจ้างตอบกลับ'}
                                                                </span>
                                                                <JobCard post={post} jobber_id={userId} />
                                                              </div>
                                                                
                                                              // </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
            
                                                    
                                                    <center>
                                                      <div className="join items-center gap-2 my-2">
                                                        {MJpage > 1 && (
                                                          <button onClick={() => setMJPage(MJpage - 1)}>
                                                            <img
                                                              src="/up.png"
                                                              className="-rotate-90 w-4 h-4 md:w-6 md:h-6 "
                                                            />
                                                          </button>
                                                        )}
            
                                                        {MJtotal > 0 && (
                                                          <button className="btn btn-xs  bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">
                                                            {MJpage}/{MJtotalPages}
                                                          </button>
                                                        )}
            
                                                        {MJpage < MJtotalPages && (
                                                          <button onClick={() => setMJPage(MJpage + 1)}>
                                                            <img
                                                              src="/down.png"
                                                              className="-rotate-90 w-4 h-4 md:w-6 md:h-6 "
                                                            />
                                                          </button>
            
                                                        )}
                                                      </div>
                                                    </center>
                                              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full gap-2 bg-white">
                            
                            <div className="flex flex-col justify-center items-center w-full px-5 pt-3 lg:pt-5 lg:px-0 lg:pr-4">
                              <h1 className="text-lg md:text-3xl font-bold mb-2 text-[#8E80FF] my-3">
                                {type === "j" ? (
                                  <>กิจกรรมที่สมัครเอง [ {MVtotal ? (MVtotal):("0")} ]</>
                                ) : type === "m" ? (
                                  <>กิจกรรมที่สมัครจากการจับคู่ [ {MVtotal ? (MVtotal):("0")} ]</>
                                ) : type === "f" ? (
                                  <>กิจกรรมที่สนใจ [ {MVtotal ? (MVtotal):("0")} ]</>
                                ) : (
                                  <>กิจกรรมที่ปิดประกาศแล้ว [ {MVtotal ? (MVtotal):("0")} ]</>
                                )}
                              </h1>
                              <div className="tabs tabs-lift mb-3">
                                <button
                                  className={`tab  [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF]  ${type === "j" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("j");
                                    setMVPage(1);
                                  }}
                                >
                                  กิจกรรมที่สมัครเอง
                                </button>
                                <button
                                  className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${type === "m" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("m");
                                    setMVPage(1);
                                  }}
                                >
                                  กิจกรรมที่สมัครจากการจับคู่
                                </button>
                                <button
                                  className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${type === "f" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("f");
                                    setMVPage(1);
                                  }}
                                >
                                  กิจกรรมที่สนใจ
                                </button>
                                {/* <button
                                  className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${type === "f" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                  onClick={() => {
                                    setType("f");
                                    setMJPage(1);
                                  }}
                                >
                                  งานที่ปิดประกาศแล้ว
                                </button> */}
                              </div>
            
                                                    <div className="mb-3">
                                                      {MVdata.length === 0 && type === 'no' ? (
                                                        <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                                          <MdWorkOff className="text-7xl mb-6" />
                                                          <h2 className="text-xl font-semibold mb-2">
                                                            ยังไม่มีกิจกรรมที่คุณเคยสมัครและจบไป
                                                          </h2>
                                                          <p className="text-sm text-gray-500">
                                                            คุณสามารถเลือกชมกิจกรรมได้จากกิจกรรมที่ประกาศด้านบน
                                                          </p>
                                                        </div>
                                                      ) : MVdata.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                                          <MdWorkOff className="text-7xl mb-6" />
                                                          <h2 className="text-xl font-semibold mb-2">
                                                            ยังไม่มีกิจกรรมในหมวดนี้
                                                          </h2>
                                                          <p className="text-sm text-gray-500">
                                                            คุณสามารถเลือกชมงานได้จากกิจกรรมที่ประกาศด้านบน
                                                          </p>
                                                          {/* <a
                                                            href="/User/alljob"
                                                            className="mt-4 px-5 py-2 bg-[#8E80FF] text-white rounded-full hover:bg-[#695bd6] transition"
                                                          >
                                                            ไปที่หน้าหลัก
                                                          </a> */}
                                                        </div>
                                                      ) : (
                                                        <div className="flex flex-col items-center">
                                                          {MVdata.length > 0 && (
                                                            <label className="input w-50 md:w-70 h-7 lg:h-9 bg-white my-5 rounded-lg border border-[#8E80FF]">
                                                              <button>
                                                                <MdOutlineSearch className="fill-[#8E80FF] mt-0 md:size-5" />
                                                              </button>
                                                              <input 
                                                                type="search" 
                                                                className="text-[#8E80FF] text-xs md:text-sm lg:text-lg" 
                                                                placeholder="ชื่อตำแหน่งงาน" 
                                                                value={search}
                                                                onChange={(e) => {
                                                                  setSearch(e.target.value);
                                                                  setMVPage(1);
                                                                }}
                                                            /> 
                                                            </label>
                                                          )}
                                                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 px-35">
                                                            {MVdata.map((post) => (
                                                              // <div key={post.post_id} className="indicator relative">
                                                              //   <span className="indicator-item badge badge-primary">{post.status}</span>
                                                              
                                                              <div className="relative">
                                                                <span 
                                                                  className={`absolute -top-4 -right-4 ${(post.type === 'f' && post.status === 'waitemp') ? '': post.status === 'waitemp'? 'bg-[#8E80FF]': post.status ==='waitjobber' ? 'bg-sky-500': post.status ==='accepted' ? 'bg-green-500' : post.status ==='rejected' ? 'bg-red-500' : post.status ==='expried' ? 'bg-gray-500' : 'bg-[#8E80FF]'} text-white text-base font-semibold px-3 py-1 rounded-full shadow z-50`}>
                                                                    {(post.type === 'f' && post.status === 'waitemp') ? '': 
                                                                    (post.status === 'waitemp' || post.status === '') ? 'รอผู้จัดกิจกรรมตอบกลับ': 
                                                                    post.status ==='waitjobber' ? 'รอคุณตอบกลับ': 
                                                                    post.status ==='accepted' ? 'รับงานนี้แล้ว' : 
                                                                    post.status ==='rejected' ? 'ผู้จัดกิจกรรมปฏิเสธ' : 
                                                                    post.status ==='jb_rejected' ? 'คุณปฏิเสธ' :
                                                                    post.status ==='expried' ? 'หมดเวลาในการตอบกลับ' : 'รอผู้จัดกิจกรรมตอบกลับ'}
                                                                </span>
                                                                <One_volunCard post={post} jobber_id={userId} />
                                                              </div>
                                                                
                                                              // </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
            {/* มาต่อตรงนี้ */}
                                                    
                                                    <center>
                                                      <div className="join items-center gap-2 my-2">
                                                        {MVpage > 1 && (
                                                          <button onClick={() => setMVPage(MVpage - 1)}>
                                                            <img
                                                              src="/up.png"
                                                              className="-rotate-90 w-4 h-4 md:w-6 md:h-6 "
                                                            />
                                                          </button>
                                                        )}
            
                                                        {MVtotal > 0 && (
                                                          <button className="btn btn-xs  bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">
                                                            {MVpage}/{MVtotalPages}
                                                          </button>
                                                        )}
            
                                                        {MVpage < MVtotalPages && (
                                                          <button onClick={() => setMVPage(MVpage + 1)}>
                                                            <img
                                                              src="/down.png"
                                                              className="-rotate-90 w-4 h-4 md:w-6 md:h-6 "
                                                            />
                                                          </button>
            
                                                        )}
                                                      </div>
                                                    </center>
                                              </div>
            </div>
          )}
          
            {/* ad */}
            <div className="flex justify-center items-center py-5 sm:px-5 md:px-8 lg:px-10 lg:py-12 lg:mt-10">
              <div className="flex flex-col items-center justify-center bg-gray-500 h-80 rounded-3xl w-4/5">
                <b className="text-6xl">พื้นที่โฆษณา</b>
                ติดต่อ jobvolun.service@gmail.com
              </div>
            {/* <div className="carousel carousel-center bg-white rounded-3xl w-full  space-x-5 p-4 overflow-x-auto"  style={{ boxShadow: '0 0 10px rgba(114, 114, 114, 0.54)' }}>
              <div className="carousel-item">
                <img
                  src="/banner.png"
                  className="rounded-3xl w-[780px] h-[400px] object-cover"
                />
              </div>
              <div className="carousel-item">
                <img
                  src="/banner2.png"
                  className="rounded-3xl w-[780px] h-[400px] object-cover"
                />
              </div>
              <div className="carousel-item">
                <img
                  src="/banner1.png"
                  className="rounded-3xl w-[780px] h-[400px] object-cover"
                />
              </div>
              <div className="carousel-item">
                <img
                  src="/banner.png"
                  className="rounded-3xl w-[780px] h-[400px] object-cover"
                />
              </div>
            </div> */}
          </div>

            {/* ad */}
            

            {/* employer's card */}
              <div className="flex flex-col justify-center items-center w-full px-5 pt-3 sm:px-6 md:px-30 pb-5">
                    <div className="flex items-center justify-center">
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#8E80FF] font-bold">🔥นายจ้าง</span>
                      <span className="text-xs sm:text-sm md:text-lg lg:text-xl text-[#8E80FF] font-bold pl-1 pt-1">สุดฮอต </span>
                    </div>

                    <label className="input w-50 md:w-70 h-7 lg:h-9 bg-white my-5 rounded-lg border border-[#8E80FF]">
                              <button>
                                <MdOutlineSearch className="fill-[#8E80FF] mt-0 md:size-5" />
                              </button>
                              <input 
                                type="search" 
                                className="text-[#8E80FF] text-xs md:text-sm lg:text-lg" 
                                placeholder="ชื่อนายจ้าง" 
                                value={empSearch}
                                onChange={(e) => {
                                  setEmpSearch(e.target.value);
                                  setEmpPage(1);
                                }}
                                
                              /> 
                    </label>
                    {/* <div className="text-right text-[#8E80FF] text-xs md:text-lg w-full mb-1 " >
                      เรียง : ..............
                    </div> */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {empData.map(emp => <EmpCard key={emp.emp_id} emp={emp} />)}
                    </div>
                    <center>
                      <div className="join items-center gap-2 my-2">
                        {empPage > 1 && (
                          <button onClick={() => setEmpPage(empPage - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
                        )}

                      {empTotal > 0 ? (
                        <button className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">{empPage}/{empTotalPages}</button>
                      ) : (
                        <button className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                      )
                      }

                        {empPage < empTotalPages && (
                          <button onClick={() => setEmpPage(empPage + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
                        )}
                      </div>
                    </center>
                  </div>
            {/* employer's card */}

            {/* findvolun's card */}
              <div className="flex flex-col justify-center items-center w-full px-5 pt-3 pb-3 sm:px-6 md:px-30 lg:pt-8">
                    <div className="flex items-center justify-center">
                      <span className="text-xs sm:text-sm md:text-lg lg:text-xl text-[#8E80FF] font-bold pr-1 pt-1 lg:pt-2"> </span>
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#8E80FF] font-bold">นักจัดกิจกรรม 🎯</span>
                    </div>

                    <label className="input w-50 md:w-70 h-7 lg:h-9 bg-white my-5 rounded-lg border border-[#8E80FF]">
                              <button>
                                <MdOutlineSearch className="fill-[#8E80FF] mt-0 md:size-5" />
                              </button>
                              <input 
                                type="search" 
                                className="text-[#8E80FF] text-xs md:text-sm lg:text-lg" 
                                placeholder="ชื่อผู้จัดกิจกรรม" 
                                value={findVolunSearch}
                                onChange={(e) => {
                                  setFindVolunSearch(e.target.value);
                                  setFindVolunPage(1);
                                }}
                                
                              /> 
                    </label>
                    {/* <div className="text-right text-[#8E80FF] text-xs md:text-lg w-full mb-1 " >
                      เรียง : ..............
                    </div> */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {findVolunData.map(emp =>
                        <div key={emp.emp_id} className="card card-xs bg-white w-80 shadow-lg rounded-2xl lg:rounded-3xl py-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                  
                          <div className="card-body">
                            <a className="flex justify-center font-bold text-xs  md:text-sm lg:text-lg text-[#8E80FF]">{emp.fullname}</a>
                            <figure className="w-full p-0 m-0">
                              {emp.picture ? (
                                <img src={`/uploads/emp_pic/${emp.picture}`}  className="w-full rounded-3xl h-60 object-cover" />
                              ) : (
                                <img src={`/uploads/nophoto.png`}  className="w-full rounded-3xl  h-60 object-cover" />
                              )}
                            </figure>
                            
                            <div className="flex justify-center items-center lg:py-4">
                              <p className="p-2 bg-green-200 rounded-xl text-black text-center">
                                มีกิจกรรมทั้งหมด {emp.total_posts} รายการ
                              </p>
                            </div>
                            
                            <div className="card-actions justify-center px-15">
                              <button 
                                onClick={() => goToProfile(emp.emp_id , "volunteer")}
                                className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#8E80FF] border-[#8E80FF] rounded-lg"
                              >เยี่ยมชม</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <center>
                      <div className="join items-center gap-2 my-2 mb-5">
                        {findVolunPage > 1 && (
                          <button onClick={() => setFindVolunPage(findVolunPage - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
                        )}

                      {findVolunTotal > 0 ? (
                        <button className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">{findVolunPage}/{findVolunTotalPages}</button>
                      ) : (
                        <button className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                      )
                      }

                        {findVolunPage < findVolunTotalPages && (
                          <button onClick={() => setFindVolunPage(findVolunPage + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
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
