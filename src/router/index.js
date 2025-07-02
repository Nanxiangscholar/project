import Login from '../views/Login';
import ExperimentHome from '../views/ExperimentHome';
import BookList from '../views/BookList';
import DynamicMediumList from '../views/DynamicMediumList';
import NestedList from '../views/NestedList';
import BookDetail from '../views/BookDetail';
import OrderProcess from '../views/LargeFrequentList';
import {  Navigate } from 'react-router-dom';
export const routes = [
  {
    path: '/login',
    element: <Login />,
    meta: { title: '用户登录', requiresAuth: false },
  },
  {
    path: '/',
    element: <ExperimentHome />,
    meta: { title: '首页', requiresAuth: true },
  },
  {
    path: '/books',
    element: <BookList />,
    meta: { title: '图书目录管理', requiresAuth: true },
  },
  {
    path: '/dynamic-medium-list',
    element: <DynamicMediumList />,
    meta: { title: '库存管理', requiresAuth: true },
  },
  {
    path: '/book-catalog',
    element: <NestedList />,
    meta: { title: '分类管理', requiresAuth: true },
  },
  {
    path: '/book/:id',
    element: <BookDetail />,
    meta: { title: '图书详情', requiresAuth: true },
  },
  {
    path: '/order-process',
    element: <OrderProcess />,
    meta: { title: '订单处理', requiresAuth: true },
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

 