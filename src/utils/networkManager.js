/**
 * 网络连接管理器
 */
import axios from 'axios'
import { defaultCache } from './cacheManager'

// 请求队列管理
class RequestQueue {
  constructor() {
    this.queue = new Map()
    this.maxConcurrent = 6 // 最大并发请求数
    this.currentConcurrent = 0
  }

  // 添加请求到队列
  async add(key, requestPromise) {
    if (this.currentConcurrent >= this.maxConcurrent) {
      await new Promise(resolve => {
        const checkAndResolve = () => {
          if (this.currentConcurrent < this.maxConcurrent) {
            resolve()
          } else {
            setTimeout(checkAndResolve, 100)
          }
        }
        checkAndResolve()
      })
    }

    this.currentConcurrent++
    this.queue.set(key, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.queue.delete(key)
      this.currentConcurrent--
    }
  }

  // 取消请求
  cancel(key) {
    const request = this.queue.get(key)
    if (request && request.cancel) {
      request.cancel('Request cancelled')
    }
    this.queue.delete(key)
    this.currentConcurrent = Math.max(0, this.currentConcurrent - 1)
  }

  // 取消所有请求
  cancelAll() {
    for (const [key] of this.queue) {
      this.cancel(key)
    }
  }
}

// 请求重试管理
class RetryManager {
  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
  }

  async retry(fn, retryCount = 0) {
    try {
      return await fn()
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error
      }

      // 计算退避时间
      const delay = this.retryDelay * Math.pow(2, retryCount)
      await new Promise(resolve => setTimeout(resolve, delay))

      return this.retry(fn, retryCount + 1)
    }
  }
}

// 请求合并管理
class RequestBatcher {
  constructor(delay = 50) {
    this.delay = delay
    this.batches = new Map()
  }

  async add(key, request) {
    if (!this.batches.has(key)) {
      this.batches.set(key, {
        promise: new Promise((resolve, reject) => {
          this.batches.get(key).resolve = resolve
          this.batches.get(key).reject = reject
        }),
        requests: [],
        timer: setTimeout(() => this.execute(key), this.delay)
      })
    }

    const batch = this.batches.get(key)
    batch.requests.push(request)
    return batch.promise
  }

  async execute(key) {
    const batch = this.batches.get(key)
    if (!batch) return

    try {
      const results = await Promise.all(batch.requests)
      batch.resolve(results)
    } catch (error) {
      batch.reject(error)
    }

    this.batches.delete(key)
  }
}

// 网络状态监控
class NetworkMonitor {
  constructor() {
    this.listeners = new Set()
    this.isOnline = navigator.onLine

    window.addEventListener('online', () => this.handleNetworkChange(true))
    window.addEventListener('offline', () => this.handleNetworkChange(false))
  }

  handleNetworkChange(isOnline) {
    this.isOnline = isOnline
    this.listeners.forEach(listener => listener(isOnline))
  }

  addListener(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  removeListener(listener) {
    this.listeners.delete(listener)
  }
}

// 创建增强的axios实例
const createEnhancedAxios = () => {
  const requestQueue = new RequestQueue()
  const retryManager = new RetryManager()
  const requestBatcher = new RequestBatcher()
  const networkMonitor = new NetworkMonitor()

  // 创建axios实例
  const instance = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 15000
  })

  // 请求拦截器
  instance.interceptors.request.use(
    config => {
      // 添加取消令牌
      const source = axios.CancelToken.source()
      config.cancelToken = source.token
      config.cancel = source.cancel

      // 如果是批处理请求
      if (config.batch) {
        const batchKey = `${config.url}_${JSON.stringify(config.params || {})}`
        return requestBatcher.add(batchKey, () => instance(config))
      }

      return config
    },
    error => Promise.reject(error)
  )

  // 响应拦截器
  instance.interceptors.response.use(
    response => response.data,
    async error => {
      // 如果是取消的请求，直接拒绝
      if (axios.isCancel(error)) {
        return Promise.reject(error)
      }

      // 如果是网络错误且配置了重试
      if (error.config && error.config.retry !== false) {
        return retryManager.retry(() => instance(error.config))
      }

      return Promise.reject(error)
    }
  )

  // 增强的请求方法
  const request = async (config) => {
    // 生成请求键
    const requestKey = `${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`

    // 如果离线且有缓存，返回缓存数据
    if (!networkMonitor.isOnline && config.offlineCache) {
      const cachedData = await defaultCache.get(requestKey)
      if (cachedData) {
        return cachedData
      }
    }

    // 添加到请求队列
    return requestQueue.add(requestKey, instance(config))
  }

  return {
    request,
    requestQueue,
    networkMonitor,
    requestBatcher
  }
}

// 创建默认实例
const { request, requestQueue, networkMonitor, requestBatcher } = createEnhancedAxios()

// 导出增强的请求方法
export const enhancedRequest = async (config) => {
  return request(config)
}

// 导出GET方法
export const get = (url, params, config = {}) => {
  return request({
    url,
    method: 'get',
    params,
    ...config
  })
}

// 导出POST方法
export const post = (url, data, config = {}) => {
  return request({
    url,
    method: 'post',
    data,
    ...config
  })
}

// 批量请求方法
export const batchRequest = async (requests) => {
  const batchKey = 'batch_' + Date.now()
  return Promise.all(
    requests.map(req => 
      request({
        ...req,
        batch: true,
        batchKey
      })
    )
  )
}

// 导出网络状态监控
export const useNetworkStatus = (callback) => {
  return networkMonitor.addListener(callback)
}

// 导出请求队列管理
export const cancelRequest = (key) => {
  requestQueue.cancel(key)
}

export const cancelAllRequests = () => {
  requestQueue.cancelAll()
}

export default {
  request: enhancedRequest,
  get,
  post,
  batchRequest,
  useNetworkStatus,
  cancelRequest,
  cancelAllRequests
} 