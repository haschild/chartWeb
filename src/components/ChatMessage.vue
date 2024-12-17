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
          <div v-if="message.loading" class="loading-animation">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <template v-else>
            <div class="response-text" v-html="renderMarkdown(message.content.text ||'暂无数据返回')"></div>
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
          </template>
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
import MarkdownIt from 'markdown-it'

// 注册SQL语言
hljs.registerLanguage('sql', sql)

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
})

// 添加 markdown 渲染函数
const renderMarkdown = (text) => {
  return md.render(text || '')
}

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
  overflow: auto;
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

.response-text :deep(p) {
  margin: 0.5em 0;
}

.response-text :deep(pre) {
  background-color: #f6f8fa;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}

.response-text :deep(code) {
  font-family: monospace;
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.response-text :deep(ul), 
.response-text :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.response-text :deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
}

.loading-animation {
  display: flex;
  gap: 4px;
  padding: 8px;
}

.loading-animation span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-animation span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-animation span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
}
</style> 