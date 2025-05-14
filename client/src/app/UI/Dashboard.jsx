import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { Column } from '@ant-design/plots';
import axios from 'axios';
import { DollarOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    thisMonthIncome: "0.00",
    totalPendingPayment: "0.00",
    thisMonthExpense: "0.00"
  });
  const [appointmentData, setAppointmentData] = useState([]);
  const [financialData, setFinancialData] = useState([]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/getCardData');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAppointmentData = async () => {
    try {
      const response = await axios.get('/api/dashboard/monthly-appoinment');
      setAppointmentData(response.data.map(item => ({
        ...item,
        month: monthNames[item.month - 1]
      })));
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const response = await axios.get('/api/dashboard/monthly-income');
      const transformedData = response.data.flatMap(item => [
        { month: monthNames[item.month - 1], value: Number(item.income), type: 'Income' },
        { month: monthNames[item.month - 1], value: Number(item.expense), type: 'Expense' }
      ]);
      setFinancialData(transformedData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAppointmentData();
    fetchFinancialData();
  }, []);

  const appointmentConfig = {
    data: appointmentData,
    xField: 'month',
    yField: 'count',
    label: {
      position: 'middle',
      style: { fill: '#FFFFFF', opacity: 0.6 }
    },
    xAxis: { label: { autoRotate: true } },
    meta: {
      count: { alias: 'Appointment Count' }
    }
  };

  const financialConfig = {
    data: financialData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    label: {
      position: 'middle',
      style: { fill: '#FFFFFF', opacity: 0.6 }
    },
    xAxis: { label: { autoRotate: true } }
  };

  return (
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="This Month Income"
              value={` Rs. ${dashboardData.thisMonthIncome}`}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Pending Payments"
              value={`Rs. ${dashboardData.totalPendingPayment}`}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="This Month Expense"
              value={`Rs. ${dashboardData.thisMonthExpense}`}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} sm={12}>
          <Card title="Monthly Appointments">
            <Column {...appointmentConfig} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Monthly Income & Expense">
            <Column {...financialConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
