import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Avatar,
  Upload,
  message,
  Space,
  Divider,
  Modal,
  Table,
} from "antd";
import { CameraOutlined, EditOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import ImageCropper from "../../components/ImageCropper";

const BASE_IMAGE_URL = "/api/user/images";

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm] = Form.useForm();
  const [isRelatedModalVisible, setIsRelatedModalVisible] = useState(false);
  const [relatedForm] = Form.useForm();
  const [relatedAccounts, setRelatedAccounts] = useState([]);
  const user = JSON.parse(localStorage.getItem("User"));
  const userId = user?.id || null;
  const [newUserId, setNewUserId] = useState(null);

  const getUserId = async () => {
    try {
      const response = await axios.get("/api/user/generateUserId");
      setNewUserId(response.data.newid);
    } catch (error) {
      console.error("Failed to generate user ID:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  useEffect(() => {
    fetchUserProfile();
    getUserId();
    fetchRelatedAccounts();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/profile/getProfile/${userId}`);
      const user = response.data;
      setUserData(user);
      form.setFieldsValue({
        registerNumber: userId,
        firstName: user.FIRST_NAME,
        lastName: user.LAST_NAME,
        email: user.EMAIL,
        phone: user.PHONE_NUMBER,
        addressLine1: user.LINE_1,
        addressLine2: user.LINE_2,
        city: user.CITY,
        postalCode: user.POSTAL_CODE,
        state: user.SATATE,
        role: user.ROLE,
      });
      setCroppedImage(user.IMAGE ? `${BASE_IMAGE_URL}/${user.IMAGE}` : null);
    } catch (error) {
      message.error("Failed to fetch profile data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedAccounts = async () => {
    try {
      const response = await axios.get(
        `/api/profile/getRelatedAccount/${userId}`
      );
      setRelatedAccounts(response.data);
    } catch (error) {
      message.error("Failed to fetch related accounts", error);
    }
  };

  const handleCropComplete = async (croppedArea) => {
    try {
      const canvas = document.createElement("canvas");
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = selectedImage;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = croppedArea.width;
      canvas.height = croppedArea.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        croppedArea.x * scaleX,
        croppedArea.y * scaleY,
        croppedArea.width * scaleX,
        croppedArea.height * scaleY,
        0,
        0,
        croppedArea.width,
        croppedArea.height
      );

      const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCroppedImage(croppedImageUrl);
      setShowCropper(false);
    } catch (e) {
      message.error("Error processing image", e);
    }
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });

      if (croppedImage && croppedImage.startsWith("data:")) {
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        formData.append("image", blob, "profile.jpg");
      }

      await axios.put("/api/profile/updateProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Profile updated successfully");
      fetchUserProfile();
    } catch (error) {
      message.error("Failed to update profile", error);
    }
  };

  const handlePasswordChange = async (values) => {
    const data = {
      userId: userId,
      password: values.newPassword,
    };
    try {
      await axios.post("/api/auth/registerUser", data);
      toast.success("Password updated successfully");
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update password"
      );
      toast.error("Password updated failed.");
    }
  };

  const handleRelatedAccount = async (values) => {
    try {
      const data = {
        ...values,
        mainId: userId,
        relatedID: newUserId,
      };
      await axios.post("/api/profile/addRelatedAccount", data);
      fetchRelatedAccounts();

      // Update user object in localStorage
      const currentUser = JSON.parse(localStorage.getItem("User"));
      if (!currentUser.relatedId) {
        currentUser.relatedId = [];
      }
      currentUser.relatedId.push(newUserId);
      localStorage.setItem("User", JSON.stringify(currentUser));

      setIsRelatedModalVisible(false);
      toast.success("Related account added successfully");
      relatedForm.resetFields();
    } catch (error) {
      message.error("Failed to add related account", error);
    }
  };

  const columns = [
    {
      title: "Register Number",
      dataIndex: "USER_ID",
      key: "registerNumber",
    },
    {
      title: "Name",
      dataIndex: "NAME",
      key: "name",
      render: (_, record) => `${record.FIRST_NAME} ${record.LAST_NAME}`,
    },
    {
      title: "Relationship",
      dataIndex: "RELATIONSHIP",
      key: "relationship",
    },
  ];

  return (
    <div className="p-4">
      <Card
        title="My Profile"
        loading={loading}
        extra={
          isEditing ? (
            <Space>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  form.setFieldsValue(userData);
                  fetchUserProfile();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                Save Changes
              </Button>
            </Space>
          ) : (
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </Space>
          )
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            onFinish(values);
            setIsEditing(false);
          }}
        >
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <Upload
                showUploadList={false}
                accept="image/*"
                disabled={!isEditing}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setSelectedImage(reader.result);
                    setShowCropper(true);
                  };
                  reader.readAsDataURL(file);
                  return false;
                }}
              >
                <div className="relative inline-block group">
                  <Avatar
                    size={128}
                    src={croppedImage || `${BASE_IMAGE_URL}/default-avatar.jpg`}
                    className={`border-2 ${
                      isEditing
                        ? "border-blue-500 cursor-pointer"
                        : "border-gray-300"
                    }`}
                  />
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <CameraOutlined className="text-white text-2xl" />
                    </div>
                  )}
                </div>
              </Upload>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="registerNumber" label="Register Number">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true }]}
              >
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="addressLine1"
                label="Address Line 1"
                rules={[{ required: true }]}
              >
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="addressLine2" label="Address Line 2">
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true }]}
              >
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="postalCode"
                label="Postal Code"
                rules={[{ required: true }]}
              >
                <Input readOnly={!isEditing} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Divider />

      {user?.role === "patient" && (
        <Card
          title="Related Accounts"
          extra={
            <Button onClick={() => setIsRelatedModalVisible(true)}>
              Add Related Account
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={relatedAccounts}
            rowKey="REGISTER_NUMBER"
            pagination={false}
          />
        </Card>
      )}

      <Divider />

      <Card
        title={
          <Space>
            <LockOutlined />
            <span>Change Password</span>
          </Space>
        }
        className="mt-4"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: "Please enter your new password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Add Related Account"
        open={isRelatedModalVisible}
        onCancel={() => {
          setIsRelatedModalVisible(false);
          relatedForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={relatedForm}
          layout="vertical"
          onFinish={handleRelatedAccount}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              { required: true, message: "Please enter first name" },
              { max: 30, message: "Maximum length is 30 characters" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              { required: true, message: "Please enter last name" },
              { max: 30, message: "Maximum length is 30 characters" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
              { max: 40, message: "Maximum length is 40 characters" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="relationship"
            label="Relationship"
            rules={[
              { required: true, message: "Please enter relationship" },
              { max: 15, message: "Maximum length is 15 characters" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Divider />

      {showCropper && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
