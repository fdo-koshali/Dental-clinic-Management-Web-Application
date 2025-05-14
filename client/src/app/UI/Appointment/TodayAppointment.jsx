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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState({}); // Change to object to store items by appointment ID
  const [itemsList, setItemsList] = useState([]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const user = JSON.parse(localStorage.getItem("User"));

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

  const loadItems = async () => {
    try {
      const response = await axios.get("/api/items/get/itemdd");
      setItemsList(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load items");
    }
  };

  useEffect(() => {
    loadAppointments();
    loadItems();
  }, []);

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

  const itemOptions = itemsList.map((item) => ({
    value: item.ITEM_ID,
    label: item.ITEM_NAME,
  }));

  const columns = (appointmentId) => {
    const baseColumns = [
      { title: "Item", dataIndex: "ITEM_NAME", key: "item" },
      { title: "Quantity", dataIndex: "COUNT", key: "quantity" },
      { title: "Unit", dataIndex: "UNIT", key: "unit" },
    ];

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

  const getAppointmentItems = (appointmentId) => {
    return items[appointmentId] || [];
  };

  return (
    <div style={{ padding: "24px" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[0, 16]}>
          {appointments.map((appointment) => (
            <Col span={24} key={appointment.APPOINTMNET_ID}>
              <Card
                title={`Appointment ${appointment.APPOINTMNET_ID}`}
                style={{ width: "100%" }}
                extra={
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <Dropdown
                      menu={{
                        items: [
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
                      disabled={appointment?.STATUS === "cancelled"}
                    >
                      <Tag
                        color={getStatusColor(appointment?.STATUS)}
                        style={{ cursor: "pointer" }}
                      >
                        {appointment?.STATUS?.toUpperCase() || "UPCOMING"}{" "}
                        <DownOutlined />
                      </Tag>
                    </Dropdown>
                    <Dropdown
                      menu={{
                        items: [
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
                      disabled={appointment?.PAYMENT_STATUS === "completed"}
                    >
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
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Text type="secondary">Doctor</Text>
                    <div>
                      <Text strong>{appointment.DOCTOR_NAME}</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Patient</Text>
                    <div>
                      <Text strong>{appointment.PATIENT_NAME}</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Date</Text>
                    <div>
                      <Text strong>{appointment.DATE}</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Start Time</Text>
                    <div>
                      <Text strong>{appointment.START_TIME}</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">End Time</Text>
                    <div>
                      <Text strong>{appointment.END_TIME}</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Charges</Text>
                    <div>
                      <Text strong style={{ color: "#389e0d" }}>
                        Rs. {appointment.PRICE}
                      </Text>
                    </div>
                  </Col>
                </Row>
                {editingId === appointment.APPOINTMNET_ID && (
                  <div
                    style={{
                      marginTop: 24,
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: 24,
                    }}
                  >
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form
                          form={form}
                          layout="vertical"
                          initialValues={{
                            additionalCharges:
                              appointment?.ADDITIONAL_CHARGES || 0,
                            doctorNote: appointment?.DOCTOR_UPDATE || "",
                          }}
                        >
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
                              <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                parser={(value) => value.replace(/[^\d]/g, "")}
                                formatter={(value) => `Rs. ${value}`}
                              />
                            </Form.Item>
                          )}

                          <Form.Item name="doctorNote" label="Doctor's Note">
                            <Input.TextArea
                              maxLength={500}
                              showCount
                              rows={4}
                              placeholder="Enter doctor's notes here..."
                            />
                          </Form.Item>
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

                      <Col span={12}>
                        <Form
                          form={itemForm}
                          layout="vertical"
                          initialValues={{
                            quantity: 1,
                            unit: "",
                          }}
                        >
                          {user?.role !== "Assistant" && (
                            <Row gutter={16}>
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
                              <Col span={5}>
                                <Form.Item name="unit" label="Unit">
                                  <Input />
                                </Form.Item>
                              </Col>
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

                          <Table
                            columns={columns(appointment.APPOINTMNET_ID)}
                            dataSource={getAppointmentItems(
                              appointment.APPOINTMNET_ID
                            )}
                            pagination={false}
                            size="small"
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
    </div>
  );
};

export default TodayAppointment;
