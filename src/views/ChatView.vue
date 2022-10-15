<script setup>
import {
  watch, ref, nextTick, onMounted,
} from 'vue';
import useStore from '../store';

const store = useStore();

const messagesView = ref(null);
const lastScrollTop = ref(0);

onMounted(() => {
  if (!store.socket.connected) {
    store.$router.push('/');
  }
});

watch(store.chat.messages, async () => {
  await nextTick();

  const view = messagesView.value;
  const lastMessage = messagesView.value.lastElementChild;

  if (lastMessage.dataset.fromId === store.user.id || lastScrollTop.value < view.scrollTop) {
    lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  lastScrollTop.value = messagesView.value.scrollTop;
});

const onInput = () => {
  if (store.chat.input.typingTimeout) {
    clearTimeout(store.chat.input.typingTimeout);
  }

  if (!store.chat.input.typing) {
    store.emitTyping(true);
  }

  store.$patch({
    chat: {
      input: {
        typingTimeout: setTimeout(() => { store.emitTyping(false); }, 1000),
      },
    },
  });
};

const onSend = () => {
  store.emitMessage();
};

</script>

<template>
    <div class="chat-view px-4">
        <div class="chat-header w-full flex justify-between py-2 gap-2">
            <div class="chat-info flex items-center gap-2">
                <div class="chat-title text-white font-medium">{{ store.chat.title }}</div>
                <div class="chat-users-count text-neutral-500 text-sm">{{ store.chat.users.length }} users</div>
            </div>
            <div class="chat-status flex items-center gap-2">
                <div :class="`connection-status text-sm ${store.socket.connected ? 'text-green-400' : 'text-yellow-400'}`">
                    {{ store.socket.connected ? 'online' : 'offline' }}
                </div>
            </div>
        </div>

        <div ref="messagesView" class="chat-messages flex flex-col flex-grow py-2 gap-2 overflow-auto">
          <div v-for="message in store.chat.messages" :key="message.date"
            :class="`chat-message ${message.flags.isMessage ? message.flags.self ? 'self-end' : 'self-start' : 'self-center'}`"
            :data-message-id="message.id" :data-from-id="message.from.id"
          >
            <div :class="`chat-message-bubble rounded-lg px-4 py-2 min-w-0 w-fit max-w-xl text-white bg-neutral-800 ${message.flags.self && 'bg-indigo-600'}`">
              <div style="word-break: break-word" :class="`chat-message-text ${message.flags.isMessage || 'text-sm'}`">{{ message.text }}</div>

              <div v-if="message.flags.isMessage" :class="`chat-message-details flex justify-end gap-1 text-xs ${message.flags.self ? 'text-white' : 'text-neutral-500'}`">
                <div v-if="!message.flags.self" class="chat-message-author">{{ message.from.name }}</div>
                <div class="chat-message-date">{{ message.date }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-actions flex py-2">
            <input
                @keyup.enter="onSend"
                @input="onInput"
                v-model="store.chat.input.draft"
                class="chat-input flex items-center w-full px-4 py-2 bg-neutral-800 placeholder:text-neutral-500 rounded-lg text-white"
                type="text"
                placeholder="Enter message..."
            />
        </div>
    </div>

</template>

<style>
.chat-messages {
  scrollbar-width: none;
}

.chat-messages::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
