<script setup>
import { onMounted } from 'vue';
import { io } from 'socket.io-client';
import useStore from './store';

const store = useStore();
// eslint-disable-next-line no-underscore-dangle
window._store = store;

onMounted(() => {
  const socket = io('https://chat.tsivx.ru/', { path: '/api' });

  socket.on('connect', store.onConnect);
  socket.on('disconnect', store.onDisconnect);
  socket.on('user', store.onUserChanged);
  socket.on('chat', store.onChatChanged);
  socket.on('event', store.onEvent);
  socket.on('message', store.onMessage);

  store.socket.io = socket;
});

</script>

<template>
    <div class="main h-full w-screen flex flex-col bg-neutral-900 items-center select-none overflow-hidden">
        <RouterView class="h-full w-full lg:w-[48rem] flex flex-col"></RouterView>
    </div>
</template>
