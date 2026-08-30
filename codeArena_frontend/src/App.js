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
      </Routes>
    </BrowserRouter>
  );
}

export default App;