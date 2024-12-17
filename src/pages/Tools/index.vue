<template>
  <div class="chat-container">
    

    <el-card class="tools-card" >

      <el-form inline>
        <el-form-item label="Type">
          <el-select
            style="width: 200px; margin-right: 10px"
            v-model="type"
            placeholder="请选择"
            @change="handleTypeChange"
          >
            <el-option label="数据同步" value="COPY" />
            <el-option label="表(约束、索引)" value="TABLE" />
            <el-option label="视图" value="VIEW" />
            <el-option label="INSERT语句" value="INSERT" />
            <el-option label="序列" value="SEQUENCE" />
            <el-option label="函数" value="FUNCTION" />
            <el-option label="存储过程" value="PROCEDURE" />
          </el-select>

          <el-button 
            type="primary" 
            @click="handleConvert"
            :loading="isConverting"
          >确定</el-button>
        </el-form-item>

        <el-form-item label="fileName" v-if="type !== 'COPY'">
          <el-input v-model="fileName" style="width: 200px; margin-right: 10px" ></el-input>
          <el-button type="primary" @click="downloadFile">下载</el-button>
        </el-form-item>
      </el-form>

      <pre class="tools-card-text" v-text="outputText"></pre>
    </el-card>

   
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { http } from '@/utils/request';

const type = ref('TABLE');
const fileName = ref('');
const outputText = ref('');
const isConverting = ref(false);

const downloadFile = () => {
  const downloadUrl = `/sqlai/api/download?fileName=${encodeURIComponent(fileName.value)}`;
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName.value; // 指定下载文件名
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const handleTypeChange = (value) => {
  type.value = value;
  fileName.value = '';
  outputText.value = '';
};

const handleConvert = async () => {
  try {
    isConverting.value = true;
    outputText.value = ''; // 清空之前的输出
    
    await http.stream('/stream/ora2pg/ddlconvert', {
      ddlType: type.value
    }, {
      onMessage: (data) => {
        outputText.value += data + '\n';
      },
      onFileName: (name) => {
        fileName.value = name;
      },
      onDone: () => {
        console.log('转换完成');
        isConverting.value = false;
      },
      onError: (error) => {
        console.error('转换错误:', error);
        isConverting.value = false;
      }
    });
  } catch (error) {
    console.error('请求错误:', error);
    isConverting.value = false;
  }
};
</script>

<style lang="scss">
.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .tools-card {
    height: 100%;
    margin: 0 auto;
    width: 1200px;
    margin-bottom: 30px;
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
