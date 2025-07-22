import { NavLink  } from "react-router-dom";
import { useState, useEffect , useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Menu() {
      const [data, setData] = useState([]);
      const [countall , setCountAll] = useState([]);
      const [page, setPage] = useState(1);
      const [total, setTotal] = useState();
      const [limit, setLimit] = useState(null);
      const [totalPages, setTotalPages] = useState(1);
      const [jvtype, setJVType ] = useState("job");
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const asideRef = useRef(null);
      const navigate = useNavigate();
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
    
      const updateLimit = () => {
      const width = window.innerWidth;

      if (width < 1024) {
        // sm: < 640px
        setLimit(15);
      } else if (width >= 1024) {
        // lg: < 1024px
        setLimit(20);
      } else {
        // xl และใหญ่กว่า
        setLimit(15);
      }
    };

    useEffect(() => {
      
      // รันตอนแรก
      updateLimit();

      // ฟัง event resize
      window.addEventListener("resize", updateLimit);
      return () => window.removeEventListener("resize", updateLimit);

    }, []);

      useEffect(() => {
        if(limit !== null) {
          fetchData();
        }
      }, [limit, page , jvtype]);

      useEffect(() => {
        if (isMenuOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }

        return () => {
          document.body.style.overflow = 'auto'; // ป้องกันค้าง
        };
      }, [isMenuOpen]);

    
      const fetchData = async () => {
        try {
          const res = await fetch(`${apiUrl}/sb_jobtype?page=${page}&limit=${limit}&type=${jvtype}`);
          const result = await res.json();
    
          if(Array.isArray(result.data)){
            //console.log("sql", res)
            setData(result.data);
          } else {
            console.error("Data format error:", result);
            setData([]);
          }
          setTotal(result.totalRecords);
          setTotalPages(result.totalPages || 1);
          setCountAll(result.countAll);
        } catch (err) {
          console.log(err);
        }
      };
    return(
        <div className="w-full bg-white p-2">
            <div className="flex items-center justify-center">
                <a className="text-lg sm:text-xl md:text-2xl text-[#7B6ADA] font-bold">ประเภท</a>
                <a className="text-xs sm:text-sm md:text-lg text-[#7B6ADA] font-bold pl-1 pt-0.5">ยอมนิยม</a>
            </div>
            <div className="relative flex items-center justify-center mb-3 lg:mb-2">
                <button onClick={() =>{setJVType("job"); navigate("/User/alljob");}} className={` -ml-5 btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-lg text-sm sm:text-md md:text-lg lg:text-xl border-3 pt-0.5 px-5 w-1/2  rounded-full  ${jvtype === "job" ? "z-10 bg-[#7B6ADA] border-[#7B6ADA]" : "z-0 bg-white text-[#7B6ADA] border-[#7B6ADA]"}`}>งาน</button>
                <button onClick={() =>{setJVType("volun"); navigate("/User/allvolun");}} className={` -ml-5 lg:-ml-7 btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-lg text-sm sm:text-md md:text-lg lg:text-lg border-3 pt-0.5 px-5 lg:px-0 lg:pl-4 w-1/2  rounded-full ${jvtype === "job" ? "z-0 bg-white text-[#7B6ADA] border-[#7B6ADA]" : "z-10 bg-[#7B6ADA] border-[#7B6ADA]"}`}>กิจกรรมจิตอาสา</button>
            </div>
            {/* ปุ่มเปิดเมนู (เฉพาะจอเล็ก) */}
            <div className="flex justify-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-sm text-[#7B6ADA] font-bold border border-[#7B6ADA] px-4 py-1 rounded-full hover:bg-[#7B6ADA] hover:text-white"
              >
                ☰ เลือกประเภท
              </button>
            </div>
            {/* ✅ overlay ดำ เมื่อเมนูเปิด (เฉพาะมือถือ) */}
            {isMenuOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              ></div>
            )}
            <aside 
              ref={asideRef}
              className={`bg-white transition-transform duration-300 ease-in-out fixed z-20 top-0 left-0 h-full w-80 p-2 overflow-y-auto lg:static lg:block 
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 `}>
                <ul className="menu bg-[#D9D9D9] text-[#7B6ADA] text-sm rounded-3xl shadow-md w-full ">
                    <li className="">
                        <NavLink 
                            to={`/User/all${jvtype}`}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) => `block py-2 px-4 rounded-2xl hover:py-2 hover:px-4 hover:bg-[#7B6ADA] hover:text-white hover:rounded-2xl ${isActive ? "bg-[#7B6ADA] text-white font-bold" : ""}`}>
                            ทั้งหมด [ {countall} ] 
                            
                            </NavLink>
                    </li>
                    {data.map((type , index) => (
                        <li key={index}>
                            <NavLink 
                              to={`/User/${jvtype}s/${type.name}`}
                              onClick={() => setIsMenuOpen(false)}
                              className={({ isActive }) => `block py-2 px-4 rounded-2xl hover:py-2 hover:px-4 hover:bg-[#7B6ADA] hover:text-white hover:rounded-2xl ${isActive ? "bg-[#7B6ADA] text-white font-bold" : ""}`}>
                              {type.name} [ {type.count} ]
                            
                            </NavLink>
                        </li>
                    ))}
                </ul>
            
            <center>
                <div className="join items-center gap-2 my-2">
                {page > 1 && (
                    <button onClick={() => {setPage(page - 1); asideRef.current?.scrollTo({ top: 0, behavior: "smooth" });}}>
                      <img src="/up.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" />
                    </button>
                )}

                {total > 0 ? (
                <button className="btn btn-xs btn-primary rounded-3xl join-item btn">{page}/{totalPages}</button>
                ) : (
                <button className="btn btn-xs btn-primary rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                )
                }

                {page < totalPages && (
                    <button onClick={() => {setPage(page + 1); asideRef.current?.scrollTo({ top: 0, behavior: "smooth" });}}>
                      <img src="/down.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" />
                    </button>
                )}
                </div>
            </center>
          </aside>  
        </div>
    )
}