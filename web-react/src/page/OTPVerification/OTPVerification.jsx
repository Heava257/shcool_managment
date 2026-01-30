import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Statistic, Typography } from 'antd';
import { MailOutlined, SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { request } from '../../../util/request';
import { profileStore } from '../../store/profileStore';
import './OTPVerification.css';

const { Countdown } = Statistic;
const { Title, Text } = Typography;

const OTPVerification = ({ email: propEmail, onVerificationSuccess }) => {
    const { setProfile, setAccessToken } = profileStore();
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get email from props or location state
    const email = propEmail || location.state?.email;

    useEffect(() => {
        if (!email) {
            message.error('Email not found. Please register again.');
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleVerifyOTP = async (values) => {
        setLoading(true);
        
        try {
            const param = {
                email: email,
                otp: values.otp
            };

            const res = await request('auth/verify-otp', 'post', param);
            
            if (res && !res.error) {
                message.success('Email verified successfully! You can now login.');
                
                // Store the access token and profile
                if (res.access_token) {
                    setAccessToken(res.access_token);
                    setProfile({
                        ...res.user?.profile,
                        ...res.user
                    });
                    
                    // Navigate to home/dashboard
                    setTimeout(() => {
                        if (onVerificationSuccess) {
                            onVerificationSuccess(res);
                        } else {
                            navigate('/');
                        }
                    }, 1000);
                } else {
                    // If no token returned, navigate to login
                    setTimeout(() => {
                        navigate('/login');
                    }, 1500);
                }
            } else {
                message.error(res.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            message.error(error.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResending(true);
        
        try {
            const res = await request('auth/resend-otp', 'post', { email });
            
            if (res && !res.error) {
                message.success('OTP sent successfully! Please check your email.');
                setCanResend(false);
                setCountdown(60);
                
                // Restart countdown
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            setCanResend(true);
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                message.error(res.message || 'Failed to resend OTP.');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            message.error(error.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="otp-container">
            <div className="otp-background">
                <div className="otp-overlay"></div>
            </div>
            
            <Card className="otp-card" bordered={false}>
                <div className="otp-header">
                    <div className="otp-logo">
                        <div className="logo-circle">
                            <MailOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                        </div>
                    </div>
                    <Title level={2} style={{ margin: '24px 0 8px', textAlign: 'center' }}>
                        Verify Your Email
                    </Title>
                    <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '8px' }}>
                        We've sent a 6-digit code to
                    </Text>
                    <Text strong style={{ display: 'block', textAlign: 'center', color: '#1890ff', fontSize: '16px' }}>
                        {email}
                    </Text>
                </div>

                <Form
                    form={form}
                    name="verify-otp"
                    onFinish={handleVerifyOTP}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="otp"
                        rules={[
                            { required: true, message: 'Please input the OTP!' },
                            { len: 6, message: 'OTP must be 6 digits!' },
                            { pattern: /^[0-9]+$/, message: 'OTP must contain only numbers!' }
                        ]}
                        hasFeedback
                    >
                        <Input
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            style={{ 
                                fontSize: '24px', 
                                textAlign: 'center', 
                                letterSpacing: '12px',
                                height: '56px',
                                borderRadius: '12px'
                            }}
                            disabled={loading}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: '16px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{ 
                                height: '48px', 
                                fontSize: '16px',
                                borderRadius: '12px',
                                fontWeight: '500'
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <Space direction="vertical" size={4}>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Didn't receive the code?
                            </Text>
                            <Button
                                type="link"
                                onClick={handleResendOTP}
                                disabled={!canResend || resending}
                                loading={resending}
                                style={{ 
                                    padding: 0,
                                    height: 'auto',
                                    fontSize: '14px'
                                }}
                            >
                                {resending ? 'Sending...' : canResend ? 'Resend OTP' : `Resend in ${formatTime(countdown)}`}
                            </Button>
                        </Space>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/login')}
                            style={{ 
                                padding: '8px 16px',
                                fontSize: '14px',
                                color: '#8c8c8c'
                            }}
                            disabled={loading}
                        >
                            Back to Login
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default OTPVerification;