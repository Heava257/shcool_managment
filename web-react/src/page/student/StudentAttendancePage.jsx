import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Statistic, Row, Col, message } from 'antd';
import { request } from '../../../util/request';

const StudentAttendancePage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0 });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await request('student/attendance', 'get');
            if (res && res.success) {
                setHistory(res.history);
                calculateStats(res.history);
            }
        } catch (error) {
            message.error('Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const s = { present: 0, absent: 0, late: 0, excused: 0 };
        data.forEach(item => {
            if (s[item.status] !== undefined) s[item.status]++;
        });
        setStats(s);
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        {
            title: 'Subject',
            dataIndex: ['subject', 'name'],
            key: 'subject'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                let color = 'green';
                if (status === 'absent') color = 'red';
                if (status === 'late') color = 'orange';
                if (status === 'excused') color = 'blue';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' }
    ];

    return (
        <div style={{ padding: '0 10px' }}>
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={6}>
                    <Card><Statistic title="Present" value={stats.present} valueStyle={{ color: '#3f8600' }} /></Card>
                </Col>
                <Col span={6}>
                    <Card><Statistic title="Absent" value={stats.absent} valueStyle={{ color: '#cf1322' }} /></Card>
                </Col>
                <Col span={6}>
                    <Card><Statistic title="Late" value={stats.late} valueStyle={{ color: '#faad14' }} /></Card>
                </Col>
            </Row>

            <Card title="Attendance History">
                <Table
                    dataSource={history}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default StudentAttendancePage;
