import { createRouter, createWebHashHistory } from 'vue-router';

import Home from '../views/HomeView.vue';
import Chat from '../views/ChatView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/chat',
      component: Chat,
    },
  ],
});

export default router;
