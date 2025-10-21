import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";
import { useNavigate } from "react-router-dom";
import { useState , useEffect } from "react";

export default function VolunCard({ post }) {
  const navigate = useNavigate();

  const goToProfile = (val) => {
    navigate(`/Emp_Volun_Post?pi=${val}`);
    window.scrollTo(0,0);
  };

  

  // ก่อน return JSX คำนวณตัวเลขรวมก่อน
  const many = [
    post.matched_count,
    post.waitemp_count,
    post.accepted_count,
    post.fav_count,
    post.waitjobber_count,
    (post.rejected_count || 0) + (post.jb_rejected_count || 0) + (post.expired_count || 0)
  ];

  // นับเฉพาะที่ไม่เป็น 0/undefined/null
  const manyCount = many.filter(m => m && m !== 0).length;


  return (
    
      <div key={post.post_id} className="card card-xs bg-white w-80 shadow-lg rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <figure >
                    {post.volun_pic ? (
                          <img src={`/uploads/emp_pic/${post.volun_pic}`}  className="w-full h-30 lg:h-40 object-cover" />
                        ) : (
                          <img src={`/uploads/nopic.png`}  className="w-full h-30 lg:h-40 object-cover" />
                        )}
                </figure>
                <div className="card-body justify-between">
                  <a className="card-title text-xs lg:text-lg text-[#8E80FF] lg:pl-2">{post.activity_name}</a>
                  <a className="card-title text-xs text-[#8E80FF] lg:pl-2">ประเภท {post.voluntype_name}</a>
                  <a className="text-center text-[10px] lg:text-sm text-white  p-3 bg-[#8E80FF] rounded-2xl">
                    รับทั้งหมด : {post.num_position}
                  </a>
                  {manyCount === 0 && (
                    
                      <a className="text-[10px] lg:text-sm text-black p-3 bg-gray-200 rounded-2xl">
                        ยังไม่มีผู้สมัคร
                      </a>
                      
                    )}
                  {manyCount >= 1 && (
                    <div className="grid grid-cols-3 gap-1 ml-2 ">
                          {/* gray, red, orange, 
                          amber, yellow, lime, green, 
                          emerald, teal, cyan, sky, blue, 
                          indigo, violet, purple, fuchsia, pink, rose */}
                      
                      {post.matched_count ? (
                        <a className=" text-[10px] lg:text-sm text-black p-3 bg-green-200 rounded-2xl">
                          จับคู่ได้ : {post.matched_count}
                        </a>
                      ) : null}
                      {post.fav_count ? (
                        <a className=" text-[10px] lg:text-sm text-black p-3 bg-rose-200 rounded-2xl">
                          มีคนสนใจ : {post.fav_count}
                        </a>
                      ) : null}
                      {post.waitemp_count ? (
                        <a className=" text-[10px] lg:text-sm text-black p-3 bg-green-300 rounded-2xl">
                          สมัครเข้ามา : {post.waitemp_count}
                        </a>
                      ) : null}  
                      {post.accepted_count ? (
                        <a className=" text-[10px] lg:text-sm text-white p-3 bg-green-700 rounded-2xl">
                          รับไปแล้ว : {post.accepted_count}
                        </a>
                      ) : null}
                      {post.waitjobber_count ? (
                        <a className=" text-[10px] lg:text-sm text-black p-3 bg-sky-200 rounded-2xl">
                          รอตอบกลับ : {post.waitjobber_count}
                        </a>
                      ) : null}
                      {post.rejected_count || post.jb_rejected_count || post.expired_count ? (
                        <a className=" text-[10px] lg:text-sm text-black p-3 bg-green-200 rounded-2xl">
                          ปฏิเสธ : {post.rejected_count + post.jb_rejected_count + post.expired_count}
                        </a>
                      ) : null}
                      
                      
                    </div>
                  )}
                  {/* {manyCount < 4 && (
                    <div className="flex gap-1 ml-2 my-4">
                      <FaCircle color="#D9D9D9" className="lg:mt-1.5" />
                      <a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">
                        {(() => {
                          const salaryStr = post.salary || '';
                          if (!salaryStr || salaryStr === '0') return 'ไม่ระบุค่าตอบแทน';

                          const [min, max] = salaryStr.split('-').map(s => Number(s));
                          if ((min || 0) === 0 && (max || 0) === 0) return 'ไม่ระบุ';
                          if ((min || 0) === 0) return `${max.toLocaleString()} บาท`;
                          if ((max || 0) === 0) return `${min.toLocaleString()} บาท`;
                          if (min === max) return `${min.toLocaleString()} บาท`;
                          return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
                        })()}
                      </a>
                    </div>
                  )} */}

                  <div className="card-actions justify-center px-20">
                    <button 
                      onClick={() => goToProfile(post.post_id)}
                      className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#8E80FF] border-[#8E80FF] rounded-lg"
                    >รายละเอียด</button>
                  </div>
                </div>
              </div>
    
  );
}
