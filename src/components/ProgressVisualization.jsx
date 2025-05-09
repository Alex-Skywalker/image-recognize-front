import React, { useState, useEffect } from 'react';
import { Card, Select, Spin, Button, Table, Tag, Typography, message, Space, Progress } from 'antd';
import { SyncOutlined, EyeOutlined, PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined,} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

// 模拟数据（可替换为后端 API）
const mockTasks = [
  {
    id: '12345678',
    model: 'hybridmultifeature',
    dataset: 'seq-cifar100',
    status: 'running',
    progress: 75,
    startTime: '2025-04-13 10:00',
    estimatedEnd: '2025-04-13 12:00',
  },
  {
    id: '12345679',
    model: 'derpp',
    dataset: 'seq-mnist',
    status: 'completed',
    progress: 100,
    startTime: '2025-04-12 09:00',
    endTime: '2025-04-12 11:30',
  },
];

const ProgressVisualization = ({ onSelectTask }) => {
  const [tasks, setTasks] = useState(mockTasks);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // 获取任务数据
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
      message.success('数据已刷新');
    }, 1000);
    /*
    setLoading(true);
    axios.get('/api/train/tasks').then(res => {
      setTasks(res.data);
      setLoading(false);
      message.success('数据已刷新');
    }).catch(() => {
      message.error('数据加载失败');
      setLoading(false);
    });
    */
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 筛选任务状态
  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };

  // 表格列定义
  const columns = [
    { title: '进程 ID', dataIndex: 'id', key: 'id' },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      render: (text) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    { title: '数据集', dataIndex: 'dataset', key: 'dataset' },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => text || '-',
    },
    {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 'running' ? 'blue' : 'green'}>
            {status === 'running' ? '进行中' : '已完成'}
          </Tag>
        ),
      },
      {
        title: '进度',
        dataIndex: 'progress',
        key: 'progress',
        render: (progress) => <Progress percent={progress} size="small" />,
      },
      {
        title: '操作',
        render: (_, record) => (
          <Space>
            <Button type="link" style={{ color: '#52c41a' }} icon={<PlayCircleOutlined/> }>启动</Button>
            <Button type="link" style={{ color: '#fa8c16' }} icon={<PauseCircleOutlined />}>停止</Button>
            <Button type="link" style={{ color: '#ff4d4f' }} icon={<DeleteOutlined />}>删除</Button>
          </Space>
        )
      }
  ];

  // 过滤任务
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  return (
    <div style={{ padding: 24, background: '#f5f6f7' }}>
      <Spin spinning={loading}>
        <Card title="训练进程情况">
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey="id"
            pagination={false}
            bordered
          />
        </Card>
      </Spin>
    </div>
  );
};

export default ProgressVisualization;