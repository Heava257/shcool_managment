import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Switch, Space, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { request } from '../../../util/request';
import { dateclient } from '../../../util/helper';

const RolePage = () => {
    const [state, setState] = useState({
        list: [],
        filteredList: [],
        total: 0,
        loading: false
    });
    
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    useEffect(() => {
        getList();
    }, []);

    const getList = async () => {
        setState(pre => ({ ...pre, loading: true }));
        try {
            const res = await request("role", "get");
            if (res) {
                setState(pre => ({
                    ...pre,
                    list: res.list,
                    filteredList: res.list,
                    loading: false
                }));
            }
        } catch (error) {
            message.error('Failed to fetch roles');
            setState(pre => ({ ...pre, loading: false }));
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        
        if (!value.trim()) {
            setState(pre => ({
                ...pre,
                filteredList: pre.list
            }));
            return;
        }

        const searchLower = value.toLowerCase();
        const filtered = state.list.filter(item => 
            item.name?.toLowerCase().includes(searchLower) ||
            item.code?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
        );

        setState(pre => ({
            ...pre,
            filteredList: filtered
        }));
    };

    const handleCreate = () => {
        setEditingRole(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRole(record);
        form.setFieldsValue({
            name: record.name,
            code: record.code,
            description: record.description,
            status: record.status
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await request(`role/${id}`, "delete");
            
            if (!res.error) {
                message.success('Role deleted successfully');
                getList();
            } else {
                message.error(res.message);
            }
        } catch (error) {
            message.error('Failed to delete role');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const method = editingRole ? 'put' : 'post';
            const url = editingRole ? `role/${editingRole.id}` : 'role';
            
            const res = await request(url, method, values);
            
            if (!res.error) {
                message.success(res.message || `Role ${editingRole ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                getList();
            } else {
                message.error(res.message);
            }
        } catch (error) {
            message.error(`Failed to ${editingRole ? 'update' : 'create'} role`);
        }
    };

    // Generate autocomplete options from existing roles
    const getAutocompleteOptions = (field) => {
        const uniqueValues = [...new Set(state.list.map(item => item[field]).filter(Boolean))];
        return uniqueValues.map(value => ({ value }));
    };

    const columns = [
        {
            key: "name",
            title: "Name",
            dataIndex: "name"
        },
        {
            key: "code",
            title: "Code",
            dataIndex: "code"
        },
        {
            key: "description",
            title: "Description",
            dataIndex: "description"
        },
        {
            key: "status",
            title: "Status",
            dataIndex: "status",
            render: (value) => (
                value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
            )
        },
        {
            key: "created_at",
            title: "Created At",
            dataIndex: "created_at",
            render: (value) => dateclient(value)
        },
        {
            key: "action",
            title: "Action",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Role"
                        description="Are you sure you want to delete this role?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Role Management</h2>
                <Space>
                    <Input.Search
                        placeholder="Search by name, code, or description"
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ width: 350 }}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        onSearch={handleSearch}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Create Role
                    </Button>
                </Space>
            </div>

            <Table
                dataSource={state.filteredList}
                columns={columns}
                loading={state.loading}
                rowKey="id"
                pagination={{
                    showTotal: (total) => `Total ${total} items`,
                    showSizeChanger: true
                }}
            />

            <Modal
                title={editingRole ? "Edit Role" : "Create Role"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editingRole ? "Update" : "Create"}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ status: true }}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input role name!' }]}
                    >
                        <Input.AutoComplete
                            placeholder="Enter role name"
                            options={getAutocompleteOptions('name')}
                            filterOption={(inputValue, option) =>
                                option.value.toLowerCase().includes(inputValue.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Code"
                        rules={[{ required: true, message: 'Please input role code!' }]}
                    >
                        <Input.AutoComplete
                            placeholder="Enter role code"
                            options={getAutocompleteOptions('code')}
                            filterOption={(inputValue, option) =>
                                option.value.toLowerCase().includes(inputValue.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea 
                            placeholder="Enter role description"
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RolePage;