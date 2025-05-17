// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Form,
  Select,
  Row,
  Col,
  InputNumber,
  DatePicker,
} from 'antd';
import axios from 'axios';
import { toast } from 'react-toastify';
import CommonLoading from '../../../utils/CommonLoading';

// GRN Component for managing goods received notes
const GRN = () => {

  // Initialize form and state variables
  const [form] = Form.useForm();
  const [items, setItems] = useState([]); // Store items for dropdown
  const [loading, setLoading] = useState(false); // Loading state
  const [tableData, setTableData] = useState([]); // Store GRN records
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Define table columns configuration
  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'ITEM_NAME',
      key: 'itemName',
    },
    {
      title: 'Item Code',
      dataIndex: 'ITEM_ID',
      key: 'itemCode',
    },
    {
      title: 'Received Date',
      dataIndex: 'RECEIVED_DATE',
      key: 'receivedDate',
    },
    {
      title: 'Quantity',
      dataIndex: 'QUANTITY',
      key: 'quantity',
    },
    {
      title: 'Unit',
      dataIndex: 'UNIT',
      key: 'unit',
    }
  ];

  // Fetch items for dropdown list
  const itemDDList = async() => {
    try {
      const response = await axios.get("/api/items/get/itemdd");
      setItems(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch item DD list:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
      return [];
    }
  }

  // Load items on component mount
  useEffect(() => {
    itemDDList();
  }, []);

  // Handle form submission for new GRN
  const handleSubmit = async (values) => {
    try {

      // Prepare data for API
      const data = {
        itemId: values.itemName,
        receivedDate: values.receivedDate.format('YYYY-MM-DD'),
        quantity: values.quantity,
      };

      // Send POST request to create new GRN
      const response = await axios.post("/api/items/add/grn", data);
      toast.success(response?.data?.message || "GRN added successfully");
      form.resetFields();
      getGRNData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

  // Fetch GRN records with pagination
  const getGRNData = async (page, pageSize) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/items/get/grn", {
        page,
        limit: pageSize,
      });
      setTableData(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch GRN data:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Handle table pagination changes
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Load GRN data when pagination changes
  useEffect(() => {
    getGRNData(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className="p-4">

      {/* GRN Entry Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mb-4"
      >
        <Row gutter={16}>

          {/* Item Selection Dropdown */}
          <Col span={6}>
            <Form.Item
              name="itemName"
              label="Select Item"
              rules={[{ required: true, message: 'Please select an item' }]}
            >
              <Select
                options={items.map(item => ({
                  value: item.ITEM_ID,
                  label: item.ITEM_NAME,
                }))}
                onChange={(value) => {

                  // Auto-fill unit when item is selected
                  const item = items.find(i => i.ITEM_ID === value);
                  form.setFieldsValue({ unit: item?.UNIT });
                }}
              />
            </Form.Item>
          </Col>

          {/* Date Picker for Received Date */}
          <Col span={6}>
            <Form.Item
              name="receivedDate"
              label="Received Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {/* Read-only Unit Display */}
          <Col span={4}>
            <Form.Item
              name="unit"
              label="Unit"
            >
              <Input readOnly />
            </Form.Item>
          </Col>

          {/* Submit Button */}
          <Col span={4}>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit">
                Add GRN
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* GRN Records Table */}
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '15', '20'],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
      />

      {/* Loading Overlay */}
      {loading && <CommonLoading />}
    </div>
  );
};

export default GRN;
