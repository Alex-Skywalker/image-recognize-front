import React, { useState, useEffect } from 'react';
import { Tabs, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import ProgressVisualization from './ProgressVisualization';
import ResultsVisualization from './ResultsVisualization';

const { TabPane } = Tabs;

const Visualization = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]); // 共享任务列表

  // 模拟任务数据（可替换为 API）
  useEffect(() => {
    const mockTasks = [
      {
        id: 'task1',
        model: 'hybridmultifeature',
        dataset: 'seq-cifar100',
        status: 'running',
        progress: 75,
        startTime: '2025-04-13 10:00',
        estimatedEnd: '2025-04-13 12:00',
      },
      {
        id: 'task2',
        model: 'derpp',
        dataset: 'seq-mnist',
        status: 'completed',
        progress: 100,
        startTime: '2025-04-12 09:00',
        endTime: '2025-04-12 11:30',
      },
    ];
    setTasks(mockTasks);
    /*
    axios.get('/api/train/tasks').then(res => {
      setTasks(res.data);
    });
    */
  }, []);

  // 映射路径到 tab key
  const tabKey = location.pathname.includes('progress') ? 'progress' : 'results';

  // 处理 tab 切换
  const handleTabChange = (key) => {
    navigate(`/home/visualization/${key}`);
  };

  // 处理任务选择
  const handleSelectTask = (taskId) => {
    setSelectedTask(taskId);
    navigate('/home/visualization/results'); // 跳转到结果可视化
  };

  return (
    <Spin spinning={false}>
      <Tabs activeKey={tabKey} onChange={handleTabChange} style={{ padding: '0 24px' }}>
        <TabPane tab="进程可视化" key="progress">
          <ProgressVisualization onSelectTask={handleSelectTask} />
        </TabPane>
        <TabPane tab="结果可视化" key="results">
          <ResultsVisualization
            tasks={tasks}
            selectedTask={selectedTask}
            onTaskChange={setSelectedTask}
          />
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default Visualization;