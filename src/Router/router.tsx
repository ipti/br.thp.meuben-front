import { BrowserRouter, Route, Routes } from "react-router-dom";
import BeneficiariesCreate from "../Pages/Beneficiaries/BeneficiariesCreate";
import BeneficiariesEdit from "../Pages/Beneficiaries/BeneficiariesEdit";
import BeneficiariesList from "../Pages/Beneficiaries/BeneficiariesList";
import ClassroomOne from "../Pages/Classroom/ClassroomOne";
import MeetingList from "../Pages/Classroom/ClassroomOne/MeetingList";
import CreateMeeting from "../Pages/Classroom/ClassroomOne/MeetingList/CreateMeeting";
import Meeting from "../Pages/Classroom/ClassroomOne/MeetingList/Meeting";
import AttendanceListGenerate from "../Pages/Classroom/ClassroomOne/MeetingList/Meeting/UploadArchivesAttendanceList/AttendanceListGenarete";
import RegistrationList from "../Pages/Classroom/ClassroomOne/RegistrationList";
import Registration from "../Pages/Classroom/ClassroomOne/RegistrationList/Registration";
import Report from "../Pages/Classroom/ClassroomOne/Report";
import FormClassroom from "../Pages/Classroom/ClassroomCriar";
import ListClassroom from "../Pages/Classroom/ListClassroom";
import CreateOrEditForm from "../Pages/Form/CreateForms";
import ViewForms from "../Pages/Form/ViewForms";
import Help from "../Pages/Help";
import Login from "../Pages/Login/Login";
import CreateProjectsList from "../Pages/Projects/CreateProjects";
import ProjectOne from "../Pages/Projects/ProjectOne";
import ProjectsList from "../Pages/Projects/ProjectsList";
import Register from "../Pages/Register";
import FormSchedule from "../Pages/Schedule/FormSchedule";
import FormEditSchedule from "../Pages/Schedule/FormSchedule/edit";
import ListSchedule from "../Pages/Schedule/ListSchedule";
import SignUp from "../Pages/SignUp/SignUp";
import CreateTechnologySocial from "../Pages/TecnologySocial/CreateTechnologySocial";
import TecnologySocial from "../Pages/TecnologySocial/TecnologySocialList";
import CreateUser from "../Pages/Users/CreateUser";
import EditUser from "../Pages/Users/EditUser";
import ListUsers from "../Pages/Users/ListUsers";
import PrivateRoute from "./privaterouter";
import InitialPage from "../Pages/InitialPage";
import ReapplicatorsList from "../Pages/Reapplicators/ReapplicatorsList";
import ReapplicatorView from "../Pages/Reapplicators/ReapplicatorView";
import ChangePassword from "../Pages/Users/ChangePassword";
import PageAtt from "../Pages/Att/page";
import UserLogs from "../Pages/UserLogs";
import MeubenPrivacyPolicy from "../Pages/Public/MeubenPrivacyPolicy";

const RoutesApp = () => {
  return (
    <BrowserRouter>
      {false ? <Routes>
        <Route path="/*" element={<PageAtt />} />
      </Routes> : <Routes>
        <Route
          element={<PrivateRoute Component={<CreateOrEditForm />} />}
          path="/create"
        />
        <Route
          element={<PrivateRoute Component={<ViewForms />} />}
          path="/view/:id"
        />
        <Route
          element={<PrivateRoute Component={<InitialPage />} />}
          path="/"
        />
        <Route
          element={<PrivateRoute Component={<ListSchedule />} />}
          path="/cronograma"
        />
        <Route
          element={<PrivateRoute Component={<FormSchedule />} />}
          path="/cronograma/criar"
        />
        <Route
          element={<PrivateRoute Component={<FormEditSchedule />} />}
          path="/cronograma/:id"
        />

        <Route
          element={<PrivateRoute Component={<ListClassroom />} />}
          path="/turma"
        />
        <Route
          element={<PrivateRoute Component={<FormClassroom />} />}
          path="/turma/criar/:id"
        />
        <Route
          element={<PrivateRoute Component={<ClassroomOne />} />}
          path="/turma/:id"
        />
        <Route
          element={<PrivateRoute Component={<Report />} />}
          path="/turma/:id/relatorio"
        />
        {/* <Route
          element={<PrivateRouteNotLayout Component={<ReportClassroom />} />}
          path="/turma/:id/relatorio/pdf"
        /> */}
        <Route
          element={<PrivateRoute Component={<RegistrationList />} />}
          path="/turma/:id/alunos"
        />
        <Route
          element={<PrivateRoute Component={<Registration />} />}
          path="/turma/:id/aluno/:idRegistration"
        />
        <Route
          element={<PrivateRoute Component={<MeetingList />} />}
          path="/turma/:id/encontros"
        />
        <Route
          element={<PrivateRoute Component={<CreateMeeting />} />}
          path="/turma/:id/encontros/criar"
        />
        <Route
          element={<PrivateRoute Component={<Meeting />} />}
          path="/turma/:id/encontros/:idMeeting"
        />
        <Route
          element={<PrivateRoute Component={<AttendanceListGenerate />} />}
          path="/turma/:id/encontros/:idMeeting/generate"
        />
        <Route
          element={<PrivateRoute Component={<CreateOrEditForm />} />}
          path="/edit/:id"
        />
        <Route
          element={<PrivateRoute Component={<BeneficiariesList />} />}
          path="/beneficiarios"
        />
        <Route
          element={<PrivateRoute Component={<BeneficiariesCreate />} />}
          path="/beneficiarios/criar"
        />
        <Route
          element={<PrivateRoute Component={<BeneficiariesEdit />} />}
          path="/beneficiarios/:id"
        />
        <Route
          element={<PrivateRoute Component={<UserLogs />} />}
          path="/logs"
        />
        <Route
          element={<PrivateRoute Component={<ListUsers />} />}
          path="/users"
        />
        <Route
          element={<PrivateRoute Component={<ProjectsList />} />}
          path="/projetos"
        />
        <Route element={<PrivateRoute Component={<Help />} />} path="/ajuda" />
        <Route
          element={<PrivateRoute Component={<CreateProjectsList />} />}
          path="/projetos/criar"
        />
        <Route
          element={<PrivateRoute Component={<ProjectOne />} />}
          path="/projetos/:id"
        />
        <Route
          element={<PrivateRoute Component={<TecnologySocial />} />}
          path="/tecnologias"
        />
        <Route
          element={<PrivateRoute Component={<CreateTechnologySocial />} />}
          path="/tecnologias/criar"
        />
        <Route
          element={<PrivateRoute Component={<ReapplicatorsList />} />}
          path="/reaplicadores"
        />
        <Route
          element={<PrivateRoute Component={<ReapplicatorView />} />}
          path="/reaplicadores/:id"
        />
        <Route
          element={<PrivateRoute Component={<CreateUser />} />}
          path="/users/criar"
        />
        <Route
          element={<PrivateRoute Component={<EditUser />} />}
          path="/users/:id"
        />
        <Route
          element={<PrivateRoute Component={<ChangePassword />} />}
          path="/users/senha/:id"
        />
        <Route element={<SignUp />} path="/register" />
        <Route element={<Login />} path="/login" />
        <Route element={<Register />} path="/matricula" />
        <Route
          element={<MeubenPrivacyPolicy />}
          path="/politica-privacidade/meuben"
        />
        <Route
          element={<MeubenPrivacyPolicy />}
          path="/privacy-policy/meuben"
        />
        {/* <Route path="/*" element={<NotFoundPage />} /> */}
      </Routes>}
    </BrowserRouter>
  );
};

export default RoutesApp;
