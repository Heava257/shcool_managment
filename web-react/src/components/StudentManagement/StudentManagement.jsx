import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Card, 
    Button, 
    Space, 
    Input, 
    Select, 
    Tag, 
    Modal, 
    Form, 
    message, 
    Popconfirm,
    Avatar,
    Tooltip,
    Drawer
} from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    SearchOutlined,
    EyeOutlined,
    UserOutlined,
    BookOutlined,
    MailOutlined,
    PhoneOutlined,
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { request } from '../../../util/request';
import './StudentManagement.css';

const { Option } = Select;
const { Search } = Input;

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: ''
    });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                per_page: pagination.pageSize,
                ...filters
            };

            const response = await request('students', 'get', params);
            
            if (response.success) {
                setStudents(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total
                }));
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            message.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleStatusFilter = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        form.setFieldsValue({
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            phone: student.phone,
            gender: student.gender,
            address: student.address,
            status: student.status
        });
        setIsModalVisible(true);
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setIsDetailDrawerVisible(true);
    };

    const handleDelete = async (studentId) => {
        try {
            const response = await request(`students/${studentId}`, 'delete');
            if (response.success) {
                message.success('Student deleted successfully');
                fetchStudents();
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            message.error('Failed to delete student');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const response = await request(`students/${selectedStudent.id}`, 'put', values);
            
            if (response.success) {
                message.success('Student updated successfully');
                setIsModalVisible(false);
                form.resetFields();
                setSelectedStudent(null);
                fetchStudents();
            }
        } catch (error) {
            console.error('Error updating student:', error);
            message.error('Failed to update student');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedStudent(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'approved': return 'green';
            case 'rejected': return 'red';
            case 'active': return 'green';
            case 'inactive': return 'default';
            case 'graduated': return 'blue';
            default: return 'default';
        }
    };

    const handleApproveStudent = async (studentId) => {
        try {
            const response = await request(`students/${studentId}/approve`, 'put');
            if (response.success) {
                message.success('Student approved successfully!');
                fetchStudents();
            } else {
                message.error(response.message || 'Failed to approve student');
            }
        } catch (error) {
            console.error('Error approving student:', error);
            message.error('Failed to approve student');
        }
    };

    const handleRejectStudent = async (studentId) => {
        try {
            const response = await request(`students/${studentId}/reject`, 'put');
            if (response.success) {
                message.success('Student rejected successfully!');
                fetchStudents();
            } else {
                message.error(response.message || 'Failed to reject student');
            }
        } catch (error) {
            console.error('Error rejecting student:', error);
            message.error('Failed to reject student');
        }
    };

    const columns = [
        {
            title: 'Student',
            dataIndex: 'profile_image',
            key: 'student',
            render: (image, record) => (
                <Space>
                    <Avatar 
                        size={40} 
                        src={image} 
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.first_name} {record.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.student_id}
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => (
                <Space>
                    <MailOutlined />
                    {email}
                </Space>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone ? (
                <Space>
                    <PhoneOutlined />
                    {phone}
                </Space>
            ) : '-'
        },
        {
            title: 'Field of Study',
            dataIndex: 'field_of_study',
            key: 'field_of_study',
            render: (field_of_study) => {
                const formattedField = field_of_study ? field_of_study.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-';
                return <Tag color="purple">{formattedField}</Tag>;
            }
        },
        {
            title: 'Subjects',
            dataIndex: 'subjects',
            key: 'subjects',
            render: (subjects) => (
                <Space wrap>
                    {subjects?.slice(0, 2).map(subject => (
                        <Tag key={subject.id} icon={<BookOutlined />} color="blue" size="small">
                            {subject.code}
                        </Tag>
                    ))}
                    {subjects?.length > 2 && (
                        <Tag color="default" size="small">
                            +{subjects.length - 2} more
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Approve">
                                <Popconfirm
                                    title="Approve Student"
                                    description="Are you sure you want to approve this student?"
                                    onConfirm={() => handleApproveStudent(record.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button 
                                        type="text" 
                                        icon={<CheckOutlined />} 
                                        style={{ color: '#52c41a' }}
                                    />
                                </Popconfirm>
                            </Tooltip>
                            <Tooltip title="Reject">
                                <Popconfirm
                                    title="Reject Student"
                                    description="Are you sure you want to reject this student?"
                                    onConfirm={() => handleRejectStudent(record.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button 
                                        type="text" 
                                        danger 
                                        icon={<CloseOutlined />} 
                                    />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                    
                    <Tooltip title="Edit">
                        <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure you want to delete this student?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="student-management-container">
            <Card className="student-management-card">
                <div className="student-management-header">
                    <h1>Student Management</h1>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/admin/students/register')}
                    >
                        Register New Student
                    </Button>
                </div>

                <div className="student-management-filters">
                    <Space size="middle">
                        <Search
                            placeholder="Search students..."
                            allowClear
                            style={{ width: 300 }}
                            onSearch={handleSearch}
                            onChange={(e) => !e.target.value && handleSearch('')}
                        />
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: 150 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="pending">Pending</Option>
                            <Option value="approved">Approved</Option>
                            <Option value="rejected">Rejected</Option>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="graduated">Graduated</Option>
                        </Select>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={students}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} of ${total} students`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize: pageSize || prev.pageSize
                            }));
                        }
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Edit Modal */}
            <Modal
                title="Edit Student"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={600}
                okText="Save"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="first_name"
                        label="First Name"
                        rules={[{ required: true, message: 'Please input first name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="last_name"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please input last name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status!' }]}
                    >
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="graduated">Graduated</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Student Details"
                placement="right"
                onClose={() => setIsDetailDrawerVisible(false)}
                open={isDetailDrawerVisible}
                width={600}
            >
                {selectedStudent && (
                    <div className="student-details">
                        <div className="student-details-header">
                            <Avatar 
                                size={80} 
                                src={selectedStudent.profile_image} 
                                icon={<UserOutlined />}
                            />
                            <div className="student-details-info">
                                <h2>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                                <p>{selectedStudent.student_id}</p>
                                <Tag color={getStatusColor(selectedStudent.status)}>
                                    {selectedStudent.status.toUpperCase()}
                                </Tag>
                            </div>
                        </div>

                        <div className="student-details-content">
                            <div className="detail-section">
                                <h3>Contact Information</h3>
                                <p><strong>Email:</strong> {selectedStudent.email}</p>
                                <p><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</p>
                                <p><strong>Address:</strong> {selectedStudent.address || 'N/A'}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Personal Information</h3>
                                <p><strong>Date of Birth:</strong> {selectedStudent.date_of_birth}</p>
                                <p><strong>Gender:</strong> {selectedStudent.gender}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Enrolled Subjects</h3>
                                <Space wrap>
                                    {selectedStudent.subjects?.map(subject => (
                                        <Tag key={subject.id} icon={<BookOutlined />} color="blue">
                                            {subject.name} ({subject.code})
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default StudentManagement;
