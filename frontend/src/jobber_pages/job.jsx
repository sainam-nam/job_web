import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../jobber_comp/navbar";
import Footer from "../jobber_comp/footer";
import { MdOutlineSearch } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import JobCard from "../jobber_comp/job_card";
import { MdWorkOff } from "react-icons/md";

const apiUrl = import.meta.env.VITE_API_BASE_URL;


function Find_Job() {
  const [userData, setUserData] = useState([]);
  const [userId, setUserId] = useState([]);
  const [limit, setLimit] = useState(4);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  const [status, setStatus] = useState("j");

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
      //console.log(res.data.user);
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
    
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
  }, []);
  
  useEffect(() => {
    if (!userId) return; // ยังไม่รู้ userId → ยังไม่ fetch
    fetchData();
  }, [userId, page, limit, search, status]);

  // if (!userData) return <div>Loading...</div>;
  const fetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/myapply_job?jobber_id=${userId}&page=${page}&limit=${limit}&keyword=${search}&status=${status}`);
      const result = await res.json();
      //console.log("result=",result);

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
 



  if (!userData) {
  return <div>Loading...</div>;
}


  return (
    <div>
        {userData && <Navbar user={userData} />}
        <div className="w-full group">
          <img src="/find_work2.png" className="w-full" />
          
              <div className="flex flex-col items-center w-full gap-2 bg-white">
                
                <div className="flex flex-col justify-center items-center w-full px-5 pt-3 lg:pt-5 lg:px-0 lg:pr-4">
                                        <h1 className="text-lg md:text-3xl font-bold mb-2 text-[#8E80FF] my-3">
                                          {status === "j" ? (
                                            <>งานที่สมัครเอง [ {total ? (total):("0")} ]</>
                                          ) : status === "m" ? (
                                            <>งานที่สมัครจากการจับคู่ [ {total ? (total):("0")} ]</>
                                          ) : status === "s" ? (
                                            <>งานที่สนใจ [ {total ? (total):("0")} ]</>
                                          ) : (
                                            <>งานที่ปิดประกาศแล้ว [ {total ? (total):("0")} ]</>
                                          )}


                                        </h1>
                                        
                                        <div className="tabs tabs-lift mb-3">
                                          <button
                                            className={`tab  [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF]  ${status === "j" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                            onClick={() => {
                                              setStatus("j");
                                              setPage(1);
                                            }}
                                          >
                                            งานที่สมัครเอง
                                          </button>
                                          <button
                                            className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${status === "m" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                            onClick={() => {
                                              setStatus("m");
                                              setPage(1);
                                            }}
                                          >
                                            งานที่สมัครจากการจับคู่
                                          </button>
                                          <button
                                            className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${status === "s" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                            onClick={() => {
                                              setStatus("s");
                                              setPage(1);
                                            }}
                                          >
                                            งานที่สนใจ
                                          </button>
                                          <button
                                            className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${status === "f" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                            onClick={() => {
                                              setStatus("f");
                                              setPage(1);
                                            }}
                                          >
                                            งานที่ปิดประกาศแล้ว
                                          </button>
                                        </div>

                                        <div className="mb-3">
                                          {data.length === 0 && status === 'f' ? (
                                            <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                              <MdWorkOff className="text-7xl mb-6" />
                                              <h2 className="text-xl font-semibold mb-2">
                                                ยังไม่มีงานที่คุณเคยสมัครและจบไป
                                              </h2>
                                              <p className="text-sm text-gray-500">
                                                คุณสามารถไปเลือกชมงานเพิ่มเติมได้จากหน้าหลัก
                                              </p>
                                            </div>
                                          ) : data.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                              <MdWorkOff className="text-7xl mb-6" />
                                              <h2 className="text-xl font-semibold mb-2">
                                                ยังไม่มีงานในหมวดนี้
                                              </h2>
                                              <p className="text-sm text-gray-500">
                                                คุณสามารถไปเลือกชมงานได้จากหน้าหลัก
                                              </p>
                                              <a
                                                href="/User/alljob"
                                                className="mt-4 px-5 py-2 bg-[#8E80FF] text-white rounded-full hover:bg-[#695bd6] transition"
                                              >
                                                ไปที่หน้าหลัก
                                              </a>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center">
                                              {data.length > 0 && (
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
                                                      setPage(1);
                                                    }}
                                                /> 
                                                </label>
                                              )}
                                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 px-50">
                                                {data.map((post) => (
                                                  <JobCard key={post.post_id} post={post} />
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        
                                        <center>
                                          <div className="join items-center gap-2 my-2">
                                            {page > 1 && (
                                              <button onClick={() => setPage(page - 1)}>
                                                <img
                                                  src="/up.png"
                                                  className="-rotate-90 w-4 h-4 md:w-6 md:h-6 "
                                                />
                                              </button>
                                            )}

                                            {total > 0 && (
                                              <button className="btn btn-xs  bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item btn">
                                                {page}/{totalPages}
                                              </button>
                                            )}

                                            {page < totalPages && (
                                              <button onClick={() => setPage(page + 1)}>
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
           

        </div>
        <div className="flex bg-white p-10">

        </div>
          
            <Footer />
          
    </div>
  );
}

export default Find_Job;
