import { Routes, Route } from 'react-router-dom';
import InfoForm from './form_info';
import { Profile } from '../jobber_pages/profile';
import History from './form_history';
import InfoView from './view_info';
import EduView from './view_edu';
import WorkExView from './view_workex';
import InterWorkView from './view_inwork';
import InterVolunView from './view_involun';
import CheckProfileStatus from './Check_Pf_status';
import EduFormEdit from './edit_edu';
import WorkExEdit from './edit_workex';
import InterWorkEdit from './edit_inwork';
import InterVolunEdit from './edit_involun';
import EduAdd from './add_edu';
import WorkExAdd from './add_workex';
import InterWorkAdd from './add_inwork';
import InterVolunAdd from './add_involun';
import UserSs from './ss';
import UserHs from './hs';


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
        <Route path="info/add" element={<InfoForm />} />
        <Route path="edu/add" element={<EduAdd />} />
        <Route path="work_ex/add" element={<WorkExAdd />} />
        <Route path="inter_work/add" element={<InterWorkAdd />} />
        <Route path="inter_volun/add" element={<InterVolunAdd />} />
        <Route path="edu/edit/:user_edu_id" element={<EduFormEdit />} />
        <Route path="work_ex/edit/:no" element={<WorkExEdit />} />
        <Route path="inter_work/edit/:inter_work_id" element={<InterWorkEdit />} />
        <Route path="inter_volun/edit/:inter_volun_id" element={<InterVolunEdit />} />
        <Route path="history" element={<History />} />
        <Route path="user/hs" element={<UserHs />} />
        <Route path="user/ss" element={<UserSs />} />
      </Route>
    </Routes>
  );
};

export default ProfileRoutes;
