import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Button,
  Col,
  message,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Tag,
  Modal
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  PlusOutlined,
  SnippetsOutlined
} from '@ant-design/icons';
import styles from './index.less';
import PerformancePanel from '../../components/PerformancePanel';
import * as XLSX from 'xlsx';

const { Option } = Select;

// 节点计数 - 移至顶部解决变量提升问题
const countNodes = (nodes) => {
  let count = 0;
  nodes.forEach(node => {
    count++;
    if (node.children && node.children.length > 0) {
      count += countNodes(node.children);
    }
  });
  return count;
};

const NestedList = () => {
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentCategory, setCurrentCategory] = useState({});
  const [books, setBooks] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [keyType, setKeyType] = useState('id');
  const [renderTime, setRenderTime] = useState(null);
  const [domTrackStats, setDomTrackStats] = useState({ created: 0, destroyed: 0, reused: 0 });
  const [showAcademicTestList, setShowAcademicTestList] = useState(false);
  const [academicBooks, setAcademicBooks] = useState([]);


  // DOM跟踪统计
  const domTrackRef = useRef({
    created: 0,
    destroyed: 0,
    reused: 0,
    reset() {
      this.created = 0;
      this.destroyed = 0;
      this.reused = 0;
    }
  });

  // 初始化
  useEffect(() => {
    resetCategories();
    generateBooks(10);
  }, []);

  // 计算最大深度
  const getMaxDepth = (nodes, currentDepth = 1) => {
    if (!nodes || nodes.length === 0) return 0;
    let maxDepth = currentDepth;
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        const childDepth = getMaxDepth(node.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    return maxDepth;
  };

  // 计算总图书数量
  const sumBookCount = (nodes) => {
    let total = 0;
    nodes.forEach(node => {
      total += node.bookCount || 0;
      if (node.children && node.children.length > 0) {
        total += sumBookCount(node.children);
      }
    });
    return total;
  };

  // 生成分类ID
  const generateCategoryId = () => {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 创建分类
  const createCategory = (label, description = '', bookCount = 0, level = 1) => {
    return {
      id: generateCategoryId(),
      name: label,
      description: description,
      bookCount: bookCount,
      status: 'active',
      level: level,
      createTime: new Date(),
      updateTime: new Date(),
      children: []
    };
  };

  // 查找分类并操作
  const findCategoryAndOperate = (nodes, categoryId, operation) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === categoryId) {
        operation(nodes, i);
        return true;
      }
      if (nodes[i].children && nodes[i].children.length > 0) {
        if (findCategoryAndOperate(nodes[i].children, categoryId, operation)) {
          return true;
        }
      }
    }
    return false;
  };

  // 添加根分类
  const addRootCategory = () => {
    const newCategory = createCategory('新根分类', '这是一个新的根分类', 10);
    setCategoryTree([...categoryTree, newCategory]);
  };

  // 添加子分类
  const addSubCategory = (parentCategory) => {
    const newCategory = createCategory('新子分类', `这是${parentCategory.name}的子分类`, 5, parentCategory.level + 1);
    
    const newTree = [...categoryTree];
    findCategoryAndOperate(newTree, parentCategory.id, (nodes, index) => {
      if (!nodes[index].children) {
        nodes[index].children = [];
      }
      nodes[index].children.push(newCategory);
    });
    
    setCategoryTree(newTree);
    
    if (!expandedKeys.includes(parentCategory.id)) {
      setExpandedKeys([...expandedKeys, parentCategory.id]);
    }
  };

  // 编辑分类
  const editCategory = (category) => {
    setEditingCategory(category);
    setCurrentCategory({ ...category });
    setEditDialogVisible(true);
  };

  // 保存分类
  const saveCategory = () => {
    if (editingCategory) {
      const newTree = [...categoryTree];
      findCategoryAndOperate(newTree, editingCategory.id, (nodes, index) => {
        nodes[index] = {
          ...nodes[index],
          ...currentCategory,
          updateTime: new Date()
        };
      });
      setCategoryTree(newTree);
    } else {
      console.warn('Attempted to save a new category via edit dialog without proper context.');
    }
    setEditDialogVisible(false);
    setEditingCategory(null);
  };

  // 删除分类
  const deleteCategory = (categoryToDelete) => {
    message.confirm({
      title: '警告',
      content: `确定要删除分类"${categoryToDelete.name}"及其所有子分类吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        const newTree = [...categoryTree];
        findCategoryAndOperate(newTree, categoryToDelete.id, (nodes, index) => {
          nodes.splice(index, 1);
        });
        setCategoryTree(newTree);
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  };

  // 重置分类
  const resetCategories = () => {
    setCategoryTree(generateNestedCategories(7, 10, 10, 50, 50));
    setExpandedKeys(categoryTree.map(cat => cat.id));
  };

  // 生成嵌套分类
  const generateNestedCategories = (level1Count, minLevel2Children, maxLevel2Children, minLevel3Children, maxLevel3Children) => {
    const categories = [];
    const level1Names = [
      '文学艺术', '科学技术', '历史地理', '社会科学', '教育培训',
      '生活时尚', '少儿读物', '经济管理', '医学健康', '哲学宗教',
      '计算机与互联网', '法律', '军事', '体育', '旅游'
    ];
    const level2Names = [
      '小说', '诗歌', '散文', '传记', '艺术理论', '绘画', '音乐',
      '物理学', '化学', '生物学', '数学', '天文学', '地球科学',
      '中国历史', '世界历史', '地理学', '考古学',
      '政治学', '经济学', '社会学', '心理学', '管理学',
      '教育学', '职业技能', '外语学习',
      '烹饪美食', '健康养生', '时尚穿搭', '家居生活',
      '童话故事', '儿童文学', '益智游戏',
      '宏观经济', '微观经济', '金融投资', '市场营销',
      '中医', '西医', '营养学', '疾病预防',
      '哲学', '宗教学', '伦理学'
    ];
    const level3Names = [
      '现代小说', '古典文学', '外国文学', '中国文学', '科幻小说', '推理小说',
      '唐诗宋词', '现代诗',
      '中国近现代史', '世界近代史', '古代史', '当代史',
      'C++编程', 'Java开发', 'Python数据分析', 'JavaScript前端', '人工智能基础', '机器学习实践',
      '高等数学', '线性代数',
      '烹饪技巧', '烘焙入门',
      '儿童绘本', '睡前故事'
    ];

    for (let i = 0; i < level1Count; i++) {
      const level1 = {
        id: generateCategoryId(),
        name: `${level1Names[i % level1Names.length]} - ${i + 1}`,
        bookCount: Math.floor(Math.random() * 10 + 1),
        status: 'active',
        level: 1,
        createTime: new Date(),
        updateTime: new Date(),
        children: []
      };
      
      for (let j = 0; j < minLevel2Children; j++) {
        const level2 = {
          id: generateCategoryId(),
          name: `${level2Names[j % level2Names.length]} - ${i + 1}-${j + 1}`,
          bookCount: Math.floor(Math.random() * 10 + 1),
          status: 'active',
          level: 2,
          createTime: new Date(),
          updateTime: new Date(),
          children: []
        };
        
        for (let k = 0; k < minLevel3Children; k++) {
          const level3 = {
            id: generateCategoryId(),
            name: `${level3Names[k % level3Names.length]} - ${i + 1}-${j + 1}-${k + 1}`,
            bookCount: Math.floor(Math.random() * 10 + 1),
            status: 'active',
            level: 3,
            createTime: new Date(),
            updateTime: new Date(),
            children: []
          };
          level2.children.push(level3);
        }
        level1.children.push(level2);
      }
      categories.push(level1);
    }
    return categories;
  };

  // 切换展开/折叠
  const toggleExpand = (category) => {
    if (expandedKeys.includes(category.id)) {
      setExpandedKeys(expandedKeys.filter(key => key !== category.id));
      collapseChildren(category);
    } else {
      setExpandedKeys([...expandedKeys, category.id]);
    }
  };

  // 折叠所有子节点
  const collapseChildren = (category) => {
    if (category.children) {
      const newExpandedKeys = expandedKeys.filter(key => {
        if (key === category.id) return false;
        return !isDescendant(key, category);
      });
      setExpandedKeys(newExpandedKeys);
    }
  };

  // 判断是否为子节点
  const isDescendant = (key, parentCategory) => {
    if (!parentCategory.children) return false;
    for (const child of parentCategory.children) {
      if (child.id === key) return true;
      if (isDescendant(key, child)) return true;
    }
    return false;
  };

  // 判断是否展开
  const isExpanded = (categoryId) => {
    return expandedKeys.includes(categoryId);
  };

  // 展开所有
  const expandAll = () => {
    const newExpandedKeys = [];
    const expandNode = (node) => {
      newExpandedKeys.push(node.id);
      if (node.children) {
        node.children.forEach(expandNode);
      }
    };
    categoryTree.forEach(expandNode);
    setExpandedKeys(newExpandedKeys);
  };

  // 折叠所有
  const collapseAll = () => {
    setExpandedKeys([]);
  };

  // 快速演示
  const quickDemo = () => {
    resetCategories();
    setTimeout(() => {
      addRootCategory();
    }, 500);
  };

  // 获取状态类型
  const getStatusType = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'disabled': return 'error';
      default: return '';
    }
  };

  // 查看分类图书
  const viewCategoryBooks = (category) => {
    console.log(`查看分类 "${category.name}" 下的图书`);
  };
// 生成模拟图书
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
  
  // 使用函数式更新获取最新的nextId
  setNextId(prevId => prevId + 1);
  
  return {
    id: nextId, // 直接使用当前nextId值
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

// 生成图书
const generateBooks = (count = 10) => {
  setNextId(1);
  const newBooks = [];
  for (let i = 0; i < count; i++) {
    newBooks.push(generateMockBook());
    // 手动递增nextId
    setNextId(prevId => prevId + 1);
  }
  setBooks(newBooks);
};  
  // 添加项
  const addItem = () => {
    const newItem = generateMockBook();
    const midIndex = Math.floor(books.length / 2);
    setBooks([...books.slice(0, midIndex), newItem, ...books.slice(midIndex)]);
  };

  // 移除项
  const removeItem = () => {
    if (books.length > 0) {
      const randomIndex = Math.floor(Math.random() * books.length);
      setBooks(books.filter((_, index) => index !== randomIndex));
    }
  };

  // 打乱列表
  const shuffleList = () => {
    const newBooks = [...books];
    for (let i = newBooks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newBooks[i], newBooks[j]] = [newBooks[j], newBooks[i]];
    }
    setBooks(newBooks);
  };

  // 插入随机图书
  const insertRandomBook = () => {
    const idx = Math.floor(Math.random() * (books.length + 1));
    setBooks([...books.slice(0, idx), generateMockBook(), ...books.slice(idx)]);
  };

  // 删除随机图书
  const deleteRandomBook = () => {
    if (books.length === 0) return;
    const idx = Math.floor(Math.random() * books.length);
    setBooks(books.filter((_, index) => index !== idx));
  };

  // 替换所有图书
  const replaceAllBooks = () => {
    const len = books.length;
    setBooks(Array.from({ length: len }, () => generateMockBook()));
  };

  // 尾部追加
  const appendToEnd = () => {
    setBooks([...books, generateMockBook()]);
  };

  // 逐步插入
  const stepInsert = () => {
    const newBooks = [...books];
    for (let i = 0; i < 10; i++) {
      newBooks.splice(i * 2, 0, generateMockBook());
    }
    setBooks(newBooks);
  };

  // 中间插入
  const insertToMiddle = () => {
    const mid = Math.floor(books.length / 2);
    setBooks([...books.slice(0, mid), generateMockBook(), ...books.slice(mid)]);
  };

  // 局部更新
  const partialUpdate = () => {
    if (books.length === 0) return;
    const newBooks = [...books];
    for (let i = 0; i < 10 && newBooks.length > 0; i++) {
      const idx = Math.floor(Math.random() * newBooks.length);
      newBooks[idx] = { ...newBooks[idx], title: newBooks[idx].title + '_更新' };
    }
    setBooks(newBooks);
  };

  // 精确测量渲染时间
  const preciseMeasure = (desc = '渲染完成') => {
    performance.clearMarks();
    performance.clearMeasures();
    performance.mark('start-render');
    requestAnimationFrame(() => {
      setRenderTime(null);
      requestAnimationFrame(() => {
        performance.mark('end-render');
        performance.measure('render', 'start-render', 'end-render');
        const measures = performance.getEntriesByName('render');
        if (measures.length > 0) {
          setRenderTime(measures[0].duration.toFixed(2));
        }
      });
    });
  };

  // 测量操作
  const measureOperation = (operationFn) => {
    return new Promise(resolve => {
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

  // 执行学术图书操作并测量
  const performAcademicBookOperationAndMeasure = async (keyType, operationName, operationFn) => {
    setKeyType(keyType);
    setShowAcademicTestList(true);
    setRenderTime(null);

    // 重置状态
    setAcademicBooks([]);
    await new Promise(resolve => setTimeout(resolve, 50));

    domTrackRef.current.reset();

    const totalTimeStart = performance.now();

    // 对于非生成操作，先生成一个基础列表
    if (!operationName.startsWith('生成')) {
      generateAcademicBooks(500);
      await new Promise(resolve => setTimeout(resolve, 50));
      domTrackRef.current.reset();
    }

    const renderTime = await measureOperation(operationFn);
    const totalTime = (performance.now() - totalTimeStart).toFixed(2);

    const createdCount = domTrackRef.current.created;
    const reusedCount = domTrackRef.current.reused;
    const destroyedCount = domTrackRef.current.destroyed;
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

  // 自动测试复用
  const autoTestReuse = async () => {
    domTrackRef.current.reset();
    setShowAcademicTestList(true);

    setAcademicBooks([]);
    await new Promise(resolve => setTimeout(resolve, 100));

    setAcademicBooks(Array.from({ length: 100 }, () => generateMockBook()));
    await new Promise(resolve => setTimeout(resolve, 1000));

    const initialRenderCreated = domTrackRef.current.created;
    const initialRenderDestroyed = domTrackRef.current.destroyed;

    domTrackRef.current.reset();

    if (keyType === 'id') {
      shuffleAcademicBooks();
    } else {
      const currentLength = academicBooks.length;
      setAcademicBooks([]);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAcademicBooks(Array.from({ length: currentLength }, () => generateMockBook()));
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    const snapshotAfterOperationCreated = domTrackRef.current.created;
    const snapshotAfterOperationDestroyed = domTrackRef.current.destroyed;

    const createdDuringOperation = snapshotAfterOperationCreated;
    const destroyedDuringOperation = snapshotAfterOperationDestroyed;

    setShowAcademicTestList(false);
    await new Promise(resolve => setTimeout(resolve, 500));

    const N = academicBooks.length;
    const reusedCalculated = N - destroyedDuringOperation;
    const reuseRatePercentageCalculated = (reusedCalculated >= 0 && N > 0 ? (reusedCalculated / N) * 100 : 0).toFixed(2);

    const stats = {
      created: createdDuringOperation,
      reused: reusedCalculated,
      destroyed: destroyedDuringOperation,
      reuseRate: reuseRatePercentageCalculated,
      totalItems: N
    };

    setDomTrackStats({
      created: stats.created,
      destroyed: stats.destroyed,
      reused: stats.reused
    });

    return stats;
  };

  // 打乱学术图书列表
  const shuffleAcademicBooks = () => {
    const newBooks = [...academicBooks];
    for (let i = newBooks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newBooks[i], newBooks[j]] = [newBooks[j], newBooks[i]];
    }
    setAcademicBooks(newBooks);
  };

  // 自动测试并导出Excel
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
      console.log(`开始测试: ${testCase.name}`);
      
      for (const operation of operations) {
        const opFn = operation.isGenerate ? () => operation.fn(parseFloat(operation.name.replace('生成', '').replace('本', ''))) : operation.fn;
        const data = await performAcademicBookOperationAndMeasure(testCase.keyType, operation.name, opFn);
        
        results.push(data);
        await new Promise(resolve => setTimeout(resolve, 500));
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

    const fileName = `DOM性能测试结果_${new Date().toISOString().slice(0,19).replace(/[:]/g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 导出复用统计到Excel
  const exportReuseStatsToExcel = () => {
    const stats = [{
      created: domTrackRef.current.created,
      reused: domTrackRef.current.reused,
      destroyed: domTrackRef.current.destroyed,
      reuseRate: calculateReuseRate() + '%',
      time: new Date().toLocaleString()
    }];

    const ws = XLSX.utils.json_to_sheet(stats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '复用统计');
    XLSX.writeFile(wb, `reuse-stats-${Date.now()}.xlsx`);
  };

  // 生成学术图书
  const generateAcademicBooks = (count) => {
    setAcademicBooks(Array.from({ length: count }, () => generateMockBook()));
  };

  // 插入随机学术图书
  const insertRandomAcademicBook = () => {
    const randomIndex = Math.floor(Math.random() * (academicBooks.length + 1));
    setAcademicBooks([...academicBooks.slice(0, randomIndex), generateMockBook(), ...academicBooks.slice(randomIndex)]);
  };

  // 删除随机学术图书
  const deleteRandomAcademicBook = () => {
    if (academicBooks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * academicBooks.length);
    setAcademicBooks(academicBooks.filter((_, index) => index !== randomIndex));
  };

  // 替换所有学术图书
  const replaceAllAcademicBooks = () => {
    const len = academicBooks.length > 0 ? academicBooks.length : 100;
    setAcademicBooks(Array.from({ length: len }, () => generateMockBook()));
  };

  // 尾部追加学术图书
  const appendToEndAcademicBook = () => {
    setAcademicBooks([...academicBooks, generateMockBook()]);
  };

  // 中间插入学术图书
  const insertToMiddleAcademicBook = () => {
    const mid = Math.floor(academicBooks.length / 2);
    setAcademicBooks([...academicBooks.slice(0, mid), generateMockBook(), ...academicBooks.slice(mid)]);
  };

  // 局部更新学术图书
  const partialUpdateAcademicBook = () => {
    if (academicBooks.length === 0) return;
    const newBooks = [...academicBooks];
    const idx = Math.floor(Math.random() * newBooks.length);
    newBooks[idx] = { ...newBooks[idx], title: newBooks[idx].title + '_更新' };
    setAcademicBooks(newBooks);
  };

  // 计算复用率
  const calculateReuseRate = () => {
    const N = academicBooks.length;
    if (N === 0) return '0.00';

    const reusedCount = N - domTrackStats.destroyed;
    return (reusedCount >= 0 && N > 0 ? (reusedCount / N) * 100 : 0).toFixed(2);
  };

  // DOM跟踪组件
  const DomTrackComponent = ({ children, id }) => {
    const elementRef = useRef(null);

    useEffect(() => {
      if (!elementRef.current) return;
      
      if (!elementRef.current.getAttribute('data-tracked')) {
        elementRef.current.setAttribute('data-tracked', 'true');
        domTrackRef.current.created++;
      } else {
        domTrackRef.current.reused++;
      }

      return () => {
        domTrackRef.current.destroyed++;
      };
    }, [id]);

    return (
      <span ref={elementRef} data-id={id} className={styles['dom-track-item']}>
        {children}
      </span>
    );
  };


  // 计算属性
  const totalCategories = countNodes(categoryTree);
  const maxDepth = getMaxDepth(categoryTree);
  const totalBooks = sumBookCount(categoryTree);
  const reuseRate = calculateReuseRate();


  return (
    <div className={styles['nested-list-container']}>
      <h2>分类管理系统</h2>
      <div className={styles.description}>
        <Alert
          message="模块说明"
          type="info"
          description="分类管理系统用于管理图书馆的图书分类层级结构。支持多级分类创建、编辑、删除、拖拽排序等功能，采用React Key绑定策略优化树形结构的渲染性能。"
          showIcon
        />
      </div>

      <div className={styles['statistics-panel']}>
        <Row gutter={20}>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-icon']} style={{ backgroundColor: '#409EFF' }}>
                <MenuOutlined />
              </div>
              <div className={styles['stat-info']}>
                <h3>{totalCategories}</h3>
                <p>总分类数</p>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-icon']} style={{ backgroundColor: '#E6A23C' }}>
                <PlusOutlined />
              </div>
              <div className={styles['stat-info']}>
                <h3>{maxDepth}</h3>
                <p>最大层级</p>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-icon']} style={{ backgroundColor: '#67C23A' }}>
                <PlusOutlined />
              </div>
              <div className={styles['stat-info']}>
                <h3>{totalBooks}</h3>
                <p>图书总数</p>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-icon']} style={{ backgroundColor: '#909399' }}>
                <SnippetsOutlined />
              </div>
              <div className={styles['stat-info']}>
                <h3>{keyType === 'id' ? 'ID作为Key' : keyType === 'index' ? 'Index作为Key' : '无Key'}</h3>
                <p>Key策略</p>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className={styles['control-panel']}>
        <Form inline className={styles['control-form']}>
          <Form.Item label="快速操作">
            <Button 
              type="success" 
              size="small"
              onClick={addRootCategory}
              loading={loading}
            >
              <PlusOutlined /> 添加根分类
            </Button>
            <Button 
              type="primary" 
              size="small"
              onClick={expandAll}
              loading={loading}
            >
              <ArrowDownOutlined /> 展开全部
            </Button>
            <Button 
              type="warning" 
              size="small"
              onClick={collapseAll}
              loading={loading}
            >
              <ArrowUpOutlined /> 收起全部
            </Button>
            <Button 
              type="info" 
              size="small"
              onClick={quickDemo}
              loading={loading}
            >
              <PlusOutlined /> 快速演示
            </Button>
            <Button 
              type="danger" 
              size="small"
              onClick={resetCategories}
              loading={loading}
            >
              <PlusOutlined /> 重置数据
            </Button>
          </Form.Item>
          <Form.Item label="图书操作">
            <Button type="primary" size="small" onClick={() => generateBooks(10)}>生成10本图书</Button>
            <Button type="success" size="small" onClick={addItem}>添加项</Button>
            <Button type="danger" size="small" onClick={removeItem}>删除项</Button>
            <Button type="primary" size="small" onClick={shuffleList}>打乱顺序</Button>
            <Button type="success" size="small" onClick={insertRandomBook}>插入元素</Button>
            <Button type="danger" size="small" onClick={deleteRandomBook}>删除元素</Button>
            <Button type="info" size="small" onClick={replaceAllBooks}>替换所有</Button>
            <Button type="primary" size="small" onClick={appendToEnd}>尾部追加</Button>
            <Button type="success" size="small" onClick={stepInsert}>步步插入</Button>
            <Button type="warning" size="small" onClick={insertToMiddle}>中间插入</Button>
            <Button type="danger" size="small" onClick={partialUpdate}>局部更新</Button>
          </Form.Item>
          <Form.Item label="性能测试操作">
            <Button type="primary" size="small" onClick={() => setKeyType('id')}>ID作为Key</Button>
            <Button type="info" size="small" onClick={() => setKeyType('index')}>Index作为Key</Button>
            <Button type="warning" size="small" onClick={() => setKeyType('none')}>无Key</Button>
            <Button type="info" size="small" onClick={autoTestReuse}>自动测试复用（单次）</Button>
            <Button type="warning" size="small" onClick={autoTestBatchAndExportExcel}>批量测试并导出Excel</Button>
            <Button type="info" size="small" onClick={exportReuseStatsToExcel}>导出Excel（当前）</Button>
          </Form.Item>
        </Form>
      </div>

      <div className={styles['performance-metrics']}>
        <h3>性能指标</h3>
        <div className={styles['metrics-grid']}>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>渲染时间：</span>
            <span className={styles['metric-value']} style={{ color: '#e67e22', fontWeight: 'bold' }}>
              {renderTime || '0'} ms
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM创建数：</span>
            <span className={styles['metric-value']} style={{ color: '#409EFF' }}>
              {domTrackStats.created || 0}
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM复用数：</span>
            <span className={styles['metric-value']} style={{ color: '#67C23A' }}>
              {domTrackStats.reused || 0}
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM销毁数：</span>
            <span className={styles['metric-value']} style={{ color: '#F56C6C' }}>
              {domTrackStats.destroyed || 0}
            </span>
          </div>
          <div className={styles['metric-item']}>
            <span className={styles['metric-label']}>DOM复用率：</span>
            <span className={styles['metric-value']} style={{ color: '#909399', fontWeight: 'bold' }}>
              {reuseRate}%
            </span>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '12px', color: '#e67e22', fontWeight: 'bold' }}>
        {renderTime && `本次渲染耗时：${renderTime} ms<br>节点创建：${domTrackStats.created}，复用：${domTrackStats.reused}，销毁：${domTrackStats.destroyed}，复用率：${reuseRate}%`}
      </div>

      <div className={styles['book-operations-display']}>
        <h3>图书数据预览 ({books.length} 条)</h3>
        <div className={styles['book-list']}>
          {books.map(book => (
            <span key={book.id} className={styles['book-item']}>
              {book.title}
            </span>
          ))}
          {books.length === 0 && <p className={styles['empty-books']}>暂无图书数据，请点击上方按钮生成。</p>}
        </div>
      </div>

      {/* 用于学术数据测试的纯粹列表 */}
      {showAcademicTestList && (
        <div className={styles['academic-test-list']}>
          {academicBooks.map((book, index) => {
            const key = keyType === 'id' ? book.id : index;
            return (
              <DomTrackComponent key={key} id={key}>
                {book.title}
              </DomTrackComponent>
            );
          })}
        </div>
      )}

      <div className={styles['tree-container']}>
        {categoryTree.length > 0 ? (
          <div>
            <div className={styles['tree-operations']}>
              <p className={styles['operation-hint']}>
                <InfoCircleOutlined /> 可以拖拽分类进行排序，点击按钮进行编辑操作
              </p>
            </div>
            <div className={styles['tree-list']}>
              {categoryTree.map(category => (
                <div key={category.id} className={styles['category-item']}>
                  <div className={styles['category-header']}>
                    <div className={styles['category-main']}>
                      <i
                        className={`${styles['expand-icon']} ${isExpanded(category.id) ? styles.expanded : ''}`}
                        onClick={() => toggleExpand(category)}
                      >
                        <ArrowDownOutlined />
                      </i>
                      <span className={styles['category-name']} onClick={() => viewCategoryBooks(category)}>
                        {category.name}（{category.bookCount}本）
                      </span>
                      <Tag size="small" color={getStatusType(category.status)}>
                        {category.status}
                      </Tag>
                    </div>
                    <div className={styles['category-actions']}>
                      <Button
                        size="mini"
                        type="success"
                        onClick={() => addSubCategory(category)}
                      >
                        <PlusOutlined />
                      </Button>
                      <Button
                        size="mini"
                        type="primary"
                        onClick={() => editCategory(category)}
                      >
                        <EditOutlined />
                      </Button>
                      <Button
                        size="mini"
                        type="danger"
                        onClick={() => deleteCategory(category)}
                      >
                        <DeleteOutlined />
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded(category.id) && category.children && category.children.length > 0 && (
                    <div className={styles['category-children']}>
                      {category.children.map(child => (
                        <div key={child.id} className={styles['child-category']}>
                          <div className={styles['child-header']}>
                            <div className={styles['child-main']}>
                              {child.children && child.children.length > 0 ? (
                                <i
                                  className={`${styles['expand-icon']} ${isExpanded(child.id) ? styles.expanded : ''}`}
                                  onClick={() => toggleExpand(child)}
                                >
                                  <ArrowDownOutlined />
                                </i>
                              ) : (
                                <span className={styles['expand-placeholder']} />
                              )}
                              <span className={styles['child-name']} onClick={() => viewCategoryBooks(child)}>
                                {child.name}（{child.bookCount}本）
                              </span>
                              <Tag size="small" color={getStatusType(child.status)}>
                                {child.status}
                              </Tag>
                            </div>
                            <div className={styles['child-actions']}>
                              <Button
                                size="mini"
                                type="success"
                                onClick={() => addSubCategory(child)}
                              >
                                <PlusOutlined />
                              </Button>
                              <Button
                                size="mini"
                                type="primary"
                                onClick={() => editCategory(child)}
                              >
                                <EditOutlined />
                              </Button>
                              <Button
                                size="mini"
                                type="danger"
                                onClick={() => deleteCategory(child)}
                              >
                                <DeleteOutlined />
                              </Button>
                            </div>
                          </div>
                          
                          {isExpanded(child.id) && child.children && child.children.length > 0 && (
                            <div className={styles['grandchild-list']}>
                              {child.children.map(grandchild => (
                                <div key={grandchild.id} className={styles['grandchild-item']}>
                                  <div className={styles['grandchild-content']}>
                                    <span className={styles['grandchild-name']} onClick={() => viewCategoryBooks(grandchild)}>
                                      {grandchild.name}（{grandchild.bookCount}本）
                                    </span>
                                    <Tag size="small" color={getStatusType(grandchild.status)}>
                                      {grandchild.status}
                                    </Tag>
                                  </div>
                                  <div className={styles['grandchild-actions']}>
                                    <Button
                                      size="mini"
                                      type="primary"
                                      onClick={() => editCategory(grandchild)}
                                    >
                                      <EditOutlined />
                                    </Button>
                                    <Button
                                      size="mini"
                                      type="danger"
                                      onClick={() => deleteCategory(grandchild)}
                                    >
                                      <DeleteOutlined />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles['empty-state']}>
            <div className={styles['empty-icon']}>
              <MenuOutlined />
            </div>
            <h3>暂无分类</h3>
            <p>当前没有图书分类，点击"重置数据"开始创建分类结构</p>
            <Button
              type="primary"
              onClick={resetCategories}
              loading={loading}
            >
              初始化分类
            </Button>
          </div>
        )}
      </div>

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={editDialogVisible}
        onClose={() => setEditDialogVisible(false)}
        width="40%"
      >
        <Form labelWidth="100px">
          <Form.Item label="分类名称">
            <Input 
              value={currentCategory.name} 
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })} 
            />
          </Form.Item>
          <Form.Item label="图书数量">
            <InputNumber 
              value={currentCategory.bookCount} 
              onChange={(value) => setCurrentCategory({ ...currentCategory, bookCount: value })} 
              min={0} 
            />
          </Form.Item>
          <Form.Item label="分类描述">
            <Input 
              type="textarea" 
              value={currentCategory.description} 
              onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })} 
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select 
              value={currentCategory.status} 
              onChange={(value) => setCurrentCategory({ ...currentCategory, status: value })} 
              placeholder="请选择状态"
            >
              <Option value="active">活跃</Option>
              <Option value="disabled">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
        <div slot="footer" className={styles['dialog-footer']}>
          <Button onClick={() => setEditDialogVisible(false)}>取 消</Button>
          <Button type="primary" onClick={saveCategory}>确 定</Button>
        </div>
      </Modal>

      <PerformancePanel />
    </div>
  );
};

export default NestedList;  