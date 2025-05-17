// Import necessary dependencies from React and other libraries
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Dropdown,
  Button,
  Input,
  Space,
  Table,
  Form,
  InputNumber,
  Select,
  Spin,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

// Destructure Typography components
const { Text, TextArea } = Typography;

// Main component for managing today's appointments
const TodayAppointment = () => {

  // State management for component data and UI controls
  const [appointments, setAppointments] = useState([]); // Store all appointments
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [editingId, setEditingId] = useState(null); // Track which appointment is being edited
  const [items, setItems] = useState({}); // Store items for each appointment
  const [itemsList, setItemsList] = useState([]); // Store available items for selection
  const [form] = Form.useForm(); // Form instance for charges and notes
  const [itemForm] = Form.useForm(); // Form instance for adding items
  const user = JSON.parse(localStorage.getItem("User")); // Get logged-in user data

  // Function to fetch today's appointments
  const loadAppointments = async () => {
    try {
      const response = await axios.get("/api/appointments/todayAppointment");
      setAppointments(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch available items for prescriptions
  const loadItems = async () => {
    try {
      const response = await axios.get("/api/items/get/itemdd");
      setItemsList(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load items");
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    loadAppointments();
    loadItems();
  }, []);

  // Function to update appointment status
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put("/api/appointments/status", {
        appointmentId,
        status: newStatus,
      });
      toast.success(`Appointment ${newStatus} successfully!`);
      loadAppointments(); // Refresh the appointments list
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  // Helper function to determine status tag color
  const getStatusColor = (status) => {
    if (!status) return "blue";
    switch (status.toLowerCase()) {
      case "started":
        return "orange";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "blue";
    }
  };

  // Helper function to determine payment status tag color
  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green";
      case "pending":
        return "orange";
      default:
        return "blue";
    }
  };

  // Function to update payment status
  const handlePaymentStatusChange = async (appointmentId) => {
    try {
      await axios.put("/api/appointments/payment-status", {
        appointmentId,
        paymentStatus: "completed",
      });
      toast.success("Payment status updated successfully");
      loadAppointments(); // Refresh the appointments list
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update payment status"
      );
    }
  };

  // Function to load items prescribed for a specific appointment
  const loadAppointmentItems = async (appointmentId) => {
    try {
      const response = await axios.get(
        `/api/appointments/items/${appointmentId}`
      );
      setItems((prev) => ({
        ...prev,
        [appointmentId]: response.data,
      }));
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load items");
    }
  };

  // Function to handle editing an appointment
  const handleEdit = (appointmentId) => {
    setEditingId(appointmentId === editingId ? null : appointmentId);
    if (appointmentId !== editingId) {
      const appointment = appointments.find(
        (a) => a.APPOINTMNET_ID === appointmentId
      );
      form.setFieldsValue({
        additionalCharges: appointment?.ADDITIONAL_CHARGES || 0,
        doctorNote: appointment?.DOCTOR_UPDATE || "",
      });
      loadAppointmentItems(appointmentId);
    }
  };

  // Function to add prescribed items to an appointment
  const handleAddItem = async (appointmentId) => {
    try {
      const values = itemForm.getFieldsValue();
      const selectedItem = itemsList.find(
        (item) => item.ITEM_ID === values.item
      );

      await axios.post("/api/appointments/items", {
        appointmentId,
        itemId: selectedItem.ITEM_ID,
        quantity: values.quantity,
      });

      // Refresh items list after adding
      await loadAppointmentItems(appointmentId);
      itemForm.resetFields();
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(error?.response?.data?.error || "Failed to add item");
    }
  };

  // Function to remove prescribed items from an appointment
  const handleRemoveItem = async (appointmentId, itemId, quantity) => {
    try {
      await axios.delete("/api/appointments/items", {
        data: {
          appointmentId,
          itemId,
          quantity,
        },
      });
      await loadAppointmentItems(appointmentId);
      toast.success("Item removed successfully");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  // Function to save additional charges and doctor's notes
  const handleSaveCharges = async (appointmentId) => {
    try {
      const values = form.getFieldsValue();
      await axios.put("/api/appointments/update-charges", {
        appointmentId,
        additionalCharges: values.additionalCharges,
        doctorNote: values.doctorNote,
      });
      form.setFieldsValue({ additionalCharges: 0 });
      toast.success("Charges and notes saved successfully");
      loadAppointments(); // Refresh the appointments list
    } catch (error) {
      console.error("Error saving charges and notes:", error);
      toast.error(
        error.response?.data?.error || "Failed to save charges and notes"
      );
    }
  };

  // Transform items list for select dropdown
  const itemOptions = itemsList.map((item) => ({
    value: item.ITEM_ID,
    label: item.ITEM_NAME,
  }));

  // Define table columns for prescribed items
  const columns = (appointmentId) => {
    const baseColumns = [
      { title: "Item", dataIndex: "ITEM_NAME", key: "item" },
      { title: "Quantity", dataIndex: "COUNT", key: "quantity" },
      { title: "Unit", dataIndex: "UNIT", key: "unit" },
    ];

    // Add remove action column for non-Assistant users
    if (user?.role !== "Assistant") {
      baseColumns.push({
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Button
            type="link"
            danger
            onClick={() =>
              handleRemoveItem(appointmentId, record.ITEM_ID, record.COUNT)
            }
          >
            Remove
          </Button>
        ),
      });
    }

    return baseColumns;
  };

  // Helper function to get items for a specific appointment
  const getAppointmentItems = (appointmentId) => {
    return items[appointmentId] || [];
  };

  // Render component UI
  return (
    <div style={{ padding: "24px" }}>
      {loading ? (

        // Show loading spinner while fetching data
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (

        // Render appointments list
        <Row gutter={[0, 16]}>
          {appointments.map((appointment) => (

            // Individual appointment card with details and actions
            <Col span={24} key={appointment.APPOINTMNET_ID}>
              <Card
                title={`Appointment ${appointment.APPOINTMNET_ID}`}
                style={{ width: "100%" }}

                // Extra section contains status controls and edit button
                extra={
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >

                    {/* Appointment status dropdown with color-coded tag */}
                    <Dropdown
                      menu={{
                        items: [

                          // Status options: upcoming, started, completed, cancelled
                          {
                            key: "upcoming",
                            label: "Upcoming",
                            onClick: () =>
                              handleStatusChange(
                                appointment.APPOINTMNET_ID,
                                "upcoming"
                              ),
                          },
                          {
                            key: "started",
                            label: "Started",
                            onClick: () =>
                              handleStatusChange(
                                appointment.APPOINTMNET_ID,
                                "started"
                              ),
                          },
                          {
                            key: "completed",
                            label: "Completed",
                            onClick: () =>
                              handleStatusChange(
                                appointment.APPOINTMNET_ID,
                                "completed"
                              ),
                          },
                          {
                            key: "cancelled",
                            label: "Cancelled",
                            onClick: () =>
                              handleStatusChange(
                                appointment.APPOINTMNET_ID,
                                "cancelled"
                              ),
                          },
                        ],
                      }}
                      trigger={["click"]}

                      // Disable status changes if appointment is cancelled
                      disabled={appointment?.STATUS === "cancelled"}
                    >

                      {/* Status tag with dynamic color based on current status */}
                      <Tag
                        color={getStatusColor(appointment?.STATUS)}
                        style={{ cursor: "pointer" }}
                      >
                        {appointment?.STATUS?.toUpperCase() || "UPCOMING"}{" "}
                        <DownOutlined />
                      </Tag>
                    </Dropdown>

                    {/* Payment status dropdown with color-coded tag */}
                    <Dropdown
                      menu={{
                        items: [

                          // Only option is to mark payment as completed
                          {
                            key: "completed",
                            label: "Completed",
                            onClick: () =>
                              handlePaymentStatusChange(
                                appointment.APPOINTMNET_ID
                              ),
                          },
                        ],
                      }}
                      trigger={["click"]}

                      // Disable if payment is already completed
                      disabled={appointment?.PAYMENT_STATUS === "completed"}
                    >

                    {/* Payment status tag with dynamic color */}
                      <Tag
                        color={getPaymentStatusColor(
                          appointment?.PAYMENT_STATUS
                        )}
                        style={{ cursor: "pointer" }}
                      >
                        PAYMENT:{" "}
                        {appointment?.PAYMENT_STATUS?.toUpperCase() ||
                          "PENDING"}{" "}
                        <DownOutlined />
                      </Tag>
                    </Dropdown>

                    {/* Edit/View details button with different text based on user role */}
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleEdit(appointment.APPOINTMNET_ID)}
                    >
                      {user?.role !== "Assistant" ? 'Edit' : 'See Details'}
                    </Button>
                  </div>
                }
              >

              {/* Appointment details grid layout */}
                <Row gutter={[24, 16]}>

                {/* Doctor information */}
                  <Col span={8}>
                    <Text type="secondary">Doctor</Text>
                    <div>
                      <Text strong>{appointment.DOCTOR_NAME}</Text>
                    </div>
                  </Col>

                  {/* Patient information */}
                  <Col span={8}>
                    <Text type="secondary">Patient</Text>
                    <div>
                      <Text strong>{appointment.PATIENT_NAME}</Text>
                    </div>
                  </Col>

                  {/* Appointment date */}
                  <Col span={8}>
                    <Text type="secondary">Date</Text>
                    <div>
                      <Text strong>{appointment.DATE}</Text>
                    </div>
                  </Col>

                  {/* Start time */}
                  <Col span={8}>
                    <Text type="secondary">Start Time</Text>
                    <div>
                      <Text strong>{appointment.START_TIME}</Text>
                    </div>
                  </Col>

                  {/* End time */}
                  <Col span={8}>
                    <Text type="secondary">End Time</Text>
                    <div>
                      <Text strong>{appointment.END_TIME}</Text>
                    </div>
                  </Col>

                  {/* Appointment charges */}
                  <Col span={8}>
                    <Text type="secondary">Charges</Text>
                    <div>
                      <Text strong style={{ color: "#389e0d" }}>
                        Rs. {appointment.PRICE}
                      </Text>
                    </div>
                  </Col>
                </Row>

                {/* Conditional rendering of edit form when appointment is being edited */}
                {editingId === appointment.APPOINTMNET_ID && (
                  <div
                    style={{
                      marginTop: 24,
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: 24,
                    }}
                  >
                    <Row gutter={24}>

                      {/* Left column: Additional charges and doctor's notes */}
                      <Col span={12}>
                        <Form
                          form={form}
                          layout="vertical"
                          initialValues={{

                            // Initialize form with existing values or defaults
                            additionalCharges:
                              appointment?.ADDITIONAL_CHARGES || 0,
                            doctorNote: appointment?.DOCTOR_UPDATE || "",
                          }}
                        >

                          {/* Additional charges input - Only visible to non-Assistant users */}
                          {user?.role !== "Assistant" && (
                            <Form.Item
                              name="additionalCharges"
                              label="Additional Charges"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter charges",
                                },
                              ]}
                            >

                              {/* Number input with currency formatting */}
                              <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                parser={(value) => value.replace(/[^\d]/g, "")} // Remove non-digit characters
                                formatter={(value) => `Rs. ${value}`} // Add currency prefix
                              />
                            </Form.Item>
                          )}

                          {/* Doctor's note text area */}
                          <Form.Item name="doctorNote" label="Doctor's Note">
                            <Input.TextArea
                              maxLength={500}
                              showCount
                              rows={4}
                              placeholder="Enter doctor's notes here..."
                            />
                          </Form.Item>

                          {/* Save button - Only visible to non-Assistant users */}
                          {user?.role !== "Assistant" && (
                            <Form.Item>
                              <Button
                                type="primary"
                                onClick={() =>
                                  handleSaveCharges(appointment.APPOINTMNET_ID)
                                }
                              >
                                Save Charges & Notes
                              </Button>
                            </Form.Item>
                          )}
                        </Form>
                      </Col>

                      {/* Right column: Prescribed items form */}
                      <Col span={12}>
                        <Form
                          form={itemForm}
                          layout="vertical"
                          initialValues={{
                            quantity: 1,
                            unit: "",
                          }}
                        >

                          {/* Item prescription form - Only visible to non-Assistant users */}
                          {user?.role !== "Assistant" && (
                            <Row gutter={16}>

                              {/* Item selection dropdown */}
                              <Col span={9}>
                                <Form.Item
                                  name="item"
                                  label="Item"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select an item",
                                    },
                                  ]}
                                >
                                  <Select
                                    options={itemOptions}
                                    onChange={(value) => {

                                      // Auto-fill unit when item is selected
                                      const item = itemsList.find(
                                        (i) => i.ITEM_ID === value
                                      );
                                      itemForm.setFieldsValue({
                                        unit: item?.UNIT,
                                      });
                                    }}
                                  />
                                </Form.Item>
                              </Col>

                              {/* Quantity input */}
                              <Col span={5}>
                                <Form.Item
                                  name="quantity"
                                  label="Quantity"
                                  rules={[
                                    { required: true, message: "Required" },
                                  ]}
                                >
                                  <InputNumber
                                    style={{ width: "100%" }}
                                    min={1}
                                  />
                                </Form.Item>
                              </Col>

                              {/* Unit input (auto-filled from selected item) */}
                              <Col span={5}>
                                <Form.Item name="unit" label="Unit">
                                  <Input />
                                </Form.Item>
                              </Col>

                              {/* Add item button */}
                              <Col span={4}>
                                <Button
                                  type="primary"
                                  onClick={() =>
                                    handleAddItem(appointment.APPOINTMNET_ID)
                                  }
                                  style={{ marginTop: 29 }}
                                >
                                  Add
                                </Button>
                              </Col>
                            </Row>
                          )}

                          {/* Table to display prescribed items for the appointment */}
                          <Table
                            columns={columns(appointment.APPOINTMNET_ID)}
                            dataSource={getAppointmentItems(
                              appointment.APPOINTMNET_ID
                            )}
                            pagination={false} // Disable pagination for small lists
                            size="small" // Compact table design
                            style={{ marginTop: 16 }}
                          />
                        </Form>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    {/* End of appointments list */}
    </div>
  );
};

// Export the TodayAppointment component for use in other parts of the application
export default TodayAppointment;
