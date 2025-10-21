import React, { useState , useEffect, useRef} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import TiptapEditor from '../comp/tiptap';

const Emp_EditVolun = () => {
    const [userId, setUserId] = useState(null);
    
    const [formData, setFormData] = useState({
        about_volun: "",
        vission: "",
        mission: "",
    });
    const navigate = useNavigate();
    
    const apiUrl = import.meta.env.VITE_API_BASE_URL;


    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ถ้าไม่มี token อาจ redirect ไป login

      window.location.href = "/login";
      return;
    }

    axios.get(`${apiUrl}/emp_profile`, { //error
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
    //   setUserData(res.data.user);
      setUserId(res.data.user.emp_id);
    
    //   setEmpPercent(res.data.user.percent_match);
      //console.log(res.data.user);
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      // alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
  }, []);

    const profile = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/emp_profile`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.user) {
        const u = result.user;
        setFormData({
            about_volun: u.about_volun || '',
            vission: u.vission || '',
            mission: u.mission || '',
        });
        } else {
        console.error("Data format error:", result);
        setFormData({});
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
    };

    useEffect(() => {
    if (userId) {
        profile();
    }
    }, [userId]);


    const handleEditorChange = (field, content) => {
        setFormData((prev) => ({
        ...prev,
        [field]: content,
        }));
    };

    const saveModalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
            try {
                const payload = {
                ...formData,
                emp_id: userId,
                about_volun: formData.about_volun,
                vission: formData.vission,
                mission: formData.mission,
                };

                //console.log("จะส่งไป backend:", payload);

                // ✅ ตอนนี้ยังไม่มี backend — แต่ถ้ามี จะทำแบบนี้:
                const res = await axios.post(`${apiUrl}/api/emp_save_aboutvolun`, payload);
                //console.log("ส่งแล้ว:", res.data);

                console.log("ส่งแล้ว:", res.data);

                // ✅ บังคับเปิด modal
                if (saveModalRef.current) {
                // console.log("เปิด modal save");  // debug
                saveModalRef.current.showModal();
                }
                

            } catch (err) {
                console.error("ส่งข้อมูลล้มเหลว:", err);
                //alert("เกิดข้อผิดพลาดในการบันทึก");
                document.getElementById("cantsave_modal").showModal();
            }
    };


    

  return (
    <div>
        <div className='text-[#8E80FF] bg-white rounded-3xl p-5' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <a className='font-bold text-xl'>ข้อมูลการหาจิตอาสา</a>
                <form onSubmit={handleSubmit} className='mt-2 '>
                    <div className="flex flex-col gap-2 items-center justify-center ">
                        <div className="flex flex-col gap-1 text-sm w-2/3">
                             <div className="flex justify-between  mt-2">
                                                            <a className="text-[#8E80FF] font-bold">เกี่ยวกับจิตอาสา</a>
                                                        </div>
                                                                            
                                                        <TiptapEditor
                                                            value={formData.about_volun}
                                                            onEditorChange={(content) => handleEditorChange("about_volun", content)}
                                                            />
                            
                                                        <div className="flex justify-between pt-2">
                                                            <a className="text-[#8E80FF] font-bold">วิสัยทัศน์</a>
                                                        </div>
                                                          <TiptapEditor
                                                            value={formData.vission}
                                                            onEditorChange={(content) => handleEditorChange("vission", content)}
                                                            />
                                                        <div className="flex justify-between pt-2">
                                                            <a className="text-[#8E80FF] font-bold">พันธกิจ</a>
                                                        </div>
                                                          <TiptapEditor
                                                            value={formData.mission}
                                                            onEditorChange={(content) => handleEditorChange("mission", content)}
                                                            />
                                                        </div>
                        <div className="flex w-full p-4 justify-center">
                            <hr className="w-1/2 border border-[#D9D9D9]" />
                        </div> 
                        <button className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl mb-2 hover:border-5">บันทึก</button>
                    </div>
                </form>
        </div>
        {/* Modal เซฟข้อมูล */}
        <dialog ref={saveModalRef} id="save_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
                <p className="text-4xl  text-[#8E80FF]">บันทึกข้อมูลสำเร็จ</p>
                <p className=" text-[#8E80FF]">คุณได้บันทึกข้อมูลการหาจิตอาสาเรียบร้อย </p>
              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/check.png" className="rounded-full"></img>
              </div>
            </center>   
            <div className="modal-action flex justify-center">
              
                <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" 
                    onClick={() => {
                        if (saveModalRef.current) saveModalRef.current.close();
                        navigate("/emp_profile/volun/view");
                        window.scrollTo(0, 0);
                    }}>
                  ตกลง
                </button>
              
            </div>
          </div>
        </dialog>
        {/* Modal เซฟไม่ผ่าน */}
        <dialog id="cantsave_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
                <p className="text-3xl text-error font-bold">บันทึกข้อมูลไม่สำเร็จ</p>
                <p className="text-error">โปรดตรวจสอบข้อมูลอีกครั้ง</p>
              
              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/x.png" className="rounded-full"></img>
              </div>
            </center> 
            <div className="modal-action flex justify-center">
             
              <button className="btn bg-[#FF0004] border border-error text-white px-4 py-2 rounded-lg" onClick={() => {document.getElementById("cantsave_modal").close();}}>
                ตกลง
              </button>
            </div>
          </div>
        </dialog>
    </div>
  );
};

export default Emp_EditVolun;
