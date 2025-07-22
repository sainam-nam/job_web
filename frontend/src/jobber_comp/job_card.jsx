import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";

export default function JobCard({ post }) {
  return (
    
      <div key={post.post_id} className="card card-xs bg-white w-full shadow-lg rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <figure >
                    {post.job_pic ? (
                          <img src={`/uploads/${post.job_pic}`}  className="w-full h-30 lg:h-45" />
                        ) : (
                          <img src={`/uploads/nopic.png`}  className="w-full h-30 lg:h-45" />
                        )}
                </figure>
                <div className="card-body justify-between">
                  <a className="card-title text-xs lg:text-lg text-[#7B6ADA] lg:pl-2">{post.position_name}</a>
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
                    <FaCircle color="#D9D9D9" className="lg:mt-1.5" /><a className="card-title lg:pl-2 text-[10px] lg:text-sm text-black">{post.salary} บาท/เดือน</a>
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
