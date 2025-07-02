import axios from 'axios'
import { defaultCache } from './cacheManager'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 如果需要缓存，添加缓存标识
    if (config.cache) {
      const cacheKey = `api_cache_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`
      config.cacheKey = cacheKey
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 如果请求配置了缓存，则缓存响应数据
    if (response.config.cache) {
      const { cacheKey, cacheTTL } = response.config
      defaultCache.set(cacheKey, response.data, {
        ttl: cacheTTL || 5 * 60 * 1000 // 默认缓存5分钟
      })
    }
    return response.data
  },
  error => {
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

// 创建带缓存的请求方法
export const request = async (config) => {
  if (config.cache) {
    const cacheKey = `api_cache_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`
    const cachedData = await defaultCache.get(cacheKey)
    
    if (cachedData !== null) {
      return Promise.resolve(cachedData)
    }
  }
  
  return service(config)
}

// 带缓存的GET请求
export const get = (url, params, config = {}) => {
  return request({
    url,
    method: 'get',
    params,
    ...config
  })
}

// 带缓存的POST请求
export const post = (url, data, config = {}) => {
  return request({
    url,
    method: 'post',
    data,
    ...config
  })
}

// 预加载API数据
export const preloadApiData = async (requests) => {
  return Promise.all(
    requests.map(({ url, params, config }) =>
      get(url, params, { ...config, cache: true })
    )
  )
}

// 批量清除API缓存
export const clearApiCache = async (urlPattern) => {
  const keys = await defaultCache.keys()
  const apiCacheKeys = keys.filter(key => 
    key.startsWith('api_cache_') &&
    (!urlPattern || key.includes(urlPattern))
  )
  
  return Promise.all(
    apiCacheKeys.map(key => defaultCache.delete(key))
  )
}

export default service 