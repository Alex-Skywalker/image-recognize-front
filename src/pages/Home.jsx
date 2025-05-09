import React from 'react';
import {
  DesktopOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  FolderOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Avatar, Breadcrumb, Dropdown, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import { AppstoreOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  // 登出函数
  const logout = () => {
    navigate('/login');
  };

  // 个人中心
  const profile = () => {
    navigate('/profile');
  };

  const items = [
    {
      key: '1',
      label: <a onClick={profile}>个人中心</a>,
    },
    {
      key: '2',
      label: <a onClick={logout}>退出登录</a>,
    },
  ];

  // 面包屑映射
  const breadcrumbMap = {
    '/home': '工作台',
    '/home/dashboard': '工作台',
    '/home/test': '图像分类',
    '/home/train': '模型训练',
    '/home/train/trainManagement':'训练参数配置',
    '/home/train/taskManagement':'训练进程管理',
    '/home/visualization': '训练结果可视化',
    '/home/modelManagement': '模型管理',
    '/home/resourceManagement': '资源管理',
  };

  // 生成面包屑项
  const breadcrumbItems = location.pathname
    .split('/')
    .filter(Boolean)
    .reduce(
      (acc, part, index, arr) => {
        const path = `/${arr.slice(0, index + 1).join('/')}`;
        if (path === '/home') {
          acc.push({
            title: '首页',
            onClick: () => navigate('/home/dashboard'),
            style: { cursor: 'pointer' },
          });
        } else if (breadcrumbMap[path]) {
          acc.push({ title: breadcrumbMap[path] });
        }
        return acc;
      },
      [],
    );

  // 动态计算 selectedKeys
  const selectedKeys = [
    {
      '/home/test': '1',
      '/home/train/trainManagement':'2-1',
      '/home/train/taskManagement':'2-2',
      '/home/visualization': '3',
      '/home/modelManagement': '4',
      '/home/resourceManagement': '5',
      '/home/dashboard': '0',
    }[location.pathname] || '0',
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header
  style={{
    background: '#1677ff',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}
>
  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ fontSize: 22, fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
      图像识别系统
    </div>
    <div style={{ fontSize: 18, fontWeight: 600, color: '#e6f7ff', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)' }}>
      ImageRecognize
    </div>
  </div>
  <Space size="large">
    <div
      onClick={() => navigate('/home/dashboard')}
      style={{
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <AppstoreOutlined style={{ fontSize: 18 }} />
      <span style={{ fontSize: 16 }}>工作台</span>
    </div>
    <BellOutlined style={{ color: '#fff', fontSize: 18 }} />
    <Dropdown menu={{ items }} placement="bottomRight">
      <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
    </Dropdown>
  </Space>
</Header>

      {/* 页面主区域 */}
      <Layout>
        {/* 侧边栏 */}
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={['2','3']} // 默认展开训练可视化
            onClick={({ key }) => {
              const pathMap = {
                '1': '/home/test',
                '2-1': '/home/train/trainManagement',
                '2-2': '/home/train/taskManagement',
                '3': '/home/visualization',
                '4': '/home/modelManagement',
                '5': '/home/resourceManagement',
              };
              navigate(pathMap[key] || '/home/dashboard');
            }}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: '1',
                icon: <DesktopOutlined />,
                label: '图像分类',
              },
              {
                key: '2',
                icon: <DatabaseOutlined />,
                label: '模型训练',
                children:[
                  {
                    key: '2-1',
                    icon: <LineChartOutlined />,
                    label: '训练参数配置',
                  },
                  {
                    key: '2-2',
                    icon: <LineChartOutlined />,
                    label: '训练进程管理',
                  },
                ]
              },
              {
                key: '3',
                icon: <BarChartOutlined />,
                label: '训练可视化',
              },
              {
                key: '4',
                icon: <SettingOutlined />,
                label: '模型管理',
              },
              {
                key: '5',
                icon: <FolderOutlined />,
                label: '资源管理',
              },
            ]}
          />
        </Sider>

        {/* 主内容区 */}
        <Layout style={{ padding: '0 24px 24px', background: '#f5f6f7' }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
          <Content
            className='content'
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;