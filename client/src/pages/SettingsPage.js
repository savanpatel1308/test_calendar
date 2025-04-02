// src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Switch, 
  List,
  Divider,
  Select,
  Button,
  message
} from 'antd';
import { 
  BellOutlined, 
  GlobalOutlined, 
  SecurityScanOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const SettingsPage = () => {
  // Option 1: Use the user in the component
  const { user } = useAuth();

  // If you want to show user's name or email in settings
  useEffect(() => {
    if (user) {
      // Example of using user data (optional)
      console.log('Current user:', user.email);
    }
  }, [user]);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [timeZone, setTimeZone] = useState('UTC');
  const [loading, setLoading] = useState(false);
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // In a real application, you would save these settings to the server
    // For this demo, we'll just simulate a delay and show a success message
    setTimeout(() => {
      setLoading(false);
      message.success('Settings saved successfully');
    }, 1000);
  };
  
  return (
    <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Settings {user && `for ${user.name}`}</Title>
      
      <Card title="Notifications" style={{ marginBottom: '24px' }}>
        <List.Item
          extra={
            <Switch 
              checked={emailNotifications} 
              onChange={setEmailNotifications}
            />
          }
        >
          <List.Item.Meta
            avatar={<BellOutlined />}
            title="Email Notifications"
            description="Receive event reminders via email"
          />
        </List.Item>
        
        <List.Item
          extra={
            <Switch 
              checked={systemNotifications} 
              onChange={setSystemNotifications}
            />
          }
        >
          <List.Item.Meta
            avatar={<BellOutlined />}
            title="System Notifications"
            description="Receive event reminders via browser notifications"
          />
        </List.Item>
      </Card>
      
      <Card title="Regional Settings" style={{ marginBottom: '24px' }}>
        <List.Item
          extra={
            <Select 
              style={{ width: 200 }} 
              value={timeZone}
              onChange={setTimeZone}
            >
              <Option value="UTC">UTC (Coordinated Universal Time)</Option>
              <Option value="America/New_York">Eastern Time (ET)</Option>
              <Option value="America/Chicago">Central Time (CT)</Option>
              <Option value="America/Denver">Mountain Time (MT)</Option>
              <Option value="America/Los_Angeles">Pacific Time (PT)</Option>
              <Option value="Europe/London">London (GMT)</Option>
              <Option value="Europe/Paris">Paris (CET)</Option>
              <Option value="Asia/Tokyo">Tokyo (JST)</Option>
            </Select>
          }
        >
          <List.Item.Meta
            avatar={<GlobalOutlined />}
            title="Time Zone"
            description="Select your preferred time zone for events"
          />
        </List.Item>
      </Card>
      
      <Card title="Security">
        <List.Item
          extra={
            <Switch defaultChecked />
          }
        >
          <List.Item.Meta
            avatar={<SecurityScanOutlined />}
            title="Two-Factor Authentication"
            description="Enable extra security for your account"
          />
        </List.Item>
      </Card>
      
      <Divider />
      
      <div style={{ textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={handleSaveSettings}
          loading={loading}
        >
          Save Settings
        </Button>
      </div>
    </Content>
  );
};

export default SettingsPage;