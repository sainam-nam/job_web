import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";

export default function JobCard({ post }) {
  return (
    
      <div key={post.post_id} className="card card-xs bg-white w-45 md:w-52 lg:w-55 xl:w-70 shadow-lg rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                <figure >
                  <img
                    src="/gray.png" className="w-full h-50" />
                </figure>
                <div className="card-body justify-between">
                  <a className="card-title text-xs text-[#7B6ADA]">{post.position_name}</a>
                  <a className="card-title text-[10px] text-black">{post.fullname}</a>
                  {/* <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} filled={i <= 3} />
                    ))}
                  </div> */}
                  <div className="flex justify-center">
                  <EmpRating emp_id={post.emp_id} cl="#7B6ADA" />
                    
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" /><a className="card-title text-[10px] text-black">ต.{post.tb} อ.{post.ap} จ.{post.jw}</a>
                  </div>
                  <div className="flex gap-1">
                    <FaCircle color="#D9D9D9" /><a className="card-title text-[10px] text-black">{post.salary} บาท/เดือน</a>
                  </div>
                  <div className="card-actions justify-center">
                    <button 
                      
                      className="btn btn-xs bg-[#7B6ADA] border-[#7B6ADA] rounded-lg"
                    >รายละเอียด</button>
                  </div>
                </div>
              </div>
    
  );
}
