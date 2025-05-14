// Import necessary React hooks and components
import React, { useState, useEffect } from "react";

// Import required Ant Design components
import {
  Card,
  Select,
  Row,
  Col,
  Typography,
  Collapse,
  Tag,
  Descriptions,
  Empty,
  Spin,
} from "antd";

// Import Ant Design icons
import {
  CalendarOutlined,
  DollarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

// Import axios for API calls and moment for date formatting
import axios from "axios";
import moment from "moment";

// Destructure Typography and Collapse components
const { Text, Title } = Typography;
const { Panel } = Collapse;

// Main component for displaying past appointments
const PastAppoinmentData = () => {

  // State management for loading status and data
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [relatedAccounts, setRelatedAccounts] = useState([]);
  const [allPatients, setAllPatients] = useState([]);

  // Get logged-in user data from localStorage
  const user = JSON.parse(localStorage.getItem("User"));

  // Effect hook to fetch initial data based on user role
  useEffect(() => {
    if (user?.role === "patient") {
      fetchRelatedAccounts();
    } else {
      fetchAllPatients();
    }
  }, [user?.role]);

  // Function to fetch all patients (for staff members)
  const fetchAllPatients = async () => {
    try {
      const response = await axios.get("/api/user/get/patientDDlist");
      setAllPatients(response.data);
      // Don't set default selection for non-patient users
    } catch (error) {
      console.error("Error fetching patient list:", error);
    }
  };

  // Function to fetch related accounts (for patients)
  const fetchRelatedAccounts = async () => {
    try {
      const response = await axios.get(
        `/api/user/get/relevantUserDDList/${user?.id}`
      );
      setRelatedAccounts(response?.data || []);
      // Set current user as default selected and fetch their appointments
      setSelectedUser(user?.id);
      fetchAppointments(user?.id);
    } catch (error) {
      console.error("Error fetching related accounts:", error);
    }
  };

  // Function to fetch appointments for a specific user
  const fetchAppointments = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/appointments/getpast/${userId}`);
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for user selection change
  const handleUserChange = (value) => {
    setSelectedUser(value);
    fetchAppointments(value);
  };

  // Function to generate options for user selection dropdown
  const getUserOptions = () => {
    if (user?.role === "patient") {

      // Options for patients include themselves and related accounts
      return [
        { value: user?.id, label: `${user?.firstName} ${user?.lastName} (You)` },
        ...(relatedAccounts?.map((account) => ({
          value: account.RELATED_ID,
          label: `${account.NAME} (${account.RELATIONSHIP})`,
        })) || []),
      ];
    } else {

      // Options for staff include all patients
      return allPatients.map((patient) => ({
        value: patient.USER_ID,
        label: patient.NAME,
        searchText: `${patient.NAME} ${patient.USER_ID}`
      }));
    }
  };

  return (

    // Main container with padding
    <div style={{ padding: "24px" }}>
      <Row gutter={[0, 24]}>
        <Col span={24}>

          {/* Header card with title and patient selector */}
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4}>Past Appointments</Title>
              </Col>
              <Col span={8}>
                
                {/* Patient selection dropdown with search functionality */}
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Select Patient"
                  options={getUserOptions()}
                  value={selectedUser}
                  onChange={handleUserChange}
                  filterOption={(input, option) => {
                    if (user?.role === "patient") {
                      return option?.label?.toLowerCase().includes(input.toLowerCase());
                    } else {
                      return option?.searchText?.toLowerCase().includes(input.toLowerCase());
                    }
                  }}
                  optionRender={(option) => (
                    user?.role === "patient" ? (
                      option.label
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{option.label}</span>
                        <span style={{ color: '#888' }}>{option.value}</span>
                      </div>
                    )
                  )}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Appointments display section */}
        <Col span={24}>
          <Spin spinning={loading}>
            {appointments.length > 0 ? (

              // Collapsible panels for appointments
              <Collapse>
                {appointments.map((appointment) => (
                  <Panel
                    key={appointment.APPOINTMNET_ID}
                    header={

                      // Panel header with appointment ID, date, and price
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>{appointment.APPOINTMNET_ID}</Text>
                        </Col>
                        <Col>
                          <Tag icon={<CalendarOutlined />} color="blue">
                            {moment(appointment.DATE).format("MMM DD, YYYY")}
                          </Tag>
                          <Tag icon={<DollarOutlined />} color="green">
                            Rs. {appointment.PRICE}
                          </Tag>
                        </Col>
                      </Row>
                    }
                  >

                    {/* Appointment details section */}
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="Doctor" span={2}>
                        Dr. {appointment.DOCTOR_NAME}
                      </Descriptions.Item>
                      <Descriptions.Item label="Time">
                        {appointment.START_TIME} - {appointment.END_TIME}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag
                          color={
                            appointment.STATUS === "completed"
                              ? "green"
                              : "orange"
                          }
                        >
                          {appointment.STATUS?.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Doctor's Note" span={2}>
                        {appointment.DOCTOR_UPDATE || "No notes"}
                      </Descriptions.Item>
                    </Descriptions>

                    {/* Prescribed items section */}
                    <div style={{ marginTop: "16px" }}>
                      <Title level={5}>
                        <MedicineBoxOutlined /> Prescribed Items
                      </Title>
                      <Row gutter={[16, 16]}>
                        {appointment.ITEMS.map((item) => (
                          <Col span={8} key={item.ITEM_ID}>
                            <Card size="small">
                              <Text strong>{item.ITEM_NAME}</Text>
                              <br />
                              <Text type="secondary">
                                {item.COUNT} {item.UNIT}
                              </Text>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            ) : (

              // Empty state when no appointments found
              <Empty description="No past appointments found" />
            )}
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default PastAppoinmentData;
