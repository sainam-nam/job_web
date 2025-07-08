import React, { useState , useEffect } from "react"
import Navbar_Belogin from "./comp/nav_be"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { FaCircle } from "react-icons/fa";
import EmpRating from "./comp/emp_star";
import Footer from "./comp/footer";


function Index() {
    const [data, setData] = useState([]);
    const [lastpost, setLastpost] = useState([]);
    const [jobCount, setJobCount] = useState(0);
    const [volunteerCount, setVolunteerCount] = useState(0);
    const [jobTypeCount, setJobTypeCount] = useState(0);
    const [volunTypeCount, setVolunTypeCount] = useState(0);
    const navigate = useNavigate();
    const counts = [jobCount, volunteerCount, jobTypeCount];
    const maxLength = counts.some(count => String(count).length >= 3);
    const gapClass = maxLength >= 5 ? "gap-6" 
                      : maxLength >= 3 ? "gap-10"
                      : "gap-15";
    

    /*const Star = ({ filled }) => (
      <FaStar color={filled ? '#7B6ADA' : '#e5e7eb'} size={15} style={{ borderRadius: '5px' }} />
    );*/
    useEffect(() => {
        fetchData();
      }, []);
    

const fetchData = async () => {
  try {
    const res = await fetch(`http://localhost:8081/apibelogin`);
    const result = await res.json();

    if (typeof result === 'object' && 'jobCount' in result && 'volunteerCount' in result && 'jobTypeCount' in result) {
      setJobCount(result.jobCount);
      setVolunteerCount(result.volunteerCount);
      setJobTypeCount(result.jobTypeCount);
      setVolunTypeCount(result.volunTypeCount);
    } else {
      console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
    }
    if(Array.isArray(result.data)){
        //console.log("sql", res)
        setData(result.data);
      } else {
        console.error("Data format error:", result);
        setData([]);
      }
    if(Array.isArray(result.lastpost)){
        //console.log("sql", res)
        //console.log("🔥 lastpost from API:", result.lastpost);
        setLastpost(result.lastpost);
      } else {
        console.error("Data format error:", result);
        setLastpost([]);
      }

  } catch (err) {
    console.error('Fetch error:', err);
  }
};
  const handleLogin = () => {
    document.getElementById("gologin_modal").showModal();
  };
  const handleclose= () => {
    document.getElementById("gologin_modal").close();
  };
    
    return (
      <div onClick={handleLogin}>
        <Navbar_Belogin />
        <div className="relative w-full group">
          <img src="/belogin.png" className="w-full" />
          <button className="hidden md:btn md:btn-sm md:bg-white md:border-white md:text-[#7B6ADA] md:text-sm md:rounded-xl absolute top-7/9 left-3/5 transform -translate-x-1/2 -translate-y-1/2">
            เริ่มการหางาน
          </button>
        </div>
        <div className="p-4 md:pl-4 md:pt-4 md:p-0 lg:pl-8 xl:pl-12 bg-white ">
            <h1 className="text-[#7B6ADA] font-bold mb-6 lg:text-2xl lg:mb-10 xl:mb-15">เว็บเราทำอะไรได้บ้าง ?</h1>
            <div className="md:flex md:justify-center">
              <div className="flex gap-6 mb-4 md:mr-5 lg:gap-10 lg:mr-9 xl:gap-20 xl:mr-9">
                <div className="indicator">
                    <span className="indicator-item badge bg-[#7B6ADA] border-[#7B6ADA] w-12 h-12 lg:w-20 lg:h-20 xl:w-25 xl:h-25 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                    </span>
                    <div className="bg-[#D9D9D9] grid h-23 w-23 lg:w-35 lg:h-35 xl:w-45 xl:h-45 place-items-center rounded-2xl">
                        <img src="/1.png" className="w-21 lg:w-30 xl:w-40 " />
                    </div>
                </div>
                <div className="indicator">
                    <span className="indicator-item badge bg-[#7B6ADA] border-[#7B6ADA] w-12 h-12 lg:w-20 lg:h-20 xl:w-25 xl:h-25 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>

                    </span>
                    <div className="bg-[#D9D9D9] grid h-23 w-23 lg:w-35 lg:h-35 xl:w-45 xl:h-45 place-items-center rounded-2xl">
                        <img src="/2.png" className="w-21 lg:w-30 xl:w-40" />
                    </div>
                </div>
                <div className="indicator">
                    <span className="indicator-item badge bg-[#7B6ADA] border-[#7B6ADA] w-12 h-12 lg:w-20 lg:h-20 xl:w-25 xl:h-25 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>

                    </span>
                    <div className="bg-[#D9D9D9] grid h-23 w-23 lg:w-35 lg:h-35 xl:w-45 xl:h-45 place-items-center rounded-2xl">
                        <img src="/3.png" className="w-21 lg:w-30 xl:w-40" />
                    </div>
                </div>
              </div>
              <div className="relative w-full group">
              <div className="flex items-center h-30 w-90 md:h-23 lg:h-35 xl:h-45 md:w-full bg-[#7B6ADA] text-white rounded-bl-full rounded-tl-full pl-14 py-3 md:py-0 md:pl-20 md:pl-23 xl:pl-30">
                
                <div className="mr-6 absolute top-1/9 left-1/17">
                  <div className="rotate-[-20deg] text-xl md:text-sm lg:text-xl xl:text-2xl font-bold opacity-50">จำนวน</div>
                </div>

                
                <div className={`flex justify-center items-center ${gapClass} text-center`}>
                  <div className="xl:mr-8">
                    <div className="text-3xl lg:text-4xl xl:text-5xl font-bold">{jobCount}</div>
                    <div className="text-xs lg:text-sm xl:text-md font-bold">งาน</div>
                  </div>
                  <div className="xl:mr-8">
                    <div className="text-3xl lg:text-4xl xl:text-5xl font-bold">{volunteerCount}</div>
                    <div className="text-xs lg:text-sm xl:text-md font-bold">กิจกรรมจิตอาสา</div>
                  </div>
                  <div className="">
                    <div className="text-3xl lg:text-4xl xl:text-5xl font-bold">{jobTypeCount}</div>
                    <div className="text-xs lg:text-sm xl:text-md font-bold">ประเภทงาน</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-gradient-to-b from-white to-[#7B6ADA] pb-4 px-5 lg:px-10 lg:pb-8">
          <div>
            <a className="text-lg text-[#7B6ADA] font-bold">ประเภทงาน</a>
            <a className="text-sm text-[#7B6ADA] font-bold pl-1 pt-0.5">ยอมนิยม</a>
          </div>
          <a className="text-xs text-[#7B6ADA] font-bold mb-1">จากทั้งหมด {jobTypeCount} ประเภท</a>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 my-1">
            {data.map((jobtype) => (
              //const [thai, englishRaw] = jobtype.jobtype_name.split(" (");
              //const english = englishRaw?.replace(")", "");
              <button
                key={jobtype.jobtype_id}
                className="btn btn-md text-[10px] bg-white border-[#7B6ADA] border-3 rounded-xl hover:bg-[#7B6ADA] hover:text-white text-[#7B6ADA] py-2 px-4"
              >
                <div>{jobtype.jobtype_name}</div>
              </button>
            ))}
            <button
                
                className="btn btn-md text-[10px] bg-[#7B6ADA] border-white text-white border-3 rounded-xl hover:bg-white hover:text-[#7B6ADA]  py-2 px-4"
              >
                ทั้งหมด
              </button>
          </div>
          <div className="mt-4">
            <a className="text-lg text-white font-bold">ประเภทกิจกรรมจิตอาสา</a>
            <a className="text-sm text-white font-bold pl-1 pt-0.5">ยอมนิยม</a>
          </div>
          <a className="text-xs text-white font-bold mb-1">จากทั้งหมด {volunTypeCount} ประเภท</a>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 my-1">
            {data.map((jobtype) => (
              //const [thai, englishRaw] = jobtype.jobtype_name.split(" (");
              //const english = englishRaw?.replace(")", "");
              <button
                key={jobtype.jobtype_id}
                className="btn btn-md text-[10px] bg-[#7B6ADA] border-white text-white border-3 rounded-xl hover:bg-[#7B6ADA] hover:text-white  py-2 px-4"
              >
                <div>{jobtype.jobtype_name}</div>
              </button>
            ))}
            <button
                
                className="btn btn-md text-[10px] bg-white border-[#7B6ADA] text-[#7B6ADA] border-3 rounded-xl hover:bg-white hover:text-[#7B6ADA]  py-2 px-4"
              >
                ทั้งหมด
              </button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-white p-4">
          
          <a className="text-lg text-[#7B6ADA] font-bold">ประกาศล่าสุด</a>
          <div className="relative flex items-center mb-3">
            <button onClick={() => navigate("/job")} className="z-10 btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-full pt-0.5 px-5 w-30 lg:w-40 hover:w-40 lg:text-sm">งาน</button>
            <button onClick={() => navigate("/volun")} className="z-0 -ml-5 btn btn-xs bg-white text-[#7B6ADA] border-3 pt-0.5 px-5 w-30 lg:w-40 border-[#7B6ADA] rounded-full hover:w-40 lg:text-sm">กิจกรรมจิตอาสา</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-1 mb-5">
            {lastpost.map((post) => (
              <div key={post.post_id} className="card card-xs bg-white w-45 md:w-52 lg:w-55 xl:w-70 shadow-sm rounded-">
                <figure >
                  <img
                    src="gray.png" className="w-full h-30" />
                </figure>
                <div className="card-body justify-between">
                  <a className="card-title text-xs text-[#7B6ADA]">{post.position_name}</a>
                  <a className="card-title text-[10px] text-black">{post.fullname}</a>
                  {/* <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} filled={i <= 3} />
                    ))}
                  </div> */}
                  <div className="flex justify-center">
                  <EmpRating emp_id={post.emp_id} cl="#7B6ADA" />
                    
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" /><a className="card-title text-[10px] text-black">ต.{post.tb} อ.{post.ap} จ.{post.jw}</a>
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" /><a className="card-title text-[10px] text-black">{post.salary} บาท/เดือน</a>
                  </div>
                  <div className="card-actions justify-center">
                    <button 
                      
                      className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-lg"
                    >รายละเอียด</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <center className="flex gap-0.5">
            <div className="text-[#7B6ADA]"><FaCircle /></div>
            <div className="text-[#D9D9D9]"><FaCircle /></div><div className="text-[#D9D9D9]"><FaCircle /></div><div className="text-[#D9D9D9]"><FaCircle /></div>
          </center>
        </div>
        <Footer />
        {/* Modal ให้ไปล็อกอินนน */}
          <dialog id="gologin_modal" className="modal">
            <div className="modal-box  bg-white">
              <center><h2 className="text-xs md:text-xl text-[#7B6ADA] font-bold mb-4">กรุณาเข้าสู่ระบบก่อนเพื่อเข้าถึงข้อมูล</h2></center>
                
              <div className="modal-action flex flex-col justify-center items-center">
                
                <button className="btn btn-sm md:btn-md w-1/3 bg-[#7B6ADA] border border-[#7B6ADA] text-white px-4 py-2 rounded-md" onClick={() => navigate("/login")}>
                  เข้าสู่ระบบ
                </button>
                <button className="btn btn-sm md:btn-sm bg-white border border-[#7B6ADA] text-[#7B6ADA] px-4 py-2 rounded-md" onClick={handleclose}>
                  ยกเลิก
                </button>
              </div>
            </div>
          </dialog>
      </div>
    )
}

export default Index