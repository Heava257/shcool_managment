import React, { useEffect, useState } from 'react';
import { Card, Table, Select, Button, Modal, Form, Input, InputNumber, DatePicker, Tag, Drawer, List, Avatar, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { request } from '../../../util/request';
import dayjs from 'dayjs';

const { Option } = Select;

const TeacherAssignmentsPage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Create Assessment State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Grading State
    const [isGradeDrawerVisible, setIsGradeDrawerVisible] = useState(false);
    const [currentAssessment, setCurrentAssessment] = useState(null);
    const [students, setStudents] = useState([]);
    const [scores, setScores] = useState({}); // { studentId: { score, comment } }
    const [academicContext, setAcademicContext] = useState({ years: [], semesters: [] });

    useEffect(() => {
        fetchClasses();
        fetchAcademicContext();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchAssessments(selectedClassId);
            fetchStudents(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            const res = await request('teacher/classes', 'get');
            if (res && res.success) {
                setClasses(res.classes);
                if (res.classes.length > 0) setSelectedClassId(res.classes[0].key);
            }
        } catch (error) {
            message.error('Failed to load classes');
        }
    };

    const fetchAcademicContext = async () => {
        try {
            const res = await request('teacher/academic-context', 'get');
            if (res && res.success) {
                setAcademicContext({ years: res.years, semesters: res.semesters });
                if (res.years.length > 0) form.setFieldsValue({ academic_year_id: res.years[0].id });
                if (res.semesters.length > 0) form.setFieldsValue({ semester_id: res.semesters[0].id });
            }
        } catch (error) {
            console.error('Failed to load academic context');
        }
    };

    const fetchAssessments = async (subjectId) => {
        setLoading(true);
        try {
            const res = await request(`teacher/assessments?subject_id=${subjectId}`, 'get');
            if (res && res.success) {
                setAssessments(res.assessments);
            }
        } catch (error) {
            message.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (subjectId) => {
        try {
            const res = await request(`teacher/students?subject_id=${subjectId}`, 'get');
            if (res && res.success) {
                setStudents(res.students);
            }
        } catch (error) {
            message.error('Failed to load students');
        }
    };

    const handleCreateAssessment = async (values) => {
        try {
            const data = {
                ...values,
                subject_id: selectedClassId,
                due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null
            };
            const res = await request('teacher/assessments', 'post', data);
            if (res && res.success) {
                message.success('Assessment created successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchAssessments(selectedClassId);
            }
        } catch (error) {
            message.error('Failed to create assessment');
        }
    };

    const openGradingDrawer = (assessment) => {
        setCurrentAssessment(assessment);

        // Initialize scores from existing data
        const initialScores = {};
        if (assessment.scores) {
            assessment.scores.forEach(s => {
                initialScores[s.student_id] = { score: s.score, comment: s.comment };
            });
        }
        setScores(initialScores);
        setIsGradeDrawerVisible(true);
    };

    const handleScoreChange = (studentId, field, value) => {
        setScores(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const saveGrades = async () => {
        const payload = Object.keys(scores).map(studentId => ({
            student_id: studentId,
            assessment_id: currentAssessment.id,
            score: scores[studentId]?.score,
            comment: scores[studentId]?.comment
        }));

        try {
            const res = await request('teacher/scores', 'post', { scores: payload });
            if (res && res.success) {
                message.success('Grades saved successfully');
                setIsGradeDrawerVisible(false);
                fetchAssessments(selectedClassId); // Refresh to update scores list
            }
        } catch (error) {
            message.error('Failed to save grades');
        }
    };

    const columns = [
        { title: 'Assessment Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: type => <Tag color="blue">{type.toUpperCase()}</Tag>
        },
        { title: 'Weight', dataIndex: 'weight', key: 'weight', render: w => `${w}%` },
        { title: 'Max Score', dataIndex: 'max_score', key: 'max_score' },
        { title: 'Due Date', dataIndex: 'due_date', key: 'due_date', render: d => d || '-' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => openGradingDrawer(record)}
                >
                    Grade
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title="Assessment Management" extra={
                <Space>
                    <Select
                        style={{ width: 200 }}
                        placeholder="Select Class"
                        value={selectedClassId}
                        onChange={setSelectedClassId}
                    >
                        {classes.map(c => <Option key={c.key} value={c.key}>{c.name}</Option>)}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} disabled={!selectedClassId}>
                        Create Assessment
                    </Button>
                </Space>
            }>
                <Table dataSource={assessments} columns={columns} rowKey="id" loading={loading} />
            </Card>

            {/* Create Assessment Modal */}
            <Modal
                title="Create New Assessment"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateAssessment}>
                    <Form.Item name="name" label="Assessment Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Midterm Exam" />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="homework">Homework</Option>
                            <Option value="quiz">Quiz</Option>
                            <Option value="midterm">Midterm</Option>
                            <Option value="final">Final Exam</Option>
                        </Select>
                    </Form.Item>
                    <Space>
                        <Form.Item name="weight" label="Weight (%)" rules={[{ required: true }]}>
                            <InputNumber min={0} max={100} />
                        </Form.Item>
                        <Form.Item name="max_score" label="Max Score" initialValue={100} rules={[{ required: true }]}>
                            <InputNumber min={1} />
                        </Form.Item>
                    </Space>
                    <Form.Item name="due_date" label="Due Date">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Space>
                        <Form.Item name="academic_year_id" label="Academic Year" rules={[{ required: true }]}>
                            <Select style={{ width: 200 }}>
                                {academicContext.years.map(y => <Option key={y.id} value={y.id}>{y.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="semester_id" label="Semester" rules={[{ required: true }]}>
                            <Select style={{ width: 150 }}>
                                {academicContext.semesters.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>

            {/* Grading Drawer */}
            <Drawer
                title={`Grading: ${currentAssessment?.name}`}
                width={720}
                onClose={() => setIsGradeDrawerVisible(false)}
                open={isGradeDrawerVisible}
                extra={
                    <Button type="primary" icon={<SaveOutlined />} onClick={saveGrades}>
                        Save All Grades
                    </Button>
                }
            >
                <Table
                    dataSource={students}
                    rowKey="id"
                    pagination={false}
                    columns={[
                        {
                            title: 'Student',
                            key: 'name',
                            render: (_, record) => (
                                <Space>
                                    <Avatar src={record.profile_image} icon={<PlusOutlined />} />
                                    <span>{record.first_name} {record.last_name}</span>
                                </Space>
                            )
                        },
                        {
                            title: `Score (Max: ${currentAssessment?.max_score})`,
                            key: 'score',
                            render: (_, record) => (
                                <InputNumber
                                    min={0}
                                    max={currentAssessment?.max_score}
                                    value={scores[record.id]?.score}
                                    onChange={val => handleScoreChange(record.id, 'score', val)}
                                    style={{ width: 100 }}
                                />
                            )
                        },
                        {
                            title: 'Comments',
                            key: 'comment',
                            render: (_, record) => (
                                <Input
                                    placeholder="Feedback..."
                                    value={scores[record.id]?.comment}
                                    onChange={e => handleScoreChange(record.id, 'comment', e.target.value)}
                                />
                            )
                        }
                    ]}
                />
            </Drawer>
        </div>
    );
};

export default TeacherAssignmentsPage;
