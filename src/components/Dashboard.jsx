import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Progress, Divider, Space, Typography, message } from 'antd';
import { RocketOutlined, TrophyOutlined, FolderOpenOutlined, DatabaseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Pie } from '@ant-design/charts';
import axios from 'axios';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    trainingModels: 0,
    models: 0,
    uploadedResources: 0,
    storageUsed: 0,
    completedTasks: 0,
    classILAccuracy: 0,
    taskILAccuracy: 0,
  });
  const [pieData, setPieData] = useState([]);
  const [taskProgress, setTaskProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // 获取统计数据
  const fetchStats = async () => {
    setLoading(true);
    try {
      // 获取模型数据
      const modelResponse = await axios.get('http://localhost:5000/api/model/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const models = modelResponse.data.models || [];

      // 获取任务数据
      const taskResponse = await axios.get('http://localhost:5000/api/task/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasks = taskResponse.data.tasks || [];

      // 获取资源统计
      const resourceResponse = await axios.get('http://localhost:5000/api/resource/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resources = resourceResponse.data.resources;

      // 计算统计信息
      const trainingModels = tasks.filter((task) => task.status === 'running').length;
      const completedTasks = tasks.filter((task) => task.status === 'success').length;

      // 计算资源
      const uploadedResources = resources.image.file_count + resources.dataset.file_count + resources.others.file_count;
      const storageUsed = resources.image.total_size + resources.dataset.total_size + resources.others.total_size;

      // 计算 Class-IL 和 Task-IL 平均准确率
      const classILAccuracies = models.length > 0 ? models[models.length - 1].accuracy['Class-IL'] : [];
      const taskILAccuracies = models.length > 0 ? models[models.length - 1].accuracy['Task-IL'] : [];

      const averageClassILAccuracy = classILAccuracies.length
        ? (classILAccuracies.reduce((sum, acc) => sum + acc, 0) / classILAccuracies.length).toFixed(1)
        : 0;
      const averageTaskILAccuracy = taskILAccuracies.length
        ? (taskILAccuracies.reduce((sum, acc) => sum + acc, 0) / taskILAccuracies.length).toFixed(1)
        : 0;

      // 计算任务进度（假设每个任务 1 小时）
      const runningTasks = tasks.filter((task) => task.status === 'running');
      let progress = 1;


      const resourceList = [];
      resourceList.push({
        type: '图像',
        value: resources.image.total_size,
      });
      resourceList.push({
        type: '数据集',
        value: resources.dataset.total_size,
      });
      resourceList.push({
        type: '其他',
        value: resources.others.total_size,
      });
      setPieData(resourceList);

      setStats({
        trainingModels,
        models: models.length,
        uploadedResources,
        storageUsed,
        completedTasks,
        classILAccuracy: averageClassILAccuracy,
        taskILAccuracy: averageTaskILAccuracy,
      });
      setTaskProgress(progress);
      setLoading(false);
      message.success('数据已刷新');
    } catch (error) {
      message.error('获取数据失败');
      console.log(error);
      setLoading(false);
    }
  };

  // 初次加载数据
  useEffect(() => {
    fetchStats();
  }, []);

  // 饼图配置
  const pieConfig = {
    appendPadding: 10,
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: { fontSize: 14, textAlign: 'center' },
    },
    interactions: [{ type: 'element-active' }],
    color: ['#1890ff', '#52c41a', '#fa8c16'],
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 标题与刷新按钮 */}
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4}>工作台总览</Title>
        <Button type="primary" onClick={fetchStats} loading={loading}>
          刷新数据
        </Button>
      </Space>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable loading={loading}>
            <Statistic
              title="训练中的模型"
              value={stats.trainingModels}
              prefix={<RocketOutlined />}
              suffix="个"
            />
            <Button
              type="link"
              onClick={() => navigate('/home/train/trainManagement')}
              style={{ marginTop: 8 }}
            >
              查看训练进程
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable loading={loading}>
            <Statistic
              title="成果模型"
              value={stats.models}
              prefix={<TrophyOutlined />}
              suffix="个"
            />
            <Button
              type="link"
              onClick={() => navigate('/home/modelManagement')}
              style={{ marginTop: 8 }}
            >
              管理模型
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable loading={loading}>
            <Statistic
              title="已上传的资源"
              value={stats.uploadedResources}
              prefix={<FolderOpenOutlined />}
              suffix="个"
            />
            <Button
              type="link"
              onClick={() => navigate('/home/resourceManagement')}
              style={{ marginTop: 8 }}
            >
              管理资源
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable loading={loading}>
            <Statistic
              title="占用的总存储"
              value={stats.storageUsed}
              prefix={<DatabaseOutlined />}
              suffix="MB"
            />
            <Button
              type="link"
              onClick={() => navigate('/home/resourceManagement')}
              style={{ marginTop: 8 }}
            >
              管理资源
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable loading={loading}>
            <Statistic
              title="已完成任务"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              suffix="个"
            />
            <Button
              type="link"
              onClick={() => navigate('/home/visualization')}
              style={{ marginTop: 8 }}
            >
              管理进程
            </Button>
          </Card>
        </Col>
      </Row>

      {/* 可视化区域 */}
      <Divider orientation="left">系统状态</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="资源存储分布" loading={loading}>
            {pieData.length > 0 ? (
              <Pie {...pieConfig} style={{ height: 200 }} />
            ) : (
              <Text type="secondary">暂无资源数据</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="模型与训练状态" loading={loading}>
            <div>
              <Text strong>最新模型准确率</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Statistic
                  title="Class-IL 准确率"
                  value={stats.classILAccuracy}
                  suffix="%"
                  style={{ flex: 1 }}
                />
                <Statistic
                  title="Task-IL 准确率"
                  value={stats.taskILAccuracy}
                  suffix="%"
                  style={{ flex: 1, marginLeft: 16 }}
                />
              </div>
              <Button
                type="link"
                onClick={() => navigate('/home/visualization/results')}
                style={{ marginTop: 8 }}
              >
                结果可视化
              </Button>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div>
              <Text strong>训练进度</Text>
              {stats.trainingModels > 0 ? (
                <div style={{ marginTop: 8 }}>
                  <Text>当前任务进度</Text>
                  <Progress percent={taskProgress} status="active" style={{ marginTop: 8 }} />
                  <Button
                    type="link"
                    onClick={() => navigate('/home/train/taskManagement')}
                    style={{ marginTop: 8 }}
                  >
                    查看训练详情
                  </Button>
                </div>
              ) : (
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  暂无训练进程
                </Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;