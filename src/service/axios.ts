// import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const env_ = import.meta.env
export const env = {
  webUrl: env_.VITE_APP_WEB_URL,
  apiUrl: env_.VITE_APP_API_URL,
}
// axios.defaults.baseURL = env.apiUrl
// axios.defaults.withCredentials = true
// axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
// axios.defaults.headers['token'] = localStorage.getItem('token') || ''
// axios.defaults.headers.post['Content-Type'] = 'application/json'

// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

// axios.interceptors.response.use(res => {
//   if (typeof res.data !== 'object') {
//     Toast.fail('服务端异常！')
//     return Promise.reject(res)
//   }
//   if (res.data.resultCode != 0) {
//     if (res.data.message) Toast.fail(res.data.message)
//     if (res.data.resultCode == 900010) {
//       EventBus.$emit('login')
//     }
//     return Promise.reject(res.data)
//   }
//   return res.data
// })
const AxiosService = window.axios.create({
  baseURL: env.apiUrl,
  // baseURL: env_.DEV ? '/' : env.apiUrl,
  withCredentials: true
});
// AxiosService.defaults.timeout = 6000;
//在main.js设置全局的请求次数，请求的间隙
// AxiosService.defaults.retry = 1;
// AxiosService.defaults.retryDelay = 1000;
// AxiosService.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
//   var config = err.config;
//   // If config does not exist or the retry option is not set, reject
//   if(!config || !config.retry) return Promise.reject(err);
//   // Set the variable for keeping track of the retry count
//   config.__retryCount = config.__retryCount || 0;
//   // Check if we've maxed out the total number of retries
//   if(config.__retryCount >= config.retry) {
//     // Reject with the error
//     return Promise.reject(err);
//   }
//   // Increase the retry count
//   config.__retryCount += 1;
//   // Create new promise to handle exponential backoff
//   var backoff = new Promise(function(resolve) {
//     window.setTimeout(function() {
//       resolve();
//     }, config.retryDelay || 1);
//   });
//   // Return the promise in which recalls axios to retry the request
//   return backoff.then(function() {
//     return AxiosService(config);
//   });
// });

// config:AxiosRequestConfig
AxiosService.interceptors.request.use((config: any) => {
  config.transformRequest = [(data: any) => {
    return window.Qs.stringify(data, { arrayFormat: 'brackets' })
  }];
  // 在发送请求之前做些什么
  return config
}, function (error: any) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

export default AxiosService
