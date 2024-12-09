<template>
  <div class="chat-container">
    <div class="chat-main">
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
    <div v-if="showSqlEditor" class="sql-pro-section">
      <!-- SQL编辑器 -->
      <div class="sql-editor-wrapper">
        <div class="section-title">SQL编辑器</div>
        <SqlEditor
          v-model="sqlInput"
          @change="handleSqlChange"
          ref="sqlEditorRef"
        />
      </div>

      <!-- 提示词区域 -->
      <div class="prompt-suggestions">
        <div class="section-title">常用提示词</div>
        <div class="prompt-items">
          <el-button
            v-for="prompt in prompts"
            :key="prompt.id"
            size="small"
            @click="applyPrompt(prompt)"
          >
            {{ prompt.label }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="input-wrapper">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          :placeholder="inputPlaceholder"
          @keyup.enter.ctrl="sendMessage"
        />
        <div class="input-footer">
          <el-button 
            type="primary" 
            :icon="Promotion"
            :loading="loading"
            @click="sendMessage"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Picture, Promotion } from '@element-plus/icons-vue'
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

const inputPlaceholder = computed(() => {
  return showSqlEditor 
    ? '请描述您的SQL转换需求...' 
    : '输入 @ 或 / 选择技能...'
})

const prompts = [
  {
    id: 1,
    label: 'Oracle转Postgresql',
    text: '请将Oracle 语句转换为Postgresql语句，并解释主要的改动点。'
  },
  {
    id: 2,
    label: 'MySQL转Postgresql',
    text: '请将MySQL 语句转换为Postgresql语句，并解释主要的改动点。'
  },
  {
    id: 3,
    label: 'SQL美化',
    text: '请帮我格式化和美化SQL语句，使其更易读。'
  },
  {
    id: 4,
    label: 'SQL优化建议',
    text: '请分析SQL语句的性能，并给出优化建议。'
  },
  {
    id: 5,
    label: 'SQL语法检查',
    text: '请检查SQL语句是否存在语法错误或潜在问题。'
  },
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
  
  const messageContent = inputText.value ||sqlInput.value

  chatHistory.value.push({
    type: 'user',
    content: messageContent
  })
  
  try {
    const response = await request({
      url: '/translate',
      method: 'POST',
      data: {
        sql: sqlInput.value,
        prompt: inputText.value
      }
    })

    
    chatHistory.value.push({
      type: 'ai',
      content: {
        text: response.data.result,
        sqltext: response.data.postgresqlSql
      }
    })
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    loading.value = false
    inputText.value = ''
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-main {
  overflow-y: auto;
  padding: 1rem;
}

.sql-pro-section {
  border-top: 1px solid var(--el-border-color-lighter);
  padding: 1rem;
  background-color: var(--el-bg-color-page);
}

.section-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.sql-editor-wrapper {
  margin-bottom: 1rem;
}

.prompt-suggestions {
  margin-bottom: 1rem;
}

.prompt-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chat-input-area {
  border-top: 1px solid var(--el-border-color-lighter);
  padding: 1rem;
}

.input-wrapper {
  position: relative;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
}

</style> 