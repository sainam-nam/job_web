import { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { CheckIcon } from '@heroicons/react/24/outline'

export default function VolunType() {
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState({ voluntype_id: "", voluntype_name: "", status: "" });
  const [addData, setAddData] = useState({ voluntype_id: "", voluntype_name: "" });
  const [delData, setDelData] = useState({ voluntype_id: "", voluntype_name: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    try {
      

      const res = await fetch(`${apiUrl}/voluntype?page=${page}&limit=${limit}&keyword=${search}`);
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

    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (val) => {
    setEditData(val);
    document.getElementById("my_modal").showModal();
  };

  const handleSta = (val) => {
    setEditData(val);
    document.getElementById("status_modal").showModal();
  };

  const handleDel = (val) => {
    setDelData(val);
    document.getElementById("del_modal").showModal();
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${apiUrl}/voluntype/${editData.voluntype_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voluntype_name: editData.voluntype_name }),
      });

      if (res.ok) {
        //alert("อัปเดตสำเร็จ!");
        document.getElementById("my_modal").close();
        fetchData();
      } else {
        console.error("Update failed");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleStatus = async () => {
    try {
      const res = await fetch(`${apiUrl}/voluntypesta/${editData.voluntype_id}`, {
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

  const handleInsert = async () => {
    if (!addData.voluntype_name.trim()) {
    alert("กรุณากรอกชื่อทักษะ");
    return;
  }
    try {
      const res = await fetch(`${apiUrl}/voluntype/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voluntype_name: addData.voluntype_name }),
      });

      if (res.ok) {
        //alert("เพิ่มข้อมูลสำเร็จ!");
        document.getElementById("add_modal").close();
        fetchData();
      } else {
        console.error("เพิ่มข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${apiUrl}/voluntype/${delData.voluntype_id}`, {
        method: "DELETE",
        
      });

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
    <main className="flex-1 pt-2 px-4 lg:p-8">
      
      <div className="flex items-center justify-center text-[#7B6ADA] text-xl font-bold">
        <p>ข้อมูลประเภทกิจกรรมจิตอาสา</p>
      </div>
      
      <div className="flex justify-between items-center mt-1 mb-3 md:mt-2 md:mb-2">
        <h1 className="text-[#7B6ADA] text-[10px] font-bold md:text-lg">ทั้งหมด {total} รายการ</h1>
        <button className="btn btn-xs sm:btn-sm md:btn-sm btn-success text-[10px] text-white px-4 py-2 rounded-lg" onClick={() => {setAddData({ voluntype_id: "", voluntype_name: "" }); document.getElementById("add_modal").showModal();}} >เพิ่มข้อมูล</button>
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
          
          <div className="tooltip tooltip-bottom" data-tip="ค้นหาจากประเภทกิจกรรม">
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
        <table className="table">
          <thead>
            <tr className="bg-[#D9D9D9] text-[10px] md:text-lg text-[#7B6ADA] font-bold text-center">
              <th className="w-[5%]">ที่</th>
              <th className="w-[65%]">ประเภทกิจกรรมจิตอาสา</th>
              <th className="w-[10%]">การใช้งาน</th>
              <th className="w-[20%]">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className="hover:bg-[#D9D9D9] text-[10px] md:text-lg">
                <td className="text-center">{(page-1) * limit + index +1}</td>
                <td className="">{val.voluntype_name || "N/A"}</td>

                
                    {val.status === "ON" ? (
                        <td className="text-center">ปกติ</td>
                    ) : (
                        <td className="text-center text-error">ถูกระงับ</td>
                    )}
                

                <td className="flex flex-col gap-0.5 justify-center items-center md:gap-1 md:text-center lg:flex lg:flex-row lg:gap-1 lg:text-center">
                  <div className="tooltip tooltip-left" data-tip="แก้ไข">
                    <button className="btn btn-xs text-md md:text-lg btn-warning text-2xl text-white w-8 h-8 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => handleEdit(val)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  </div>
                    {val.status === "ON" ? (
                      <div className="tooltip tooltip-left" data-tip="คลิกเพื่อระงับ">
                        <button className="btn btn-xs  md:btn-sm btn-success text-2xl text-white w-8 h-8 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => handleSta(val)}>
                          <CheckIcon strokeWidth={5} />
                        </button>
                      </div>

                    ) : (
                      <div className="tooltip tooltip-left" data-tip="คลิกเพื่อคืนสิทธิ์">
                        <button className="btn btn-xs  md:btn-sm btn-error text-[10px] text-white w-8 h-8 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => handleSta(val)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                    }
                  <div className="tooltip tooltip-left" data-tip="ลบ">
                    <button className="btn btn-xs text-md md:text-lg btn-error text-white w-8 h-8 md:w-9 md:w-9 lg:w-10 lg:w-10" onClick={() => handleDel(val)} >
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
      {/* Modal สำหรับแก้ไข */}
      <dialog id="my_modal" className="modal">
        <div className="modal-box bg-white">
          <center><h2 className="text-xs md:text-lg text-[#7B6ADA] font-bold mb-4">แก้ไขประเภทกิจกรรมจิตอาสา</h2></center>
          <input
            type="text"
            className="w-full text-sm md:text-md text-[#7B6ADA] border border-gray-300 rounded-md px-3 py-2 mt-2"
            value={editData.voluntype_name}
            onChange={(e) => setEditData({ ...editData, voluntype_name: e.target.value })}
          />
          <div className="modal-action">
            
            <button className="btn btn-sm md:btn-md bg-green-500 border border-green-500 text-white px-4 py-2 rounded-md" onClick={handleUpdate}>
              บันทึก
            </button>
            <button className="btn btn-sm md:btn-md bg-red-500 border border-red-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("my_modal").close()}>
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>

      {/* Modal สำหรับเพิ่ม */}
      <dialog id="add_modal" className="modal">
        <div className="modal-box bg-white">
          <center><h2 className="text-xs md:text-lg text-[#7B6ADA] font-bold mb-2 md:mb-4">เพิ่มประเภทกิจกรรมจิตอาสา</h2></center>
          <input
            type="text"
            className="w-full text-sm md:text-md text-[#7B6ADA] border border-gray-300 rounded-md px-3 py-2 mt-2"
            value={addData.voluntype_name}
            onChange={(e) => setAddData({ ...addData, voluntype_name: e.target.value })}
          />
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
        <div className="modal-box  bg-white">
          <center><h2 className="text-xs md:text-lg text-[#7B6ADA] font-bold mb-4">คุณต้องการลบข้อมูลประเภทกิจกรรมจิตอาสานี้</h2></center>
            <div className="flex">
              <label className="text-xs md:text-md text-[#7B6ADA]">ชื่อประเภทกิจกรรมจิตอาสา : </label>
              &nbsp;&nbsp;
              <h3 className="text-xs text-[#7B6ADA] font-bold">{delData.voluntype_name}</h3>
            </div>
          <div className="modal-action">
            
            <button className="btn btn-sm md:btn-md bg-red-500 border border-red-500 text-white px-4 py-2 rounded-md" onClick={() => handleDelete()}>
              ลบเลยยย
            </button>
            <button className="btn btn-sm md:btn-md bg-green-500 border border-green-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("del_modal").close()}>
              ดูก่อนละกัน
            </button>
          </div>
        </div>
      </dialog>

      {/* Modal สำหรับอนุมัติ ระงับ */}
      <dialog id="status_modal" className="modal">
        <div className="modal-box bg-white">
          <center>
              {editData.status === "ON" ? (
                      <a className="text-xs md:text-lg text-error font-bold mb-4">ต้องการระงับประเภทกิจกรรมจิตอาสานี้ใช่หรือไม่?</a> 
                  ) : (
                     <a className="text-xs md:text-lg text-success font-bold mb-4">ต้องการอนุมัติประเภทกิจกรรมจิตอาสานี้ใช่หรือไม่?</a>  
                  )}
              
          </center>   
          
            <div className="flex items-center">
              <label className="text-xs md:text-md text-[#7B6ADA]">ชื่อประเภทกิจกรรมจิตอาสา : </label>
              &nbsp;&nbsp;
              <h3 className="text-xs text-[#7B6ADA] font-bold">{editData.voluntype_name}</h3>
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
