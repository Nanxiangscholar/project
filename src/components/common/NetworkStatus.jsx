import { useState, useEffect } from 'react';
import './NetworkStatus.module.css';

import { useNetworkStatus } from '@/utils/networkManager';

const NetworkStatus = ({ retryable = true, customMessage = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);
  // 添加一个状态来控制横幅的显示
  const [showBanner, setShowBanner] = useState(false);

  const handleNetworkChange = useNetworkStatus((online) => {
    setIsOnline(online);
  });

  const message = retrying 
    ? '正在重新连接...' 
    : customMessage || (isOnline ? '网络已连接' : '网络连接已断开');

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetch(window.location.origin + '/ping');
      setIsOnline(true);
    } catch (error) {
      console.error('网络重试失败:', error);
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    // 当网络状态变为离线时，显示横幅
    if (isOnline === false) {
      setShowBanner(true);
    }
  }, [isOnline]);

  // 当网络恢复时，隐藏横幅
  useEffect(() => {
    if (isOnline === true) {
      // 可以添加一个短暂的延迟，让横幅显示一会儿再消失
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000); // 显示3秒后消失

      // 清理定时器
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  useEffect(() => {
    return () => {
      handleNetworkChange(false);
    };
  }, []);

  return (
    <div className={`network-status ${isOnline ? '' : 'is-offline'}`}>
      {/* 使用状态控制横幅的显示 */}
      {showBanner && isOnline === false && (
        <div className={`offline-banner ${isOnline ? 'fade-out' : 'fade-in'}`}>
          <span className="icon">
            <i className="fas fa-wifi"></i>
          </span>
          <span className="message">{message}</span>
          {retryable && (
            <button onClick={handleRetry} className="retry-button">
              重试
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;