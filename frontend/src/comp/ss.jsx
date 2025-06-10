import { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";

export default function SS() {
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState({ softskill_id: "", softskill_name: "" });
  const [addData, setAddData] = useState({ softskill_id: "", softskill_name: "" });
  const [delData, setDelData] = useState({ softskill_id: "", softskill_name: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const limit = 10;
  const [totalPages, setTotalPages] = useState();
  const [search, setSearch ] = useState("");

  useEffect(() => {
    fetchData();
  }, [page , search]);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8081/softskill?page=${page}&limit=${limit}&keyword=${search}`);
      const result = await res.json();

      if(Array.isArray(result.data)){
        
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

  const handleDel = (val) => {
    setDelData(val);
    document.getElementById("del_modal").showModal();
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:8081/softskill/${editData.softskill_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ softskill_name: editData.softskill_name }),
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

  const handleInsert = async () => {
    if (!addData.softskill_name.trim()) {
    alert("กรุณากรอกชื่อทักษะ");
    return;
  }
    try {
      const res = await fetch("http://localhost:8081/softskill/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ softskill_name: addData.softskill_name }),
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
      const res = await fetch(`http://localhost:8081/softskill/${delData.softskill_id}`, {
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
      <div className="flex justify-between items-center mt-1 mb-1 md:mt-2 md:mb-2">
        <h1 className="text-[#7B6ADA] text-[10px] font-bold md:text-lg">ทั้งหมด {total} รายการ</h1>
        <button className="btn btn-xs sm:btn-lg md:btn-sm btn-success text-[10px] text-white px-4 py-2 rounded-lg" onClick={() => {setAddData({ softskill_id: "", softskill_name: "" }); document.getElementById("add_modal").showModal();}} >เพิ่มข้อมูล</button>
        <div className="flex items-center gap-2">
          <label className="input w-30 h-7 bg-white rounded-lg border border-[#7B6ADA] ">
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
          {/* <h1 className="text-[#7B6ADA] text-md font-bold">เรียง :</h1> 
          <select defaultValue="Pick" className="select-md bg-white text-[#7B6ADA]">
            <option>เลือกข้อมูลที่ต้องการเรียงลำดับ</option>
            <option>Crimson</option>
            <option>Amber</option>
            <option>Velvet</option>
          </select> */}
        </div>
      </div>

      <div className="overflow-x-auto text-xs md:text-lg text-[#7B6ADA] rounded-3xl border border-[#D9D9D9] bg-white shadow-md">
        <table className="table">
          <thead>
            <tr className="bg-[#D9D9D9] text-[10px] md:text-lg text-[#7B6ADA] font-bold text-center">
              <th className="w-1/8">#</th>
              <th className="w-2/4">ทักษะส่วนบุคคล</th>
              <th className="w-2/4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className="hover:bg-[#D9D9D9] text-[10px] md:text-lg">
                <td className="text-center">{(page-1) * limit + index +1}</td>
                <td className="">{val.softskill_name || "N/A"}</td>
                <td className="text-center">
                  <button className="btn btn-xs text-[10px] md:text-lg btn-warning text-white" onClick={() => handleEdit(val)}>แก้ไข</button>&nbsp;
                  <button className="btn btn-xs text-[10px] md:text-lg btn-error text-white" onClick={() => handleDel(val)} >ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      <center>
        <div className="join items-center gap-2 my-2">
        {page > 1 && (
            <button disabled={page === 1} onClick={() => setPage(page - 1)}><img src="/up.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
        )}
        {total > 0 ? (
          <button className="btn btn-xs btn-primary rounded-3xl join-item btn">{page}</button>
        ) : (
          <button className="btn btn-xs btn-primary rounded-3xl join-item btn">ไม่มีข้อมูล</button>
        )
        }  
          
        {page < totalPages && (
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}><img src="/down.png" className="w-4 h-4 md:w-6 md:h-6 hover:shadow-lg hover:shadow-[#7B6ADA] transition-shadow" /></button>
        )}
        </div>
      </center>
      {/* Modal สำหรับแก้ไข */}
      <dialog id="my_modal" className="modal">
        <div className="modal-box bg-white">
          <center><h2 className="text-xs md:text-lg text-[#7B6ADA] font-bold mb-4">แก้ไขทักษะและความสามารถพิเศษ</h2></center>
          <input
            type="text"
            className="w-full text-sm md:text-md text-[#7B6ADA] border border-gray-300 rounded-md px-3 py-2 mt-2"
            value={editData.softskill_name}
            onChange={(e) => setEditData({ ...editData, softskill_name: e.target.value })}
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
        <div className="modal-box  bg-white">
          <center><h2 className="text-xs md:text-lg text-[#7B6ADA] font-bold mb-2 md:mb-4">เพิ่มทักษะและความสามารถพิเศษ</h2></center>
          <input
            type="text"
            className="w-full text-sm md:text-md text-[#7B6ADA] border border-gray-300 rounded-md px-3 py-2 mt-2"
            value={addData.softskill_name}
            onChange={(e) => setAddData({ ...addData, softskill_name: e.target.value })}
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
          <center><h2 className="text-xs md:text-lg text-[#7B6ADA] font-bold mb-4">คุณต้องการลบข้อมูลทักษะและความสามารถพิเศษนี้</h2></center>
            <div className="flex flex-col">
              <label className="text-xs md:text-md text-[#7B6ADA]">ชื่อข้อมูลทักษะและความสามารถพิเศษ : </label>
              <h3 className="text-xs text-[#7B6ADA] font-bold">{delData.softskill_name}</h3>
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
    </main>
  );
}
