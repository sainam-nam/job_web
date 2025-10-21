import { Link, NavLink } from "react-router-dom";
import Logout from "../comp/logout"
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client";

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

  useEffect(() => {
    if (!user.emp_id) return;
    // const s = io(apiUrl, {
    //   transports: ["websocket"],
    //   path: "/socket.io"   // default คืออันนี้
    // });
    const s = io('http://localhost:8000');

    // console.log("apiUrl", apiUrl);

    setSocket(s);
    s.emit("auth", { role: "jobber", userId: user.emp_id });
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
  }, [user?.emp_id]);

  const loadNotifications = (unread) => {
    if (!user.emp_id) return;
    const query = unread ? "?is_read=0" : "";
    fetch(`${apiUrl}/api/notifications/emp/${user.emp_id}${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotifications(data.data);
      })
      .catch((err) => console.error("โหลดแจ้งเตือนล้มเหลว", err));
  };

  // ฟังก์ชัน mark as read
  const markNotificationAsRead = async (id, link) => {
    //ต่อตรงนี้ กดแล้วให้เพิ่มค่าในตาราง read_at + is_read = 1
    try {
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      loadNotifications(filterUnread);
      if (link) navigate(link);
    } catch (err) {
      console.error("อัปเดตสถานะอ่านแจ้งเตือนไม่สำเร็จ", err);
    }
  };

  useEffect(() => {
    loadNotifications(filterUnread);
  }, [user.emp_id, filterUnread , showNoti ]);

  const handleMenuClick = async (type) => {
    if (!user || !user.emp_id) {
      console.error("❌ ไม่มี emp_id, กรุณา login ใหม่");
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/api/emp_profile_check/${type}?emp_id=${user.emp_id}`); // เช่น personal, education
      const data = await res.json();

      if (data.exists) {
        navigate(`/emp_profile/${type}/view`);
      } else {
        navigate(`/emp_profile/${type}/edit`);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาด", err);
    }
  };
    
    return(
      <div>
        
          <div className="navbar bg-[#8E80FF] border-[#8E80FF]" >
            <div className="flex-none">
              <div className="flex items-center">
                
                {/* <a className="text-sm md:text-xl xl:text-2xl font-bold ml-2 md:ml-3">
                  JOB & VOLUN
                </a> */}
                <Link to="/Employer/" className="inline-block">
                  <img
                  src="/logo jv.png"
                  alt="Logo"
                  className="w-8 h-8 md:w-20 md:h-20 ml-2"
                  />
                </Link>
              </div>
            </div>
            <div className="flex-1">
          
                  <ul className="hidden md:flex md:space-x-6 md:pl-5 md:text-xs xl:text-sm">
                    <li>
                      <NavLink
                        to="/Employer/"
                        className={({ isActive }) =>
                          `pb-1 font-bold ${
                            isActive ? "border-b-3 border-white text-white" : "text-gray-300"
                          }`
                        }
                      >
                        งาน
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/FindVolun/"
                        className={({ isActive }) =>
                          `pb-1 font-bold ${
                            isActive ? "border-b-3 border-white text-white" : "text-gray-300"
                          }`
                        }
                      >
                        กิจกรรมจิตอาสา
                      </NavLink>
                    </li>
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
                                                <img src={`/uploads/emp_pic/${user.picture}`} />
                                            ) : (
                                                <img src={`/uploads/nophoto.png`}  />
                                            )}
                        
                      </div>
                  </div>
                </li>
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
                    <ul className="bg-white text-[#8E80FF] rounded-tl-xl rounded-b-xl p-3 absolute top-14 right-0 z-10 shadow-xl min-w-[400px]">
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
                        <li className="p-4 font-bold text-center">ไม่มีแจ้งเตือนที่ยังไม่ได้อ่าน</li>
                      ) : (
                        
                        notifications.map((n) => {
                          // parse meta
                          let parsedLink = null;
                          try {
                            parsedLink = n.meta ? JSON.parse(n.meta) : null;
                          } catch (e) {
                            parsedLink = null;
                          }
                          // Calculate time difference
                          const now = new Date();
                          const created = new Date(n.created_at);
                          const diffMs = now - created;
                          const diffMins = Math.floor(diffMs / (1000 * 60));
                          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                          let timeAgo = "";
                          if (diffMins < 60) {
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
                              onClick={() => markNotificationAsRead(n.id, parsedLink?.link)}
                            >
                              {/* Content */}
                              <div className="flex flex-col items-start w-full p-3">
                                <div className="flex items-start w-full">
                                  <div className="flex flex-col items-start w-full">
                                    <p className={`text-md font-bold ${n.is_read === 0 ? "text-[#7B6ADA]" : "text-gray-600"} `}>{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.body}</p>
                                  </div>
                                  {n.is_read === 0 && (
                                    <span className="text-[10px] w-2 h-2 p-2 bg-red-500 text-white rounded-full"></span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between w-full mt-2">
                                  <span className="text-xs text-gray-400">
                                    {timeAgo}
                                  </span>
                                  {parsedLink?.link ? (
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id, parsedLink.link);
                                      }}
                                      className="px-3 py-1 text-xs rounded-md bg-[#8E80FF] text-white hover:bg-[#6b5de0] transition"
                                    >
                                      ดูรายละเอียดงาน
                                    </button>
                                  ) : (
                                    parsedLink?.empty ? (
                                      <>
                                        {parsedLink?.empty === "ให้คะแนนไปแล้ว" ? (
                                          <span className="text-sm text-green-500">{parsedLink.empty}</span>
                                        ) : (
                                          <span className="text-sm text-red-500">{parsedLink.empty}</span>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                      {parsedLink?.review.link && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markNotificationAsRead(n.id ,parsedLink?.review.link);
                                          }}
                                          className="px-3 py-1 text-xs rounded-md bg-[#8E80FF] text-white hover:bg-[#6b5de0] transition"
                                        >
                                          ให้คะแนน
                                        </button>
                                      )} 
                                    
                                    </>
                                    )
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
                <li className="">
                  <Logout />
                </li>
              </ul>
            </div>
          </div>
        </div>
    )
}