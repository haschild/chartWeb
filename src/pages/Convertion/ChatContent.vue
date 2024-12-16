<template>
  <div class="chat-container" @scroll="handleScroll">
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
    <div class="user-action-card">
      <!-- SQL专业版功能区域 -->
      <div class="sql-pro-section">
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
        <el-button
          class="right-actions"
          title="发送"
          icon="Position"
          circle
          :loading="loading"
          type="primary"
          @click="sendMessage"
        >
        </el-button>
      </div>

      <!-- 添加滚动到底部的按钮 -->
      <el-button
        icon="ArrowDown"
        circle
        v-show="showScrollBottom"
        class="scroll-bottom-btn"
        @click="scrollToBottom"
        type="primary"
      >
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";

import WelcomeSection from "@/components/WelcomeSection.vue";
import ChatMessage from "@/components/ChatMessage.vue";
import SqlEditor from "@/components/SqlEditor.vue";
import { http } from "@/utils/request";
import { ElMessage } from "element-plus";
import { useChatStore } from "@/store";
import { debounce } from "lodash-es";

const chatHistory = ref([]);
// 判断是不是新的会话
const newChatTag = ref(true);

// 编辑区域
const inputText = ref("");
const loading = ref(false);
const sqlInput = ref("");
const sqlEditorRef = ref(null);
const chatMainRef = ref(null);

// 监听useChatStore的值变化
let chatHistoryList = computed(() => useChatStore().chatHistory);

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
  if ((!inputText.value.trim() && !sqlInput.value.trim()) || loading.value)
    return;

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

  try {
    const response = await http.post("/api/sql/translate", {
      sql: sqlInput.value,
      prompt: inputText.value,
    });



    chatHistory.value.pop();

    chatHistory.value.push({
    type: "ai",
    content: {
      text: response.code === 1 ? response.data.result : response.message,
      sqltext: response.code === 1 ? response.data.postgresqlSql : "",
    },
  });

    if (useChatStore().currentChat === "newChat" && newChatTag.value === true) {
      useChatStore().addChatHistory({
        title: (inputText.value || sqlInput.value).slice(0, 5),
        data: chatHistory.value,
      });
      newChatTag.value = false;
    } else {
      useChatStore().setChatHistoryBySessionId(chatHistory.value);
    }

    nextTick(() => scrollToBottom());
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

// 监听会话
const currentChat = computed(() => useChatStore().currentChat);

watch(currentChat, (newVal) => {
  console.log(newVal, "watch currentChat");
  if (newVal === "newChat") {
    newChatTag.value = true;
    useChatStore().setCurrentSessionId(null);
    resetChat();
  }
});

// 添加 resetChat 函数定义
const resetChat = () => {
  chatHistory.value = [];
  inputText.value = "";
  sqlInput.value = "";
  if (sqlEditorRef.value) {
    sqlEditorRef.value.setValue("");
  }
};

// 添加新的 ref
const showScrollBottom = ref(false);
const scrollToBottom = () => {
  const chatContainer = document.querySelector(".chat-container");
  if (chatContainer) {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }
};
// 添加滚动处理函数
const handleScroll = (e) => {
  const container = e.target;
  const scrollDiff =
    container.scrollHeight - container.scrollTop - container.clientHeight;

  // 如果距离底部超过 100px 就显示按钮
  showScrollBottom.value = scrollDiff > 100;
};

// 添加 store 的引用
const store = useChatStore();

// 监听 currentSessionId
watch(
  () => store.currentSessionId,
  (newSessionId) => {
    if (newSessionId) {
      // 找到对应的历史会话
      const currentHistory = chatHistoryList.value.find(
        (item) => item.sessionId === newSessionId
      );
      if (currentHistory) {
        // 加载历史会话数据
        chatHistory.value = currentHistory.data;
        newChatTag.value = false;
      }
    } else {
      // 新会话，重置数据
      resetChat();
      newChatTag.value = true;
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: relative; // 添加这行

  // 对话区域
  .chat-main {
    width: 900px;
    margin: 0 auto;
    margin-bottom: 360px;
  }

  // 用户输入区域
  .user-action-card {
    box-shadow: var(--el-box-shadow-light);
    padding: 20px;
    width: 910px;
    position: fixed;
    bottom: 0;
    left: 280px;
    right: 0;
    margin: 0 auto;
    z-index: 2;
    background-color: white;

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

      .right-actions {
        margin-left: 10px;
        width: 40px;
        height: 40px;
        .el-icon {
          font-size: 20px;
        }
      }
    }
  }

  .scroll-bottom-btn {
    position: absolute;
    right: -50px;
    top: 10px;
    width: 40px;
    height: 40px;

    .el-icon {
      font-size: 20px;
    }
  }
}
</style>
