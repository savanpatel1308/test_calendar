import React from 'react';
import { Layout, Menu, Avatar, Typography, Dropdown, Space } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  BellOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return '';
    
    const firstInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0) : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };
  
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];
  
  return (
    <Header style={{ 
      background: '#fff', 
      padding: '0 24px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
        <Text strong style={{ fontSize: '18px', marginRight: '24px' }}>Calendar App</Text>
        
        <Menu 
          mode="horizontal" 
          defaultSelectedKeys={['calendar']}
          style={{ border: 'none' }}
          items={[
            {
              key: 'calendar',
              label: 'Calendar',
              icon: <CalendarOutlined />,
              onClick: () => navigate('/calendar')
            },
            {
              key: 'reminders',
              label: 'Reminders',
              icon: <BellOutlined />,
              onClick: () => navigate('/reminders')
            }
          ]}
        />
      </div>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            trigger={['click']}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar 
                style={{ 
                  backgroundColor: user.first_name ? '#1890ff' : '#ccc',
                  marginRight: '8px'
                }}
              >
                {user.first_name ? getInitials() : <UserOutlined />}
              </Avatar>
              <Text strong>{user.username}</Text>
            </Space>
          </Dropdown>
        </div>
      )}
    </Header>
  );
};

export default Navbar;