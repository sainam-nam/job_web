import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const InfoForm = () => {
    const [userId, setUserId] = useState(null);
    
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        firstname_eng: "",
        lastname_eng: "",
        gender: "",
        LG: false,
        birthday: "",
        address: "",
        phone: ""
    });
    const navigate = useNavigate();
    const [jangwatList, setJangwatList] = useState([]);
    const [ampherList, setAmpherList] = useState([]);
    const [tambonList, setTambonList] = useState([]);

    const [selectedJangwat, setSelectedJangwat] = useState("");
    const [selectedAmpher, setSelectedAmpher] = useState("");
    const [selectedTambon, setSelectedTambon] = useState("");
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [isAmpherLoaded, setIsAmpherLoaded] = useState(false);
    const [isTambonLoaded, setIsTambonLoaded] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);


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

    const profile = async (userId) => {
        try {
        

        const res = await fetch(`${apiUrl}/user_profile?jobber_id=${userId}`);
        const result = await res.json();

        if(Array.isArray(result.data)){
            //console.log("sql", res)
            setFormData({
                email: result.data[0]?.email || '',
                firstname: result.data[0]?.fullname?.split(" ")[0] || '',
                lastname: result.data[0]?.fullname?.split(" ")[1] || '',
                firstname_eng: result.data[0]?.fullname_eng?.split(" ")[0] || '',
                lastname_eng: result.data[0]?.fullname_eng?.split(" ")[1] || '',
                gender: result.data[0]?.gender || '',
                
                LG: result.data[0]?.LG  || '',
                birthday: formatDateToThaiShort(result.data[0]?.birthday) || '',
                jw_id: result.data[0]?.jw_id || '',
                ap_id: result.data[0]?.ap_id || '',
                tb_id: result.data[0]?.tb_id || '',
                jw: result.data[0]?.jw || '',
                ap: result.data[0]?.ap || '',
                tb: result.data[0]?.tb || '',
                address: result.data[0]?.address || '',
                phone: result.data[0]?.phone || '',
            });

            //console.log(result.data);
            //   console.log(id);
            } else {
            console.error("Data format error:", result);
            setData([]);
            }
    
        } catch (err) {
        console.error('Fetch error:', err);
        }
    };

    useEffect(() =>{
        if (userId) {
            profile(userId);
        }
    }, [userId])

    // โหลดจังหวัดตอนเริ่ม
    useEffect(() => {
        axios.get(`${apiUrl}/api/jangwat`).then((res) => {
            //console.log("จังหวัดที่ได้จาก backend:", res.data);    
            if (Array.isArray(res.data.data)) {
                setJangwatList(res.data.data);
                } else {
                setJangwatList([]); // fallback
                }
        });
    }, []);

    useEffect(() => {
        if (formData.jw_id) {
            axios.get(`${apiUrl}/api/ampher?jangwat_id=${formData.jw_id}`).then((res) => {
            setAmpherList(res.data.data);
            setSelectedJangwat(formData.jw_id);
            setIsAmpherLoaded(true);

        });
    }
    }, [formData.jw_id]);

    useEffect(() => {
        if (isAmpherLoaded && formData.ap_id) {
            axios.get(`${apiUrl}/api/tambon?ampher_id=${formData.ap_id}`).then((res) => {
                setTambonList(res.data.data);
                setSelectedAmpher(formData.ap_id); // 👉 ตั้ง selected อำเภอ
                setIsTambonLoaded(true);
            });
        setIsAmpherLoaded(false); // reset ป้องกัน loop
    }
    }, [isAmpherLoaded, formData.ap_id]);

    useEffect(() => {
    if (isTambonLoaded && formData.tb_id) {
        setSelectedTambon(formData.tb_id);
        setIsTambonLoaded(false); // reset เพื่อป้องกัน loop
    }
    }, [isTambonLoaded, formData.tb_id]);


    // โหลดอำเภอเมื่อเลือกจังหวัด
    useEffect(() => {
        if (selectedJangwat) {
        axios.get(`${apiUrl}/api/ampher?jangwat_id=${selectedJangwat}`).then((res) => {
            setAmpherList(res.data.data);
            setTambonList([]); // ล้างตำบลเมื่อจังหวัดเปลี่ยน
            setSelectedAmpher("");
            setSelectedTambon("");
        });
        }
    }, [selectedJangwat]);

    // โหลดตำบลเมื่อเลือกอำเภอ
    useEffect(() => {
        if (selectedAmpher) {
        axios.get(`${apiUrl}/api/tambon?ampher_id=${selectedAmpher}`).then((res) => {
            setTambonList(res.data.data);
            if (!isInitialLoad) {
                setSelectedTambon(""); // รีเซตเฉพาะกรณีที่ user เปลี่ยนจริง ๆ
            }
        });
        }
    }, [selectedAmpher]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
            try {
                const payload = {
                ...formData,
                jobber_id: userId,
                gender: formData.gender === "อื่นๆ" ? formData.gender_detail : formData.gender,
                LG: formData.LG ? 1 : 0,
                tambon_id: selectedTambon || formData.tb_id,
                };

                //console.log("จะส่งไป backend:", payload);

                // ✅ ตอนนี้ยังไม่มี backend — แต่ถ้ามี จะทำแบบนี้:
                const res = await axios.post(`${apiUrl}/api/save_profile`, payload);
                //console.log("ส่งแล้ว:", res.data);

                //alert("บันทึกข้อมูลสำเร็จ (mock)");
                document.getElementById("save_modal").showModal();

            } catch (err) {
                console.error("ส่งข้อมูลล้มเหลว:", err);
                //alert("เกิดข้อผิดพลาดในการบันทึก");
                document.getElementById("cantsave_modal").showModal();
            }
    };

  function formatDateToThaiShort(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
        const year = date.getFullYear(); // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        if (formData.jw_id) setSelectedJangwat(formData.jw_id);
        if (formData.ap_id) setSelectedAmpher(formData.ap_id);
        if (formData.tb_id) setSelectedTambon(formData.tb_id);
        // ✅ หลังโหลดเสร็จแล้วให้ปิด initial load flag
            const timer = setTimeout(() => {
                setIsInitialLoad(false);
            }, 300); // หน่วงเล็กน้อยให้ทุก setState ทำงานก่อน

            return () => clearTimeout(timer);
    }, [formData]);


    

  return (
    <div>
        <div className='text-[#7B6ADA] bg-white rounded-3xl p-5' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <a className='font-bold text-xl'>ข้อมูลส่วนตัว</a>
                <form onSubmit={handleSubmit} className='mt-2 '>
                    <div className="flex flex-col gap-2 items-center justify-center ">
                        <div className="flex flex-col gap-1 text-sm w-2/3">
                            <a className="text-[#7B6ADA] font-bold">อีเมล : {formData.email}</a>
                            <div className="flex gap-2">
                                <div className="flex flex-col w-full">
                                    <a className="text-[#7B6ADA] font-bold">ชื่อ</a>
                                        <input 
                                            type="text" 
                                            className="input w-full bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                                             name="firstname"
                                            value={formData.firstname || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                                <div className="flex flex-col w-full">
                                    <a className="text-[#7B6ADA] font-bold">นามสกุล</a>
                                        <input 
                                        type="text" 
                                        className="input w-full bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                                        name="lastname"
                                        value={formData.lastname || ""}
                                        onChange={handleChange} 
                                         required/>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <div className="flex flex-col w-full">
                                    <div className="text-[#7B6ADA] font-bold">ชื่อ <a className="text-[10px]">ภาษาอังกฤษ</a></div>
                                        <input 
                                            type="text" 
                                            className="input w-full bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                                            name="firstname_eng"
                                            value={formData.firstname_eng || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="text-[#7B6ADA] font-bold">นามสกุล <a className="text-[10px]">ภาษาอังกฤษ</a></div>
                                        <input 
                                            type="text" 
                                            className="input w-full bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                                            name="lastname_eng"
                                            value={formData.lastname_eng || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                            </div>
                            <div className="flex justify-between  mt-2">
                                <a className="text-[#7B6ADA] font-bold">เพศ</a>
                            </div>
                            <div className='flex justify-between gap-1'>
                                <div className='flex items-center gap-1'>
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="M"
                                        className="radio" 
                                        checked={formData.gender === "M"} 
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
                                    ชาย
                                </div>  
                                <div className='flex items-center gap-1'>
                                    <input 
                                        type="radio" 
                                        name="gender" 
                                        value="F"
                                        className="radio" 
                                        checked={formData.gender === "F"} 
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
                                    หญิง
                                </div> 
                                <div className='flex items-center gap-1'>
                                    <input 
                                    type="radio" 
                                    name="gender" 
                                    value="อื่นๆ"
                                    className="radio" 
                                    checked={formData.gender !== "M" && formData.gender !== "F"} 
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                     />
                                    อื่นๆ
                                    <input
                                        type="text"
                                        name="gender"
                                        placeholder="ระบุหรือไม่ระบุก็ได้"
                                        className="ml-2 border border-[#A3A3A3] rounded-box px-2 py-1 w-40"
                                        value={formData.gender !== "M" && formData.gender !== "F" ? formData.gender : ""}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    />
                                </div> 
                                                    
                            </div>
                            <label className="label pt-1">
                                <input 
                                    type="checkbox" 
                                    name="LG" 
                                    className="checkbox checkbox-sm border-[#7B6ADA] checked:text-[#7B6ADA]" 
                                    checked={formData.LG} 
                                    onChange={(e) => setFormData({ ...formData, LG: e.target.checked })}
                                />
                                <a className='text-xs'>ฉันเป็นส่วนหนึ่งของชุมชน LGBTQIA+ (ไม่บังคับเลือก)</a>
                            </label>
                            <div className="flex justify-between  mt-2">
                                <a className="text-[#7B6ADA] font-bold">วันเกิด</a>
                            </div>
                                                
                            <input 
                                //type={showCPassword ? "text" : "password"} 
                                type='date'
                                className="input w-full bg-white text-[#7B6ADA] border border-[#A3A3A3] rounded-box" 
                                name="birthday"
                                value={formData.birthday || ""}
                                //value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />

                            <div className="flex justify-between pt-2">
                                <a className="text-[#7B6ADA] font-bold">ที่อยู่ปัจจุบัน</a>
                            </div>
                            {/* จังหวัด */}
                                <select
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#7B6ADA] rounded-box"
                                    value={selectedJangwat}
                                    onChange={(e) => setSelectedJangwat(e.target.value)}
                                >
                                    <option value="">-- กรุณาเลือกจังหวัด --</option>
                                    {Array.isArray(jangwatList) && jangwatList.map((jangwat) => (
                                        <option key={jangwat.jangwat_id} value={jangwat.jangwat_id}>
                                            {jangwat.jangwat_name}
                                        </option>
                                        ))}
                                </select>
                            <div className="flex gap-2">
                                <div className="flex flex-col w-full">
                                    {/* อำเภอ */}
                                        <select
                                            className="select w-full bg-white border border-[#A3A3A3] text-[#7B6ADA] rounded-box"
                                            value={selectedAmpher}
                                            onChange={(e) => setSelectedAmpher(e.target.value)}
                                            
                                        >
                                            <option value="">-- กรุณาเลือกอำเภอ --</option>
                                            {Array.isArray(ampherList) && ampherList.map((a) => (
                                            <option key={a.ampher_id} value={a.ampher_id}>
                                                {a.ampher_name}
                                            </option>
                                            ))}
                                        </select>
                                </div>
                                <div className="flex flex-col w-full">
                                    {/* ตำบล */}
                                    <select
                                        className="select w-full bg-white border border-[#A3A3A3] text-[#7B6ADA] rounded-box"
                                        value={selectedTambon}
                                        onChange={(e) => setSelectedTambon(e.target.value)}
                                        //disabled={!selectedAmpher}
                                    >
                                        <option value="">-- กรุณาเลือกตำบล --</option>
                                        {Array.isArray(tambonList) && tambonList.map((t) => (
                                        <option key={t.tambon_id} value={t.tambon_id}>
                                            {t.tambon_name}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <input 
                                //type={showCPassword ? "text" : "password"} 
                                type='text'
                                className="input w-full bg-white text-[#7B6ADA] border border-[#A3A3A3] rounded-box" 
                                name="address"
                                placeholder='ที่อยู่ อาคาร หมู่บ้าน'
                                value={formData.address || ""}
                                onChange={handleChange}
                                required
                            />
                            <a className="text-[#7B6ADA] font-bold mt-2">เบอร์โทรศัพท์</a>
                                <input 
                                    type="text" 
                                    className="input w-full bg-white text-[#7B6ADA] border border-[#A3A3A3] rounded-box" 
                                    name="phone"
                                    value={formData.phone || ""}
                                    onChange={handleChange} 
                                    required />
                        </div>
                        <div className="flex w-full p-4 justify-center">
                            <hr className="w-1/2 border border-[#D9D9D9]" />
                        </div> 
                        <button className="btn bg-[#7B6ADA] border-[#7B6ADA] rounded-xl mb-2 hover:border-5">บันทึก</button>
                    </div>
                </form>
        </div>
        {/* Modal เซฟข้อมูล */}
        <dialog id="save_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
                <p className="text-4xl  text-[#7B6ADA]">บันทึกข้อมูลสำเร็จ</p>
                <p className=" text-[#7B6ADA]">คุณได้บันทึกข้อมูลส่วนตัวเรียบร้อย </p>
              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/check.png" className="rounded-full"></img>
              </div>
            </center>   
            <div className="modal-action flex justify-center">
              
                <button className="btn bg-[#7B6ADA] border border-[#7B6ADA] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/profile/info/view"); window.scrollTo(0, 0);}}>
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

export default InfoForm;
