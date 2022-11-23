import { createRouter, createWebHashHistory } from 'vue-router';

import Welcome from '../views/WelcomeView.vue';
import Chat from '../views/ChatView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Welcome,
    },
    {
      path: '/chat',
      component: Chat,
    },
  ],
});

export default router;
