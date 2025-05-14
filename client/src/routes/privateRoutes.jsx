import { createBrowserRouter, RouterProvider } from "react-router-dom";

import WebLayout from "../web/Layout";
import Login from "../web/Login";
import Signup from "../web/Signup"
import Layout from "../app/layout/Layout";
import Dashboard from "../app/UI/Dashboard";
import TreatmentData from "../app/UI/TreatmentData";
import SupplierManagemnt from "../app/UI/User Managemnt/SupplierManagemnt";
import MemberManagemnt from "../app/UI/User Managemnt/MemberManagemnt";
import PatientManagemnt from "../app/UI/User Managemnt/PatientManagemnt";
import SettingPage from "../app/UI/SettingPage";
import Registration from "../web/Registration";
import { Navigate } from "react-router-dom";
import AddItems from "../app/UI/Item Managment/AddItems";
import GRN from "../app/UI/Item Managment/GRN";
import RequvestNote from "../app/UI/Item Managment/requvestNote";
import Stock from "../app/UI/Item Managment/Stock";
import ProfilePage from "../app/UI/ProfilePage";
import UpcomingAppointment from "../app/UI/Appointment/UpcomingAppointment";
import TodayAppointment from "../app/UI/Appointment/TodayAppointment";
import PastAppoinmentData from "../app/UI/Appointment/PastAppoinmentData";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("User"));
  const isAdmin = user?.role === "Super Admin" || user?.role === "patient"  || user?.role === "Doctor" || user?.role === "Assistant";

  if (role === "Admin" && isAdmin) {
    return children;
  } else {
    console.warn("Unauthorized access attempt or invalid role:", user?.role);
    return <Navigate to="/login" replace />;
  }
};

const router = createBrowserRouter([
  { path: "/", element: <WebLayout /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/registration", element: <Registration /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute role="Admin">
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "treatmentData", element: <TreatmentData /> },
      { path: "supplierManagemnt", element: <SupplierManagemnt /> },
      { path: "memberManagemnt", element: <MemberManagemnt /> },
      { path: "patientManagemnt", element: <PatientManagemnt /> },
      { path: "setting", element: <SettingPage /> },
      { path: "addItems", element: <AddItems /> },
      { path: "grn", element: <GRN /> },
      { path: "reqestNote", element: <RequvestNote /> },
      { path: "stock", element: <Stock /> },
      { path: "profile", element: <ProfilePage /> },
      { path: 'upcomingAppointment', element: <UpcomingAppointment /> },
      { path: 'todayAppointment', element: <TodayAppointment /> },
      { path: 'pastAppointment', element: <PastAppoinmentData /> },
    ],
  },
]);

const PrivateRoutes = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default PrivateRoutes;
