import React, { useEffect, useState } from 'react';
import { Card, Table, Select, Button, DatePicker, Radio, Input, message, Space, Avatar, Tag } from 'antd';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import { request } from '../../../util/request';
import dayjs from 'dayjs';

const { Option } = Select;

const TeacherAttendancePage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: { status, remarks } }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedDate) {
            fetchAttendanceSession();
        }
    }, [selectedClassId, selectedDate]);

    const fetchClasses = async () => {
        try {
            const res = await request('teacher/classes', 'get');
            if (res && res.success && res.classes.length > 0) {
                setClasses(res.classes);
                setSelectedClassId(res.classes[0].key);
            }
        } catch (error) {
            message.error('Failed to load classes');
        }
    };

    const fetchAttendanceSession = async () => {
        setLoading(true);
        try {
            // 1. Get Students
            const resStudents = await request(`teacher/students?subject_id=${selectedClassId}`, 'get');
            const studentList = resStudents.students || [];

            // 2. Get Existing Attendance
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const resAtt = await request(`teacher/attendance?subject_id=${selectedClassId}&date=${dateStr}`, 'get');
            const existingAtt = resAtt.attendance || {};

            setStudents(studentList);

            // 3. Merge Data
            const initialData = {};
            studentList.forEach(s => {
                if (existingAtt[s.id]) {
                    initialData[s.id] = {
                        status: existingAtt[s.id].status,
                        remarks: existingAtt[s.id].remarks
                    };
                } else {
                    initialData[s.id] = { status: 'present', remarks: '' };
                }
            });
            setAttendanceData(initialData);

        } catch (error) {
            message.error('Failed to load session');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarksChange = (studentId, remarks) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const saveAttendance = async () => {
        const records = students.map(s => ({
            student_id: s.id,
            status: attendanceData[s.id]?.status || 'present',
            remarks: attendanceData[s.id]?.remarks
        }));

        try {
            const res = await request('teacher/attendance', 'post', {
                subject_id: selectedClassId,
                date: selectedDate.format('YYYY-MM-DD'),
                records
            });
            if (res && res.success) {
                message.success('Attendance saved successfully');
            }
        } catch (error) {
            message.error('Failed to save attendance');
        }
    };

    const columns = [
        {
            title: 'Student',
            key: 'student',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.profile_image} icon={<UserOutlined />} />
                    <span>{record.first_name} {record.last_name}</span>
                </Space>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Radio.Group
                    value={attendanceData[record.id]?.status}
                    onChange={e => handleStatusChange(record.id, e.target.value)}
                    buttonStyle="solid"
                >
                    <Radio.Button value="present">Present</Radio.Button>
                    <Radio.Button value="late">Late</Radio.Button>
                    <Radio.Button value="absent">Absent</Radio.Button>
                    <Radio.Button value="excused">Excused</Radio.Button>
                </Radio.Group>
            )
        },
        {
            title: 'Remarks',
            key: 'remarks',
            render: (_, record) => (
                <Input
                    placeholder="Optional..."
                    value={attendanceData[record.id]?.remarks}
                    onChange={e => handleRemarksChange(record.id, e.target.value)}
                    style={{ maxWidth: 200 }}
                />
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Class Attendance"
                extra={
                    <Button type="primary" icon={<SaveOutlined />} onClick={saveAttendance}>
                        Save Attendance
                    </Button>
                }
            >
                <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                    <Select
                        style={{ width: 200 }}
                        value={selectedClassId}
                        onChange={setSelectedClassId}
                        placeholder="Select Class"
                    >
                        {classes.map(c => <Option key={c.key} value={c.key}>{c.name}</Option>)}
                    </Select>
                    <DatePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        allowClear={false}
                    />
                </div>

                <Table
                    dataSource={students}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default TeacherAttendancePage;
