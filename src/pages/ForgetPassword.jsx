import React from 'react';
import { Button, Form, Input, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // 复用登录页面的样式

const ForgetPassword = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', {
        phone: values.phone,
        email: values.email,
        newPassword: values.newPassword,
      });
      messageApi.open({
        type: 'success',
        content: response.data.message,
      });
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: error.response?.data?.message || '密码重置失败',
      });
    }
  };

  return (
    <div className="login-container">
      {contextHolder}
      <Card title="找回密码" className="login-card">
        <Form
          form={form}
          name="reset_password_form"
          onFinish={onFinish}
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号!' },
              () => ({
                validator(_, value) {
                  const phoneRegex = /^1[3-9]\d{9}$/;
                  if (!phoneRegex.test(value)) {
                    return Promise.reject(new Error('手机号格式不正确'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="请输入注册时使用的手机号" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              () => ({
                validator(_, value) {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(value)) {
                    return Promise.reject(new Error('邮箱格式不正确'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="请输入注册时使用的邮箱" size="large" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码!' },
              { min: 6, message: '密码长度至少为6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码!' },
              { min: 6, message: '密码长度至少为6位' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              提交
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <a onClick={() => navigate('/login')}>
              返回登录
            </a>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForgetPassword;