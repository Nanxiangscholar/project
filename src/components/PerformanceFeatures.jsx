
import styles from './PerformanceFeatures.less';
import classNames from 'classnames';

const PerformanceFeatures = () => {
  return (
   <div className={styles['performance-features']}>
    <h2 className={styles['section-title']}>性能优化特性</h2>
    <div className={styles['features-grid']}>
      <div className={styles['feature-card']}>
        <div className={styles['card-icon']}>
          <i className={classNames('fas', 'fa-key')}></i>
        </div>
        <div className={styles['card-content']}>
          <h3 className={styles['card-title']}>Key策略优化</h3>
          <p className={styles['card-description']}>采用Vue.js最佳实践，支持多种Key绑定策略，确保组件高效更新。</p>
        </div>
      </div>

      <div className={styles['feature-card']}>
        <div className={styles['card-icon']}>
          <i className={classNames('fas', 'fa-tachometer-alt')}></i>
        </div>
        <div className={styles['card-content']}>
          <h3>性能监控</h3>
          <p>实时监控系统性能指标，包括响应时间、资源占用等关键数据。</p>
        </div>
      </div>

      <div className={styles['feature-card']}>
        <div className={styles['card-icon']}>
          <i className={classNames('fas', 'fa-database')}></i>
        </div>
        <div className={styles['card-content']}>
          <h3>大数据处理</h3>
          <p>优化大数据量场景下的流畅体验，支持数据分片加载和虚拟滚动。</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default PerformanceFeatures;
