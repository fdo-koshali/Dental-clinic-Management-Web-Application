/* eslint-disable no-unused-vars */
// Import necessary dependencies for routing, prop validation, and styling
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import "../../utils/SlideBar.css";
import { useState } from "react";

// SideNav component - Main navigation sidebar that displays different menu items based on user role
const SideNav = ({ setActiveTopic }) => {
  // Get current location for active route highlighting
  const location = useLocation();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("User"));

  // State for managing user management submenu visibility
  const [showUserSubsetUser, setShowUserSubsetUser] = useState(() => {
    const savedState = localStorage.getItem("showSubsetUser");
    return savedState === "true";
  });

  // State for managing stock submenu visibility
  const [showStockSubset, setShowStockSubset] = useState(() => {
    const savedState = localStorage.getItem("showSubsetStock");
    return savedState === "true";
  });

  // Toggle handler for user management submenu
  const toggleUserSubset = () => {
    setShowUserSubsetUser((prev) => {
      const newState = !prev;
      localStorage.setItem("showSubsetUSer", newState);
      return newState;
    });
  };

  // Toggle handler for stock submenu
  const toggleStockSubset = () => {
    setShowStockSubset((prev) => {
      const newState = !prev;
      localStorage.setItem("showSubsetStock", newState);
      return newState;
    });
  };

  // Reusable NavItem component for navigation links
  const NavItem = ({ to, Icon, topic, label }) => {
    // Check if current route matches this nav item's route
    const isActive = location.pathname === to;

    // PropTypes validation for NavItem
    NavItem.propTypes = {
      to: PropTypes.string.isRequired,
      Icon: PropTypes.elementType.isRequired,
      label: PropTypes.string.isRequired,
      topic: PropTypes.string.isRequired,
    };

    // Return styled navigation link with icon and label
    return (
      <Link to={to} onClick={() => setActiveTopic(topic)}>
        <div
          className={`flex pl-7 gap-2 items-center hover:text-white hover:bg-text-primary rounded-lg p-2 cursor-pointer
            ${
              isActive ? "text-white bg-slate-900 font-bold" : "text-gray-300"
            }`}
        >
          <Icon className="h-6 w-6" />
          <p className="flex items-center">{label}</p>
        </div>
      </Link>
    );
  };

  return (
    // Main sidebar container with full height
    <div className="flex h-screen">
      {/* Sidebar wrapper with fixed width and dark background */}
      <div className="w-[200px] bg-zinc-700 flex flex-col h-full">
        {/* Clinic name header */}
        <div className="flex-shrink-0 flex items-center justify-center h-16 bg-zinc-700 mb-4">
          <h1 className="text-white font-bold text-lg">Dental Clinic</h1>
        </div>

        {/* Scrollable navigation menu container */}
        <div className="flex-1 overflow-y-auto sidebar">
          {/* Conditional rendering based on user role */}
          {/* Dashboard - Super Admin only */}
          {user?.role === "Super Admin" && (
            <NavItem
              to="/app/dashboard"
              Icon={() => <i className="bi bi-card-text"></i>}
              label="Dashboard"
              topic="Dashboard"
            />
          )}

          {/* Appointments - Different views for patients and staff */}
          {user?.role === "patient" && (
            <NavItem
              to="/app/upcomingAppointment"
              Icon={() => <i className="bi bi-file-earmark-text"></i>}
              label="Appointments"
              topic="Upcoming Appointment"
            />
          )}

          {user?.role !== "patient" && (
            <NavItem
              to="/app/todayAppointment"
              Icon={() => <i className="bi bi-file-earmark-text"></i>}
              label="Appointments"
              topic="Today Appointment"
            />
          )}

          {/* Patient History - Not available for Assistants */}
          {user?.role !== "Assistant" && (
            <NavItem
              to="/app/pastAppointment"
              Icon={() => <i className="bi bi-clock-history"></i>}
              label="History"
              topic="Patient History"
            />
          )}

          {/* Treatment Data - Super Admin only */}
          {user?.role === "Super Admin" && (
            <NavItem
              to="/app/treatmentData"
              Icon={() => <i className="bi bi-life-preserver"></i>}
              label="Treatment Data"
              topic="Treatment Data"
            />
          )}

          {/* User Management section - Super Admin only */}
          {user?.role === "Super Admin" && (
            <div
              className={`flex pl-7 gap-2 items-center hover:text-white hover:bg-text-primary rounded-lg p-2 cursor-pointer
        ${
          showUserSubsetUser
            ? "text-white border border-gray-300 font-bold"
            : "text-gray-300"
        }`}
              onClick={toggleUserSubset}
            >
              <i className="bi bi-people"></i>
              <p>User Management</p>
            </div>
          )}

          {/* User Management submenu items */}
          {showUserSubsetUser && (
            <div className="pl-3">
              <NavItem
                to="/app/memberManagemnt"
                Icon={() => <i className="bi bi-person-fill-gear"></i>}
                label="Members"
                topic="Member Management"
              />
              <NavItem
                to="/app/supplierManagemnt"
                Icon={() => <i className="bi bi-boxes"></i>}
                label="Suppliers"
                topic="Supplier Management"
              />
              <NavItem
                to="/app/patientManagemnt"
                Icon={() => <i className="bi bi-diagram-3"></i>}
                label="patients"
                topic="Patients Management"
              />
            </div>
          )}

          {/* Stock Management section - Not for patients */}
          {user?.role !== "patient" && (
            <div
              className={`flex pl-7 gap-2 items-center hover:text-white hover:bg-text-primary rounded-lg p-2 cursor-pointer
        ${
          showStockSubset
            ? "text-white border border-gray-300 font-bold"
            : "text-gray-300"
        }`}
              onClick={toggleStockSubset}
            >
              <i className="bi bi-box"></i>
              <p>Stock</p>
            </div>
          )}

          {/* Stock Management submenu items */}
          {showStockSubset && (
            <div className="pl-3">
              {/* Add Items - Super Admin only */}
              {user.role === "Super Admin" && (
                <NavItem
                  to="/app/addItems"
                  Icon={() => <i className="bi bi-plus-square"></i>}
                  label="Add Items"
                  topic="Add Items"
                />
              )}

              {/* GRN - Available to all staff */}
              {user?.role !== "patient" && (
                <NavItem
                  to="/app/grn"
                  Icon={() => <i className="bi bi-file-earmark-plus"></i>}
                  label="GRN"
                  topic="GRN"
                />
              )}

              {/* Request Note - Super Admin only */}
              {user.role === "Super Admin" && (
                <NavItem
                  to="/app/reqestNote"
                  Icon={() => <i className="bi bi-file-earmark-text"></i>}
                  label="Request Note"
                  topic="Request Note"
                />
              )}

              {/* Stock - Not for Assistants */}
              {user.role !== "Assistant" && user?.role !== "patient" && (
                <NavItem
                  to="/app/stock"
                  Icon={() => <i className="bi bi-box"></i>}
                  label="Stock"
                  topic="Stock"
                />
              )}
            </div>
          )}

          {/* Profile - Available to all users */}
          <NavItem
            to="/app/profile"
            Icon={() => <i className="bi bi-person-circle"></i>}
            label="Profile"
            topic="Profile"
          />

          {/* Settings - Super Admin only */}
          {user?.role === "Super Admin" && (
            <NavItem
              to="/app/setting"
              Icon={() => <i className="bi bi-gear"></i>}
              label="Settings"
              topic="Settings"
            />
          )}
        </div>

        {/* Logout section at bottom of sidebar */}
        <div className="flex-shrink-0 w-full bg-zinc-700 py-4">
          <div
            className="flex pl-7 gap-2 items-center hover:text-white hover:bg-text-primary rounded-lg p-2 cursor-pointer text-gray-300"
            onClick={() => {
              localStorage.clear();
              setTimeout(() => {
                window.location.href = "/";
              }, 0);
            }}
          >
            <i className="bi bi-door-open-fill"></i>
            <p>Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation for SideNav component
SideNav.propTypes = {
  setActiveTopic: PropTypes.func.isRequired,
};

export default SideNav;
