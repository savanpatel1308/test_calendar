import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Registration successful!');
      navigate('/calendar');
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>Create Account</Title>
          <Text type="secondary">Sign up to start organizing your schedule</Text>
        </div>
        
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters' },
              { pattern: /^[a-zA-Z0-9._-]+$/, message: 'Username can only contain letters, numbers, and ._-' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          
          <Form.Item
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>
          
          <Form.Item name="first_name">
            <Input prefix={<UserAddOutlined />} placeholder="First Name (Optional)" size="large" />
          </Form.Item>
          
          <Form.Item name="last_name">
            <Input prefix={<UserAddOutlined />} placeholder="Last Name (Optional)" size="large" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Register
            </Button>
          </Form.Item>
        </Form>
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Text>Already have an account? </Text>
          <Link to="/login">Sign in</Link>
        </div>
      </Card>
    </div>
  );
};
export default RegisterPage