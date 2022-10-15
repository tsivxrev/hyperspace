import { defineStore } from 'pinia';
import { io } from 'socket.io-client';

const useStore = defineStore('main', {
  state: () => ({
    socket: {
      io: io('https://chat.tsivx.ru', { autoConnect: false, path: '/api' }),
      connected: false,
    },

    chat: {
      title: 'hyperspace',
      /** @type {[{id: String, name: String}]} */
      users: [],
      /**
        @type {[{
          id: String,
          type: String,
          date: String,
          text: String,
          from: { id: String, name: String },
          to: {id: String, name: String },
          flags: {
            self: boolean,
            private: boolean,
            isMessage: boolean
          }
        }]}
      */
      messages: [],
      input: {
        typingTimeout: 0,
        typing: false,
        draft: '',
        recipent: '',
      },
    },

    user: {
      id: '',
      name: '',
      session: 'session-id', // todo
    },
  }),
  actions: {
    connect() {
      this.socket.io.auth = { username: this.user.name };
      this.socket.io.connect();

      this.socket.io.on('connect', () => {
        this.$router.push('/chat');
        this.socket.connected = true;
        this.socket.io.emit('init');
      });

      this.socket.io.on('disconnect', () => {
        this.$router.push('/');
        this.socket.connected = false;
        this.user.id = '';
        this.chat.title = '';
        this.chat.users = [];
        this.chat.messages = [];
      });

      this.socket.io.on('message', ({ message }) => {
        this.pushMessage(message);
      });

      this.socket.io.on('user', ({ id, name, sessionId }) => {
        this.user.id = id;
        this.user.name = name;

        this.socket.io.auth = { sessionId };
        // localStorage.setItem('session_id', sessionId); TODO: добавить поддержку сессии
        localStorage.setItem('username', name);
      });

      this.socket.io.on('chat', ({ title, users }) => {
        this.chat.title = title;
        this.chat.users = users;
      });

      this.socket.io.on('event', ({ type, user }) => {
        const message = {
          type: 'event',
          date: Math.floor(Date.now() / 1000),
          text: 'Unknown event',
          from: user.id,
        };

        switch (type) {
          case 'join':
            message.text = `${user.name} connected`;
            break;
          case 'leave':
            message.text = `${user.name} disconnected`;
            break;
          default:
            break;
        }

        this.pushMessage(message);
      });
    },

    pushMessage(m) {
      const message = { ...m };

      const from = this.chat.users.find((u) => u.id === message.from);
      const to = this.chat.users.find((u) => u.id === message.to);

      if (from) message.from = from;
      if (to) message.to = to;

      message.date = (new Date(message.date * 1000)).toLocaleTimeString();

      message.flags = {
        self: message.from.id === this.user.id,
        private: !!to,
        isMessage: message.type === 'message',
      };

      this.chat.messages.push(message);
    },

    emitTyping(isTyping) {
      if (!isTyping) {
        clearTimeout(this.chat.input.typingTimeout);
        this.chat.input.typingTimeout = 0;
      }

      this.chat.input.typing = isTyping;
      this.socket.io.emit('typing', { typing: isTyping });
    },

    emitMessage() {
      const { recipent, draft } = this.chat.input;
      if (!draft.length) return;

      this.emitTyping(false);
      this.socket.io.emit('message', { to: recipent, text: draft });
      this.chat.input.draft = '';
    },
  },
});

export default useStore;
