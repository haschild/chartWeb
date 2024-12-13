<template>
  <el-container style="height: 100%;">
    <el-header><LayoutHeader @select="handleSelect"></LayoutHeader></el-header>
    <el-container style="height: calc(100% - 60px)">
      <el-aside v-if="firstMenu === 'convertion'" width="200px">
        <LayoutMenu></LayoutMenu>
      </el-aside>
      <el-container>
        <ChatContent :firstMenu="firstMenu" ref="chatContentRef" />
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from "vue";
import ChatContent from "./components/ChatContent.vue";
import LayoutMenu from "./components/layout-menu.vue";
import LayoutHeader from "./components/layout-header.vue";
const chatContentRef = ref(null);

let firstMenu = ref('convertion');

const startNewChat = () => {
  chatContentRef.value?.resetChat();
};

const handleSelect = (key) => {
  firstMenu.value = key;
  console.log(firstMenu.value)
}
</script>

<style scoped>
.el-footer {
  height: 30px;
}
</style>
