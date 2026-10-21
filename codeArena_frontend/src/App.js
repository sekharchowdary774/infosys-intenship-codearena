import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

import ProblemsPage from "./pages/ProblemsPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProblemSolvePage from "./pages/ProblemSolvePage";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EditProfile from "./pages/EditProfile";
import StudyPlansPage from "./pages/StudyPlansPage";
import StudyPlanDetailsPage from "./pages/StudyPlanDetailsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import LeaderboardPage from "./pages/LeaderboardPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/problemset"  element={<ProblemsPage/>} />
        <Route path="/admin"  element={<AdminDashboard/>} />
        <Route path="/users"  element={<UserDashboard/>} />
        <Route path="/problems/:problemId"  element={<ProblemSolvePage />} />
        <Route
           path="/forgot-password"
           element={<ForgotPassword />}
        />

        <Route
            path="/reset-password"
            element={<ResetPassword />}
        />
        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />
        <Route
           path="/study-plans"
           element={<StudyPlansPage/>}
        />
        <Route
          path="/study-plans/:planId"
          element={<StudyPlanDetailsPage />}
           />
        <Route path="/submissions" element={<SubmissionsPage />} />   
        <Route
         path="/leaderboard"
         element={<LeaderboardPage />}
        />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;