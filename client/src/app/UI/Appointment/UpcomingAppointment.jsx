/* eslint-disable no-unused-vars */
// Import necessary dependencies
import React, { useEffect, useState } from "react";
import moment from "moment"; // For date handling
import {

  // Import Ant Design components for UI
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Dropdown,
  message,
} from "antd";
import { PlusOutlined, DownOutlined } from "@ant-design/icons";
import { toast } from "react-toastify"; // For notifications
import axios from "axios"; // For API calls
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const UpcomingAppointment = () => {
  // Navigation hook for routing
  const navigate = useNavigate();

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls appointment creation modal
  const [showTime, setShowTime] = useState(false); // Controls time slot display
  const [appointmentId, setAppointmentId] = useState(""); // Stores generated appointment ID
  const [treameantdata, setTreameantdata] = useState([]); // Stores treatment options
  const [relatedData, setRelatedData] = useState([]); // Stores related patient accounts
  const [doctors, setDoctors] = useState([]); // Stores available doctors
  const [startTime, setStartTime] = useState(""); // Selected appointment start time
  const [endTime, setEndTime] = useState(""); // Selected appointment end time
  const [holidays, setHolidays] = useState([]); // Stores clinic holidays
  const [appointments, setAppointments] = useState([]); // Stores all appointments
  const [form] = Form.useForm(); // Form instance for appointment creation
  const user = JSON.parse(localStorage.getItem("User")); // Get logged-in user data

  // API Functions

  // Generate new appointment ID
  const AppointmentId = async () => {
    try {
      const response = await axios.get("/api/appointments/generatId");
      setAppointmentId(response.data?.newid);
      form.setFieldValue("appointmentId", response.data?.newid);
    } catch (error) {
      console.error("Error generating appointment ID:", error);
      toast.error("Failed to generate appointment ID");
    }
  };

  // Fetch treatment options
  const treamnrDDlist = async () => {
    try {
      const response = await axios.get("/api/treaments/ddlist");
      setTreameantdata(response?.data);
    } catch (error) {
      console.error("Error fetching dd list", error);
    }
  };

  // Fetch available doctors
  const fetchDoctors = async () => {
    try {
      const response = await axios.get("/api/user/get/doctorDDList");
      setDoctors(
        response?.data?.map((d) => ({
          value: d.USER_ID,
          label: d.NAME,
        }))
      );
    } catch (error) {
      console.error("Error fetching doctors list:", error);
    }
  };

  // Fetch related patient accounts
  const fetchRelatedAccounts = async () => {
    try {
      const response = await axios.get(
        `/api/user/get/relevantUserDDList/${user?.id}`
      );
      setRelatedData(response?.data);
    } catch (error) {
      console.error("Error fetching doctors list:", error);
    }
  };

  // Fetch clinic holidays
  const getHolidays = async () => {
    try {
      const response = await axios.get("/api/settings/get/upcoming");
      setHolidays(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching holidays:", error);
      return [];
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    fetchRelatedAccounts();
    AppointmentId();
    treamnrDDlist();
    fetchDoctors();
    getHolidays();
    fetchAppoinmentData();
  }, []);

  // Build patient options list for dropdown selection
  const patients = [

    // Add current user if exists
    ...(user
      ? [{ value: user.id, label: `${user.firstName} ${user.lastName}` }]
      : []),

    // Add related patients from data
    ...(relatedData
      ?.filter((d) => d) // Filter out null/undefined entries
      ?.map((d) => ({
        value: String(d.RELATED_ID),
        label: `${d.NAME || "Unknown"} (${d.RELATIONSHIP || "Unknown"})`,
      })) || []),

      // Add option to create new patient
    {
      value: "add_new",
      label: "+ Add New Patient",
      className: "add-new-option",
      style: { color: "#1890ff" }, // Blue color for add new option
    },
  ];

  // Handle patient selection from dropdown
  const handlePatientSelect = (value) => {
    if (value === "add_new") {
      navigate("/app/profile"); // Navigate to profile page for new patient
      form.setFieldValue("patientId", undefined); // Clear selected patient
    }
  };

  // Convert time duration from "HH:MM" format to "X mins" format
  const formatDurationToMinutes = (durationStr) => {
    const [hours, minutes] = durationStr.split(":").map(Number);
    return `${hours * 60 + minutes} mins`;
  };

  // Transform treatment data for dropdown selection
  const treatments = treameantdata.map((t) => ({
    value: `${t.ID}`,
    label: t.NAME.trim(),
    duration: formatDurationToMinutes(t.DURATION),
    charges: parseFloat(t.COST),
  }));

  // Define time preference options for appointment scheduling
  const timePreferences = [
    { value: "morning", label: "Morning (9 AM - 12 PM)" },
    { value: "afternoon", label: "Afternoon (12 PM - 5 PM)" },
    { value: "evening", label: "Evening (6 PM - 8 PM)" },
  ];

  // Auto-fill duration and charges when treatment is selected
  const handleTreatmentChange = (value) => {
    const treatment = treatments.find((t) => t.value === value);
    form.setFieldValue("duration", treatment?.duration || "");
    form.setFieldValue("charges", treatment?.charges || "");
  };

  // Find available time slots for appointment
  const handleFindTime = async () => {
    try {

      // Validate required fields before proceeding
      const values = await form.validateFields([
        "date",
        "timePreference",
        "treatmentId",
      ]);

      // Get treatment duration in minutes
      const treatment = treatments.find((t) => t.value === values.treatmentId);
      const duration = treatment?.duration?.split(" ")[0];

      // API call to find available time slots
      const response = await fetch("/api/appointments/find-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: values.date.format("YYYY-MM-DD"),
          timePreference: values.timePreference,
          duration: duration,
        }),
      });

      const data = await response.json();

      // Handle the response from time slot availability check
      if (data.message === "Time slot is available") {

        // Set the available time slot in state and form
        setStartTime(data.start_time);
        setEndTime(data.end_time);
        form.setFieldValue("startTime", data.start_time);
        form.setFieldValue("endTime", data.end_time);
        setShowTime(true); // Show the time slot section
      } else {
        toast.error("No time slot available");
      }
    } catch (error) {
      console.error("Error finding time:", error);
      message.error("Failed to find available time");
    }
  };

  // Reset appointment time when date or time preference changes
  const handleDateOrPreferenceChange = () => {
    form.setFieldValue("appointmentTime", "");
    setShowTime(false); // Hide the time slot section
  };

  // Handle appointment status change (cancellation)
  const handleStatusChange = async (appointmentId) => {
    try {
      // Send PUT request to update appointment status
      await fetch("/api/appointments/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status: "cancelled",
        }),
      });
      toast.success("Appointment cancelled successfully!");
      fetchAppoinmentData(); // Refresh appointment list
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  // Handle appointment form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); // Validate all form fields

      // Send POST request to create new appointment
      const response = await axios.post("/api/appointments/create", {
        appointmentId: appointmentId,
        doctorId: values.doctorId,
        patientId: values.patientId,
        treatmentId: values.treatmentId,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime,
        endTime: values.endTime,
        charges: values.charges,
      });
      toast.success("Appointment created successfully!");

      // Reset form and UI states
      setIsModalOpen(false);
      form.resetFields();
      setShowTime(false);
      await AppointmentId(); // Generate new appointment ID
      await fetchAppoinmentData(); // Refresh appointment list
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create Appoinment, Plese try again!");
    }
  };

  // Fetch upcoming appointments for user and related accounts
  const fetchAppoinmentData = async () => {
    const data = {
      userId: user?.id,
      relatedIds: user?.relatedId || []
    };
    try {
      const response = await axios.post('/api/appointments/getUpCommingData', data);
      setAppointments(response.data);
    } catch (err) {
      console.error('Failed to load appointment data:', err);
      toast.error('Failed to load appointments');
    }
  };

  // Determine color for status tags based on appointment status
  const getStatusColor = (status) => {
    if (!status) return "blue"; // Default color if status is undefined
    switch (status.toLowerCase()) {
      case "confirmed":
        return "green";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "blue";
    }
  };

  // Function to disable past dates and holidays in date picker
  const disablePastDates = (current) => {
    // Check if date is before today
    if (current.isBefore(moment(), "day")) {
      return true;
    }
    // Check if date is a holiday
    return holidays.some(
      (holiday) =>
        moment(holiday.DATE).format("YYYY-MM-DD") ===
        current.format("YYYY-MM-DD")
    );
  };

  return (
    <div style={{ padding: "24px" }}>

    {/* Create Appointment Button */}
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Appointment
        </Button>
      </Row>

      {/* Appointment Creation Modal */}
      <Modal
        title="Create New Appointment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[

          // Modal footer buttons for cancellation and submission
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="findTime"
            type="primary"
            onClick={showTime ? handleSubmit : handleFindTime}
          >
            {showTime ? "Submit" : "Find Time"}
          </Button>,
        ]}
      >

        {/* Appointment Form */}
        <Form form={form} layout="vertical">

          {/* Auto-generated Appointment ID */}
          <Form.Item label="Appointment ID" name="appointmentId">
            <Input readOnly defaultValue={appointmentId} />
          </Form.Item>

          {/* Doctor Selection */}
          <Form.Item
            label="Doctor"
            name="doctorId"
            rules={[{ required: true, message: "Please select a doctor" }]}
          >
            <Select placeholder="Select doctor" options={doctors} />
          </Form.Item>

          {/* Patient Selection with option to add new patient */}
          <Form.Item
            label="Patient"
            name="patientId"
            rules={[{ required: true, message: "Please select a patient" }]}
          >
            <Select
              placeholder="Select patient"
              options={patients}
              onChange={handlePatientSelect}
            />
          </Form.Item>

          {/* Treatment Selection - auto-fills duration and charges */}
          <Form.Item
            label="Treatment"
            name="treatmentId"
            rules={[{ required: true, message: "Please select a treatment" }]}
          >
            <Select
              placeholder="Select treatment"
              options={treatments}
              onChange={handleTreatmentChange}
            />
          </Form.Item>

          {/* Auto-filled Duration field */}
          <Form.Item label="Duration" name="duration">
            <Input readOnly />
          </Form.Item>

          {/* Auto-filled Charges field */}
          <Form.Item label="Charges" name="charges">
            <Input readOnly prefix="Rs. " />
          </Form.Item>

          {/* Date Selection with past dates disabled */}
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              onChange={handleDateOrPreferenceChange}
              disabledDate={disablePastDates}
            />
          </Form.Item>

          {/* Time Preference Selection */}
          <Form.Item
            label="Preferred Time"
            name="timePreference"
            rules={[
              { required: true, message: "Please select preferred time" },
            ]}
          >
            <Select
              placeholder="Select preferred time"
              options={timePreferences}
              onChange={handleDateOrPreferenceChange}
            />
          </Form.Item>

          {/* Conditional rendering of time slots after availability check */}
          {showTime && (
            <>
              <Form.Item label="Start Time" name="startTime">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="End Time" name="endTime">
                <Input readOnly />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* Appointments List */}
      <Row gutter={[0, 16]}>
        {appointments.map((appointment) => (
          <Col span={24} key={appointment.APPOINTMNET_ID}>
            <Card
              title={`Appointment ${appointment.APPOINTMNET_ID}`}
              style={{ width: "100%" }}
              extra={
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "cancel",
                        label: "Cancel",
                        onClick: () => handleStatusChange(appointment.APPOINTMNET_ID),
                      },
                    ],
                  }}
                  trigger={["click"]}
                  disabled={appointment?.STATUS === "cancelled"}
                >
                  <Tag
                    color={getStatusColor(appointment?.STATUS)}
                    style={{ cursor: "pointer" }}
                  >
                    {appointment?.STATUS?.toUpperCase() || 'PENDING'} <DownOutlined />
                  </Tag>
                </Dropdown>
              }
            >

              {/* Grid layout for appointment details */}
              <Row gutter={[24, 16]}>

                {/* Doctor Information Section */}
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <Text type="secondary">Doctor</Text>
                      <div>
                        <Text strong>Dr.{appointment.DOCTOR_NAME}</Text>
                      </div>
                    </Col>
                  </Row>
                </Col>

                {/* Patient Information Section */}
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <Text type="secondary">Patient</Text>
                      <div>
                        <Text strong>{appointment.PATIENT_NAME}</Text>
                      </div>
                    </Col>
                  </Row>
                </Col>

                {/* Appointment Date Section */}
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <Text type="secondary">Date</Text>
                      <div>
                        <Text strong>{appointment.DATE}</Text>
                      </div>
                    </Col>
                  </Row>
                </Col>

                {/* Start Time Section */}
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <Text type="secondary">Strat Time</Text>
                      <div>
                        <Text strong>{appointment.START_TIME}</Text>
                      </div>
                    </Col>
                  </Row>
                </Col>

                {/* End Time Section */}
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <Text type="secondary">End Time</Text>
                      <div>
                        <Text strong>{appointment.END_TIME}</Text>
                      </div>
                    </Col>
                  </Row>
                </Col>

                {/* Charges Section with green color for amount */}
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <Text type="secondary">Charges</Text>
                      <div>
                        <Text strong style={{ color: "#389e0d" }}>
                          Rs. {appointment.PRICE}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Export the UpcomingAppointment component
export default UpcomingAppointment;
