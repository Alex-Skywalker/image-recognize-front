import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Spin,
  Row,
  Col,
  Statistic,
  Typography,
  message,
  Space,
  Divider,
} from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const { Option } = Select;
const { Title, Text } = Typography;

const ResultsVisualization = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [datasetCharts, setDatasetCharts] = useState([]);
  const [stats, setStats] = useState({ classIL: 0, taskIL: 0, duration: 0 });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // 格式化时间（秒 -> 小时/分钟）
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // 获取模型数据
  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/model/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModels(response.data.models);
      setLoading(false);
    } catch (error) {
      message.error('获取模型数据失败');
      setLoading(false);
    }
  };

  // 处理模型选择
  const handleModelChange = (value) => {
    setSelectedModelId(value);
    if (!value) {
      setDatasetCharts([]);
      setStats({ classIL: 0, taskIL: 0, duration: 0 });
      return;
    }

    // 查找所选模型
    const model = models.find((m) => m.id === value);
    if (!model) {
      setDatasetCharts([]);
      setStats({ classIL: 0, taskIL: 0, duration: 0 });
      return;
    }

    // 假设 accuracy 对应 dataset[0]（单一数据集）
    const dataset = model.dataset || 'unknown';
    const classIL = model.accuracy['Class-IL'] || [];
    const taskIL = model.accuracy['Task-IL'] || [];

    // 生成折线图数据
    const chartData = classIL.map((acc, index) => ({
      task: `Task ${index + 1}`,
      classIL: acc,
      taskIL: taskIL[index] || 0,
    }));

    // 存储数据集的折线图数据
    setDatasetCharts([
      {
        dataset,
        data: chartData,
      },
    ]);

    const acc_il=

    // 计算统计信息（针对第一个数据集）
    setStats({
      classIL:  classIL.reduce((sum, val) => sum + val, 0) / classIL.length,
      taskIL:  taskIL.reduce((sum, val) => sum + val, 0) / taskIL.length,
      duration: model.train_time || 0,
    });
  };

  // 初始化加载模型数据
  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div style={{ padding: 24, background: '#f5f6f7' }}>
      <Spin spinning={loading}>
        <Card title="模型训练结果可视化">
          <Space style={{ marginBottom: 16 }}>
            <Text>选择模型：</Text>
            <Select
              style={{ width: 300 }}
              placeholder="请选择模型"
              value={selectedModelId}
              onChange={handleModelChange}
              allowClear
            >
              {models.map((model) => (
                <Option key={model.id} value={model.id}>
                  {model.model_name} 
                </Option>
              ))}
            </Select>
          </Space>

          {datasetCharts.length > 0 && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="平均 Class-IL 准确率"
                    value={`${stats.classIL.toFixed(2)}%`}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="平均 Task-IL 准确率"
                    value={`${stats.taskIL.toFixed(2)}%`}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="总训练时长"
                    value={formatDuration(stats.duration)}
                  />
                </Col>
              </Row>

              {datasetCharts.map((chart, index) => (
                <div key={index} style={{ marginBottom: 32 }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={chart.data}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="task"
                        label={{ value: '任务', position: 'insideBottomRight', offset: -5 }}
                      />
                      <YAxis
                        label={{ value: '准确率 (%)', angle: -90, position: 'insideLeft' }}
                        domain={[0, 100]}
                      />
                      <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="classIL"
                        name="Class-IL 准确率"
                        stroke="#1890ff"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="taskIL"
                        name="Task-IL 准确率"
                        stroke="#52c41a"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </>
          )}
          {!datasetCharts.length && !loading && (
            <Text type="secondary">请选择一个模型以查看训练结果</Text>
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default ResultsVisualization;