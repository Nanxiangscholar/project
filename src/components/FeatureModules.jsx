import styles from './FeatureModules.less';
import classNames from 'classnames';

const FeatureModules = () => {

  return <div className={styles['feature-modules']}>
    <div className={styles['modules-grid']}>
      {/* 图书管理模块  */}
      <div className={styles['module-card']}>
        <div className={styles['card-icon']}>
          <i className={classNames(styles['fas'], styles['fa-book'])}></i>
        </div>
        <div className={styles['card-content']}>
          <h2>图书管理</h2>
          <p>支持海量图书数据的高效管理，包括图书信息维护、库存跟踪、分类管理等功能。</p>
          <ul>
            <li><i className={classNames(styles['fas'], styles['fa-shield-alt'])}></i> 图书信息维护</li>
            <li><i className={classNames(styles['fas'], styles['fa-database'])}></i> 库存跟踪</li>
            <li><i className={classNames(styles['fas'], styles['fa-tags'])}></i> 分类管理</li>
          </ul>
        </div>
      </div>

      {/*  电商系统模块  */}
      <div className={styles['module-card']}>
        <div className={styles['card-icon']}>
          <i className={classNames(styles['fas'], styles['fa-shopping-cart'])}></i>
        </div>
        <div className={styles['card-content']}>
          <h2>电商系统</h2>
          <p>完整的电商交易流程，支持在线下单、支付处理、订单跟踪、用户管理等。</p>
          <ul>
            <li><i className={classNames(styles['fas'], styles['fa-shopping-bag'])}></i> 在线下单</li>
            <li><i className={classNames(styles['fas'], styles['fa-credit-card'])}></i> 支付处理</li>
            <li><i className={classNames(styles['fas'], styles['fa-truck'])}></i> 订单跟踪</li>
          </ul>
        </div>
      </div>

      {/* 系统核心模块  */}
      <div className={styles['module-card']}>
        <div className={styles['card-icon']}>
          <i className={classNames(styles['fas'], styles['fa-microchip'])}></i>
        </div>
        <div className={styles['card-content']}>
          <h2>系统核心</h2>
          <p>系统核心功能模块，提供强大的业务支持和数据处理能力。</p>
          <ul>
            <li><i className={classNames(styles['fas'], styles['fa-database'])}></i> 数据处理</li>
            <li><i className={classNames(styles['fas'], styles['fa-code-branch'])}></i> 业务流程</li>
            <li><i className={classNames(styles['fas'], styles['fa-puzzle-piece'])}></i> 系统集成</li>
          </ul>
        </div>
      </div>

      {/* 系统安全模块  */}
      <div className={styles['module-card']}>
        <div className={styles['card-icon']}>
          <i className={classNames(styles['fas'], styles['fa-shield-alt'])}></i>
        </div>
        <div className={styles['card-content']}>
          <h2>系统安全</h2>
          <p>提供完整的安全保障体系，包括用户认证、权限管理、数据加密等多重防护机制。</p>
          <ul>
            <li><i className={classNames(styles['fas'], styles['fa-user-shield'])}></i> 身份认证</li>
            <li><i className={classNames(styles['fas'], styles['fa-lock'])}></i> 访问控制</li>
            <li><i className={classNames(styles['fas'], styles['fa-shield-virus'])}></i> 安全审计</li>
          </ul>
        </div>
      </div>
    </div>

    {/* 性能优化特性  */}
    <div className={styles['performance-section']}>
      <div className={styles['performance-cards']}>
        <div className={styles['performance-card']}>
          <div className={styles['card-icon']}>
            <i className={classNames(styles['fas'], styles['fa-key'])}></i>
          </div>
          <div className={styles['card-content']}>
            <h3>Key策略优化</h3>
            <p>采用Vue.js最佳实践，支持多种Key绑定策略。</p>
          </div>
        </div>

        <div className={styles['performance-card']}>
          <div className={styles['card-icon']}>
            <i className={classNames(styles['fas'], styles['fa-tachometer-alt'])}></i>
          </div>
          <div className={styles['card-content']}>
            <h3>性能监控</h3>
            <p>实时监控系统性能指标，确保系统稳定运行。</p>
          </div>
        </div>
        <div className={styles['performance-card']}>
          <div className={styles['card-icon']}>
            <i className={classNames(styles['fas'], styles['fa-database'])}></i>
          </div>
          <div className={styles['card-content']}>
            <h3>大数据处理</h3>
            <p>优化大数据量场景下的流畅体验。</p>
          </div>
        </div>
      </div>
    </div>
  </div>

}
export default FeatureModules;
