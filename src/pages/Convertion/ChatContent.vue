<template>
  <div class="chat-container">
    <!-- 欢迎界面  - 聊天界面-->
    <div class="chat-main" ref="chatMainRef">
      <WelcomeSection v-if="!chatHistory.length" />

      <div v-else class="chat-history">
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          class="message-wrapper"
        >
          <ChatMessage :message="message" />
        </div>
      </div>
    </div>


    <!-- 输入区域 -->
    <el-card
      style="width: 800px; margin: 0 auto"
    >
      <!-- SQL专业版功能区域 -->
      <div  class="sql-pro-section">
        <!-- SQL编辑器 -->
        <div class="section-title">SQL编辑器</div>
        <SqlEditor
          v-model="sqlInput"
          @change="handleSqlChange"
          ref="sqlEditorRef"
        />

        <!-- 提示词区域 -->
        <div class="section-title" style="margin-top: 10px">
          常用提示词：
          <el-button
            type="primary"
            v-for="prompt in prompts"
            :key="prompt.id"
            size="small"
            plain
            @click="applyPrompt(prompt)"
            >{{ prompt.label }}</el-button
          >
        </div>
      </div>

      <!-- 用户输入区域 -->
      <div class="chat-input-area">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          :autosize="{ minRows: 3, maxRows: 6 }"
          placeholder="请描述您的SQL转换需求..."
          @keyup.enter.ctrl="sendMessage"
          resize="none"
        />
          <div class="right-actions" title="发送">
            <el-button
              icon="Position"
              circle
              :loading="loading"
              type="primary"
              @click="sendMessage"
            >
            </el-button>
          </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";

import WelcomeSection from "@/components/WelcomeSection.vue";
import ChatMessage from "@/components/ChatMessage.vue";
import SqlEditor from "@/components/SqlEditor.vue";
import {http} from "@/utils/request";
import { ElMessage } from "element-plus";
import { useChatStore } from "@/store";

const chatStore = useChatStore();
const chatHistory = ref([]);
const inputText = ref("");
const loading = ref(false);   
const sqlInput = ref("");
const sqlEditorRef = ref(null);
const chatMainRef = ref(null);



const prompts = [
  {
    id: 5,
    label: "继续优化",
    text: "请继续优化SQL语句，使其更高效。",
  },
];

const handleSqlChange = debounce((value) => {
  sqlInput.value = value;
}, 300);

const applyPrompt = (prompt) => {
  inputText.value = prompt.text;
};

const sendMessage = async () => {
  if ((!inputText.value.trim() && !sqlInput.value.trim()) || loading.value) return;

  loading.value = true;

  const messageContent = inputText.value || sqlInput.value;

  chatHistory.value.push({
    type: "user",
    content: messageContent,
  });

  // 创建初始 AI 消息
  const aiMessage = {
    type: "ai",
    loading: true,
    content: {
      text: "正在思考...",
      sqltext: "",
    },
  };
  chatHistory.value.push(aiMessage);

  await nextTick();
  scrollToBottom();

  try {
    await http.stream("/api/sql/translate", {
      sql: sqlInput.value,
      prompt: inputText.value,
    }, {
      onMessage: (data) => {
        console.log('收到消息:', data);
        if (data?.content) {
          aiMessage.loading = false;
          // 确保内容不为空
          const text = data.content.text || aiMessage.content.text;
          const sqltext = data.content.sqltext || aiMessage.content.sqltext;
          
          // 更新消息内容
          aiMessage.content = {
            text: text,
            sqltext: sqltext,
          };
          
          nextTick(() => scrollToBottom());
        }
      }
    });
  } catch (error) {
    console.error("Error:", error);
    if (aiMessage.loading) {
      chatHistory.value.pop();
    }
    ElMessage.error(error.message || "发送失败，请重试");
  } finally {
    loading.value = false;
    inputText.value = "";
  }
};

const scrollToBottom = () => {
  const chatMain = chatMainRef.value;
  if (chatMain) {
    chatMain.scrollTop = chatMain.scrollHeight;
  }
};

// 添加 resetChat 函数定义
const resetChat = () => {
  chatHistory.value = [];
  inputText.value = "";
  sqlInput.value = "";
  if (sqlEditorRef.value) {
    sqlEditorRef.value.setValue("");
  }
};

// 暴露重置方法给父组件
defineExpose({
  resetChat,
});

// 添加防抖函数
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
</script>

<style lang="scss">
.chat-container {
  
  height: 100%;
  display: flex;
  flex-direction: column;

  .tools-card {
    height: 100%;
  }

  .tools-card .el-card__body {
    height: 100% ;
    display: flex;
    flex-direction: column;
    gap: 16px;
    .tools-card-text {
      flex: 1;
      color: white;
      background-color: #333;
      width: 100%;
      margin: 0;
      padding: 16px;
      overflow-y: auto;
    }
  }

  .chat-main {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .section-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }

  .chat-input-area {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: transparent;
    border-radius: 8px;
  }


  .input-wrapper {
    flex: 1;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 10px 16px;
  }

  :deep(.el-textarea__inner) {
    border: none;
    padding: 8px 0;
    min-height: 24px ;
    resize: none;
    box-shadow: none;
    font-size: 14px;
  }

  :deep(.el-textarea__inner:focus) {
    box-shadow: none;
  }

  .right-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-left: 10px;
  }

  :deep(.el-button--primary) {
    padding: 8px 16px;
    height: 32px;
    border-radius: 6px;
  }
}
</style>
