import hero6 from "../assets/img4.jpg";
import { Formik, Form } from "formik";
import { Row } from "react-bootstrap";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import CommonLoading from "../utils/CommonLoading";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const navigate = useNavigate();

  const initialValues = formValues || {
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    userType: "",
    password: "",
    reEnterPassword: "",
  };

  const handleSubmit = async(values) => {
     const data = {
      userId: values.userId,
      password: values.password,
    }
    try {
      const response = await axios.post("/api/auth/registerUser", data);
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Something went wrong");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const getRegisterPageData = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/auth/getRegisterPageData/${token}`
      );
      setFormValues({
        userId: response.data.USER_ID || "",
        firstName: response.data.FIRST_NAME || "",
        lastName: response.data.LAST_NAME || "",
        email: response.data.EMAIL || "",
        userType: response.data.ROLE || "",
        password: "",
        reEnterPassword: "",
      });
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Invalid token");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      getRegisterPageData(token);
    }
  }, []);

  const RegisterSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("required"),
    reEnterPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("required"),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Column */}
      <div className="flex items-center justify-right">
        <img
          src={hero6}
          alt="Registration Visual"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Right Column */}
      <div className="bg-white flex flex-col justify-center items-center px-8 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center flex items-center justify-center space-x-2">
            <h2 className="text-4xl font-bold text-main">Registration</h2>
          </div>
          <p className="text-gray-500 text-center mb-8">Welcome to Dental Clinic.</p>

          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ getFieldProps, touched, errors }) => (
              <Form className="space-y-6">
                <div className="flex items-center justify-center gap-14">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      readOnly
                      {...getFieldProps("firstName")}
                      style={{ minWidth: "220px" }}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      readOnly
                      {...getFieldProps("lastName")}
                      style={{ minWidth: "220px" }}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    readOnly
                    {...getFieldProps("email")}
                    style={{ minWidth: "500px" }}
                    className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="userType"
                    placeholder="User Type"
                    readOnly
                    {...getFieldProps("userType")}
                    style={{ minWidth: "500px" }}
                    className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                  />
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
                    <div className="text-red-600 text-sm mt-1">{errors.password}</div>
                  )}
                </div>

                <div>
                  <div className="relative w-full">
                    <input
                      placeholder="Re-enter Password"
                      {...getFieldProps("reEnterPassword")}
                      type={showRePassword ? "text" : "password"}
                      name="reEnterPassword"
                      autoComplete="on"
                      style={{ minWidth: "500px" }}
                      className="bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-lg w-full h-14 px-4"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRePassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showRePassword ? (
                        <EyeOffIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {touched.reEnterPassword && errors.reEnterPassword && (
                    <div className="text-red-600 text-sm mt-1">{errors.reEnterPassword}</div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    style={{ minWidth: "500px" }}
                    className="bg-main text-white font-semibold rounded-lg w-full h-14 hover:bg-indigo-700 transition duration-300"
                  >
                    Register
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {loading && <CommonLoading />}
    </div>
  );
};

export default Registration;
