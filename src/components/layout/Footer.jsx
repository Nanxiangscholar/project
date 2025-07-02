import styles from './Footer.less';

const AppFooter = () => {
  return (
    <footer className={styles['footer']}>
      <div className={styles['footer-content']}>
        <div className={styles['footer-brand']}>
          <h3>智慧图书馆电商平台</h3>
          <p>为现代图书馆提供全方位的数字化管理解决方案</p>
          <div className={styles['social-links']}>
            <a href="#" className={styles['social-link']}>
              <i className={styles['el-icon-link']}></i>
            </a>
            <a href="#" className={styles['social-link']}>
              <i className={styles['el-icon-star-on']}></i>
            </a>
            <a href="#" className={styles['social-link']}>
              <i className={styles['el-icon-share']}></i>
            </a>
          </div>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>核心技术</h4>
          <ul>
            <li>React 18.2.0</li>
            <li>ant-design</li>
            <li>React Router</li>
            <li>响应式设计</li>
          </ul>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>系统模块</h4>
          <ul>
            <li>图书目录管理</li>
            <li>库存动态跟踪</li>
            <li>大量订单处理</li>
            <li>分类层级管理</li>
          </ul>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>技术支持</h4>
          <ul>
            <li><a href="https://v2.vuejs.org/" target="_blank" rel="noopener noreferrer">React.js 官方文档</a></li>
            <li><a href="https://element.eleme.cn/" target="_blank" rel="noopener noreferrer">ant-design 组件库</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">系统使用手册</a></li>
          </ul>
        </div>
      </div>
      
      <div className={styles['footer-bottom']}>
        <div className={styles['footer-bottom-content']}>
          <p>&copy; 2024 智慧图书馆电商平台. 让图书管理更加智能高效。</p>
          <div className={styles['footer-badges']}>
            <span className={styles['badge']}>React 18.2.x</span>
            <span className={styles['badge']}>图书管理</span>
            <span className={styles['badge']}>电商系统</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;