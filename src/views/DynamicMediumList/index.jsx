import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert, Row, Col, Card, Form, Tag, message, Space } from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  BoxPlotOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, selectAllBooks,setBooks } from '../../store/booksSlice';
import * as XLSX from 'xlsx';
import styles from './index.less';

const DynamicMediumList = () => {
  const dispatch = useDispatch();
  const books = useSelector(selectAllBooks);
  const [loading, setLoading] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [totalOperations, setTotalOperations] = useState(0);
  const [lastOperationTime, setLastOperationTime] = useState(0);
  const [renderTime, setRenderTime] = useState(null);
  const [keyType, setKeyType] = useState('id');
  const [showAcademicTestList, setShowAcademicTestList] = useState(false);
  const [domTrackStats, setDomTrackStats] = useState({ created: 0, destroyed: 0, reused: 0 });
  const [academicBooks, setAcademicBooks] = useState([]);
  const nextId = useRef(1);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      dispatch(fetchBooks());
    }
  }, [dispatch]);

  const generateMockBook = () => {
    const realTitles = [
      '百年孤独', '1984', '动物农场', '小王子', '围城', '活着', '三体', '人类简史', '情商', '影响力',
      '乌合之众', '君主论', '资治通鉴', '红楼梦', '西游记', '水浒传', '三国演义', '呐喊', '朝花夕拾', '边城'
    ];
    const realAuthors = [
      '加西亚·马尔克斯', '乔治·奥威尔', '安托万·德·圣-埃克苏佩里', '钱钟书', '余华', '刘慈欣', '尤瓦尔·赫拉利', '丹尼尔·戈尔曼', '古斯塔夫·勒庞', '尼科洛·马基雅维利',
      '司马光', '曹雪芹', '吴承恩', '施耐庵', '罗贯中', '鲁迅', '沈从文'
    ];
    const realPublishers = [
      '新经典文化', '上海译文出版社', '人民文学出版社', '北京十月文艺出版社', '重庆出版社',
      '中信出版集团', '浙江人民出版社', '商务印书馆', '译林出版社', '南海出版公司'
    ];
    const descriptions = [
      '本书详细介绍了相关技术原理与实践。',
      '适合初学者和进阶开发者阅读。',
      '内容涵盖理论与实战案例。',
      '帮助读者快速掌握核心知识。'
    ];
    return {
      id: nextId.current++,
      title: realTitles[Math.floor(Math.random() * realTitles.length)],
      author: realAuthors[Math.floor(Math.random() * realAuthors.length)],
      status: '在架',
      expanded: false,
      isbn: '978' + Math.floor(1000000000 + Math.random() * 9000000000),
      publisher: realPublishers[Math.floor(Math.random() * realPublishers.length)],
      publishDate: `202${Math.floor(Math.random() * 4 + 1)}-0${Math.floor(Math.random() * 9 + 1)}-15`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      price: (Math.random() * 100 + 20).toFixed(2),
      rating: (Math.random() * 2 + 3).toFixed(1)
    };
  };

  const generateBook = () => {
    const titles = [
      '深入理解Vue.js', 'JavaScript权威指南', '算法导论', '代码整洁之道', '设计模式',
      'Python编程快速上手', 'Java核心技术', 'MySQL必知必会', 'Redis设计与实现', '计算机网络',
      '操作系统概念', '数据结构与算法分析', '编译原理', '软件工程', '人工智能基础',
      'React技术栈', 'Node.js实战', 'Docker容器化', 'Kubernetes实践', '微服务架构'
    ];
    const authors = ['张明华', '李晓东', '王建国', '赵丽娟', '陈思远', '刘志强', '杨雪梅', '郑昊然'];
    const categories = ['计算机技术', '编程语言', '算法与数据结构', '数据库', '网络技术', '人工智能', '软件工程'];
    const statuses = ['正常', '缺货', '预警', '补货中'];
    const locations = ['A-01', 'A-02', 'B-01', 'B-02', 'C-01', 'C-02', 'D-01', 'D-02'];

    const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22'];

    return {
      id: `BOOK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: titles[randomNum(0, titles.length - 1)],
      author: authors[randomNum(0, authors.length - 1)],
      category: categories[randomNum(0, categories.length - 1)],
      status: statuses[randomNum(0, statuses.length - 1)],
      stock: randomNum(0, 100),
      location: locations[randomNum(0, locations.length - 1)],
      isbn: `978${randomNum(1000000000, 9999999999)}`,
      coverColor: colors[randomNum(0, colors.length - 1)]
    };
  };

  const generateBooks = (count = 10) => {
    const startTime = performance.now();
    const newBooks = Array.from({ length: count }, () => generateBook());
    dispatch(setBooks(newBooks));
    setTotalOperations(totalOperations + 1);
    setLastOperationTime((performance.now() - startTime).toFixed(2));
  };

  const setBooks = (newBooks) => {
    // 使用函数式更新确保获取最新状态
    setBooks((prevBooks) => {
      preciseMeasure(() => newBooks);
      return newBooks;
    });
  };

  const sortBooks = () => {
    const startTime = performance.now();
    const sortedBooks = [...books].sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      if (a.author !== b.author) {
        return a.author.localeCompare(b.author);
      }
      return a.title.localeCompare(b.title);
    });
    setBooks(sortedBooks);
    setTotalOperations(totalOperations + 1);
    setLastOperationTime((performance.now() - startTime).toFixed(2));
  };

  const insertRandomBook = () => {
    const startTime = performance.now();
    const randomIndex = Math.floor(Math.random() * (books.length + 1));
    const newBook = generateBook();
    const newBooks = [...books];
    newBooks.splice(randomIndex, 0, newBook);
    setBooks(newBooks);
    setTotalOperations(totalOperations + 1);
    setLastOperationTime((performance.now() - startTime).toFixed(2));
  };

  const deleteRandomBook = () => {
    if (books.length === 0) return;
    const startTime = performance.now();
    const randomIndex = Math.floor(Math.random() * books.length);
    const newBooks = [...books];
    newBooks.splice(randomIndex, 1);
    setBooks(newBooks);
    setTotalOperations(totalOperations + 1);
    setLastOperationTime((performance.now() - startTime).toFixed(2));
  };

  const replaceAllBooks = () => {
    const startTime = performance.now();
    const newBooks = Array.from({ length: books.length }, () => generateBook());
    setBooks(newBooks);
    setTotalOperations(totalOperations + 1);
    setLastOperationTime((performance.now() - startTime).toFixed(2));
  };

  const addBook = () => {
    const newBook = generateBook();
    setBooks([newBook, ...books]);
    setTotalOperations(totalOperations + 1);
  };

  const removeBook = (bookId) => {
    const newBooks = books.filter((book) => book.id !== bookId);
    setBooks(newBooks);
    setTotalOperations(totalOperations + 1);
  };

  const increaseStock = (bookId) => {
    const newBooks = books.map((book) => {
      if (book.id === bookId) {
        const newStock = book.stock + 1;
        let newStatus = book.status;
        if (newStock > 10) {
          newStatus = '正常';
        } else if (newStock > 5) {
          newStatus = '预警';
        }
        return { ...book, stock: newStock, status: newStatus };
      }
      return book;
    });
    setBooks(newBooks);
    setTotalOperations(totalOperations + 1);
  };

  const decreaseStock = (bookId) => {
    const book = books.find((book) => book.id === bookId);
    if (book && book.stock > 0) {
      const newBooks = books.map((book) => {
        if (book.id === bookId) {
          const newStock = book.stock - 1;
          let newStatus = book.status;
          if (newStock === 0) {
            newStatus = '缺货';
          } else if (newStock <= 5) {
            newStatus = '预警';
          }
          return { ...book, stock: newStock, status: newStatus };
        }
        return book;
      });
      setBooks(newBooks);
      setTotalOperations(totalOperations + 1);
    }
  };

  const initStock = () => {
    setLoading(true);
    setTimeout(() => {
      const newBooks = Array.from({ length: 10 }).map(() => generateBook());
      setBooks(newBooks);
      setLoading(false);
    }, 500);
  };

  const clearStock = () => {
    setLoading(true);
    setTimeout(() => {
      const newBooks = books.map((book) => ({ ...book, stock: 0 }));
      setBooks(newBooks);
      setLoading(false);
    }, 500);
  };

  const getStockClass = (stock) => {
    if (stock === 0) return 'stock-empty';
    if (stock < 10) return 'stock-low';
    return 'stock-normal';
  };

  const getStatusType = (status) => {
    switch (status) {
      case '正常':
        return 'success';
      case '缺货':
        return 'error';
      case '预警':
        return 'warning';
      case '补货中':
        return 'info';
      default:
        return '';
    }
  };

  const preciseMeasure = (updateFn) => {
    performance.clearMarks();
    performance.clearMeasures();
    performance.mark('start-render');
    
    const newBooks = updateFn();
    setBooks(newBooks);
    
    requestAnimationFrame(() => {
      performance.mark('end-render');
      performance.measure('render', 'start-render', 'end-render');
      const measures = performance.getEntriesByName('render');
      if (measures.length > 0) {
        setRenderTime(measures[0].duration.toFixed(2));
      }
    });
  };

  const generateAcademicBooks = (count) => {
    nextId.current = 1;
    const newBooks = Array.from({ length: count }, () => generateMockBook());
    setAcademicBooks(newBooks);
  };

  const insertRandomAcademicBook = () => {
    const randomIndex = Math.floor(Math.random() * (academicBooks.length + 1));
    const newBook = generateMockBook();
    const newBooks = [...academicBooks];
    newBooks.splice(randomIndex, 0, newBook);
    setAcademicBooks(newBooks);
  };

  const deleteRandomAcademicBook = () => {
    if (academicBooks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * academicBooks.length);
    const newBooks = [...academicBooks];
    newBooks.splice(randomIndex, 1);
    setAcademicBooks(newBooks);
  };

  const shuffleAcademicBooks = () => {
    const newBooks = [...academicBooks];
    for (let i = newBooks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newBooks[i], newBooks[j]] = [newBooks[j], newBooks[i]];
    }
    setAcademicBooks(newBooks);
  };

  const replaceAllAcademicBooks = () => {
    const len = academicBooks.length > 0 ? academicBooks.length : 100;
    const newBooks = Array.from({ length: len }, () => generateMockBook());
    setAcademicBooks(newBooks);
  };

  const appendToEndAcademicBook = () => {
    const newBook = generateMockBook();
    setAcademicBooks([...academicBooks, newBook]);
  };

  const insertToMiddleAcademicBook = () => {
    const mid = Math.floor(academicBooks.length / 2);
    const newBook = generateMockBook();
    const newBooks = [...academicBooks];
    newBooks.splice(mid, 0, newBook);
    setAcademicBooks(newBooks);
  };

  const partialUpdateAcademicBook = () => {
    if (academicBooks.length === 0) return;
    const idx = Math.floor(Math.random() * academicBooks.length);
    const newBooks = [...academicBooks];
    newBooks[idx] = { ...newBooks[idx], title: newBooks[idx].title + '_更新' };
    setAcademicBooks(newBooks);
  };

  const measureOperation = async (operationFn) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        performance.clearMarks();
        performance.clearMeasures();
        performance.mark('op-start');

        operationFn();

        requestAnimationFrame(() => {
          performance.mark('op-end');
          performance.measure('op-duration', 'op-start', 'op-end');
          const measure = performance.getEntriesByName('op-duration')[0];
          const duration = measure ? measure.duration.toFixed(2) : '0.00';
          setRenderTime(duration);
          resolve(duration);
        });
      });
    });
  };

  const performAcademicBookOperationAndMeasure = async (keyType, operationName, operationFn) => {
    console.log(`performAcademicBookOperationAndMeasure: Starting test for KeyType: ${keyType}, Operation: ${operationName}`);

    setKeyType(keyType);
    setShowAcademicTestList(true);
    setRenderTime(null);

    setAcademicBooks([]);
    await new Promise((resolve) => setTimeout(resolve, 50));

    const totalTimeStart = performance.now();

    if (!operationName.startsWith('生成')) {
      generateAcademicBooks(500);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const renderTime = await measureOperation(operationFn);
    const totalTime = (performance.now() - totalTimeStart).toFixed(2);

    const createdCount = window.domTrackStats ? window.domTrackStats.created : 0;
    const reusedCount = window.domTrackStats ? window.domTrackStats.reused : 0;
    const destroyedCount = window.domTrackStats ? window.domTrackStats.destroyed : 0;
    const currentAcademicListLength = academicBooks.length;
    const totalOperations = createdCount + reusedCount + destroyedCount;
    const reuseRatePercentage = totalOperations > 0 ? ((reusedCount / totalOperations) * 100).toFixed(2) : '0.00';

    return {
      '测试类型': keyType,
      '操作类型': operationName,
      '渲染时间(ms)': renderTime,
      '总耗时(ms)': totalTime,
      'DOM创建数': createdCount,
      'DOM复用数': reusedCount,
      'DOM销毁数': destroyedCount,
      'DOM复用率(%)': reuseRatePercentage,
      '列表项数量': currentAcademicListLength,
      '测试时间': new Date().toLocaleString()
    };
  };

  const autoTestReuse = async () => {
    console.log('autoTestReuse: Starting test...');

    setShowAcademicTestList(true);
    setAcademicBooks([]);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newBooks = Array.from({ length: 100 }, () => generateMockBook());
    setAcademicBooks(newBooks);
    console.log(`academicBooks generated: length=${newBooks.length}, first book:`, newBooks[0]);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`autoTestReuse: Performing operation for keyType: ${keyType}...`);
    if (keyType === 'id') {
      shuffleAcademicBooks();
      console.log('Operation: shuffleAcademicBooks (for ID keys)');
    } else {
      const currentLength = academicBooks.length;
      setAcademicBooks([]);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newBooks = Array.from({ length: currentLength }, () => generateMockBook());
      setAcademicBooks(newBooks);
      console.log('Operation: replaceAllBooks (for Index/None keys)');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    setShowAcademicTestList(false);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const N = academicBooks.length;
    const reusedCalculated = N - (window.domTrackStats ? window.domTrackStats.destroyed : 0);
    const reuseRatePercentageCalculated = (reusedCalculated >= 0 && N > 0 ? (reusedCalculated / N) * 100 : 0).toFixed(2);

    const stats = {
      created: window.domTrackStats ? window.domTrackStats.created : 0,
      reused: reusedCalculated,
      destroyed: window.domTrackStats ? window.domTrackStats.destroyed : 0,
      reuseRate: reuseRatePercentageCalculated,
      totalItems: N
    };

    setDomTrackStats({
      created: stats.created,
      reused: stats.reused,
      destroyed: stats.destroyed
    });

    console.log('autoTestReuse: Test finished. Stats (for current operation):', stats);
    return stats;
  };

  const autoTestBatchAndExportExcel = async () => {
    const testCases = [
      { name: 'ID作为Key', keyType: 'id' },
      { name: 'Index作为Key', keyType: 'index' },
      { name: '无Key', keyType: 'none' }
    ];

    const results = [];
    const operations = [
      { name: '生成100本', fn: (count = 100) => generateAcademicBooks(count), isGenerate: true },
      { name: '生成1000本', fn: (count = 1000) => generateAcademicBooks(count), isGenerate: true },
      { name: '打乱顺序', fn: () => shuffleAcademicBooks(), isGenerate: false },
      { name: '插入元素', fn: () => insertRandomAcademicBook(), isGenerate: false },
      { name: '删除元素', fn: () => deleteRandomAcademicBook(), isGenerate: false },
      { name: '替换所有', fn: () => replaceAllAcademicBooks(), isGenerate: false },
      { name: '尾部追加', fn: () => appendToEndAcademicBook(), isGenerate: false },
      { name: '中间插入', fn: () => insertToMiddleAcademicBook(), isGenerate: false },
      { name: '局部更新', fn: () => partialUpdateAcademicBook(), isGenerate: false }
    ];

    for (const testCase of testCases) {
      message.info(`开始测试: ${testCase.name}`);

      for (const operation of operations) {
        const opFn = operation.isGenerate
          ? () => operation.fn(parseFloat(operation.name.replace('生成', '').replace('本', '')))
          : operation.fn;
        const data = await performAcademicBookOperationAndMeasure(testCase.keyType, operation.name, opFn);

        results.push(data);

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);

    const colWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'DOM性能测试结果');

    const fileName = `DOM性能测试结果_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success('测试完成，数据已导出到Excel文件');
  };

  const exportReuseStatsToExcel = () => {
    const stats = [
      {
        created: window.domTrackStats ? window.domTrackStats.created : 0,
        reused: window.domTrackStats ? window.domTrackStats.reused : 0,
        destroyed: window.domTrackStats ? window.domTrackStats.destroyed : 0,
        reuseRate: `${(domTrackStats.reused / (domTrackStats.reused + domTrackStats.created)) * 100 || 0}%`,
        time: new Date().toLocaleString()
      }
    ];

    const currentTotalItems = academicBooks.length;
    const currentReused = currentTotalItems - (window.domTrackStats ? window.domTrackStats.destroyed : 0);
    if (stats[0]) {
      stats[0].reused = currentReused;
    }

    const ws = XLSX.utils.json_to_sheet(stats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '复用统计');
    XLSX.writeFile(wb, `reuse-stats-${Date.now()}.xlsx`);
    message.success('统计数据已导出为Excel！');
  };

  const totalStock = books.reduce((sum, book) => sum + book.stock, 0);
  const reuseRate = () => {
    const N = academicBooks.length;
    if (N === 0) return '0.00';

    const reusedCount = N - domTrackStats.destroyed;
    return (reusedCount >= 0 && N > 0 ? (reusedCount / N) * 100 : 0).toFixed(2);
  };

  return (
    <div className={styles['dynamic-list-container']}>
      <div className={styles['dynamic-list']}>
        <div className={styles['page-header']}>
          <div className={styles['left-section']}>
            <h2>图书目录</h2>
          </div>
          <div className={styles['right-section']}>
            <Button type="success" onClick={sortBooks} className={styles['btn-sort']}>
              大论顺序
            </Button>
            <Button type="warning" onClick={insertRandomBook} className={styles['btn-insert']}>
              插入随机图书
            </Button>
            <Button type="danger" onClick={deleteRandomBook} className={styles['btn-delete']}>
              删除随机图书
            </Button>
            <Button type="info" onClick={replaceAllBooks} className={styles['btn-replace']}>
              替换所有图书
            </Button>
          </div>
        </div>
      </div>

      <div className={styles['description']}>
        <Alert
          message="模块说明"
          type="info"
          description="库存管理系统用于实时跟踪图书馆图书的库存变化。支持入库、出库、调拨等操作，采用Vue.js Key绑定策略优化动态数据更新的性能表现。"
          closable={false}
          showIcon
        />
      </div>

      <div className={styles['status-summary']}>
        <Row gutter={20}>
          <Col span={6}>
            <Card className={styles['status-card']}>
              <div className={styles['status-icon']} style={{ backgroundColor: '#3498db' }}>
                <ClockCircleOutlined />
              </div>
              <div className={styles['status-info']}>
                <h3>{books.length}</h3>
                <p>总图书数</p>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles['status-card']}>
              <div className={styles['status-icon']} style={{ backgroundColor: '#f1c40f' }}>
                <ClockCircleOutlined />
              </div>
              <div className={styles['status-info']}>
                <h3>{totalOperations}</h3>
                <p>操作次数</p>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles['status-card']}>
              <div className={styles['status-icon']} style={{ backgroundColor: '#e74c3c' }}>
                <BoxPlotOutlined />
              </div>
              <div className={styles['status-info']}>
                <h3>{totalStock}</h3>
                <p>总库存</p>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles['status-card']}>
              <div className={styles['status-icon']} style={{ backgroundColor: '#2ecc71' }}>
                <ClockCircleOutlined />
              </div>
              <div className={styles['status-info']}>
                <h3>{lastOperationTime}ms</h3>
                <p>最后操作耗时</p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <div className={styles['control-panel']}>
        <Form inline className={styles['control-form']}>
          <Form.Item label="快速操作" className={styles['form-item-quick']}>
            <Space>
              <Button
                type="success"
                size="small"
                onClick={addBook}
                loading={loading}
                className={styles['btn-add']}
              >
                <PlusOutlined /> 入库图书
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={initStock}
                loading={loading}
                className={styles['btn-init']}
              >
                <ClockCircleOutlined /> 初始化库存
              </Button>
              <Button
                type="warning"
                size="small"
                onClick={clearStock}
                loading={loading}
                className={styles['btn-clear']}
              >
                <DeleteOutlined /> 清空库存
              </Button>
            </Space>
          </Form.Item>

          <Form.Item label="性能测试操作" className={styles['form-item-test']}>
            <Space wrap>
              <Button type="primary" size="small" onClick={() => setKeyType('id')} className={styles['btn-key-id']}>
                ID作为Key
              </Button>
              <Button type="info" size="small" onClick={() => setKeyType('index')} className={styles['btn-key-index']}>
                Index作为Key
              </Button>
              <Button type="warning" size="small" onClick={() => setKeyType('none')} className={styles['btn-key-none']}>
                无Key
              </Button>
              <Button type="danger" size="small" onClick={() => generateAcademicBooks(1000)} className={styles['btn-generate']}>
                生成1000项
              </Button>
              <Button type="success" size="small" onClick={insertRandomAcademicBook} className={styles['btn-insert-academic']}>
                插入元素
              </Button>
              <Button type="danger" size="small" onClick={deleteRandomAcademicBook} className={styles['btn-delete-academic']}>
                删除元素
              </Button>
              <Button type="primary" size="small" onClick={shuffleAcademicBooks} className={styles['btn-shuffle']}>
                打乱顺序
              </Button>
              <Button type="info" size="small" onClick={replaceAllAcademicBooks} className={styles['btn-replace-all']}>
                替换所有
              </Button>
              <Button type="primary" size="small" onClick={appendToEndAcademicBook} className={styles['btn-append']}>
                尾部追加
              </Button>
              <Button type="success" size="small" onClick={insertToMiddleAcademicBook} className={styles['btn-insert-middle']}>
                中间插入
              </Button>
              <Button type="warning" size="small" onClick={partialUpdateAcademicBook} className={styles['btn-update']}>
                局部更新
              </Button>
              <Button type="info" size="small" onClick={autoTestReuse} className={styles['btn-auto-test']}>
                自动测试复用（单次）
              </Button>
              <Button type="warning" size="small" onClick={autoTestBatchAndExportExcel} className={styles['btn-batch-test']}>
                批量测试并导出Excel
              </Button>
              <Button type="info" size="small" onClick={exportReuseStatsToExcel} className={styles['btn-export']}>
                导出Excel（当前）
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div className={styles['performance-metrics']}>
        <h3 className={styles['metrics-title']}>性能指标</h3>
        <div className={styles['metrics-grid']}>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>渲染时间：</span>
            <span className={`${styles['metric-value']} ${styles['metric-render-time']}`}>
              {renderTime || '0'} ms
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM创建数：</span>
            <span className={`${styles['metric-value']} ${styles['metric-dom-created']}`}>
              {domTrackStats.created || 0}
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM复用数：</span>
            <span className={`${styles['metric-value']} ${styles['metric-dom-reused']}`}>
              {domTrackStats.reused || 0}
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM销毁数：</span>
            <span className={`${styles['metric-value']} ${styles['metric-dom-destroyed']}`}>
              {domTrackStats.destroyed || 0}
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM复用率：</span>
            <span className={`${styles['metric-value']} ${styles['metric-dom-reuse-rate']}`}>
              {reuseRate()}%
            </span>
          </div>
        </div>
      </div>

      <div className={styles['render-details']} style={{ display: renderTime ? 'block' : 'none' }}>
        本次渲染耗时：{renderTime} ms<br />
        节点创建：{domTrackStats.created}，复用：{domTrackStats.reused}，销毁：{domTrackStats.destroyed}，复用率：{reuseRate()}%
      </div>

      <div className={styles['academic-test-list']}>
        {showAcademicTestList && academicBooks.map((book, index) => (
          <span
            key={keyType === 'id' ? book.id : index}
            data-id={book.id}
            className={styles['academic-item']}
          >
            {book.title}
          </span>
        ))}
      </div>

      <div className={styles['book-list']}>
        {books.length > 0 ? (
          <div className={styles['list-container']}>
            {books.map((book) => (
              <div key={book.id} className={styles['book-item']}>
                <div className={styles['book-cover']} style={{ backgroundColor: book.coverColor }}>
                  <ClockCircleOutlined />
                </div>
                <div className={styles['book-info']}>
                  <div className={styles['book-title']}>{book.title}</div>
                  <div className={styles['book-meta']}>
                    <span className={styles['book-author']}>{book.author}</span>
                    <span className={styles['book-category']}>{book.category}</span>
                  </div>
                  <div className={styles['book-details']}>
                    <span className={styles['book-isbn']}>ISBN: {book.isbn}</span>
                    <span className={styles['book-location']}>位置: {book.location}</span>
                  </div>
                </div>
                <div className={styles['stock-info']}>
                  <div className={styles['stock-count']}>
                    <span className={styles['stock-label']}>库存:</span>
                    <span className={getStockClass(book.stock)}>{book.stock}</span>
                  </div>
                  <div className={styles['stock-status']}>
                    <Tag size="mini" color={getStatusType(book.status)}>
                      {book.status}
                    </Tag>
                  </div>
                </div>
                <div className={styles['book-operations']}>
                  <Button.Group>
                    <Button size="mini" type="success" onClick={() => increaseStock(book.id)} className={styles['btn-increase']}>
                      <PlusOutlined />
                    </Button>
                    <Button size="mini" type="warning" onClick={() => decreaseStock(book.id)} disabled={book.stock <= 0} className={styles['btn-decrease']}>
                      <MinusOutlined />
                    </Button>
                    <Button size="mini" type="danger" onClick={() => removeBook(book.id)} className={styles['btn-delete-book']}>
                      <DeleteOutlined />
                    </Button>
                  </Button.Group>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles['empty-state']}>
            <div className={styles['empty-icon']}>
              <BoxPlotOutlined />
            </div>
            <h3 className={styles['empty-title']}>库存为空</h3>
            <p className={styles['empty-desc']}>当前没有图书库存记录，点击"初始化库存"开始管理</p>
            <Button type="primary" onClick={initStock} loading={loading} className={styles['btn-init-stock']}>
              初始化库存
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicMediumList;  