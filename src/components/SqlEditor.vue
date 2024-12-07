<template>
  <div class="sql-editor-container" ref="editorContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, toRaw } from 'vue'
import * as monaco from 'monaco-editor'
import { debounce } from 'lodash-es'
import { SQLValidator } from '../utils/sqlValidator';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: [String, Number],
    default: '400px'
  },
  resizable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const editorContainer = ref(null)
const editor = ref(null)

// 在 createEditor 函数之前定义
const handleContentChange = debounce((value) => {
  emit('update:modelValue', value)
  emit('change', value)
}, 300)

const sqlValidator = new SQLValidator();

// 修改验证函数
const validateSQL = (text) => {
  if (!text.trim()) return [];
  
  const validator = new SQLValidator();
  const result = validator.validate(text);
  
  if (!result.isValid) {
    return [{
      severity: monaco.MarkerSeverity.Error,
      message: result.error.message,
      startLineNumber: result.error.line || 1,
      startColumn: result.error.column || 1,
      endLineNumber: result.error.line || 1,
      endColumn: (result.error.column || 1) + 1
    }];
  }
  
  return [];
}

// 创建编辑器实例
const createEditor = () => {
  if (!editorContainer.value) return

  // 配置 Monaco Editor
  monaco.languages.register({ id: 'sql' })
  monaco.languages.setMonarchTokensProvider('sql', {
    keywords: [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
      'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX', 'VIEW',
      'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
      'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT', 'RIGHT', 'INNER'
    ],
    operators: [
      '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
      '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%'
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    
    tokenizer: {
      root: [
        [/[a-zA-Z_]\w*/, { 
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/[0-9]+/, 'number'],
        [/"/, 'string', '@string_double'],
        [/'/, 'string', '@string_single'],
        [/--.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
      ],
      string_double: [
        [/[^"]+/, 'string'],
        [/"/, 'string', '@pop']
      ],
      string_single: [
        [/[^']+/, 'string'],
        [/'/, 'string', '@pop']
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment']
      ]
    }
  })

  monaco.languages.setLanguageConfiguration('sql', {
    brackets: [
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    surroundingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  })

  // 配置 SQL 语言特性
  monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: () => {
      const suggestions = [
        // DML (数据操作语言)
        {
          label: 'SELECT',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'SELECT ${1:*} FROM ${2:table_name}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '查询数据'
        },
        {
          label: 'INSERT INTO',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'INSERT INTO ${1:table_name} (${2:columns}) VALUES (${3:values})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '插入数据'
        },
        {
          label: 'UPDATE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'UPDATE ${1:table_name} SET ${2:column} = ${3:value} WHERE ${4:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '更新数据'
        },
        {
          label: 'DELETE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'DELETE FROM ${1:table_name} WHERE ${2:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '删除数据'
        },

        // DDL (数据定义语言)
        {
          label: 'CREATE TABLE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'CREATE TABLE ${1:table_name} (\n\t${2:column_name} ${3:data_type}${4:(size)} ${5:constraints}\n)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '创建新表'
        },
        {
          label: 'ALTER TABLE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'ALTER TABLE ${1:table_name}\n${2|ADD COLUMN,MODIFY COLUMN,DROP COLUMN|} ${3:column_name} ${4:data_type}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '修改表结构'
        },
        {
          label: 'DROP TABLE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'DROP TABLE ${1:table_name}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '删除表'
        },

        // 条件和运算
        {
          label: 'WHERE',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'WHERE ${1:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '条件筛选'
        },
        {
          label: 'AND',
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: 'AND ${1:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '逻辑与'
        },
        {
          label: 'OR',
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: 'OR ${1:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '逻辑或'
        },
        {
          label: 'IN',
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: 'IN (${1:value1}, ${2:value2})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '在指定的值列表中'
        },
        {
          label: 'BETWEEN',
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: 'BETWEEN ${1:value1} AND ${2:value2}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '在指定的范围内'
        },
        {
          label: 'LIKE',
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: 'LIKE ${1:pattern}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '模式匹配'
        },

        // 聚合函数
        {
          label: 'COUNT',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'COUNT(${1:*})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '计数'
        },
        {
          label: 'SUM',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'SUM(${1:column})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '求和'
        },
        {
          label: 'AVG',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'AVG(${1:column})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '平均值'
        },
        {
          label: 'MAX',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'MAX(${1:column})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '最大值'
        },
        {
          label: 'MIN',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'MIN(${1:column})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '最小值'
        },

        // 分组和排序
        {
          label: 'GROUP BY',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'GROUP BY ${1:column}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '分组'
        },
        {
          label: 'HAVING',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'HAVING ${1:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '分组条件'
        },
        {
          label: 'ORDER BY',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'ORDER BY ${1:column} ${2|ASC,DESC|}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '排序'
        },

        // 连接
        {
          label: 'JOIN',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'JOIN ${1:table} ON ${2:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '内连接'
        },
        {
          label: 'LEFT JOIN',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'LEFT JOIN ${1:table} ON ${2:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '左连接'
        },
        {
          label: 'RIGHT JOIN',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'RIGHT JOIN ${1:table} ON ${2:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '右连接'
        }
      ];

      return { suggestions };
    }
  })

  editor.value = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,            // 编辑器的初始内容
    language: 'sql',                    // 设置语言为SQL
    theme: 'vs-dark',                   // 使用暗色主题
    minimap: { enabled: true },         // 启用右侧小地图
    automaticLayout: true,              // 自动调整布局
    fontSize: 14,                       // 字体大小
    lineNumbers: 'on',                  // 显示行号
    scrollBeyond: false,                // 禁止滚动超过最后一行
    roundedSelection: false,            // 禁用圆角选择
    padding: { top: 5 },                // 编辑器内容上方填充
    suggestOnTriggerCharacters: true,   // 在触发字符时显示建议
    wordWrap: 'on',                     // 启用自动换行

    // 滚动条配置
    scrollbar: {
      vertical: 'visible',              // 显示垂直滚动条
      horizontal: 'visible',            // 显示水平滚动条
      useShadows: false,               // 禁用滚动条阴影
      verticalScrollbarSize: 10,       // 垂直滚动条宽度
      horizontalScrollbarSize: 10      // 水平滚动条高度
    },

    // 尺寸配置
    dimension: {
      height: typeof props.height === 'number' ? props.height : parseInt(props.height),
    },

    fixedOverflowWidgets: false,        // 溢出部件不固定
    mouseWheelZoom: true,               // 允许使用鼠标滚轮缩放
    manualHeight: true,                 // 允许手动调整高度
    dragAndDrop: true,                  // 启用拖放功能
    formatOnType: true,                 // 输入时自动格式化
    formatOnPaste: true,                // 粘贴时自动格式化

    // 语义高亮配置
    semanticHighlighting: {
      enabled: true                     // 启用语义高亮
    },

    colorDecorators: true,              // 启用颜色装饰器
    glyphMargin: true,                  // 显示字形边距
    bracketPairColorization: { 
      enabled: true                     // 启用括号对着色
    },

    // 代码参考线配置
    guides: {
      bracketPairs: true,               // 显示括号对参考线
      indentation: true                 // 显示缩进参考线
    },

    contextmenu: true,                  // 启用右键菜单

    // 快速建议配置
    quickSuggestions: {
      other: true,                      // 其他情况下显示建议
      comments: true,                   // 注释中显示建议
      strings: true                     // 字符串中显示建议
    },
    quickSuggestionsDelay: 0,           // 建议显示延迟时间

    // 建议配置
    suggest: {
      snippetsPreventQuickSuggestions: true,  // 使用代码片段时阻止快速建议
      showKeywords: true,               // 显示关键字建议
      showSnippets: true,               // 显示代码片段建议
      showUsers: true,                  // 显示用户建议
      showMethods: true,                // 显示方法建议
      preview: true,                    // 启用建议预览
      previewMode: 'prefix',            // 预览模式为前缀
      filterGraceful: true,             // 启用优雅的过滤
      localityBonus: true,              // 本地建议优先
      shareSuggestSelections: true,     // 共享建议选择
      showIcons: true,                  // 显示建议图标
      maxVisibleSuggestions: 12,        // 最大可见建议数
      insertMode: 'insert'              // 插入模式
    },

    // 基于单词的建议配置
    wordBasedSuggestions: true,         // 启用基于单词的建议
    wordBasedSuggestionsOnlySameLanguage: true,  // 仅显示相同语言的单词建议

    // 参数提示配置
    parameterHints: {
      enabled: true                     // 启用参数提示
    },

    tabSize: 2,                         // 制表符��小
    autoClosingBrackets: 'always',      // 自动闭合括号
    autoClosingQuotes: 'always',        // 自动闭合引号
    autoSurround: 'quotes',             // 自动环绕引号

    // SQL 特定配置
    'sql.format.enable': true,          // 启用 SQL 格式化
    'sql.format.linesBetweenQueries': 2,// SQL 查询之间的空行数
    'sql.validate.enable': true,        // 启用 SQL 验证
  })

  // 注册 hover provider
  monaco.languages.registerHoverProvider('sql', {
    provideHover: (model, position) => {
      // 获取当前行的错误标记
      const markers = monaco.editor.getModelMarkers({ resource: model.uri })
        .filter(marker => {
          return marker.startLineNumber <= position.lineNumber &&
                 marker.endLineNumber >= position.lineNumber &&
                 marker.startColumn <= position.column &&
                 marker.endColumn >= position.column
        })

      if (markers.length > 0) {
        // 构建悬停提示内
        const contents = markers.map(marker => ({
          value: `${marker.severity === monaco.MarkerSeverity.Error ? '❌ Error' : '⚠️ Warning'}: ${marker.message}`
        }))

        return {
          contents: contents,
          range: {
            startLineNumber: markers[0].startLineNumber,
            startColumn: markers[0].startColumn,
            endLineNumber: markers[0].endLineNumber,
            endColumn: markers[0].endColumn
          }
        }
      }
      return null
    }
  })

  // 添加格式化命令
  toRaw(editor.value).addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
    const validator = new SQLValidator();
    const text = toRaw(editor.value).getValue();
    const { formatted, error } = validator.formatSQL(text);
    
    if (!error) {
      toRaw(editor.value).setValue(formatted);
    }
  });

  // 在 createEditor 函数中修改验证器的调用方式
  const model = toRaw(editor.value).getModel();
  if (model) {
    // 使用防抖处理验证
    const debouncedValidate = debounce(() => {
      const text = model.getValue();
      const errors = validateSQL(text);
      
      // 设置错误标记
      monaco.editor.setModelMarkers(model, 'sql', errors);
    }, 300);

    // 监听内容变化
    model.onDidChangeContent(() => {
      debouncedValidate();
    });

    // 初始验证
    debouncedValidate();
  }

  // 添加格式化操作到右键菜单
  toRaw(editor.value).addAction({
    id: 'format-sql',
    label: '格式化 SQL',
    contextMenuGroupId: 'modification',
    run: () => {
      const validator = new SQLValidator();
      const text = toRaw(editor.value).getValue();
      const { formatted, error } = validator.formatSQL(text);
      
      if (!error) {
        toRaw(editor.value).setValue(formatted);
      }
    }
  });

  // 添加辅助函数来获取装��器类名
  const getDecorationClass = (severity) => {
    switch (severity) {
      case monaco.MarkerSeverity.Error:
        return 'sql-error-decoration'
      case monaco.MarkerSeverity.Warning:
        return 'sql-warning-decoration'
      default:
        return 'sql-info-decoration'
    }
  }

  const getGlyphClass = (severity) => {
    switch (severity) {
      case monaco.MarkerSeverity.Error:
        return 'sql-error-glyph'
      case monaco.MarkerSeverity.Warning:
        return 'sql-warning-glyph'
      default:
        return 'sql-info-glyph'
    }
  }

  // 内容变化处理
  toRaw(editor.value).onDidChangeModelContent(() => {
    const value = toRaw(editor.value).getValue()
    handleContentChange(value)
  })

  // 添加大小调整监听器
  const resizeObserver = new ResizeObserver(() => {
    if (editor.value) {
      toRaw(editor.value).layout()
    }
  })

  resizeObserver.observe(editorContainer.value)

  // 在组件销毁时清理
  onBeforeUnmount(() => {
    resizeObserver.disconnect()
  })
}

// 监听 modelValue 变化
// watch(() => props.modelValue, (newValue) => {
//   if (editor.value && newValue !== toRaw(editor.value).getValue()) {
//     toRaw(editor.value).setValue(newValue)
//   }
// })

onMounted(() => {
  createEditor()
})

onBeforeUnmount(() => {
  if (editor.value) {
    toRaw(editor.value).dispose()
  }
})

// 暴露方法给组件
defineExpose({
  setValue: (value) => {
    if (editor.value) {
      toRaw(editor.value).setValue(value || '')
    }
  },
  getValue: () => {
    return editor.value ? toRaw(editor.value).getValue() : ''
  }
})
</script>

<style scoped>
.sql-editor-container {
  width: 100%;
  height: v-bind('typeof props.height === "number" ? props.height + "px" : props.height');
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  resize: v-bind(props.resizable ? 'vertical' : 'none');
  min-height: 100px;
}

:deep(.monaco-editor) {
  padding: 8px 0;
}

:deep(.monaco-editor .overflow-guard) {
  border-radius: 4px;
}

/* 添加错误和警告装饰器样式 */
:deep(.sql-error-decoration) {
  border-bottom: 2px solid #ff0000;
}

:deep(.sql-warning-decoration) {
  border-bottom: 2px solid #ffa500;
}

:deep(.sql-error-glyph) {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="%23ff0000"/><path d="M8 3v7" stroke="white" stroke-width="2"/><circle cx="8" cy="12.5" r="1" fill="white"/></svg>') center center no-repeat;
  margin-left: 5px;
}

:deep(.sql-warning-glyph) {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 1l7 14H1z" fill="%23ffa500"/><path d="M8 6v5" stroke="white" stroke-width="2"/><circle cx="8" cy="13" r="1" fill="white"/></svg>') center center no-repeat;
  margin-left: 5px;
}

/* 添加拖动手柄的样式 */
:deep(.monaco-editor .monaco-editor-background) {
  resize: vertical;
  min-height: 100px;
}
</style> 