import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Spin, Badge, Row, Col, Divider, message, Segmented, Select, Space } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { request } from '../../../util/request';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const StudentSchedulePage = () => {
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('Daily');
    const [academicContext, setAcademicContext] = useState({ years: [], semesters: [] });
    const [filters, setFilters] = useState({ academic_year_id: null, semester_id: null });

    useEffect(() => {
        fetchAcademicContext();
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [filters]);

    const fetchAcademicContext = async () => {
        try {
            const res = await request('student/academic-context', 'get');
            if (res && res.success) {
                setAcademicContext({ years: res.years, semesters: res.semesters });
                if (res.semesters.length > 0) {
                    setFilters(prev => ({ ...prev, semester_id: res.semesters[0].id }));
                }
            }
        } catch (error) {
            console.error('Failed to load academic context');
        }
    };

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            let url = 'student/schedule';
            const params = [];
            if (filters.academic_year_id) params.push(`academic_year_id=${filters.academic_year_id}`);
            if (filters.semester_id) params.push(`semester_id=${filters.semester_id}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await request(url, 'get');
            if (res && res.success) {
                setSchedule(res.schedule);
            }
        } catch (error) {
            message.error('Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    const renderDaySchedule = (day) => {
        const events = schedule[day] || [];
        if (events.length === 0) return null;

        return (
            <Card title={day} key={day} style={{ marginBottom: 20 }} headStyle={{ backgroundColor: '#f0f2f5' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={events}
                    renderItem={item => (
                        <List.Item>
                            <Row style={{ width: '100%' }} align="middle">
                                <Col xs={24} sm={6}>
                                    <Tag color="blue" style={{ fontSize: '14px', padding: '5px' }}>
                                        <ClockCircleOutlined /> {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                    </Tag>
                                </Col>
                                <Col xs={24} sm={10}>
                                    <Title level={5} style={{ margin: 0 }}>{item.subject?.name}</Title>
                                    <Text type="secondary">{item.subject?.code}</Text>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <Text><EnvironmentOutlined /> {item.room || 'TBA'}</Text>
                                        <Text><UserOutlined /> {item.teacher?.name}</Text>
                                    </div>
                                </Col>
                            </Row>
                        </List.Item>
                    )}
                />
            </Card>
        );
    };

    const renderWeeklyView = () => {
        return (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #f0f0f0', padding: '12px', textAlign: 'left', backgroundColor: '#fafafa' }}>Time</th>
                            {daysOrder.map(day => (
                                <th key={day} style={{ border: '1px solid #f0f0f0', padding: '12px', textAlign: 'center', backgroundColor: '#fafafa' }}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(time => (
                            <tr key={time}>
                                <td style={{ border: '1px solid #f0f0f0', padding: '12px', fontWeight: 'bold' }}>{time}</td>
                                {daysOrder.map(day => {
                                    const events = (schedule[day] || []).filter(e => e.start_time.startsWith(time));
                                    return (
                                        <td key={day} style={{ border: '1px solid #f0f0f0', padding: '4px', verticalAlign: 'top' }}>
                                            {events.map((e, idx) => (
                                                <Card key={idx} size="small" bodyStyle={{ padding: '4px', fontSize: '11px' }} style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: '2px' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{e.subject?.name}</div>
                                                    <div>{e.room}</div>
                                                </Card>
                                            ))}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

    const hasClasses = Object.keys(schedule).length > 0;

    return (
        <div style={{ padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: '10px' }}>
                <Title level={2} style={{ margin: 0 }}>My Class Schedule</Title>
                <Space wrap>
                    <Select
                        placeholder="Select Year"
                        style={{ width: 150 }}
                        onChange={val => setFilters(f => ({ ...f, academic_year_id: val }))}
                        allowClear
                    >
                        {academicContext.years.map(y => <Select.Option key={y.id} value={y.id}>{y.name}</Select.Option>)}
                    </Select>
                    <Select
                        placeholder="Select Semester"
                        style={{ width: 150 }}
                        value={filters.semester_id}
                        onChange={val => setFilters(f => ({ ...f, semester_id: val }))}
                    >
                        {academicContext.semesters.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                    </Select>
                    <Segmented options={['Daily', 'Weekly']} value={view} onChange={setView} />
                </Space>
            </div>

            {!hasClasses && <Card>No classes scheduled yet.</Card>}

            {view === 'Daily' ? (
                daysOrder.map(day => renderDaySchedule(day))
            ) : (
                renderWeeklyView()
            )}
        </div>
    );
};

export default StudentSchedulePage;
