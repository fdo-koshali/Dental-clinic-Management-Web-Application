import hero6 from "../assets/img4.jpg";
import { Formik, Form } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronLeft } from "react-icons/fa";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Signup = () => {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const SignUpSchema = Yup.object().shape({
    firstname: Yup.string().required("required"),
    lastname: Yup.string().required("required"),
    email: Yup.string().email("Invalid email").required("required"),
    phone: Yup.string()
      .matches(/^\d+$/, "Phone number must be digits only")
      .required("required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("required"),
    repassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("required"),
  });

  const getUserId = async () => {
    try {
      const response = await axios.get("/api/user/generateUserId");
      setUserId(response.data.newid);
    } catch (error) {
      console.error("Failed to generate user ID:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

  const initialValues = {
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    repassword: "",
  };

  const onsubmit = async (values) => {
    try {
      const response = await axios.post("/api/auth/createCustomer", {
        userId: userId,
        firstName: values.firstname,
        lastName: values.lastname,
        email: values.email,
        password: values.password,
        userType: "patient",
        status: 1,
      });
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data.error);
      console.log("Error", error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Column */}
      <div className="flex items-center justify-right">
        <img
          src={hero6}
          alt="Signup Visual"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Right Column*/}
      <div className="bg-white flex flex-col justify-center items-center px-8 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center  flex items-center justify-center space-x-2">
            <FaChevronLeft
              className="text-indigo-600 cursor-pointer"
              onClick={() => (window.location.href = "/")}
            />
            <h2 className="text-4xl font-bold text-main">Get Started Now</h2>
          </div>
          <p className="text-gray-500 text-center mb-8">
            Create your account to join us.
          </p>

          <Formik
            initialValues={initialValues}
            validationSchema={SignUpSchema}
            onSubmit={onsubmit}
          >
            {({ getFieldProps, touched, isValid, errors }) => (
              <Form className="space-y-6">
                <div className="flex items-center justify-center gap-14">
                  <div>
                    <input
                      placeholder="First Name"
                      {...getFieldProps("fullname")}
                      type="text"
                      name="firstname"
                      autoComplete="on"
                      style={{ minWidth : "220px"}}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                    {touched.firstname && errors.firstname && (
                      <div className="text-red-600 text-sm mt-1">
                        {errors.firstname}
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="Last Name"
                      {...getFieldProps("lastname")}
                      type="text"
                      name="lastname"
                      autoComplete="on"
                      style={{ minWidth : "220px"}}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                    {touched.lastname && errors.lastname && (
                      <div className="text-red-600 text-sm mt-1">
                        {errors.lastname}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    placeholder="Email"
                    {...getFieldProps("email")}
                    type="email"
                    name="email"
                    style={{ minWidth : "500px" }}
                    autoComplete="on"
                    className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                  />
                  {touched.email && errors.email && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Phone Number"
                    {...getFieldProps("phone")}
                    type="text"
                    name="phone"
                    style={{ minWidth : "500px" }}
                    autoComplete="on"
                    className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                  />
                  {touched.phone && errors.phone && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.phone}
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
                      style={{ minWidth : "500px" }}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)} // Toggle the visibility
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
                  <div className="relative w-full">
                    <input
                      placeholder="Re-Enter Password"
                      {...getFieldProps("repassword")}
                      type={showRePassword ? "text" : "password"}
                      name="repassword"
                      autoComplete="on"
                      style={{ minWidth : "500px" }}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRePassword((prev) => !prev)} // Toggle the visibility
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showRePassword ? (
                        <EyeOffIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {touched.repassword && errors.repassword && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.repassword}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    style={{ minWidth : "500px" }}
                    className="bg-main text-white font-semibold rounded-lg w-full h-14 hover:bg-indigo-700 transition duration-300"
                    disabled={!userId || !isValid}
                  >
                    Sign Up
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="text-center mt-8">
            <p className="text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-main font-medium">
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
