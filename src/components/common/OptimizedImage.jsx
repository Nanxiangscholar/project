import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  checkWebp, 
  handleImageError,
  formatImageSize,
  createResponsiveImageLoader
} from '../../utils/imageOptimizer';
import { defaultCache } from '../../utils/cacheManager';
import './OptimizedImage.module.css';

const OptimizedImage = ({
  // 基础属性
  src,
  alt = '',
  width = null,
  height = null,
  quality = 75,
  fit = 'cover',
  // 响应式属性
  responsive = false,
  sizes = { sm: '100vw', md: '50vw', lg: '33vw' },
  loading = 'lazy',
  // 高级配置
  breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
  cacheKey = null,
  cacheTTL = 24 * 60 * 60 * 1000, // 默认缓存1天
  // 事件处理
  onError,
  onLoad,
}) => {
  // 状态管理
  const [loaded, setLoaded] = useState(false);
  const [supportsWebp, setSupportsWebp] = useState(false);
  const [imageLoader, setImageLoader] = useState(null);
  const [cachedSrc, setCachedSrc] = useState(null);
  const [isCaching, setIsCaching] = useState(false);
  
  // Refs
  const imgRef = useRef(null);
  const placeholderRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // 检查是否是响应式图片
  const isResponsive = responsive && typeof src === 'object';

  // 计算属性
  const optimizedSrc = isResponsive
    ? imageLoader?.getOptimalImageUrl(src) || ''
    : getOptimizedSrc(src);

  const webpSrcSet = isResponsive ? imageLoader?.generateSrcSet({ ...src, format: 'webp' }) || '' : '';
  const originalSrcSet = isResponsive ? imageLoader?.generateSrcSet(src) || '' : '';
  const fallbackSrc = isResponsive ? imageLoader?.getOptimalImageUrl(src) || '' : optimizedSrc;
  const computedSizes = isResponsive ? imageLoader?.generateSizes(sizes) || '' : '';

  // 容器样式
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f7fa',
    width: width !== null ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height !== null ? (typeof height === 'number' ? `${height}px` : height) : '100%',
  };

  // 图片样式
  const imageStyle = {
    width: '100%',
    height: '100%',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    objectFit: fit,
  };

  // 占位符样式
  const placeholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#909399',
    fontSize: '24px',
    transition: 'opacity 0.3s ease-in-out',
  };

  // 获取优化后的图片源
  function getOptimizedSrc(url) {
    let optimizedUrl = url;
    if (supportsWebp && !url.includes('.gif')) {
      optimizedUrl = url.replace(/\.(jpe?g|png)$/, '.webp');
    }
    return formatImageSize(optimizedUrl, width, height, quality);
  }

  // 处理图片加载错误
  const handleError = (e) => {
    handleImageError(e);
    if (onError) {
      onError(e);
    }
  };

  // 处理图片加载完成
  const handleImageLoad = () => {
    setLoaded(true);
    if (onLoad) {
      onLoad(imgRef.current);
    }
  };

  // 初始化图片加载器
  const initializeLoader = () => {
    setImageLoader(createResponsiveImageLoader({
      breakpoints,
      defaultQuality: quality,
      formats: ['webp', 'original']
    }));
  };

  // 加载图片
  const loadImage = async () => {
    try {
      if (cacheKey) {
        // 尝试从缓存加载
        const cached = await defaultCache.get(cacheKey);
        if (cached) {
          setCachedSrc(cached);
          return;
        }
      }

      // 加载图片
      const img = new Image();
      img.src = src;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 如果配置了缓存，将图片数据URL缓存
      if (cacheKey && !isCaching) {
        setIsCaching(true);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/webp');
          
          await defaultCache.set(cacheKey, dataUrl, {
            ttl: cacheTTL
          });
          setCachedSrc(dataUrl);
        } catch (e) {
          console.error('Failed to cache image:', e);
        }
        setIsCaching(false);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  // 初始化效果
  useEffect(() => {
    setSupportsWebp(checkWebp());
    initializeLoader();
    
    return () => {
      // 清理 ResizeObserver
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // 监听 src 变化
  useEffect(() => {
    if (imageLoader) {
      // 如果是响应式图片，当 src 变化时重新计算优化后的 src
      // 这里不需要额外操作，因为 optimizedSrc 是计算属性，会自动更新
    } else {
      // 如果不是响应式图片，当 src 变化时重新加载图片
      loadImage();
    }
  }, [src]);

  // 监听图片加载完成 (使用 MutationObserver)
  useEffect(() => {
    if (!imgRef.current) return;

    const handleAttributeChange = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          const img = mutation.target;
          if (img.complete) {
            setLoaded(true);
            if (onLoad) {
              onLoad(img);
            }
          } else {
            img.onload = () => {
              setLoaded(true);
              if (onLoad) {
                onLoad(img);
              }
            };
          }
        }
      });
    };

    const observer = new MutationObserver(handleAttributeChange);
    observer.observe(imgRef.current, {
      attributes: true,
      attributeFilter: ['src']
    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // 监听视口变化 (如果是响应式图片)
  useEffect(() => {
    if (isResponsive) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (loaded) {
          // 当窗口大小改变时，更新图片的 src
          // 这里不需要额外操作，因为 optimizedSrc 是计算属性，会自动更新
          // React 会在下一次渲染时使用新的 optimizedSrc
        }
      });
      if (document.documentElement) {
        resizeObserverRef.current.observe(document.documentElement);
      }
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isResponsive, loaded]);

  // 渲染组件
  return (
    <div 
      className={`optimized-image-container ${loaded ? 'loaded' : ''}`}
      style={containerStyle}
    >
      {isResponsive ? (
        <picture>
          {supportsWebp && webpSrcSet && (
            <source 
              type="image/webp" 
              srcSet={webpSrcSet} 
              sizes={computedSizes} 
            />
          )}
          <source 
            srcSet={originalSrcSet} 
            sizes={computedSizes} 
          />
          <img
            ref={imgRef}
            data-src={fallbackSrc}
            alt={alt}
            className="optimized-image"
            onError={handleError}
            style={imageStyle}
            loading={loading}
            onLoad={handleImageLoad}
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          data-src={optimizedSrc}
          alt={alt}
          className="optimized-image"
          onError={handleError}
          style={imageStyle}
          loading={loading}
          onLoad={handleImageLoad}
        />
      )}
      {!loaded && (
        <div 
          ref={placeholderRef}
          className="image-placeholder"
          style={placeholderStyle}
        >
          {/* 默认占位符内容 */}
          <i className="el-icon-picture-outline"></i>
        </div>
      )}
    </div>
  );
};

// 定义 PropTypes
OptimizedImage.propTypes = {
  // 基础属性
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  alt: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  quality: PropTypes.number,
  fit: PropTypes.oneOf(['fill', 'contain', 'cover', 'none', 'scale-down']),
  // 响应式属性
  responsive: PropTypes.bool,
  sizes: PropTypes.object,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  // 高级配置
  breakpoints: PropTypes.object,
  cacheKey: PropTypes.string,
  cacheTTL: PropTypes.number,
  // 事件处理
  onError: PropTypes.func,
  onLoad: PropTypes.func,
};

export default OptimizedImage;