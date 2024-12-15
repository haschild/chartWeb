<template>

    
    <el-menu
      :default-active="activeIndex"
      :collapse="isCollapse"
      :default-openeds="['2']"
      class="convertion-menu"
      background-color="#f5f5f5"
      >
      
      <el-menu-item index="1">
        <el-icon><ChatLineRound /></el-icon>
        <template #title>新对话</template>
      </el-menu-item>

      <el-sub-menu index="2">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>历史对话</span>
        </template>
        <el-menu-item index="2-1">截取用户输入的前6个字</el-menu-item>
      </el-sub-menu>
      
      
    </el-menu>

</template>

<script setup>
import { ref } from 'vue'


const activeIndex = ref('1')

</script>

<style>

.convertion-menu{
  width: 260px;
  height: calc(100vh - 60px);
}

</style>