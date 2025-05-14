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

const GRN = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

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

  useEffect(() => {
    itemDDList();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const data = {
        itemId: values.itemName,
        receivedDate: values.receivedDate.format('YYYY-MM-DD'),
        quantity: values.quantity,
      };

      const response = await axios.post("/api/items/add/grn", data);
      toast.success(response?.data?.message || "GRN added successfully");
      form.resetFields();
      getGRNData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    }
  };

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

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  useEffect(() => {
    getGRNData(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className="p-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mb-4"
      >
        <Row gutter={16}>
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
                  const item = items.find(i => i.ITEM_ID === value);
                  form.setFieldsValue({ unit: item?.UNIT });
                }}
              />
            </Form.Item>
          </Col>
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
          <Col span={4}>
            <Form.Item
              name="unit"
              label="Unit"
            >
              <Input readOnly />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit">
                Add GRN
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

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

      {loading && <CommonLoading />}
    </div>
  );
};

export default GRN;
