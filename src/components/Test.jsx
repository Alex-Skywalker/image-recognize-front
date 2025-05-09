import React, { useState, useEffect } from 'react';
import { Upload, Button, Image, Select, Card, Row, Col, Spin, message, Statistic, Modal, List, Space, Pagination } from 'antd';
import { UploadOutlined, SearchOutlined, PictureOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Test.css';

const { Option } = Select;

const Test = () => {
  const [imageFile, setImageFile] = useState(null); // 存储上传的图片文件
  const [imageUrl, setImageUrl] = useState(null); // 图片预览 URL
  const [models, setModels] = useState([]); // 模型列表
  const [selectedModelId, setSelectedModelId] = useState(null); // 选择的模型 ID
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]); // 所有图片的基本信息
  const [currentImagesWithPreview, setCurrentImagesWithPreview] = useState([]); // 当前页图片（包含 previewUrl）
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [pageSize, setPageSize] = useState(5); // 每页数量
  const [imagesLoading, setImagesLoading] = useState(false); // 当前页图片加载状态

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/model/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModels(response.data.models);
      } catch (error) {
        message.error(error.response?.data?.message || '获取模型列表失败');
      }
    };

    // 获取已上传的图片列表（仅基本信息）
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/resource/list/image', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resources = response.data.resources.map(item => ({
          ...item,
          upload_time: item.created_at || new Date().toISOString(),
        }));
        setUploadedImages(resources);
      } catch (error) {
        message.error(error.response?.data?.message || '获取图片列表失败');
      }
    };

    if (token) {
      fetchModels();
      fetchImages();
    }
  }, [token]);

  // 获取图片 URL
  const getImageUrl = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/resource/image/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      message.error(`加载图片 ${id} 失败`);
      return null;
    }
  };

  // 切换页码时加载当前页图片的 previewUrl
  const fetchImagesForCurrentPage = async (page, size) => {
    setImagesLoading(true);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const currentImages = uploadedImages.slice(startIndex, endIndex);

    // 为当前页的图片加载 previewUrl
    const imagesWithPreview = await Promise.all(
      currentImages.map(async (item) => {
        const previewUrl = await getImageUrl(item.id);
        return { ...item, previewUrl };
      })
    );

    setCurrentImagesWithPreview(imagesWithPreview);
    setImagesLoading(false);
  };

  // 监听页码和每页数量变化
  useEffect(() => {
    if (isModalVisible && uploadedImages.length > 0) {
      fetchImagesForCurrentPage(currentPage, pageSize);
    }
  }, [currentPage, pageSize, isModalVisible, uploadedImages]);

  // 处理图片上传
  const handleUpload = (file) => {
    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(previewUrl);
    setResult(null);
    message.success('图片已选择');
  };

  // 显示已上传图片模态框
  const showImageModal = () => {
    setIsModalVisible(true);
    setCurrentPage(1); // 打开模态框时重置到第一页
  };

  // 关闭模态框
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
    setCurrentImagesWithPreview([]); // 清空当前页图片数据
  };

  // 确认选择已上传图片
  const handleModalOk = async () => {
    if (selectedImage) {
      setImageFile(null); // 清空本地上传的文件
      setImageUrl(selectedImage.previewUrl);
      try {
        const response = await axios.get(`http://localhost:5000/api/resource/image/${selectedImage.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        });
        const blob = response.data;
        const file = new File([blob], selectedImage.name, { type: blob.type });
        setImageFile(file);
      } catch (error) {
        message.error('加载已上传图片失败');
        return;
      }
      setResult(null);
    }
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  // 图片识别
  const handleRecognize = async () => {
    if (!imageFile || !selectedModelId) {
      message.warning('请先选择图片并选择模型！');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('model_id', selectedModelId);

      const predictResponse = await axios.post(
        'http://localhost:5000/api/model/predict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const className = predictResponse.data.result;
      setResult({
        label: className,
        time: `${predictResponse.data.time_taken} 秒`,
      });

    } catch (error) {
      message.error(error.response?.data?.message || '识别失败');
    } finally {
      setLoading(false);
    }
  };

  // 分页逻辑
  const totalImages = uploadedImages.length;

  // 分页变化
  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <Card title="图像分类" className="test-card">
      <Row gutter={[24, 24]} justify="space-between" align="middle">
        <Col span={24}>
          <Space size={16} wrap className="action-bar">
            <span>选择模型：</span>
            <Select
              style={{ width: 200 }}
              placeholder="请选择模型"
              onChange={(value) => setSelectedModelId(value)}
              value={selectedModelId}
              className="model-select"
            >
              {models.map((model) => (
                <Option key={model.id} value={model.id}>
                  {model.model_name}
                </Option>
              ))}
            </Select>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                handleUpload(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />} className="upload-btn">
                上传图片
              </Button>
            </Upload>
            <Button icon={<PictureOutlined />} onClick={showImageModal} className="select-btn">
              从已上传图片选择
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleRecognize}
              disabled={!imageFile || !selectedModelId || loading}
              className="recognize-btn"
            >
              开始识别
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]} justify="space-between" align="middle">
        <Col span={10}>
          <div className="preview-container">
            {imageUrl ? (
              <Image
                width={500}
                src={imageUrl}
                alt="预览"
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                图片预览区域
              </div>
            )}
          </div>
        </Col>

        <Col span={14}>
          {loading && <Spin tip="识别中..." className="loading-spinner" />}

          {result && (
            <div className="result-section">
              <Card className="result-card">
                <Statistic title="识别结果" value={result.label} />
                <Statistic title="用时" value={result.time} />
              </Card>
            </div>
          )}
        </Col>
      </Row>

      <Modal
        title="选择已上传的图片"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
        width={600}
        className="image-modal"
      >
        {imagesLoading ? (
          <div className="loading-container">
            <Spin tip="加载图片中..." />
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={currentImagesWithPreview}
            locale={{ emptyText: '暂无已上传图片' }}
            className="image-list"
            renderItem={(item) => (
              <List.Item
                onClick={() => setSelectedImage(item)}
                className={`image-item ${selectedImage?.id === item.id ? 'selected' : ''}`}
              >
                <Space>
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-fallback">加载失败</div>
                  )}
                  <div>
                    <div>{item.name}</div>
                    <div className="image-time">
                      上传时间: {new Date(item.upload_time).toLocaleString()}
                    </div>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        )}
        <div className="pagination-container">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalImages}
            onChange={handlePaginationChange}
            showSizeChanger
            pageSizeOptions={['5', '10', '20']}
            showTotal={(total) => `共 ${total} 条`}
            disabled={imagesLoading}
            className="pagination"
          />
        </div>
      </Modal>
    </Card>
  );
};

export default Test;