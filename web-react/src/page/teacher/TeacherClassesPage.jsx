import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Space, Button, message, Select, Typography } from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { request } from '../../../util/request';

const { Text } = Typography;

const TeacherClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [academicContext, setAcademicContext] = useState({ years: [], semesters: [] });
    const [filters, setFilters] = useState({ academic_year_id: null, semester_id: null });

    useEffect(() => {
        fetchClasses();
        fetchAcademicContext();
    }, [filters]);

    const fetchAcademicContext = async () => {
        try {
            const res = await request('teacher/academic-context', 'get');
            if (res && res.success) {
                setAcademicContext({ years: res.years, semesters: res.semesters });
            }
        } catch (error) {
            console.error('Failed to load academic context');
        }
    };

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await request('teacher/classes', 'get');
            if (res && res.success) {
                setClasses(res.classes);
            }
        } catch (error) {
            message.error('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Class Name', dataIndex: 'name', key: 'name' },
        { title: 'Students', dataIndex: 'students', key: 'students' },
        { title: 'Schedule', dataIndex: 'schedule', key: 'schedule' },
        { title: 'Credits', dataIndex: 'credits', key: 'credits' },
        { title: 'Level', dataIndex: 'level', key: 'level' },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small">View</Button>
                </Space>
            )
        }
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Card>
                <Space wrap>
                    <Text strong>Academic Year:</Text>
                    <Select
                        placeholder="Select Year"
                        style={{ width: 150 }}
                        onChange={val => setFilters(f => ({ ...f, academic_year_id: val }))}
                        allowClear
                    >
                        {academicContext.years.map(y => <Select.Option key={y.id} value={y.id}>{y.name}</Select.Option>)}
                    </Select>
                    <Text strong>Semester:</Text>
                    <Select
                        placeholder="Select Semester"
                        style={{ width: 150 }}
                        onChange={val => setFilters(f => ({ ...f, semester_id: val }))}
                        allowClear
                    >
                        {academicContext.semesters.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                    </Select>
                </Space>
            </Card>
            <Card title="My Classes">
                <Table dataSource={classes} columns={columns} loading={loading} />
            </Card>
        </Space>
    );
};

export default TeacherClassesPage;
