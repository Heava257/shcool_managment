import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Tag, Typography } from 'antd';
import { PlusOutlined, CalendarOutlined, BookOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { request } from '../../../util/request';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const AcademicManagementPage = () => {
    const [activeTab, setActiveTab] = useState('years');
    const [years, setYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'years') {
                const res = await request('admin/academic-years', 'get');
                if (res.success) setYears(res.years);
            } else if (activeTab === 'semesters') {
                const resY = await request('admin/academic-years', 'get');
                const resS = await request('admin/semesters', 'get');
                if (resY.success) setYears(resY.years);
                if (resS.success) setSemesters(resS.semesters);
            } else if (activeTab === 'classes') {
                const resY = await request('admin/academic-years', 'get');
                const resC = await request('admin/classes', 'get');
                const resT = await request('auth/me', 'get'); // Mocking teacher list for now or getting from users
                // Actually need a proper user list for teachers
                if (resY.success) setYears(resY.years);
                if (resC.success) setClasses(resC.classes);
                const resTeachersC = await request('admin/teachers', 'get');
                if (resTeachersC.success) setTeachers(resTeachersC.teachers);
            } else if (activeTab === 'schedules') {
                const resS = await request('admin/schedules', 'get');
                const resC = await request('admin/classes', 'get');
                const resSub = await request('subjects', 'get');
                const resY = await request('admin/academic-years', 'get');
                const resSem = await request('admin/semesters', 'get');
                const resTeachersS = await request('admin/teachers', 'get');
                if (resS.success) setSchedules(resS.schedules);
                if (resC.success) setClasses(resC.classes);
                if (resSub.data) setSubjects(resSub.data);
                if (resY.success) setYears(resY.years);
                if (resSem.success) setSemesters(resSem.semesters);
                if (resTeachersS.success) setTeachers(resTeachersS.teachers);
            }
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values) => {
        try {
            let endpoint = '';
            if (activeTab === 'years') endpoint = 'admin/academic-years';
            else if (activeTab === 'semesters') endpoint = 'admin/semesters';
            else if (activeTab === 'classes') endpoint = 'admin/classes';
            else if (activeTab === 'schedules') endpoint = 'admin/schedules';

            // Handle date ranges and times
            const payload = { ...values };
            if (values.dates) {
                payload.start_date = values.dates[0].format('YYYY-MM-DD');
                payload.end_date = values.dates[1].format('YYYY-MM-DD');
                delete payload.dates;
            }
            if (values.start_time) payload.start_time = values.start_time.format('HH:mm:ss');
            if (values.end_time) payload.end_time = values.end_time.format('HH:mm:ss');

            const res = await request(endpoint, 'post', payload);
            if (res.success) {
                message.success('Created successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchData();
            }
        } catch (error) {
            message.error('Failed to create');
        }
    };

    const columnsYears = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
        { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
    ];

    const columnsSemesters = [
        { title: 'Year', dataIndex: ['academic_year', 'name'], key: 'year' },
        { title: 'Semester Name', dataIndex: 'name', key: 'name' },
        { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
        { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
    ];

    const columnsClasses = [
        { title: 'Class Name', dataIndex: 'name', key: 'name' },
        { title: 'Level', dataIndex: 'level', key: 'level' },
        { title: 'Academic Year', dataIndex: ['academic_year', 'name'], key: 'year' },
        { title: 'Homeroom Teacher', dataIndex: ['teacher', 'name'], key: 'teacher' },
    ];

    const columnsSchedules = [
        { title: 'Day', dataIndex: 'day_of_week', key: 'day' },
        { title: 'Time', render: (_, r) => `${r.start_time.slice(0, 5)} - ${r.end_time.slice(0, 5)}` },
        { title: 'Class', dataIndex: ['academic_class', 'name'], key: 'class' },
        { title: 'Subject', dataIndex: ['subject', 'name'], key: 'subject' },
        { title: 'Teacher', dataIndex: ['teacher', 'name'], key: 'teacher' },
        { title: 'Room', dataIndex: 'room', key: 'room' },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title={<Title level={3}>Academic Management</Title>} extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Add New
                </Button>
            }>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab={<span><CalendarOutlined />Academic Years</span>} key="years">
                        <Table dataSource={years} columns={columnsYears} loading={loading} rowKey="id" />
                    </TabPane>
                    <TabPane tab={<span><CalendarOutlined />Semesters</span>} key="semesters">
                        <Table dataSource={semesters} columns={columnsSemesters} loading={loading} rowKey="id" />
                    </TabPane>
                    <TabPane tab={<span><BookOutlined />Classes</span>} key="classes">
                        <Table dataSource={classes} columns={columnsClasses} loading={loading} rowKey="id" />
                    </TabPane>
                    <TabPane tab={<span><ClockCircleOutlined />Class Schedules</span>} key="schedules">
                        <Table dataSource={schedules} columns={columnsSchedules} loading={loading} rowKey="id" />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={`Add New ${activeTab.slice(0, -1)}`}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    {activeTab === 'years' && (
                        <>
                            <Form.Item name="name" label="Year Name (e.g. 2024-2025)" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="dates" label="Duration">
                                <RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </>
                    )}

                    {activeTab === 'semesters' && (
                        <>
                            <Form.Item name="academic_year_id" label="Academic Year" rules={[{ required: true }]}>
                                <Select options={years.map(y => ({ label: y.name, value: y.id }))} />
                            </Form.Item>
                            <Form.Item name="name" label="Semester Name" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Semester 1" />
                            </Form.Item>
                            <Form.Item name="dates" label="Duration">
                                <RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </>
                    )}

                    {activeTab === 'classes' && (
                        <>
                            <Form.Item name="name" label="Class Name" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Grade 10A" />
                            </Form.Item>
                            <Form.Item name="level" label="Level">
                                <Input placeholder="e.g. 10" />
                            </Form.Item>
                            <Form.Item name="academic_year_id" label="Academic Year">
                                <Select options={years.map(y => ({ label: y.name, value: y.id }))} />
                            </Form.Item>
                            <Form.Item name="teacher_id" label="Homeroom Teacher">
                                <Select options={teachers.map(t => ({ label: t.name, value: t.id }))} />
                            </Form.Item>
                        </>
                    )}

                    {activeTab === 'schedules' && (
                        <>
                            <Form.Item name="academic_year_id" label="Academic Year" rules={[{ required: true }]}>
                                <Select options={years.map(y => ({ label: y.name, value: y.id }))} />
                            </Form.Item>
                            <Form.Item name="semester_id" label="Semester" rules={[{ required: true }]}>
                                <Select options={semesters.map(s => ({ label: s.name, value: s.id }))} />
                            </Form.Item>
                            <Form.Item name="class_id" label="Class" rules={[{ required: true }]}>
                                <Select options={classes.map(c => ({ label: c.name, value: c.id }))} />
                            </Form.Item>
                            <Form.Item name="subject_id" label="Subject" rules={[{ required: true }]}>
                                <Select options={subjects.map(s => ({ label: s.name, value: s.id }))} />
                            </Form.Item>
                            <Form.Item name="day_of_week" label="Day" rules={[{ required: true }]}>
                                <Select options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => ({ label: d, value: d }))} />
                            </Form.Item>
                            <Space>
                                <Form.Item name="start_time" label="Start Time" rules={[{ required: true }]}>
                                    <DatePicker picker="time" format="HH:mm" />
                                </Form.Item>
                                <Form.Item name="end_time" label="End Time" rules={[{ required: true }]}>
                                    <DatePicker picker="time" format="HH:mm" />
                                </Form.Item>
                            </Space>
                            <Form.Item name="room" label="Room">
                                <Input placeholder="e.g. Room 101" />
                            </Form.Item>
                            <Form.Item name="teacher_id" label="Teacher" rules={[{ required: true }]}>
                                <Select options={teachers.map(t => ({ label: t.name, value: t.id }))} placeholder="Select teacher" />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default AcademicManagementPage;
