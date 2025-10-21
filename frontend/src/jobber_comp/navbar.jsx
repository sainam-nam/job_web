import { Link } from "react-router-dom"
import Logout from "../comp/logout"
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client";
import { MapView } from "../comp/map_view";
import { FaCircle } from "react-icons/fa";
import { CheckIcon } from "lucide-react";
import LoadingOverlay from "../comp/LoadingOverlay";


export default function Navbar({ user }){
  // Animation style สำหรับจุดแดงแจ้งเตือน
    // ใส่ style tag ใน DOM แค่ครั้งเดียว
    useEffect(() => {
      if (!document.getElementById('pulse-noti-style')) {
        const style = document.createElement('style');
        style.id = 'pulse-noti-style';
        style.innerHTML = `
          @keyframes pulse-noti {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
          .animate-pulse-noti {
            animation: pulse-noti 1s infinite cubic-bezier(0.4,0,0.6,1);
          }
        `;
        document.head.appendChild(style);
      }
    }, []);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // สำหรับ noti dropdown
  const [showNoti, setShowNoti] = useState(false);
  const notiRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [filterUnread, setFilterUnread] = useState(true);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);

  // เชื่อมต่อ socket.io เพื่อรับแจ้งเตือนใหม่แบบ real-time
  useEffect(() => {
    if (!user?.jobber_id) return;
    // const s = io(apiUrl, {
    //   transports: ["websocket"],
    //   path: "/socket.io"   // default คืออันนี้
    // });
    const s = io('http://localhost:8000');

    // console.log("apiUrl", apiUrl);

    setSocket(s);
    s.emit("auth", { role: "jobber", userId: user.jobber_id });
    s.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
    });

    s.on("notification:new", () => {
      loadNotifications(filterUnread);
    });
    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line
  }, [user?.jobber_id , showNoti]);


  const loadNotifications = (unread) => {
    if (!user?.jobber_id) return;
    const query = unread ? "?is_read=0" : "";
    fetch(`${apiUrl}/api/notifications/jobber/${user.jobber_id}${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotifications(data.data);
      })
      .catch((err) => console.error("โหลดแจ้งเตือนล้มเหลว", err));
  };

  // ฟังก์ชัน mark as read
  const markNotificationAsRead = async (id , link) => {
    //ต่อตรงนี้ กดแล้วให้เพิ่มค่าในตาราง read_at + is_read = 1
    try {
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      loadNotifications(filterUnread);
      if (link) navigate(link);
      setShowNoti(false);
    } catch (err) {
      console.error("อัปเดตสถานะอ่านแจ้งเตือนไม่สำเร็จ", err);
    }
  };

  useEffect(() => {
  loadNotifications(filterUnread);
});


  const handleMenuClick = async (type) => {
    try {
      const res = await fetch(`${apiUrl}/api/profile_check/${type}?jobber_id=${user.jobber_id}`); // เช่น personal, education
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

  const [post_id , setPost_id] = useState("");
  const [data , setData] = useState([]);
  const [hs , setJobHS] = useState([]);
  const [ss , setJobSS] = useState([]);
  const [emp_id , setEmpid] = useState("");

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/jobpost?post_id=${post_id}`);
      const result = await res.json();
      console.log("result", result);
      console.log("jobpost จะเอามาโชว์ ", result.jobpost[0]?.emp_id);
    
      if(Array.isArray(result.jobpost)){
          //console.log("sql", res)
          const idd = result.jobpost[0]?.emp_id;
          setData(result.jobpost);
          setEmpid(idd);
        } else {
          console.error("Data format error:", result);
          setData([]);
        }
      if(Array.isArray(result.job_HS)){
          //console.log("sql", res)
          setJobHS(result.job_HS);
        } else {
          console.error("Data format error:", result);
          setJobHS([]);
        }
      if(Array.isArray(result.job_SS)){
          //console.log("sql", res)
          setJobSS(result.job_SS);
        } else {
          console.error("Data format error:", result);
          setJobSS([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    empFetchData();
  }, [post_id , emp_id]);

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

  const [emp, setEmp] = useState([]);

  const empFetchData = async () => {
    try {
      console.log("status=", emp_id);
      const res = await fetch(`${apiUrl}/emp_pf?emp_id=${emp_id}&only=employer`);
      const result = await res.json();
      //console.log(result);
      // if (typeof result === 'object' && 
      //   'postCount' in result && 
      //   'volunCount' in result && 
      //   'totalPagesJ' in result && 
      //   'totalPagesV' in result  &&  
      //   'jReviewCount' in result && 
      //   'vReviewCount' in result && 
      //   'totalReviewPageV' in result && 
      //   'totalReviewPageV' in result  ) {
      //   setPostCount(result.postCount ?? 0);
      //   setVolunCount(result.volunCount ?? 0);
      //   setTotalJ(result.totalPagesJ ?? 0);
      //   setTotalV(result.totalPagesV ?? 0);
      //   setJobberReviewCount(result.jReviewCount ?? 0);
      //   setVolunReviewCount(result.vReviewCount ?? 0);
      //   setTotalJR(result.totalReviewPageJ ?? 0);
      //   setTotalVR(result.totalReviewPageV ?? 0);
      // } else {
      //   console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      // }

      if(Array.isArray(result.Emp_pf)){
          //console.log("sql", res)
          setEmp(result.Emp_pf);
        } else {
          console.error("Data format error:", result);
          setEmp([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const goToProfile = (val) => {
    navigate(`/viewEmp_Pf?emp_id=${val}`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };

  const [message , setMessage] = useState('');
  
  useEffect(() => {
    if (user?.jobber_id && post_id) {
      
      checkstatus();
    }
  }, [user?.jobber_id, post_id]); // รอให้ค่าเต็มก่อนค่อยยิง
  
  async function checkstatus() {
    try {
      const res = await fetch(`${apiUrl}/api/check-apply?jobber_id=${user?.jobber_id}&post_id=${post_id}`);
      const data = await res.json();
      
      console.log('data from api', data);
  
      if (data.results) {
        
        setMessage(data.results.message || '');
      }
    } catch (error) {
      console.error("Error checking apply status:", error);
    }
  }

  const [closeAll, setCloseAll] = useState(false);

  return(
    <div>
      <div className="navbar bg-[#8E80FF] border-[#8E80FF]" >
        <div className="flex-none">
          <div className="flex items-center">
            {/* <a className="text-sm md:text-xl xl:text-2xl font-bold ml-2 md:ml-3"> */}
              <Link to="/User/alljob" className="inline-block">
                                <img
                                src="/logo jv.png"
                                alt="Logo"
                                className="w-8 h-8 md:w-20 md:h-20 ml-2"
                                />
                              </Link>
            {/* </a> */}
          </div>
        </div>
        <div className="flex-1">
          <ul className="hidden md:menu md:menu-horizontal md:px-1 md:text-xs xl:text-sm">
            <li><Link to="/User/alljob" className="font-bold">หน้าหลัก</Link></li>
            {/* <li><Link to="/user_job" >งาน</Link></li>
            <li><Link to="/user_volunteer">กิจกรรมจิตอาสา</Link></li> */}
            {/* <li><Link to="/user_match">ผลการจับคู่</Link></li> */}
          </ul>
        </div>
        <div className="flex">
          <ul className="menu menu-horizontal justify-center items-center gap-x-0">
            <li className="">
              <div className="xl:text-sm">
                {user.fullname}
              </div>
            </li>
            <li className="" onClick={() => handleMenuClick("info")}> 
              <div className="avatar">
                <div className="w-10 h-10 rounded-full" >
                  {user.picture ? (
                    <img src={`/uploads/user_pic/${user.picture}`} />
                  ) : (
                    <img src={`/uploads/nophoto.png`}  />
                  )}
                </div>
              </div>
            </li>
            {/* <li className="">
              <div className="w-14">
                    <Link><img src="/noti.png"></img></Link>
              </div>
            </li> */}
            <li ref={notiRef} style={{ position: 'relative' }}>
              <button className="w-16 relative" onClick={() => setShowNoti((prev) => !prev)}>
                              <img src="/noti.png" alt="noti" />
                              {/* จุดสีแดงแจ้งเตือน */}
                              {notifications.some(n => n.is_read === 0) && (
                                <span
                                  className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse-noti"
                                  style={{
                                    pointerEvents: 'none',
                                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
                                  }}
                                ></span>
                                
                              )}
                  </button>
              {showNoti && (
                <ul className="bg-white text-[#8E80FF] rounded-tl-xl rounded-b-xl p-3 absolute top-14 right-0 z-100 shadow-xl min-w-[400px]">
                  <p className="text-xl font-bold p-2">การแจ้งเตือน</p>
                  <div className="mb-3">
                    <button 
                      onClick={() => setFilterUnread(true)}
                      className={`ml-5 btn btn-xs sm:btn-sm rounded-xl md:rounded-2xl border transition
                            ${filterUnread
                              ? "bg-[#8E80FF] text-white border-[#8E80FF]"
                              : "bg-white text-[#8E80FF] border-[#8E80FF]"}`}
                        >ยังไม่ได้อ่าน
                    </button>
                    <button 
                      onClick={() => setFilterUnread(false)}
                      className={`ml-2 btn btn-xs sm:btn-sm rounded-xl md:rounded-2xl border transition
                            ${!filterUnread
                              ? "bg-[#8E80FF] text-white border-[#8E80FF]"
                              : "bg-white text-[#8E80FF] border-[#8E80FF]"}`}
                    >ทั้งหมด
                    </button>
                    
                  </div>
                  <hr />
                  <div className="max-h-[500px] overflow-y-auto">           
                  {notifications.length === 0 ? (
                    <li className="p-4 font-bold text-center">ไม่มีแจ้งเตือน</li>
                  ) : (
                    
                    notifications.map((n) => {
                      // parse meta
                      let meta = null;
                      try {
                        meta = n.meta ? JSON.parse(n.meta) : null;
                      } catch (e) {
                        meta = null;
                      }
                      // Calculate time difference
                      const now = new Date();
                      const created = new Date(n.created_at);
                      const diffMs = now - created;
                      const diffMins = Math.floor(diffMs / (1000 * 60));
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                      let timeAgo = "";

                      if (diffDays > 7) {
                        // แสดงเป็นวันเวลาเต็ม เช่น 2025-09-23 14:35
                        const options = {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        };
                        timeAgo = created.toLocaleString('th-TH', options);
                      } else if (diffMins < 60) {
                        timeAgo = `${diffMins} นาทีที่แล้ว`;
                      } else if (diffHours < 24) {
                        timeAgo = `${diffHours} ชั่วโมงที่แล้ว`;
                      } else {
                        timeAgo = `${diffDays} วันที่แล้ว`;
                      }


                      return (
                        <li
                          key={n.id}
                          className="flex justify-start items-center bg-gray-100 my-2 w-full rounded-xl hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => markNotificationAsRead(n.id ,meta.link)}
                        >
                          {/* Content */}
                          <div className="flex flex-col items-start w-full p-3">
                            <div className="flex items-start w-full">
                              <div className="flex flex-col items-start w-full">
                                <p className={`text-md font-bold ${n.is_read === 0 ? "text-[#7B6ADA]" : "text-gray-600"} `}>{n.title}</p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-3">{n.body}</p>
                              </div>
                              {n.is_read === 0 && (
                                <span className="text-[10px] w-2 h-2 p-2 bg-red-500 text-white rounded-full"></span>
                              )}
                            </div>
                            <div className="flex items-center justify-between w-full mt-2">
                              <span className="text-xs text-gray-400">
                                {timeAgo}
                              </span>
                              {meta && (
                                <div className="flex gap-2">
                                  {meta.link ? (
                                    // กรณี meta เป็นแค่ลิงก์
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id ,meta.link);
                                      }}
                                      className="px-3 py-1 text-xs rounded-md bg-[#8E80FF] text-white hover:bg-[#6b5de0] transition"
                                    >
                                      ดูรายละเอียด
                                    </button>
                                  ) : meta.empty ? (
                                    <>
                                      {(meta.empty === "ตอบตกลงไปแล้ว" || meta.empty === "ให้คะแนนไปแล้ว") ? (
                                        <span className="text-sm text-green-500">{meta.empty}</span>
                                      ) : (
                                        <span className="text-sm text-red-500">{meta.empty}</span>
                                      )} 
                                    
                                    </>
                                  ) : meta.review ? (
                                    <>
                                      {meta.review.link && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markNotificationAsRead(n.id ,meta.review.link);
                                          }}
                                          className="px-3 py-1 text-xs rounded-md bg-[#8E80FF] text-white hover:bg-[#6b5de0] transition"
                                        >
                                          ให้คะแนน
                                        </button>
                                      )} 
                                    
                                    </>
                                  ) : (
                                    // กรณี meta เป็น object หลายอัน เช่น accept/reject
                                    Object.entries(meta).map(([key, value], index) => (
                                      <button
                                        key={key}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (value.modalId) {
                                            document.getElementById(value.modalId)?.showModal();
                                          } else if (value.link) {
                                            markNotificationAsRead(n.id);
                                          }
                                          setPost_id(n.post_id);
                                          markNotificationAsRead(n.id);
                                        }}
                                          className={`px-3 py-1 text-xs rounded-md text-white hover:opacity-90 transition 
                                                ${index === 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                      >
                                        {value.label}
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })
                    
                  )}
                  </div> 
                </ul>
              )}
            </li>
            {/* ส่วนนี้อยากให้กดแล้วออกมาเป็น submenu */}
            <li className="">
              <Logout />
            </li>
          </ul>
        </div>
      </div>
    {/* Modal: ตอบกลับ */}
    <dialog id="accept_modal" className="modal">
      <div className="modal-box bg-white max-w-6xl rounded-3xl">
        <div className="flex flex-col items-center w-full">
          <h3 className="font-bold text-lg text-[#8E80FF] mb-4"></h3>
          <div className="flex flex-col md:flex-row items-center justify-center w-full bg-gradient-to-b from-[#8E80FF] to-white rounded-3xl gap-2  px-7 pb-5 md:px-20 md:pb-7 lg:px-30 lg:pb-15 xl:px-15 xl:py-10"> 
          
            <div className="avatar">
              <div className="w-24 sm:w-28 md:w-35 lg:w-55 rounded-full">
                {emp[0]?.picture ? (
                              <img src={`/uploads/emp_pic/${emp[0]?.picture}`} />
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
                            <button className="text-success w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11">
                              <CheckIcon strokeWidth={6} />
                            </button>
                        ) : (
                            <button className="text-error w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                        )
                        }
                  </div>
                <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold">ต.{emp[0]?.tb} อ.{emp[0]?.ap} จ.{emp[0]?.jw}</a>
                <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-2 text-[#8E80FF]">
                  เพศ {emp[0]?.gender === "M"
                        ? "ชาย"
                        : emp[0]?.gender === "F"
                        ? "หญิง"
                        : emp[0]?.gender || "ไม่ระบุ"}
                        
                </a>
                <div className="w-full mt-2">
                  <p className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold text-[#8E80FF] mb-1">
                    ค่าการจับคู่ที่ผู้ใช้เลือกไว้
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-4 md:h-5 lg:h-6 xl:h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-300 to-green-500 h-full rounded-full text-right px-2 py-1 text-[10px] md:text-xs lg:text-base font-bold text-white"
                      style={{ width: `${emp[0]?.pc_match || 0}%` }}
                    >
                      {emp[0]?.pc_match || 0}%
                    </div>
                  </div>
                  
                </div>

              </div>
              
            </div>  
            <button 
                  onClick={() => {
                    goToProfile(data[0]?.emp_id);
                    document.getElementById('accept_modal').close();
                    document.getElementById('reject_modal').close();
                  }}
                  className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-white bg-white text-[#8E80FF] rounded-xl md:rounded-2xl"
                >ดูโปร์ไฟล์
            </button>
        </div>
        
          <div className="flex flex-col justify-start w-full mb-2 p-4 md:mb-4 md:p-8 lg:mb-8 lg:p-10 bg-[#D9D9D9] text-[#8E80FF] rounded-3xl lg:rounded-4xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-xl lg:text-3xl font-bold">{data[0]?.position_name}</p>
                        <p className="text-[8px] font-bold md:text-sm lg:text-xl text-right pt-1">วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}</p>
                      </div>
                      <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                        <table>
                          <tbody>
                            <tr className="lg:h-10 xl:h-12">
                              <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#8E80FF" size={12} /></td>
                              <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">ค่าตอบแทน</a></td>
                              <td className="w-40 md:w-80 lg:w-90 xl:w-100">
                                <a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">
                                  {(() => {
                                    const salaryStr = data[0]?.salary || '';
                                    if (!salaryStr || salaryStr === '0') return 'ไม่ระบุ';
                                    const [min, max] = salaryStr.split('-').map(s => Number(s));
                                    if ((min || 0) === 0 && (max || 0) === 0) return 'ไม่ระบุ';
                                    if ((min || 0) === 0) return `${max.toLocaleString()} บาท`;
                                    if ((max || 0) === 0) return `${min.toLocaleString()} บาท`;
                                    if (min === max) return `${min.toLocaleString()} บาท`;
                                    return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
                                  })()}
                                </a>
                              </td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#8E80FF" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">จำนวน</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">{data[0]?.num_position} อัตรา</a></td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#8E80FF" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">สถานที่ทำงาน</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</a></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                       <div className="flex justify-end -mt-10 gap-3">
                           
                         
                        </div>
                    </div>
                    <div className="py-2 md:py-4 lg:py-6 w-full">
                      {data[0]?.details && (  
                        <>
                          <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">รายละเอียด</p>
                          <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                            
                                  <div
                                    className="prose prose-sm md:prose lg:prose-lg"
                                    dangerouslySetInnerHTML={{ __html: data[0].details }}
                                  ></div>
                                
                          </div>
                        </>
      )}
                    </div>
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div id="section2" className="w-full">
                        <div className="py-2 md:py-4 lg:py-6 w-full">
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

        {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากนายจ้าง</label>
                          <a
                            className="text-[#8E80FF] text-xl font-bold p-5 rounded-xl"
                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        </>
                        
                      )}                    
        </div>

        <div className="modal-action flex justify-center gap-2">
          
          <button 
            className="btn bg-green-500 border border-green-500 rounded-xl text-white" 
            onClick={() => {
              document.getElementById('conaccept_modal').showModal();
            }}>
              ตกลงรับงาน
          </button>
          <button className="btn bg-red-500 border border-red-500 rounded-lg text-white" 
          onClick={() => document.getElementById('conreject_modal').showModal()}>
            ปฏิเสธ</button>
          <button className="btn bg-gray-300 border border-gray-300 rounded-xl text-black" onClick={() => document.getElementById('accept_modal').close()}>ยกเลิก</button>
        </div>
      </div>
    </dialog>
    {/* Modal: ปฏิเสธ */}
    <dialog id="reject_modal" className="modal">
      <div className="modal-box bg-white max-w-6xl">
        <div className="flex flex-col items-center w-full ">
          <h3 className="font-bold text-lg text-[#8E80FF] mb-4"></h3>
          <div className="flex flex-col md:flex-row items-center justify-center w-full bg-gradient-to-b from-[#8E80FF] to-white rounded-3xl gap-2  px-7 pb-5 md:px-20 md:pb-7 lg:px-30 lg:pb-15 xl:px-15 xl:py-10"> 
          
            <div className="avatar">
              <div className="w-24 sm:w-28 md:w-35 lg:w-55 rounded-full">
                {emp[0]?.picture ? (
                              <img src={`/uploads/emp_pic/${emp[0]?.picture}`} />
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
                            <button className="text-success w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11">
                              <CheckIcon strokeWidth={6} />
                            </button>
                        ) : (
                            <button className="text-error w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 xl:w-11 xl:h-11">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                        )
                        }
                  </div>
                <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold">ต.{emp[0]?.tb} อ.{emp[0]?.ap} จ.{emp[0]?.jw}</a>
                <a className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold pt-2 text-[#8E80FF]">
                  เพศ {emp[0]?.gender === "M"
                        ? "ชาย"
                        : emp[0]?.gender === "F"
                        ? "หญิง"
                        : emp[0]?.gender || "ไม่ระบุ"}
                        
                </a>
                <div className="w-full mt-2">
                  <p className="text-xs md:text-sm lg:text-xl xl:text-2xl font-bold text-[#8E80FF] mb-1">
                    ค่าการจับคู่ที่ผู้ใช้เลือกไว้
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-4 md:h-5 lg:h-6 xl:h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-300 to-green-500 h-full rounded-full text-right px-2 py-1 text-[10px] md:text-xs lg:text-base font-bold text-white"
                      style={{ width: `${emp[0]?.pc_match || 0}%` }}
                    >
                      {emp[0]?.pc_match || 0}%
                    </div>
                  </div>
                  
                </div>

              </div>
              
            </div>  
            <button 
                  onClick={() => {
                    goToProfile(data[0]?.emp_id);
                    document.getElementById('accept_modal').close();
                    document.getElementById('reject_modal').close();
                  }}
                  className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl w-20 md:w-25 lg:w-35 xl:w-45 border border-white bg-white text-[#8E80FF] rounded-xl md:rounded-2xl"
                >ดูโปร์ไฟล์
            </button>
        </div>
        
          <div className="flex flex-col justify-start w-full mb-2 p-4 md:mb-4 md:p-8 lg:mb-8 lg:p-10 bg-[#D9D9D9] text-[#8E80FF] rounded-3xl lg:rounded-4xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                      <div className="flex justify-between items-center">
                        <p className="text-xs md:text-xl lg:text-3xl font-bold">{data[0]?.position_name}</p>
                        <p className="text-[8px] font-bold md:text-sm lg:text-xl text-right pt-1">วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}</p>
                      </div>
                      <div className="flex items-center justify-center mt-2 md:mt-4 lg:mt-8">
                        <table>
                          <tbody>
                            <tr className="lg:h-10 xl:h-12">
                              <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#8E80FF" size={12} /></td>
                              <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">ค่าตอบแทน</a></td>
                              <td className="w-40 md:w-80 lg:w-90 xl:w-100">
                                <a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">
                                  {(() => {
                                    const salaryStr = data[0]?.salary || '';
                                    if (!salaryStr || salaryStr === '0') return 'ไม่ระบุ';
                                    const [min, max] = salaryStr.split('-').map(s => Number(s));
                                    if ((min || 0) === 0 && (max || 0) === 0) return 'ไม่ระบุ';
                                    if ((min || 0) === 0) return `${max.toLocaleString()} บาท`;
                                    if ((max || 0) === 0) return `${min.toLocaleString()} บาท`;
                                    if (min === max) return `${min.toLocaleString()} บาท`;
                                    return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
                                  })()}
                                </a>
                              </td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#8E80FF" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">จำนวน</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">{data[0]?.num_position} อัตรา</a></td>
                            </tr>
                            <tr className="lg:h-10 xl:h-12">
                              <td><FaCircle color="#8E80FF" size={12} /></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF] font-bold">สถานที่ทำงาน</a></td>
                              <td><a className="text-[10px] md:text-sm lg:text-xl text-[#8E80FF]">ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</a></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                       <div className="flex justify-end -mt-10 gap-3">
                           
                         
                        </div>
                    </div>
                    <div className="py-2 md:py-4 lg:py-6 w-full">
                      {data[0]?.details && (  
                        <>
                          <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#8E80FF] ml-2 mb-1 md:ml-4 md:mb-2">รายละเอียด</p>
                          <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#8E80FF] ml-4 md:ml-10">
                            
                                  <div
                                    className="prose prose-sm md:prose lg:prose-lg"
                                    dangerouslySetInnerHTML={{ __html: data[0].details }}
                                  ></div>
                                
                          </div>
                        </>
      )}
                    </div>
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div className="py-2 md:py-4 lg:py-6 w-full">
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
                    <div id="section2" className="w-full">
                        <div className="py-2 md:py-4 lg:py-6 w-full">
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
        
        {message && (
                        <>
                        <label className="text-[#8E80FF] text-xl font-bold">ข้อความจากนายจ้าง</label>
                          <a
                            className="text-[#8E80FF] text-xl font-bold p-5 rounded-xl"
                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            dangerouslySetInnerHTML={{ __html: message }}
                          />
                        </>
                        
                      )}   
        </div>
        <div className="modal-action flex justify-center gap-2">
          <button className="btn bg-red-500 border border-red-500 rounded-lg text-white" 
          onClick={() => document.getElementById('conreject_modal').showModal()}>
            ปฏิเสธ</button>
          <button className="btn bg-gray-300 border border-gray-300 text-black" onClick={() => document.getElementById('reject_modal').close()}>ยกเลิก</button>
        </div>
      </div>
    </dialog>
    <dialog id="conaccept_modal" className="modal">
                    <div className="modal-box bg-white">
                        <center>
                          <p className="text-3xl font-bold text-green-500 p-5">ตกลงรับงานนี้</p>
                          {/* ปุ่มสวิตช์ */}
                          <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-600">
                                {closeAll
                                  ? ""
                                  : "ยังให้ระบบหางานต่อไป"}
                              </span>

                              <label className="toggle text-base-content cursor-pointer border-green-600">
                                <input
                                  type="checkbox"
                                  checked={closeAll}
                                  onChange={() => setCloseAll(!closeAll)}
                                />
                                {/* enabled icon */}
                                <svg
                                  aria-label="enabled"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <g
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeWidth="4"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <path d="M20 6 9 17l-5-5"></path>
                                  </g>
                                </svg>
                                {/* disabled icon */}
                                <svg
                                  aria-label="disabled"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </label>
                              <span className="text-sm text-gray-600">
                                {closeAll
                                  ? " ปิดการรับงาน (จะปฏิเสธงานที่เหลือ)"
                                  : ""}
                              </span>
                            </div>
                        </center>
                      
                        <div className="modal-action flex justify-center gap-4">
                          
                          <button 
                            type="button"
                            className={`btn px-4 py-2 rounded-lg bg-green-500 border border-green-500 text-white`}
                            onClick={async () => {
                               try {
                                setLoading(true);
                                const res = await fetch(`${apiUrl}/api/send_message`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json"
                                  },
                                  body: JSON.stringify({
                                    post_id: post_id,
                                    jobber_id: user?.jobber_id,
                                    status: "accepted",
                                    close: closeAll ? "close_all" : ""
                                  })
                                });
        
                                const data = await res.json();
                                if (data.success) {
                                  //alert("ตกลงรับงานละ!");

                                  document.getElementById("conaccept_modal").close();
                                  document.getElementById("accept_modal").close();
                                  
                                } else {
                                  alert("เกิดข้อผิดพลาด: " + data.error);
                                }
                              } catch (error) {
                                console.error("Error:", error);
                                //alert("ส่งไม่สำเร็จ");
                              }  finally {
                                        setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                      }
                            }}
                          >
                            ยืนยัน
                          </button>
      
                          <button 
                            type="button"
                            className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                            onClick={() => {
                                document.getElementById("conaccept_modal").close()
                              }}
                              >
                              ยกเลิก
                              </button>
                            </div>
                          </div>
                          {loading && <LoadingOverlay />}
                          </dialog>
                          {/* คอนเฟริมการปฏิเสธ */}
                          <dialog id="conreject_modal" className="modal">
                          <div className="modal-box bg-white">
                            <center>
                              <p className="text-3xl font-bold text-red-500 p-5">ตกลงปฏิเสธงานนี้</p>
                              <p className="text-lg text-[#8E80FF] font-semibold mb-4">หากคุณปฏิเสธงานนี้ จะไม่สามารถสมัครงานนี้ได้อีกในอนาคต</p>
                            </center>   
                            <div className="modal-action flex justify-center gap-4">
                              
                              <button 
                              type="button"
                              className={`btn px-4 py-2 rounded-lg bg-green-500 border border-green-500 text-white`}
                              onClick={async () => {
                               try {
                                setLoading(true);
                                const res = await fetch(`${apiUrl}/api/send_message`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json"
                                  },
                                  body: JSON.stringify({
                                    post_id: post_id,
                                    jobber_id: user?.jobber_id,
                                    status: "jb_rejected",
                                  })
                                });
        
                                const data = await res.json();
                                if (data.success) {
                                  //alert("ตกลงรับงานละ!");

                                  document.getElementById("conreject_modal").close();
                                  document.getElementById("reject_modal").close();
                                  
                                } else {
                                  alert("เกิดข้อผิดพลาด: " + data.error);
                                }
                              } catch (error) {
                                console.error("Error:", error);
                                //alert("ส่งไม่สำเร็จ");
                              }  finally {
                                        setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                      }
                            }}
                          >
                            ยืนยัน
                          </button>
        
                          <button 
                            type="button"
                            className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                            onClick={() => {
                              document.getElementById("cancelchoose_modal").close()
                            }}
                          >
                            ยกเลิก
                          </button>
                        </div>
                    </div>
                    {loading && <LoadingOverlay />}
                    </dialog>
  </div>
  )
}