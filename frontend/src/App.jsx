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
import VolunsByvoluntype from "./jobber_pages/volunbyvoluntype";
import Match from "./jobber_pages/match";
import { Profiler } from "react";
import { Profile } from "./jobber_pages/profile";
import ScrollToTop from "./comp/scrolltotop";
import ProfileRoutes from "./jobber_comp/profile_routes";
import Find_Job from "./jobber_pages/job";
import Job_Post_de from "./jobber_comp/job_post";
import Job_Match from "./jobber_pages/job_match";
import Volun_Post_de from "./jobber_comp/volun_post";
import ViewEmp_Pf from "./jobber_comp/viewEmp_Pf";
import Register_em from "./register_em";
import Employer_index from "./emp_comp/user_emp";
import Emp_Job_Post from "./emp_comp/job_post";
import Jobber_match from "./emp_comp/jobber_match";
import Review_emp from "./jobber_comp/review_emp";
import { EMP_Profile } from "./emp_comp/profile";
import Emp_ProfileRoutes from "./emp_comp/profile_routes";
import FindVolun from "./emp_comp/findvolun";
import Emp_Volun_Post from "./emp_comp/volun_post";
import Review_jobber from "./emp_comp/review_jobber";
import Volun_Match from "./jobber_pages/volun_match";


function App() {
    return (
        <div className="min-h-screen bg-[#8E80FF]">
            <BrowserRouter>
                {/* <ScrollToTop /> */}
                <Routes>
                    <Route path="" element={<Index />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login_em" element={<Login_em />} />
                    <Route path="/register_em" element={<Register_em />} />
                    <Route path="/profile/*" element={<ProfileRoutes />} />
                    <Route path="/emp_profile/*" element={<Emp_ProfileRoutes />} />
                    <Route path="/Employer/*" element={<Employer_index />} />
                    <Route path="/FindVolun/*" element={<FindVolun />} />

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
                        <Route path="jjob" element={<Job />} />
                        <Route path="vvolun" element={<Volunteer />} />
                    </Route>
                    <Route path="/user_job" element={<Find_Job />} />
                    <Route path="/User" element={<User />}>
                        <Route index element={<AllJobs />} />
                        <Route path="alljob" element={<AllJobs />} />
                        <Route path="allvolun" element={<AllVoluns />} />
                        <Route path="jobs">
                            <Route path=":jobtype" element={<JobsByjobtype />} />
                        </Route>
                        <Route path="voluns">
                            <Route path=":voluntype" element={<VolunsByvoluntype />} />
                        </Route>
                    </Route>
                    {/* <Route path="/voluns" element={<User />}>
                        <Route index element={<AllJobs />} />
                        <Route path=":category" element={<JobsByjobtype />} />
                    </Route> */}
                    
                    <Route path="/user_match" element={<Match />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/Jobber_Pf" element={<Jobber_Pf />} />
                    <Route path="/Emp_Pf" element={<Emp_Pf />} />
                    <Route path="/viewEmp_Pf" element={<ViewEmp_Pf />} />
                    <Route path="/Volun_Post" element={<Volun_Post />} />
                    <Route path="/Job_Post" element={<Job_Post />} />
                    <Route path="/Emp_Job_Post" element={<Emp_Job_Post />} />
                    <Route path="/Emp_Volun_Post" element={<Emp_Volun_Post />} />
                    <Route path="/jobber_match_de" element={<Jobber_match />} />
                    <Route path="/Job_Post_de" element={<Job_Post_de />} />
                    <Route path="/Volun_Post_de" element={<Volun_Post_de />} />
                    <Route path="/Job_Match" element={<Job_Match />} />
                    <Route path="/Volun_Match" element={<Volun_Match />} />
                    <Route path="/review_emp" element={<Review_emp />} />
                    <Route path="/review_jobber" element={<Review_jobber />} />
                    <Route path="/emp_profile" element={<EMP_Profile />} />
                    <Route path="/Register" element={<Register />} />
                    <Route path="/forget-password" element={<ForgetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App;