import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例并设置响应数据编码为utf-8
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 从环境变量获取基础URL
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 sessionStorage 获取 token
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['session-id'] = `${token}`
    }
    
    // 确保请求体是JSON格式
    if (config.data && config.headers['Content-Type'] === 'application/json') {
      config.data = JSON.stringify(config.data)
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 自动存储 session token
    const token = response.headers['authorization'] || response.headers['session-id']
    if (token) {
      sessionStorage.setItem('token', token)
    }



    console.log(response,"---------")
    // 处理业务状态码
    if (response.status  !==200 ) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
     
      
      
    }

     // 处理特定状态码
     if (res.code === 401) {
      // token 过期或未登录
      sessionStorage.removeItem('token')
      // 可以在这里添加重定向到登录页的逻辑
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理 HTTP 状态码错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          sessionStorage.removeItem('token')
          // 可以在这里添加重定向到登录页的逻辑
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data.message || '未知错误')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get(url, params, config = {}) {
    return request({
      method: 'get',
      url,
      params,
      ...config
    })
  },
  
  post(url, data, config = {}) {
    return request({
      method: 'post',
      url,
      data,
      ...config
    })
  },
  
  put(url, data, config = {}) {
    return request({
      method: 'put',
      url,
      data,
      ...config
    })
  },
  
  delete(url, params, config = {}) {
    return request({
      method: 'delete',
      url,
      params,
      ...config
    })
  }
}

export default request 