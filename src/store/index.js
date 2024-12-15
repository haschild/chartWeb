// 全局状态管理
import { createPinia } from "pinia";
import { defineStore } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

export const useChatStore = defineStore("chat", {
  state: () => ({
    firstMenu: 'convertion',

   
    // 聊天记录
    /**
     * [{title:"用户输入内容前6个字符",data:[]}]
     */
    chatHistory: [],

  }),

  actions: {
    setFirstMenu(menu) {
      this.firstMenu = menu
    },
    addChat(message) {
      this.chatHistory.push(message)
    },
    clearHistory() {
      this.chatHistory = []
    }
  },

  // 添加持久化
  persist: true
});

export default pinia;
