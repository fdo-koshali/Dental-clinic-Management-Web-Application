// Import necessary dependencies
import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Table, Space } from 'antd';
import { SearchOutlined, PrinterOutlined } from '@ant-design/icons';
import { jsPDF } from "jspdf"; // For PDF generation
import autoTable from 'jspdf-autotable'; // For creating tables in PDF
import axios from 'axios';
import { toast } from 'react-toastify';

const Stock = () => {

  // State management
  const [searchText, setSearchText] = useState(''); // Store search query
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [stockData, setStockData] = useState([]); // Store stock items data
  const searchInputRef = useRef(null); // Reference to search input for focus
  const searchTimeoutRef = useRef(null); // For debouncing search

  // Fetch stock data from the API with search functionality
  const getStockData = async (searchText) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/items/get/stock", {
        search: searchText,
      });
      
      /// Transform API response data to match table structure
      const dataArray = response.data || [];
     
      const formattedData = dataArray.map((item) => ({
        id: item.ITEM_ID,
        itemCode: item.ITEM_ID,
        itemName: item.ITEM_NAME,
        unit: item.UNIT,
        lastUpdateDate: item.UPDATE_DATE,
        quantity: `${item.COUNT} ${item.UNIT}`,
        countValue: item.COUNT, // For sorting purposes
      }));
      
      setStockData(formattedData);
    } catch (error) {
      console.error("Failed to fetch stock data:", error);
      toast.error(error.response?.data?.error || "Something went wrong!");
      
      // Set default data in case of error
      setStockData([]);
    } finally {

      // Set focus back to search input after loading
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        setLoading(false);
      }, 1000);
    }
  };

  // Fetch data when search text changes
  useEffect(() => {
    getStockData(searchText);
  }, [searchText]);

  // Handle search with debouncing
  const handleSearch = (e) => {
    const value = e.target.value;
    
    // Clear previous timeout if exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a timeout to avoid too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      setSearchText(value);
    }, 500);
  };

  // Columns for the table
  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Last Update Date',
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.countValue - b.countValue, // Enable sorting by quantity
    },
  ];

  // Function to generate and download PDF
  const handlePrintStock = () => {
    try {
      const doc = new jsPDF();
      
      // Add title to PDF
      doc.text('Stock Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 20);

      // Create table with filtered data
      const tableData = stockData.map(item => [
        item.itemCode,
        item.itemName,
        item.lastUpdateDate,
        item.quantity
      ]);
      
      // Add table to PDF using autoTable directly
      autoTable(doc, {
        head: [['Item Code', 'Item Name', 'Last Update Date', 'Quantity']],
        body: tableData,
        startY: 25,
      });

      // Save the PDF
      doc.save('stock-report.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  // Render component
  return (
    <div style={{ padding: '20px' }}>

      {/* Search and Print buttons */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by item code or name"
          onChange={handleSearch}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          ref={searchInputRef}
        />
        <Button 
          type="primary" 
          icon={<PrinterOutlined />} 
          onClick={handlePrintStock}
        >
          Print Stock
        </Button>
      </Space>
      
      {/* Stock data table */}
      <Table 
        columns={columns} 
        dataSource={stockData} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No data available' }}
      />
      
    </div>
  );
};

export default Stock;
