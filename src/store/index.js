// 全局状态管理
import { createPinia } from "pinia";
import { defineStore } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia();
// pinia.use(piniaPluginPersistedstate)

export const useChatStore = defineStore("chat", {
  state: () => ({

    // 一级采单
    firstMenu: 'convertion',

    // 当前会话 null 表示新会话, string 表示会话title
    currentChat: null,

    // 当前会话的sessionId
    currentSessionId: null,

   
    // 聊天记录
    /**
     * [{title:"用户输入内容前6个字符",data:[]}, sessionId: "1234567890"]
     */
    chatHistory: [],

  }),

  actions: {
    setCurrentSessionId(sessionId) {
      this.currentSessionId = sessionId
    },

    setCurrentChat(chat) {
      this.currentChat = chat
    },

    
    setFirstMenu(menu) {
      this.firstMenu = menu
    },
    addChatHistory(data) {
      console.log(typeof this.chatHistory);
      this.chatHistory.push({...data,sessionId: this.currentSessionId});
    },

    setChatHistoryBySessionId(data) {
      console.log(this.currentSessionId,"------------");
      let findIndex = this.chatHistory.findIndex(item=>item.sessionId === this.currentSessionId);
      if(findIndex === -1){
        this.chatHistory[findIndex].data = data;
      }
    },
    delChatHistoryBySessionId(sessionId) {
      this.chatHistory = this.chatHistory.filter(item => item.sessionId !== sessionId);
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
        this.currentChat = null;
      }
    },
    clearHistory() {
      this.chatHistory = []
    }
  },

  // 添加持久化
  persist: true
});

export default pinia;
