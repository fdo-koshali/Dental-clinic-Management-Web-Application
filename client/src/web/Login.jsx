import hero6 from "../assets/img4.jpg";
import { Formik, Form } from "formik";
import { FaChevronLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const initialValues = {
    email: "",
    password: "",
  };

  const onSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post("/api/auth/login", values);
      toast.success(response.data.message);
      localStorage.setItem("User", JSON.stringify(response.data.data));
      resetForm();
      const user = response.data.data;
      if (!user || !user.role) {
        throw new Error("Invalid user data received.");
      }
      setTimeout(() => {
        if (user.role === "Super Admin") {
          navigate("/app/dashboard");
        } else if (user.role === "patient") {
          navigate("/app/upcomingAppointment");
        } else if (user.role === "Doctor" || user.role === "Assistant") {
          navigate("/app/todayAppointment");
        } else {
          console.warn("Unexpected role:", user.role);
          navigate("/login");
        }
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Login failed. Please try again."
      );
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Column */}
      <div className="flex items-center justify-cente">
        <img
          src={hero6}
          alt="About Us"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Right Column */}
      <div className="bg-white flex flex-col justify-center items-center px-8 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center  flex items-center justify-center space-x-2">
            <FaChevronLeft
              className="text-main cursor-pointer"
              onClick={() => (window.location.href = "/")}
            />
            <h2 className="text-4xl font-bold text-main">Welcome Back</h2>
          </div>
          <p className="text-gray-500 text-center mb-8">
            Please log in to your account.
          </p>

          <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ getFieldProps, touched, errors }) => (
              <Form className="space-y-6">
                <div>
                  <input
                    placeholder="Email"
                    {...getFieldProps("email")}
                    type="email"
                    name="email"
                    autoComplete="on"
                    style={{ minWidth: "500px" }}
                    className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                  />
                  {touched.email && errors.email && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <div className="relative w-full">
                    <input
                      placeholder="Password"
                      {...getFieldProps("password")}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="on"
                      style={{ minWidth: "500px" }}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    style={{ minWidth: "500px" }}
                    className="bg-main text-white font-semibold rounded-lg w-full h-14 hover:bg-indigo-700 transition duration-300"
                  >
                    Sign In
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="text-center mt-8">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-main font-medium">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
