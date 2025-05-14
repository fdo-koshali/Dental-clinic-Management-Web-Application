import AboutUs from "./AboutUs";
import LandingPart from "./LandingPart";
import MeetDoctor from "./MeetDoctor";
import Navbar from "./Navbar";
import Treatments from "./Treatments";

const WebLayout = () => {
  return (
    <div className="relative">
      <div className="relative z-10">
        <Navbar />
      </div>
      <div className="relative z-0">
        <LandingPart />
      </div>
      <div className="relative z-9 mt-screen">
        <Treatments />
      </div>
      <div className="relative z-9 mt-screen">
        <AboutUs />
      </div>
      <div className="relative z-9 mt-screen">
        <MeetDoctor />
      </div>
    </div>
  );
};

export default WebLayout;
