import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function One_volunCard({ post , jobber_id }) {
  const navigate = useNavigate();
  const [hasMatch, setHasMatch] = useState(false);
  const [tempVolunData, setTempVolunData] = useState(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;


  // console.log("post_id มายัง",post.post_id);
  // console.log("jobber_id มายัง",jobber_id);

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


  const goToProfile = (val) => {
    navigate(`/Volun_Post_de?pi=${val}`);
    window.scrollTo(0,0);
  };

  const goTojob_match = (val, inter ,posi ,matchPercent) => {
    navigate(`/volun_match?i=${val}&inter_volun=${inter}&posi=${posi}&percent=${matchPercent}`,
      {state: { from: location.pathname }});
    window.scrollTo(0,0);
  };

  return (
    <>

        <div key={post.post_id} className="card card-xs bg-white w-95 h-120 shadow-lg rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                  <figure>
                      {post.volun_pic ? (
                            <img src={`/uploads/emp_pic/${post.volun_pic}`}  className="w-full h-30 lg:h-50 object-cover" />
                          ) : (
                            <img src={`/uploads/nopic.png`}  className="w-full h-30 lg:h-50 object-cover" />
                          )}
                  </figure>
                  <div className="card-body justify-between">
                    <a className="card-title text-xs lg:text-lg text-[#8E80FF] lg:pl-2">{post.activity_name}</a>
                    <a className="card-title text-xs text-[#8E80FF] lg:pl-2">{post.voluntype_name}</a>
                    {/* <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} filled={i <= 3} />
                      ))}
                    </div> */}
                      <div className="flex gap-2">
                        {post.picture ? (
                                <img src={`/uploads/emp_pic/${post.picture}`}  className="w-8 h-8 object-cover rounded-full" />
                              ) : (
                                <img src={`/uploads/nopic.png`}  className="w-8 h-8 object-cover rounded-full" />
                              )}
                        <a className="card-title text-[10px] text-black">{post.fullname}</a>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <a className="p-2 text-[10px] lg:text-sm text-white font-bold bg-[#8E80FF]  rounded-2xl">
                          รับทั้งหมด {post.num_position}
                          </a>
                        <a className="p-2 text-[10px] lg:text-sm text-white font-bold bg-green-700  rounded-2xl">
                          รับไปแล้ว {post.accepted_count}
                          </a>  
                      </div>
                      
                      
                    <div className="flex gap-1 ml-2">
                      <FaCircle color="#D9D9D9" className="lg:mt-1.5" /><a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">ต.{post.tb} อ.{post.ap} จ.{post.jw}</a>
                    </div>
                    {/* {hasMatch} */}
                    
                    
                    <div className="card-actions justify-center px-20 mt-3">
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

    </>
  );
}
