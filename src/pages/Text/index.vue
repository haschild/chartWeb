<template>
  <div class="chat-container">
    <!-- 欢迎界面  - 聊天界面-->
    <div  class="chat-main" ref="chatMainRef">
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

    <el-card class="tools-card" >

      <el-form inline>
        <el-form-item label="Type">
          <el-select
            style="width: 200px; margin-right: 10px"
            v-model="type"
            placeholder="请选择"
          >
            <el-option label="数据同步" value="COPY" />
            <el-option label="表(约束、索引)" value="TABLE" />
            <el-option label="视图" value="VIEW" />
            <el-option label="INSERT语句" value="INSERT" />
            <el-option label="序号" value="SEQUENCE" />
            <el-option label="函数" value="FUNCTION" />
            <el-option label="存储过程" value="PROCEDURE" />
          </el-select>

          <el-button type="primary">确定</el-button>
        </el-form-item>

        <el-form-item label="fileName">
          <el-input
            style="width: 200px; margin-right: 10px"
            v-model="fileName"
          ></el-input>
          <el-button type="primary">下载</el-button>
        </el-form-item>
      </el-form>

      <pre class="tools-card-text">
            1. 请输入表名
            2. 请输入表名
            3. 请输入表名
            4. 请输入表名
            5. 请输入表名
            6. 请输入表名
            7. 请输入表名
            8. 请输入表名
            9. 请输入表名
            10. 请输入表名
          </pre
      >
    </el-card>

    <!-- 输入区域 -->
    <el-card
      
      style="width: 800px; margin: 0 auto"
    >
      <!-- SQL专业版功能区域 -->
      <div v-if="showSqlEditor" class="sql-pro-section">
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
          :placeholder="inputPlaceholder"
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
import {
  Picture,
  Promotion,
  Paperclip,
  Microphone,
  RefreshRight,
} from "@element-plus/icons-vue";
import WelcomeSection from "@/components/WelcomeSection.vue";
import ChatMessage from "@/components/ChatMessage.vue";
import SqlEditor from "@/components/SqlEditor.vue";
import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 接收父组件传递的参数 -- props
const props = defineProps({
  firstMenu: {
    type: String,
    default: "convertion",
  },
});
const chatHistory = ref([]);
const inputText = ref("");
const loading = ref(false);
const showSqlEditor = computed(() => props.firstMenu === "convertion");
const sqlInput = ref("");
const sqlEditorRef = ref(null);
const chatMainRef = ref(null);

const inputPlaceholder = computed(() => {
  return showSqlEditor.value
    ? "请描述您的SQL转换需求..."
    : "输入 @ 或 / 选择技能...";
});

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

  chatHistory.value.push({
    type: "ai",
    loading: true,
    content: {
      text: "正在思考...",
      sqltext: "",
    },
  });

  await nextTick();
  scrollToBottom();

  try {
    const response = await request.post("/api/sql/translate", {
      data: {
        sql: sqlInput.value,
        prompt: inputText.value,
      },
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "text/event-stream",
      },
    });

    chatHistory.value.pop();
    chatHistory.value.push({
      type: "ai",
      content: {
        text: response.data.result,
        sqltext: response.data.postgresqlSql,
      },
    });

    await nextTick();
    scrollToBottom();
  } catch (error) {
    chatHistory.value.pop();
    console.error("Error:", error);
    ElMessage.error("发送失败，请重试");
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
  showSqlEditor.value = true;
};

// 暴��重置方法给父组件
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
