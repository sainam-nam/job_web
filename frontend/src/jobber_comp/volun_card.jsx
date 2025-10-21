import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function VolunCard({ post , jobber_id }) {

  const [hasMatch, setHasMatch] = useState(false);
  const [tempVolunData, setTempVolunData] = useState(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!post?.post_id || !jobber_id) return;

    const fetchTempVolun = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/api/tempvolun/check?post_id=${post.post_id}&jobber_id=${jobber_id}`
        );
        setHasMatch(res.data?.exists === true);
        setTempVolunData(res.data?.data ?? null);
      } catch (err) {
        console.error("Error checking tempWork:", err);
      }
    };

    fetchTempVolun();
  }, [post?.post_id, jobber_id]);


  // console.log("hasMatch มั้ยอะ เอามา",hasMatch);
  console.log("tempvolun มาๆ",tempVolunData?.matching);

  const matchingCount = tempVolunData?.matching ? tempVolunData?.matching.split("").filter(ch => ch === "1").length : 0;

  const hsCount = tempVolunData?.hs ? tempVolunData?.hs.split(",").filter(id => id.trim() !== "").length : 0;
  const ssCount = tempVolunData?.ss ? tempVolunData?.ss.split(",").filter(id => id.trim() !== "").length : 0;

  const totalMatch = matchingCount + hsCount + ssCount;
  const matchPercent = Math.round((totalMatch / tempVolunData?.hd) * 100);

  const navigate = useNavigate();
  const goToProfile = (val) => {
    navigate(`/Volun_Post_de?pi=${val}`);
    window.scrollTo(0,0);
  };

  const goTojob_match = (val, inter ,posi ,matchPercent) => {
    navigate(`/volun_match?i=${val}&inter_volun=${inter}&posi=${posi}&percent=${matchPercent}`,
      {state: { from: location.pathname }});
    window.scrollTo(0,0);
  }; 

  function formatDateToThaiShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
    const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

    return `${day}/${month}/${year}`;
  }



  return (
    
      <div key={post.post_id} className="card card-xs bg-white w-full shadow-lg rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <figure >
                    {post.volun_pic ? (
                          <img src={`/uploads/emp_pic/${post.volun_pic}`}  className="w-full h-30 lg:h-60 object-cover" />
                        ) : (
                          <img src={`/uploads/nopic.png`}  className="w-full h-30 lg:h-60 object-cover" />
                        )}
                </figure>
                <div className="card-body justify-between">
                  <a className="card-title text-xs lg:text-lg text-[#7B6ADA] lg:pl-2">{post.activity_name}</a>
                  <a className="card-title text-xs text-[#7B6ADA] lg:pl-2">ประเภท {post.voluntype_name}</a>
                  <div className="flex gap-2">
                    {post.picture ? (
                                  <img src={`/uploads/emp_pic/${post.picture}`}  className="w-8 h-8 object-cover rounded-full" />
                                ) : (
                                  <img src={`/uploads/nopic.png`}  className="w-8 h-8 object-cover rounded-full" />
                                )}
                    <a className="card-title text-[10px] lg:text-sm text-black lg:pl-2">{post.fullname}</a>
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" className="lg:mt-1.5" /><a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">วัน {post.date_start && formatDateToThaiShort(post.date_start)} {post.date_end && '-'+formatDateToThaiShort(post.date_end)} </a>
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" className="lg:mt-1.5" /><a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">เวลา {post.time} </a>
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" className="lg:mt-1.5" /><a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">ต.{post.tb} อ.{post.ap} จ.{post.jw}</a>
                  </div>
                  
                  <div className="card-actions justify-center px-20">
                    {hasMatch && tempVolunData.status === "MATCHED" ? (
                        // <div className="indicator">
                        //   <span  className="indicator-item text-sm bg-green-500 rounded-xl p-2 ">
                        //     จับคู่แล้ว
                        //   </span>
                          <button 
                            onClick={() => goTojob_match(
                              post.post_id,
                              tempVolunData?.inter_volun_id,
                              post.volunteer_code,
                              matchPercent
                            )}
                            className="btn btn-xs sm:btn-sm lg:btn-lg bg-green-700 border-green-700 rounded-xl"
                          >รายละเอียดการจับคู่</button>
                        // </div>
                      ) : (
                        <button 
                          onClick={() => goToProfile(post.post_id)}
                          className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#8E80FF] border-[#8E80FF] rounded-xl"
                        >รายละเอียด</button>
                      )}
                  </div>
                </div>
              </div>
    
  );
}
