import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Typography, Space, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const TaskManagement = ({ setHasRunningTask, setLoading }) => {
  const [tasks, setTasks] = useState([]);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [logs, setLogs] = useState({ training_logs: '', error_logs: '' });

  const token = localStorage.getItem('token');

  // 获取任务列表
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/task/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
      const hasRunning = response.data.tasks.some(task => task.status === 'running');
      setHasRunningTask(hasRunning);
    } catch (error) {
      message.error('获取任务列表失败');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取任务列表
  useEffect(() => {
    fetchTasks();
  }, [token, setHasRunningTask, setLoading]);

  // 查看任务日志
  const viewLogs = async (taskId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/task/info/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTask(taskId);
      setLogs({
        training_logs: response.data.training_logs,
        error_logs: response.data.error_logs,
      });
      setLogsModalVisible(true);
    } catch (error) {
      message.error('获取日志失败');
    }
  };

  // 终止任务
  const stopTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/task/stop/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('任务已终止');
      fetchTasks(); // 刷新任务列表
    } catch (error) {
      message.error(error.response?.data?.message || '终止任务失败');
    }
  };

  const columns = [
    {
      title: '任务 ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span>{text.slice(0, 8)}...</span>,
    },
    {
      title: '模型名称',
      dataIndex: 'model_name',
      key: 'model_name',
    },
    {
      title: '数据集',
      dataIndex: 'dataset',
      key: 'dataset',
      render: (text) => (
        <span
          style={{
            padding: '4px 8px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            color: '#555',
          }}
        >
          {text || '未知'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          running: 'blue',
          end: 'red',
          success: 'green',
        };
        const color = colorMap[status] || undefined;
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => (text ? new Date(text).toLocaleString() : '未知'),
    },
    {
      title: '结束时间',
      dataIndex: 'end_at',
      key: 'end_at',
      render: (text) => (text ? new Date(text).toLocaleString() : '未知'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => viewLogs(record.id)}>查看日志</Button>
          {record.status === 'running' && (
            <Button danger onClick={() => stopTask(record.id)}>终止</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>训练进程管理</Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchTasks}
        >
          刷新
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        pagination={{ pageSize: 6 }}
      />

      {/* 日志查看模态框 */}
      <Modal
        title={`任务 ${selectedTask?.slice(0, 8)} 日志`}
        open={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          <Title level={5}>训练日志</Title>
          <pre>{logs.training_logs || '无训练日志'}</pre>
          <Title level={5}>错误日志</Title>
          <pre>{logs.error_logs || '无错误日志'}</pre>
        </div>
      </Modal>
    </div>
  );
};

export default TaskManagement;