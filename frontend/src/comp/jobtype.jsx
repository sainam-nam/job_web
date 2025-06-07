import { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";

export default function JobType() {
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState({ jobtype_id: "", jobtype_name: "", status: "" });
  const [addData, setAddData] = useState({ jobtype_id: "", jobtype_name: "" });
  const [delData, setDelData] = useState({ jobtype_id: "", jobtype_name: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch ] = useState("");

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8081/jobtype?page=${page}&limit=${limit}&keyword=${search}`);
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
      const res = await fetch(`http://localhost:8081/jobtype/${editData.jobtype_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobtype_name: editData.jobtype_name }),
      });

      if (res.ok) {
        alert("อัปเดตสำเร็จ!");
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
      const res = await fetch(`http://localhost:8081/jobtype/${editData.jobtype_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: editData.status }),
      });

      if (res.ok) {
        alert("อัปเดตสำเร็จ!");
        
      } else {
        console.error("Update failed");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleInsert = async () => {
    if (!addData.jobtype_name.trim()) {
    alert("กรุณากรอกชื่อทักษะ");
    return;
  }
    try {
      const res = await fetch("http://localhost:8081/jobtype/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobtype_name: addData.jobtype_name }),
      });

      if (res.ok) {
        alert("เพิ่มข้อมูลสำเร็จ!");
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
      const res = await fetch(`http://localhost:8081/jobtype/${delData.jobtype_id}`, {
        method: "DELETE",
        
      });

      if (res.ok) {
        alert("ลบข้อมูลสำเร็จ!");
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
      
      
      
      <div className="flex justify-between items-center mt-1 mb-3 md:mt-2 md:mb-2">
        <h1 className="text-[#7B6ADA] text-[10px] font-bold md:text-lg">ทั้งหมด {total} รายการ</h1>
        <button className="btn btn-xs sm:btn-lg md:btn-sm btn-success text-[10px] text-white px-4 py-2 rounded-lg" onClick={() => {setAddData({ jobtype_id: "", jobtype_name: "" }); document.getElementById("add_modal").showModal();}} >เพิ่มข้อมูล</button>
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
          <button>
            <MdOutlineSearch className="fill-[#7B6ADA] mt-1 md:size-5" />
          </button>
      </label>
      </div>

      <div className="overflow-x-auto text-xs md:text-lg text-[#7B6ADA] rounded-3xl border border-[#D9D9D9] bg-white shadow-md">
        <table className="table">
          <thead>
            <tr className="bg-[#D9D9D9] text-[10px] md:text-lg text-[#7B6ADA] font-bold text-center">
              <th className="w-1/8">#</th>
              <th className="w-2/4">ประเภทงาน</th>
              <th className="w-1/8">การใช้งาน</th>
              <th className="w-2/4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className="hover:bg-[#D9D9D9] text-[10px] md:text-lg">
                <td className="text-center">{(page-1) * limit + index +1}</td>
                <td className="">{val.jobtype_name || "N/A"}</td>

                
                    {val.status === "ON" ? (
                        <td className="text-center">ปกติ</td>
                    ) : (
                        <td className="text-center text-error">ถูกระงับ</td>
                    )}
                

                <td className="text-center">
                  <button className="btn btn-xs md:btn-sm btn-warning text-[10px] text-white" onClick={() => handleEdit(val)}>แก้ไข</button>&nbsp;
                    {val.status === "ON" ? (
                        <button className="btn btn-xs md:btn-sm btn-error text-[10px] text-white" onClick={() => handleSta(val)}>ระงับ</button>
                    ) : (
                        <button className="btn btn-xs md:btn-sm btn-success text-[10px] text-white" onClick={() => handleSta(val)}>อนุมัติ</button>
                    )
                    }

                    &nbsp;<button className="btn btn-xs md:btn-sm btn-error text-[10px] text-white" onClick={() => handleDel(val)} >ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      <center>
        <div className="join items-center gap-2 mt-4 mb-4">
          {page > 1 && (
            <button onClick={() => setPage(page - 1)}><img src="/up.png" className="w-6 h-6 hover:shadow-lg transition-shadow" /></button>
          )}

        {total > 0 ? (
          <button className="btn btn-primary rounded-3xl join-item btn">{page}</button>
        ) : (
          <button className="btn btn-primary rounded-3xl join-item btn">ไม่มีข้อมูล</button>
        )
        }

          {page < totalPages && (
            <button onClick={() => setPage(page + 1)}><img src="/down.png" className="w-6 h-6 hover:shadow-lg transition-shadow" /></button>
          )}
        </div>
      </center>
      {/* Modal สำหรับแก้ไข */}
      <dialog id="my_modal" className="modal">
        <div className="modal-box  bg-white">
          <center><h2 className="text-lg text-[#7B6ADA] font-bold mb-4">แก้ไขประเภทงาน</h2></center>
          <input
            type="text"
            className="w-full text-[#7B6ADA] border border-gray-300 rounded-md px-3 py-2 mt-2"
            value={editData.jobtype_name}
            onChange={(e) => setEditData({ ...editData, jobtype_name: e.target.value })}
          />
          <div className="modal-action">
            
            <button className="btn bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleUpdate}>
              บันทึก
            </button>
            <button className="btn bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("my_modal").close()}>
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>

      {/* Modal สำหรับเพิ่ม */}
      <dialog id="add_modal" className="modal">
        <div className="modal-box  bg-white">
          <center><h2 className="text-lg text-[#7B6ADA] font-bold mb-4">เพิ่มประเภทงาน</h2></center>
          <input
            type="text"
            className="w-full text-[#7B6ADA] border border-gray-300 rounded-md px-3 py-2 mt-2"
            value={addData.jobtype_name}
            onChange={(e) => setAddData({ ...addData, jobtype_name: e.target.value })}
          />
          <div className="modal-action">
            
            <button className="btn bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleInsert}>
              บันทึก
            </button>
            <button className="btn bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("add_modal").close()}>
              ยกเลิก
            </button>
          </div>
        </div>
      </dialog>

      {/* Modal สำหรับลบบบบบบบบบบ */}
      <dialog id="del_modal" className="modal">
        <div className="modal-box  bg-white">
          <center><h2 className="text-lg text-[#7B6ADA] font-bold mb-4">คุณต้องการลบข้อมูลประเภทงานนี้</h2></center>
            <div className="flex">
              <label className="text-[#7B6ADA]">ชื่อประเภทงาน : </label>&nbsp;&nbsp;<h3 className="text-[#7B6ADA] font-bold">{delData.jobtype_name}</h3>
            </div>
          <div className="modal-action">
            
            <button className="btn bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => handleDelete()}>
              ลบเลยยย
            </button>
            <button className="btn bg-green-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("del_modal").close()}>
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
                      <a className="text-xs md:text-lg text-error font-bold mb-4">ต้องการระงับประเภทงานนี้ใช่หรือไม่?</a> 
                  ) : (
                     <a className="text-xs md:text-lg text-success font-bold mb-4">ต้องการอนุมัติประเภทงานนี้ใช่หรือไม่?</a>  
                  )}
              
          </center>   
          
            <div className="flex items-center">
              <label className="text-xs text-[#7B6ADA]">ชื่อประเภทงาน : </label>
              &nbsp;&nbsp;
              <h3 className="text-sm text-[#7B6ADA] font-bold">{editData.jobtype_name}</h3>
            </div>
            <div className="flex items-center">
              <label className="text-xs text-[#7B6ADA]">สถานะ : </label>
              &nbsp;&nbsp;
                {editData.status === "ON" ? (
                    <td className="text-sm text-center font-bold">ปกติ</td>
                ) : (
                    <td className="text-sm text-center text-error font-bold">ถูกระงับ</td>
                )}
            </div>
            
          <div className="modal-action">
            
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
