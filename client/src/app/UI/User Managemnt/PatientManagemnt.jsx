import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Form,
  Tag,
  Avatar,
  Modal,
  Radio,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import CommonLoading from "../../../utils/CommonLoading";

const BASE_IMAGE_URL = '/api/user/images';

const PatientManagemnt = () => {
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
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMemberData = async (searchText, page, items_per_page) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/user/getPateint", {
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

  useEffect(() => {
    getMemberData(searchText, currentpage, items_per_page);
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
    setSelectedMember(record);
    form.setFieldsValue({
      userId: record.userId,
      name: `${record.firstName} ${record.lastName}`,
      email: record.email,
      status: record.status === 'Active' ? '1' : '0'
    });
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        userId: selectedMember?.userId,
        status: values.status,
      }
      const response = await axios.put(`/api/user/editPateint`, data);
      toast.success(response?.data?.message);
      setIsModalOpen(false);
      setSelectedMember(null);
      form.resetFields();
      getMemberData(searchText, currentpage, items_per_page);
    } catch (error) {
      console.error("Failed:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setSelectedMember(null);
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

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Input
          ref={searchInputRef}
          placeholder="Search patient..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
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
        title="Edit Patient Status"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="patientForm"
        >
          <Form.Item
            name="userId"
            label="User ID"
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="name"
            label="Full Name"
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Radio.Group>
              <Radio value="1">Active</Radio>
              <Radio value="0">Inactive</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {loading && <CommonLoading />}
    </div>
  );
};

export default PatientManagemnt;
