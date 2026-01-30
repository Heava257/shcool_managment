import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Spin, message, Progress, Select, Space, Statistic, Row, Col } from 'antd';
import { request } from '../../../util/request';

const { Title, Text } = Typography;

const StudentGradesPage = () => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [academicContext, setAcademicContext] = useState({ years: [], semesters: [] });
    const [filters, setFilters] = useState({ academic_year_id: null, semester_id: null });

    useEffect(() => {
        fetchAcademicContext();
    }, []);

    useEffect(() => {
        fetchGrades();
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

    const fetchGrades = async () => {
        setLoading(true);
        try {
            let url = 'student/grades/detailed';
            const params = [];
            if (filters.academic_year_id) params.push(`academic_year_id=${filters.academic_year_id}`);
            if (filters.semester_id) params.push(`semester_id=${filters.semester_id}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await request(url, 'get');
            if (res && res.success) {
                setReport(res.report || []);
            }
        } catch (error) {
            message.error('Failed to fetch grades');
        } finally {
            setLoading(false);
        }
    };

    const expandedRowRender = (record) => {
        const columns = [
            { title: 'Assessment', dataIndex: 'name', key: 'name' },
            {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: type => <Tag color="blue">{type.toUpperCase()}</Tag>
            },
            { title: 'Weight', dataIndex: 'weight', key: 'weight', render: w => `${w}%` },
            {
                title: 'Score',
                key: 'score',
                render: (_, item) => (
                    <span>
                        <Text strong>{Number(item.score).toFixed(1)}</Text>
                        <Text type="secondary"> / {item.max}</Text>
                    </span>
                )
            },
            {
                title: 'Contribution',
                key: 'weighted_score',
                render: (_, item) => (
                    <Text type="success">+{Number(item.weighted_score).toFixed(2)}</Text>
                )
            },
        ];

        return <Table columns={columns} dataSource={record.details} pagination={false} size="small" rowKey="name" />;
    };

    const columns = [
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: text => <Title level={5} style={{ margin: 0 }}>{text}</Title>
        },
        {
            title: 'Overall Score',
            dataIndex: 'final_grade',
            key: 'final_grade',
            render: (score) => (
                <div style={{ width: 170 }}>
                    <Progress percent={Number(score)} status={Number(score) >= 50 ? "active" : "exception"} format={percent => `${percent}/100`} />
                </div>
            )
        },
        {
            title: 'Grade',
            dataIndex: 'letter_grade',
            key: 'letter_grade',
            render: (grade) => {
                let color = 'green';
                if (grade === 'F') color = 'red';
                if (grade === 'D' || grade === 'C') color = 'orange';
                return <Tag color={color} style={{ fontSize: '14px', padding: '5px 10px' }}>{grade}</Tag>;
            }
        },
    ];

    const averageGrade = report?.length > 0
        ? (report.reduce((acc, curr) => acc + Number(curr.final_grade), 0) / report.length).toFixed(2)
        : 0;

    return (
        <Space direction="vertical" style={{ width: '100%', padding: '0 10px' }}>
            <Card>
                <Row gutter={24} align="middle">
                    <Col span={16}>
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
                                value={filters.semester_id}
                                onChange={val => setFilters(f => ({ ...f, semester_id: val }))}
                            >
                                {academicContext.semesters.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                            </Select>
                        </Space>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Statistic title="Overall GPA" value={averageGrade} suffix="/ 100" valueStyle={{ color: averageGrade >= 50 ? '#3f8600' : '#cf1322' }} />
                    </Col>
                </Row>
            </Card>

            <Card title="My Grades & Results">
                <Table
                    className="components-table-demo-nested"
                    columns={columns}
                    expandable={{ expandedRowRender, defaultExpandAllRows: true }}
                    dataSource={report}
                    loading={loading}
                    rowKey="subject"
                />
            </Card>
        </Space>
    );
};

export default StudentGradesPage;
