// Import necessary dependencies
import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Tag,
  Form,
  Select,
  Row,
  Col,
  InputNumber,
  Divider,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import CommonLoading from "../../../utils/CommonLoading";

const RequvestNote = () => {

  // State management for component
  const [searchText, setSearchText] = useState(""); // Search input text
  const [isModalOpen, setIsModalOpen] = useState(false); // Add new request modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // View details modal
  const [selectedRecord, setSelectedRecord] = useState(null); // Selected record for viewing
  const searchInputRef = useRef(null); // Reference to search input
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [form] = Form.useForm(); // Main form instance
  const [orderDetails, setOrderDetails] = useState([]); // Order items list
  const [orderItemForm] = Form.useForm(); // Form for adding order items
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal
  const [editForm] = Form.useForm(); // Edit form instance
  const [loading, setLoading] = useState(false); // Loading state
  const [currentpage, setCurrentPage] = useState(1); // Current page number
  const [items_per_page, setItemsPerPage] = useState(5); // Items per page
  const searchTimeoutRef = useRef(null); // For debouncing search
  const [tableData, setTableData] = useState([]); // Main table data
  const [items, setItems] = useState([]); // Items list for dropdown
  const [supplier, setSupplier] = useState([]); // Suppliers list
  const [orderId, setOrderId] = useState(); // Current order ID
 
  // Status options for dropdowns
  const paymentStatusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Partial", label: "Partial" },
    { value: "Paid", label: "Paid" },
  ];

  const orderStatusOptions = [
    { value: "Processing", label: "Processing" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Completed", label: "Completed" },
  ];

  // Fetch items for dropdown
  const itemDDList = async () => {
    try {
      const response = await axios.get("/api/items/get/itemdd");
      setItems(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch item DD list:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
      return [];
    }
  };

  // Fetch suppliers for dropdown
  const SupplierDDList = async () => {
    try {
      const response = await axios.get("/api/user/get/supplierddList");
      setSupplier(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch item DD list:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
      return [];
    }
  };

  // Generate new order ID
  const OrderId = async () => {
    try {
      const response = await axios.get("/api/items/generateOrderId");
      setOrderId(response?.data?.newid);
    } catch (error) {
      console.error("Failed to fetch item DD list:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  // Load initial data
  useEffect(() => {
    itemDDList();
    SupplierDDList();
    OrderId();
  }, []);

  // Define table columns
  const columns = [

    // ... columns configuration ...
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Supplier Name",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Total Value",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (value) =>
        value ? `Rs. ${Number(value).toFixed(2)}` : "Rs. 0.00",
    },
    {
      title: "Paid Value",
      dataIndex: "paidValue",
      key: "paidValue",
      render: (value) =>
        value ? `Rs. ${Number(value).toFixed(2)}` : "Rs. 0.00",
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => (
        <Tag color={status === "Paid" ? "success" : "warning"}>{status}</Tag>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => (
        <Tag color={status === "Completed" ? "success" : "processing"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleViewClick(record)}>
            <i className="bi bi-eye-fill"></i>
          </Button>
          <Button type="link" onClick={() => handleEditClick(record)}>
            <i className="bi bi-pencil-fill"></i>
          </Button>
        </Space>
      ),
    },
  ];

  // Format options for dropdowns
  const supplierOptions = supplier.map((supplier) => ({
    value: supplier.USER_ID,
    label: supplier.NAME,
  }));

  const itemOptions = items.map((item) => ({
    value: item.ITEM_ID,
    label: item.ITEM_NAME,
  }));

  // Define columns for order details tables
  const orderDetailsColumns = [

    // ... order details columns ...
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Action",
      key: "action",
      render: (_, __, index) => (
        <Button
          type="link"
          danger
          onClick={() => handleRemoveOrderDetail(index)}
        >
          <i className="bi bi-trash"></i>
        </Button>
      ),
    },
  ];

  const viewDetailsColumns = [

    // ... view details columns ...
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
  ];

  // Fetch request notes data
  const getRequestNotes = async (searchText, page, items_per_page) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/items/get/requestOrder", {
        search: searchText,
        page,
        limit: items_per_page,
      });

      // Format response data for table
      const formattedData = response.data?.data
        .map((item, index) => ({

          // ... data mapping ...
          key: index,
          orderId: item.ORDER_ID,
          date: item.DATE,
          supplierName: `${item.FIRST_NAME} ${item.LAST_NAME}`,
          totalValue: Number(item.TOTAL_VALUE) || 0,
          paidValue: Number(item.PAID_VALUE) || 0,
          paymentStatus: item.PAYMENT_STATUS,
          orderStatus: item.ORDER_STATUS,
          orderDetails: (item.orderDetails || []).map((detail) => ({
            itemName: detail.itemName,
            quantity: detail.quantity,
            unit: detail.unit,
          })),
        }))
        .filter((item) => item.orderDetails.length > 0);
      setTableData(formattedData);
      setPagination({
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch request notes:", error);
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

  // Handle table pagination
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setItemsPerPage(pagination.pageSize);
  };

  // Load data when dependencies change
  useEffect(() => {
    getRequestNotes(searchText, currentpage, items_per_page);
  }, [searchText, currentpage, items_per_page]);

  // Handle form actions
  const handleAddNewClick = () => {
    form.setFieldsValue({
      orderId: orderId,
    });
    setIsModalOpen(true);
  };

  const handleAddOrderDetail = () => {
    orderItemForm.validateFields().then((values) => {
      const selectedItem = items.find(
        (item) => item.ITEM_ID === values.itemName
      );
      setOrderDetails([
        ...orderDetails,
        {
          itemName: selectedItem.ITEM_NAME,
          itemId: selectedItem.ITEM_ID,
          quantity: values.quantity,
          unit: selectedItem.UNIT,
        },
      ]);
      orderItemForm.resetFields();
    });
  };

  // Remove item from order
  const handleRemoveOrderDetail = (index) => {
    setOrderDetails(orderDetails.filter((_, i) => i !== index));
  };

  // Handle modal submissions
  const handleModalOk = async () => {

    // ... modal submission logic ...
    if (orderDetails.length === 0) {
      return;
    }
    try {
      const values = await form.validateFields();
      const data = {
        orderId: values.orderId,
        supplier: values.supplier,
        totalValue: values.totalValue,
        items: orderDetails,
      };

      const response = await axios.post("/api/items/add/requestOrder", data);
      toast.success(
        response?.data?.message || "Request note added successfully"
      );

      setIsModalOpen(false);
      form.resetFields();
      orderItemForm.resetFields();
      setOrderDetails([]);
      getRequestNotes(searchText, currentpage, items_per_page);
    } catch (error) {
      console.error("Failed:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (record) => {

    // ... edit click logic ...
    editForm.setFieldsValue({
      orderId: record.orderId,
      totalValue: record.totalValue,
      paidValue: record.paidValue,
      paymentAmount: 0,
      paymentStatus: record.paymentStatus,
      orderStatus: record.orderStatus,
    });
    setIsEditModalOpen(true);
  };

  // Validate payment amount
  const validatePaymentAmount = (_, value) => {

    // ... payment validation logic ...
    const totalValue = editForm.getFieldValue("totalValue");
    const paidValue = editForm.getFieldValue("paidValue") || 0;

    if (value + paidValue > totalValue) {
      return Promise.reject(
        new Error(`Total payment cannot exceed ${totalValue}`)
      );
    }
    return Promise.resolve();
  };

  // Handle edit form submission
  const handleEditOk = async () => {

    // ... edit submission logic ...
    try {
      const values = await editForm.validateFields();
      const data = {
        orderId: values.orderId,
        paymentAmount: values.paymentAmount,
        paymentStatus: values.paymentStatus,
        orderStatus: values.orderStatus,
      };

      const response = await axios.put("/api/items/edit/requestOrder", data);
      toast.success(
        response?.data?.message || "Request note updated successfully"
      );
      setIsEditModalOpen(false);
      editForm.resetFields();
      getRequestNotes(searchText, currentpage, items_per_page);
    } catch (error) {
      console.error("Failed:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  // Component render with UI elements
  return (
    <div className="p-4">

      {/* Search and Add New button */}
      <div className="flex justify-between mb-4">
        <Input
          ref={searchInputRef}
          placeholder="Search orders..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNewClick}
        >
          Add New Request
        </Button>
      </div>
 
      {/* Main table */}
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

      {/* Add New Request Modal */}
      <Modal
        title="Add New Request"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          orderItemForm.resetFields();
          setOrderDetails([]);
        }}
        width={800}
        okButtonProps={{
          disabled: orderDetails.length === 0,
        }}
      >

        {/* ... modal content ... */}
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="orderId"
                label="Order ID"
                rules={[{ required: true }]}
              >
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true }]}
              >
                <Select options={supplierOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalValue"
                label="Total Value (Rs)"
                rules={[
                  { required: true, message: "Please enter the total value" },
                  {
                    validator: (_, value) =>
                      value > 0
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be a positive number")
                          ),
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form
            form={orderItemForm}
            layout="inline"
            style={{ marginBottom: "1rem" }}
          >
            <Form.Item
              name="itemName"
              rules={[{ required: true }]}
              style={{ width: "30%" }}
            >
              <Select
                options={itemOptions}
                placeholder="Select Item"
                onChange={(value) => {
                  const item = items.find((i) => i.ITEM_ID === value);
                  orderItemForm.setFieldsValue({ unit: item?.UNIT });
                }}
              />
            </Form.Item>
            <Form.Item
              name="quantity"
              rules={[{ required: true }]}
              style={{ width: "30%" }}
            >
              <InputNumber
                min={1}
                placeholder="Quantity"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item name="unit" style={{ width: "20%" }}>
              <Input readOnly />
            </Form.Item>
            <Button type="primary" onClick={handleAddOrderDetail}>
              Add Order
            </Button>
          </Form>

          <Table
            columns={orderDetailsColumns}
            dataSource={orderDetails}
            pagination={false}
            title={() => "Order Details"}
          />
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={600}
      >

        {/* ... view modal content ... */}
        <Table
          columns={viewDetailsColumns}
          dataSource={[...(selectedRecord?.orderDetails || [])]}
          pagination={false}
          title={() => "Order Items"}
        />
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        title="Edit Order"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
        }}
        width={600}
      >

        {/* ... edit modal content ... */}
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orderId" label="Order ID">
                <Input readOnly />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalValue" label="Total Value (Rs)">
                <InputNumber style={{ width: "100%" }} readOnly />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paidValue" label="Paid Value (Rs)">
                <InputNumber style={{ width: "100%" }} readOnly />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentAmount"
                label="Add Payment Amount (Rs)"
                dependencies={["totalValue", "paidValue"]}
                rules={[
                  { required: true, message: "Please enter payment amount" },
                  { validator: validatePaymentAmount },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  disabled={
                    editForm.getFieldValue("totalValue") ===
                    editForm.getFieldValue("paidValue")
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentStatus"
                label="Payment Status"
                rules={[{ required: true }]}
              >
                <Select options={paymentStatusOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderStatus"
                label="Order Status"
                rules={[{ required: true }]}
              >
                <Select options={orderStatusOptions} />
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

export default RequvestNote;
