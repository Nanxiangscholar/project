// 认证工具模块

let isInitialized = false
let cachedAuthStatus = null

// 初始化认证状态
export function initAuth() {
  if (isInitialized) return
  cachedAuthStatus = localStorage.getItem('isLoggedIn') === 'true'
  isInitialized = true
}

// 检查用户是否已登录
export function isAuthenticated() {
  if (!isInitialized) {
    initAuth()
  }
  return cachedAuthStatus
}

// 获取当前用户信息
export function getCurrentUser() {
  if (!isAuthenticated()) return null
  
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr)
    } catch (e) {
      console.error('解析用户信息失败:', e)
      clearAuthToken()
      return null
    }
  }
  return null
}

// 设置登录状态
export function setAuthToken(userInfo) {
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
  cachedAuthStatus = true
}

// 清除登录状态
export function clearAuthToken() {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  cachedAuthStatus = false
}

// 检查用户权限
export function hasPermission(permission) {
  const user = getCurrentUser()
  if (!user) return false
  
  // 管理员拥有所有权限
  if (user.role === 'admin') return true
  
  // 这里可以根据具体需求扩展权限检查逻辑
  const userPermissions = {
    'user': ['read', 'create', 'update']  // 普通用户权限
  }
  
  return userPermissions[user.role] && userPermissions[user.role].includes(permission) || false
}

// 格式化登录时间
export function formatLoginTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 验证用户名和密码（演示用）
export function validateCredentials(username, password) {
  // 这里是演示用的简单验证，实际项目中应该调用后端API
  const validUsers = {
    'admin': { password: '123456', role: 'admin', name: '系统管理员' },
    'user': { password: '123456', role: 'user', name: '普通用户' }
  }
  
  const user = validUsers[username]
  if (user && user.password === password) {
    return {
      success: true,
      user: {
        username: username,
        role: user.role,
        name: user.name,
        loginTime: new Date().toISOString()
      }
    }
  }
  
  return {
    success: false,
    message: '用户名或密码错误'
  }
} 