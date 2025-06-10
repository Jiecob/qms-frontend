import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QueueList from "./pages/QueueList";
import StudentProfile from "./pages/StudentProfile";
import StudentList from "./pages/StudentList";
import StudentPost from "./pages/StudentPost";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import PublicRoute from "./components/PublicRoute";
import QueueProfile from "./pages/QueueProfile";
import QueuePost from "./pages/QueuePost";
import ForgotPassword from "./pages/ForgotPassword";
import StaffList from "./pages/StaffList";
import StaffPost from "./pages/StaffPost";
import StaffProfile from "./pages/StaffProfile";
import OfficeList from "./pages/OfficeList";
import OfficePost from "./pages/OfficePost";
import OfficeProfile from "./pages/OfficeProfile";
import WindowList from "./pages/WindowList";
import WindowPost from "./pages/WindowPost";
import PurposeList from "./pages/PurposeList";
import CourseList from "./pages/CourseList";
import CoursePost from "./pages/CoursePost";
import CourseProfile from "./pages/CourseProfile";
import PurposePost from "./pages/PurposePost";
import PurposeProfile from "./pages/PurposeProfile";
import QueueReport from "./pages/QueueReport";
import RegisterStaff from "./pages/RegisterStaff";

const Layout = () => {
  const { user } = useAuth();

  const location = useLocation();

  // If you're on '/dashboard', hide the navbar
  const hideNavbar = location.pathname === "/dashboard";

  return (
    <>
      {user && !hideNavbar && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/registerstaff"
          element={
            <PublicRoute>
              <RegisterStaff />
            </PublicRoute>
          }
        />

        <Route
          path="/forgotpassword"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stafflist"
          element={
            <ProtectedRoute>
              <StaffList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffpost"
          element={
            <ProtectedRoute>
              <StaffPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffprofile/:id"
          element={
            <ProtectedRoute>
              <StaffProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studentlist"
          element={
            <ProtectedRoute>
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studentpost"
          element={
            <ProtectedRoute>
              <StudentPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studentprofile/:id"
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queuelist"
          element={
            <ProtectedRoute>
              <QueueList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queuepost/:id"
          element={
            <ProtectedRoute>
              <QueuePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queueprofile/:queueid/:counterid/:purposeid/:windowid"
          element={
            <ProtectedRoute>
              <QueueProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officelist"
          element={
            <ProtectedRoute>
              <OfficeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officepost"
          element={
            <ProtectedRoute>
              <OfficePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officeprofile/:id"
          element={
            <ProtectedRoute>
              <OfficeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/windowlist/:id"
          element={
            <ProtectedRoute>
              <WindowList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/windowpost/:id"
          element={
            <ProtectedRoute>
              <WindowPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courselist"
          element={
            <ProtectedRoute>
              <CourseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coursepost"
          element={
            <ProtectedRoute>
              <CoursePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courseprofile/:id"
          element={
            <ProtectedRoute>
              <CourseProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purposelist/:id"
          element={
            <ProtectedRoute>
              <PurposeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purposepost/:id"
          element={
            <ProtectedRoute>
              <PurposePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purposeprofile/:id/:purposeid"
          element={
            <ProtectedRoute>
              <PurposeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queuereport"
          element={
            <ProtectedRoute>
              <QueueReport />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;
