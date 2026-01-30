import React from 'react';
import { Result, Button } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ComingSoonPage = ({ title }) => {
    const navigate = useNavigate();
    return (
        <Result
            icon={<SmileOutlined />}
            title={title || "Coming Soon!"}
            subTitle="This feature is currently under development. Stay tuned!"
            extra={<Button type="primary" onClick={() => navigate('/')}>Back Home</Button>}
        />
    );
};

export default ComingSoonPage;
