<template>
  <div class="chat-container">
 

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

  </div>
</template>

<script setup>

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
