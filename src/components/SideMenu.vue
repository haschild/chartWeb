<template>
  <el-menu
    :collapse="isCollapse"
    :collapse-transition="false"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    class="side-menu"
  >
    <el-menu-item index="1">
      <el-icon><Search /></el-icon>
      <template #title>搜索</template>
    </el-menu-item>
    <el-menu-item index="2">
      <el-icon><Document /></el-icon>
      <template #title>文档</template>
    </el-menu-item>
    <el-menu-item index="3">
      <el-icon><Files /></el-icon>
      <template #title>项目</template>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon><Clock /></el-icon>
      <template #title>历史记录</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { Search, Document, Files, Clock } from '@element-plus/icons-vue'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.side-menu {
  height: 100%;
  border-right: none;
}

.side-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style> 