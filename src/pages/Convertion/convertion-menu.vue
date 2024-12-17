<template>

    
    <el-menu
      :default-active="activeIndex"
      :collapse="isCollapse"
      :default-openeds="['historyChat']"
      class="convertion-menu"
      background-color="#f5f5f5"
      @select="handleSelect"
      >
      
      <el-menu-item index="newChat">
        <el-icon><ChatLineRound /></el-icon>
        <template #title>新对话</template>
      </el-menu-item>

      <el-sub-menu index="historyChat" >
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>历史对话</span>
        </template>

        <template v-if="chatHistoryList.length>0">
          <el-menu-item 
            v-for="(item, index) in chatHistoryList" 
            :index="item.title" 
            :key="item.title+index"
            class="history-item"
          >
            <div class="history-content">
              <span>{{item.title}}</span>
              <el-icon 
                class="delete-icon"
                @click.stop="handleDelete(item.sessionId)"
              >
                <Delete />
              </el-icon>
            </div>
          </el-menu-item>
        </template>
        
      </el-sub-menu>
      
      
    </el-menu>

</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useChatStore } from '@/store'
import { Delete } from '@element-plus/icons-vue'

const chatStore = useChatStore()

const activeIndex = ref("newChat")
chatStore.setCurrentChat("newChat");


const chatHistoryList = computed(() => useChatStore().chatHistory);

const handleSelect = (index) => {
  console.log(index, "handleSelect");
  
  // 如果是新对话
  if (index === 'newChat' || index === 'noHistory') {
    chatStore.setCurrentChat("newChat");
    chatStore.setCurrentSessionId(null);
    return;
  }

  // 查找对应的历史会话
  const selectedChat = chatHistoryList.value.find(item => item.title === index);
  if (selectedChat) {
    // 设置当前会话和 sessionId
    chatStore.setCurrentChat(index);
    chatStore.setCurrentSessionId(selectedChat.sessionId);
  }
};

const handleDelete = (sessionId) => {
  useChatStore().delChatHistoryBySessionId(sessionId);

 nextTick(() => {
  if(chatStore.chatHistory.length==0){
    chatStore.setCurrentChat("newChat");
  }
 })
}

</script>

<style>

.convertion-menu{
  width: 260px;
  height: calc(100vh - 60px);
}

.history-item {
  .history-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .delete-icon {
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;
      
      &:hover {
        color: var(--el-color-danger);
      }
    }
  }

  &:hover {
    .delete-icon {
      opacity: 1;
    }
  }
}

</style>