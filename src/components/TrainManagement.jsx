import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Space,
  Divider,
  Typography,
  message,
  Radio,
  Card,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;
const { Title } = Typography;

const TrainManagement = ({ hasRunningTask, setLoading }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [trainType, setTrainType] = useState('new');
  const [taskId, setTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);

  const token = localStorage.getItem('token');

  // 获取数据集列表
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response1 = await axios.get('http://localhost:5000/api/resource/list/dataset', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const response2 = await axios.get('http://localhost:5000/api/model/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const datasetList = response1.data.resources.map(resource => ({
          value: resource.name,
          label: resource.name,
        }));
        const modelList = response2.data.models.map(model => ({
          value: model.model_name,
          label: model.model_name,
        }));
        setDatasets(datasetList);
        setModels(modelList)
      } catch (error) {
        message.error('获取数据失败');
      }
    };
    fetchDatasets();
  }, [token]);

  // 轮询任务状态
  useEffect(() => {
    let interval;
    if (taskId) {
      setLoading(true);
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/task/info/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTaskStatus(response.data);
          if (response.data.training_logs.includes('Training completed') || response.data.error_logs) {
            clearInterval(interval);
            setLoading(false);
            setTaskId(null);
          }
        } catch (error) {
          clearInterval(interval);
          setLoading(false);
          setTaskId(null);
          message.error('获取任务状态失败');
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [taskId, token, setLoading]);

  // 切换训练类型
  const handleTrainTypeChange = (e) => {
    setTrainType(e.target.value);
    form.resetFields(['model', 'checkpoint']);
  };

  // 提交训练任务
  const onFinish = async (values) => {
    setLoading(true);
    setTaskStatus(null);
    setTaskId(null);
    
    const {
      modelName,
      dataset,
      lr,
      batchSize,
      bufferSize,
      nEpochs,
      additionalParams = [],
    } = values;
  
    // 使用新变量保存转换结果
    let datasetMapped = dataset;
    if (dataset === 'CIFAR-10') {
      datasetMapped = 'seq-cifar10';
    } else if (dataset === 'CIFAR-100') {
      datasetMapped = 'seq-cifar100';
    } else if (dataset === 'Tiny-imagenet') {
      datasetMapped = 'seq-tinyimg';
    }
  
    const args = {
      dataset: datasetMapped,
      lr: lr || 0.03,
      batch_size: batchSize || 32,
      buffer_size: bufferSize || 200,
      epochs: nEpochs || 200,
      others: additionalParams
        .filter(param => param.key && param.value !== undefined)
        .reduce((acc, param) => {
          acc[param.key] = param.value;
          return acc;
        }, {}),
    };

    const params = {
      model_name: modelName,
      args,
    };

    try {
      const response = await axios.post(
        'http://localhost:5000/api/task/train',
        params,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTaskId(response.data.task_id);
      message.success('训练任务已启动！请在“训练进程管理”页面查看任务状态。');
      navigate('/home/train/taskManagement');
    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.message || '训练启动失败');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8 }}>
      <Title level={3}>模型训练参数配置</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          lr: 0.03,
          batchSize: 64,
          bufferSize: 200,
          nEpochs: 200,
        }}
      >
        <Form.Item label="训练类型" required>
          <Radio.Group value={trainType} onChange={handleTrainTypeChange}>
            <Radio value="new">新训练</Radio>
            <Radio value="continue">继续训练（增量学习）</Radio>
          </Radio.Group>
        </Form.Item>

        {trainType === 'new' ? (
          <>
            <Form.Item
              label="模型名称"
              name="modelName"
              rules={[{ required: true, message: '请输入模型名称' }]}
            >
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
          label="数据集"
          name="dataset"
          rules={[{ required: true, message: '请选择数据集' }]}
        >
          <Select placeholder="选择数据集">
            {datasets.map(ds => (
              <Option key={ds.value} value={ds.value}>
                {ds.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="学习率"
          name="lr"
          rules={[{ required: true, message: '请输入学习率' }]}
        >
          <InputNumber min={0.0001} max={1} step={0.0001} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Batch Size"
          name="batchSize"
          rules={[{ required: true, message: '请输入 Batch Size' }]}
        >
          <InputNumber min={1} max={512} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Buffer Size"
          name="bufferSize"
          rules={[{ required: true, message: '请输入 Buffer Size' }]}
        >
          <InputNumber min={1} max={10000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="训练轮数 (Epochs)"
          name="nEpochs"
          rules={[{ required: true, message: '请输入训练轮数' }]}
        >
          <InputNumber min={1} max={1000} style={{ width: '100%' }} />
        </Form.Item>

        <Divider orientation="left">额外参数</Divider>

        <Form.List name="additionalParams">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'key']}
                    rules={[{ required: true, message: '请输入参数名' }]}
                  >
                    <Input placeholder="参数名 (如 beta)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    rules={[{ required: true, message: '请输入参数值' }]}
                  >
                    <Input placeholder="值 (如 0.5)" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加额外参数
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
          </>
        ) : (
          <>
          <Form.Item
            label="基础模型"
            name="modelName"
            rules={[{ required: true, message: '请选择基础模型' }]}
          >
            <Select placeholder="选择模型">
              {models.map(md => (
                <Option key={md.value} value={md.value}>
                  {md.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
          label="数据集"
          name="dataset"
          rules={[{ required: true, message: '请选择数据集' }]}
        >
          <Select placeholder="选择数据集">
            {datasets.map(ds => (
              <Option key={ds.value} value={ds.value}>
                {ds.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
          </>
        )}
        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              disabled={hasRunningTask}
            >
              提交训练任务
            </Button>
            {hasRunningTask && (
              <span style={{ marginLeft: 10, color: 'red' }}>
                当前有训练任务正在运行，请等待完成后重试
              </span>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TrainManagement;