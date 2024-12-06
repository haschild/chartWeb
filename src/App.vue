<template>
  <div class="app-container">
    <div class="sidebar">
      <el-button 
        class="new-chat-btn" 
        type="primary" 
        @click="startNewChat"
      >
        <el-icon><Plus /></el-icon>
        新对话
      </el-button>
      <!-- 其他侧边栏内容 -->
    </div>
    
    <div class="main-content">
      <ChatContent ref="chatContentRef" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ChatContent from './components/ChatContent.vue'

const chatContentRef = ref(null)

const startNewChat = () => {
  chatContentRef.value?.resetChat()
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 260px;
  padding: 1rem;
  border-right: 1px solid var(--el-border-color-lighter);
}

.new-chat-btn {
  width: 100%;
  justify-content: flex-start;
  padding-left: 1.5rem;
}

.main-content {
  flex: 1;
}
</style>