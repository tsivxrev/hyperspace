import { createRouter, createWebHistory } from 'vue-router';

import ChatView from '../views/ChatView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: ChatView, // TODO: создать главную страницу с выбором имени и прочими настройками
    },
  ],
});

export default router;
