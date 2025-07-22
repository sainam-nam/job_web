import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";

export default function VolunCard({ post }) {
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
                          <img src={`/uploads/${post.volun_pic}`}  className="w-full h-30 lg:h-45" />
                        ) : (
                          <img src={`/uploads/nopic.png`}  className="w-full h-30 lg:h-45" />
                        )}
                </figure>
                <div className="card-body justify-between">
                  <a className="card-title text-xs lg:text-lg text-[#7B6ADA] lg:pl-2">{post.activity_name}</a>
                  <a className="card-title text-[10px] lg:text-sm text-black lg:pl-2">{post.fullname}</a>
                  {/* <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} filled={i <= 3} />
                    ))}
                  </div> */}
                  <div className="flex justify-center px-7">
                  <EmpRating emp_id={post.emp_id} cl="#7B6ADA" />
                    
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" className="lg:mt-1.5" /><a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">ต.{post.tb} อ.{post.ap} จ.{post.jw}</a>
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" className="lg:mt-1.5" /><a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">วัน เวลา {post.date ? formatDateToThaiShort(post.date) : 'ไม่มีวันที่'} {post.time} </a>
                  </div>
                  <div className="card-actions justify-center px-20">
                    <button 
                      
                      className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#7B6ADA] border-[#7B6ADA] rounded-lg"
                    >รายละเอียด</button>
                  </div>
                </div>
              </div>
    
  );
}
