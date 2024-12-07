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
      return {
        suggestions: [
          {
            label: 'SELECT',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'SELECT ${1:columns} FROM ${2:table}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '查询数据'
          },
          // 创建相关
          {
            label: 'CREATE TABLE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'CREATE TABLE ${1:table_name} (\n\t${2:column_name} ${3:data_type}${4: constraints}\n)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建新表'
          },
          {
            label: 'CREATE INDEX',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'CREATE INDEX ${1:index_name} ON ${2:table_name} (${3:column_name})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建索引'
          },
          // 修改相关
          {
            label: 'UPDATE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'UPDATE ${1:table_name} SET ${2:column_name} = ${3:value} WHERE ${4:condition}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '更新数据'
          },
          {
            label: 'ALTER TABLE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'ALTER TABLE ${1:table_name} ${2:ADD|MODIFY|DROP} ${3:column_name} ${4:data_type}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '修改表结构'
          },
          // 删除相关
          {
            label: 'DELETE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'DELETE FROM ${1:table_name} WHERE ${2:condition}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '删除数据'
          },
          {
            label: 'DROP TABLE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'DROP TABLE ${1:table_name}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '删除表'
          },
          {
            label: 'DROP INDEX',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'DROP INDEX ${1:index_name} ON ${2:table_name}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '删除索引'
          },
          // 插入相关
          {
            label: 'INSERT',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'INSERT INTO ${1:table_name} (${2:columns}) VALUES (${3:values})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '插入数据'
          },
          // 约束相关
          {
            label: 'PRIMARY KEY',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'PRIMARY KEY (${1:column_name})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '主键约束'
          },
          {
            label: 'FOREIGN KEY',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'FOREIGN KEY (${1:column_name}) REFERENCES ${2:parent_table}(${3:parent_column})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '外键约束'
          },
          // 条件相关
          {
            label: 'WHERE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'WHERE ${1:condition}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '条件筛选'
          },
          {
            label: 'GROUP BY',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'GROUP BY ${1:column_name}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '分组'
          },
          {
            label: 'ORDER BY',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'ORDER BY ${1:column_name} ${2:ASC|DESC}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '排序'
          }
        ]
      };
    }
  })

  editor.value = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: 'sql',
    theme: 'vs-dark',
    minimap: { enabled: true },
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyond: false,
    roundedSelection: false,
    padding: { top: 5 },
    suggestOnTriggerCharacters: true,
    wordWrap: 'on',
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    },
    formatOnType: true,
    formatOnPaste: true,
    semanticHighlighting: {
      enabled: true
    },
    colorDecorators: true,
    glyphMargin: true,
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    contextmenu: true,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    parameterHints: {
      enabled: true
    },
    tabSize: 2,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoSurround: 'quotes',
    'sql.format.enable': true,
    'sql.format.linesBetweenQueries': 2,
    'sql.validate.enable': true,
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

  // 添加辅助函数来获取装饰器类名
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
  height: 200px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
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
</style> 