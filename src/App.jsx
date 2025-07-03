import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AppHeader from './components/layout/Header.jsx';
import AppFooter from './components/layout/Footer.jsx';
import { isAuthenticated, getCurrentUser, clearAuthToken } from './utils/auth';

// 导入页面组件
import Login from './views/Login';
import Home from './views/ExperimentHome';
import BookList from './views/BookList';
import DynamicMediumList from './views/DynamicMediumList';
import NestedList from './views/NestedList';
import BookDetail from './views/BookDetail';
import OrderProcess from './views/LargeFrequentList';

// 导入路由配置
import { routes } from './router/index.js';

function AppLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [userInfo, setUserInfo] = useState(getCurrentUser() || {
    username: '',
    role: '',
    loginTime: ''
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  const checkLoginStatus = () => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUserInfo(currentUser);
      }
    }
  };

  const handleLogout = () => {
    clearAuthToken(); 
    setIsLoggedIn(false);
    setUserInfo({
      username: '',
      role: '',
      loginTime: ''
    });

    if (location.pathname !== '/login') {
      navigate('/login');
    }
  };

  return (
    <div id="app">
      <AppHeader
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
        onLogout={handleLogout}
      />
      <main className="main-container">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  // 根据当前路径获取标题
  const currentRoute = routes.find(route => route.path === location.pathname);
  const title = currentRoute?.meta?.title || '智慧图书馆电商管理系统';
  const navigate = useNavigate();
  useEffect(() => {
    document.title = title;
  }, [title]);

  // 路由守卫
  useEffect(() => {
    const currentRoute = routes.find(route => route.path === location.pathname);
    const requiresAuth = currentRoute?.meta?.requiresAuth !== false;
    const isLoggedIn = isAuthenticated();

    if (requiresAuth && !isLoggedIn) {
      navigate('/login', { replace: true });
    } else if (location.pathname === '/login' && isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="books" element={<BookList />} />
        <Route path="dynamic-medium-list" element={<DynamicMediumList />} />
        <Route path="book-catalog" element={<NestedList />} />
        <Route path="book/:id" element={<BookDetail />} />
        <Route path="order-process" element={<OrderProcess />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}