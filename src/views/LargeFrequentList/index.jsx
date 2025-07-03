import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Select,
  Button,
  InputNumber,
  Alert,
  Tag,
  Progress,
  message,
  Row,
  Col,
  Space,
} from 'antd';
import {
  LoadingOutlined,
  PlusOutlined,
  MinusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import styles from './index.less';

const { Option } = Select;

const OrderProcessingCenter = () => {
  const [orderStatus, setOrderStatus] = useState('');
  const [updateInterval, setUpdateInterval] = useState(1000);
  const [isUpdating, setUpdating] = useState(false);
  const [updateTimer, setUpdateTimer] = useState(null);
  const [displayData, setDisplayData] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [efficiency, setEfficiency] = useState(95);
  const [keyStrategy, setKeyStrategy] = useState('id'); // 新增key策略状态
  const nextId = useRef(1);

  useEffect(() => {
    generate1000Orders();
    return () => {
      if (updateTimer) clearInterval(updateTimer);
    };
  }, []);

  useEffect(() => {
    updateStats();
  }, [displayData]);

  const generateOrderData = () => {
    const types = ['借阅', '归还', '预约', '续借'];
    const statuses = ['待处理', '处理中', '已完成', '已取消'];
    const books = [
      'JavaScript高级程序设计',
      'Python数据分析',
      '深入理解计算机系统',
      '算法导论',
      '设计模式',
      '代码整洁之道',
      'Vue.js实战',
      'React设计模式',
    ];
    const users = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];

    const newData = Array(20)
      .fill(null)
      .map((_, index) => ({
        id: `ORD${String(index + 1).padStart(6, '0')}`,
        bookName: books[Math.floor(Math.random() * books.length)],
        userName: users[Math.floor(Math.random() * users.length)],
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        progress: Math.floor(Math.random() * 100),
        createTime: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toLocaleString(),
        updateTime: new Date().toLocaleString(),
      }));

    setDisplayData(newData);
  };

  const updateStats = () => {
    setPendingCount(displayData.filter((order) => order.status === '待处理').length);
    setProcessingCount(displayData.filter((order) => order.status === '处理中').length);
    setCompletedToday(displayData.filter((order) => order.status === '已完成').length);
    setEfficiency(Math.floor(Math.random() * 10 + 90));
  };

  const getOrderType = (type) => {
    const types = {
      借阅: 'primary',
      归还: 'success',
      预约: 'warning',
      续借: 'info',
    };
    return types[type] || 'info';
  };

  const getStatusType = (status) => {
    const types = {
      待处理: 'pending',
      处理中: 'processing',
      已完成: 'completed',
      已取消: 'cancelled',
    };
    return types[status] || 'info';
  };

  const getProgressStatus = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 80) return 'warning';
    return '';
  };

  const handleProcess = (order) => {
    message.success(`开始处理订单：${order.id}`);
  };

  const handleCancel = (order) => {
    message.confirm({
      content: '确认取消该订单吗？',
      onOk: () => {
        message.success(`已取消订单：${order.id}`);
      },
    });
  };

  const handleDetail = (order) => {
    message.info(`查看订单详情：${order.id}`);
  };

  const handleBatchProcess = () => {
    if (selectedOrders.length === 0) {
      message.warning('请先选择要处理的订单');
      return;
    }
    message.success(`批量处理 ${selectedOrders.length} 个订单`);
  };

  const handleSelectionChange = (selectedRowKeys) => {
    setSelectedOrders(selectedRowKeys);
  };

  const toggleUpdate = () => {
    if (isUpdating) {
      stopUpdate();
    } else {
      startUpdate();
    }
  };

  const startUpdate = () => {
    setUpdating(true);
    const timer = setInterval(() => {
      generateOrderData();
    }, updateInterval);
    setUpdateTimer(timer);
  };

  const stopUpdate = () => {
    setUpdating(false);
    if (updateTimer) {
      clearInterval(updateTimer);
      setUpdateTimer(null);
    }
  };

  const handleIntervalChange = (value) => {
    setUpdateInterval(value);
    if (isUpdating) {
      stopUpdate();
      startUpdate();
    }
  };

  const generateMockOrder = (idx) => {
    const types = ['借阅', '归还', '预约', '续借'];
    const statuses = ['待处理', '处理中', '已完成', '已取消'];
    const books = [
      'JavaScript高级程序设计',
      'Python数据分析',
      '深入理解计算机系统',
      '算法导论',
      '设计模式',
      '代码整洁之道',
      'Vue.js实战',
      'React设计模式',
    ];
    const users = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];

    return {
      id: `ORD${String(idx + 1).padStart(6, '0')}`,
      bookName: books[Math.floor(Math.random() * books.length)],
      userName: users[Math.floor(Math.random() * users.length)],
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      progress: Math.floor(Math.random() * 100),
      createTime: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toLocaleString(),
      updateTime: new Date().toLocaleString(),
    };
  };

  const generate2000Orders = () => {
    const start = performance.now();
    const newData = Array.from({ length: 2000 }, (_, idx) => generateMockOrder(idx));
    setDisplayData(newData);
    setTimeout(() => {
      const end = performance.now();
      message.success(`生成2000条订单耗时：${(end - start).toFixed(2)}ms`);
    }, 0);
  };

  const shuffleOrders = () => {
    const start = performance.now();
    const arr = [...displayData];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setDisplayData(arr);
    setTimeout(() => {
      const end = performance.now();
      message.success(`打乱顺序耗时：${(end - start).toFixed(2)}ms`);
    }, 0);
  };

  const insertRandomOrder = () => {
    const start = performance.now();
    const idx = Math.floor(Math.random() * (displayData.length + 1));
    const newOrder = generateMockOrder(displayData.length);
    setDisplayData([...displayData.slice(0, idx), newOrder, ...displayData.slice(idx)]);
    setTimeout(() => {
      const end = performance.now();
      message.success(`插入订单耗时：${(end - start).toFixed(2)}ms`);
    }, 0);
  };

  const deleteRandomOrder = () => {
    if (displayData.length === 0) return;
    const start = performance.now();
    const idx = Math.floor(Math.random() * displayData.length);
    setDisplayData([...displayData.slice(0, idx), ...displayData.slice(idx + 1)]);
    setTimeout(() => {
      const end = performance.now();
      message.success(`删除订单耗时：${(end - start).toFixed(2)}ms`);
    }, 0);
  };

  const replaceAllOrders = () => {
    const start = performance.now();
    const len = displayData.length;
    const newData = Array.from({ length: len }, (_, idx) => generateMockOrder(idx));
    setDisplayData(newData);
    setTimeout(() => {
      const end = performance.now();
      message.success(`替换所有订单耗时：${(end - start).toFixed(2)}ms`);
    }, 0);
  };

  const generate1000Orders = () => {
    const start = performance.now();
    const newData = Array.from({ length: 1000 }, (_, idx) => generateMockOrder(idx));
    setDisplayData(newData);
    setTimeout(() => {
      const end = performance.now();
      message.success(`生成1000条订单耗时：${(end - start).toFixed(2)}ms`);
    }, 0);
  };

  // Key策略切换功能
  const changeKeyStrategy = (strategy) => {
    setKeyStrategy(strategy);
    message.info(`已切换到${strategy === 'id' ? 'ID' : strategy === 'index' ? '索引' : '无'}作为Key`);
  };

  // 表格列定义
  const columns = [
    {
      title: '选择',
      dataIndex: 'selection',
      key: 'selection',
      width: 40,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedOrders([...selectedOrders, record.id]);
            } else {
              setSelectedOrders(selectedOrders.filter((id) => id !== record.id));
            }
          }}
        />
      ),
    },
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      align: 'center',
    },
    {
      title: '图书名称',
      dataIndex: 'bookName',
      key: 'bookName',
      width: 140,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 70,
      align: 'center',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 70,
      align: 'center',
      render: (type) => <Tag size="mini" color={getOrderType(type)}>{type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      align: 'center',
      render: (status) => (
        <span className={`${styles['order-status']} ${styles[getStatusType(status)]}`}>{status}</span>
      ),
    },
    {
      title: '处理进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 130,
      align: 'center',
      render: (progress) => <Progress percent={progress} status={getProgressStatus(progress)} strokeWidth={12} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 130,
      align: 'center',
    },
    {
      title: '操作',
      key: 'operation',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button size="mini" type="primary" onClick={() => handleProcess(record)}>
            处理
          </Button>
          <Button size="mini" type="danger" onClick={() => handleCancel(record)}>
            取消
          </Button>
          <Button size="mini" type="info" onClick={() => handleDetail(record)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 过滤数据
  const filteredData = orderStatus
    ? displayData.filter((order) => order.status === orderStatus)
    : displayData;

  return (
    <div className={styles['order-process']}>
      <div className={styles['page-header']}>
        <h2>订单处理中心</h2>
        <div className={styles['key-strategy-display']}>
          <Space>
            <Button
              size="small"
              type={keyStrategy === 'id' ? 'primary' : 'default'}
              onClick={() => changeKeyStrategy('id')}
            >
              ID作为Key
            </Button>
            <Button
              size="small"
              type={keyStrategy === 'index' ? 'primary' : 'default'}
              onClick={() => changeKeyStrategy('index')}
            >
              索引作为Key
            </Button>
            <Button
              size="small"
              type={keyStrategy === 'none' ? 'primary' : 'default'}
              onClick={() => changeKeyStrategy('none')}
            >
              无Key
            </Button>
          </Space>
        </div>
        <div className={styles['description']}>
          <Alert
            message="模块说明"
            type="info"
            description="订单处理中心用于管理和处理图书借阅、归还、预约等订单。支持实时更新和批量处理功能。"
            closable={false}
            showIcon
          />
        </div>
      </div>

      <div className={styles['control-panel']}>
        <Space wrap>
          <div className={styles['form-group']}>
            <span className={styles['label']}>订单状态:</span>
            <Select
              value={orderStatus}
              onChange={(value) => setOrderStatus(value)}
              style={{ width: 120 }}
              placeholder="选择状态"
            >
              <Option value="">全部</Option>
              <Option value="待处理">待处理</Option>
              <Option value="处理中">处理中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </div>

          <div className={styles['form-group']}>
            <span className={styles['label']}>更新频率:</span>
            <InputNumber
              value={updateInterval}
              min={100}
              max={5000}
              step={100}
              onChange={handleIntervalChange}
              style={{ width: 100 }}
            />
            <span className={styles['unit']}>ms</span>
          </div>

          <Space>
            <Button type="primary" onClick={toggleUpdate}>
              {isUpdating ? (
                <span>
                  <LoadingOutlined /> 暂停自动刷新
                </span>
              ) : (
                <span>
                  <SyncOutlined /> 开启自动刷新
                </span>
              )}
            </Button>
            <Button type="success" onClick={handleBatchProcess}>
              批量处理
            </Button>
            <Button type="primary" onClick={generate2000Orders}>
              生成2000条
            </Button>
            <Button type="success" onClick={insertRandomOrder}>
              <PlusOutlined /> 插入订单
            </Button>
            <Button type="danger" onClick={deleteRandomOrder}>
              <MinusOutlined /> 删除订单
            </Button>
            <Button type="info" onClick={replaceAllOrders}>
              替换所有
            </Button>
            <Button type="warning" onClick={shuffleOrders}>
              打乱顺序
            </Button>
          </Space>
        </Space>
      </div>

      <div className={styles['performance-stats']}>
        <Row gutter={20}>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-title']}>待处理订单</div>
              <div className={styles['stat-value']}>{pendingCount}</div>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-title']}>处理中订单</div>
              <div className={styles['stat-value']}>{processingCount}</div>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-title']}>今日完成</div>
              <div className={styles['stat-value']}>{completedToday}</div>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-title']}>处理效率</div>
              <div className={styles['stat-value']}>{efficiency}%</div>
            </div>
          </Col>
        </Row>
      </div>

      <div className={styles['table-container']}>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(record, index) => (keyStrategy === 'id' ? record.id : keyStrategy === 'index' ? index : undefined)}
          bordered
          pagination={false}
          scroll={{ y: 'calc(100vh - 380px)' }}
        />
      </div>
    </div>
  );
};

export default OrderProcessingCenter;  