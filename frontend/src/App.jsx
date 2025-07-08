import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login";
import Admin from "./admin";
import User from "./jobber_pages/user";
import Register from "./register";
import ForgetPassword from "./forget_pass";
import Login_em from "./login_em";
import Dashboard from "./comp/dashb";
import HS from "./comp/hs";
import SS from "./comp/ss";
import JobType from "./comp/jobtype";
import Dashboardvolun from "./comp/dashbvolun";
import VolunType from "./comp/voluntype";
import Position from "./comp/position";
import Jobber from "./comp/jobber";
import Jobber_Pf from "./comp/Jobber_Pf";
import Employer from "./comp/employer";
import Job from "./comp/job";
import Volunteer from "./comp/volunteer";
import Index from "./index";
import Volun_Post from "./comp/volun_post";
import Job_Post from "./comp/job_post";
import Emp_Pf from "./comp/Emp_Pf";
import ResetPassword from "./ResetPassword";
import JobsByjobtype from "./jobber_pages/jobbyjobtype";
import AllJobs from "./jobber_pages/all_job";
import AllVoluns from "./jobber_pages/all_volun";


function App() {
    return (
        <BrowserRouter>
            
            <Routes>
                <Route path="" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login_em" element={<Login_em />} />
                
                <Route path="/Admin" element={<Admin />}>
                    <Route index element={<Dashboard />} />
                    <Route path="Dashboard" element={<Dashboard />} />
                    <Route path="Dashboardvolun" element={<Dashboardvolun />} />
                    <Route path="HS" element={<HS />} />
                    <Route path="SS" element={<SS />} />
                    <Route path="jobtype" element={<JobType />} />
                    <Route path="voluntype" element={<VolunType />} />
                    <Route path="position" element={<Position />} />
                    <Route path="jobber" element={<Jobber />} />
                    <Route path="emp" element={<Employer />} />
                    <Route path="job" element={<Job />} />
                    <Route path="volun" element={<Volunteer />} />
                </Route>
                <Route path="/User" element={<User />}>
                    <Route index element={<AllJobs />} />
                    <Route path="alljob" element={<AllJobs />} />
                    <Route path="allvolun" element={<AllVoluns />} />
                    <Route path="jobs">
                        <Route path=":jobtype" element={<JobsByjobtype />} />
                    </Route>
                    <Route path="voluns">
                        <Route path=":jobtype" element={<JobsByjobtype />} />
                    </Route>
                </Route>
                {/* <Route path="/voluns" element={<User />}>
                    <Route index element={<AllJobs />} />
                    <Route path=":category" element={<JobsByjobtype />} />
                </Route> */}
                
                <Route path="/Jobber_Pf" element={<Jobber_Pf />} />
                <Route path="/Emp_Pf" element={<Emp_Pf />} />
                <Route path="/Volun_Post" element={<Volun_Post />} />
                <Route path="/Job_Post" element={<Job_Post />} />
                
                <Route path="/Register" element={<Register />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;