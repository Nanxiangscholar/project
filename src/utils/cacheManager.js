/**
 * 缓存管理器
 */

// 内存缓存实现
class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map()
    this.maxSize = options.maxSize || 100
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000 // 默认5分钟
  }

  set(key, value, ttl = this.defaultTTL) {
    // 如果缓存已满，删除最早的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// LocalStorage缓存实现
class StorageCache {
  constructor(prefix = 'app_cache_') {
    this.prefix = prefix
  }

  // 生成带前缀的键名
  getKey(key) {
    return `${this.prefix}${key}`
  }

  set(key, value, ttl = 0) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(this.getKey(key), JSON.stringify(item))
  }

  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem(this.getKey(key)))
      if (!item) return null

      // 检查是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.delete(key)
        return null
      }

      return item.value
    } catch (e) {
      console.error('Error reading from localStorage:', e)
      return null
    }
  }

  delete(key) {
    localStorage.removeItem(this.getKey(key))
  }

  clear() {
    // 只清除带有指定前缀的项
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    }
  }

  // 清理过期缓存
  cleanup() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            localStorage.removeItem(key)
          }
        } catch (e) {
          // 如果数据损坏，删除它
          localStorage.removeItem(key)
        }
      }
    }
  }
}

// IndexedDB缓存实现
class IndexedDBCache {
  constructor(dbName = 'app_cache', storeName = 'cache_store') {
    this.dbName = dbName
    this.storeName = storeName
    this.db = null
  }

  async init() {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async set(key, value, ttl = 0) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const item = {
        key,
        value,
        timestamp: Date.now(),
        ttl
      }

      const request = store.put(item)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async get(key) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const item = request.result
        if (!item) {
          resolve(null)
          return
        }

        // 检查是否过期
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          this.delete(key)
          resolve(null)
          return
        }

        resolve(item.value)
      }
    })
  }

  async delete(key) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear() {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async cleanup() {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.openCursor()

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          const item = cursor.value
          if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }
}

// 缓存管理器
export class CacheManager {
  constructor(options = {}) {
    this.memoryCache = new MemoryCache(options.memory)
    this.storageCache = new StorageCache(options.storage?.prefix)
    this.indexedDBCache = new IndexedDBCache(
      options.indexedDB?.dbName,
      options.indexedDB?.storeName
    )
    
    // 自动清理定时器
    if (options.cleanupInterval) {
      setInterval(() => this.cleanup(), options.cleanupInterval)
    }
  }

  // 设置缓存
  async set(key, value, options = {}) {
    const {
      memory = true,
      storage = true,
      indexedDB = true,
      ttl = 0
    } = options

    if (memory) {
      this.memoryCache.set(key, value, ttl)
    }
    if (storage) {
      this.storageCache.set(key, value, ttl)
    }
    if (indexedDB) {
      await this.indexedDBCache.set(key, value, ttl)
    }
  }

  // 获取缓存
  async get(key, options = {}) {
    const {
      memory = true,
      storage = true,
      indexedDB = true
    } = options

    // 优先从内存缓存获取
    if (memory) {
      const memoryValue = this.memoryCache.get(key)
      if (memoryValue !== null) return memoryValue
    }

    // 其次从localStorage获取
    if (storage) {
      const storageValue = this.storageCache.get(key)
      if (storageValue !== null) {
        // 如果找到了值，同步到内存缓存
        if (memory) {
          this.memoryCache.set(key, storageValue)
        }
        return storageValue
      }
    }

    // 最后从IndexedDB获取
    if (indexedDB) {
      const indexedDBValue = await this.indexedDBCache.get(key)
      if (indexedDBValue !== null) {
        // 同步到其他缓存
        if (memory) {
          this.memoryCache.set(key, indexedDBValue)
        }
        if (storage) {
          this.storageCache.set(key, indexedDBValue)
        }
        return indexedDBValue
      }
    }

    return null
  }

  // 删除缓存
  async delete(key) {
    this.memoryCache.delete(key)
    this.storageCache.delete(key)
    await this.indexedDBCache.delete(key)
  }

  // 清空所有缓存
  async clear() {
    this.memoryCache.clear()
    this.storageCache.clear()
    await this.indexedDBCache.clear()
  }

  // 清理过期缓存
  async cleanup() {
    this.memoryCache.cleanup()
    this.storageCache.cleanup()
    await this.indexedDBCache.cleanup()
  }
}

// 创建默认缓存管理器实例
export const defaultCache = new CacheManager({
  memory: {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000 // 5分钟
  },
  storage: {
    prefix: 'app_cache_'
  },
  indexedDB: {
    dbName: 'app_cache',
    storeName: 'cache_store'
  },
  cleanupInterval: 15 * 60 * 1000 // 15分钟清理一次
}) 