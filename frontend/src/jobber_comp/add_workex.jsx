import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { AlertTriangle } from 'lucide-react';

const WorkExAdd = () => {
      const [userId, setUserId] = useState(null);
      const navigate = useNavigate();
      const [jobtypeList, setJobTypeList] = useState([]);
      const [positionList, setPositionList] = useState([]);
      const [selectedJobType, setSelectedJobType] = useState("");
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const [formData, setFormData] = useState({
            jobber_id: "",
            position_id: "",        // select
            company: "",
            start: "",
            end: "",
            job_description: "",
            file: null         // สำหรับไฟล์ใบรับรอง
        });
  
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
  
      

      useEffect(() => {
              axios.get(`${apiUrl}/jobtypeall`).then((res) => {
                  //console.log("จังหวัดที่ได้จาก backend:", res.data);    
                  if (Array.isArray(res.data.data)) {
                      setJobTypeList(res.data.data);
                      } else {
                      setJobTypeList([]); // fallback
                      }
              });
          }, []);

      useEffect(() => {
              axios.get(`${apiUrl}/position_add?jobtype_id=${selectedJobType}`).then((res) => {
                  //console.log("จังหวัดที่ได้จาก backend:", res.data);    
                  if (Array.isArray(res.data.data)) {
                      setPositionList(res.data.data);
                      } else {
                      setPositionList([]); // fallback
                      }
              });
          }, [selectedJobType]);
  
        const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        };

        const handleFileChange = (e) => {
            const file = e.target.files[0];

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "application/pdf",
                "application/msword", // .doc
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
            ];

            if (file && !allowedTypes.includes(file.type)) {
                document.getElementById("filewarning_modal").showModal();
                //alert("อัปโหลดได้เฉพาะไฟล์รูปภาพ PDF หรือ Word เท่านั้น");
                e.target.value = ""; // reset input
                return;
            }

            if (file && file.size > 5 * 1024 * 1024) {
                document.getElementById("MBwarning_modal").showModal();
                //alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
                e.target.value = "";
                return;
            }

            setFormData((prev) => ({
                ...prev,
                file: file,
            }));
        };


        const handleSubmit = async (e) => {
            e.preventDefault();

            const form = new FormData();
            form.append("jobber_id", userId);   
            form.append("position_id", formData.position_id);               // เพิ่ม id ผู้ใช้
            form.append("company", formData.company);
            form.append("start", formData.start);
            form.append("end", formData.end);
            form.append("job_description", formData.job_description);
            if (formData.file) {
                form.append("file", formData.file);           // ใบรับรอง
            }

            try {
                const res = await axios.post(`${apiUrl}/api/user_workex_add`, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                });

                if (res.status === 200) {
                document.getElementById("save_modal").showModal();
                //navigate("/profile/edu/view");
                }
            } catch (error) {
                console.error("Upload failed:", error);
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
            };



    return (
      <div>
         <div className='text-[#8E80FF] bg-white rounded-3xl p-6 relative' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
              <div className="flex gap-4 items-center mb-4">
                  <h2 className="font-bold text-xl">เพิ่มข้อมูลประสบการณ์การทำงาน</h2>
              </div>
              
                  <form onSubmit={handleSubmit} className='mt-2 '>
                    <div className="flex flex-col gap-2 items-center justify-center ">
                        <div className="flex flex-col gap-1 text-sm w-2/3">
                        {/* ประเภทงาน */}
                            <a className="text-[#8E80FF] font-bold mt-2">ประเภทงาน</a>
                                <select
                                    name='jobtype'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={selectedJobType}
                                    onChange={(e) => setSelectedJobType(e.target.value)}
                                >
                                    <option value="">-- กรุณาเลือกประเภทงาน --</option>
                                    {Array.isArray(jobtypeList) && jobtypeList.map((jt) => (
                                        <option key={jt.jobtype_id} value={jt.jobtype_id}>
                                            {jt.jobtype_name}
                                        </option>
                                        ))}
                                </select>
                        {/* ตำแหน่งงาน */}
                            <a className="text-[#8E80FF] font-bold mt-2">ตำแหน่งงาน</a>
                                <select
                                    name='position_id'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={formData.position_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- กรุณาเลือกตำแหน่งงาน --</option>
                                    {Array.isArray(positionList) && positionList.map((ps) => (
                                        <option key={ps.position_id} value={ps.position_id}>
                                            {ps.position_name}
                                        </option>
                                        ))}
                                </select>
                            <a className="text-[#8E80FF] font-bold mt-2">ชื่อองค์กร</a>
                                <input 
                                    type="text" 
                                    className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                    name="company"
                                    placeholder='ชื่อองค์กร'
                                    value={formData.company}
                                    onChange={handleChange} 
                                    required />
                            <a className="text-[#8E80FF] font-bold mt-2">ระยะการทำงาน</a>
                
                            <div className="flex gap-2 mt-2">
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">เริ่ม</div>
                                        <input 
                                            type="month" 
                                            className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                            name="start"
                                            value={formData.start || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">สิ้นสุด</div>
                                        <input 
                                            type="month" 
                                            className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                            name="end"
                                            value={formData.end || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                            </div>        
                            <a className="text-[#8E80FF] font-bold mt-2">ลักษณะงาน</a>
                                <input 
                                    type="text" 
                                    className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                    name="job_description"
                                    placeholder='ปฏิบัติงานอย่างไร หน้าที่ความรับผิดชอบในการทำงาน'
                                    value={formData.job_description}
                                    onChange={handleChange} 
                                    />
                            
                            
                            <a className="text-[#8E80FF] font-bold mt-2">หลักฐานรับรองการทำงาน</a>
                              <input
                                  type="file"
                                  accept="image/*,.pdf,.doc,.docx"
                                  onChange={handleFileChange}
                                  className="file-input file-input-bordered border border-[#8E80FF] bg-white text-[#8E80FF] file-input-sm rounded-box w-full h-10"
                              />
                            <a className='text-xs'>***อัปโหลดได้เฉพาะไฟล์รูปภาพ PDF หรือ Word เท่านั้น และ ขนาดไฟล์ต้องไม่เกิน 5MB</a>

                            
                        </div>
                        <div className="flex w-full p-4 justify-center">
                            <hr className="w-1/2 border border-[#D9D9D9]" />
                        </div> 
                        <button className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl mb-2 hover:border-5">บันทึก</button>
                    </div>
                </form>
              
            </div>
              {/* Modal เซฟข้อมูล */}
            <dialog id="save_modal" className="modal">
            <div className="modal-box bg-white">
                <center>
                    <p className="text-4xl  text-[#8E80FF]">เพิ่มข้อมูลสำเร็จ</p>
                    <p className=" text-[#8E80FF]">คุณได้เพิ่มข้อมูลการศึกษาเรียบร้อย </p>
                <div className="w-30 h-30 flex items-center justify-center my-6">
                    <img src="/check.png" className="rounded-full"></img>
                </div>
                </center>   
                <div className="modal-action flex justify-center">
                
                    <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/profile/work_ex/view"); window.scrollTo(0, 0);}}>
                    ตกลง
                    </button>
                
                </div>
            </div>
            </dialog>
            {/* Modal แจ้งว่ารับได้แค่ไฟล์ */}
            <dialog id="filewarning_modal" className="modal">
            <div className="modal-box bg-white">
                <center>
                    <p className="text-4xl  text-[#8E80FF]">อัปโหลดได้เฉพาะไฟล์รูปภาพ PDF หรือ Word เท่านั้น</p>
                    <p className=" text-[#8E80FF]">โปรดเลือกไฟล์ใหม่ </p>
                <div className="w-30 h-30 flex items-center justify-center my-6">
                    <AlertTriangle className="text-yellow-500" /> 
                </div>
                </center>   
                <div className="modal-action flex justify-center">
                
                    <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/profile/edu/view"); window.scrollTo(0, 0);}}>
                    ตกลง
                    </button>
                
                </div>
            </div>
            </dialog>
            {/* Modal แจ้งว่ารับได้แค่ไฟล์ */}
            <dialog id="MBwarning_modal" className="modal">
            <div className="modal-box bg-white">
                <center>
                    <p className="text-4xl  text-[#8E80FF]">อัปโหลดได้เฉพาะไฟล์รูปภาพ PDF หรือ Word เท่านั้น</p>
                    <p className=" text-[#8E80FF]">โปรดเลือกไฟล์ใหม่ </p>
                <div className="w-30 h-30 flex items-center justify-center my-6">
                    <AlertTriangle className="text-yellow-500" /> 
                </div>
                </center>   
                <div className="modal-action flex justify-center">
                
                    <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/profile/edu/view"); window.scrollTo(0, 0);}}>
                    ตกลง
                    </button>
                
                </div>
            </div>
            </dialog>
      </div>
    );
  };

export default WorkExAdd;
