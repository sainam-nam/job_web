import { NavLink  } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Menu() {
      const [data, setData] = useState([]);
      const [countall , setCountAll] = useState([]);
      const [page, setPage] = useState(1);
      const [total, setTotal] = useState();
      const limit = 15;
      const [totalPages, setTotalPages] = useState(1);
      const [jvtype, setJVType ] = useState("job");
      const navigate = useNavigate();
    
      useEffect(() => {
        fetchData();
      }, [page , jvtype]);
    
      const fetchData = async () => {
        try {
          const res = await fetch(`http://localhost:8081/sb_jobtype?page=${page}&limit=${limit}&type=${jvtype}`);
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
                <a className="text-lg text-[#7B6ADA] font-bold">ประเภท</a>
                <a className="text-sm text-[#7B6ADA] font-bold pl-1 pt-0.5">ยอมนิยม</a>
            </div>
            <div className="relative flex items-center justify-center mb-3">
                <button onClick={() =>{setJVType("job"); navigate("/User/alljob");}} className={` -ml-5 btn btn-xs  border-3 pt-0.5 px-5 w-1/2  rounded-full lg:text-sm ${jvtype === "job" ? "z-10 bg-[#7B6ADA] border-[#7B6ADA]" : "z-0 bg-white text-[#7B6ADA] border-[#7B6ADA]"}`}>งาน</button>
                <button onClick={() =>{setJVType("volun"); navigate("/User/allvolun");}} className={` -ml-5 btn btn-xs  border-3 pt-0.5 px-5 w-1/2  rounded-full lg:text-sm ${jvtype === "job" ? "z-0 bg-white text-[#7B6ADA] border-[#7B6ADA]" : "z-10 bg-[#7B6ADA] border-[#7B6ADA]"}`}>กิจกรรมจิตอาสา</button>
            </div>
            <aside className="w-full bg-white">
                <ul className="menu bg-[#D9D9D9] text-[#7B6ADA] rounded-3xl shadow-md w-80 ">
                    <li className="">
                        <NavLink to={`/User/all${jvtype}`}
                             className={({ isActive }) => `block py-2 px-4 rounded-2xl hover:py-2 hover:px-4 hover:bg-[#7B6ADA] hover:text-white hover:rounded-2xl ${isActive ? "bg-[#7B6ADA] text-white font-bold" : ""}`}>
                             ทั้งหมด [ {countall}  ] 
                            
                            </NavLink>
                    </li>
                    {data.map((type , index) => (
                        <li key={index}>
                            <NavLink to={`/User/${jvtype}s/${type.name}`}
                             className={({ isActive }) => `block py-2 px-4 rounded-2xl hover:py-2 hover:px-4 hover:bg-[#7B6ADA] hover:text-white hover:rounded-2xl ${isActive ? "bg-[#7B6ADA] text-white font-bold" : ""}`}>
                             {type.name} [ {type.count} ]
                            
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </aside>
            <center>
                <div className="join items-center gap-2 my-2">
                {page > 1 && (
                    <button onClick={() => setPage(page - 1)}><img src="/up.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                )}

                {total > 0 ? (
                <button className="btn btn-xs btn-primary rounded-3xl join-item btn">{page}/{totalPages}</button>
                ) : (
                <button className="btn btn-xs btn-primary rounded-3xl join-item btn">ไม่มีข้อมูล</button>
                )
                }

                {page < totalPages && (
                    <button onClick={() => setPage(page + 1)}><img src="/down.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
                )}
                </div>
            </center>
        </div>
    )
}