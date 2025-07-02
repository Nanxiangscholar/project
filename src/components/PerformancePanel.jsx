import  { useState, useEffect } from 'react';
import { Tag, Button, message } from 'antd';
import { 
  DataAnalysisOutlined 
} from '@ant-design/icons';
import styles from './PerformancePanel.module.css';

/**
 * PerformancePanelUnified 组件
 * 性能监控面板，展示各种性能指标
 */
const PerformancePanelUnified = () => {
  // 状态管理
  const [stats, setStats] = useState({
    domRender: '--',
    fcp: '--',
    lcp: '--',
    tbt: '--',
    cpuCores: '--',
    memory: null
  });
  
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    pixelRatio: 1,
    screenSize: { width: 0, height: 0 },
    viewportSize: { width: 0, height: 0 },
    orientation: 'unknown'
  });
  
  let updateInterval = null;

  /**
   * 格式化字节大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的字符串
   */
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 导出性能报告
   */
  const exportReport = () => {
    const data = {
      stats,
      deviceInfo,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('性能报告已导出');
  };

  /**
   * 检测设备信息
   */
  const detectDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent);
    
    setDeviceInfo({
      ...deviceInfo,
      isMobile,
      isTablet,
      pixelRatio: window.devicePixelRatio,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
    });
  };

  /**
   * 收集性能指标
   */
  const collectPerformanceMetrics = () => {
    if (window.performance) {
      // DOM渲染时间
      const domRender = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      setStats(prev => ({ ...prev, domRender: Math.round(domRender) }));
      
      // 如果支持PerformanceObserver，可以收集更多指标
      if (window.PerformanceObserver) {
        // FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            setStats(prev => ({ ...prev, fcp: Math.round(entry.startTime) }));
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            setStats(prev => ({ ...prev, lcp: Math.round(entry.renderTime || entry.loadTime) }));
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // TBT (Total Blocking Time)
        // 注意：TBT需要更复杂的计算，这里简化处理
        const tbtObserver = new PerformanceObserver((list) => {
          // 实际实现需要更复杂的计算逻辑
          setStats(prev => ({ ...prev, tbt: '--' }));
        });
        tbtObserver.observe({ type: 'longtask', buffered: true });
      }
    }
    
    // CPU核心数
    if (navigator.hardwareConcurrency) {
      setStats(prev => ({ ...prev, cpuCores: navigator.hardwareConcurrency }));
    }
    
    // 内存信息
    if (performance.memory) {
      setStats(prev => ({ ...prev, memory: performance.memory }));
    }
  };

  // 组件挂载时初始化
  useEffect(() => {
    detectDeviceInfo();
    collectPerformanceMetrics();
    
    // 设置定时更新
    updateInterval = setInterval(() => {
      collectPerformanceMetrics();
    }, 5000); // 每5秒更新一次
    
    return () => {
      if (updateInterval) clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className={styles['performance-panel-unified']}>
      <div className={styles['panel-header']}>
        <h3>
          <DataAnalysisOutlined />
          性能监控面板
          {deviceInfo.isMobile ? (
            <Tag size="small" type="success">移动端</Tag>
          ) : (
            <Tag size="small" type="info">PC端</Tag>
          )}
        </h3>
        <div className={styles['header-actions']}>
          <Button size="small" type="primary" onClick={exportReport}>
            导出报告
          </Button>
        </div>
      </div>
      <div className={styles['metrics-row']}>
        <div className={styles['metric-col']}>
          <div className={styles['metric-card']}>
            <h4>DOM渲染</h4>
            <p>渲染时间：<span>{stats.domRender || '--'} ms</span></p>
          </div>
        </div>
        <div className={styles['metric-col']}>
          <div className={styles['metric-card']}>
            <h4>FCP / LCP</h4>
            <p>FCP：<span>{stats.fcp || '--'} ms</span></p>
            <p>LCP：<span>{stats.lcp || '--'} ms</span></p>
          </div>
        </div>
        <div className={styles['metric-col']}>
          <div className={styles['metric-card']}>
            <h4>TBT / 资源</h4>
            <p>TBT：<span>{stats.tbt || '--'} ms</span></p>
            <p>CPU核心数：<span>{stats.cpuCores}</span></p>
            <p>内存：<span>{formatBytes(stats.memory?.usedJSHeapSize)}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePanelUnified;