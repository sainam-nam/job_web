import { FaCircle } from "react-icons/fa";
import EmpRating from "../comp/emp_star";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";



export default function EmpCard({ emp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const goToProfile = (val) => {
    navigate(`/viewEmp_Pf?emp_id=${val}`, {
    state: {
      fromStack: [...(location.state?.fromStack || []), location.pathname + location.search],
    }
  });
    window.scrollTo(0,0);
  };
  return (
    
      <div key={emp.emp_id} className="card card-xs bg-white w-80 shadow-lg rounded-2xl lg:rounded-3xl py-2" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                
                <div className="card-body">
                  <a className="flex justify-center font-bold text-xs md:text-sm lg:text-lg text-[#8E80FF]">{emp.fullname}</a>
                  <figure className="w-full p-0 m-0">
                    
                      {emp.picture ? (
                          <img src={`/uploads/emp_pic/${emp.picture}`}  className="w-full rounded-3xl  h-60 object-cover" />
                        ) : (
                          <img src={`/uploads/nophoto.png`}  className="w-full rounded-3xl  h-60 object-cover" />
                        )}
                  </figure>
                  
                  <div className="flex justify-center lg:py-4">
                    <EmpRating emp_id={emp.emp_id} cl="#8E80FF" />
                  </div>
                  
                  <div className="card-actions justify-center  px-15">
                    <button 
                      onClick={() => goToProfile(emp.emp_id)}
                      className="btn btn-xs sm:btn-sm lg:btn-lg bg-[#8E80FF] border-[#8E80FF] rounded-lg"
                    >เยี่ยมชม</button>
                  </div>
                </div>
              </div>
    
  );
}
