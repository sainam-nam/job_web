import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const jobber_id = localStorage.getItem("jobber_id");
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const CheckProfileStatus = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/profile_check_all?jobber_id=${jobber_id}`)
      .then((res) => {
        const code = res.data.code;

        if (code[0] === "0") navigate("/profile/info/edit");
        else if (code[1] === "0") navigate("/profile/edu/edit");
        else if (code[2] === "0") navigate("/profile/work_ex/edit");
        else if (code[3] === "0") navigate("/profile/inter_work/edit");
        else if (code[4] === "0") navigate("/profile/inter_volun/edit");
        else navigate("/profile/info/view");
      })
      .catch((err) => {
        console.error("Error checking profile", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-center mt-10 text-lg">กำลังโหลดข้อมูล...</p>;
  return null;
};

export default CheckProfileStatus;
