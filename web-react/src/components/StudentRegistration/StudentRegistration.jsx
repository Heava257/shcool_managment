import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Divider, Upload, Select, DatePicker, Radio } from 'antd';
import { 
    UserOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    HomeOutlined,
    CalendarOutlined,
    UploadOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { request } from '../../../util/request';
import './StudentRegistration.css';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const StudentRegistration = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await request('subjects/active', 'get');
            if (response.success) {
                setSubjects(response.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUploadChange = async ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1));
        
        if (newFileList.length > 0 && newFileList[0].originFileObj) {
            const base64 = await getBase64(newFileList[0].originFileObj);
            setPreviewImage(base64);
        } else {
            setPreviewImage('');
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Validate required fields
            if (!values.first_name || !values.last_name) {
                message.error('First name and last name are required');
                setLoading(false);
                return;
            }
            
            if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                message.error('Valid email address is required');
                setLoading(false);
                return;
            }
            
            if (!values.date_of_birth) {
                message.error('Date of birth is required');
                setLoading(false);
                return;
            }
            
            if (!values.gender) {
                message.error('Gender is required');
                setLoading(false);
                return;
            }
            
            if (!values.field_of_study) {
                message.error('Field of study is required');
                setLoading(false);
                return;
            }
            
            // Check age (must be at least 16 years old)
            const today = dayjs();
            const birthDate = dayjs(values.date_of_birth);
            const age = today.diff(birthDate, 'year');
            
            if (age < 16) {
                message.error('Student must be at least 16 years old');
                setLoading(false);
                return;
            }
            
            const formData = new FormData();
            
            // Personal information
            formData.append('first_name', values.first_name.trim());
            formData.append('last_name', values.last_name.trim());
            formData.append('email', values.email.trim().toLowerCase());
            formData.append('phone', values.phone ? values.phone.trim() : '');
            formData.append('date_of_birth', values.date_of_birth.format('YYYY-MM-DD'));
            formData.append('gender', values.gender);
            formData.append('address', values.address ? values.address.trim() : '');
            formData.append('field_of_study', values.field_of_study);
            formData.append('status', 'pending'); // New students start as pending approval
            
            // Subjects
            if (values.subjects && values.subjects.length > 0) {
                values.subjects.forEach(subjectId => {
                    formData.append('subjects[]', subjectId);
                });
            }
            
            // Profile image
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('profile_image', fileList[0].originFileObj);
            }

            const response = await request('students', 'post', formData);

            if (response.success) {
                message.success('Student registered successfully!');
                form.resetFields();
                setFileList([]);
                setPreviewImage('');
                navigate('/admin/students');
            } else {
                message.error(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-registration-container">
            <div className="student-registration-background">
                <div className="student-registration-overlay"></div>
            </div>
            
            <Card className="student-registration-card" variant="borderless">
                <div className="student-registration-header">
                    <div className="student-registration-logo">
                        <UserOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    </div>
                    <h1>Student Registration</h1>
                    <p>Register a new student for the school</p>
                </div>

                <Form
                    form={form}
                    name="studentRegistration"
                    onFinish={handleSubmit}
                    layout="vertical"
                    size="large"
                    scrollToFirstError
                >
                    <Divider orientation="left">Personal Information</Divider>
                    
                    <Form.Item
                        name="first_name"
                        rules={[
                            { required: true, message: 'Please input first name!' },
                            { max: 255, message: 'First name must be less than 255 characters!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="First Name"
                        />
                    </Form.Item>

                    <Form.Item
                        name="last_name"
                        rules={[
                            { required: true, message: 'Please input last name!' },
                            { max: 255, message: 'Last name must be less than 255 characters!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Last Name"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                        hasFeedback
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email Address"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        rules={[
                            { max: 20, message: 'Phone number must be less than 20 characters!' }
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="Phone Number (Optional)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="date_of_birth"
                        rules={[
                            { required: true, message: 'Please select date of birth!' }
                        ]}
                    >
                        <DatePicker
                            prefix={<CalendarOutlined />}
                            placeholder="Date of Birth"
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                            disabledDate={(current) => current && current >= dayjs().endOf('day')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        rules={[
                            { required: true, message: 'Please select gender!' }
                        ]}
                    >
                        <Radio.Group>
                            <Radio value="male">Male</Radio>
                            <Radio value="female">Female</Radio>
                            <Radio value="other">Other</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        name="address"
                    >
                        <TextArea
                            prefix={<HomeOutlined />}
                            placeholder="Address (Optional)"
                            rows={3}
                        />
                    </Form.Item>

                    <Divider orientation="left">Academic Information</Divider>

                    <Form.Item
                        name="field_of_study"
                        label="Field of Study"
                        rules={[
                            { required: true, message: 'Please select field of study!' }
                        ]}
                    >
                        <Select
                            placeholder="Select your field of study"
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            <Option value="computer_science">Computer Science</Option>
                            <Option value="information_technology">Information Technology</Option>
                            <Option value="business_administration">Business Administration</Option>
                            <Option value="accounting">Accounting</Option>
                            <Option value="marketing">Marketing</Option>
                            <Option value="engineering">Engineering</Option>
                            <Option value="medicine">Medicine</Option>
                            <Option value="law">Law</Option>
                            <Option value="education">Education</Option>
                            <Option value="arts">Arts & Design</Option>
                            <Option value="science">Science</Option>
                            <Option value="mathematics">Mathematics</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="subjects"
                        label="Select Subjects/Classes"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select subjects to enroll"
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {subjects.map(subject => (
                                <Option key={subject.id} value={subject.id}>
                                    <BookOutlined /> {subject.name} ({subject.code}) - {subject.level}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Divider orientation="left">Profile Image</Divider>

                    <Form.Item
                        name="profile_image"
                        label="Profile Image (Optional)"
                    >
                        <div>
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onChange={handleUploadChange}
                                beforeUpload={beforeUpload}
                                maxCount={1}
                                showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: true,
                                }}
                            >
                                {fileList.length === 0 && (
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                            {previewImage && (
                                <div style={{ marginTop: 16 }}>
                                    <p style={{ marginBottom: 8, color: '#8c8c8c' }}>Preview:</p>
                                    <img 
                                        src={previewImage} 
                                        alt="Preview" 
                                        style={{ 
                                            maxWidth: '200px', 
                                            maxHeight: '200px', 
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }} 
                                    />
                                </div>
                            )}
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            icon={<UserOutlined />}
                            style={{ height: '48px', fontSize: '16px' }}
                        >
                            Register Student
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Space orientation="horizontal">
                            <Button type="default" onClick={() => navigate('/admin/students')}>
                                Back to Students
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default StudentRegistration;
