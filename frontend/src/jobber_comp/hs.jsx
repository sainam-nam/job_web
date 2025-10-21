import { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import { useLocation } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";

export default function UserHs() {
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState([]);
  const [hsData, setHsData] = useState([]);
  const [addData, setAddData] = useState({ hardskill_id: "", jobber_id: userId });
  const [delData, setDelData] = useState({ hardskill_id: "", jobber_id: userId });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
              // ถ้าไม่มี token อาจ redirect ไป login
        
              window.location.href = "/login";
              return;
            }
            try {
              const decoded = jwtDecode(token);
              setUserId(decoded.jobber_id); // ✅ สมมุติว่า backend ใส่ user_id มาใน token
              
            } catch (error) {
              console.error("Invalid token", error);
              window.location.href = "/login";
            }
            
        
          }, []);
  const hs_data = async () => {
    try {
      

      const res = await fetch(`${apiUrl}/hs`);
      const result = await res.json();

      if(Array.isArray(result.data)){
        //console.log("sql", result)
        setHsData(result.data);
      } else {
        console.error("Data format error:", result);
        setHsData([]);
      }
      

    } catch (err) {
      console.log(err);
    }
  };

 useEffect(() => {
  if (userId) {
    hs_data().then(() => fetchData());
  }
}, [page, search, userId]);


  const fetchData = async () => {
    try {
      

      const res = await fetch(`${apiUrl}/user_hardskill?page=${page}&limit=${limit}&keyword=${search}&jobber_id=${userId}`);
      const result = await res.json();

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setData(result.data);
        // 👇 สร้าง array ของ hardskill_id ที่ผู้ใช้มีอยู่
      const userHsIds = result.data.map((hs) => hs.hardskill_id);

      // 👇 filter hsData ทันที (ลบทักษะที่ผู้ใช้มีออกจาก dropdown)
      setHsData((prev) => prev.filter((hs) => !userHsIds.includes(hs.hardskill_id)));
   
      } else {
        console.error("Data format error:", result);
        setData([]);
      }
      //console.log(result.totalRecords);
      setTotal(result.totalRecords);
      setTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    };
  }


  // เมื่อเลือกทักษะแล้ว ให้ลบทักษะนั้นออกจาก hsData ทันที (และเพิ่มคำอธิบายข้างโค้ด)
  const handleInsert = async () => {
    if(addData.hardskill_id == "") {
      alert("กรุณาเลือกทักษะ");
      return;
    }
    try {
      // ส่งข้อมูลไป backend ตามปกติ
      const res = await fetch(`${apiUrl}/add_jobber_hs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          jobber_id: userId, 
          hardskill_id: addData.hardskill_id
        }),
      });

      if (res.ok) {
        // เมื่อลงทะเบียนทักษะสำเร็จ ให้ลบทักษะนั้นออกจาก hsData ทันที
        setHsData((prev) =>
          prev.filter((hs) => hs.hardskill_id !== addData.hardskill_id)
        );
        document.getElementById("add_modal").close();
        fetchData(); // รีเฟรชรายการของผู้ใช้
      } else {
        console.error("เพิ่มข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDel = (val) => {
    setDelData(val);
    document.getElementById("del_modal").showModal();
  };



  const handleDelete = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/user_hardskill/?jobber_id=${userId}&hardskill_id=${delData.hardskill_id}`, {
        method: "DELETE",
        
      });
      //console.log(res);
      if (res.ok) {
        //alert("ลบข้อมูลสำเร็จ!");
        document.getElementById("del_modal").close();
        fetchData();
      } else {
        console.error("ลบข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };



  return (
    <main className="flex-1 pt-8" >
      <div className="flex items-center justify-center text-white text-xl font-bold mb-3" >
        <p>ข้อมูลทักษะความรู้</p>
      </div>
      <div className="flex flex-col rounded-3xl p-2"  style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
        <div className="flex justify-between items-center mt-1 mb-1 md:mt-2 md:mb-2" >
          <div className="flex gap-2">
            <h1 className="text-white text-[10px] font-bold md:text-lg">คุณมีทักษะด้านความรู้ทั้งหมด {total} รายการ</h1>
            <button className="btn btn-xs sm:btn-sm md:btn-sm btn-success text-[10px] text-white px-4 py-2 rounded-lg" onClick={() => {document.getElementById("add_modal").showModal();}} >เพิ่มทักษะ</button>
          </div>
          <div className="flex items-center gap-2">
          <label className="input w-30 h-7 bg-white rounded-lg border border-[#8E80FF] ">
            
            <div className="tooltip tooltip-left" data-tip="ค้นหาจากทักษะความรู้">
              <input 
                type="search" 
                className="text-[#8E80FF] text-xs" 
                placeholder="Search" 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                
              />
            </div>
            <button>
              <MdOutlineSearch className="fill-[#8E80FF] mt-1 md:size-5" />
            </button>
          </label>
            {/* <h1 className="text-[#8E80FF] text-md font-bold">เรียง :</h1> 
            <select defaultValue="Pick" className="select-md bg-white text-[#8E80FF]">
              <option>เลือกข้อมูลที่ต้องการเรียงลำดับ</option>
              <option>Crimson</option>
              <option>Amber</option>
              <option>Velvet</option>
            </select> */}
          </div>
        </div>

        <div className="overflow-x-auto text-xs md:text-lg text-[#8E80FF] rounded-3xl border border-[#D9D9D9] bg-white shadow-md">
          <table className="table">
            <thead>
              <tr className="bg-[#D9D9D9] text-[10px] md:text-lg text-[#8E80FF] font-bold text-center">
                <th className="w-[5%]">ที่</th>
                <th className="w-[70%]">ทักษะด้านความรู้</th>
                <th className="w-[25%]">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((val, index) => (
                <tr key={index} className="hover:bg-[#D9D9D9] text-[10px] md:text-lg">
                  <td className="text-center">{(page-1) * limit + index +1}</td>
                  <td className="">{val.hardskill_name || "N/A"}</td>
                  <td className="text-center ">
                    
                    <div className="tooltip tooltip-left" data-tip="ลบ">
                      <button className="btn btn-xs text-md md:text-lg btn-error text-white w-8 h-7 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => handleDel(val)} >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>

                      </button>  
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
              <button onClick={() => setPage(page - 1)}>
                <img src="/up.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 rounded hover:shadow-lg hover:shadow-[#8E80FF] transition-shadow" />
                
              </button>
            )}

          {total > 0 ? (
            <button className="btn btn-xs btn-primary rounded-3xl join-item btn">{page}/{totalPages}</button>
          ) : (
            <button className="btn btn-xs btn-primary rounded-3xl join-item btn">ไม่มีข้อมูล</button>
          )
          }

            {page < totalPages && (
              <button onClick={() => setPage(page + 1)}><img src="/down.png" className="-rotate-90 w-4 h-4 md:w-6 md:h-6 rounded hover:shadow-lg hover:shadow-[#8E80FF] transition-shadow" /></button>
            )}
          </div>
        </center>
      </div>

      {/* Modal สำหรับเพิ่ม */}
      <dialog id="add_modal" className="modal">
        <div className="modal-box bg-white">
          <center><h2 className="text-xs md:text-lg text-[#8E80FF] font-bold mb-2 md:mb-4">เพิ่มทักษะด้านความรู้</h2></center>
          
          
          <a className="text-sm md:text-md text-[#8E80FF]">ทักษะด้านความรู้</a>
          <select 
            className="select w-full bg-white text-[#8E80FF] border border-gray-300 rounded-md px-3 py-2 mt-2"
            value={addData.hardskill_id}
            onChange={(e) => setAddData({...addData, hardskill_id: e.target.value })}
          >
            <option value="">--เลือกประเภทงานที่ตรงกับตำแหน่งงาน--</option>
            {hsData.map((hs) => (
              <option key={hs.hardskill_id} value={hs.hardskill_id}>
                {hs.hardskill_name}
              </option>
            ))}
          </select>
          <div className="modal-action">
            
            <button className="btn btn-sm md:btn-md bg-green-500 border border-green-500 text-white px-4 py-2 rounded-md" onClick={handleInsert}>
              บันทึก
            </button>
            <button className="btn btn-sm md:btn-md bg-red-500 border border-red-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("add_modal").close()}>
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>

      {/* Modal สำหรับลบบบบบบบบบบ */}
      <dialog id="del_modal" className="modal">
        <div className="modal-box bg-white">
          <center><h2 className="text-xs md:text-lg text-[#8E80FF] font-bold mb-4">ยืนยันการลบ</h2></center>
           <div className="flex justify-center mb-4">
                                 <FaTrash className="text-red-500 text-4xl md:text-5xl" />
                               </div>
                             <div className="modal-action flex justify-center">
            
            <button className="btn btn-sm md:btn-md bg-red-500 border border-red-500 text-white px-4 py-2 rounded-md" onClick={() => handleDelete()}>
              ลบเลยยย
            </button>
            <button className="btn btn-sm md:btn-md bg-green-500 border border-green-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("del_modal").close()}>
              ดูก่อนละกัน
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );

}