<script setup>
import useStore from '../store';

const store = useStore();
</script>

<template>
    <div class="home justify-evenly items-center">
        <div class="welcome flex flex-col items-center text-white max-w-sm gap-4">
            <div class="greeting flex flex-col items-center">
                <div class="title text-xl font-bold text-indigo-600">hyperspace <span class="font-normal text-sm text-neutral-500">beta</span></div>
                <div class="subtitle text-center">Welcome to real-time socket.io messenger. Enter your name and let's go!</div>
            </div>
            <input
                @keyup.enter="store.connect()"
                v-model="store.user.name"
                class="chat-input flex items-center w-full px-4 py-2 bg-neutral-800 placeholder:text-neutral-500 rounded-lg text-white"
                type="text"
                placeholder="nagibator228"
            />
        </div>
    </div>
</template>
