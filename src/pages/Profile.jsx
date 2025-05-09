import React, { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Button, message, Modal, Form, Input } from 'antd';
import { UserOutlined, EditOutlined, LogoutOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 从 localStorage 获取 token 和 user_id
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id: userId
          }
        });
        setUserInfo(response.data);
        form.setFieldsValue({
          username: response.data.username,
          phone:response.data.phone,
          email: response.data.email,
        });
      } catch (error) {
        message.error(error.response?.data?.message || '获取用户信息失败');
      }
    };
    fetchProfile();
  }, [navigate, form, token]);

  const handleGoBack = () => {
    navigate('/home/dashboard');
  };

  const handleEdit = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const response = await axios.put(
        'http://localhost:5000/api/profile',
        values,
         {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id: userId
          }
        }
      );
      message.success(response.data.message);
      setUserInfo({ ...userInfo, ...values });
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || '更新用户信息失败');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  if (!userInfo) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 20 }} />
          <div>
            <h2 style={{ margin: 0 }}>{userInfo.username || '未设置'}</h2>
            <p style={{ margin: 0, color: 'gray' }}>{userInfo.role === 'admin' ? '管理员' : '用户'}</p>
          </div>
        </div>

        <Descriptions title="基本信息" bordered column={1} size="large">
          <Descriptions.Item label="用户ID">{userId}</Descriptions.Item>
          <Descriptions.Item label="用户名">{userInfo.username || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{userInfo.email || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{userInfo.phone}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{userInfo.created_at}</Descriptions.Item>
        </Descriptions>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button icon={<EditOutlined />} onClick={handleEdit} style={{ marginRight: 12 }}>
            编辑资料
          </Button>
          <Button icon={<LogoutOutlined />} danger onClick={handleGoBack}>
            返回
          </Button>
        </div>
      </Card>

      <Modal
        title="编辑用户信息"
        visible={isModalVisible}
        okText="确定"
        cancelText="取消"
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okButtonProps={{ style: { backgroundColor: '#1677ff', borderColor: '#1677ff' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ type: 'username', message: '用户名格式不正确' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ type: 'phone', message: '手机号格式不正确' }]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;