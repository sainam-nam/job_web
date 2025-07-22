import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import JobCard from "../jobber_comp/job_card";

import axios from "axios";
import { MdOutlineSearch } from "react-icons/md";

export default function JobsByjobtype() {
  const { jobtype } = useParams();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const [limit, setLimit] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  //const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const updateLimit = () => {
      const width = window.innerWidth;

      if (width < 640) {
        // sm: < 640px
        setLimit(4);
      } else if (width < 1024) {
        // sm: < 640px
        setLimit(6);
      } else if (width < 1280) {
        // lg: < 1024px
        setLimit(4);
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
      
  }, [limit, page, search, jobtype]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/jobs?jobtype=${jobtype}&page=${page}&limit=${limit}&keyword=${search}`);
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
  return (
    <div className="flex flex-col justify-center items-center w-full px-5 pt-3 lg:pt-5 lg:px-0 lg:pr-4">
          <h1 className="text-lg md:text-3xl font-bold mb-2 text-[#7B6ADA] ">{jobtype} [ {total} ]</h1>
          <label className="input w-50 md:w-70 h-7 bg-white mb-2 rounded-lg border border-[#7B6ADA]">
                    <button>
                      <MdOutlineSearch className="fill-[#7B6ADA] mt-0 md:size-5" />
                    </button>
                    <input 
                      type="search" 
                      className="text-[#7B6ADA] text-xs md:text-sm" 
                      placeholder="ชื่อตำแหน่ง หรือ ชื่อนายจ้าง" 
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      
                    /> 
          </label>
          <div className="text-right text-[#7B6ADA] text-xs md:text-lg w-full mb-1" >
            เรียง : ..............
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.map(post => <JobCard key={post.post_id} post={post} />)}
          </div>
          <center>
            <div className="join items-center gap-2 my-2">
              {page > 1 && (
                <button onClick={() => setPage(page - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
              )}
    
            {total > 0 ? (
              <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">{page}/{totalPages}</button>
            ) : (
              <button className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-3xl join-item btn">ไม่มีข้อมูล</button>
            )
            }
    
              {page < totalPages && (
                <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
              )}
            </div>
          </center>
        </div>
  );
}
