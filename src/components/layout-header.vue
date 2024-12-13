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

const activeIndex = ref("convertion");
const emit = defineEmits(['select'])
const handleSelect = (key, keyPath) => {
  emit('select', key)
}
</script>

<style scoped>
.el-menu--horizontal{
    justify-content: center;
}
</style>
