import React, { useState, useEffect } from 'react';
import {
  Card,
  Col,
  Row,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Progress,
  Tooltip,
  Popconfirm,
  Pagination,
  Image,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Text, Paragraph } = Typography;
const { Option } = Select;

// 定义类型映射（英文到中文）
const typeLabels = {
  'all': '全部',
  'dataset': '数据集',
  'image': '图像',
  'others': '其他',
};

const ResourceCard = ({ item, onDelete }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);

  // 加载图片（仅对 type 为 'image' 的资源）
  useEffect(() => {
    if (item.type === 'image') {
      axios.get(`http://localhost:5000/api/resource/image/${item.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      })
        .then(response => {
          const url = URL.createObjectURL(response.data);
          setImageSrc(url);
        })
        .catch(() => {
          message.error(`加载图片 ${item.name} 失败`);
        });
    }
  }, [item.id, item.type]);

  // 显示完整描述和图片的模态框
  const showDescriptionModal = () => {
    setIsDescriptionModalVisible(true);
  };

  const handleDescriptionModalCancel = () => {
    setIsDescriptionModalVisible(false);
  };

  return (
    <>
      <Card
        hoverable
        style={{ width: '100%', height: 220, marginBottom: 16 }}
        bodyStyle={{ padding: 16, height: '100%' }}
        onClick={showDescriptionModal}
      >
        <Space
          direction="vertical"
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ marginBottom: 8 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                <Space>
                  <Tooltip title="删除资源">
                    <Popconfirm
                      title="确定要删除此资源吗？"
                      onConfirm={async (e) => {
                        e.stopPropagation();
                        try {
                          await axios.delete(`http://localhost:5000/api/resource/delete/${item.id}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                          });
                          message.success('资源删除成功');
                          onDelete(item.id);
                        } catch (error) {
                          message.error(error.response?.data?.message || '资源删除失败');
                        }
                      }}
                      onCancel={(e) => e.stopPropagation()}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        danger
                      />
                    </Popconfirm>
                  </Tooltip>
                </Space>
              </Space>
            </div>
            {item.type === 'dataset' ? (
              <Paragraph
                ellipsis={{ rows: 4 }}
                style={{ marginBottom: 0, overflow: 'hidden' }}
              >
                {item.description}
              </Paragraph>
            ) : (
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 0, height: 40, overflow: 'hidden' }}
              >
                {item.description}
              </Paragraph>
            )}
          </div>
          {item.type === 'image' && imageSrc && (
            <div>
              <img
                src={imageSrc}
                alt={item.name}
                style={{ width: 100, height: 100, objectFit: 'cover' }}
                loading="lazy"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </Space>
      </Card>

      {/* 完整描述和图片模态框 */}
      <Modal
        title={item.name}
        visible={isDescriptionModalVisible}
        onCancel={handleDescriptionModalCancel}
        footer={[
          <Button key="close" onClick={handleDescriptionModalCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <Paragraph>{item.description}</Paragraph>
        {item.type === 'image' && imageSrc && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Image
              src={imageSrc}
              alt={item.name}
              style={{ maxWidth: '100%' }}
              preview
            />
          </div>
        )}
      </Modal>
    </>
  );
};

const ResourceManagement = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [filterType, setFilterType] = useState('all');
  const [resourceList, setResourceList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadAccept, setUploadAccept] = useState('.jpg,.jpeg,.png');
  const [allowedFileTypes, setAllowedFileTypes] = useState('可上传 jpg, jpeg, png');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resource/list/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResourceList(response.data.resources || []);
    } catch (error) {
      message.error(error.response?.data?.message || '获取资源列表失败');
    }
  };

  useEffect(() => {
    if (token) {
      fetchResources();
    }
  }, [token]);

  const handleTypeChange = (type) => {
    if (type === 'image') {
      setUploadAccept('.jpg,.jpeg,.png');
      setAllowedFileTypes('可上传 jpg, jpeg, png');
    } else if (type === 'dataset') {
      setUploadAccept('.zip,.rar,.gz');
      setAllowedFileTypes('可上传 zip, rar, gz');
    } else {
      setUploadAccept('');
      setAllowedFileTypes('可上传任意类型文件');
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setUploadProgress(0);
    setUploadAccept('.jpg,.jpeg,.png');
    setAllowedFileTypes('可上传 jpg, jpeg, png');
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        const file = values.file[0].originFileObj;
        const maxSize = 5 * 1024 * 1024 * 1024;
        if (file.size > maxSize) {
          message.error('文件大小超过 5GB 限制');
          return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('save_type', 'persistent');
        formData.append('type', values.type);
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('image', file);

        try {
          const response = await axios.post('http://localhost:5000/api/resource/upload', formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            },
          });

          await fetchResources();
          message.success('资源发布成功！');
          setIsModalVisible(false);
          form.resetFields();
          setUploadProgress(0);
        } catch (error) {
          message.error(error.response?.data?.message || '资源上传失败');
        } finally {
          setUploading(false);
        }
      })
      .catch(error => {
        message.error('请填写完整信息！');
      });
  };

  const uploadProps = {
    beforeUpload: () => false,
    onChange: ({ fileList }) => {
      form.setFieldsValue({ file: fileList });
    },
    maxCount: 1,
    accept: uploadAccept,
  };

  const handleFilter = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    setResourceList(resourceList.filter(item => item.id !== id));
  };

  const filteredResources = resourceList.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const totalResources = filteredResources.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentResources = filteredResources.slice(startIndex, endIndex);

  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Space>
          <Button
            type={filterType === 'all' ? 'primary' : 'default'}
            onClick={() => handleFilter('all')}
          >
            {typeLabels['all']}
          </Button>
          <Button
            type={filterType === 'dataset' ? 'primary' : 'default'}
            onClick={() => handleFilter('dataset')}
          >
            {typeLabels['dataset']}
          </Button>
          <Button
            type={filterType === 'image' ? 'primary' : 'default'}
            onClick={() => handleFilter('image')}
          >
            {typeLabels['image']}
          </Button>
          <Button
            type={filterType === 'others' ? 'primary' : 'default'}
            onClick={() => handleFilter('others')}
          >
            {typeLabels['others']}
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          上传资源
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        {currentResources.length > 0 ? (
          currentResources.map(item => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <ResourceCard item={item} onDelete={handleDelete} />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Text type="secondary">暂无符合条件的资源</Text>
          </Col>
        )}
      </Row>
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalResources}
          onChange={handlePaginationChange}
          showSizeChanger
          pageSizeOptions={['12', '24', '48']}
          showTotal={(total) => `共 ${total} 条`}
        />
      </div>

      <Modal
        title="上传资源"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="提交"
        cancelText="取消"
        width={600}
        confirmLoading={uploading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ type: 'image' }}
        >
          <Form.Item
            name="name"
            label="资源名称"
            rules={[{ required: true, message: '请输入资源标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="资源描述"
            rules={[{ required: true, message: '请输入资源描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item
            name="type"
            label="资源类型"
            rules={[{ required: true, message: '请选择资源类型' }]}
          >
            <Select placeholder="请选择类型" onChange={handleTypeChange}>
              <Option value="dataset">{typeLabels['dataset']}</Option>
              <Option value="image">{typeLabels['image']}</Option>
              <Option value="others">{typeLabels['others']}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="file"
            label="上传文件（最大 5GB）"
            rules={[{ required: true, message: '请上传文件' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              {allowedFileTypes}
            </Text>
          </Form.Item>
          {uploading && (
            <Progress percent={uploadProgress} status="active" />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceManagement;