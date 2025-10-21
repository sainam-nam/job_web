import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { AlertTriangle } from 'lucide-react';

const EduAdd = () => {
      const [userId, setUserId] = useState(null);
      const navigate = useNavigate();
      const [eduList, setEduList] = useState([]);
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const [formData, setFormData] = useState({
            edu_id: "",        // select
            institution: "",
            major: "",
            year_graduat: "",
            grade: "",
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
              axios.get(`${apiUrl}/api/edu`).then((res) => {   
                  if (Array.isArray(res.data.data)) {
                      setEduList(res.data.data);
                      } else {
                      setEduList([]); 
                      }
              });
          }, []);
  
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
            form.append("jobber_id", userId);               // เพิ่ม id ผู้ใช้
            form.append("edu_id", formData.edu_id);
            form.append("institution", formData.institution);
            form.append("major", formData.major);
            form.append("year_graduat", formData.year_graduat);
            form.append("grade", formData.grade);
            if (formData.file) {
                form.append("file", formData.file);
            }

            try {
                const res = await axios.post(`${apiUrl}/api/user_edu_add`, form, {
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
                  <h2 className="font-bold text-xl">เพิ่มข้อมูลการศึกษา</h2>
              </div>
              
                  <form onSubmit={handleSubmit} className='mt-2 '>
                    <div className="flex flex-col gap-2 items-center justify-center ">
                        <div className="flex flex-col gap-1 text-sm w-2/3">
                        {/* ระดับการศึกษา */}
                            <a className="text-[#8E80FF] font-bold mt-2">ระดับการศึกษา</a>
                                <select
                                    name='edu_id'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={formData.edu_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- กรุณาเลือกระดับการศึกษา --</option>
                                    {Array.isArray(eduList) && eduList.map((edu) => (
                                        <option key={edu.edu_id} value={edu.edu_id}>
                                            {edu.edu_name}
                                        </option>
                                        ))}
                                </select>
                                {(() => {
                                    const selectedEdu = eduList.find((edu) => edu.edu_id == formData.edu_id);
                                    const status = selectedEdu?.status;

                                    if (!formData.edu_id) return null;

                                    // ถ้า status = 0 → ไม่ต้องกรอกเพิ่ม
                                    if (status === 0) {
                                        return (
                                        <p className="text-sm text-gray-500 mt-2">
                                            หากไม่มีวุฒิการศึกษา สามารถบันทึกข้อมูลได้ทันทีโดยไม่ต้องกรอกข้อมูลใดๆ
                                        </p>
                                        );
                                    }

                                    return (
                                        <>
                                            <a className="text-[#8E80FF] font-bold mt-2">ชื่อสถาบัน</a>
                                            <input
                                                type="text"
                                                className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box"
                                                name="institution"
                                                placeholder="ชื่อสถาบัน"
                                                value={formData.institution}
                                                onChange={handleChange}
                                                required
                                            />

                                            {status === 2 && (
                                                <>
                                                <a className="text-[#8E80FF] font-bold mt-2">สาขาวิชา/คณะ</a>
                                                <input
                                                    type="text"
                                                    className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box"
                                                    name="major"
                                                    placeholder="ชื่อสาขาวิชา/คณะ"
                                                    value={formData.major}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                </>
                                            )}

                                        
                                        <a className="text-[#8E80FF] font-bold mt-2">ปีที่สำเร็จการศึกษา</a>
                                        <input
                                            type="text"
                                            className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box"
                                            name="year_graduat"
                                            placeholder="ปี พ.ศ."
                                            value={formData.year_graduat}
                                            onChange={handleChange}
                                            required
                                        />

                                        
                                        <div>
                                            <a className="text-[#8E80FF] font-bold mt-2">เกรดเฉลี่ย</a>
                                            <a className="text-xs"> (ถ้ามี)</a>
                                        </div>
                                        <input
                                            type="text"
                                            className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box"
                                            name="grade"
                                            placeholder="เกรดเฉลี่ย เช่น 4.00 หรือ A+ ,A ,B+"
                                            value={formData.grade}
                                            onChange={handleChange}
                                        />

                                        
                                        <a className="text-[#8E80FF] font-bold mt-2">หลักฐานรับรองการศึกษา</a>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="file-input file-input-bordered border border-[#8E80FF] bg-white text-[#8E80FF] file-input-sm rounded-box w-full h-10"
                                        />
                                        <a className="text-xs">
                                            ***อัปโหลดได้เฉพาะไฟล์รูปภาพ PDF หรือ Word เท่านั้น และ ขนาดไฟล์ต้องไม่เกิน
                                            5MB
                                        </a>
                                        </>
                                    );
                                    })()}
                            
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
                
                    <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/profile/edu/view"); window.scrollTo(0, 0);}}>
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

export default EduAdd;
