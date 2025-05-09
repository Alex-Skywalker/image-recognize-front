import React, { useState, useEffect, useRef } from 'react';
import { Button, Checkbox, Form, Input, Card, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, ReloadOutlined, MobileOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Login.css';

const { Title, Paragraph } = Typography;

const Login = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 控制显示的表单：login, register, forget
  const [captcha, setCaptcha] = useState('');
  const canvasRef = useRef(null);

  // 生成随机验证码（仅用于登录表单）
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captchaText = '';
    for (let i = 0; i < 4; i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(captchaText);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#F5F7FA';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < captchaText.length; i++) {
      ctx.fillStyle = '#1890FF';
      ctx.fillText(captchaText[i], 20 + i * 30, height / 2 + (Math.random() * 10 - 5));
    }
  };

  // 初始化验证码（仅在登录模式下）
  useEffect(() => {
    if (mode === 'login') {
      generateCaptcha();
    }
  }, [mode]);

  // 登录表单提交
  const onLoginFinish = async (values) => {
    if (values.captcha !== captcha) {
      messageApi.open({
        type: 'error',
        content: '验证码错误',
      });
      generateCaptcha();
      form.setFieldsValue({ captcha: '' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        account: values.account,
        password: values.password,
      });
      messageApi.open({
        type: 'success',
        content: response.data.message,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_id', response.data.user_id);
      setTimeout(() => {
        setLoading(false);
        window.location.href = '/home/dashboard'; // 直接跳转
      }, 1000);
    } catch (error) {
      setLoading(false);
      messageApi.open({
        type: 'error',
        content: error.response?.data?.message || '登录失败',
      });
      generateCaptcha();
      form.setFieldsValue({ captcha: '' });
    }
  };

  // 注册表单提交
  const onRegisterFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        phone: values.phone,
        password: values.password,
        email: values.email,
      });
      messageApi.open({
        type: 'success',
        content: response.data.message,
      });
      setTimeout(() => {
        setLoading(false);
        setMode('login'); // 注册成功后切换回登录
        form.resetFields();
      }, 1000);
    } catch (error) {
      setLoading(false);
      messageApi.open({
        type: 'error',
        content: error.response?.data?.message || '注册失败',
      });
    }
  };

  // 找回密码表单提交
  const onForgetFinish = async (values) => {
    setLoading(true);
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
      setTimeout(() => {
        setLoading(false);
        setMode('login'); // 重置成功后切换回登录
        form.resetFields();
      }, 1000);
    } catch (error) {
      setLoading(false);
      messageApi.open({
        type: 'error',
        content: error.response?.data?.message || '密码重置失败',
      });
    }
  };

  return (
    <div className="login-container">
      {contextHolder}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">
            <Title level={1} className="logo-text">
              ImageRecognize
            </Title>
          </div>
          <Paragraph className="login-description">
            基于持续学习的图像识别系统
          </Paragraph>
        </div>
      </div>
      <div className="login-right">
        <Card className="login-card">
          <Title level={2} className="login-title">
            {mode === 'login' ? '登录' : mode === 'register' ? '注册账号' : '找回密码'}
          </Title>

          <Form
            form={form}
            name={mode === 'login' ? 'login_form' : mode === 'register' ? 'register_form' : 'reset_password_form'}
            onFinish={mode === 'login' ? onLoginFinish : mode === 'register' ? onRegisterFinish : onForgetFinish}
            initialValues={mode === 'login' ? { remember: true } : {}}
          >
            {mode === 'login' && (
              <>
                <Form.Item
                  name="account"
                  rules={[
                    { required: true, message: '请输入手机号或邮箱!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) {
                          return Promise.reject();
                        }
                        if (!value.includes('@')) {
                          const phoneRegex = /^1[3-9]\d{9}$/;
                          if (!phoneRegex.test(value)) {
                            return Promise.reject(new Error('手机号格式不正确'));
                          }
                        }
                        if (value.includes('@')) {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(value)) {
                            return Promise.reject(new Error('邮箱格式不正确'));
                          }
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="手机号或邮箱"
                    size="large"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                    size="large"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="captcha"
                  rules={[{ required: true, message: '请输入验证码!' }]}
                  className="login-mode"
                >
                  <Space>
                    <Input
                      placeholder="请输入验证码"
                      size="large"
                      className="login-input"
                      style={{ width: 240 }}
                    />
                    <canvas
                      ref={canvasRef}
                      width="120"
                      height="50"
                      style={{ border: '1px solid #E6F0FA', borderRadius: 4, marginBottom: -2 }}
                    />
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={generateCaptcha}
                      size="large"
                    />
                  </Space>
                </Form.Item>

                <Form.Item style={{ marginBottom: 8 }} className="login-mode">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>记住密码</Checkbox>
                  </Form.Item>
                  <a
                    style={{ float: 'right', color: '#1890ff' }}
                    onClick={() => setMode('forget')}
                  >
                    忘记密码？
                  </a>
                </Form.Item>

                <Form.Item className="login-mode">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    className="login-button"
                  >
                    登录
                  </Button>
                </Form.Item>

                <Form.Item style={{ textAlign: 'center', marginBottom: 0 }} className="login-mode">
                  <span>还没有账号？ </span>
                  <a onClick={() => setMode('register')} style={{ color: '#1890ff' }}>
                    立即注册
                  </a>
                </Form.Item>
              </>
            )}

            {mode === 'register' && (
              <>
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
                    className="login-input"
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
                    className="login-input"
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
                    className="login-input"
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
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    className="login-button"
                  >
                    注册
                  </Button>
                </Form.Item>

                <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                  已有账号？{' '}
                  <a onClick={() => setMode('login')} style={{ color: '#1890ff' }}>
                    返回登录
                  </a>
                </Form.Item>
              </>
            )}

            {mode === 'forget' && (
              <>
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
                  <Input
                    prefix={<MobileOutlined />}
                    placeholder="请输入注册时使用的手机号"
                    size="large"
                    className="login-input"
                  />
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
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="请输入注册时使用的邮箱"
                    size="large"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  rules={[
                    { required: true, message: '请输入新密码!' },
                    { min: 6, message: '密码长度至少为6位' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入新密码"
                    size="large"
                    className="login-input"
                  />
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
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请再次输入新密码"
                    size="large"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    className="login-button"
                  >
                    提交
                  </Button>
                </Form.Item>

                <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                  <a onClick={() => setMode('login')} style={{ color: '#1890ff' }}>
                    返回登录
                  </a>
                </Form.Item>
              </>
            )}
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;