/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
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
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const UpcomingAppointment = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [treameantdata, setTreameantdata] = useState([]);
  const [relatedData, setRelatedData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem("User"));

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

  const treamnrDDlist = async () => {
    try {
      const response = await axios.get("/api/treaments/ddlist");
      setTreameantdata(response?.data);
    } catch (error) {
      console.error("Error fetching dd list", error);
    }
  };

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

  useEffect(() => {
    fetchRelatedAccounts();
    AppointmentId();
    treamnrDDlist();
    fetchDoctors();
    getHolidays();
    fetchAppoinmentData();
  }, []);

  const patients = [
    ...(user
      ? [{ value: user.id, label: `${user.firstName} ${user.lastName}` }]
      : []),
    ...(relatedData
      ?.filter((d) => d)
      ?.map((d) => ({
        value: String(d.RELATED_ID),
        label: `${d.NAME || "Unknown"} (${d.RELATIONSHIP || "Unknown"})`,
      })) || []),
    {
      value: "add_new",
      label: "+ Add New Patient",
      className: "add-new-option",
      style: { color: "#1890ff" },
    },
  ];

  const handlePatientSelect = (value) => {
    if (value === "add_new") {
      navigate("/app/profile");
      form.setFieldValue("patientId", undefined);
    }
  };

  const formatDurationToMinutes = (durationStr) => {
    const [hours, minutes] = durationStr.split(":").map(Number);
    return `${hours * 60 + minutes} mins`;
  };

  const treatments = treameantdata.map((t) => ({
    value: `${t.ID}`,
    label: t.NAME.trim(),
    duration: formatDurationToMinutes(t.DURATION),
    charges: parseFloat(t.COST),
  }));

  const timePreferences = [
    { value: "morning", label: "Morning (9 AM - 12 PM)" },
    { value: "afternoon", label: "Afternoon (12 PM - 5 PM)" },
    { value: "evening", label: "Evening (6 PM - 8 PM)" },
  ];

  const handleTreatmentChange = (value) => {
    const treatment = treatments.find((t) => t.value === value);
    form.setFieldValue("duration", treatment?.duration || "");
    form.setFieldValue("charges", treatment?.charges || "");
  };

  const handleFindTime = async () => {
    try {
      const values = await form.validateFields([
        "date",
        "timePreference",
        "treatmentId",
      ]);
      const treatment = treatments.find((t) => t.value === values.treatmentId);
      const duration = treatment?.duration?.split(" ")[0];

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

      if (data.message === "Time slot is available") {
        setStartTime(data.start_time);
        setEndTime(data.end_time);
        form.setFieldValue("startTime", data.start_time);
        form.setFieldValue("endTime", data.end_time);
        setShowTime(true);
      } else {
        toast.error("No time slot available");
      }
    } catch (error) {
      console.error("Error finding time:", error);
      message.error("Failed to find available time");
    }
  };

  const handleDateOrPreferenceChange = () => {
    form.setFieldValue("appointmentTime", "");
    setShowTime(false);
  };

  const handleStatusChange = async (appointmentId) => {
    try {
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
      fetchAppoinmentData();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
      setIsModalOpen(false);
      form.resetFields();
      setShowTime(false);
      await AppointmentId(); // Wait for new ID before closing modal
      await fetchAppoinmentData(); // Fetch updated appointment data
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create Appoinment, Plese try again!");
    }
  };

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

  const disablePastDates = (current) => {
    // Check if date is in the past
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
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Appointment
        </Button>
      </Row>
      <Modal
        title="Create New Appointment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
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
        <Form form={form} layout="vertical">
          <Form.Item label="Appointment ID" name="appointmentId">
            <Input readOnly defaultValue={appointmentId} />
          </Form.Item>
          <Form.Item
            label="Doctor"
            name="doctorId"
            rules={[{ required: true, message: "Please select a doctor" }]}
          >
            <Select placeholder="Select doctor" options={doctors} />
          </Form.Item>
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
          <Form.Item label="Duration" name="duration">
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Charges" name="charges">
            <Input readOnly prefix="Rs. " />
          </Form.Item>
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
              <Row gutter={[24, 16]}>
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

export default UpcomingAppointment;
