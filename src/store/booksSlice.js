import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// 生成渐变背景的SVG函数
function generateBookCover(title, subtitle, colors) {
  const [color1, color2, color3] = colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1"/>
        <stop offset="50%" style="stop-color:${color2};stop-opacity:1"/>
        <stop offset="100%" style="stop-color:${color3};stop-opacity:1"/>
      </linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#grad)"/>
    <text x="100" y="126" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">${title}</text>
    <text x="100" y="168" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial" font-size="16">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// 图书数据
const booksData = [
  {
    id: 1,
    title: 'AI & Future',
    author: 'John Smith',
    category: '科技',
    rating: 4.8,
    price: '￥89.00',
    sales: 2150,
    coverUrl: generateBookCover('AI & Future', '科技创新', ['#4158D0', '#C850C0', '#FFCC70'])
  },
  {
    id: 2,
    title: 'Design Psychology',
    author: 'Sarah Johnson',
    category: '设计',
    rating: 4.7,
    price: '￥78.00',
    sales: 1890,
    coverUrl: generateBookCover('Design', 'Psychology', ['#FF9A9E', '#FAD0C4', '#FFF1F1'])
  },
  {
    id: 3,
    title: 'Economics Principles',
    author: 'Michael Chen',
    category: '经济',
    rating: 4.9,
    price: '￥92.00',
    sales: 2340,
    coverUrl: generateBookCover('Economics', '经济学原理', ['#84fab0', '#8fd3f4', '#FFFFFF'])
  },
  {
    id: 4,
    title: 'Modern Art History',
    author: 'Emily Davis',
    category: '艺术',
    rating: 4.6,
    price: '￥85.00',
    sales: 1560,
    coverUrl: generateBookCover('Modern Art', 'History', ['#a18cd1', '#fbc2eb', '#FFFFFF'])
  },
  {
    id: 5,
    title: 'Data Science',
    author: 'David Wilson',
    category: '科技',
    rating: 4.8,
    price: '￥95.00',
    sales: 2780,
    coverUrl: generateBookCover('Data Science', '数据科学', ['#06b6d4', '#22d3ee', '#67e8f9'])
  },
  {
    id: 6,
    title: '机器学习实战',
    author: '张明',
    category: '科技',
    rating: 4.7,
    price: '￥88.00',
    sales: 3200,
    coverUrl: generateBookCover('机器学习', '实战指南', ['#FF416C', '#FF4B2B', '#FFFFFF'])
  },
  {
    id: 7,
    title: '区块链技术与应用',
    author: '李强',
    category: '科技',
    rating: 4.5,
    price: '￥79.00',
    sales: 1850,
    coverUrl: generateBookCover('区块链', '技术与应用', ['#6f86d6', '#48c6ef', '#FFFFFF'])
  },
  {
    id: 8,
    title: '产品设计心理学',
    author: '王芳',
    category: '设计',
    rating: 4.6,
    price: '￥68.00',
    sales: 2100,
    coverUrl: generateBookCover('产品设计', '心理学', ['#f6d365', '#fda085', '#FFFFFF'])
  },
  {
    id: 9,
    title: '现代艺术鉴赏',
    author: '刘艺',
    category: '艺术',
    rating: 4.8,
    price: '￥96.00',
    sales: 1680,
    coverUrl: generateBookCover('现代艺术', '鉴赏', ['#a8edea', '#fed6e3', '#FFFFFF'])
  },
  {
    id: 10,
    title: '金融市场分析',
    author: '陈金',
    category: '经济',
    rating: 4.7,
    price: '￥89.00',
    sales: 2450,
    coverUrl: generateBookCover('金融市场', '分析', ['#96e6a1', '#d4fc79', '#FFFFFF'])
  },
  {
    id: 11,
    title: 'Web前端开发指南',
    author: '杨波',
    category: '编程',
    rating: 4.9,
    price: '￥78.00',
    sales: 3500,
    coverUrl: generateBookCover('Web前端', '开发指南', ['#667eea', '#764ba2', '#FFFFFF'])
  },
  {
    id: 12,
    title: 'Python数据分析',
    author: '郑华',
    category: '编程',
    rating: 4.8,
    price: '￥85.00',
    sales: 2900,
    coverUrl: generateBookCover('Python', '数据分析', ['#4facfe', '#00f2fe', '#FFFFFF'])
  },
  {
    id: 13,
    title: '创新商业模式',
    author: '吴勇',
    category: '商业',
    rating: 4.6,
    price: '￥92.00',
    sales: 1950,
    coverUrl: generateBookCover('创新', '商业模式', ['#f78ca0', '#fe9a8b', '#FFFFFF'])
  },
  {
    id: 14,
    title: '用户体验设计',
    author: '林design',
    category: '设计',
    rating: 4.7,
    price: '￥76.00',
    sales: 2200,
    coverUrl: generateBookCover('用户体验', '设计', ['#a3bded', '#6991c7', '#FFFFFF'])
  },
  {
    id: 15,
    title: '数字营销策略',
    author: '赵明',
    category: '营销',
    rating: 4.5,
    price: '￥69.00',
    sales: 1800,
    coverUrl: generateBookCover('数字营销', '策略', ['#f6d365', '#fda085', '#FFFFFF'])
  },
  {
    id: 16,
    title: '人工智能导论',
    author: '黄博士',
    category: '科技',
    rating: 4.9,
    price: '￥98.00',
    sales: 2600,
    coverUrl: generateBookCover('人工智能', '导论', ['#4158D0', '#C850C0', '#FFFFFF'])
  },
  {
    id: 17,
    title: '现代插画艺术',
    author: '苏画',
    category: '艺术',
    rating: 4.8,
    price: '￥86.00',
    sales: 1750,
    coverUrl: generateBookCover('现代插画', '艺术', ['#ff9a9e', '#fecfef', '#FFFFFF'])
  },
  {
    id: 18,
    title: '企业管理实践',
    author: '张企',
    category: '管理',
    rating: 4.6,
    price: '￥88.00',
    sales: 2100,
    coverUrl: generateBookCover('企业管理', '实践', ['#96fbc4', '#f9f586', '#FFFFFF'])
  },
  {
    id: 19,
    title: 'Java高级编程',
    author: '李程',
    category: '编程',
    rating: 4.7,
    price: '￥95.00',
    sales: 2800,
    coverUrl: generateBookCover('Java', '高级编程', ['#cd9cf2', '#66a6ff', '#FFFFFF'])
  },
  {
    id: 20,
    title: '新媒体运营',
    author: '王媒',
    category: '营销',
    rating: 4.5,
    price: '￥72.00',
    sales: 1900,
    coverUrl: generateBookCover('新媒体', '运营', ['#f6d365', '#fda085', '#FFFFFF'])
  },
  {
    id: 21,
    title: '深度学习实践',
    author: '陈智',
    category: '科技',
    rating: 4.8,
    price: '￥96.00',
    sales: 2400,
    coverUrl: generateBookCover('深度学习', '实践', ['#4facfe', '#00f2fe', '#FFFFFF'])
  },
  {
    id: 22,
    title: '品牌设计艺术',
    author: '刘brand',
    category: '设计',
    rating: 4.7,
    price: '￥82.00',
    sales: 2000,
    coverUrl: generateBookCover('品牌设计', '艺术', ['#FF9A9E', '#FAD0C4', '#FFFFFF'])
  },
  {
    id: 23,
    title: '投资理财指南',
    author: '张财',
    category: '经济',
    rating: 4.6,
    price: '￥78.00',
    sales: 2300,
    coverUrl: generateBookCover('投资理财', '指南', ['#84fab0', '#8fd3f4', '#FFFFFF'])
  },
  {
    id: 24,
    title: '数据可视化',
    author: '李数',
    category: '科技',
    rating: 4.8,
    price: '￥86.00',
    sales: 2100,
    coverUrl: generateBookCover('数据', '可视化', ['#a18cd1', '#fbc2eb', '#FFFFFF'])
  },
  {
    id: 25,
    title: '敏捷项目管理',
    author: '王敏',
    category: '管理',
    rating: 4.7,
    price: '￥84.00',
    sales: 1950,
    coverUrl: generateBookCover('敏捷', '项目管理', ['#6f86d6', '#48c6ef', '#FFFFFF'])
  },
  {
    id: 26,
    title: 'React开发实战',
    author: '张前端',
    category: '编程',
    rating: 4.9,
    price: '￥92.00',
    sales: 3100,
    coverUrl: generateBookCover('React', '开发实战', ['#FF416C', '#FF4B2B', '#FFFFFF'])
  },
  {
    id: 27,
    title: '摄影艺术创作',
    author: '刘光',
    category: '艺术',
    rating: 4.8,
    price: '￥88.00',
    sales: 1800,
    coverUrl: generateBookCover('摄影艺术', '创作', ['#a8edea', '#fed6e3', '#FFFFFF'])
  },
  {
    id: 28,
    title: '市场营销策略',
    author: '李营',
    category: '营销',
    rating: 4.6,
    price: '￥76.00',
    sales: 2200,
    coverUrl: generateBookCover('市场营销', '策略', ['#f78ca0', '#fe9a8b', '#FFFFFF'])
  },
  {
    id: 29,
    title: '云计算架构',
    author: '张云',
    category: '科技',
    rating: 4.7,
    price: '￥94.00',
    sales: 2500,
    coverUrl: generateBookCover('云计算', '架构', ['#4158D0', '#C850C0', '#FFFFFF'])
  },
  {
    id: 30,
    title: '室内设计原理',
    author: '王室',
    category: '设计',
    rating: 4.5,
    price: '￥82.00',
    sales: 1700,
    coverUrl: generateBookCover('室内设计', '原理', ['#a3bded', '#6991c7', '#FFFFFF'])
  },
  {
    id: 31,
    title: '微服务架构设计',
    author: '陈架',
    category: '科技',
    rating: 4.8,
    price: '￥96.00',
    sales: 2700,
    coverUrl: generateBookCover('微服务', '架构设计', ['#06b6d4', '#22d3ee', '#67e8f9'])
  },
  {
    id: 32,
    title: '油画技法详解',
    author: '孙画',
    category: '艺术',
    rating: 4.7,
    price: '￥92.00',
    sales: 1600,
    coverUrl: generateBookCover('油画技法', '详解', ['#ff9a9e', '#fecfef', '#FFFFFF'])
  },
  {
    id: 33,
    title: '企业战略管理',
    author: '赵企',
    category: '管理',
    rating: 4.6,
    price: '￥86.00',
    sales: 2100,
    coverUrl: generateBookCover('企业战略', '管理', ['#96fbc4', '#f9f586', '#FFFFFF'])
  },
  {
    id: 34,
    title: 'iOS移动开发',
    author: '黄移动',
    category: '编程',
    rating: 4.8,
    price: '￥94.00',
    sales: 2600,
    coverUrl: generateBookCover('iOS', '移动开发', ['#cd9cf2', '#66a6ff', '#FFFFFF'])
  },
  {
    id: 35,
    title: '社交媒体营销',
    author: '张社',
    category: '营销',
    rating: 4.5,
    price: '￥74.00',
    sales: 2000,
    coverUrl: generateBookCover('社交媒体', '营销', ['#f6d365', '#fda085', '#FFFFFF'])
  },
  {
    id: 36,
    title: '网络安全技术',
    author: '李安',
    category: '科技',
    rating: 4.9,
    price: '￥98.00',
    sales: 2800,
    coverUrl: generateBookCover('网络安全', '技术', ['#6b46c1', '#9333ea', '#d8b4fe'])
  },
  {
    id: 37,
    title: '平面设计精髓',
    author: '王平',
    category: '设计',
    rating: 4.7,
    price: '￥84.00',
    sales: 2200,
    coverUrl: generateBookCover('平面设计', '精髓', ['#FF9A9E', '#FAD0C4', '#FFFFFF'])
  },
  {
    id: 38,
    title: '证券投资分析',
    author: '周证',
    category: '经济',
    rating: 4.6,
    price: '￥88.00',
    sales: 2400,
    coverUrl: generateBookCover('证券投资', '分析', ['#84fab0', '#8fd3f4', '#FFFFFF'])
  },
  {
    id: 39,
    title: '人像摄影技巧',
    author: '刘像',
    category: '艺术',
    rating: 4.8,
    price: '￥86.00',
    sales: 1900,
    coverUrl: generateBookCover('人像摄影', '技巧', ['#a18cd1', '#fbc2eb', '#FFFFFF'])
  },
  {
    id: 40,
    title: '电商运营实战',
    author: '张电',
    category: '营销',
    rating: 4.7,
    price: '￥82.00',
    sales: 2500,
    coverUrl: generateBookCover('电商运营', '实战', ['#6f86d6', '#48c6ef', '#FFFFFF'])
  }
]

// 初始状态
const initialState = {
  books: booksData,
  loading: false,
  error: null,
};

// 创建异步 thunk 来获取书籍数据
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟 API 调用延迟
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(booksData);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks: (state, action) => {
      state.books = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// 导出 action creators
export const { setBooks } = booksSlice.actions;

// 导出选择器
export const selectAllBooks = (state) => state.books.books;
export const selectBooksLoading = (state) => state.books.loading;
export const selectBooksError = (state) => state.books.error;

// 选择热门图书（按销量排序的前8本）
export const selectPopularBooks = createSelector(
  [selectAllBooks],
  (books) => {
    return [...books]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 8);
  }
);

// 选择特定ID的图书
export const selectBookById = createSelector(
  [selectAllBooks, (_, bookId) => bookId],
  (books, bookId) => books.find(book => book.id === bookId)
);

// 选择特定类别的图书
export const selectBooksByCategory = createSelector(
  [selectAllBooks, (_, category) => category],
  (books, category) => books.filter(book => book.category === category)
);

export default booksSlice.reducer;