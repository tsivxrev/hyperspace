import { defineStore } from 'pinia';

const useStore = defineStore('main', {
  state: () => ({
    socket: {
      io: null,
      connected: false,
    },

    chat: {
      title: 'Hyperspace Messenger',
      avatar: 'https://static.wixstatic.com/media/713b90_7841ba78e810446f8765776b69ee76e3~mv2.png',
      joined: false,
      description: 'A real-time SocketIO messenger.',
      /** @type {[{id: String, name: String}]} */
      users: [],
      /**
        @type {[{
          id: String,
          type: String,
          date: String,
          text: String,
          attachment: { type: String, url: String },
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
        recipent: null,
        attachment: null,
      },
    },

    user: {
      id: null,
      name: null,
    },
  }),
  actions: {
    join(chatId) {
      this.socket.io.emit('join', { username: this.user.name, chatId });
    },

    onConnect() {
      this.socket.connected = true;
    },

    onDisconnect() {
      this.socket.connected = false;
      this.user.id = '';
      this.chat.title = 'Hyperspace Messenger';
      this.chat.description = 'A real-time SocketIO messenger.';
      this.chat.avatar = 'https://static.wixstatic.com/media/713b90_7841ba78e810446f8765776b69ee76e3~mv2.png';
      this.chat.users = [];
      this.chat.messages = [];
      this.chat.joined = false;

      this.$router.push('/');
    },

    onUserChanged({ id, name }) {
      this.user.id = id;
      this.user.name = name;
    },

    onChatChanged({
      title, description, avatar, users,
    }) {
      this.chat.title = title;
      this.chat.description = description;
      this.chat.avatar = avatar;
      this.chat.users = users;
    },

    onEvent({ type, user, extra }) {
      switch (type) {
        case 'join':
          if (user.id === this.user.id) {
            this.chat.joined = true;
          }

          this.event({
            text: `${user.name} теперь в чате`,
            from: user,
          });
          break;
        case 'leave':
          if (user.id === this.user.id) { // не знаю при каких обстоятельствах такое может произойти, но почему бы и нет.
            this.chat.joined = false;
          }

          this.event({
            text: `${user.name} покинул(а) чат`,
            from: user,
          });
          break;
        case 'broadcast':
          this.event({
            text: extra.text,
            from: user,
          });
          break;
        default:
          break;
      }
    },

    onMessage(msg) {
      const message = { ...msg };

      message.date = (new Date(message.date * 1000)).toLocaleTimeString();
      message.flags.self = message.from.id === this.user.id;

      this.chat.messages.push(message);
    },

    event({ text, from }) {
      const event = {
        id: null,
        type: 'event',
        date: (new Date()).toLocaleTimeString(),
        text,
        attachment: null,
        from,
        to: null,
        flags: {
          self: null,
          private: null,
          isMessage: false,
        },
      };

      this.chat.messages.push(event);
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
      const { recipent, draft, attachment } = this.chat.input;
      if (!draft && !attachment) return;

      this.emitTyping(false);
      this.socket.io.emit('message', { to: recipent, text: draft, attachment });
      this.chat.input.draft = '';
      this.chat.input.attachment = null;
    },
  },
});

export default useStore;
