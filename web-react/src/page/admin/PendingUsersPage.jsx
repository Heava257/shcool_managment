import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Select, message, Popconfirm, Card, Avatar } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { request } from '../../../util/request';
import config from '../../../util/config';

const { Option } = Select;

const PendingUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [assignRole, setAssignRole] = useState('student');

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const res = await request('admin/pending-users', 'get');
            if (res && !res.error) {
                setUsers(res.users);
            }
        } catch (error) {
            message.error('Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (user) => {
        setSelectedUser(user);
        setAssignRole(user.role === 'pending_user' ? 'student' : user.role); // Default to student or their requested role
        setIsModalVisible(true);
    };

    const confirmApprove = async () => {
        if (!selectedUser) return;
        try {
            const res = await request(`admin/approve-user/${selectedUser.id}`, 'post', { role: assignRole });
            if (res && !res.error) {
                message.success('User approved successfully');
                setIsModalVisible(false);
                fetchPendingUsers();
            } else {
                message.error(res.message || 'Failed to approve user');
            }
        } catch (error) {
            message.error('Error approving user');
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await request(`admin/reject-user/${id}`, 'post');
            if (res && !res.error) {
                message.success('User rejected');
                fetchPendingUsers();
            } else {
                message.error(res.message || 'Failed to reject user');
            }
        } catch (error) {
            message.error('Error rejecting user');
        }
    };

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.profile?.image ? config.image_path + record.profile.image : null} icon={<UserOutlined />} />
                    <Space direction="vertical" size={0}>
                        <span style={{ fontWeight: 500 }}>{record.name}</span>
                        <span style={{ fontSize: 12, color: '#888' }}>{record.email}</span>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Requested Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color={role === 'teacher' ? 'blue' : 'green'}>{role.toUpperCase()}</Tag>,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleApproveClick(record)}
                        size="small"
                    >
                        Approve
                    </Button>
                    <Popconfirm
                        title="Reject User"
                        description="Are you sure you want to reject this user?"
                        onConfirm={() => handleReject(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<CloseOutlined />}
                            size="small"
                        >
                            Reject
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card title="Pending User Approvals" bordered={false}>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Approve User"
                open={isModalVisible}
                onOk={confirmApprove}
                onCancel={() => setIsModalVisible(false)}
                okText="Approve & Assign Role"
            >
                <p>Approve <strong>{selectedUser?.name}</strong>?</p>
                <div style={{ marginBottom: 8 }}>Assign Role:</div>
                <Select
                    value={assignRole}
                    onChange={setAssignRole}
                    style={{ width: '100%' }}
                >
                    <Option value="student">Student</Option>
                    <Option value="teacher">Teacher</Option>
                    <Option value="admin">Admin</Option>
                </Select>
            </Modal>
        </Card>
    );
};

export default PendingUsersPage;
