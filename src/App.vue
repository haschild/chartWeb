<template>
  <el-container style="height: 100%;">
    <el-header><LayoutHeader ></LayoutHeader></el-header>
    <el-container style="height: calc(100% - 60px)">
      <Convertion v-if="firstMenu === 'convertion'"></Convertion>
      <Text v-else-if="firstMenu === 'text'"></Text>
     <Tools v-else-if="firstMenu === 'tools'"></Tools> 
    </el-container>
    <el-footer>Footer</el-footer>
  </el-container>
</template>

<script setup>
import { computed, ref } from "vue";

import LayoutHeader from "@/components/layout-header.vue";
import Text from "@/pages/Text/index.vue";
import Tools from "@/pages/Tools/index.vue";
import Convertion from "@/pages/Convertion/index.vue";
const chatContentRef = ref(null);

import { useChatStore } from "@/store";
const chatStore = useChatStore();
let firstMenu = computed(() => {
  return chatStore.firstMenu
});


const startNewChat = () => {
  chatContentRef.value?.resetChat();
};

</script>

<style scoped>
.el-footer {
  height: 30px;
  position:fixed;
  bottom:0;
  padding-left:300px;
}
</style>
