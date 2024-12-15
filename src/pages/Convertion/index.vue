<template>
      <el-aside >
        <ConvertionMenu></ConvertionMenu>
      </el-aside>
      <el-main>
        <ChatContent :firstMenu="'convertion'" ref="chatContentRef" />
      </el-main>
</template>

<script setup>
import ChatContent from "./ChatContent.vue";
import ConvertionMenu from "./convertion-menu.vue";
</script>
