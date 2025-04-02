import React, { useState } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Divider, 
  message,
  Row,
  Col
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return '';
    
    const firstInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0) : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordFinish = async (values) => {
    setPasswordLoading(true);
    try {
      await updateProfile({ password: values.newPassword });
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>My Profile</Title>
      
      <Row gutter={24}>
        <Col span={24} lg={8}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                size={80} 
                style={{ 
                  backgroundColor: user.first_name ? '#1890ff' : '#ccc',
                  fontSize: '24px',
                  marginBottom: '16px'
                }}
              >
                {user.first_name ? getInitials() : <UserOutlined />}
              </Avatar>
              
              <Title level={4}>{user.first_name} {user.last_name}</Title>
              <Text type="secondary">@{user.username}</Text>
              <Text>{user.email}</Text>
              
              <Divider />
              
              <Text type="secondary">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col span={24} lg={16}>
          <Card title="Edit Profile" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                email: user.email,
                first_name: user.first_name || '',
                last_name: user.last_name || ''
              }}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
              
              <Form.Item
                name="first_name"
                label="First Name"
              >
                <Input prefix={<UserOutlined />} placeholder="First Name" />
              </Form.Item>
              
              <Form.Item
                name="last_name"
                label="Last Name"
              >
                <Input prefix={<UserOutlined />} placeholder="Last Name" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
          
          <Card title="Change Password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordFinish}
            >
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter your new password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordLoading}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;