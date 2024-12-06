<template>
  <div :class="['message', message.type]">
    <el-avatar 
      :size="40" 
      :icon="message.type === 'user' ? User : Monitor"
    />
    <div class="message-content">
      <template v-if="message.type === 'user'">
        {{ message.content }}
      </template>
      <template v-else>
        <div class="ai-response">
          <div class="response-text">{{ message.content.text }}</div>
          <div v-if="message.content.sqltext" class="sql-block">
            <div class="sql-header">
              <span class="sql-icon">
                <el-icon><Document /></el-icon>
              </span>
              <span>sql</span>
              <el-button 
                class="copy-btn" 
                type="primary" 
                link 
                size="small"
                @click="copySql(message.content.sqltext)"
              >
                复制
              </el-button>
            </div>
            <pre class="sql-code"><code v-html="highlightSql(message.content.sqltext)"></code></pre>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { User, Monitor, Document } from '@element-plus/icons-vue'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import { ElMessage } from 'element-plus'

// 注册SQL语言
hljs.registerLanguage('sql', sql)

defineProps({
  message: {
    type: Object,
    required: true
  }
})

const highlightSql = (code) => {
  return hljs.highlight(code, { language: 'sql' }).value
}

const copySql = async (sql) => {
  try {
    await navigator.clipboard.writeText(sql)
    ElMessage.success('SQL已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.message {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content {
  background: var(--el-bg-color-page);
  padding: 0.8rem;
  border-radius: 8px;
  max-width: 70%;
}

.message.user .message-content {
  background: var(--el-color-primary-light-9);
}

.sql-block {
  margin-top: 1rem;
  background: #1e1e1e;
  border-radius: 6px;
  overflow: hidden;
}

.sql-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sql-code {
  margin: 0;
  padding: 1rem;
  color: #fff;
  font-family: monospace;
}

:deep(.hljs-keyword) {
  color: #569cd6;
}

:deep(.hljs-string) {
  color: #ce9178;
}

:deep(.hljs-number) {
  color: #b5cea8;
}
</style> 