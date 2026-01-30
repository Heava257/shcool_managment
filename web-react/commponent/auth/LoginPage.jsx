import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Checkbox, message, Space, Tabs, Divider } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import './LoginPage.css';
import { profileStore } from '../../src/store/profileStore';

const LoginPage = () => {
    const { setProfile, setAccessToken } = profileStore();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('student');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);

        try {
            // ✅ Laravel expects 'email' and 'password' (not username)
            const param = {
                email: values.email,
                password: values.password
            };

            console.log('🔵 Login request:', param);

            const res = await request('auth/login', 'post', param);

            console.log('🟢 Login response:', res);

            // ✅ Handle Laravel response structure
            // Laravel returns: { error: false, message: '...', access_token: '...', user: {...} }

            if (res && res.error === false) {
                // ✅ Check if verification is required (Laravel returns 403 with requires_verification)
                if (res.requires_verification) {
                    message.warning({
                        content: 'Please verify your email first. OTP has been sent to your email.',
                        duration: 5
                    });
                    navigate('/verify-otp', {
                        state: {
                            email: res.email || values.email
                        }
                    });
                    return;
                }

                // ✅ Check if we have access token
                if (!res.access_token) {
                    throw new Error('No access token received from server');
                }

                // ✅ Store profile and token
                // Laravel structure: res.user contains user data
                setProfile({
                    id: res.user.id,
                    name: res.user.name,
                    email: res.user.email,
                    role: res.user.role,
                    email_verified_at: res.user.email_verified_at,
                    ...res.user.profile, // Spread profile data if exists
                    created_at: res.user.created_at,
                    updated_at: res.user.updated_at
                });

                setAccessToken(res.access_token);

                // ✅ Handle remember me
                if (values.remember) {
                    localStorage.setItem('rememberedEmail', values.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                message.success({
                    content: `Welcome back, ${res.user.name}!`,
                    duration: 3
                });

                // ✅ Navigate after short delay
                setTimeout(() => {
                    navigate('/');
                }, 500);

            } else {
                // ✅ Handle error responses from Laravel
                // Laravel returns: { error: true, message: '...' }
                const errorMessage = res?.message || 'Login failed. Please check your credentials.';
                message.error({
                    content: errorMessage,
                    duration: 4
                });
            }

        } catch (error) {
            console.error('❌ Login error:', error);

            // ✅ Enhanced error handling for Laravel responses
            let errorMessage = 'An unexpected error occurred.';

            if (error.response) {
                const statusCode = error.response.status;
                const responseData = error.response.data;

                console.log('Error response:', responseData);

                // ✅ Handle Laravel validation errors (422)
                if (statusCode === 422 && responseData.errors) {
                    const errors = Object.values(responseData.errors).flat();
                    errorMessage = errors.join(', ');
                }
                // ✅ Handle Laravel authentication errors (401)
                else if (statusCode === 401) {
                    errorMessage = responseData?.message || 'Invalid email or password.';
                }
                // ✅ Handle Laravel verification required (403)
                else if (statusCode === 403) {
                    if (responseData?.requires_verification) {
                        message.warning({
                            content: responseData.message || 'Please verify your email first.',
                            duration: 5
                        });
                        navigate('/verify-otp', {
                            state: {
                                email: responseData.email || values.email
                            }
                        });
                        return; // Exit early
                    }
                    errorMessage = responseData?.message || 'Access forbidden.';
                }
                // ✅ Handle other Laravel errors
                else if (statusCode === 400) {
                    errorMessage = responseData?.message || 'Bad request. Please check your input.';
                } else if (statusCode === 404) {
                    errorMessage = 'Login endpoint not found. Please contact support.';
                } else if (statusCode >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = responseData?.message || error.message;
                }
            } else if (error.request) {
                // Request made but no response
                errorMessage = 'Cannot connect to server. Please check your internet connection.';
            } else {
                errorMessage = error.message || 'An unexpected error occurred.';
            }

            message.error({
                content: errorMessage,
                duration: 5
            });

        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    // Load remembered email on component mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            form.setFieldsValue({
                email: rememberedEmail,
                remember: true
            });
        }
    }, [form]);

    return (
        <div className="academic-login-container">
            {/* Hero Section - Left Side */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">New Academic Portal</div>
                    <h1 className="hero-title">
                        Manage Your<br />
                        Academic<br />
                        Journey <span className="highlight">Seamlessly</span>
                    </h1>
                    <p className="hero-description">
                        Access your courses, grades, and schedules in one unified platform.
                        Designed for both students and lecturers to enhance the educational
                        experience.
                    </p>

                    <div className="hero-buttons">
                        <Button
                            type="primary"
                            size="large"
                            icon={<UserOutlined />}
                            className="hero-btn-primary"
                        >
                            Student Login
                        </Button>
                        <Button
                            size="large"
                            icon={<UserOutlined />}
                            className="hero-btn-secondary"
                        >
                            Lecturer Login
                        </Button>
                    </div>

                    <div className="hero-features">
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>Real-time Grade Tracking</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>Instant Notifications</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>Digital Resources</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircleOutlined />
                            <span>Secure Access</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Card - Right Side */}
            <div className="login-section">
                <Card className="academic-login-card" bordered={false}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        centered
                        className="login-tabs"
                        items={[
                            {
                                key: 'student',
                                label: (
                                    <span>
                                        <UserOutlined /> Student
                                    </span>
                                ),
                            },
                            {
                                key: 'lecturer',
                                label: (
                                    <span>
                                        <UserOutlined /> Lecturer
                                    </span>
                                ),
                            },
                        ]}
                    />

                    <div className="login-form-header">
                        <h2>Student Access</h2>
                        <p>Enter your ID to access the student portal</p>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        onFinish={handleLogin}
                        layout="vertical"
                        initialValues={{ remember: false }}
                        size="large"
                        className="academic-login-form"
                    >
                        <Form.Item
                            label="Student ID"
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your student ID!' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="e.g. B20230123"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span>Password</span>
                                    <Button
                                        type="link"
                                        onClick={handleForgotPassword}
                                        style={{ padding: 0, height: 'auto', fontSize: '14px' }}
                                        disabled={loading}
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
                            }
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 6, message: 'Password must be at least 6 characters!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                disabled={loading}
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            icon={!loading && <ArrowRightOutlined />}
                            className="login-submit-btn"
                        >
                            {loading ? 'Logging in...' : 'Login as Student'}
                        </Button>

                        <div className="social-login-section">
                            <Divider plain className="social-login-divider">
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Or continue with</span>
                            </Divider>
                            <div className="social-buttons">
                                <Button
                                    className="social-btn google-btn"
                                    icon={<GoogleOutlined />}
                                    onClick={() => message.info('Google login integration coming soon!')}
                                >
                                    Google
                                </Button>
                                <Button
                                    className="social-btn github-btn"
                                    icon={<GithubOutlined />}
                                    onClick={() => message.info('Github login integration coming soon!')}
                                >
                                    GitHub
                                </Button>
                            </div>
                        </div>

                        <div className="login-footer-text">
                            <span>First time here?</span>
                            <Button
                                type="link"
                                onClick={() => navigate('/register')}
                                style={{ padding: '0 4px' }}
                                disabled={loading}
                            >
                                Activate Account
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div >
    );
};

export default LoginPage;