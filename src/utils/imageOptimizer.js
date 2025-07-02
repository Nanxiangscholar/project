/**
 * 图片优化工具函数
 */

// 检查图片是否支持webp格式
export const checkWebp = () => {
  try {
    return (document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0)
  } catch (e) {
    return false
  }
}

// 图片懒加载指令
export const lazyLoadDirective = {
  inserted: el => {
    function loadImage() {
      const imageElement = Array.from(el.children).find(
        el => el.nodeName === 'IMG'
      )
      if (imageElement) {
        imageElement.addEventListener('load', () => {
          setTimeout(() => el.classList.add('loaded'), 100)
        })
        imageElement.addEventListener('error', () => console.log('Error loading image'))
        imageElement.src = imageElement.dataset.src
      }
    }

    function handleIntersect(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage()
          observer.unobserve(el)
        }
      })
    }

    function createObserver() {
      const options = {
        root: null,
        threshold: 0.1
      }
      const observer = new IntersectionObserver(handleIntersect, options)
      observer.observe(el)
    }

    if (window['IntersectionObserver']) {
      createObserver()
    } else {
      loadImage()
    }
  }
}

// 图片加载错误处理
export const handleImageError = (e, defaultImage = '/img/default.png') => {
  e.target.src = defaultImage
}

// 根据设备像素比选择合适的图片
export const getResponsiveImage = (images) => {
  const dpr = window.devicePixelRatio || 1
  const sorted = Object.entries(images).sort((a, b) => Number(a[0]) - Number(b[0]))
  
  for (const [size, url] of sorted) {
    if (dpr <= Number(size)) {
      return url
    }
  }
  
  return sorted[sorted.length - 1][1] // 返回最大尺寸的图片
}

// 预加载关键图片
export const preloadImages = (images) => {
  images.forEach(src => {
    const img = new Image()
    img.src = src
  })
}

// 图片尺寸格式化
export const formatImageSize = (url, width, height, quality = 75) => {
  if (!url) return ''
  
  // 如果是base64或外部链接，直接返回
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url
  }
  
  // 处理内部图片链接
  const params = []
  if (width) params.push(`w_${width}`)
  if (height) params.push(`h_${height}`)
  if (quality) params.push(`q_${quality}`)
  
  return params.length ? `${url}?${params.join(',')}` : url
}

// 图片压缩（使用canvas）
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    type = 'image/jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // 计算缩放比例
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height)
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => resolve(blob),
        type,
        quality
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// 增强的响应式图片加载器
export const createResponsiveImageLoader = (options = {}) => {
  const {
    breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    },
    defaultQuality = 75,
    formats = ['webp', 'original']
  } = options

  return {
    // 获取最适合当前设备的图片URL
    getOptimalImageUrl(imageSources) {
      const dpr = window.devicePixelRatio || 1
      const viewportWidth = window.innerWidth
      const supportsWebp = checkWebp()
      
      // 找到合适的断点
      const breakpoint = Object.entries(breakpoints)
        .reverse()
        .find(([_, width]) => viewportWidth >= width)?.[0] || 'sm'
      
      // 获取对应断点的图片
      const sourceSet = imageSources[breakpoint] || imageSources.default
      
      // 选择合适的格式
      const format = supportsWebp && formats.includes('webp') ? 'webp' : 'original'
      
      // 构建最终URL
      return this.buildImageUrl(sourceSet[format] || sourceSet.original, {
        dpr,
        quality: defaultQuality
      })
    },

    // 构建带有参数的图片URL
    buildImageUrl(baseUrl, { dpr = 1, quality = defaultQuality } = {}) {
      const url = new URL(baseUrl, window.location.origin)
      
      // 添加DPR参数
      if (dpr > 1) {
        url.searchParams.set('dpr', Math.min(dpr, 3)) // 限制最大DPR为3
      }
      
      // 添加质量参数
      url.searchParams.set('q', quality)
      
      return url.toString()
    },

    // 生成srcset属性
    generateSrcSet(imageSources) {
      const supportsWebp = checkWebp()
      const format = supportsWebp && formats.includes('webp') ? 'webp' : 'original'
      
      return Object.entries(breakpoints)
        .map(([breakpoint, width]) => {
          const source = imageSources[breakpoint] || imageSources.default
          const url = source[format] || source.original
          return `${this.buildImageUrl(url)} ${width}w`
        })
        .join(', ')
    },

    // 生成sizes属性
    generateSizes(sizes = {}) {
      return Object.entries(sizes)
        .map(([breakpoint, size]) => {
          const width = breakpoints[breakpoint]
          return width ? `(min-width: ${width}px) ${size}` : size
        })
        .join(', ')
    }
  }
}

// 响应式图片预加载
export const preloadResponsiveImage = (imageSources, options = {}) => {
  const loader = createResponsiveImageLoader(options)
  const optimalUrl = loader.getOptimalImageUrl(imageSources)
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = optimalUrl
  })
}

// 响应式图片状态管理
export const createResponsiveImageState = () => {
  const state = new Map()
  
  return {
    // 设置图片加载状态
    setImageState(id, status) {
      state.set(id, {
        ...state.get(id),
        status,
        timestamp: Date.now()
      })
    },
    
    // 获取图片状态
    getImageState(id) {
      return state.get(id)
    },
    
    // 清理过期状态
    cleanup(maxAge = 3600000) { // 默认1小时
      const now = Date.now()
      for (const [id, data] of state.entries()) {
        if (now - data.timestamp > maxAge) {
          state.delete(id)
        }
      }
    }
  }
} 