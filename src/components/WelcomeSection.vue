<template>
  <div class="welcome-section">
    <div class="welcome-header">
      <h2>欢迎使用 SQL 助手</h2>
      <p class="subtitle">请选择以下功能开始使用</p>
    </div>
    

  </div>
</template>

<script setup>
import { Document, Connection } from '@element-plus/icons-vue'
</script>

<style scoped>
.welcome-section {
  padding: 2rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-header {
  margin-bottom: 2rem;
}

.welcome-header h2 {
  font-size: 1.8rem;
  color: var(--el-text-color-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--el-text-color-secondary);
  font-size: 1rem;
}

</style> 