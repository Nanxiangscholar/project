import { Link, useLocation } from 'react-router-dom';
import UserInfo from './UserInfo.jsx'; 
import styles from './Header.less';

const AppHeader = ({ isLoggedIn, userInfo, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={styles['header']}>
      <div className={styles['header-content']}>
        <div className={styles['brand-title']}>
          <h1>图书馆管理系统</h1>
        </div>
        
        <div className={styles['nav-container']}>
          <nav className={styles['navigation']}>
            <Link 
              to="/" 
              className={`${styles['nav-item']} ${isActive('/') ? [styles['router-link-active']] : ''}`}
              exact
            >
              <div className={styles['nav-icon']}>
                <i className={styles['el-icon-house']}></i>
              </div>
              <span>系统首页</span>
            </Link>
            <Link 
              to="/books" 
              className={`${styles['nav-item']} ${isActive('/books') ? styles['router-link-active'] : ''}`}
            >
              <div className={styles['nav-icon']}>
                <i className={styles['el-icon-document']}></i>
              </div>
              <span>图书目录</span>
            </Link>
            <Link 
              to="/dynamic-medium-list" 
              className={`${styles['nav-item']} ${isActive('/dynamic-medium-list') ? styles['router-link-active'] : ''}`}
            >
              <div className={styles['nav-icon']}>
                <i className={styles['el-icon-refresh-right']}></i>
              </div>
              <span>库存管理</span>
            </Link>
            <Link 
              to="/order-process" 
              className={`${styles['nav-item']} ${isActive('/order-process') ? styles['router-link-active'] : ''}`}
            >
              <div className={styles['nav-icon']}>
                <i className={styles['el-icon-data-line']}></i>
              </div>
              <span>订单处理</span>
            </Link>
            <Link 
              to="/book-catalog" 
              className={`${styles['nav-item']} ${isActive('/book-catalog') ? styles['router-link-active'] : ''}`}
            >
              <div className={styles['nav-icon']}>
                <i className={styles['el-icon-menu']}></i>
              </div>
              <span>分类管理</span>
            </Link>
          </nav>

          {isLoggedIn && <UserInfo userInfo={userInfo} onLogout={onLogout} />}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;