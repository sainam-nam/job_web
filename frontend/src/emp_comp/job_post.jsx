import { useLocation } from "react-router-dom";
import React, { useState , useEffect } from "react"
import LoadingOverlay from "../comp/LoadingOverlay";
import Navbar from "../emp_comp/navbar";
import Footer from "../emp_comp/footer";
// import EmpRating from "./emp_star";
import { FaCircle , FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi";
import axios from "axios";
import { MapView } from "../comp/map_view";
import TooltipField from "../comp/tooltip";
import { AlertTriangle } from "lucide-react";
import JobberProfile from "./jobber_profile";
import TiptapEditor from "../comp/tiptap";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Emp_Job_Post() {
  // Centered loading spinner overlay
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState([]);
  const [empPercent, setEmpPercent] = useState(0);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(false);

  const [closed, setClosed] = useState(false);

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
      setUserData(res.data.user);
      setUserId(res.data.user.emp_id);
      // setEmpPercent(res.data.user.percent_match);
      setPercent(res.data.user.percent_match);
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      // alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
  }, []);
  
  const navigate = useNavigate();
  const location = useLocation();
  const fromStack = location.state?.fromStack || [];
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("pi");

  const [showWork , setShowWork] =useState(0);  
  const [data, setData] = useState([]);
  const [jobHs, setJobHS] = useState([]);
  const [jobSs, setJobSS] = useState([]);
  const [limit, setLimit] = useState(3);
  const [MJdata, setMJData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState();
  const [totalPages, setTotalPages] = useState();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [jangwatList, setJangwatList] = useState([]);
  const [ampherList, setAmpherList] = useState([]);
  const [tambonList, setTambonList] = useState([]);
  const [jobtypeList, setJobTypeList] = useState([]);
  const [positionList, setPositionList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [confirm , setConfirm] = useState("");
  const [applyType , setApplyType] = useState("");

  const [currentStep, setCurrentStep] = useState(1);
    const defaultFormData = {
      num_position: "1",
      minsalary: "",
      maxsalary: "",
      address: 0,
      location: "",
      tambon_id: "",
      ampher_id: "",
      jangwat_id: "",
      latitude: "",
      longitude: "",
      details: "",
      min_age: "",
      max_age: "",
      gender: "A",
      year_expe: 0,
      experience: "",
      notes: "",
      ownbenefit: 0,
      benefits: "",
      hour: "",
      end_hour: "",
      days: "",
      owncontact: 0,
      emp_id: "",
      jobtype_id: "",
      position_code: "",
      education_code: "",
      job_pic: null,
      type: "f",
      selectedHs: [""],
      selectedSs: [""],
      phone: "",
      email: "",
    };
    const [formData, setFormData] = useState(defaultFormData);


const [weekdays, setWeekdays] = useState({
                    Mon: false,
                    Tue: false,
                    Wed: false,
                    Thu: false,
                    Fri: false,
                    Sat: false,
                    Sun: false
                });
  
        const selectAllDays = () => {
              setWeekdays({
                  Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true
              });
          };
  
          const selectWeekdaysOnly = () => {
              setWeekdays({
                  Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
              });
          };
  
          const selectWeekendOnly = () => {
              setWeekdays({
                  Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: true, Sun: true
              });
          };

      const encodeBitString = (obj, order) => {
        return order.map(key => (obj[key] ? "1" : "0")).join("");
      };

      const weekdaysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat",  "Sun"];
      const daywork = encodeBitString(weekdays, weekdaysOrder);

    const [hs, setHs] = useState([]);
      //const [selectedHs, setSelectedHs] = useState([""]);
      const [ss, setSs] = useState([]);
      //const [selectedSs, setSelectedSs] = useState([""]);
      

      useEffect(() => {
        axios.get(`${apiUrl}/hs`).then((res) => {
          setHs(res.data.data || []);
          //console.log("Hsdata",res.data.data);
        });
      }, []);

      useEffect(() => {
        axios.get(`${apiUrl}/ss`).then((res) => {
          setSs(res.data.data || []);
          //console.log("Ssdata",res.data.data);
        });
      }, []);

      const addHs = () => {
        setFormData((prev) => ({
          ...prev,
          selectedHs: ["", ...prev.selectedHs],
        }));
      };

      
      const removeHs = (index) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedHs];
          newSelected.splice(index, 1);
          return { ...prev, selectedHs: newSelected };
        });
      };

      const addSs = () => {
        setFormData((prev) => ({
          ...prev,
          selectedSs: ["", ...prev.selectedSs],
        }));
      };

      
      const removeSs = (index) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedSs];
          newSelected.splice(index, 1);
          return { ...prev, selectedSs: newSelected };
        });
      };

      const getHsAvailableOptions = (index) => {
        return (hs || []).filter(
          (skill) =>
            !(formData.selectedHs || []).includes(skill.hardskill_id) ||
            (formData.selectedHs && formData.selectedHs[index] === skill.hardskill_id)
        );
      };

      //console.log("selectHS",selectedHs);

      const getSsAvailableOptions = (index) => {
        return (ss || []).filter(
          (skill) =>
            !(formData.selectedSs || []).includes(skill.softskill_id) ||
            (formData.selectedSs && formData.selectedSs[index] === skill.softskill_id)
        );
      };

      const handleHsChange = (index, value) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedHs];
          newSelected[index] = parseInt(value);
          return { ...prev, selectedHs: newSelected };
        });
      };

      const handleSsChange = (index, value) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedSs];
          newSelected[index] = parseInt(value);
          return { ...prev, selectedSs: newSelected };
        });
      };

  const handleEditorChange = (field, content) => {
    setFormData((prev) => ({
      ...prev,
      [field]: content,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoGo = async (e) => {
    if (e) e.preventDefault();

    const requiredFields = [
              "num_position",
              "location",
              "education_code",
              "type",
              "phone",
              "email",
              "tambon_id",
            ];
            
            const missingFields = requiredFields.filter(
              (field) => !formData[field] || formData[field].toString().trim() === ""
            );

            if (missingFields.length > 0 || daywork === "0000000") {
              console.warn("ข้อมูลไม่ครบ:", missingFields);
              document.getElementById("incomplete_modal")?.showModal();
            } else {
              await document.getElementById("save_modal").showModal();
            }
  }

  const handleUpdate = async () => {
    setLoading(true);
    const form = new FormData();

    let salaryValue = "0";
    if (formData.minsalary && formData.maxsalary) {
      salaryValue = `${formData.minsalary}-${formData.maxsalary}`;
    } else if (formData.minsalary) {
      salaryValue = formData.minsalary;
    } else if (formData.maxsalary) {
      salaryValue = formData.maxsalary;
    }

    const payload = {
      num_position: formData.num_position,
      salary: salaryValue,
      location: formData.location,
      tambon_id: formData.tambon_id ?? "",
      latitude: formData.latitude ?? "",
      longitude: formData.longitude ?? "",
      details: formData.details ?? "",
      min_age: formData.min_age ?? "",
      max_age: formData.max_age ?? "",
      gender: formData.gender ?? "",
      year_expe: formData.year_expe ?? 0,
      experience: formData.experience ?? "",
      notes: formData.notes ?? "",
      benefits: formData.benefits ?? "",
      hour: formData.hour ?? "",
      end_hour: formData.end_hour ?? "",
      days: daywork,
      position_code: formData.position_code ?? "",
      education_code: formData.education_code ?? "",
      type: formData.type ?? "",
      phone: formData.phone ?? "",
      email: formData.email ?? "",
      selectedHs: formData.selectedHs, // Array
      selectedSs: formData.selectedSs, // Array
    };
    try {
      const res = await axios.put(`${apiUrl}/api/job_posting_update/${id}`, payload);

      if (res.status === 200) {
        document.getElementById("save_modal")?.close();
        document.getElementById("success_modal")?.showModal();
        fetchData(); // โหลดข้อมูลใหม่หลังแก้ไข
      } else {
        console.error("Unexpected status:", res.status, res.data);
      }
    } catch (error) {
      console.error("Update failed:", error?.response || error);
    } finally {
      setLoading(false);
    }
  };
  const [selectedJobberId, setSelectedJobberId] = useState(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");


  useEffect(() => {
          fetchData();
          jobMatchFetchData(id);
          checkIfClose();
        }, [id , closed , selectedJobberId , message , status , empPercent]);

  async function checkIfClose() {
    try {
      const res = await fetch(`${apiUrl}/api/check-close?post_id=${id}`);
      const data = await res.json();
      setClosed(data.isClosed); // true = สมัครแล้ว
    } catch (error) {
      console.error("Error checking apply status:", error);
    }
  }
     
  async function handleCloseToggle(post_id) {
    try {
      if (closed) {
        // ลบออก
        await fetch(`${apiUrl}/api/update-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id , status: "ON" })
        });
        setClosed(false);
        document.getElementById("ON_modal").close();
      } else {
        await fetch(`${apiUrl}/api/update-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id , status: "finish" })
        });
        setClosed(true);
        document.getElementById("close_modal").close();
      }
    } catch (error) {
      console.error(error);
    }
  }
  function mapJobToFormData(job, job_HS = [], job_SS = []) {
    // แยก min_age, max_age จาก field "age"
    // console.log("ข้อมูลในแมท",job);
    let min_age = "";
    let max_age = "";
    if (job.age && job.age.includes("-")) {
      const [min, max] = job.age.split("-");
      min_age = min || "";
      max_age = max || "";
    }

    // แยก salary (กรณีมีช่วง)
    let minsalary = "";
    let maxsalary = "";
    if (job.salary && job.salary.includes("-")) {
      const [min, max] = job.salary.split("-");
      minsalary = min || "";
      maxsalary = max || "";
    } else {
      minsalary = job.salary || "";
    }

    let phone = "";
    let email = "";
    if (job.contact) {
      const parts = job.contact.split(" / ");
      phone = parts[0]?.trim() || "";
      email = parts[1]?.trim() || "";
    }


    return {
      num_position: job.num_position ?? "1",
      minsalary,
      maxsalary,
      address: 0, // backend ไม่มีส่ง address
      location: job.location ?? "",
      tambon_id: job.tambon_id ?? "",
      ampher_id: job.tambon_id ? job.tambon_id.toString().substring(0, 4) : "",
      jangwat_id: job.tambon_id ? job.tambon_id.toString().substring(0, 2) : "",
      latitude: job.latitude ?? "",
      longitude: job.longitude ?? "",
      details: job.details ?? "",
      min_age,
      max_age,
      gender: job.gender ?? "A",
      year_expe: job.year_expe ?? 0,
      experience: job.experience ?? "",
      notes: job.notes ?? "",
      ownbenefit: 0,
      benefits: job.benefits ?? "",
      hour: job.hour ?? "",
      end_hour: job.end_hour ?? "",
      owncontact: 0,
      emp_id: job.emp_id ?? "",
      jobtype_id: job.jobtype_id ?? "", // backend ยังไม่มีส่งมา
      position_code: job.position_code ?? "",
      education_code: job.education_code ?? "",
      type: job.type ?? "f",
      selectedHs: job_HS.map((h) => h.hardskill_id?.toString() || ""),
      selectedSs: job_SS.map((s) => s.softskill_id?.toString() || ""),
      phone,
      email,
    };
  }

function decodeBitString(bitString, order) {
  const obj = {};
  order.forEach((day, idx) => {
    obj[day] = bitString[idx] === "1"; // ถ้าเป็น "1" = true, "0" = false
  });
  return obj;
}

  const [remain , setRemain] = useState(0);
  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/jobpost?post_id=${id}`);
      const result = await res.json();
      // console.log("jobpost จะเอาไปแมท ", result);
    
      if(Array.isArray(result.jobpost)){
          //console.log("sql", res)
          setData(result.jobpost);
          const job = result.jobpost[0]; // ✅ เอา record แรกมาใส่ในฟอร์ม
          setRemain(job.num_position - job.accepted_count);
          // console.log("formDataก่อนแมท",job);

          if (job.days) {
            setWeekdays(decodeBitString(job.days, weekdaysOrder));
          }

          const mapped = mapJobToFormData(job, result.job_HS, result.job_SS);
          setFormData(mapped);
          // console.log("formDataหลังแมท",mapped);
        } else {
          console.error("Data format error:", result);
          setData([]);
        }
      if(Array.isArray(result.job_HS)){
          //console.log("sql", res)
          setJobHS(result.job_HS);
        } else {
          console.error("Data format error:", result);
          setJobHS([]);
        }
      if(Array.isArray(result.job_SS)){
          //console.log("sql", res)
          setJobSS(result.job_SS);
        } else {
          console.error("Data format error:", result);
          setJobSS([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };
  function formatDateToThaiShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
    const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

    return `${day}/${month}/${year}`;
  }

  const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

  function renderWorkSchedule(code) {
    if (!code || code.length !== 7) return "ข้อมูลไม่ถูกต้อง";

    const chars = code.split("");
    const workDays = [];
    const offDays = [];

    chars.forEach((char, index) => {
      if (char === "1") {
        workDays.push(daysOfWeek[index]);
      } else {
        offDays.push(daysOfWeek[index]);
      }
    });

    const showOffDays = offDays.length <= 3;
    const daysToShow = showOffDays ? offDays : workDays;
    const label = showOffDays ? "วันหยุด" : "วันทำงาน";

    return (
      <div>
        {label}: {daysToShow.length > 0 ? daysToShow.join(", ") : "ไม่มี"}
      </div>
    );
  }

  const goToProfile = (post_id , jobber_id , matchPer , status , message , inter_work_id) => {
    navigate(`/jobber_match_de?pi=${post_id}&ji=${jobber_id}&matchper=${matchPer}&status=${status}&message=${message}&inter_id=${inter_work_id}`);
    window.scrollTo(0,0);
  };

  const jobMatchFetchData = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiUrl}/emp_job_match?post_id=${id}&page=${page}&limit=${limit}&percent=${empPercent}`);
      const result = await res.json();

      if (typeof result === 'object' && 
        'totalRecords' in result && 
        'totalPages' in result  ) {
        setTotal(result.totalRecords);
        setTotalPages(result.totalPages || 1);
      } else {
        console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
      }

      if(Array.isArray(result.postMatch)){
          //console.log("sql", res)
          setMJData(result.postMatch);
            
        } else {
          console.error("Data format error:", result);
          setMJData([]);
        }
  
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleFileChange = (e) => {
        const file = e.target.files[0]; // รับไฟล์ที่เลือก
        if (file) {
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file)); // แสดงภาพที่เลือก
        }
    };

    const handleUpload = async () => {

        if (!selectedImage) {
            document.getElementById("up_pic_modal").close();
            return;
        }


        const formData = new FormData();
        formData.append("job_pic", selectedImage);
        formData.append("post_id", id); // ถ้าต้องการส่ง user ID ไปด้วย

        try {
        const res = await axios.post(`${apiUrl}/api/jobpost_up_picture`, formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        });

        //console.log("อัปโหลดสำเร็จ:", res.data);
        await fetchData(); // ให้ refresh ข้อมูลใหม่
        document.getElementById("up_pic_modal").close(); // ปิด modal
        } catch (err) {
        console.error("อัปโหลดล้มเหลว:", err);
        // alert("เกิดข้อผิดพลาดในการอัปโหลด");
        }
    };

    useEffect(() => {
            axios.get(`${apiUrl}/api/jangwat`).then((res) => {   
                if (Array.isArray(res.data.data)) {
                    setJangwatList(res.data.data);
                    } else {
                    setJangwatList([]);
                    }
            });
        }, []);
    
        useEffect(() => {
            if (formData.jangwat_id) {
                axios.get(`${apiUrl}/api/ampher?jangwat_id=${formData.jangwat_id}`).then((res) => {
                if (Array.isArray(res.data.data)) {
                    setAmpherList(res.data.data);
                    setIsAmpherLoaded(true);
                    } else {
                    setAmpherList([]);
                    }
    
            });
        }
        }, [formData.jangwat_id]);
      const [isAmpherLoaded, setIsAmpherLoaded] = useState(false);
      const [isTambonLoaded, setIsTambonLoaded] = useState(false);
        useEffect(() => {
            if (formData.ampher_id) {
                axios.get(`${apiUrl}/api/tambon?ampher_id=${formData.ampher_id}`).then((res) => {
                    if (Array.isArray(res.data.data)) {
                    setTambonList(res.data.data);
                    setIsTambonLoaded(true);
                    } else {
                    setTambonList([]);
                    }
                });
            setIsAmpherLoaded(false);
        }
        }, [formData.ampher_id]);
    
        useEffect(() => {
                  axios.get(`${apiUrl}/jobtypeall`).then((res) => {
                      
                      if (Array.isArray(res.data.data)) {
                          setJobTypeList(res.data.data);
                          } else {
                          setJobTypeList([]); // fallback
                          }
                  });
              }, []);
    
          useEffect(() => {
                  axios.get(`${apiUrl}/position_add?jobtype_id=${formData.jobtype_id}`).then((res) => {
                      //console.log("จังหวัดที่ได้จาก backend:", res.data);    
                      if (Array.isArray(res.data.data)) {
                          setPositionList(res.data.data);
                          } else {
                          setPositionList([]); // fallback
                          }
                  });
              }, [formData.jobtype_id]);
    
          useEffect(() => {
                  axios.get(`${apiUrl}/api/edu`).then((res) => {   
                      if (Array.isArray(res.data.data)) {
                          setEducationList(res.data.data);
                          } else {
                          setEducationList([]); // fallback
                          }
                  });
              }, []);
    
          useEffect(() => {
                if (formData.address === 1 && userId ) {
                  axios.get(`${apiUrl}/emp_address?emp_id=${userId}`).then((res) => {
                     
                      if (res.data && res.data.data && res.data.data.length > 0) {
                        const empAddr = res.data.data[0];
                        const tambonId = empAddr.tambon_id?.toString() || "";
    
                        // ✅ เซตค่าเข้า formData
                        setFormData((prev) => ({
                          ...prev,
                          location: empAddr.address || "",
    
                          latitude: empAddr.latitude || "",
                          longitude: empAddr.longitude || "",
                          tambon_id: tambonId || "",
                          ampher_id: tambonId.substring(0, 4) || "",
                          jangwat_id: tambonId.substring(0, 2) || "",
                        }));
                        
                      } 
                    
                  });
                } else if (formData.address === 0) {
                  setFormData((prev) => ({
                    ...prev,
                    location: "",
                    latitude: "",
                    longitude: "",
                    tambon_id: "",
                    ampher_id: "",
                    jangwat_id: "",
                  }));
    
                }
              }, [formData.address , userId]);
    
              useEffect(() => {
                if (formData.ownbenefit === 1 && userId ) {
                  axios.get(`${apiUrl}/emp_benefit?emp_id=${userId}`).then((res) => {
                     
                      if (res.data && res.data.data && res.data.data.length > 0) {
                        const empAddr = res.data.data[0];
                        
                        setFormData((prev) => ({
                          ...prev,
                          benefits: empAddr.benefits || "",
                        }));
                      } 
                    // console.log('benefit----',formData.benefits);
                  });
                } else if (formData.ownbenefit === 0) {
                  setFormData((prev) => ({
                    ...prev,
                    benefits: "",
                  }));
                }
              }, [formData.ownbenefit , userId]);
    
              useEffect(() => {
                if (formData.owncontact === 1 && userId ) {
                  axios.get(`${apiUrl}/emp_contact?emp_id=${userId}`).then((res) => {
                     
                      if (res.data && res.data.data && res.data.data.length > 0) {
                        const empAddr = res.data.data[0];
                        
                        setFormData((prev) => ({
                          ...prev,
                          phone: empAddr.phone || "",
                          email: empAddr.email || "",
                        }));
                      } 
                    // console.log('benefit----',formData.benefits);
                  });
                } else if (formData.owncontact === 0) {
                  setFormData((prev) => ({
                    ...prev,
                    phone: "",
                    email: "",
                  }));
                }
              }, [formData.owncontact , userId])

  const [activeTab, setActiveTab] = useState("match");

  const [ajLimit, setAjLimit] = useState(3);
  const [applyJob, setApplyJob] = useState([]);
  const [ajTotal, setAjTotal] = useState([]);
  const [ajTotalPages, setAjTotalPages] = useState(1);
  const [ajPage, setAjPage] = useState(1);

  const [favLimit, setFavLimit] = useState(3);
  const [favorite, setFavorite] = useState([]);
  const [favTotal, setFavTotal] = useState([]);
  const [favTotalPages, setFavTotalPages] = useState(1);
  const [favPage, setFavPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/job_history?post_id=${id}&page=${ajPage}&limit=${ajLimit}`);
        const result = await res.json();
        //console.log("ข้อมูลลลลลลลลลลลลลลล",result); 
        
        
        if(Array.isArray(result.apply_job)){
          //console.log("sql", res)
          setApplyJob(result.apply_job);
          //console.log(result.data);
        } else {
          console.error("Data format error:", result);
          setApplyJob([]);
        }
        setAjTotal(result.ajtotalCount);
        setAjTotalPages(result.ajtotalPages || 1);

        if(Array.isArray(result.favorite)){
          //console.log("sql", res)
          setFavorite(result.favorite);
          //console.log(result.data);
        } else {
          console.error("Data format error:", result);
          setFavorite([]);
        }
        setFavTotal(result.ftotalCount);
        setFavTotalPages(result.ftotalPages || 1);

      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [ id , ajPage , ajLimit , message , status , selectedJobberId]);

  function calculateAge(birthday) {
    if (!birthday) return '-';
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

    
  
  
    return (
      <div>
        {userData && <Navbar user={userData} />}
          <div className="relative w-full group">
            <img src="/emp_match.png" className="w-full" />
              <button
                onClick={() => navigate(-1)}
                className="btn btn-xs md:btn-sm lg:btn-lg xl:btn-xl border-white p-2 md:p-3 lg:p-4 xl:p-5  bg-white text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl absolute top-8/11 left-3/5 xl:top-2 xl:left-8"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="6">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
          </div>

          <div id="section1" className="flex flex-col justify-center bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:pt-14">
            <div className="flex flex-col items-center w-full">
              <div  className="flex justify-center">
                <p className="text-[#7B6ADA] text-xs md:text-xl lg:text-4xl font-bold">{data[0]?.position_name}</p>
                    <button 
                      onClick={() => {
                        setShowWork(prev => {
                          const next = prev === 1 ? 0 : 1;
                          // ถ้าค่าต่อไปคือ 1 (แสดงรายละเอียด) ค่อยเลื่อน
                          if (next === 1) {
                            // ใช้ setTimeout เพื่อให้ React render เสร็จก่อนแล้วค่อยเลื่อน
                            setTimeout(() => {
                              document.getElementById("section1")?.scrollIntoView({ behavior: "smooth" });
                            }, 0);
                          }
                          return next;
                        });
                      }}
                      className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#8E80FF] border-[#8E80FF] rounded-xl ml-2"
                    >
                      {showWork === 1 ? 'ซ่อนรายละเอียดงาน' : 'รายละเอียดงาน'}
                    </button>
              </div>
              <p className="text-[#7B6ADA] text-[8px] font-bold md:text-sm lg:text-xl text-right pt-1">
                วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}
              </p>
              <div className="flex gap-2 mb-5">
                <p className="text-white bg-[#7B6ADA] text-[8px] font-bold md:text-sm lg:text-xl text-right rounded-xl p-2">
                  รับทั้งหมด : {data[0]?.num_position} 
                </p>
                <p className="text-white bg-sky-500 text-[8px] font-bold md:text-sm lg:text-xl text-right rounded-xl p-2">
                  รอผู้สมัครยืนยัน : {data[0]?.waitjobber_count}
                </p>
                <p className="text-white bg-green-500 text-[8px] font-bold md:text-sm lg:text-xl text-right rounded-xl p-2">
                  รับไปแล้ว : {data[0]?.accepted_count} 
                </p>
                <p className="text-white bg-gray-500 text-[8px] font-bold md:text-sm lg:text-xl text-right rounded-xl p-2">
                  เหลือ : {remain} 
                  {/* เอารับทั้งหมด - รับไปแล้ว หรือจะเอา- กับ รอผู้สมัครยืนยัน */}
                </p>
                
                <p className="text-white bg-red-500 text-[8px] font-bold md:text-sm lg:text-xl text-right rounded-xl p-2">
                  ปฏิเสธไปแล้ว : {data[0]?.not_success_count}
                </p>
              </div>
            </div>

          {showWork === 1 && (
            <div  className="bg-white px-5 py-3 md:px-15 md:py-6 lg:px-25 lg:py-12 xl:px-35 xl:pb-14">
              <div className="flex flex-col justify-center w-full mb-2 p-4 md:mb-4 md:p-8 lg:mb-8 bg-gray-200 text-[#7B6ADA] rounded-3xl lg:rounded-4xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                {/* <div className="flex justify-between items-center">
                  <p className="text-xs md:text-xl lg:text-2xl font-bold">{data[0]?.position_name}</p>
                  <p className="text-[8px] font-bold md:text-sm lg:text-xl text-right pt-1">วันที่ลงประกาศ {data[0]?.post_day ? formatDateToThaiShort(data[0].post_day) : 'ไม่มีวันที่'}</p>
                </div> */}
                <div className="flex items-center justify-center gap-5">
                  <div 
                    className="relative group flex items-center justify-center w-73 h-43 rounded-2xl cursor-pointer overflow-hidden"
                    onClick={() => document.getElementById("up_pic_modal").showModal()}
                  >
                    {data[0]?.job_pic ? (
                      <img
                        src={`/uploads/emp_pic/${data[0]?.job_pic}`}
                        className="w-70 h-30 lg:h-40 object-cover rounded-2xl"
                      />
                    ) : (
                      <img
                        src={`/uploads/nopic.png`}
                        className="w-70 h-30 lg:h-40 object-cover rounded-2xl"
                      />
                    )}

                    {/* overlay */}
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-80 transition-opacity">
                      <span className="text-[#7B6ADA] font-semibold">คลิกเพื่อแก้ไขรูปภาพ</span>
                    </div>
                  </div>

                  <table>
                    <tbody>
                      <tr className="lg:h-10 xl:h-12">
                        <td className="w-5 md:w-10 lg:w-10 xl:w-15"><FaCircle color="#7B6ADA" size={12} /></td>
                        <td className="w-20 md:w-40 lg:w-50 xl:w-60"><a className="text-[10px] md:text-sm lg:text-xl text-[#7B6ADA]">เงินเดือน</a></td>
                        <td className="w-40 md:w-80 lg:w-90 xl:w-100"><a className="text-[10px] md:text-sm lg:text-xl text-[#7B6ADA]">{data[0]?.salary} บาท/เดือน</a></td>
                      </tr>
                      <tr className="lg:h-10 xl:h-12">
                        <td><FaCircle color="#7B6ADA" size={12} /></td>
                        <td><a className="text-[10px] md:text-sm lg:text-xl text-[#7B6ADA]">จำนวน</a></td>
                        <td><a className="text-[10px] md:text-sm lg:text-xl text-[#7B6ADA]">{data[0]?.num_position} อัตรา</a></td>
                      </tr>
                      <tr className="lg:h-10 xl:h-12">
                        <td><FaCircle color="#7B6ADA" size={12} /></td>
                        <td><a className="text-[10px] md:text-sm lg:text-xl text-[#7B6ADA]">สถานที่ทำงาน</a></td>
                        <td><a className="text-[10px] md:text-sm lg:text-xl text-[#7B6ADA]">ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="py-2 md:py-4">

                {data[0]?.details && (
                  <>
                    <p className="text-sm font-bold md:text-lg lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">รายละเอียด</p>
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                        <div
                          className="prose prose-sm md:prose lg:prose-lg"
                          dangerouslySetInnerHTML={{ __html: data[0].details }}
                        ></div>
                    </div>
                  </>
                )}
                

              </div>
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">คุณสมบัติ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  {(() => {
                                                  const ageStr = String(data[0]?.age); // แปลงเป็น string กันพลาด
                                                  if (ageStr === "0-0") {
                                                    return "ไม่จำกัดอายุ";
                                                  }
                                                  
                                                  if (ageStr.includes("-")) {
                                                    const [start, end] = ageStr.split("-").map(Number);
                                                    if (start === 0 && end > 0) {
                                                      return `ไม่เกิน ${end}`;
                                                    } else if (end === 0 && start > 0) {
                                                      return `${start} ขึ้นไป`;
                                                    } else {
                                                      return `อายุ ${start}-${end}`;
                                                    }
                                                  }
                                                  
                                                  // กรณีเป็นเลขเดี่ยว (ไม่มี -)
                                                  return `อายุ ${ageStr}`;
                                                })()
                                              }
                </div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  
                  {data[0]?.gender === "M"
                      ? "เพศ ชาย"
                    : data[0]?.gender === "F"
                      ? "เพศ หญิง"
                    : "ไม่ระบุเพศ"}
                          
                          
                </div>
                
                  {data[0]?.experience && (
                    <div className="flex gap-2 text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                        ประสบการณ์ 
                        <div
                          className="prose prose-sm md:prose lg:prose-lg"
                          dangerouslySetInnerHTML={{ __html: data[0].experience }}
                        ></div>
                    </div>  
                      )}
                
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  การศึกษา {data[0]?.edu_name}
                </div>
                            
                  {jobHs.length === 0 ?  (
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10 mt-2">
                      ไม่มีการกำหนดทักษะด้านความรู้
                    </div>
                  ):(
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10 mt-2 ">
                      <a>ทักษะด้านความรู้ที่ควรมี</a>
                      {jobHs.map((hs , index) =>(

                        <p key={index} className="ml-4">{index+1}.{hs.hardskill_name} </p>
                        
                      ))}
                    </div>
                  )}

                  {jobSs.length === 0 ?  (
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10 mt-2">
                      ไม่มีการกำหนดทักษะด้านอารมณ์
                    </div>
                  ):(
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10 mt-2 ">
                      <a>ทักษะด้านความรู้ที่ควรมี</a>
                      {jobSs.map((ss , index) =>(

                        <p key={index} className="ml-4">{index+1}.{ss.softskill_name} </p>
                        
                      ))}
                    </div>
                  )}

                  {data[0]?.notes && (
                    <div className="flex gap-2 text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10 mt-2 font-bold">
                      หมายเหตุ
                      <div
                          className="prose prose-sm md:prose lg:prose-lg"
                          dangerouslySetInnerHTML={{ __html: data[0].notes }}
                        ></div>
                    </div>
                  )}


              </div>
              <div className="py-2 md:py-4 lg:py-6">
                
                  {data[0]?.benefits && (
                    <>
                      <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">สวัสดิการพื้นฐาน</p>
                      <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                        <div
                          className="prose prose-sm md:prose lg:prose-lg"
                          dangerouslySetInnerHTML={{ __html: data[0].benefits }}
                        ></div>
                      </div>
                    </>
                  )}
                
              </div>
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">เวลาทำงาน</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{renderWorkSchedule(data[0]?.days)}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  
                  {data[0]?.hour && data[0]?.end_hour ? (
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">
                      เวลา {data[0]?.hour} - {data[0]?.end_hour} น.
                    </div>
                  ):(
                    <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA]">
                      เวลาการทำงานไม่ตายตัว / ตามตกลง
                    </div>
                  )}
                  </div>
              </div>
              <div className="py-2 md:py-4 lg:py-6">
                <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">ติดต่อ</p>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">{data[0]?.location} ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</div>
                <div className="text-[10px] md:text-sm lg:text-xl xl:text-2xl text-[#7B6ADA] ml-4 md:ml-10">
                  
                  {data[0]?.contact && (
                        <div
                          className="prose prose-sm md:prose lg:prose-lg"
                          dangerouslySetInnerHTML={{ __html: data[0].contact }}
                        ></div>
                      )}
                </div>
              </div>
              <div id="section2">
                  <div className="py-2 md:py-4 lg:py-6">
                    <p className="text-sm font-bold lg:text-2xl xl:text-3xl text-[#7B6ADA] ml-2 mb-1 md:ml-4 md:mb-2">แผนที่สถานที่ทำงาน</p>
                    {data.length > 0 && data[0].latitude && data[0].longitude && (
                                        <div className="flex flex-col justify-center w-full mb-2 p-4 bg-[#7B6ADA] rounded-3xl" 
                                            style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                          <MapView
                                            latitude={data[0].latitude}
                                            longitude={data[0].longitude}
                                            name=""
                                            h="500px"
                                          />
                                        </div>
                                      )}
                  </div>
              </div> 
              
              <div className="flex flex-col w-full bg-white p-4 items-center">
              <hr className="w-1/2 border border-[#D9D9D9] mb-4" />
              <div className="flex gap-3">
                <div className="tooltip" data-tip="">     
                  <button
                    onClick={() => {
                        if (closed) {
                          document.getElementById("ON_modal").showModal();
                        } else {
                          document.getElementById("close_modal").showModal();
                        }                      
                      }}
                    className={`btn btn-xs md:btn-sm lg:btn-lg  w-40 p-2 md:p-3 lg:p-4 xl:p-5 ${closed ? "bg-green-500 border-green-500" : "bg-red-500 border-red-500"} text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl`}
                  >
                    {closed ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                  </button>
                </div> 
                <div className="tooltip" data-tip="">     
                  <button
                    onClick={() => {
                       
                          document.getElementById("edit_modal").showModal();
                                            
                      }}
                    className={`btn btn-xs md:btn-sm lg:btn-lg  w-40 p-2 md:p-3 lg:p-4 xl:p-5 bg-yellow-500 border-yellow-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl`}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
                <button 
                      onClick={() => {
                        setShowWork(prev => {
                          const next = prev === 1 ? 0 : 1;
                          // ถ้าค่าต่อไปคือ 1 (แสดงรายละเอียด) ค่อยเลื่อน
                          if (next === 1) {
                            // ใช้ setTimeout เพื่อให้ React render เสร็จก่อนแล้วค่อยเลื่อน
                            setTimeout(() => {
                              document.getElementById("section1")?.scrollIntoView({ behavior: "smooth" });
                            }, 0);
                          }
                          return next;
                        });
                      }}
                      className="btn btn-xs sm:btn-sm lg:btn-lg border border-[#8E80FF] bg-[#8E80FF] text-white hover:border-[#8E80FF] hover:bg-white hover:!text-[#8E80FF] rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition"
                    >
                      {showWork === 1 ? 'ซ่อนรายละเอียดงาน' : 'รายละเอียดงาน'}
                    </button>
              </div>  

            </div>   
            </div>
          )}

            <div className="bg-white px-5 pb-1 md:px-15 lg:px-30  xl:px-35">
                            {/* แถบเมนูเลือกแท็บ */}
                              <div role="tablist" className="tabs tabs-lift">
                                <a
                                  role="tab"
                                  onClick={() => {setActiveTab("match"); setPage(1);}}
                                  className={`tab  [--tab-bg:#CFC8FF] font-semibold !text-[#8E80FF] [--tab-border-color:#CFC8FF] ${
                                    activeTab === "match" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                                  }`}
                                >
                                  จับคู่แล้ว ( {total} )
                                </a>
                                <a
                                  role="tab"
                                  onClick={() => {setActiveTab("j"); setPage(1);}}
                                  className={`tab  [--tab-bg:#CFC8FF] font-semibold !text-[#8E80FF] [--tab-border-color:#CFC8FF] ${
                                    activeTab === "j" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                                  }`}
                                >
                                  มีผู้สมัครมา ( {ajTotal} )
                                </a>
                                
                                <a
                                  role="tab"
                                  onClick={() => {setActiveTab("f"); setPage(1);}}
                                  className={`tab  [--tab-bg:#CFC8FF] font-semibold !text-[#8E80FF] [--tab-border-color:#CFC8FF] ${
                                    activeTab === "f" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF] bg-[#D9D9D9] !rounded-t-xl"
                                  }`}
                                >
                                  มีผู้สนใจ ( {favTotal != 0 ? favTotal : '0'} )
                                </a>
                                
                                
                              </div>
                              {/* เนื้อหาของแต่ละแท็บ */}
                                {activeTab === "match" && (
                                  <div className="flex flex-col bg-[#CFC8FF] w-full rounded-b-3xl rounded-tr-3xl">
                                    <div className="flex justify-end pt-6 px-18 gap-1 text-[#8E80FF]">
                                      คุณได้ตั้งค่าเปอร์เซ็นการจับคู่ขั้นต่ำไว้ที่ {percent} %
                                      {/* <button 
                                        onClick={() => navigate(`/emp_profile`)}
                                        className="text-white hover:text-gray-300">
                                        <FaCog size={24} />
                                      </button> */}
                                    </div>
                                    <div className="flex items-center justify-end pt-2 px-18">
                                        <div className="flex items-center bg-white p-2 rounded-xl">
                                                        {/* {userData.percent_match} */}
                                                        <input
                                                          type="range"
                                                          min="0"
                                                          max="100"
                                                          step="1"
                                                          value={empPercent}
                                                          onChange={(e) => setEmpPercent(Number(e.target.value))}
                                                          className="w-64 accent-[#8E80FF] border border-[#8e80ff]" // ใช้ tailwind ปรับสีได้
                                                        />

                                                        {/* แสดงเปอร์เซ็นต์ */}
                                                        <span className="font-bold text-sm text-[#8E80FF]">{empPercent}%</span>
                                        </div>
                                    </div>
                                    {(MJdata.length > 0)   ? (
                                      <>
                                              {/* match job */}
                                                    
                                                    <div className="flex flex-col justify-center items-center mx-3 pt-2 pb-1 sm:pt-4 md:px-8 lg:pt-2 lg:px-12 ">
                                                      

                                                      {/* วนงานแต่ละการ์ด */}
                                                      {MJdata.filter(post => post.matchPercent >= empPercent).map((post, index) => {
                                                        

                                                        return (
                                                          <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-2 w-full my-1 bg-white shadow-lg rounded-3xl p-4 md:p-6 border border-[#E0E0E0] transition hover:shadow-xl"
                                                          >

                                                            {/* รูปโปรไฟล์ */}
                                                                  <div className="flex items-start w-auto space-x-6">
                                                                    <div className="w-40 h-40 rounded-lg">
                                                                      {post.picture ? (
                                                                        <img src={`/uploads/user_pic/${post.picture}`}  className="w-full h-full object-cover rounded-xl" />
                                                                      ) : (
                                                                        <img src={`/uploads/nopic.png`}  className="w-full h-full object-cover rounded-xl" />
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                    {/* ข้อมูลฝั่งซ้าย */}
                                                                    <div className="flex flex-col items-start w-3/4 text-sm text-gray-700">
                                                                      <div className="font-semibold text-[#8E80FF] text-2xl">
                                                                        {post.fullname || 'ไม่ระบุ'}
                                                                        
                                                                          {post.apply_status === "accepted" ? (
                                                                            <span 
                                                                              style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                                                              className="ml-2  indicator-item  border border-green-500 bg-green-500 text-lg text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                            >
                                                                              รับแล้ว
                                                                            </span>
                                                                          ): post.apply_status === "rejected" ?(
                                                                              <span 
                                                                                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                                                                className="ml-2  indicator-item border border-red-500 bg-red-500 text-lg text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                              >
                                                                                ปฏิเสธไปแล้ว
                                                                              </span>
                                                                          ): post.apply_status === "waitjobber" ?(
                                                                              <span 
                                                                                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                                                                className="ml-2  indicator-item border border-sky-500 bg-sky-500 text-lg text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                              >
                                                                                รอผู้สมัครยืนยัน
                                                                              </span>
                                                                          ): post.apply_status === "expired" ?(
                                                                              <span 
                                                                                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                                                                className="ml-5 indicator-item border border-gray-400 bg-gray-400 text-lg text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                              >
                                                                                แจ้งไปแล้วแต่ไม่มีการตอบกลับ
                                                                              </span>
                                                                          ): post.apply_status === "waitemp" ?(
                                                                              <span 
                                                                                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                                                                className="ml-2  indicator-item border border-green-300 bg-green-300 text-lg text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                              >
                                                                                สมัครมาแล้ว
                                                                              </span>
                                                                          ): post.apply_status === "jb_rejected" ?(
                                                                              <span 
                                                                                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                                                                className="ml-2  indicator-item border border-red-700 bg-red-700 text-lg text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                              >
                                                                                ผู้สมัครปฏิเสธ
                                                                              </span>
                                                                          ) : (
                                                                              <span 
                                                                                style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                                                                className="ml-2 indicator-item border border-gray-400 bg-gray-400 text-lg text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                              >
                                                                                ผู้สมัครยังไม่มีการสมัคร
                                                                              </span>
                                                                          )}
                                                                        
                                                                        {/* ใส่ status ให้ว่า มีการสมัครเข้ามาแล้ว  ไปแก้ฝั่งjobber ด้วย ตอนกดสมัคร แล้วตอนค้นหาก็ไม่ต้องเอางานนี้ออกมาหรือเปล่า หรือออกมาแต่ตอนที่กดดูรายละเอียดกว่ามีการแม็ทก็ขึ้นมาด้วย */}
                                                                      </div>

                                                                      <div className="flex items-center justify-center w-full items-start gap-2 mt-3 ml-4">
                                                                        <div className="flex items-start w-1/2 space-x-2">
                                                                          <span className="text-[#8E80FF]">●</span>
                                                                          <div>
                                                                            <p className=" text-[#7B6ADA] font-bold">ทักษะด้านความรู้</p>
                                                                            {post.hardskills?.split(',').slice(0, 3).map((skill, idx) => {
                                                                              const onlyFirstWord = skill.trim().split(' ')[0];
                                                                                return (
                                                                                  <p key={idx} className="text-gray-700">
                                                                                    {onlyFirstWord}
                                                                                  </p>
                                                                                );
                                                                            })}
                                                                          </div>
                                                                        </div>

                                                                        <div className="flex items-start w-1/2 space-x-2">
                                                                          <span className="text-[#8E80FF]">●</span>
                                                                          <div>
                                                                            <p className=" text-[#7B6ADA] font-bold">ทักษะด้านอารมณ์</p>
                                                                            {post.softskills?.split(',').slice(0, 3).map((skill, idx) => {
                                                                              const onlyFirstWord = skill.trim().split(' ')[0];
                                                                                return (
                                                                                  <p key={idx} className="text-gray-700">
                                                                                    {onlyFirstWord}
                                                                                  </p>
                                                                                );
                                                                            })}
                                                                          </div>
                                                                        </div>
                                                                      </div>
                                                                    
                                                                  </div>

                                                                  {/* ฝั่งขวา */}
                                                                  <div className="flex flex-col w-1/4 gap-5 h-full items-end">
                                                                    <div className="text-center">
                                                                      <p className="text-gray-600 text-xs">ความสอดคล้อง</p>
                                                                      <p className={`text-5xl font-bold  ${post.matchPercent > percent ? "text-[#8E80FF]" : "text-red-500"}`}>
                                                                        {post.matchPercent}%
                                                                      </p>
                                                                      <p className={`text-xs  ${post.matchPercent > percent ? "text-[#8E80FF]" : "text-red-500"}`}>{post.matchPercent > percent ? "ผ่านเกณฑ์ที่คุณตั้งไว้" : "ไม่ผ่านเกณฑ์ที่คุณตั้งไว้"}</p>
                                                                    </div>
                                                                    <button 
                                                                      onClick={() => goToProfile(post.post_id , post.jobber_id , post.matchPercent , post.apply_status , post.apply_message , post.inter_work_id)}
                                                                      className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-full border border-[#8E80FF] bg-[#8E80FF] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition hover:bg-[#7B6ADA]"
                                                                    >
                                                                      รายละเอียด
                                                                    </button>
                                                                  </div>
                                      
                                                          </div>
                                                        );
                                                      })}
                                                    </div>

                                                    {/* /end flex  job/ */}
                              
                                                            <center>
                                                              <div className="join items-center gap-2 mb-3">
                                                                {/* ปุ่มย้อนกลับ */}
                                                                {page > 1 && (
                                                                  <button
                                                                    onClick={() => setPage(page - 1)}
                                                                    className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                                                                  >
                                                                    «
                                                                  </button>
                                                                )}

                                                                {/* ปุ่มเลขเพจ */}
                                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                                  <button
                                                                    key={pageNum}
                                                                    onClick={() => setPage(pageNum)}
                                                                    className={`btn btn-xs rounded-3xl join-item transition-colors
                                                                      ${
                                                                        page === pageNum
                                                                          ? "bg-[#6C5CE7] border-[#6C5CE7] text-white hover:bg-[#5945c7]"
                                                                          : "bg-transparent border-white text-white hover:bg-white hover:text-[#6C5CE7]"
                                                                      }`}
                                                                  >
                                                                    {pageNum}
                                                                  </button>
                                                                ))}

                                                                {/* ปุ่มถัดไป */}
                                                                {page < totalPages && (
                                                                  <button
                                                                    onClick={() => setPage(page + 1)}
                                                                    className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                                                                  >
                                                                    »
                                                                  </button>
                                                                )}
                                                              </div>
                                                            </center>

                                      </>
                                    ) : (
                                      <>
                                        {/* กรณีไม่มีข้อมูล */}
                                        <div className="flex flex-col justify-center items-center mx-3 py-10 sm:p-4 md:px-8 lg:pt-12 lg:px-12 xl:px-40 text-center">
                                          {/* ใช้ emoji หรือไอคอน svg */}
                                          <div className="text-6xl md:text-7xl lg:text-8xl mb-4">
                                            <div className="w-20 h-20 text-[#8E80FF]">
                                                <svg xmlns="http://www.w3.org/2000/svg" 
                                                    fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
                                                    stroke="currentColor" className="w-full h-full">
                                                  <path strokeLinecap="round" strokeLinejoin="round" 
                                                        d="M15.75 9A3.75 3.75 0 1 1 8.25 9a3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0M18 12l4 4m0-4l-4 4" />
                                                </svg>
                                              </div>

                                          </div>
                                          <p className="text-[#8E80FF] text-base md:text-lg lg:text-xl font-semibold">
                                            ยังไม่มีคนสมัครงานที่เหมาะกับงานของคุณ
                                          </p>
                                          <p className="text-[#8E80FF] text-sm md:text-md mt-1">
                                            อย่าเพิ่งกังวลนะคะ เราจะคอยอัปเดตให้ทันทีเมื่อมีผู้สมัครที่ตรงตามคุณสมบัติ 
                                          </p>
                                        </div>
                                      </>
                                    ) }
                                  </div>
                                )}
                                
                                {activeTab === "j" && (
                                  <div className="flex flex-col bg-[#CFC8FF] rounded-b-3xl rounded-tr-3xl p-5 mb-5">
                                    {applyJob.length > 0 ? (
                                      <>
                                              {/* match job */}
                                                    <div className="flex justify-center items-center mx-3 pt-2 pb-1 sm:pt-4 md:px-8 lg:pt-6 w-full">
                                                      
                                                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 w-full xl:grid-cols-3 gap-5">
                                                      {/* วนงานแต่ละการ์ด */}
                                                      {applyJob.map((post, index) => {
                                                        return (
                                                          <div key={index} className="indicator w-full">
                                                            {post.status === "accepted" ? (
                                                                        <span 
                                                                          style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                          className="mr-3 indicator-item  border border-green-500 bg-green-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                        >
                                                                          รับแล้ว
                                                                        </span>
                                                                      ): post.status === "rejected" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-7 indicator-item border border-red-500 bg-red-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                          >
                                                                            ปฏิเสธไปแล้ว
                                                                          </span>
                                                                      ): post.status === "waitjobber" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-10 indicator-item border border-sky-500 bg-sky-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                          >
                                                                            รอผู้สมัครยืนยัน
                                                                          </span>
                                                                      ): post.status === "expired" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-19 indicator-item border border-gray-400 bg-gray-400 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                          >
                                                                            แจ้งไปแล้วแต่ไม่มีการตอบกลับ
                                                                          </span>
                                                                      ): (
                                                                          <></>
                                                                      )}
                                                            <div
                                                              key={index}
                                                              className="flex flex-col items-center justify-between gap-2 w-full my-1 bg-white shadow-lg rounded-3xl p-4 border border-[#E0E0E0] transition hover:shadow-xl"
                                                            >
                                                              {/* รูปโปรไฟล์ */}
                                                                    <div className="flex items-center w-full space-x-3">
                                                                      <div className="w-30 h-30 rounded-lg">
                                                                        {post.picture ? (
                                                                          <img src={`/uploads/user_pic/${post.picture}`}  className="w-full h-full object-cover rounded-xl" />
                                                                        ) : (
                                                                          <img src={`/uploads/nopic.png`}  className="w-full h-full object-cover rounded-xl" />
                                                                        )}
                                                                      </div>
                                                                      <div className="flex flex-col">
                                                                        <h2 className="font-semibold text-[#8E80FF] text-xl">
                                                                          {post.fullname || 'ไม่ระบุ'}
                                                                        </h2>
                                                                        <h2 className="font-semibold text-gray-400 text-lg">
                                                                          {post.fullname_eng || 'ไม่ระบุ'}
                                                                        </h2>
                                                                        <h2 className="font-semibold text-gray-400 text-lg">
                                                                          อายุ {calculateAge(post.birthday)} ปี
                                                                        </h2>

                                                                      </div>
                                                                    </div>
                                                                      {/* ข้อมูลฝั่งซ้าย */}
                                                                    <div className="flex flex-col items-start w-full text-sm text-gray-700 gap-1">
                                                                      <div className="flex w-full">
                                                                        <div className="w-1/3">การศึกษา :</div>
                                                                        <div className="w-1/2">{post.edu_name}</div>
                                                                      </div>
                                                                      {/* <div className="flex w-full">
                                                                        <div className="w-1/2">ประสบการณ์ :</div>
                                                                        <div className="w-1/2">ประสบการณ์</div>
                                                                      </div> */}
                                                                      <div className="flex w-full">
                                                                        <div className="w-1/3">วันที่สมัคร :</div>
                                                                        <div className="w-1/2">{formatDateToThaiShort(post.date_time)}</div>
                                                                      </div>
                                                                    </div>

                                                                    {/* ฝั่งขวา */}
                                                                    <div className="flex flex-col items-center justify-center gap-5 h-full">
                                                                      
                                                                      <button 
                                                                        onClick={() => {
                                                                          setSelectedJobberId(post.jobber_id);
                                                                          setMessage(post.message);
                                                                          setStatus(post.status);
                                                                          setApplyType("j");
                                                                          document.getElementById("show_modal").showModal();
                                                                        }}
                                                                        className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-35 border border-[#8E80FF] bg-[#8E80FF] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition hover:bg-[#7B6ADA]"
                                                                      >
                                                                        รายละเอียด
                                                                      </button>
                                                                    </div>
                                        
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                      </div>
                                                    </div>

                                                    {/* /end flex  job/ */}
                              
                                                            <center>
                                                              <div className="join items-center gap-2 mb-3">
                                                                {/* ปุ่มย้อนกลับ */}
                                                                {ajPage > 1 && (
                                                                  <button
                                                                    onClick={() => setAjPage(ajPage - 1)}
                                                                    className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                                                                  >
                                                                    «
                                                                  </button>
                                                                )}

                                                                {/* ปุ่มเลขเพจ */}
                                                                {Array.from({ length: ajTotalPages }, (_, i) => i + 1).map((pageNum) => (
                                                                  <button
                                                                    key={pageNum}
                                                                    onClick={() => setAjPage(pageNum)}
                                                                    className={`btn btn-xs rounded-3xl join-item transition-colors
                                                                      ${
                                                                        ajPage === pageNum
                                                                          ? "bg-[#6C5CE7] border-[#6C5CE7] text-white hover:bg-[#5945c7]"
                                                                          : "bg-transparent border-white text-white hover:bg-white hover:text-[#6C5CE7]"
                                                                      }`}
                                                                  >
                                                                    {pageNum}
                                                                  </button>
                                                                ))}

                                                                {/* ปุ่มถัดไป */}
                                                                {ajPage < ajTotalPages && (
                                                                  <button
                                                                    onClick={() => setAjPage(ajPage + 1)}
                                                                    className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                                                                  >
                                                                    »
                                                                  </button>
                                                                )}
                                                              </div>
                                                            </center>

                                      </>
                                    ) : (
                                      <>
                                        {/* กรณีไม่มีข้อมูล */}
                                        <div className="flex flex-col justify-center items-center mx-3 py-10 sm:p-4 md:px-8 lg:pt-12 lg:px-12 xl:px-40 text-center">
                                          {/* ใช้ emoji หรือไอคอน svg */}
                                          <div className="text-6xl md:text-7xl lg:text-8xl mb-4">
                                            <div className="w-20 h-20 text-[#8E80FF]">
                                                <svg xmlns="http://www.w3.org/2000/svg" 
                                                    fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
                                                    stroke="currentColor" className="w-full h-full">
                                                  <path strokeLinecap="round" strokeLinejoin="round" 
                                                        d="M15.75 9A3.75 3.75 0 1 1 8.25 9a3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0M18 12l4 4m0-4l-4 4" />
                                                </svg>
                                              </div>

                                          </div>
                                          <p className="text-[#8E80FF] text-base md:text-lg lg:text-xl font-semibold">
                                            ยังไม่มีคนสมัครงานที่สมัครงานของคุณ
                                          </p>
                                          {/* <p className="text-gray-100 text-sm md:text-md mt-1">
                                            อย่าเพิ่งกังวลนะคะ เราจะคอยอัปเดตให้ทันทีเมื่อมีผู้สมัครที่ตรงตามคุณสมบัติ 💜
                                          </p> */}
                                        </div>
                                      </>
                                    ) }
                                  </div>
                                )}
            
                                {activeTab === "f" && (
                                  <div className="flex flex-col bg-[#CFC8FF] rounded-b-3xl rounded-tr-3xl p-5 mb-5">
                                    {favorite.length > 0 ? (
                                      <>
                                              {/* match job */}
                                                    <div className="flex flex-col justify-center items-center mx-3 pt-2 pb-1 sm:pt-4 md:px-8 lg:pt-6 w-full">
                                                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 w-full xl:grid-cols-3 gap-4">
                                                   
                                                      {/* วนงานแต่ละการ์ด */}
                                                      {favorite.map((post, index) => {
                                                        return (
                                                          <div className="indicator w-full">
                                                            {post.status === "accepted" ? (
                                                                        <span 
                                                                          style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                          className="mr-3 indicator-item  border border-green-500 bg-green-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                        >
                                                                          รับแล้ว
                                                                        </span>
                                                                      ): post.status === "rejected" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-7 indicator-item border border-red-500 bg-red-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                          >
                                                                            ปฏิเสธไปแล้ว
                                                                          </span>
                                                                      ): post.status === "waitjobber" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-10 indicator-item border border-sky-500 bg-sky-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                          >
                                                                            รอผู้สมัครยืนยัน
                                                                          </span>
                                                                      ): post.status === "expired" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-19 indicator-item border border-gray-400 bg-gray-400 text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-2"
                                                                          >
                                                                            แจ้งไปแล้วแต่ไม่มีการตอบกลับ
                                                                          </span>
                                                                      ): (
                                                                          <></>
                                                                      )}
                                                            <div
                                                              key={index}
                                                              className="flex flex-col items-center justify-between gap-2 w-full my-1 bg-white shadow-lg rounded-3xl p-4 border border-[#E0E0E0] transition hover:shadow-xl"
                                                            >
                                                              {/* รูปโปรไฟล์ */}
                                                                    <div className="flex items-center w-full space-x-3">
                                                                      <div className="w-30 h-30 rounded-lg">
                                                                        {post.picture ? (
                                                                          <img src={`/uploads/user_pic/${post.picture}`}  className="w-full h-full object-cover rounded-xl" />
                                                                        ) : (
                                                                          <img src={`/uploads/nopic.png`}  className="w-full h-full object-cover rounded-xl" />
                                                                        )}
                                                                      </div>
                                                                      <div className="flex flex-col">
                                                                        <h2 className="font-semibold text-[#8E80FF] text-2xl">
                                                                          {post.fullname || ''}
                                                                        </h2>
                                                                        <h2 className="font-semibold text-gray-400 text-lg">
                                                                          {post.fullname_eng || ''}
                                                                        </h2>
                                                                        
                                                                          {post.birthday &&(
                                                                            <><h2 className="font-semibold text-gray-400 text-lg">
                                                                            อายุ {calculateAge(post.birthday)} ปี</h2>
                                                                            </>
                                                                          )}
                                                                          
                                                                        

                                                                      </div>
                                                                    </div>
                                                                      {/* ข้อมูลฝั่งซ้าย */}
                                                                    <div className="flex flex-col items-start w-full text-sm text-gray-700 gap-1">
                                                                      <div className="flex w-full">
                                                                        <div className="w-1/3">การศึกษา :</div>
                                                                        <div className="w-1/2">{post.edu_name}</div>
                                                                      </div>
                                                                      {/* <div className="flex w-full">
                                                                        <div className="w-1/2">ประสบการณ์ :</div>
                                                                        <div className="w-1/2">ประสบการณ์</div>
                                                                      </div> */}
                                                                      <div className="flex w-full">
                                                                        <div className="w-1/3">วันเวลาที่สมัคร :</div>
                                                                        <div className="w-1/2">{formatDateToThaiShort(post.date_time)}</div>
                                                                      </div>
                                                                    </div>

                                                                    {/* ฝั่งขวา */}
                                                                    <div className="flex flex-col items-center justify-center gap-5 h-full items-end">
                                                                      
                                                                      <button 
                                                                        onClick={() => {
                                                                          setSelectedJobberId(post.jobber_id);
                                                                          setMessage(post.message);
                                                                          setStatus(post.status);
                                                                          setApplyType("f");
                                                                          document.getElementById("show_modal").showModal();
                                                                        }}
                                                                        className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg w-35 border border-[#8E80FF] bg-[#8E80FF] text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl transition hover:bg-[#7B6ADA]"
                                                                      >
                                                                        รายละเอียด
                                                                      </button>
                                                                    </div>
                                        
                                                            </div>
                                                          </div>
                                                        );
                                                        
                                                      })}
                                                      </div>
                                                    </div>

                                                    {/* /end flex  job/ */}
                              
                                                            <center>
                                                              <div className="join items-center gap-2 mb-3">
                                                                {/* ปุ่มย้อนกลับ */}
                                                                {favPage > 1 && (
                                                                  <button
                                                                    onClick={() => setFavPage(favPage - 1)}
                                                                    className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                                                                  >
                                                                    «
                                                                  </button>
                                                                )}

                                                                {/* ปุ่มเลขเพจ */}
                                                                {Array.from({ length: favTotalPages }, (_, i) => i + 1).map((pageNum) => (
                                                                  <button
                                                                    key={pageNum}
                                                                    onClick={() => setFavPage(pageNum)}
                                                                    className={`btn btn-xs rounded-3xl join-item transition-colors
                                                                      ${
                                                                        favPage === pageNum
                                                                          ? "bg-[#6C5CE7] border-[#6C5CE7] text-white hover:bg-[#5945c7]"
                                                                          : "bg-transparent border-white text-white hover:bg-white hover:text-[#6C5CE7]"
                                                                      }`}
                                                                  >
                                                                    {pageNum}
                                                                  </button>
                                                                ))}

                                                                {/* ปุ่มถัดไป */}
                                                                {favPage < favTotalPages && (
                                                                  <button
                                                                    onClick={() => setFavPage(favPage + 1)}
                                                                    className="btn btn-xs bg-[#6C5CE7] border-[#6C5CE7] text-white rounded-3xl join-item hover:bg-[#5945c7]"
                                                                  >
                                                                    »
                                                                  </button>
                                                                )}
                                                              </div>
                                                            </center>

                                      </>
                                    ) : (
                                      <>
                                        {/* กรณีไม่มีข้อมูล */}
                                        <div className="flex flex-col justify-center items-center mx-3 py-10 sm:p-4 md:px-8 lg:pt-12 lg:px-12 xl:px-40 text-center">
                                          {/* ใช้ emoji หรือไอคอน svg */}
                                          <div className="text-6xl md:text-7xl lg:text-8xl mb-4">
                                            <div className="w-20 h-20 text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" 
                                                    fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
                                                    stroke="currentColor" className="w-full h-full">
                                                  <path strokeLinecap="round" strokeLinejoin="round" 
                                                        d="M15.75 9A3.75 3.75 0 1 1 8.25 9a3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0M18 12l4 4m0-4l-4 4" />
                                                </svg>
                                              </div>

                                          </div>
                                          <p className="text-white text-base md:text-lg lg:text-xl font-semibold">
                                            ยังไม่มีคนสมัครงานที่สนใจงานของคุณ
                                          </p>
                                          {/* <p className="text-gray-100 text-sm md:text-md mt-1">
                                            อย่าเพิ่งกังวลนะคะ เราจะคอยอัปเดตให้ทันทีเมื่อมีผู้สมัครที่ตรงตามคุณสมบัติ 💜
                                          </p> */}
                                        </div>
                                      </>
                                    ) }
                                  </div>
                                )}
            
                               
                              
                          </div>
            
            
                           

          </div>



        <Footer />
        {/* Modal สำหรับปิดรับสมัคร */}
        <dialog id="close_modal" className="modal">
          <div className="modal-box bg-white rounded-2xl shadow-xl">
            {/* หัวข้อ */}
            <center>
              <h2 className="text-base md:text-xl text-red-600 font-bold mb-4 flex items-center justify-center gap-2">
                
                ต้องการปิดรับสมัคร?
              </h2>
            </center>

            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 md:w-20 md:h-20 text-white bg-red-500 rounded-full p-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <div className="modal-action flex justify-center gap-4">
              <button
                className="btn btn-sm md:btn-md bg-red-600 hover:bg-red-700 border border-red-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => handleCloseToggle(parseInt(id))}
              >
                ยืนยันการปิดรับสมัคร
              </button>
              <button
                className="btn btn-sm md:btn-md bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => document.getElementById("close_modal").close()}
              >
                ดูก่อนละกัน
              </button>
            </div>
          </div>
        </dialog>
        {/* Modal สำหรับเปิดรับสมัคร */}
        <dialog id="ON_modal" className="modal">
          <div className="modal-box bg-white rounded-2xl shadow-xl">
            {/* หัวข้อ */}
            <center>
              <h2 className="text-base md:text-xl text-green-600 font-bold mb-4 flex items-center justify-center gap-2">
                
                ต้องการเปิดรับสมัครอีกครั้ง?
              </h2>
            </center>

            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 md:w-20 md:h-20 text-white bg-green-500 rounded-full p-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>

            <div className="modal-action flex justify-center gap-4">
              <button
                className="btn btn-sm md:btn-md bg-green-600 hover:bg-green-700 border border-green-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => handleCloseToggle(parseInt(id))}
              >
                ยืนยันการเปิดรับสมัคร
              </button>
              <button
                className="btn btn-sm md:btn-md bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-5 py-2 rounded-lg shadow-md transition-all"
                onClick={() => document.getElementById("ON_modal").close()}
              >
                ดูก่อนละกัน
              </button>
            </div>
          </div>
        </dialog>
        {/* Modal อัปรูป */}
        <dialog id="up_pic_modal" className="modal">
          <div className="modal-box bg-white rounded-3xl">
            <center>
                <div className='mb-4'>
                    
                    <img
                        src={previewUrl || (data[0]?.job_pic
                                ? `/uploads/emp_pic/${data[0].job_pic}`
                                : `/uploads/nophoto.png`)}
                        className="rounded-3xl max-h-60"
                        alt="Preview"
                    />

                </div>
                <label className='text-[#8E80FF] pr-2'>แก้ไขรูปภาพ</label>
              <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered border border-[#8E80FF] bg-white text-[#8E80FF] file-input-sm rounded-xl w-full max-w-xs"
                />
            </center>   
            <div className="modal-action flex justify-center">
              
                <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={handleUpload}>
                  ตกลง
                </button>
                <button className="btn bg-[#FF0004] border border-[#FF0004] text-white px-4 py-2 rounded-lg" onClick={() => document.getElementById("up_pic_modal").close()}>
                  ยกเลิก
                </button>
              
            </div>
          </div>
        </dialog>
              {/* Modal สำหรับแก้ไขข้อมูลงาน */}
              <dialog id="edit_modal" className="modal">
                <div className="modal-box bg-white rounded-2xl shadow-xl max-w-5xl w-full">
                  {/* หัวข้อ */}
                  <center>
                    <h2 className="text-base md:text-xl text-yellow-600 font-bold flex items-center justify-center gap-2">
                      แก้ไขข้อมูล
                    </h2>
                  </center>

                  <div className="flex justify-center my-4">
                    <div className="flex flex-col justify-center w-full">
                    
                                    <div className="tabs tabs-lift">
                                    <button 
                                      type="button"
                                      onClick={() => setCurrentStep(1)}
                                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                      className={`px-4 py-4 rounded-t-xl font-bold 
                                        ${currentStep === 1 
                                          ? "bg-white text-[#7B6ADA]" 
                                          : "bg-gray-300 text-white"
                                        }`}
                                    >
                                      รายละเอียดงาน
                                    </button>
                    
                                    <button 
                                      type="button"
                                      onClick={() => setCurrentStep(2)}
                                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                      className={`px-4 py-4 rounded-t-xl font-bold 
                                        ${currentStep === 2 
                                          ? "bg-white text-[#7B6ADA]" 
                                          : "bg-gray-300 text-white"
                                        }`}
                                    >
                                      สถานที่และเวลาทำงาน
                                    </button>
                    
                                    <button 
                                      type="button"
                                      onClick={() => setCurrentStep(3)}
                                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                      className={`px-4 py-4 rounded-t-xl  font-bold  
                                        ${currentStep === 3 
                                          ? "bg-white text-[#7B6ADA]" 
                                          : "bg-gray-300 text-white"
                                        }`}
                                    >
                                      คุณสมบัติของผู้สมัคร
                                    </button>
                                    
                    
                                    <button 
                                      type="button"
                                      onClick={() => setCurrentStep(4)}
                                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                      className={`px-4 py-4 rounded-t-xl font-bold  
                                        ${currentStep === 4 
                                          ? "bg-white text-[#7B6ADA]" 
                                          : "bg-gray-300 text-white"
                                        }`}
                                    >
                                      ข้อมูลการติดต่อ
                                    </button>
                    
                                  </div>
                                  <div id="section_post" className="flex flex-col w-full gap-2">
                                    
                                    <div className='flex flex-col text-[#8E80FF] bg-white rounded-b-3xl rounded-tr-3xl p-5 w-full' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                      <form onSubmit={(e) => {handleGoGo(e);}} className='mt-3 '>
                                          
                                              <div className="flex flex-col gap-2 items-center justify-center ">
                                                {currentStep === 1 && (
                                                  <>
                                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                                        
                                                      <div className="flex justify-center mt-2 font-bold">
                                                            ตำแหน่ง : {data[0]?.position_name}
                                                        </div>
                    
                                                    <div className="flex gap-2">
                                                      <div className="flex flex-col w-full">
                                                          <div className="text-[#8E80FF] font-bold">จำนวน <a className="text-xs">( อัตรา )</a></div>
                                                              <input 
                                                                  type="number" 
                                                                  
                                                                  className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                  name="num_position"
                                                                  value={formData.num_position || ""}
                                                                  onChange={handleChange} 
                                                                  required/>
                                                      </div>
                                                      
                    
                                                      <div className="flex flex-col w-full">
                                                        <TooltipField 
                                                                label="ประเภทการจ้างงาน" 
                                                                tooltip={`งานประจำ → ทำงานเต็มเวลา\nงานพาร์ทไทม์ → ทำงานชั่วคราว/ไม่เต็มเวลา\nงานสัญญาจ้าง → ทำงานตามสัญญา\nงานรายวัน → ทำงานเป็นวัน รับค่าจ้างรายวัน`}
                                                              ></TooltipField>
                                                          
                                                              <select
                                                                  className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                                  value={formData.type}
                                                                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                              >
                                                                  
                                                                    <option value="f">งานประจำ</option>
                                                                    <option value="p">งานพาร์ทไทม์</option>
                                                                    <option value="c">งานสัญญาจ้าง</option>
                                                                    <option value="d">งานรายวัน</option>
                                                                      
                                                              </select>
                                                      </div>
                                                      
                                                  </div><div className="flex items-center gap-2">
                                                      <div className="flex flex-col w-full">
                                                            <div className="text-[#8E80FF] font-bold">ค่าตอบแทน <a className="text-xs">( บาท )</a></div>
                                                                <input 
                                                                type="number" 
                                                                className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                name="minsalary"
                                                                value={formData.minsalary || ""}
                                                                placeholder="ขั้นต่ำ"
                                                                onChange={handleChange} 
                                                                required/>
                                                        
                                                          </div>
                                                              <div className="text-[#8E80FF] font-bold mt-3">-</div>
                    
                                                      
                                                          <div className="flex flex-col w-full">
                                                            <div className="text-white font-bold">ค่าตอบแทน <a className="text-xs"></a></div>
                                                                <input 
                                                                type="number" 
                                                                className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                name="maxsalary"
                                                                placeholder="สูงสุด"
                                                                value={formData.maxsalary || ""}
                                                                onChange={handleChange} 
                                                                required/>
                                                        
                                                          </div>
                                                    </div>
                                                  <div className="flex items-end gap-2 mt-2">
                                                                        <a className="text-[#8E80FF] font-bold">รายละเอียดงาน</a>
                                                                        {/* <a className="text-[#A3A3A3] text-xs">รายละเอียดงาน</a> */}
                                                                    </div>
                                                                  <TiptapEditor
                                                                    value={formData.details}
                                                                    onEditorChange={(content) => handleEditorChange("details", content)}
                                                                  />                                                                                          
                                                                    
                                                    <div className="flex gap-2 mt-2">
                                                                        <a className="text-[#8E80FF] font-bold">สวัสดิการ</a>
                                                                        <label className="label">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                name="address" 
                                                                                className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                                                checked={formData.ownbenefit === 1} 
                                                                                onChange={(e) => setFormData({ ...formData, ownbenefit: e.target.checked ? 1 : 0 })}
                                                                            />
                                                                            <a className='text-xs'>ใช้สวัสดิการจากโปรไฟล์</a>
                                                                        </label>
                                                                    </div>
                                                                  <TiptapEditor
                                                                    value={formData.benefits}
                                                                    onEditorChange={(content) => handleEditorChange("benefits", content)}
                                                                  />                                                                                        
                                                                         
                    
                                                        
                                                    </div>
                                                  </>
                                                )}
                                                {currentStep === 2 && (
                                                  <>
                                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                                      <div className="flex items-center gap-2 mt-2">
                                                            <a className="text-[#8E80FF] font-bold">สถานที่ทำงาน</a>
                                                            <label className="label pt-1">
                                                                  <input 
                                                                      type="checkbox" 
                                                                      name="address" 
                                                                      className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                                      checked={formData.address === 1} 
                                                                      onChange={(e) => setFormData({ ...formData, address: e.target.checked ? 1 : 0 })}
                                                                  />
                                                                  <a className='text-xs'>ใช้ที่อยู่ของผู้จ้างเอง</a>
                                                              </label>
                                                        </div>
                                                          
                                                              <select
                                                                  className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                                  value={formData.jangwat_id}
                                                                  onChange={(e) => setFormData({ ...formData, jangwat_id: e.target.value })}
                                                                  
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
                                                                          <select
                                                                              className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                                              value={formData.ampher_id}
                                                                              onChange={(e) => 
                                                                                setFormData({ 
                                                                                  ...formData, 
                                                                                  ampher_id: e.target.value,
                                                                                  tambon_id: ""
                                                                                })}
                                                                              
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
                                                                          className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                                          value={formData.tambon_id}
                                                                          onChange={(e) => setFormData({ ...formData, tambon_id: e.target.value })}
                                                                          
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
                                                                    className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                                                    name="location"
                                                                    placeholder='ที่อยู่ อาคาร หมู่บ้าน'
                                                                    value={formData.location || ""}
                                                                    onChange={handleChange}
                                                                    required
                                                                />
                                                                <div className="flex gap-2">
                                                                  <div className="flex flex-col w-full">
                                                                      <div className="flex items-center justify-start text-[#8E80FF] font-bold">
                                                                        <a>พิกัด</a>
                                                                        <a className="w-1/3 text-xs ml-1">( ละติจูด )</a>
                                                                        <TooltipField 
                                                                          label="" 
                                                                          tooltip={`ใช้กรณีอยากให้แสดงงานบนแผนที่\nสามารถ copy พิกัดจาก Google Maps`}
                                                                        ></TooltipField>
                                                                      </div>
                                                                          <input 
                                                                              type="number" 
                                                                              className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                              name="latitude"
                                                                              value={formData.latitude || ""}
                                                                              onChange={handleChange} 
                                                                              required/>
                                                                  </div>
                                                                  <div className="flex flex-col w-full">
                                                                      <div className="text-[#8E80FF] font-bold"><a className="text-xs">( ลองจิจูด )</a></div>
                                                                          <input 
                                                                          type="number" 
                                                                          className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                          name="longitude"
                                                                          value={formData.longitude || ""}
                                                                          onChange={handleChange} 
                                                                          required/>
                                                                  </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                  <div className="flex flex-col w-full">
                                                                      <div className="text-[#8E80FF] font-bold">เวลาทำงาน <a className="text-xs">( ตั้งแต่ )</a></div>
                                                                          <input 
                                                                              type="time" 
                                                                              className="input w-full bg-[#8E80FF] text-white border-[#A3A3A3] rounded-box" 
                                                                              name="hour"
                                                                              value={formData.hour || ""}
                                                                              onChange={handleChange} 
                                                                              required/>
                                                                  </div>
                                                                  <div className="flex flex-col w-full">
                                                                      <div className="text-[#8E80FF] font-bold"><a className="text-xs">( ถึง )</a></div>
                                                                          <input 
                                                                          type="time" 
                                                                          className="input w-full bg-[#8E80FF] text-white border-[#A3A3A3] rounded-box" 
                                                                          name="end_hour"
                                                                          value={formData.end_hour || ""}
                                                                          onChange={handleChange} 
                                                                          required/>
                                                                  </div>
                                                                </div>  
                                                              <div className="flex flex-col">
                                        <a>วันทำงาน</a>
                                        <div className='flex gap-2 my-2'>      
                                                    <div className="flex gap-3 flex-wrap">
                                                        <button type="button" onClick={selectAllDays} className="btn btn-sm btn-outline rounded-xl">ทุกวัน</button>
                                                        <button type="button" onClick={selectWeekdaysOnly} className="btn btn-sm btn-outline rounded-xl">จันทร์-ศุกร์</button>
                                                        <button type="button" onClick={selectWeekendOnly} className="btn btn-sm btn-outline rounded-xl">เสาร์-อาทิตย์</button>
                                                    </div>
                    
                                                </div>  
                                                <div className="flex gap-2 grid grid-cols-5 justify-center">
                                                    {Object.keys(weekdays).map((day) => (
                                                    <label key={day} className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={weekdays[day]}
                                                        onChange={() =>
                                                        setWeekdays((prev) => ({ ...prev, [day]: !prev[day] }))
                                                        }
                                                        className="checkbox checkbox-lg border-[#8E80FF] text-white checked:text-[#8E80FF] mr-1" 
                                                    /> 
                                                    {day === 'Mon' ? 'จันทร์' :
                                                    day === 'Tue' ? 'อังคาร' :
                                                    day === 'Wed' ? 'พุธ' :
                                                    day === 'Thu' ? 'พฤหัสบดี' :
                                                    day === 'Fri' ? 'ศุกร์' :
                                                    day === 'Sat' ? 'เสาร์' : 'อาทิตย์'}
                                                    </label>
                                                ))}
                                                </div>
                                      </div>
                                                  </div>
                                                  </>
                                                )}  
                                                {currentStep === 3 && (
                                                  <>
                                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                                      
                                                        <div className="flex items-center gap-2">
                                                          <div className="flex flex-col w-full">
                                                              <div className="flex items-center gap-2 text-[#8E80FF] font-bold pb-1">
                                                                อายุ 
                                                                <a className="text-xs">( ปี )</a>
                                                                <label className="label">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                name="age" 
                                                                                className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                                                checked={formData.min_age === 0 && formData.max_age === 0} 
                                                                                onChange={(e) => 
                                                                                      setFormData({ 
                                                                                        ...formData, 
                                                                                        min_age: e.target.checked ? 0 : '', 
                                                                                        max_age: e.target.checked ? 0 : '' 
                                                                                      })
                                                                                    }                                                        />
                                                                            <a className='text-xs'>ไม่จำกัดอายุ</a>
                                                                        </label>
                                                              </div>
                                                                  <input 
                                                                      type="number" 
                                                                      className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                      name="min_age"
                                                                      placeholder='ตั้งแต่'
                                                                      value={formData.min_age || ""}
                                                                      onChange={handleChange} 
                                                                      required/>
                                                          </div>
                                                          <div className="mt-5 text-[#8E80FF] font-bold">-</div>
                                                          <div className="flex flex-col w-full">
                                                              <div className="text-white font-bold">-</div>
                                                                  <input 
                                                                  type="number" 
                                                                  className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                  name="max_age"
                                                                  placeholder='ถึง'
                                                                  value={formData.max_age || ""}
                                                                  onChange={handleChange} 
                                                                  required/>
                                                          </div>
                    
                                                          <div className="flex flex-col w-full">
                                                              <div className="text-[#8E80FF] font-bold">เพศ</div>
                                                                  <select
                                                                      className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                                      value={formData.gender}
                                                                      onChange={(e) => setFormData({ ...formData, gender: e.target.value  })}
                                                                  >
                                                                      
                                                                        <option value="A">ไม่กำหนด</option>
                                                                        <option value="M">ชาย</option>
                                                                        <option value="F">หญิง</option>
                                                                          
                                                                  </select>
                                                          </div>
                                                          
                                                      </div>
                                                      
                                                          <div className="flex justify-between  mt-2">
                                                                <TooltipField 
                                                                  label="การศึกษา" 
                                                                  tooltip="เลือกวุฒิการศึกษาต่ำสุดที่ต้องการ"
                                                                ></TooltipField>
                                                            </div>
                                                                                
                                                            <select
                                                              name='education_code'
                                                              className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                              value={formData.education_code}
                                                              onChange={handleChange}
                                                          >
                                                              <option value="">-- กรุณาเลือกระดับการศึกษา --</option>
                                                              {Array.isArray(educationList) && educationList.map((ps) => (
                                                                  <option key={ps.edu_id} value={ps.edu_id}>
                                                                      {ps.edu_name}
                                                                  </option>
                                                                  ))}
                                                          </select>
                    
                                                        <div className="flex gap-2">
                                                          <div className="flex flex-col w-full">
                                                              <div className="text-[#8E80FF] font-bold">ประสบการณ์ <a className="text-xs">ตั้งแต่ ( ปี )</a></div>
                                                                  <input 
                                                                      type="number" 
                                                                      className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                      name="year_expe"
                                                                      value={formData.year_expe || 0}
                                                                      onChange={handleChange} 
                                                                      placeholder="ใส่จำนวนปีขั้นต่ำของประสบการณ์ที่ต้องการ"
                                                                      required/>
                                                          </div>
                                                      </div>
                                                      <div className="flex items-end gap-2 mt-2">
                                                                        <a className="text-[#8E80FF] font-bold">ประสบการณ์เพิ่มเติม</a>
                                                                        {/* <a className="text-[#A3A3A3] text-xs">รายละเอียดงาน</a> */}
                                                                    </div>
                                                                    <TiptapEditor
                                                                      value={formData.experience}
                                                                      onEditorChange={(content) => handleEditorChange("experience", content)}
                                                                    />                     
                                                                    
                                                      <div className="flex flex-col gap-2">
                                                        <TooltipField 
                                                          label="ทักษะด้านความรู้ที่จำเป็น" 
                                                          tooltip="เพิ่มรายการทักษะที่คุณต้องการ โดยกด + เพื่อเพิ่ม และกด - เพื่อลบทักษะ สามารถกรอกได้หลายรายการเพื่อช่วยในการจับคู่"
                                                        />
                    
                                                        {formData.selectedHs.map((skill, index) => (
                                                          <div key={index} className="flex gap-2 items-center">
                                                            <select
                                                              value={formData.selectedHs[index] || ""}
                                                              onChange={(e) => handleHsChange(index, e.target.value)}
                                                              className="select select-bordered bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box  w-full"
                                                            >
                                                              <option value="">เลือกทักษะด้านความรู้...</option>
                                                              {getHsAvailableOptions(index).map((s) => (
                                                                <option key={s.hardskill_id} value={s.hardskill_id}>
                                                                  {s.hardskill_name}
                                                                </option>
                                                              ))}
                                                            </select>
                    
                    
                                                            {index === 0 ? (
                                                              <button
                                                                type="button"
                                                                onClick={addHs}
                                                                className="btn btn-sm bg-green-500 text-white btn-outline w-8 rounded-xl"
                                                              >
                                                                +
                                                              </button>
                                                            ) : (
                                                              <button
                                                                type="button"
                                                                onClick={() => removeHs(index)}
                                                                className="btn btn-sm bg-red-500 text-white btn-outline w-8 rounded-xl"
                                                              >
                                                                -
                                                              </button>
                                                            )}
                                                          </div>
                                                        ))}
                                                      </div>  
                                                      <div className="flex flex-col gap-2">
                                                        <label className="font-bold text-[#7B6ADA]">ทักษะด้านอารมณ์ที่จำเป็น</label>
                    
                                                        {formData.selectedSs.map((skill, index) => (
                                                          <div key={index} className="flex gap-2 items-center">
                                                            <select
                                                              value={formData.selectedSs[index] || ""}
                                                              onChange={(e) => handleSsChange(index, e.target.value)}
                                                              className="select select-bordered bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box  w-full"
                                                            >
                                                              <option value="">เลือกทักษะด้านอารมณ์...</option>
                                                              {getSsAvailableOptions(index).map((s) => (
                                                                <option key={s.softskill_id} value={s.softskill_id}>
                                                                  {s.softskill_name}
                                                                </option>
                                                              ))}
                                                            </select>
                    
                    
                                                            {index === 0 ? (
                                                              <button
                                                                type="button"
                                                                onClick={addSs}
                                                                className="btn btn-sm bg-green-500 text-white btn-outline w-8 rounded-xl"
                                                              >
                                                                +
                                                              </button>
                                                            ) : (
                                                              <button
                                                                type="button"
                                                                onClick={() => removeSs(index)}
                                                                className="btn btn-sm bg-red-500 text-white btn-outline w-8 rounded-xl"
                                                              >
                                                                -
                                                              </button>
                                                            )}
                                                          </div>
                                                        ))}
                                                      </div>
                                                      <div className="flex justify-between  mt-2">
                                                                        <a className="text-[#8E80FF] font-bold">หมายเหตุคุณสมบัติ ส่วนนี้เพียงแสดงให้ผู้สมัครเห็นเท่านั้น ไม่มีผลกับการจับคู่</a>
                                                                    </div>
                                                                    <TiptapEditor
                                                                      value={formData.notes}
                                                                      onEditorChange={(content) => handleEditorChange("notes", content)}
                                                                    />                    
                                                                    
                                                      
                                                    </div>
                                                  </>
                                                )}
                                                {currentStep === 4 && (
                                                  <>
                                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                                      
                                                      <div className="flex justify-center gap-2  mt-2">
                                                                        
                                                                        <label className="label">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                name="address" 
                                                                                className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                                                checked={formData.owncontact === 1} 
                                                                                onChange={(e) => setFormData({ ...formData, owncontact: e.target.checked ? 1 : 0 })}
                                                                            />
                                                                            <a className='text-xs'>ใช้ข้อมูลติดต่อเดิม</a>
                                                                        </label>
                                                                    </div>
                                                                  <div className="flex flex-col gap-2 mt-2">
                                                                        <a className="text-[#8E80FF] font-bold">เบอร์โทรติดต่อ</a>
                                                                                <input 
                                                                                    type="text" 
                                                                                    className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                                    name="phone"
                                                                                    value={formData.phone || ""}
                                                                                    onChange={handleChange} 
                                                                                    required/>
                                                                        
                                                                    </div>                     
                                                                  <div className="flex flex-col gap-2 ">
                                                                        <a className="text-[#8E80FF] font-bold">อีเมล</a>
                                                                                <input 
                                                                                    type="email" 
                                                                                    className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                                    name="email"
                                                                                    value={formData.email || ""}
                                                                                    onChange={handleChange} 
                                                                                    required/>
                                                                        
                                                                    </div>
                                                      
                                                    </div>
                                                  </>
                                                )}
                                                
                    
                                                  <div className="flex w-full p-4 justify-center">
                                                      <hr className="w-1/2 border border-[#D9D9D9]" />
                                                  </div> 
                                                  <div className="flex justify-center gap-4">
                                                    <button
                                                      className="btn btn-sm md:btn-md w-20 bg-yellow-500 hover:bg-yellow-700 border border-yellow-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                                                    >
                                                      แก้ไข
                                                    </button>
                                                    
                                                  </div>
                                                  
                                              </div>
                                          </form>
                                          <div className="text-center">
                                            <button
                                              className="mt-2 btn btn-sm md:btn-md bg-gray-300 w-20 hover:bg-gray-400 border border-gray-300 text-black px-5 py-2 rounded-lg shadow-md transition-all"
                                              onClick={() => document.getElementById("edit_modal").close()}
                                            >
                                              ยกเลิก
                                            </button>
                                          </div>
                                    </div>
                                  </div>
                                  </div>
                  </div>
                </div>
                {loading && <LoadingOverlay />}
              </dialog>
              {/* Modal ข้อมูลไม่ครบ */}
                    <dialog id="incomplete_modal" className="modal">
                      <div className="modal-box bg-white">
                        <center>
                          <p className="text-2xl text-red-500 font-semibold">กรอกข้อมูลไม่ครบ</p>
                          <div className="w-20 h-20 my-4">
                            <AlertTriangle className="w-full h-full text-red-300" />
                            
                          </div>
                          <p className="text-gray-600">กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน</p>
                        </center>
                        <div className="modal-action flex justify-center">
                          <button
                            className="btn bg-red-500 text-white"
                            onClick={() => document.getElementById("incomplete_modal").close()}
                          >
                            ตกลง
                          </button>
                        </div>
                      </div>
                    </dialog>
            {/* Modal เซฟข้อมูล */}
            <dialog id="save_modal" className="modal">
            <div className="modal-box bg-white">
                <center>
                    <p className="text-4xl  text-[#8E80FF]">ยืนยันการลงประกาศงาน</p>
                <div className="w-30 h-30 flex items-center justify-center my-6">
                    {/* <AlertTriangle className="w-full h-full text-[#8E80FF]" /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8E80FF" className="size-25">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                </div>
                </center>   
                <div className="modal-action flex justify-center gap-4">
                  
                  <button 
                    type="button"
                    className="btn border border-gray-400 text-gray-600 px-4 py-2 rounded-lg bg-white"
                    onClick={() => document.getElementById("save_modal").close()}
                  >
                    ยกเลิก
                  </button>

                  <button 
                    type="button"
                    className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg"
                    onClick={() => {
                      handleUpdate(); 
                    }}
                  >
                    ยืนยัน
                  </button>
                </div>
            </div>
            </dialog>
            {/* Modal บันทึกสำเร็จ */}
            <dialog id="success_modal" className="modal">
              <div className="modal-box bg-white">
                <center>
                  <p className="text-2xl text-[#8E80FF]">บันทึกสำเร็จ!</p>
                  <div className="w-20 h-20 my-4">
                    <img src="/check.png" className="rounded-full" />
                  </div>
                </center>
                <div className="modal-action flex justify-center">
                  <button className="btn bg-[#8E80FF] text-white" 
                    onClick={() => {
                      setShowWork(1);
                      document.getElementById("section1")?.scrollIntoView({ behavior: "smooth" });
                      document.getElementById("edit_modal").close();
                      document.getElementById("success_modal").close();
                    }}>
                    ไปที่รายละเอียดงาน
                  </button>
                </div>
              </div>
            </dialog>    
      {/* Modal สำหรับแสดงรายละเอียด */}
        <dialog id="show_modal" className="modal">
          <div className="indicator max-w-6xl w-full">{status === "accepted" ? (
                                                                        <span 
                                                                          style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                          className="mr-3 indicator-item  border border-green-500 bg-green-500 text-2xl text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-5"
                                                                        >
                                                                          รับแล้ว
                                                                        </span>
                                                                      ): status === "rejected" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-7 indicator-item border border-red-500 bg-red-500 text-2xl text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-5"
                                                                          >
                                                                            ปฏิเสธไปแล้ว
                                                                          </span>
                                                                      ): status === "waitjobber" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-10 indicator-item border border-sky-500 bg-sky-500 text-2xl text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-5"
                                                                          >
                                                                            รอผู้สมัครยืนยัน
                                                                          </span>
                                                                      ): status === "expired" ?(
                                                                          <span 
                                                                            style={{ boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                                                                            className="mr-10 indicator-item border border-gray-400 bg-gray-400 text-2xl text-white rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-4xl p-5"
                                                                          >
                                                                            แจ้งไปแล้วแต่ไม่มีการตอบกลับ
                                                                          </span>
                                                                      ): (
                                                                          <></>
                                                                      )}
            <div className="modal-box bg-white rounded-2xl shadow-xl max-w-6xl w-full">
            
              <div className="flex flex-col justify-center items-center mb-4 w-full">
                {selectedJobberId ? (
                  <JobberProfile jobberId={selectedJobberId} />
                ) : (
                  <p className="text-[#8E80FF] text-center">กำลังโหลด...</p>
                )}
                {message && (
                  <>
                    <div className="flex flex-col text-[#8E80FF] items-center">
                      <p className="text-sm font-bold">ข้อความที่ส่งไปให้ผู้สมัคร</p>
                      <div
                          className="prose prose-sm md:prose lg:prose-lg rounded-xl p-5" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                          dangerouslySetInnerHTML={{ __html: message }}
                        ></div>
                    </div>
                  </>
                )}
                {(status === "expired") && (
                  <>
                    <div className="flex flex-col text-red-500 items-center">
                      <p className="text-sm font-bold">
                        หมดเวลาในการตอบรับของผู้สมัครนี้แล้ว ถือเป็นการปฏิเสธโดยอัตโนมัติ
                      </p>
                      
                    </div>
                  </>
                )}
                {(status === "rejected") && (
                  <>
                    <div className="flex flex-col text-red-500 items-center">
                      <p className="text-sm font-bold">
                        มีการปฏิเสธไปแล้ว ไม่สามารถเลือกผู้สมัครนี้ได้อีก
                      </p>
                      
                    </div>
                  </>
                )}
              </div>
            
              <div className="modal-action flex justify-center gap-4">
                {status === "waitemp" && (
                  <>
                    <button
                      className="btn btn-sm md:btn-md bg-green-500 hover:bg-green-700 border border-green-600 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                      onClick={() => {
                        // เปิด modal เลือก
                        document.getElementById("choose_modal").showModal();
                      }}
                    >
                      เลือก
                    </button>
                    <button
                      className="btn btn-sm md:btn-md bg-red-500 hover:bg-red-500 border border-red-300 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                      onClick={() => {
                        // เปิด modal ปฏิเสธ
                        document.getElementById("reject_modal").showModal();
                      }}
                    >
                      ปฏิเสธ
                    </button>
                  </>
                )}
                {(status === "waitjobber") && (
                  <>
                    
                    <button
                      className="btn btn-xs sm:btn-sm lg:btn-lg border border-red-500 bg-red-500 text-white hover:border-red-500 hover:bg-white hover:!text-red-500 rounded-lg transition "
                      onClick={() => {
                        // เปิด modal ปฏิเสธ
                        document.getElementById("cancelchoose_modal").showModal();
                      }}
                    >
                      ยกเลิกการเลือก
                    </button>
                  </>
                )}
                
                <button
                  className="btn btn-sm md:btn-md bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-5 py-2 rounded-lg shadow-md transition-all"
                  onClick={() => document.getElementById("show_modal").close()}
                >
                  ปิด
                </button>
              </div>

            </div>
          </div>
        </dialog> 
        {/* Modal เลือกผู้สมัครพร้อมส่งข้อความ */}
                        <dialog id="choose_modal" className="modal">
                          <div className="modal-box bg-white max-w-5xl w-full">
                            <div className="flex flex-col items-center">
                              <p className="text-4xl font-bold text-[#8E80FF]">ส่งข้อความถึงผู้สมัคร</p>
                              
                              <div className="w-full flex flex-col items-center justify-center my-6">
                                <TiptapEditor
                                  value={message}
                                  onEditorChange={(content) => setMessage(content)}
                                />                                 
                                
                                
                              </div>
                            </div>   
                            <p className="text-lg text-[#8E80FF] text-center">
                                โปรดตรวจสอบข้อความของคุณให้เรียบร้อยก่อนกดยืนยัน
                                เนื่องจากหลังจากยืนยันแล้วจะไม่สามารถแก้ไขหข้อความได้
                              </p>
                            <div className="modal-action flex justify-center gap-4">
                              <button 
                                type="button"
                                className={`btn px-4 py-2 rounded-lg bg-green-500 border border-green-500 text-white`}
                                disabled={message === ""} // disable ถ้าไม่ตรง
                                onClick={() => document.getElementById("conchoose_modal").showModal()}
                              >
                                ยืนยัน
                              </button>
                
                              <button 
                                type="button"
                                className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                                onClick={() => document.getElementById("choose_modal").close()}
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        </dialog>
                {/* Modal คอนการเลือก */}
                            <dialog id="conchoose_modal" className="modal">
                            <div className="modal-box bg-white">
                                <center>
                                    <p className="text-2xl font-bold text-green-500 p-5">ยืนยันที่จะส่งข้อความให้ผู้สมัครที่คุณเลือก</p>
                                
                                    <div className="flex flex-col w-full">
                                        {/* <p className="text-[#8E80FF] ">ยืนยันการเลือกผู้สมัคร</p> */}
                                        <input 
                                          type='text'
                                          className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                          name="confirm"
                                          placeholder='พิมพ์คำว่า ยืนยัน เพื่อเลือกผู้สมัครคนนี้'
                                          value={confirm}
                                          onChange={(e) => setConfirm(e.target.value)}
                                          required
                                        />
                                      </div>
                                
                                </center>   
                                <div className="modal-action flex justify-center gap-4">
                                  {selectedJobberId}
                                  <button 
                                type="button"
                                className={`btn px-4 py-2 rounded-lg ${confirm === "ยืนยัน" ? "bg-green-500 border border-green-500 text-white" : "bg-gray-300 border border-gray-300 text-black cursor-not-allowed"}`}
                                disabled={confirm !== "ยืนยัน"} // disable ถ้าไม่ตรง
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    // const expireDate = new Date();
                                    // expireDate.setDate(expireDate.getDate() + 3); 
                                    // const expireDateString = expireDate.toISOString();
                
                                    const res = await fetch(`${apiUrl}/api/send_message`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        post_id: id,
                                        jobber_id: selectedJobberId,
                                        message: message,
                                        type: "j",
                                        status: "waitjobber"
                                      })
                                    });
                
                                    const data = await res.json();
                                    if (data.success) {
                                      // alert("ส่งข้อความสำเร็จ!");
                                      setMessage("");
                                      setSelectedJobberId(null);
                                      setConfirm("");
        
                                      navigate(`/Emp_Job_Post?pi=${id}`);
                                      document.getElementById("show_modal").close();
                                      document.getElementById("conchoose_modal").close();
                                      document.getElementById("choose_modal").close();
                                      
                                      
                                    } else {
                                      // alert("เกิดข้อผิดพลาด: " + data.error);
                                    }
                                  } catch (error) {
                                    console.error("Error:", error);
                                    // alert("ส่งไม่สำเร็จ");
                                  } finally {
                                    setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                  }
                                }}
                              >
                                ยืนยัน
                              </button>
                
                                  <button 
                                    type="button"
                                    className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                                    onClick={() => {
                                      document.getElementById("conchoose_modal").close()
                                    }}
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                            </div>
                            {loading && <LoadingOverlay />}
                            </dialog>
                        {/* Modal ปฏิเสธ */}
                            <dialog id="reject_modal" className="modal">
                            <div className="modal-box bg-white">
                                <center>
                                    <p className="text-3xl font-bold text-red-500 p-5">ยืนยันที่จะปฏิเสธผู้สมัครคนนี้</p>
                                
                                    <div className="flex flex-col w-full">
                                        {/* <p className="text-[#8E80FF] ">ยืนยันการเลือกผู้สมัคร</p> */}
                                        <input 
                                          type='text'
                                          className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                          name="confirm"
                                          placeholder='พิมพ์คำว่า ยืนยัน เพื่อปฏิเสธผู้สมัครคนนี้'
                                          value={confirm}
                                          onChange={(e) => setConfirm(e.target.value)}
                                          required
                                        />
                                      </div>
                                    <p className="text-3xl font-bold text-red-500 p-5">หลังจากปฏิเสธผู้สมัครคนนี้ไปแล้ว จะไม่สามารถกลับมาเลือกได้ใหม่</p>

                                </center>   
                                <div className="modal-action flex justify-center gap-4">
                                  {/* {selectedJobberId} */}
                                  <button 
                                    type="button"
                                    className={`btn px-4 py-2 rounded-lg ${confirm === "ยืนยัน" ? "bg-red-500 border border-red-500 text-white" : "bg-gray-300 border border-gray-300 text-black cursor-not-allowed"}`}
                                    disabled={confirm !== "ยืนยัน"}
                                    onClick={async () => {
                                       try {
                                        setLoading(true);
                                        const res = await fetch(`${apiUrl}/api/send_message`, {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json"
                                          },
                                          body: JSON.stringify({
                                            post_id: id,
                                            jobber_id: selectedJobberId,
                                            status: "rejected"
                                          })
                                        });
                
                                        const data = await res.json();
                                        if (data.success) {
                                          // alert("ปฏิเสธสำเร็จ!");
                                          setSelectedJobberId(null);
        
                                          navigate(`/Emp_Job_Post?pi=${id}`);
        
                                          document.getElementById("reject_modal").close();
                                          document.getElementById("show_modal").close();
                                          
                                        } else {
                                          // alert("เกิดข้อผิดพลาด: " + data.error);
                                        }
                                      } catch (error) {
                                        console.error("Error:", error);
                                        // alert("ส่งไม่สำเร็จ");
                                      }  finally {
                                        setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                      }
                                    }}
                                  >
                                    ยืนยัน
                                  </button>
                
                                  <button 
                                    type="button"
                                    className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                                    onClick={() => {
                                      document.getElementById("reject_modal").close()
                                    }}
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                            </div>
                            {loading && <LoadingOverlay />}
                            </dialog>
        
               {/* Modal ยกเลิกการเลือก */} 
               {/* ทำตรงนี้ต่อ ทำปุ่มให้ยกเลิก ดึงข้อความมาใส่ แก้ไขข้อความไม่ได้ ใให้ยกเลิกเอา ทำเอพีไอยกเลิกดวยแจ้งเตือนด้วย */}
                            <dialog id="cancelchoose_modal" className="modal">
                            <div className="modal-box bg-white">
                                <center>
                                    <p className="text-3xl font-bold text-red-500 p-5">ต้องการยกเลิกการเลือกหรือไม่?</p>
                                
                                    <div className="flex flex-col items-center  w-full">
                                        <p className="text-[#8E80FF] ">ข้อความที่คุณเคยส่งให้ผู้สมัคร</p>
                                        <div
                                          className="prose prose-sm md:prose lg:prose-lg rounded-xl p-4 text-[#8E80FF]" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                                          dangerouslySetInnerHTML={{ __html: message }}
                                        ></div>
                                      </div>
                                
                                </center>   
                                <div className="modal-action flex justify-center gap-4">
                                  {selectedJobberId}
                                  <button 
                                    type="button"
                                    className={`btn px-4 py-2 rounded-lg bg-red-500 border border-red-500 text-white`}
                                    onClick={() => {
                                      document.getElementById("concon_modal").showModal()
                                    }}
                                  >
                                    ยืนยัน
                                  </button>
                
                                  <button 
                                    type="button"
                                    className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                                    onClick={() => {
                                      document.getElementById("cancelchoose_modal").close()
                                    }}
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                            </div>
                            </dialog>
                          <dialog id="concon_modal" className="modal">
                            <div className="modal-box bg-white">
                                <center>
                                    <p className="text-3xl font-bold text-red-500 p-5">ยืนยันการยกเลิกการเลือกหรือไม่?</p>
                                
                                </center>   
                                <div className="modal-action flex justify-center gap-4">
                                  {selectedJobberId}
                                  <button 
                                    type="button"
                                    className={`btn px-4 py-2 rounded-lg bg-green-500 border border-green-500 text-white`}
                                    onClick={async () => {
                                       try {
                                        setLoading(true);
                                        const res = await fetch(`${apiUrl}/api/send_message`, {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json"
                                          },
                                          body: JSON.stringify({
                                            post_id: id,
                                            jobber_id: selectedJobberId,
                                            status: "waitemp"
                                          })
                                        });
                
                                        const data = await res.json();
                                        if (data.success) {
                                          // alert("ยกเลิกการเลือก!");
                                          setSelectedJobberId(null);
                                          setMessage("");
                                          setConfirm("");
                                          navigate(`/Emp_Job_Post?pi=${id}`);
                                          document.getElementById("show_modal").close();
                                          document.getElementById("concon_modal").close();
                                          document.getElementById("choose_modal").close();
                                          document.getElementById("cancelchoose_modal").close();
                                          
                                        } else {
                                          // alert("เกิดข้อผิดพลาด: " + data.error);
                                        }
                                      } catch (error) {
                                        console.error("Error:", error);
                                        // alert("ส่งไม่สำเร็จ");
                                      } finally {
                                      setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือไม่
                                    }
                                    }}
                                  >
                                    ยืนยัน
                                    
                                  </button>
                
                                  <button 
                                    type="button"
                                    className="btn bg-gray-300 hover:bg-gray-400 border border-gray-300 text-black px-4 py-2 rounded-lg"
                                    onClick={() => {
                                      document.getElementById("concon_modal").close()
                                    }}
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                            </div>
                            {loading && <LoadingOverlay />}
                            </dialog>                     
      {/* Loading Spinner Overlay */}
      
    </div>
  );
}

export default Emp_Job_Post