import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/store'

// 创建 axios 实例用于普通请求
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
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
    const token =response.headers['session-id']|| response.headers['authorization']
    if (token) {
      sessionStorage.setItem('token', token)
      console.log(token,"token")
      useChatStore().setCurrentSessionId(token);
    }



    // 处理业务状态码
    if (response.status  !==200 ) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
     
      
      
    }

     // 处理特定状态码
     if (res.code === 401) {
      // token 过期或未登
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

// 使用 EventSource 处理事件流
export const fetchEventSource = async (url, options = {}) => {
  try {
    // 构建基础URL和查询参数
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const queryParams = new URLSearchParams();
    if (options.data) {
      Object.entries(options.data).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
    }
    const fullUrl = `${baseUrl}${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    // 检查浏览器是否支持 EventSource
    if (typeof EventSource !== "undefined") {
      return new Promise((resolve, reject) => {
        const source = new EventSource(fullUrl);

        // 连接打开时触发
        source.onopen = (event) => {
          console.log("连接打开");
        };

        // 接收消息时触发
        source.onmessage = (event) => {
          const data = event.data.trim();
          
          // 跳过空行
          if (!data) return;
          
          // 处理正常的数据
          if (options.onMessage) {
            options.onMessage(data);
          }

          // 检查是否为结束标记
          if (data.includes('@done')) {
            // 使用更宽松的正则表达式来匹配文件名
            const match = data.match(/@done(.*\.sql.*);/);
            if (match && options.onFileName) {
              const fileName = (match[1]).trim();
              options.onFileName(fileName);
            }
            if (options.onDone) {
              options.onDone();
            }
            source.close();
            resolve();
          }
        };

        // 错误处理
        source.onerror = (event) => {
          console.log("连接关闭");
          source.close();
          if (options.onError) {
            options.onError(event);
          }
          reject(event);
        };
      });
    } else {
      // 浏览器不支持SSE
      console.log("浏览器不支持SSE");
      throw new Error("浏览器不支持SSE");
    }
  } catch (error) {
    console.error('Stream error:', error);
    if (options.onError) {
      options.onError(error);
    }
    throw error;
  }
};

// 修改 http 对象的 stream 方法
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
  },
  
  stream(url, data, options = {}) {
    return fetchEventSource(url, {
      data,
      ...options
    });
  }
}

export default http 