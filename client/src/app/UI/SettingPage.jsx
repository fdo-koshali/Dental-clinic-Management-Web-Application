import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  DatePicker,
  Button,
  List,
  Typography,
  Space,
  InputNumber,
  Switch,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from 'axios';
import { toast } from "react-toastify";

const SettingPage = () => {
  const [holidays, setHolidays] = useState([]);
  // const [lowStockLimit, setLowStockLimit] = useState(10);
  // const [emailNotification, setEmailNotification] = useState(true);
  const [loading, setLoading] = useState({ stock: true, holidays: true });
  const [form] = Form.useForm();

  // const fetchStockSettings = async () => {
  //   try {
  //     const response = await fetch('/api/stock-settings');
  //     const data = await response.json();
  //     setLowStockLimit(data.lowStockLimit);
  //     setEmailNotification(data.emailNotification);
  //   } catch (error) {
  //     message.error('Failed to load stock settings',error);
  //   } finally {
  //     setLoading(prev => ({ ...prev, stock: false }));
  //   }
  // };

  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/settings/get/upcoming');
      const data = await response.json();
      // Transform the data to use lowercase 'date'
      setHolidays(data.map(holiday => ({ date: holiday.DATE })));
    } catch (error) {
      message.error('Failed to load holidays',error);
    } finally {
      setLoading(prev => ({ ...prev, holidays: false }));
    }
  };

  useEffect(() => {
    // fetchStockSettings();
    fetchHolidays();
  }, []);

  const onFinish = async (values) => {
    try {
      const newHoliday = {
        date: values.date.format("YYYY-MM-DD"),
      };
      const response = await axios.post('/api/settings/addHoliday', newHoliday);
      toast.success(response.data.message);
      fetchHolidays()
      form.resetFields();
      message.success('Holiday added successfully');
    } catch (error) {
      toast.error(error?.response?.data?.error)
      message.error('Failed to add holiday');
      console.error(error);
    }
  };

  const handleDeleteHoliday = async (date) => {
    try {
      const response = await axios.delete('/api/settings/deleteHoliday', {
        data: { date }
      });
      toast.success(response.data.message);
      fetchHolidays();
    } catch (error) {
      toast.error(error?.response?.data?.error);
      message.error('Failed to delete holiday');
      console.error(error);
    }
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf("day");
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        {/* <Card title="Stock Settings">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space align="center">
              <Typography.Text>Low Stock Email Notifications:</Typography.Text>
              <Switch
                checked={emailNotification}
                onChange={(value) => setEmailNotification(value)}
                disabled={loading.stock}
              />
            </Space>
            <Space align="center">
              <Typography.Text>Low Stock Limit:</Typography.Text>
              <InputNumber
                min={1}
                value={lowStockLimit}
                onChange={(value) => setLowStockLimit(value)}
                disabled={!emailNotification || loading.stock}
              />
            </Space>
          </Space>
        </Card> */}

        <Card title="Add Holiday">
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Space>
              <Form.Item
                name="date"
                label="Select Holiday Date"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <DatePicker disabledDate={disabledDate} />
              </Form.Item>
              <Form.Item style={{ marginTop: "29px" }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  htmlType="submit"
                >
                  Add Holiday
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </Card>

        <Card title="Holidays">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={holidays.sort((a, b) =>
              moment(a.date).diff(moment(b.date))
            )}
            renderItem={(item) => (
              <List.Item>
                <Card 
                  size="small" 
                  style={{ textAlign: "center" }}
                  extra={
                    <DeleteOutlined 
                      style={{ color: 'red' }}
                      onClick={() => handleDeleteHoliday(item.date)}
                    />
                  }
                >
                  <Typography.Text strong>
                    {moment(item.date).format("MMM D, YYYY")}
                  </Typography.Text>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: "No holidays added" }}
            loading={loading.holidays}
          />
        </Card>
      </Space>
    </div>
  );
};

export default SettingPage;
