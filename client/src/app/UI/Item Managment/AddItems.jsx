// Import necessary dependencies
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Tag,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import CommonLoading from "../../../utils/CommonLoading";

const AddItems = () => {

  // State management for component
  const [searchText, setSearchText] = useState(""); // Store search input
  const searchInputRef = useRef(null); // Reference to search input field
  const searchTimeoutRef = useRef(null); // For debouncing search
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [form] = Form.useForm(); // Form instance for add/edit item
  const [currentpage, setCurrentPage] = useState(1); // Current page number
  const [items_per_page, setItemsPerPage] = useState(5); // Items per page
  const [tableData, setTableData] = useState([]); // Store items data
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [isEditMode, setIsEditMode] = useState(false); // Toggle between add/edit mode
  const [selectedItem, setSelectedItem] = useState(null); // Store selected item for editing
  const [itemID, setItemID] = useState(null); // Store new item ID
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch items data with search and pagination
  const getItemsData = async (searchText, page, items_per_page) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/items/get", {
        search: searchText,
        page,
        limit: items_per_page,
      });

      // Format response data for table
      const formattedData = response.data?.data.map((item) => ({
        code: item.ITEM_ID,
        name: item.ITEM_NAME,
        description: item.ITEM_DESCRIPTION,
        unit: item.UNIT,
        status: item.STATUS === 1 ? "Active" : "Inactive",
      }));
      setTableData(formattedData);
      setPagination({
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch items data:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    } finally {

      // Focus search input after loading
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        setLoading(false);
      }, 1000);
    }
  };

  // Fetch new item ID from server
  const getItemID = async () => {
    try {
      const response = await axios.get("/api/items/get/ID");
      setItemID(response.data.newid);
    } catch (error) {
      console.error("Failed to fetch item ID:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  // Load initial data and refresh on dependencies change
  useEffect(() => {
    getItemsData(searchText, currentpage, items_per_page);
    getItemID();
  }, [searchText, currentpage, items_per_page]);

  // Handle search with debounce
  const handleSearch = (value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchText(value);
      setCurrentPage(1);
    }, 500);
  };

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setItemsPerPage(pagination.pageSize);
  };

  // Handle edit button click
  const handleEditClick = (record) => {
    setIsEditMode(true);
    setSelectedItem(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      description: record.description,
      unit: record.unit,
      status: record.status === "Active" ? "1" : "0",
    });
    setIsModalOpen(true);
  };

  // Define table columns
  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "success" : "error"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditClick(record)}>
            <i className="bi bi-pencil-fill"></i>
          </Button>
        </Space>
      ),
    },
  ];

  // Handle form submission
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        code: isEditMode ? selectedItem.code : values.code,
        name: values.name,
        description: values.description,
        unit: values.unit,
        status: parseInt(values.status),
      };      

      // Handle edit or add based on mode
      if (isEditMode) {
        const response = await axios.put(`/api/items/edit`, data);
        toast.success(response?.data?.message || "Item updated successfully");
        setIsEditMode(false);
        setSelectedItem(null);
      } else {
        const response = await axios.post("/api/items/add", data);
        toast.success(response?.data?.message || "Item added successfully");
        getItemID();
        getItemsData(searchText, currentpage, items_per_page);
      }

      form.resetFields();
      setIsModalOpen(false);
      getItemsData(searchText, currentpage, items_per_page);
    } catch (error) {
      console.error("Failed:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedItem(null);
  };

  // Handle add new item button click
  const handleAddNewClick = () => {
    form.resetFields();
    // Set the itemID as the code value when opening the modal for a new item
    form.setFieldsValue({ code: itemID });
    setIsModalOpen(true);
    setIsEditMode(false);
  };

  // Component render
  return (
    <div className="p-4">

      {/* Search and Add New button row */}
      <div className="flex justify-between mb-4">
        <Input
          ref={searchInputRef}
          placeholder="Search items..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNewClick}
        >
          Add New
        </Button>
      </div>

      {/* Items table */}
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15", "20"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
      />

      {/* Add/Edit modal */}
      <Modal
        title={isEditMode ? "Edit Item" : "Add New Item"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="itemForm"
          validateTrigger="onBlur"
        >

          {/* Form fields in two columns */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Code"
                rules={[
                  { required: true, message: "Code is required" },
                  { max: 20, message: "Code cannot exceed 20 characters" },
                ]}
              >
                <Input maxLength={20} readOnly />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  { required: true, message: "Name is required" },
                  { max: 50, message: "Name cannot exceed 40 characters" },
                ]}
              >
                <Input maxLength={40} />
              </Form.Item>
            </Col>
          </Row>

          {/* Description field */}
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Description is required" },
              { max: 100, message: "Description cannot exceed 100 characters" },
            ]}
          >
            <Input.TextArea rows={4} maxLength={200} />
          </Form.Item>

          {/* Unit and Status fields */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: "Unit is required" }]}
              >
                <Select placeholder="Select unit">
                  <Select.Option value="Box">Box</Select.Option>
                  <Select.Option value="Kilogram">Kilogram</Select.Option>
                  <Select.Option value="Liter">Liter</Select.Option>
                  <Select.Option value="Bottle">Bottle</Select.Option>
                  <Select.Option value="Pack">Pack</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Status is required" }]}
                initialValue="1"
              >
                <Select placeholder="Select status">
                  <Select.Option value="1">Active</Select.Option>
                  <Select.Option value="0">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Loading overlay */}
      {loading && <CommonLoading />}
    </div>
  );
};

export default AddItems;
