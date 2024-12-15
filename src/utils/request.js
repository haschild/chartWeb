import axios from 'axios'
import { ElMessage } from 'element-plus'

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

// 使用 fetch 处理事件流
export const fetchEventSource = async (url, options = {}) => {
  const token = sessionStorage.getItem('token');
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...(token ? { 'session-id': token } : {}),
        ...options.headers
      },
      body: JSON.stringify(options.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // 解码新的数据块并添加到缓冲区
      buffer += decoder.decode(value, { stream: true });
      
      // 按行分割缓冲区
      const lines = buffer.split('\n');
      
      // 保留最后一个可能不完整的行
      buffer = lines.pop() || '';

      // 处理完整的行
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]' || trimmedLine === '[DONE]') {
          continue;
        }

        try {
          let parsedData;
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6);
            parsedData = JSON.parse(jsonStr);
          } else {
            parsedData = JSON.parse(trimmedLine);
          }
          
          if (options.onMessage) {
            options.onMessage(parsedData);
          }
        } catch (e) {
          console.warn('解析数据时出错:',e, trimmedLine);
        }
      }
    }

    // 处理缓冲区中剩余的数据
    if (buffer.trim()) {
      try {
        let parsedData;
        if (buffer.startsWith('data: ')) {
          const jsonStr = buffer.slice(6);
          parsedData = JSON.parse(jsonStr);
        } else {
          parsedData = JSON.parse(buffer);
        }
        
        if (options.onMessage) {
          options.onMessage(parsedData);
        }
      } catch (e) {
        console.warn('解析最后数据时出错:', buffer);
      }
    }

  } catch (error) {
    console.error('Stream error:', error);
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