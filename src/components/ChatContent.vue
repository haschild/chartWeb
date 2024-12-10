<template>
  <div class="chat-container">
    <div class="chat-main" ref="chatMainRef">
      <WelcomeSection
        v-if="!chatHistory.length"
      />
     
      <div v-else class="chat-history">
        <div v-for="(message, index) in chatHistory" 
             :key="index" 
             class="message-wrapper">
          <ChatMessage :message="message" />
        </div>
      </div>
    </div>

    <!-- SQL专业版功能区域 -->
    <el-card  style="width: 50%; margin: 0 auto">
    <div v-if="showSqlEditor" class="sql-pro-section">
      <!-- SQL编辑器 -->
        <div class="section-title">SQL编辑器</div>
        <SqlEditor
          v-model="sqlInput"
          @change="handleSqlChange"
          ref="sqlEditorRef"
        />

      <!-- 提示词区域 -->
        <div class="section-title" style="margin-top: 10px;">常用提示词：
          <el-button type="primary"  v-for="prompt in prompts"
            :key="prompt.id"
            size="small"
            plain
            @click="applyPrompt(prompt)">{{prompt.label}}</el-button>
        </div>
      </div>

    <div class="chat-input-area">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          :placeholder="inputPlaceholder"
          @keyup.enter.ctrl="sendMessage"
          resize="none"
        />
        <div class="action-buttons">
          <div class="right-actions">


            <el-button
              icon="Position" 
              circle 
              :loading="loading"
              type="primary"
              @click="sendMessage"
            >
            </el-button>
          </div>
        </div>
    </div>
  </el-card>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { 
  Picture, 
  Promotion, 
  Paperclip, 
  Microphone,
  RefreshRight
} from '@element-plus/icons-vue'
import WelcomeSection from './WelcomeSection.vue'
import ChatMessage from './ChatMessage.vue'
import SqlEditor from './SqlEditor.vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const chatHistory = ref([])
const inputText = ref('')
const loading = ref(false)
const showSqlEditor = ref(true)
const sqlInput = ref('')
const sqlEditorRef = ref(null)
const chatMainRef = ref(null)

const inputPlaceholder = computed(() => {
  return showSqlEditor 
    ? '请描述您的SQL转换需求...' 
    : '输入 @ 或 / 选择技能...'
})

const prompts = [
  {
    id: 5,
    label: '继续优化',
    text: '请继续优化SQL语句，使其更高效。'
  }
]


const handleSqlChange = debounce((value) => {
  sqlInput.value = value
}, 300)

const applyPrompt = (prompt) => {
  inputText.value = prompt.text;
}

const sendMessage = async () => {
  if ((!inputText.value.trim() && !sqlInput.value.trim()) || loading.value) return
  
  loading.value = true
  
  const messageContent = inputText.value || sqlInput.value

  chatHistory.value.push({
    type: 'user',
    content: messageContent
  })
  
  chatHistory.value.push({
    type: 'ai',
    loading: true,
    content: {
      text: '正在思考...',
      sqltext: ''
    }
  })
  
  await nextTick()
  scrollToBottom()
  
  try {
    const response = await request({
      url: '/api/sql/translate',
      method: 'POST',
      data: {
        sql: sqlInput.value,
        prompt: inputText.value
      }
    })

    chatHistory.value.pop()
    chatHistory.value.push({
      type: 'ai',
      content: {
        text: response.data.result,
        sqltext: response.data.postgresqlSql
      }
    })
    
    await nextTick()
    scrollToBottom()
    
  } catch (error) {
    chatHistory.value.pop()
    console.error('Error:', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    loading.value = false
    inputText.value = ''
  }
}

const scrollToBottom = () => {
  const chatMain = chatMainRef.value
  if (chatMain) {
    chatMain.scrollTop = chatMain.scrollHeight
  }
}

// 添加 resetChat 函数定义
const resetChat = () => {
  chatHistory.value = []
  inputText.value = ''
  sqlInput.value = ''
  if (sqlEditorRef.value) {
    sqlEditorRef.value.setValue('')
  }
  showSqlEditor.value = true;
}

// 暴露重置方法给父组件
defineExpose({
  resetChat
})

// 添加防抖函数
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
</script>

<style scoped>
.chat-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-main {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.sql-pro-section {
  border-top: 1px solid var(--el-border-color-lighter);
  padding: 1rem;
  padding-bottom: 0;
  background-color: var(--el-bg-color-page);
}

.section-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}




.chat-input-area {
  border: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  background-color: transparent;
  border-radius: 8px;
}
.chat-input-area:hover {
  border: 1px solid var(--el-border-color-lighter);
}

.input-wrapper {
  flex:1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 10px 16px;

}

:deep(.el-textarea__inner) {
  border: none;
  padding: 8px 0;
  min-height: 24px !important;
  resize: none;
  box-shadow: none;
  font-size: 14px;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: none;
}


 .right-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}


:deep(.el-button--primary) {
  padding: 8px 16px;
  height: 32px;
  border-radius: 6px;
}
</style> 