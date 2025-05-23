import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  Radio,
  Row,
  Col,
  Tag,
  Avatar,
  Upload,
  Select,
} from "antd";
import { SearchOutlined, PlusOutlined, CameraOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import CommonLoading from "../../../utils/CommonLoading";
import ImageCropper from '../../../components/ImageCropper';

const BASE_IMAGE_URL = '/api/user/images';

const MemberManagemnt = () => {
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentpage, setCurrentPage] = useState(1);
  const [items_per_page, setItemsPerPage] = useState(5);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [userId, setUserId] = useState(null);

  const getMemberData = async (searchText, page, items_per_page) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/user/get", {
        search: searchText,
        page,
        limit: items_per_page,
      });
      const formattedData = response.data?.data.map(item => ({
        key: item.ID,
        userId: item.USER_ID,
        firstName: item.FIRST_NAME,
        lastName: item.LAST_NAME,
        email: item.EMAIL,
        phone: item.PHONE_NUMBER,
        line1: item.LINE_1 || "",
        line2: item.LINE_2 || "",
        city: item.CITY,
        postalCode: item.POSTAL_CODE,
        state: item.SATATE,
        status: item.STATUS === 1 ? 'Active' : 'Inactive',
        role: item.ROLE,
        profileImage: item.IMAGE ? `${BASE_IMAGE_URL}/${item.IMAGE}` : `${BASE_IMAGE_URL}/default-avatar.jpg`
      }));
      setTableData(formattedData);
      setPagination({
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch member data:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    } finally {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        setLoading(false);
      }, 1000);
    }
  };

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
    getMemberData(searchText, currentpage, items_per_page);
    getUserId();
  }, [searchText, currentpage, items_per_page]);

  const handleSearch = (value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchText(value);
      setCurrentPage(1);
    }, 500);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setItemsPerPage(pagination.pageSize);
  };

  const handleEditClick = (record) => {
    setIsEditMode(true);
    setSelectedMember(record);
    form.setFieldsValue({
      ...record,
      addressLine1: record.line1,
      addressLine2: record.line2 === 'undefined' ? " " : record.line2,
      status: record.status === 'Active' ? '1' : '0'
    });
    setIsModalOpen(true);
  };

  const handleCropComplete = async (croppedArea) => {
    try {
      const canvas = document.createElement('canvas');
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

      const ctx = canvas.getContext('2d');
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

      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCroppedImage(croppedImageUrl);
      setShowCropper(false);
    } catch (e) {
      console.error(e);
      toast.error("Error processing image");
    }
  };

  const columns = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar size={32} src={record.profileImage} />
          {`${record.firstName} ${record.lastName}`}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Address",
      key: "address",
      render: (_, record) => {
        return record.line2 
          ? `${record.line1}, ${record.line2 === 'undefined' ? " " : record.line2 }`
          : record.line1;
      }
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Postal Code",
      dataIndex: "postalCode",
      key: "postalCode",
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditClick(record)}>
            <i className="bi bi-pencil-fill"></i>
          </Button>
        </Space>
      ),
    },
  ];

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      (isEditMode && selectedMember && formData.append("code", selectedMember?.userId));
      (!isEditMode && formData.append("code", userId));
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("addressLine1", values.addressLine1);
      formData.append("addressLine2", values.addressLine2);
      formData.append("city", values.city);
      formData.append("postalCode", values.postalCode);
      formData.append("state", values.state);
      formData.append("role", values.role);
      formData.append("status", values.status);

      // Convert base64 to blob and append
      if (croppedImage) {
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        formData.append("image", blob, "profile.jpg");
      }

      if (isEditMode) {
        const response = await axios.put(`/api/user/editUser`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(response?.data?.message);
        setIsEditMode(false);
        setSelectedMember(null);
      } else {
        const response = await axios.post("/api/user/addUser", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        getUserId();
        toast.success(response?.data?.message);
      }
      
      form.resetFields();
      setIsModalOpen(false);
      setSelectedImage(null);
      setCroppedImage(null);
      setShowCropper(false);
      getMemberData(searchText, currentpage, items_per_page);
    } catch (error) {
      console.error("Failed:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedMember(null);
    // Clear image states
    setSelectedImage(null);
    setCroppedImage(null);
    setShowCropper(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Input
          ref={searchInputRef}
          placeholder="Search members..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '15', '20'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={isEditMode ? "Edit Member" : "Add New Member"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="memberForm"
          validateTrigger="onBlur"
        >
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <Upload
                showUploadList={false}
                accept="image/*"
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
                    src={croppedImage || (selectedMember?.profileImage || `${BASE_IMAGE_URL}/default-avatar.jpg`)}
                    className="border-2 border-blue-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CameraOutlined className="text-white text-2xl" />
                  </div>
                </div>
              </Upload>
            </div>
            <span className="text-gray-500 text-sm mt-2 block">
              Click to change profile picture
            </span>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "First name is required" },
                  { max: 30, message: "First name cannot exceed 30 characters" }
                ]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Last name is required" },
                  { max: 30, message: "Last name cannot exceed 30 characters" }
                ]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email format" },
                  { max: 50, message: "Email cannot exceed 50 characters" }
                ]}
              >
                <Input maxLength={50} disabled={isEditMode} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: "Phone is required" },
                  { max: 15, message: "Phone number cannot exceed 15 characters" }
                ]}
              >
                <Input maxLength={15} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="addressLine1"
                label="Address Line 1"
                rules={[
                  { required: true, message: "Address Line 1 is required" },
                  { max: 30, message: "Address Line 1 cannot exceed 30 characters" }
                ]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="addressLine2"
                label="Address Line 2"
                rules={[
                  { max: 30, message: "Address Line 2 cannot exceed 30 characters" }
                ]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[
                  { required: true, message: "City is required" },
                  { max: 30, message: "City cannot exceed 30 characters" }
                ]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="postalCode"
                label="Postal Code"
                rules={[
                  { required: true, message: "Postal code is required" },
                  { max: 6, message: "Postal code cannot exceed 6 characters" }
                ]}
              >
                <Input maxLength={6} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="state"
                label="State"
                rules={[
                  { required: true, message: "State is required" },
                  { max: 30, message: "State cannot exceed 30 characters" }
                ]}
              >
                <Input maxLength={30} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Role is required" }]}
              >
                <Select placeholder="Select role">
                  <Select.Option value="Super Admin">Super Admin</Select.Option>
                  <Select.Option value="Doctor">Doctor</Select.Option>
                  <Select.Option value="Assistant">Assistant</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Status is required" }]}
                initialValue="1"
              >
                <Radio.Group>
                  <Radio value="1">Active</Radio>
                  <Radio value="0">Inactive</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Modal>

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

      {loading && <CommonLoading />}
    </div>
  );
};

export default MemberManagemnt;
