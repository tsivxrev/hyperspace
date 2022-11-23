import { createPinia } from 'pinia';
import { createApp, markRaw } from 'vue';

import './index.css';

import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();
pinia.use(({ store }) => {
  // eslint-disable-next-line no-param-reassign
  store.$router = markRaw(router);
});

app.use(pinia);
app.use(router);
app.mount('#app');
