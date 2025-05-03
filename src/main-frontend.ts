import './assets/bootstrap.scss'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Vueform from '@vueform/vueform'
import vueformConfig from './../vueform.config'

import App from './App.vue'
import router from './domains/UserInterface/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vueform, vueformConfig)

app.mount('#app-main')
