import { MdOutlineSearch } from "react-icons/md";
import JobCard from "../jobber_comp/job_card";
import { useEffect, useState } from "react";

export default function AllJobs() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const limit = 8;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  //const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8081/alljob_card?page=${page}&limit=${limit}&keyword=${search}`);
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
    <div className="flex flex-col justify-center items-center w-full p-5">
      <h1 className="text-3xl font-bold mb-4 text-[#7B6ADA] ">งานทั้งหมด [ {total} ]</h1>
      <label className="input w-70 h-7 bg-white mb-4 rounded-lg border border-[#7B6ADA]">
                <button>
                  <MdOutlineSearch className="fill-[#7B6ADA] mt-0 md:size-5" />
                </button>
                <input 
                  type="search" 
                  className="text-[#7B6ADA] text-xs" 
                  placeholder="ชื่อตำแหน่ง หรือ ชื่อนายจ้าง" 
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  
                /> 
      </label>
      <div className="text-right text-[#7B6ADA] text-lg w-full pr-35" >
        เรียง : ..............
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {data.map(post => <JobCard key={post.post_id} post={post} />)}
      </div>
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
  );
}
