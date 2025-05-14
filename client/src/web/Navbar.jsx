import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="min-w-full fixed top-0 left-0 bg-white shadow z-50">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left - Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Dental Clinic
        </div>

        {/* Center - Menu */}
        <ul className="flex space-x-8 text-gray-700 font-medium">
          <li>
            <a
              href="#treatments"
              className="hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("treatments")
                  .scrollIntoView({ behavior: "smooth" });
              }}
            >
              Treatments
            </a>
          </li>
          <li>
            <a
              href="#about"
              className="hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("about")
                  .scrollIntoView({ behavior: "smooth" });
              }}
            >
              About Us
            </a>
          </li>
          <li>
            <a
              href="#meetDoctor"
              className="hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("meetDoctor")
                  .scrollIntoView({ behavior: "smooth" });
              }}
            >
              Meet Doctor
            </a>
          </li>
        </ul>

        {/* Right - Log In */}
        <div>
          <p className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
