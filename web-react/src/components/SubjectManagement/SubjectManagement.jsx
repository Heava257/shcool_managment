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
    Tooltip,
    Drawer
} from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    SearchOutlined,
    EyeOutlined,
    BookOutlined,
    UserOutlined
} from '@ant-design/icons';
import { request } from '../../../util/request';
import './SubjectManagement.css';

const { Option } = Select;
const { TextArea } = Input;

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        level: '',
        status: ''
    });
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSubjects();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                per_page: pagination.pageSize,
                ...filters
            };

            const response = await request('subjects', 'get', params);
            
            if (response.success) {
                setSubjects(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total
                }));
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            message.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleLevelFilter = (value) => {
        setFilters(prev => ({ ...prev, level: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleStatusFilter = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleAdd = () => {
        setSelectedSubject(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (subject) => {
        setSelectedSubject(subject);
        form.setFieldsValue({
            name: subject.name,
            code: subject.code,
            description: subject.description,
            credits: subject.credits,
            level: subject.level,
            status: subject.status
        });
        setIsModalVisible(true);
    };

    const handleViewDetails = (subject) => {
        setSelectedSubject(subject);
        setIsDetailDrawerVisible(true);
    };

    const handleDelete = async (subjectId) => {
        try {
            const response = await request(`subjects/${subjectId}`, 'delete');
            if (response.success) {
                message.success('Subject deleted successfully');
                fetchSubjects();
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            message.error('Failed to delete subject');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            const url = selectedSubject ? `subjects/${selectedSubject.id}` : 'subjects';
            const method = selectedSubject ? 'put' : 'post';
            
            const response = await request(url, method, values);
            
            if (response.success) {
                message.success(`Subject ${selectedSubject ? 'updated' : 'created'} successfully`);
                setIsModalVisible(false);
                form.resetFields();
                setSelectedSubject(null);
                fetchSubjects();
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            message.error(`Failed to ${selectedSubject ? 'update' : 'create'} subject`);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedSubject(null);
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'green' : 'red';
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner': return 'blue';
            case 'intermediate': return 'orange';
            case 'advanced': return 'purple';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'Subject',
            dataIndex: 'name',
            key: 'subject',
            render: (text, record) => (
                <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.code}
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            render: (credits) => (
                <Tag color="blue">{credits} credits</Tag>
            )
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            render: (level) => (
                <Tag color={getLevelColor(level)}>
                    {level.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Students',
            dataIndex: 'students',
            key: 'students',
            render: (students) => (
                <Space>
                    <UserOutlined />
                    {students?.length || 0} enrolled
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
                    <Tooltip title="Edit">
                        <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure you want to delete this subject?"
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
        <div className="subject-management-container">
            <Card className="subject-management-card">
                <div className="subject-management-header">
                    <h1>Subject Management</h1>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add New Subject
                    </Button>
                </div>

                <div className="subject-management-filters">
                    <Space size="middle">
                        <Input.Search
                            placeholder="Search subjects..."
                            allowClear
                            style={{ width: 300 }}
                            onSearch={handleSearch}
                            onChange={(e) => !e.target.value && handleSearch('')}
                        />
                        <Select
                            placeholder="Filter by level"
                            allowClear
                            style={{ width: 150 }}
                            onChange={handleLevelFilter}
                        >
                            <Option value="beginner">Beginner</Option>
                            <Option value="intermediate">Intermediate</Option>
                            <Option value="advanced">Advanced</Option>
                        </Select>
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: 150 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={subjects}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} of ${total} subjects`,
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

            {/* Add/Edit Modal */}
            <Modal
                title={selectedSubject ? 'Edit Subject' : 'Add New Subject'}
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
                        name="name"
                        label="Subject Name"
                        rules={[{ required: true, message: 'Please input subject name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Subject Code"
                        rules={[
                            { required: true, message: 'Please input subject code!' },
                            { pattern: /^[A-Z0-9]{2,10}$/, message: 'Code must be 2-10 uppercase letters/numbers!' }
                        ]}
                    >
                        <Input placeholder="e.g., MATH101" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={3} placeholder="Brief description of the subject" />
                    </Form.Item>

                    <Form.Item
                        name="credits"
                        label="Credits"
                        rules={[
                            { required: true, message: 'Please input credits!' },
                            { type: 'number', min: 1, max: 10, message: 'Credits must be between 1 and 10!' }
                        ]}
                    >
                        <Input type="number" min={1} max={10} />
                    </Form.Item>

                    <Form.Item
                        name="level"
                        label="Level"
                        rules={[{ required: true, message: 'Please select level!' }]}
                    >
                        <Select>
                            <Option value="beginner">Beginner</Option>
                            <Option value="intermediate">Intermediate</Option>
                            <Option value="advanced">Advanced</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status!' }]}
                    >
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Subject Details"
                placement="right"
                onClose={() => setIsDetailDrawerVisible(false)}
                open={isDetailDrawerVisible}
                width={600}
            >
                {selectedSubject && (
                    <div className="subject-details">
                        <div className="subject-details-header">
                            <div className="subject-details-info">
                                <h2>{selectedSubject.name}</h2>
                                <p>{selectedSubject.code}</p>
                                <Space>
                                    <Tag color={getStatusColor(selectedSubject.status)}>
                                        {selectedSubject.status.toUpperCase()}
                                    </Tag>
                                    <Tag color={getLevelColor(selectedSubject.level)}>
                                        {selectedSubject.level.toUpperCase()}
                                    </Tag>
                                    <Tag color="blue">
                                        {selectedSubject.credits} CREDITS
                                    </Tag>
                                </Space>
                            </div>
                        </div>

                        <div className="subject-details-content">
                            <div className="detail-section">
                                <h3>Subject Information</h3>
                                <p><strong>Code:</strong> {selectedSubject.code}</p>
                                <p><strong>Credits:</strong> {selectedSubject.credits}</p>
                                <p><strong>Level:</strong> {selectedSubject.level}</p>
                                <p><strong>Status:</strong> {selectedSubject.status}</p>
                                {selectedSubject.description && (
                                    <p><strong>Description:</strong> {selectedSubject.description}</p>
                                )}
                            </div>

                            <div className="detail-section">
                                <h3>Enrolled Students ({selectedSubject.students?.length || 0})</h3>
                                <div className="students-list">
                                    {selectedSubject.students?.map(student => (
                                        <div key={student.id} className="student-item">
                                            <Space>
                                                <span>{student.first_name} {student.last_name}</span>
                                                <Tag size="small">{student.student_id}</Tag>
                                            </Space>
                                        </div>
                                    )) || <p>No students enrolled</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default SubjectManagement;
