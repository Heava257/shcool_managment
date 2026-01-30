import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Upload, Divider } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    UserAddOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    UploadOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    GoogleOutlined,
    GithubOutlined,
    LoginOutlined,
    BarcodeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import './RegisterPage.css';
import { profileStore } from '../../src/store/profileStore';
import OTPVerification from '../../src/page/OTPVerification/OTPVerification';

const RegisterPage = () => {
    const { setProfile, setAccessToken } = profileStore();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Convert image to base64 for preview
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleRegisterSuccess = (response) => {
        if (response.requires_verification) {
            setUserEmail(response.user.email);
            setShowOTP(true);
        }
    };

    const handleVerificationSuccess = (data) => {
        // Redirect to dashboard or home page
        window.location.href = '/';
    };

    if (showOTP) {
        return (
            <OTPVerification
                email={userEmail}
                onVerificationSuccess={handleVerificationSuccess}
            />
        );
    }

    const handleRegister = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('password_confirmation', values.password_confirmation);

            if (values.phone) formData.append('phone', values.phone);
            if (values.address) formData.append('address', values.address);
            if (values.invitation_code) formData.append('invitation_code', values.invitation_code);
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            }

            const res = await request('auth/register', 'post', formData);

            if (res && !res.error) {
                message.success('Registration successful! Please verify your email.');

                // Show OTP verification
                if (res.requires_verification) {
                    setUserEmail(res.user.email);
                    setShowOTP(true);
                }
            } else {
                if (res.errors) {
                    const formErrors = [];
                    Object.keys(res.errors).forEach(field => {
                        formErrors.push({
                            name: field,
                            errors: res.errors[field]
                        });
                    });
                    form.setFields(formErrors);
                    message.error(res.message || 'Registration failed. Please check the form.');
                } else {
                    message.error(res.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error(error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = async ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1)); // Keep only the last file

        // Generate preview
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
        return false; // Prevent auto upload
    };

    return (
        <div className="academic-register-container">
            {/* Hero Section - Left Side */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">Join Our Community</div>
                    <h1 className="hero-title">
                        Start Your<br />
                        Academic<br />
                        Journey <span className="highlight">Today</span>
                    </h1>
                    <p className="hero-description">
                        Create your account to access courses, track your progress, and connect
                        with educators. Join thousands of students already using our platform.
                    </p>

                    <div className="hero-buttons">
                        <Button
                            className="hero-btn-secondary"
                            icon={<LoginOutlined />}
                            onClick={() => navigate('/login')}
                            size="large"
                        >
                            Log In
                        </Button>
                    </div>

                    <div className="hero-features">
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>Free Account Setup</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>Instant Access</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>Secure & Private</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Card - Right Side */}
            <div className="register-section">
                <Card className="academic-register-card" bordered={false}>
                    <div className="register-form-header">
                        <UserAddOutlined className="register-icon" />
                        <h2>Create Account</h2>
                        <p>Sign up to get started</p>
                    </div>

                    <Form
                        form={form}
                        name="register"
                        onFinish={handleRegister}
                        layout="vertical"
                        size="large"
                        scrollToFirstError
                        className="academic-register-form"
                    >
                        <Form.Item
                            label="Invitation Code (Optional)"
                            name="invitation_code"
                            tooltip="Enter your school code to automatically get the correct role."
                        >
                            <Input
                                prefix={<BarcodeOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="School Invitation Code"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[
                                { required: true, message: 'Please input your name!' },
                                { max: 255, message: 'Name must be less than 255 characters!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Full Name"
                                autoComplete="name"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                            hasFeedback
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Email"
                                autoComplete="email"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Phone Number (Optional)"
                            name="phone"
                            rules={[
                                { max: 20, message: 'Phone number must be less than 20 characters!' }
                            ]}
                        >
                            <Input
                                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Phone Number (Optional)"
                                autoComplete="tel"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Address (Optional)"
                            name="address"
                        >
                            <Input
                                prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Address (Optional)"
                                autoComplete="street-address"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 6, message: 'Password must be at least 6 characters!' }
                            ]}
                            hasFeedback
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Password"
                                autoComplete="new-password"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Confirm Password"
                            name="password_confirmation"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                            hasFeedback
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Profile Image (Optional)"
                            name="image"
                        >
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
                                className="profile-upload"
                            >
                                {fileList.length === 0 && (
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                icon={!loading && <ArrowRightOutlined />}
                                className="register-submit-btn"
                            >
                                {loading ? 'Creating Account...' : 'Register'}
                            </Button>
                        </Form.Item>

                        <div className="social-login-section">
                            <Divider plain className="social-login-divider">
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Or register with</span>
                            </Divider>
                            <div className="social-buttons">
                                <Button
                                    className="social-btn google-btn"
                                    icon={<GoogleOutlined />}
                                    onClick={() => message.info('Google registration integration coming soon!')}
                                >
                                    Google
                                </Button>
                                <Button
                                    className="social-btn github-btn"
                                    icon={<GithubOutlined />}
                                    onClick={() => message.info('Github registration integration coming soon!')}
                                >
                                    GitHub
                                </Button>
                            </div>
                        </div>

                        <div className="register-footer-text">
                            <span>Already have an account?</span>
                            <Button
                                type="link"
                                onClick={() => navigate('/login')}
                                style={{ padding: '0 4px' }}
                            >
                                Login now
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;