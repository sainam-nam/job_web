import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const emp_id = localStorage.getItem("emp_id");
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const Emp_CheckProfileStatus = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/emp_profile_check_all?emp_id=${emp_id}`)
      .then((res) => {
        const code = res.data.code;

        if (code[0] === "0") navigate("/emp_profile/info/edit");
        else if (code[1] === "0") navigate("/emp_profile/work/edit");
        else if (code[2] === "0") navigate("/emp_profile/volun/edit");
        else navigate("/emp_profile/info/view");
      })
      .catch((err) => {
        console.error("Error checking profile", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-center mt-10 text-lg">กำลังโหลดข้อมูล...</p>;
  return null;
};

export default Emp_CheckProfileStatus;
