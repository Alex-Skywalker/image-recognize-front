import React, { useState, useEffect } from 'react';
import { Tabs, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import TrainManagement from './TrainManagement';
import TaskManagement from './TaskManagement';

const { TabPane } = Tabs;

const Train = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRunningTask, setHasRunningTask] = useState(false);
  const [loading, setLoading] = useState(false);

  // 映射路径到 tab key
  const tabKey = location.pathname.includes('trainManagement') ? 'trainManagement' : 'taskManagement';

  // 处理 tab 切换
  const handleTabChange = (key) => {
    navigate(`/home/train/${key}`);
  };

  return (
    <Spin spinning={loading}>
      <Tabs activeKey={tabKey} onChange={handleTabChange} style={{ padding: '0 24px' }}>
        <TabPane tab="训练参数配置" key="trainManagement">
          <TrainManagement hasRunningTask={hasRunningTask} setLoading={setLoading} />
        </TabPane>
        <TabPane tab="训练进程管理" key="taskManagement">
          <TaskManagement setHasRunningTask={setHasRunningTask} setLoading={setLoading} />
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default Train;