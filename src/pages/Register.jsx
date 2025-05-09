import React from 'react';
import { Button, Form, Input, Card, message } from 'antd';
import { MobileOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        phone: values.phone,
        password: values.password,
        email: values.email,
      });
      message.success(response.data.message);
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败');
    }
  };

  return (
    <div className="login-container">
      <Card title="注册账号" className="login-card">
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="请输入手机号"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="设置密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              注册
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            已有账号？{' '}
            <a onClick={() => navigate('/login')}>返回登录</a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;