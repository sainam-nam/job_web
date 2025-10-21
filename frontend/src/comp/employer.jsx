import { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { CheckIcon } from '@heroicons/react/24/outline'
import { useNavigate } from "react-router-dom";


export default function Employer() {
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState({ emp_id: "", fullname: "" , status: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
  }, [page, search]);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/emp?page=${page}&limit=${limit}&keyword=${search}`);
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


  const handleSta = (val) => {
    setEditData(val);
    document.getElementById("status_modal").showModal();
  };

  const goToProfile = (val) => {
    navigate(`/Emp_Pf?emp_id=${val}&type=job`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };
  
  const handleStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/empsta/${editData.emp_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify({ status: editData.status }),
      });

      if (res.ok) {
        //alert("อัปเดตสำเร็จ!");
        document.getElementById("status_modal").close();
        fetchData();
        
      } else {
        console.error("Update failed");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  
  return (
    <main className="flex-1 pt-2 px-2 lg:p-8">
      
      
      <div className="flex items-center justify-center text-[#7B6ADA] text-xl font-bold">
        <p>ข้อมูลนายจ้างและผู้จัดกิจกรรม</p>
      </div>
      <div className="flex justify-between items-center mt-1 mb-3 md:mt-2 md:mb-2">
        <h1 className="text-[#7B6ADA] text-[10px] font-bold md:text-lg">ทั้งหมด {total} รายการ</h1>
        
        {/*<div className="flex items-center gap-2">
        
          <h1 className="text-[#7B6ADA] text-[10px] md:text-md font-bold">เรียง :</h1> 
          <select defaultValue="Pick" className="select-sm text-[10px] md:text-md bg-white text-[#7B6ADA]">
            <option>เลือกข้อมูลที่ต้องการเรียงลำดับ</option>
            <option>Crimson</option>
            <option>Amber</option>
            <option>Velvet</option>
          </select>
        </div>*/}
        <label className="input w-30 h-7 bg-white rounded-lg border border-[#7B6ADA]">
          
          <div className="tooltip tooltip-bottom" data-tip="ค้นหาจากชื่อ-นามสกุล">
          <input 
            type="search" 
            className="text-[#7B6ADA] text-xs" 
            placeholder="Search" 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            
          />
          </div>
          <button>
            <MdOutlineSearch className="fill-[#7B6ADA] mt-1 md:size-5" />
          </button>
      </label>
      </div>
        
      <div className="overflow-x-auto text-xs md:text-lg text-[#7B6ADA] rounded-3xl border border-[#D9D9D9] bg-white shadow-md">
        <table className="table w-full">
          <thead>
            <tr className="bg-[#D9D9D9] text-[10px] md:text-lg text-[#7B6ADA] font-bold text-center">
              <th className="w-[5%]">ที่</th>
              <th className="w-[8%] hidden md:table-cell md:text-center">รูป</th>
              <th className="w-[25%]">ชื่อ-นามสกุล</th>
              <th className="w-[5%]">จำนวนงาน</th>
              <th className="w-[5%]">จำนวน<br />กิจกรรมจิตอาสา</th>
              <th className="w-[10%] hidden md:table-cell">การใช้งาน</th>
              <th className="w-[15%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className="hover:bg-[#D9D9D9] text-[10px] md:text-lg">
                <td className="text-center">{(page-1) * limit + index +1}</td>
                <td className="hidden md:table-cell md:text-center">
                  
                  <div className="avatar">
                    <div className="rounded-full">
                      {val.picture ? (
                          <img src={`/uploads/emp_pic/${val.picture}`} className="rounded-full w-full h-18 object-cover" />
                        ) : (
                          <img src={`/uploads/nophoto.png`} className="rounded-full w-full h-18 object-cover" />
                        )}
                    </div>
                  </div>
                </td>
                <td className="">{val.fullname || "N/A"}</td>

                
                <td className="text-center">{val.job}</td>    
                <td className="text-center">{val.volun}</td>
                
                
                {val.status === "OFF" ? (
                    <td className="text-center text-error hidden md:table-cell ">ถูกระงับ</td>
                  ) : (
                    <td className="text-center hidden md:table-cell ">ปกติ</td>
                )}
                

                <td>
                  <div className="flex justify-center items-center gap-0.5">
                    <div className="tooltip tooltip-left" data-tip="ดูโปรไฟล์">
                      <button className="btn btn-xs md:text-lg bg-[#7B6ADA] border-[#7B6ADA] text-2xl font-bold text-white mb-1 w-8 h-8 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => goToProfile(val.emp_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </button>
                    </div>
                    {val.status === "ON" ? (
                      <div className="tooltip tooltip-left" data-tip="คลิกเพื่อระงับ">
                        <button className="btn btn-xs md:text-lg btn-success text-2xl text-white mb-1 w-8 h-8 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => handleSta(val)}>
                          <CheckIcon strokeWidth={5} />
                        </button>
                      </div>
                    ) : (
                      <div className="tooltip tooltip-left" data-tip="คลิกเพื่อคืนสิทธิ์">
                        <button className="btn btn-xs md:text-lg btn-error text-[10px] text-white mb-1 w-8 h-8 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => handleSta(val)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      <center>
        <div className="join items-center gap-2 my-2">
          {page > 1 && (
            <button onClick={() => setPage(page - 1)}><img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6" /></button>
          )}

        {total > 0 ? (
          <button className="btn btn-xs btn-primary rounded-3xl join-item btn">{page}/{totalPages}</button>
        ) : (
          <button className="btn btn-xs btn-primary rounded-3xl join-item btn">ไม่มีข้อมูล</button>
        )
        }

          {page < totalPages && (
            <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 " /></button>
          )}
        </div>
      </center>
      

      {/* Modal สำหรับอนุมัติ ระงับ */}
      <dialog id="status_modal" className="modal">
        <div className="modal-box bg-white">
          <center>
              {editData.status === "ON" ? (
                      <a className="text-xs md:text-lg text-error font-bold mb-4">ต้องการระงับผู้ใช้คนนี้ใช่หรือไม่?</a> 
                  ) : (
                     <a className="text-xs md:text-lg text-success font-bold mb-4">ต้องการคืนสิทธิ์ให้ผู้ใช้คนนี้ใช่หรือไม่?</a>  
                  )}
              
          </center>   
          
            <div className="flex items-center">
              <label className="text-xs md:text-md text-[#7B6ADA]">ชื่อ-นามสกุล : </label>
              &nbsp;&nbsp;
              <h3 className="text-xs text-[#7B6ADA] font-bold">{editData.fullname}</h3>
            </div>
            <div className="flex items-center">
              <label className="text-xs text-[#7B6ADA]">สถานะ : </label>
              &nbsp;&nbsp;
                {editData.status === "ON" ? (
                    <a className="text-sm text-center text-success font-bold">ปกติ</a>
                ) : (
                    <a className="text-sm text-center text-error font-bold">ถูกระงับ</a>
                )}
            </div>
            
          <div className="modal-action">
            {/* สมมุติว่าเราแก้อะไรสักอย่างนึง แล้วก็เซฟ*/}
            <button className="btn bg-green-500 border border-green-500 text-white px-4 py-2 rounded-md" onClick={() => handleStatus()}>
              ตกลง
            </button>
            <button className="btn bg-red-500 border border-red-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("status_modal").close()}>
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
