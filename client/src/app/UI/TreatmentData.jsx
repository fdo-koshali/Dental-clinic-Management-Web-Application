import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  Radio,
  InputNumber,
  Row,
  Col,
  Tag,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import CommonLoading from "../../utils/CommonLoading";

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .max(50, "Maximum 50 characters"),
  indication: yup
    .string()
    .required("Indication is required")
    .max(150, "Maximum 150 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(150, "Maximum 150 characters"),
  durationHours: yup
    .number()
    .required("Hours are required")
    .min(0, "Hours must be at least 0")
    .max(24, "Hours cannot exceed 24"),
  durationMinutes: yup
    .number()
    .required("Minutes are required")
    .min(0, "Minutes must be at least 0")
    .max(59, "Minutes cannot exceed 59"),
  cost: yup
    .number()
    .required("Cost is required")
    .min(0, "Cost must be positive"),
  worstOutcome: yup
    .string()
    .required("Worst outcome is required")
    .max(200, "Maximum 200 characters"),
  status: yup.string().required("Status is required"),
});

const TreatmentData = () => {
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
    pageSize: 10,
    total: 0,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [loading, setLoading] = useState(false);

  const getTreatmentData = async (searchText, page, items_per_page) => {
    setLoading(true);
    try { 
      const response = await axios.post("/api/treaments/get", {
        search: searchText,
        page,
        limit: items_per_page,
      });
      const formattedData = response.data?.data.map(item => ({
        key: item.ID,
        name: item.NAME,
        indication: item.INDICATION,
        description: item.DESCRIPTION,
        duration: item.DURATION,
        cost: item.COST,
        worstOutcome: item.WORST_OUT_COME,
        status: item.STATUS === 1 ? 'Active' : 'Inactive'
      }));
      setTableData(formattedData);
      setPagination({
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch treatment data:", error.response?.data?.error);
      toast.error(error.response?.data?.error || "Something went wrong!");
    } finally {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        setLoading(false);
      },1000);
    }
  };

  useEffect(() => {
    getTreatmentData(searchText, currentpage, items_per_page);
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
    setSelectedTreatment(record);
    // Split duration into hours and minutes
    const [hours, minutes] = record.duration.split(':');
    form.setFieldsValue({
      ...record,
      durationHours: parseInt(hours),
      durationMinutes: parseInt(minutes),
      status: record.status === 'Active' ? '1' : '0'
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return String(record.name).toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Indication",
      dataIndex: "indication",
      key: "indication",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Duration (hours)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Cost(Rs.)",
      dataIndex: "cost",
      key: "cost",
    },
    {
      title: "Worst Outcome",
      dataIndex: "worstOutcome",
      key: "worstOutcome",
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
    form
      .validateFields()
      .then(async (values) => {
        // Combine hours and minutes into duration string with padding
        const hours = String(values.durationHours || 0).padStart(2, '0');
        const minutes = String(values.durationMinutes || 0).padStart(2, '0');
        const duration = `${hours}:${minutes}:00`;

        const formData = {
          ...values,
          duration,
          // Remove separate hour/minute fields
          durationHours: undefined,
          durationMinutes: undefined,
        };

        const data = {
          name: formData.name,
          indication: formData.indication,
          description: formData.description,
          duration: formData.duration,
          cost: formData.cost,
          worstOutcome: formData.worstOutcome,
          status: formData.status,
          ...(isEditMode && { key: selectedTreatment?.key })
        };
        

        try {
          if (isEditMode) {
            const response = await axios.put(`/api/treaments/edit`, data);
            toast.success(response?.data?.message);
            setIsEditMode(false);
            setSelectedTreatment(null);
          } else {
            const response = await axios.post(`/api/treaments/add`, data);
            toast.success(response?.data?.message);
          }
          form.resetFields();
          setIsModalOpen(false);
          getTreatmentData(searchText, currentpage, items_per_page);
        } catch (error) {
          console.error("Failed:", error.response?.data?.error);
          toast.error(error.response?.data?.error || "Something went wrong!");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Input
          ref={searchInputRef}
          placeholder="Search treatments..."
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
        title={isEditMode ? "Edit Treatment" : "Add New Treatment"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          handleCancel();
          setIsEditMode(false);
          setSelectedTreatment(null);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="treatmentForm"
          validateTrigger="onBlur"
          onFinish={handleOk}
        >
          <Form.Item
            name="name"
            label="Name"
            required
            validateFirst
            rules={[
              {
                validator: async (_, value) => {
                  try {
                    await validationSchema.validateSyncAt("name", {
                      name: value,
                    });
                  } catch (err) {
                    throw new Error(err.message);
                  }
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="indication"
            label="Indication"
            required
            validateFirst
            rules={[
              {
                validator: async (_, value) => {
                  try {
                    await validationSchema.validateSyncAt("indication", {
                      indication: value,
                    });
                  } catch (err) {
                    throw new Error(err.message);
                  }
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            validateFirst
            required
            rules={[
              {
                validator: async (_, value) => {
                  try {
                    await validationSchema.validateSyncAt("description", {
                      description: value,
                    });
                  } catch (err) {
                    throw new Error(err.message);
                  }
                },
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Duration" required>
                <Input.Group compact>
                  <Form.Item
                    name="durationHours"
                    noStyle
                    rules={[
                      {
                        validator: async (_, value) => {
                          try {
                            await validationSchema.validateSyncAt(
                              "durationHours",
                              { durationHours: value }
                            );
                          } catch (err) {
                            throw new Error(err.message);
                          }
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={24}
                      placeholder="Hours"
                      style={{ width: "50%" }}
                      formatter={(value) => `${value}h`}
                      parser={(value) => value.replace("h", "")}
                    />
                  </Form.Item>
                  <Form.Item
                    name="durationMinutes"
                    noStyle
                    rules={[
                      {
                        validator: async (_, value) => {
                          try {
                            await validationSchema.validateSyncAt(
                              "durationMinutes",
                              { durationMinutes: value }
                            );
                          } catch (err) {
                            throw new Error(err.message);
                          }
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={59}
                      placeholder="Minutes"
                      style={{ width: "50%" }}
                      formatter={(value) => `${value}m`}
                      parser={(value) => value.replace("m", "")}
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cost"
                label="Cost"
                validateFirst
                required
                rules={[
                  {
                    validator: async (_, value) => {
                      try {
                        await validationSchema.validateSyncAt("cost", {
                          cost: value,
                        });
                      } catch (err) {
                        throw new Error(err.message);
                      }
                    },
                  },
                ]}
              >
                <InputNumber
                  prefix="Rs."
                  min={0}
                  step={100}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/Rs\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="worstOutcome"
            label="Worst Outcome"
            validateFirst
            required
            rules={[
              {
                validator: async (_, value) => {
                  try {
                    await validationSchema.validateSyncAt("worstOutcome", {
                      worstOutcome: value,
                    });
                  } catch (err) {
                    throw new Error(err.message);
                  }
                },
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            validateFirst
            rules={[
              {
                validator: async (_, value) => {
                  try {
                    await validationSchema.validateSyncAt("status", {
                      status: value,
                    });
                  } catch (err) {
                    throw new Error(err.message);
                  }
                },
              },
            ]}
            initialValue="1"
          >
            <Radio.Group>
              <Radio value="1">Active</Radio>
              <Radio value="0">Inactive</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {loading && (<CommonLoading />)}
    </div>
  );
};

export default TreatmentData;
