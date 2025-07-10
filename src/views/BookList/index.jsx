import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QuestionCircleFilled,RightOutlined,DownOutlined } from '@ant-design/icons'
import { fetchBooks, selectAllBooks, selectBooksLoading, selectBooksError } from '../../store/booksSlice';
import * as XLSX from 'xlsx';
import styles from './index.less';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

// 自定义Hook：用于跟踪DOM元素的创建和销毁
const useDomTrack = () => {
  const stats = useRef({ created: 0, destroyed: 0 });
  const listeners = useRef([]);

  const reset = useCallback(() => {
    stats.current = { created: 0, destroyed: 0 };
    notifyListeners();
  }, []);

  const trackCreate = useCallback(() => {
    stats.current.created++;
    notifyListeners();
  }, []);

  const trackDestroy = useCallback(() => {
    stats.current.destroyed++;
    notifyListeners();
  }, []);

  const subscribe = useCallback((listener) => {
    listeners.current.push(listener);
    return () => {
      listeners.current = listeners.current.filter(l => l !== listener);
    };
  }, []);

  const notifyListeners = useCallback(() => {
    listeners.current.forEach(listener => listener(stats.current));
  }, []);

  return {
    stats: stats.current,
    reset,
    trackCreate,
    trackDestroy,
    subscribe
  };
};

// 生成模拟图书数据
const generateMockBook = (nextId) => {
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
    id: nextId,
    title: realTitles[Math.floor(Math.random() * realTitles.length)],
    author: realAuthors[Math.floor(Math.random() * realAuthors.length)],
    status: '在架',
    isbn: '978' + Math.floor(1000000000 + Math.random() * 9000000000),
    publisher: realPublishers[Math.floor(Math.random() * realPublishers.length)],
    publishDate: `202${Math.floor(Math.random() * 4 + 1)}-0${Math.floor(Math.random() * 9 + 1)}-15`,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    price: (Math.random() * 100 + 20).toFixed(2),
    rating: (Math.random() * 2 + 3).toFixed(1)
  };
};

// DOM跟踪组件
const DomTrack = ({ keyValue, children }) => {
  const { trackCreate, trackDestroy } = useDomTrack();

  useEffect(() => {
    trackCreate();
    return () => {
      trackDestroy();
    };
  }, [keyValue, trackCreate, trackDestroy]);

  return children;
};

// 主组件
const BookList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxBooks = useSelector(selectAllBooks);
  const loading = useSelector(selectBooksLoading);
  const error = useSelector(selectBooksError);

  // 状态管理
  const [books, setLocalBooks] = useState([]);
  const [academicBooks, setAcademicBooks] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [renderTime, setRenderTime] = useState(null);
  const [keyType, setKeyType] = useState('id');
  const [showAcademicTestList, setShowAcademicTestList] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState({});
  
  // 新增：DOM统计状态
  const [domStats, setDomStats] = useState({ created: 0, destroyed: 0 });

  // DOM跟踪统计
  const { stats: domTrackStats, reset: resetDomStats, subscribe } = useDomTrack();

  // 初始化
  useEffect(() => {
    dispatch(fetchBooks());
    generateBooks(10);
    
    // 订阅DOM统计变化
    const unsubscribe = subscribe(newStats => {
      setDomStats(newStats);
    });
    
    return () => {
      unsubscribe();
    };
  }, [dispatch, subscribe]);

  // 从Redux同步数据
  useEffect(() => {
    if (reduxBooks.length > 0 && books.length === 0) {
      setLocalBooks(reduxBooks);
      setNextId(reduxBooks.length + 1);
    }
  }, [reduxBooks]);

  // 计算复用率
  const reuseRate = () => {
    const N = books.length;
    if (N === 0) return '0.00';

    const reusedCount = N - domStats.destroyed;
    return ((reusedCount / N) * 100).toFixed(2);
  };

  // 获取Key
  const getKey = (item, index) => {
    if (keyType === 'id') return item.id;
    if (keyType === 'index') return index;
    return null;
  };

  // 生成图书
  const generateBooks = (count = 10) => {
    setNextId(1);
    const newBooks = Array.from({ length: count }, (_, i) =>
      generateMockBook(i + 1)
    );
    setLocalBooks(newBooks);
  };

  // 生成学术测试图书
  const generateAcademicBooks = (count) => {
    const newBooks = Array.from({ length: count }, () => {
      const book = generateMockBook(nextId);
      setNextId(prev => prev + 1);
      return book;
    });
    setAcademicBooks(newBooks);
  };

  // 切换展开状态
  const toggleExpand = (bookId) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  // 精确测量渲染时间
  const preciseMeasure = (desc = '渲染完成') => {
    performance.clearMarks();
    performance.clearMeasures();
    performance.mark('start-render');

    setTimeout(() => {
      performance.mark('end-render');
      performance.measure('render', 'start-render', 'end-render');
      const measures = performance.getEntriesByName('render');
      if (measures.length > 0) {
        setRenderTime(measures[0].duration.toFixed(2));
      }
    }, 0);
  };

  // 批量生成
  const bulkGenerate = () => {
    const newBooks = Array.from({ length: 100 }, (_, i) =>
      generateMockBook(i + 1)
    );
    setLocalBooks(newBooks);
    setNextId(101);
    preciseMeasure('批量生成100项');
  };

  // 添加项
  const addItem = () => {
    if (books.length >= 2000) return;
    const newBook = generateMockBook(nextId);
    setLocalBooks(prev => [...prev, newBook]);
    setNextId(prev => prev + 1);
    preciseMeasure('添加项');
  };

  // 删除项
  const removeItem = () => {
    if (books.length <= 1) return;
    const index = Math.floor(Math.random() * books.length);
    setLocalBooks(prev => prev.filter((_, i) => i !== index));
    preciseMeasure('删除项');
  };

  // 打乱顺序
  const shuffleList = () => {
    const start = performance.now();
    const newBooks = [...books];
    for (let i = newBooks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newBooks[i], newBooks[j]] = [newBooks[j], newBooks[i]];
    }
    setLocalBooks(newBooks);
    setRenderTime((performance.now() - start).toFixed(2));
  };

  // 插入随机图书
  const insertRandomBook = () => {
    const idx = Math.floor(Math.random() * (books.length + 1));
    const newBook = generateMockBook(nextId);
    setLocalBooks(prev => [
      ...prev.slice(0, idx),
      newBook,
      ...prev.slice(idx)
    ]);
    setNextId(prev => prev + 1);
    preciseMeasure('插入元素');
  };

  // 删除随机图书
  const deleteRandomBook = () => {
    if (books.length === 0) return;
    const idx = Math.floor(Math.random() * books.length);
    setLocalBooks(prev => prev.filter((_, i) => i !== idx));
    preciseMeasure('删除元素');
  };

  // 替换所有图书
  const replaceAllBooks = () => {
    const newBooks = books.map(() => {
      const book = generateMockBook(nextId);
      setNextId(prev => prev + 1);
      return book;
    });
    setLocalBooks(newBooks);
    preciseMeasure('替换所有');
  };

  // 尾部追加
  const appendToEnd = () => {
    const newBook = generateMockBook(nextId);
    setLocalBooks(prev => [...prev, newBook]);
    setNextId(prev => prev + 1);
    preciseMeasure('尾部追加');
  };

  // 步步插入
  const stepInsert = () => {
    let newBooks = [...books];
    for (let i = 0; i < 10; i++) {
      const newBook = generateMockBook(nextId + i);
      newBooks.splice(i * 2, 0, newBook);
    }
    setLocalBooks(newBooks);
    setNextId(prev => prev + 10);
    preciseMeasure('步步插入');
  };

  // 中间插入
  const insertToMiddle = () => {
    const mid = Math.floor(books.length / 2);
    const newBook = generateMockBook(nextId);
    setLocalBooks(prev => [
      ...prev.slice(0, mid),
      newBook,
      ...prev.slice(mid)
    ]);
    setNextId(prev => prev + 1);
    preciseMeasure('中间插入');
  };

  // 局部更新
  const partialUpdate = () => {
    const newBooks = [...books];
    for (let i = 0; i < 10 && newBooks.length > 0; i++) {
      const idx = Math.floor(Math.random() * newBooks.length);
      newBooks[idx] = {
        ...newBooks[idx],
        title: newBooks[idx].title + '_更新'
      };
    }
    setLocalBooks(newBooks);
    preciseMeasure('局部更新');
  };

  // 自动测试复用
  const autoTestReuse = async () => {
    resetDomStats();
    setShowAcademicTestList(true);

    // 清空并等待
    setAcademicBooks([]);
    await new Promise(resolve => setTimeout(resolve, 100));

    // 生成初始列表
    const initialBooks = Array.from({ length: 100 }, (_, i) => generateMockBook(i + 1));
    setAcademicBooks(initialBooks);
    setNextId(101);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 执行操作
    if (keyType === 'id') {
      // 打乱顺序
      const shuffled = [...academicBooks];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setAcademicBooks(shuffled);
    } else {
      // 替换所有
      const newBooks = Array.from({ length: 100 }, () => {
        const book = generateMockBook(nextId);
        setNextId(prev => prev + 1);
        return book;
      });
      setAcademicBooks(newBooks);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
    setShowAcademicTestList(false);
  };

  // 导出Excel
  const exportReuseStatsToExcel = () => {
    const currentTotalItems = books.length;
    const currentReused = currentTotalItems - domStats.destroyed;

    const stats = [{
      created: domStats.created,
      reused: currentReused,
      destroyed: domStats.destroyed,
      reuseRate: `${reuseRate()}%`,
      time: new Date().toLocaleString()
    }];

    const ws = XLSX.utils.json_to_sheet(stats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '复用统计');
    XLSX.writeFile(wb, `reuse-stats-${Date.now()}.xlsx`);
    message.success('复用统计数据已导出为Excel文件！');
  };

  // 批量测试并导出Excel
  const autoTestBatchAndExportExcel = async () => {
    const testCases = [
      { name: 'ID作为Key', keyType: 'id' },
      { name: 'Index作为Key', keyType: 'index' },
      { name: '无Key', keyType: 'none' }
    ];

    const results = [];
    const operations = [
      { name: '生成100本', fn: () => generateBooks(100) },
      { name: '生成1000本', fn: () => generateBooks(1000) },
      { name: '打乱顺序', fn: shuffleList },
      { name: '插入元素', fn: insertRandomBook },
      { name: '删除元素', fn: deleteRandomBook },
      { name: '替换所有', fn: replaceAllBooks },
      { name: '尾部追加', fn: appendToEnd },
      { name: '中间插入', fn: insertToMiddle },
      { name: '局部更新', fn: partialUpdate }
    ];

    for (const testCase of testCases) {
      setKeyType(testCase.keyType);
      await new Promise(resolve => setTimeout(resolve, 100));

      for (const operation of operations) {
        setLocalBooks([]);
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!operation.name.startsWith('生成')) {
          generateBooks(500);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        const start = performance.now();
        operation.fn();
        await new Promise(resolve => setTimeout(resolve, 200));
        const duration = (performance.now() - start).toFixed(2);

        results.push({
          '测试类型': testCase.keyType,
          '操作类型': operation.name,
          '渲染时间(ms)': duration,
          '列表项数量': books.length,
          '测试时间': new Date().toLocaleString()
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '性能测试结果');
    XLSX.writeFile(wb, `performance_test_${Date.now()}.xlsx`);
    message.success('批量测试完成，数据已导出！');
  };

  // 获取状态样式
  const getStatusType = (status) => {
    switch (status) {
      case '在架': return 'success';
      case '借出': return 'warning';
      case '维护': return 'info';
      default: return '';
    }
  };

  // 渲染状态标签
  const renderStatusTag = (status) => {
    const type = getStatusType(status);
    const classNames = `${styles.statusTag} ${styles[`statusTag${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
    return <span className={classNames}>{status}</span>;
  };

  // 计算DOM复用数
  const reusedCount = books.length - domStats.destroyed;

  if (loading) return <div className={styles.loading}>加载中...</div>;
  if (error) return <div className={styles.error}>错误: {error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>图书目录管理系统</h2>
      {/* 控制面板 */}
      <div className={styles.controlPanel}>
        <div className={styles.renderTimeContainer}>
          <div className={styles.renderTimeBox}>
            <h2>性能指标</h2>
            <div>
              <span>渲染时间：</span>
              <span style={{ color: 'rgb(230, 126, 34)' }}>{renderTime ? `${renderTime}ms` : '0ms'}</span>
            </div>
            <div>
              <span>DOM创建数：</span>
              <span style={{ color: "rgb(64, 158, 255)" }}>{domStats.created}</span>
            </div>
            <div>
              <span>DOM复用数：</span>
              <span style={{ color: 'rgb(103, 194, 58)' }}>{reusedCount}</span>
            </div>
            <div>
              <span>DOM销毁数：</span>
              <span style={{ color: 'rgb(245, 108, 108)' }}>{domStats.destroyed}</span>
            </div>
            <div>
              <span>DOM复用率：</span>
              <span>{reuseRate()}%</span>
            </div>
          </div>
        </div>
        <div className={styles.controlPanelOptions}>
          <div className={`${styles.controlOptions} ${styles.flexItems}`}>
            <span className={styles.optionLabel}>Key类型：</span>
            <label className={styles.radioLabel}>
              <input type="radio" name="keyType" value="id" checked={keyType === 'id'} onChange={() => setKeyType('id')} className={styles.radioInput} />
              <span className={styles.radioText}>ID作为Key</span>
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="keyType" value="index" checked={keyType === 'index'} onChange={() => setKeyType('index')} className={styles.radioInput} />
              <span className={styles.radioText}>Index作为Key</span>
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="keyType" value="none" checked={keyType === 'none'} onChange={() => setKeyType('none')} className={styles.radioInput} />
              <span className={styles.radioText}>无Key</span>
            </label>
            <button className={`${styles.btn} ${styles.btnGreen}`} onClick={bulkGenerate}>
              批量生成100本
            </button>
            <button className={`${styles.btn} ${styles.btnPurple}`} onClick={addItem}>
              添加项
            </button>
            <button className={`${styles.btn} ${styles.btnRed}`} onClick={removeItem}>
              删除项
            </button>
            <button className={`${styles.btn} ${styles.btnYellow}`} onClick={shuffleList}>
              打乱顺序
            </button>
            <button className={`${styles.btn} ${styles.btnIndigo}`} onClick={insertRandomBook}>
              插入元素
            </button>
            <button className={`${styles.btn} ${styles.btnTeal}`} onClick={deleteRandomBook}>
              删除元素
            </button>
            <button className={`${styles.btn} ${styles.btnPink}`} onClick={replaceAllBooks}>
              替换所有
            </button>
          </div>
          <div className={`${styles.controlOptions}`}>
            <button className={`${styles.btn} ${styles.btnOrange}`} onClick={appendToEnd}>
              尾部追加
            </button>
            <button className={`${styles.btn} ${styles.btnEmerald}`} onClick={stepInsert}>
              步步插入
            </button>
            <button className={`${styles.btn} ${styles.btnCyan}`} onClick={insertToMiddle}>
              中间插入
            </button>
            <button className={`${styles.btn} ${styles.btnAmber}`} onClick={partialUpdate}>
              局部更新
            </button>
            <button className={`${styles.btn} ${styles.btnBlueDark}`} onClick={autoTestReuse}>
              自动测试复用 (单次)
            </button>
            <button className={`${styles.btn} ${styles.btnRedDark}`} onClick={autoTestBatchAndExportExcel}>
              批量测试并导出Excel
            </button>
            <button className={`${styles.btn} ${styles.btnGreenDark}`} onClick={exportReuseStatsToExcel}>
              导出Excel（当前）
            </button>
          </div>
        </div>
      </div>
      {/* 复用统计信息 */}
      {
        (renderTime && renderTime !== 0) && <div className={styles.reuseStats}>
          <div>本次渲染耗时：{`${renderTime ?? 0}ms`}</div>
          <div>
            节点创建：{domStats.created ?? 0}，销毁元素数：{domStats.destroyed ?? 0}，当前列表项数：{books.length ?? 0}，复用率：{reuseRate()}%
          </div>
        </div>
      }
      {/* 提示 */}
      <div className={styles.tipBox}>
        <div style={{ fontSize: 16 }}><QuestionCircleFilled style={{ paddingRight: 10 }} />模块说明</div>
        <div>图书目录管理模块用于管理图书馆的所有图书信息，包括基本信息、库存状态等。支持展开查看详细信息，方便管理员快速了解图书详情。</div>
      </div>
      {/* 学术测试列表 */}
      {showAcademicTestList && (
        <div className={styles.academicTestList}>
          <div className={styles.overflowContainer}>
            {academicBooks.map((book, index) => (
              <DomTrack keyValue={getKey(book, index)}>
                <div className={styles.item}>{book.title}</div>
              </DomTrack>
            ))}
          </div>
        </div>
      )}

      {/* 主图书列表 */}
      <div className={styles.bookList}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>图书列表</h2>
          <span className={styles.listCount}>共 {books.length} 本图书</span>
        </div>
        <div className={styles.overflowContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th style={{ width: 30 }}></th>
                <th className={styles.tableCell}>书名</th>
                <th className={styles.tableCell}>作者</th>
                <th className={styles.tableCell}>出版社</th>
                <th className={styles.tableCell}>出版日期</th>
                <th className={styles.tableCell}>状态</th>
                <th className={styles.tableCell}>操作</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => (
                <DomTrack keyValue={getKey(book, index)}>
                  <tr key={getKey(book, index)} className={styles.tableRow}>
                    <td className={styles.tableCell} onClick={() => toggleExpand(book.id)}>
                      {
                        !expandedBooks[book.id] ? <RightOutlined style={{fontSize:12,color:'#064DEE',cursor:'pointer'}}/> : <DownOutlined style={{fontSize:12,color:'#064DEE',cursor:'pointer'}}/>
                      }
                    </td>
                    <td className={styles.tableCell}>{book.title}</td>
                    <td className={styles.tableCell}>{book.author}</td>
                    <td className={styles.tableCell}>{book.publisher}</td>
                    <td className={styles.tableCell}>{book.publishDate}</td>
                    <td className={styles.tableCell}>{renderStatusTag(book.status)}</td>
                    <td className={styles.tableCell} style={{width:150,display:'flex',gap:15}}>
                          <Button style={{background:'#409EFF' ,color:'#fff'}} onClick={()=>{ navigate(`/book/${book.id}`);}}>查看</Button>
                          <Button style={{background:'#E6A23C' ,color:'#fff'}} onClick={()=>message.warning('此功能还未开发!')}>编辑</Button>
                    </td>
                  </tr>
                  {/* 展开的详情行 */}
                  {expandedBooks[book.id] && (
                    <tr key={`detail-${book.id}`} className={styles.detailRow}>
                      <td colSpan="7" className={styles.detailCell}>
                        <div className={styles.bookDetail}>
                          <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>ISBN:</span>
                              <span className={styles.detailValue}>{book.isbn}</span>
                            </div>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>价格:</span>
                              <span className={styles.detailValue}>{book.price}元</span>
                            </div>
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>评分:</span>
                              <span className={styles.detailValue}>{book.rating}★</span>
                            </div>
                          </div>
                          <div className={styles.detailDescription}>
                            <span className={styles.detailLabel}>描述:</span>
                            <p className={styles.detailText}>{book.description}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </DomTrack>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookList;