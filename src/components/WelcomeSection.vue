<template>
  <div class="welcome-section">
    <div class="welcome-header">
      <h2>欢迎使用 SQL 助手</h2>
      <p class="subtitle">请选择以下功能开始使用</p>
    </div>
    
    <div class="features">
      <div class="feature-group">
        <div class="feature-title">常用功能</div>
        <div class="feature-list">
          <div 
            class="feature-item"
            @click="$emit('feature-click', 'sql-basic')"
          >
            <el-icon><Document /></el-icon>
            <span>SQL转义基础版</span>
          </div>
          <div 
            class="feature-item"
            @click="$emit('feature-click', 'sql-pro')"
          >
            <el-icon><Connection /></el-icon>
            <span>SQL转义专业版</span>
          </div>
        </div>
      </div>
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

.features {
  text-align: left;
}

.feature-group {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 1rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 6px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-5);
}

.feature-item .el-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
  color: var(--el-color-primary);
}

.feature-item span {
  color: var(--el-text-color-primary);
  font-size: 0.95rem;
}
</style> 