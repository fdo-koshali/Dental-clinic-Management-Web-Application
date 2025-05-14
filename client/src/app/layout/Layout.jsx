// Import necessary dependencies from react-router-dom and react
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import { useState, useEffect } from "react";

// Layout component serves as the main layout structure of the application
const Layout = () => {

  // State to manage the currently active navigation topic
  const [activeTopic, setActiveTopic] = useState("Dashboard");

  // Effect hook to retrieve the saved active topic from localStorage on component mount
  useEffect(() => {
    const savedTopic = localStorage.getItem("activeTopic");
    if (savedTopic) {
      setActiveTopic(savedTopic);
    }
  }, []);

  // Handler function to update active topic and save it to localStorage
  const handleSetActiveTopic = (topic) => {
    setActiveTopic(topic);
    localStorage.setItem("activeTopic", topic);
  };

  return (

    // Main container with full screen height
    <div className="h-screen">
      <div className="fixed w-[200px]">
        <SideNav setActiveTopic={handleSetActiveTopic} />
      </div>
      <div className="flex flex-col h-screen">
        <div className="fixed mb-10 w-calc ml-[200px]">
          <TopBar topic={activeTopic} />
        </div>
        <div className="overflow-auto mt-20 px-3 w-calc ml-[200px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;