<script setup>
import {
  watch, ref, nextTick, onMounted,
} from 'vue';
import useStore from '../store';

const store = useStore();

const messagesView = ref(null);
const lastScrollTop = ref(0);
const fileInput = ref(null);

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

  lastScrollTop.value = view.scrollTop;
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

const sendMessage = () => {
  store.emitMessage();
};

const uploadFile = () => {
  fileInput.value.click();
};

const onFileUpload = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onloadend = (loadedFile) => {
    store.$patch({
      chat: {
        input: {
          attachment: {
            type: file.type,
            url: loadedFile.target.result,
          },
        },
      },
    });
    store.emitMessage();
  };
  reader.readAsDataURL(file);
};

</script>

<template>
    <div class="chat-view px-4">
        <div class="chat-header w-full flex justify-between py-2 gap-2">
            <div class="chat-info flex items-center gap-2">
                <div class="chat-title text-white font-medium">{{ store.chat.title }}</div>
                <div class="chat-users-count text-neutral-500 text-sm">{{ store.chat.users.length }} чел.</div>
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
              <img v-if="message.attachment?.url" :src="message.attachment?.url" class="rounded-md mt-2 mb-1">
              <div style="word-break: break-word" :class="`chat-message-text ${message.flags.isMessage || 'text-sm'}`">{{ message.text }}</div>

              <div v-if="message.flags.isMessage" :class="`chat-message-details flex gap-1 text-xs ${message.flags.self ? 'text-white' : 'text-neutral-500'}`">
                <div v-if="!message.flags.self" class="chat-message-author">{{ message.from.name }}</div>
                <div class="chat-message-date">{{ message.date }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-actions w-full h-12 flex gap-1 bg-neutral-800 px-2 rounded-t-lg">
          <input type="file" id="file" @change="onFileUpload" class="hidden" ref="fileInput"/>
          <button @click="uploadFile" class="h-12 w-12 flex items-center justify-center text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M6.1 11.5a1.4 1.4 0 1 1 2.8 0 1.4 1.4 0 0 1-2.8 0Z" clip-rule="evenodd"/>
              <path d="M7 3.9a1.8 1.8 0 0 1 1.8-1.8h6.4A1.8 1.8 0 0 1 17 3.9H7Z"/>
              <path fill-rule="evenodd" d="M7.762 6.1h8.476c.808 0 1.469 0 2.006.044.556.045 1.058.142 1.527.381a3.9 3.9 0 0 1 1.704 1.704c.239.47.336.971.381 1.527.044.537.044 1.198.044 2.006v3.476c0 .808 0 1.469-.044 2.006-.045.556-.142 1.058-.381 1.527a3.9 3.9 0 0 1-1.704 1.704c-.47.239-.971.336-1.527.381-.537.044-1.198.044-2.006.044H7.762c-.808 0-1.469 0-2.006-.044-.556-.045-1.058-.142-1.527-.381a3.9 3.9 0 0 1-1.704-1.704c-.239-.47-.336-.971-.381-1.527-.044-.537-.044-1.198-.044-2.006v-3.476c0-.808 0-1.469.044-2.006.045-.556.142-1.058.381-1.527A3.9 3.9 0 0 1 4.23 6.525c.47-.239.971-.336 1.527-.381C6.293 6.1 6.954 6.1 7.762 6.1Zm3.873 11.393a4.9 4.9 0 0 0 .298.236 1.4 1.4 0 0 0 .502.234c.288.066.59.04.863-.077a1.41 1.41 0 0 0 .452-.32c.085-.086.174-.192.251-.285l3.533-4.236 2.566 2.001.001.4c.003.55.006 1.103-.039 1.651-.036.445-.103.683-.19.856a2.1 2.1 0 0 1-.919.918c-.172.088-.411.155-.856.191-.455.037-1.042.038-1.897.038H7.8c-.463 0-.848 0-1.175-.006l3.155-3.156 1.855 1.555Zm6.615-6.16c.099.065.205.148.297.22l1.553 1.21V11.8c0-.855 0-1.442-.038-1.897-.036-.445-.103-.684-.19-.856a2.1 2.1 0 0 0-.919-.918c-.172-.088-.411-.155-.856-.191C17.642 7.9 17.055 7.9 16.2 7.9H7.8c-.855 0-1.442 0-1.897.038-.445.036-.683.103-.856.19a2.1 2.1 0 0 0-.918.919c-.088.172-.155.411-.191.856-.037.455-.038 1.042-.038 1.897v3.4c0 .855 0 1.442.038 1.897.036.445.103.683.19.856.12.235.282.443.476.616l3.983-3.983c.078-.078.169-.17.256-.244a1.404 1.404 0 0 1 1.73-.076c.093.066.192.15.277.22l1.847 1.548 3.53-4.232c.075-.09.16-.194.244-.278.096-.098.238-.225.44-.314a1.4 1.4 0 0 1 .842-.09c.216.044.382.138.497.213ZM7.5 10.1a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z" clip-rule="evenodd"/>
            </svg>
          </button>
          <input
            @keyup.enter="sendMessage"
            @input="onInput"
            v-model="store.chat.input.draft"
            type="text"
            placeholder="Сообщение..."
            class="w-full bg-transparent text-white placeholder:text-neutral-500 !outline-none"
          >
          <button @click="sendMessage" :disabled="!store.chat.input.draft" class="h-12 w-12 flex items-center justify-center text-white transition duration-300 disabled:text-neutral-500">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 0h24v24H0z"/>
                <path d="M5.739 15.754c-.686 1.855-1.117 3.158-1.293 3.91-.553 2.362-.956 2.894 1.107 1.771 2.062-1.122 12.046-6.683 14.274-7.919 2.904-1.611 2.942-1.485-.156-3.196-2.36-1.302-12.227-6.718-14.118-7.782-1.892-1.063-1.66-.59-1.107 1.772.178.761.616 2.076 1.311 3.944a4 4 0 0 0 2.988 2.531l5.765 1.117a.1.1 0 0 1 0 .196l-5.778 1.116a4 4 0 0 0-2.993 2.54Z" fill="currentColor"/>
              </g>
            </svg>
          </button>
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
