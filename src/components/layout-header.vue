<template>
  <el-menu
    :default-active="activeIndex"
    mode="horizontal"
    @select="handleSelect"
  >
    <el-menu-item index="convertion">DML Convertion AI Chat</el-menu-item>
    <el-menu-item index="text">Text To SQL AI Chat</el-menu-item>
    <el-menu-item index="tools">DDL Tools</el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref } from "vue";

// 获取 pinia数据
import { useChatStore } from "@/store";
const chatStore = useChatStore()

const activeIndex = chatStore.firstMenu;
const emit = defineEmits(['select'])
const handleSelect = (key, keyPath) => {
  chatStore.setFirstMenu(key)
}
</script>

<style scoped>
.el-menu--horizontal{
    justify-content: center;
}
</style>
