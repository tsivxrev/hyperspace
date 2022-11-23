<script setup>
import useStore from '../store';

const store = useStore();

const join = () => {
  if (!store.user.name) return;

  store.join('chat_id');
  store.$router.push('/chat');
};
</script>

<template>
    <div class="welcome justify-center gap-4 p-4 max-w-md">
        <div class="greeting flex flex-col w-full items-center text-center">
            <div class="title text-2xl text-indigo-500 font-bold">hyperspace <span class="font-normal text-sm text-neutral-500">beta</span></div>
            <div class="title text-white">Привет! Это самый крутой мессенджер, который ты когда-либо видел. Пиши имя и выбирай чат, чтобы пообщаться</div>
        </div>

        <div class="name-input">
            <input
                :disabled="store.chat.joined"
                v-model="store.user.name"
                type="text"
                placeholder="Имя"
                class="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white placeholder:text-neutral-500 disabled:text-neutral-500"
            >
        </div>

        <div v-if="store.socket.connected" class="chat-list flex flex-col w-full gap-2">
            <div
                @click="join"
                class="chat cursor-pointer hover:bg-neutral-700 transition duration-300 flex items-center bg-neutral-800 rounded-lg justify-between p-4 flex-wrap"
            >
                <div class="chat-preview flex items-center gap-4">
                    <img class="chat-avatar h-14 w-14 rounded-full" :src="store.chat.avatar">
                    <div class="chat-info flex flex-col">
                        <div class="chat-title text-indigo-500 text-lg font-bold">{{ store.chat.title }} <span class="text-neutral-500 font-normal text-sm">{{ store.chat.users.length }} чел.</span></div>
                        <div class="chat-description text-neutral-500">{{ store.chat.description }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="connecting flex justify-center text-neutral-500 animate-spin">
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="M16.394 5.077A8.2 8.2 0 0 0 4.58 15.49a.9.9 0 0 1-1.628.767A10 10 0 1 1 12 22a.9.9 0 0 1 0-1.8 8.2 8.2 0 0 0 4.394-15.123z" fill="currentColor" fill-rule="evenodd"/>
            </svg>
        </div>

        <div class="footer text-neutral-500 text-center">made with love by @tsivxrev</div>
    </div>
</template>
