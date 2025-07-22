import { Routes, Route } from 'react-router-dom';
import InfoForm from './form_info';
import { Profile } from '../jobber_pages/profile';
import EduForm from './form_edu';
import WorkExForm from './form_workex';
import InterWork from './form_inwork';
import InterVolun from './form_involun';
import History from './form_history';
import InfoView from './view_info';
import EduView from './view_edu';
import WorkExView from './view_workex';
import InterWorkView from './view_inwork';
import InterVolunView from './view_involun';
import CheckProfileStatus from './Check_Pf_status';


const ProfileRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Profile />}>
        <Route index element={<CheckProfileStatus />} />
        <Route path="status" element={<CheckProfileStatus />} />
        <Route path="info/view" element={<InfoView />} />
        <Route path="edu/view" element={<EduView />} />
        <Route path="work_ex/view" element={<WorkExView />} />
        <Route path="inter_work/view" element={<InterWorkView />} />
        <Route path="inter_volun/view" element={<InterVolunView />} />
        <Route path="info/edit" element={<InfoForm />} />
        <Route path="edu/edit" element={<EduForm />} />
        <Route path="work_ex/edit" element={<WorkExForm />} />
        <Route path="inter_work/edit" element={<InterWork />} />
        <Route path="inter_volun/edit" element={<InterVolun />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  );
};

export default ProfileRoutes;
