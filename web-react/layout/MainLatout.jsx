// MainLayout.jsx
import React, { useEffect, useState } from 'react';
import {
  DashboardOutlined,
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
  BookOutlined,
  ReadOutlined,
  UserAddOutlined, // Added icon
} from '@ant-design/icons';
import { Layout, Menu, theme, Dropdown, Avatar, Space } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import { profileStore } from '../src/store/profileStore';
import config from '../util/config';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

// Define menu items for each role
const adminItems = [
  getItem('Dashboard', '/', <DashboardOutlined />),
  getItem('Academic', '/academic', <ReadOutlined />, [
    getItem('Students', '/admin/students', <TeamOutlined />),
    getItem('Subjects', '/admin/subjects', <BookOutlined />),
  ]),
  getItem('Administration', '/admin', <UserOutlined />, [
    getItem('Pending Users', '/admin/pending-users', <UserAddOutlined />),
    getItem('Roles', '/role', <SafetyOutlined />),
  ]),
];

const teacherItems = [
  getItem('Dashboard', '/', <DashboardOutlined />),
  getItem('My Classes', '/teacher/classes', <TeamOutlined />),
  getItem('Schedule', '/teacher/schedule', <ReadOutlined />),
  getItem('Assignments', '/teacher/assignments', <BookOutlined />),
  getItem('Attendance', '/teacher/attendance', <SafetyOutlined />),
];

const studentItems = [
  getItem('Dashboard', '/', <DashboardOutlined />),
  getItem('My Schedule', '/student/schedule', <ReadOutlined />),
  getItem('My Grades', '/student/grades', <BookOutlined />),
  getItem('Assignments', '/student/assignments', <BookOutlined />),
  getItem('Attendance', '/student/attendance', <SafetyOutlined />),
];

// Fallback for unknown roles
const defaultItems = [
  getItem('Dashboard', '/', <DashboardOutlined />),
];

const MainLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Get profile and logout from the store
  const { profile, logout } = profileStore();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (!profile) {
      navigate("/login");
    }
  }, [profile, navigate]);

  const companyName = 'Academic Portal';

  // Determine menu items based on role
  const getMenuItems = () => {
    switch (profile?.role) {
      case 'admin':
        return adminItems;
      case 'teacher':
        return teacherItems;
      case 'student':
        return studentItems;
      default:
        // Use admin items for dev/testing if role is missing, or default
        // For now, if role is Pending or unknown, show limited menu
        return defaultItems;
    }
  };

  const currentMenuItems = getMenuItems();

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    logout(); // Clear localStorage and reset profile
    navigate('/login');
  };

  // Dropdown menu items
  const profileMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: handleProfile,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: handleSettings,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div
          className="demo-logo-vertical"
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 16 : 18,
            fontWeight: 'bold',
            padding: '0 16px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? 'AP' : companyName}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['/']}
          mode="inline"
          items={currentMenuItems}
          onClick={(item) => navigate(item.key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            {companyName}
          </div>

          <Dropdown
            menu={{ items: profileMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 8 }}>
              <Avatar
                style={{ backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
                src={config.image_path + profile?.image}
              />
              <Space direction="vertical" size={0} style={{ lineHeight: 1.2 }}>
                <span style={{ fontWeight: 500 }}>{profile?.name}</span>
                <span style={{ fontSize: 12, color: '#999' }}>{profile?.role}</span>
              </Space>
              <DownOutlined style={{ fontSize: 12 }} />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          {companyName} ©{new Date().getFullYear()} All rights reserved
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;