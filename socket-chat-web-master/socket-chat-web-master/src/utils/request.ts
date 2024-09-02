import axios, { AxiosResponse } from 'axios'

import { message } from 'ant-design-vue'

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
})


// 请求拦截
client.interceptors.request.use(config => {
  return config
}, err => {
  return Promise.reject(err)
})

// 响应拦截
client.interceptors.response.use((response: AxiosResponse) => {
  // console.log(response);
  if (response.status !== 200 || response.data.code !== 200) {
    // 请求失败
    console.log(response.data);
    message.error(response.data.msg || '请求失败!')
    return false
  }

  return response.data
}, err => {
  return Promise.reject(err)
})

export default client