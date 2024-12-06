<template>
  <div class="menu-container">
    <div class="menu-header">
      <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
      <span class="title">豆包</span>
    </div>
    
    <el-menu
      class="menu-list"
      :default-active="activeIndex"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-menu-item index="1">
        <el-icon><ChatLineRound /></el-icon>
        <span>新对话</span>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><Monitor /></el-icon>
        <span>AI 搜索</span>
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><Edit /></el-icon>
        <span>帮我写作</span>
      </el-menu-item>
      <el-menu-item index="4">
        <el-icon><Picture /></el-icon>
        <span>图像生成</span>
      </el-menu-item>
      <el-menu-item index="5">
        <el-icon><Reading /></el-icon>
        <span>AI 阅读</span>
      </el-menu-item>
      <el-menu-item index="6">
        <el-icon><Service /></el-icon>
        <span>语音通话</span>
      </el-menu-item>
    </el-menu>

    <div class="menu-footer">
      <el-button type="primary" class="start-btn">
        开始行动
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChatLineRound, Monitor, Edit, Picture, Reading, Service } from '@element-plus/icons-vue'

const activeIndex = ref('1')
</script>

<style scoped>
.menu-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #545c64;
  color: white;
}

.menu-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.menu-list {
  flex: 1;
  border-right: none;
}

.menu-footer {
  padding: 20px;
}

.start-btn {
  width: 100%;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-menu-item.is-active) {
  background-color: #434a50 !important;
}

:deep(.el-menu-item:hover) {
  background-color: #434a50 !important;
}
</style>