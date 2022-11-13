import { createApp } from 'vue'
import index from '@/index.vue'
import { store } from '@/store'
import vant from '@/plugins/vant'
import 'vant/lib/index.css'
import GroupComponent from '@/components/global/group-component.vue'
import InjectTemplate from '@/components/global/inject-template.vue'
import WbImg from '@/components/common/wb-img.vue'
import WbBg from '@/components/common/wb-bg.vue'
import '@/assets/scss/vant.scss'
// import '@/assets/scss/loading.scss'
//环境变量
const env_ = import.meta.env
const env = {
  webUrl: env_.VITE_APP_WEB_URL,
  baseUrl: env_.VITE_APP_WEB_URL,
  apiUrl: env_.VITE_APP_API_URL,
}

const app = createApp(index)
app.config.globalProperties.isH5Edit = true
app.config.globalProperties.env = env

app.use(store)
app.use(vant)
// app.use(Lazyload)
// app.use(Lazyload, {
//   lazyComponent: true,
// })
app.component('group-component', GroupComponent)
app.component('inject-template', InjectTemplate)
app.component('wb-img', WbImg)
app.component('wb-bg', WbBg)
app.mount('#app')




