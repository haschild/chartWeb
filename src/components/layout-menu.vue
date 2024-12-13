<template>
  <div class="menu-container">
    
    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
      <el-radio-button :label="false">展开</el-radio-button>
      <el-radio-button :label="true">收起</el-radio-button>
    </el-radio-group>
    <el-menu
      :default-active="activeIndex"
      :collapse="isCollapse"
      :default-openeds="['2']">
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

  </div>
</template>

<script setup>
import { ref } from 'vue'


const activeIndex = ref('1')
const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>

</style>