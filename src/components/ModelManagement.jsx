import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Card, Typography, message } from 'antd';
import {
  DeleteOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Text, Link } = Typography;

const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // 获取模型列表
  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/model/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModels(response.data.models);
    } catch (error) {
      message.error('获取模型列表失败');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取模型列表
  useEffect(() => {
    fetchModels();
  }, [token]);

  // 删除模型
  const deleteModel = async (modelId) => {
    try {
      await axios.delete(`http://localhost:5000/api/model/delete/${modelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('模型删除成功');
      fetchModels(); // 刷新模型列表
    } catch (error) {
      message.error(error.response?.data?.message || '删除模型失败');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
      }
    }
  };

  // 格式化训练时间（秒 -> Xh Ymin）
  const formatTrainingTime = (seconds) => {
    if (!seconds) return '未知';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  // 计算遗忘率（假设遗忘率为 Class-IL 和 Task-IL 准确率的平均差值）
  const calculateForgetRate = (accuracy) => {
    if (!accuracy || !accuracy['Class-IL'] || !accuracy['Task-IL']) return '未知';
    const classIL = accuracy['Class-IL'];
    const taskIL = accuracy['Task-IL'];
    if (classIL.length !== taskIL.length) return '未知';

    let totalDiff = 0;
    for (let i = 0; i < classIL.length; i++) {
      totalDiff += Math.abs(classIL[i] - taskIL[i]);
    }
    const avgDiff = totalDiff / classIL.length;
    return `${avgDiff.toFixed(1)}%`;
  };

  // 计算 Class-IL 平均准确率
  const calculateClassILAccuracy = (accuracy) => {
    if (!accuracy || !accuracy['Class-IL']) return '未知';
    const classIL = accuracy['Class-IL'];
    const avgClassIL = classIL.reduce((sum, val) => sum + val, 0) / classIL.length;
    return `${avgClassIL.toFixed(1)}%`;
  };

  // 计算 Task-IL 平均准确率
  const calculateTaskILAccuracy = (accuracy) => {
    if (!accuracy || !accuracy['Task-IL']) return '未知';
    const taskIL = accuracy['Task-IL'];
    const avgTaskIL = taskIL.reduce((sum, val) => sum + val, 0) / taskIL.length;
    return `${avgTaskIL.toFixed(1)}%`;
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'model_name',
      render: (text) => <Link>{text}</Link>,
      fixed: 'left',
    },
    {
      title: '掌握数据集',
      dataIndex: 'dataset',
      render: (datasets) => (
        <span>
          {datasets.length > 0 ? datasets.join(', ') : '未知'}
        </span>
      ),
    },
    {
      title: '训练总时长',
      dataIndex: 'train_time',
      render: (time) => formatTrainingTime(time),
    },
    {
      title: 'Class-IL ACC',
      dataIndex: 'accuracy',
      render: (accuracy) => calculateClassILAccuracy(accuracy),
    },
    {
      title: 'Task-IL ACC',
      dataIndex: 'accuracy',
      render: (accuracy) => calculateTaskILAccuracy(accuracy),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            style={{ color: '#ff4d4f' }}
            icon={<DeleteOutlined />}
            onClick={() => deleteModel(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          模型管理
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={models}
        bordered
        size="middle"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
        rowKey="id"
      />
    </Card>
  );
};

export default ModelManagement;