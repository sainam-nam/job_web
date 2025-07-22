import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";

export default function EmpCard({ emp }) {
  return (
    
      <div key={emp.emp_id} className="card card-xs bg-white w-full shadow-lg rounded-2xl lg:rounded-3xl py-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                
                <div className="card-body">
                  <a className="flex justify-center font-bold text-xs md:text-sm lg:text-lg text-[#7B6ADA]">{emp.fullname}</a>
                  <figure className="w-full p-0 m-0">
                    
                      {emp.picture ? (
                          <img src={`/uploads/${emp.picture}`}  className="w-full rounded-3xl object-cover block" />
                        ) : (
                          <img src={`/uploads/nophoto.png`}  className="w-full rounded-3xl object-cover block" />
                        )}
                  </figure>
                  
                  <div className="flex justify-center lg:py-4">
                    <EmpRating emp_id={emp.emp_id} cl="#7B6ADA" />
                  </div>
                  
                  <div className="card-actions justify-center  px-15">
                    <button 
                      
                      className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#7B6ADA] border-[#7B6ADA] rounded-lg"
                    >เยี่ยมชม</button>
                  </div>
                </div>
              </div>
    
  );
}
