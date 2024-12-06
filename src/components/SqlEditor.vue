<template>
  <div class="sql-editor-container" ref="editorContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, toRaw } from 'vue'
import * as monaco from 'monaco-editor'
import { Parser } from 'node-sql-parser'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const editorContainer = ref(null)
const editor = ref(null)
const parser = new Parser({
  database: 'mysql'
})

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
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
        // SQL 关键字
        ...['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
          'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX', 'VIEW',
          'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
          'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT', 'RIGHT', 'INNER'
        ].map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          detail: 'SQL Keyword',
          documentation: getSQLKeywordDoc(keyword) // 添加关键字文档说明
        })),
        
        // SQL 函数
        ...['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CONCAT', 'SUBSTRING',
          'UPPER', 'LOWER', 'DATE', 'NOW', 'CAST', 'COALESCE'
        ].map(func => ({
          label: func,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: func + '($0)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'SQL Function',
          documentation: getSQLFunctionDoc(func) // 添加函数文档说明
        })),

        // 常用SQL片段
        {
          label: 'sel-basic',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'SELECT ${1:columns}\nFROM ${2:table}\nWHERE ${3:condition}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Basic SELECT statement',
          documentation: 'Basic SELECT query template'
        },
        {
          label: 'join-basic',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'SELECT ${1:columns}',
            'FROM ${2:table1} t1',
            'JOIN ${3:table2} t2 ON t1.${4:id} = t2.${5:id}',
            'WHERE ${6:condition}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Basic JOIN statement',
          documentation: 'Basic JOIN query template'
        }
      ]
      return { suggestions }
    }
  })

  // 添加关键字文档说明函数
  function getSQLKeywordDoc(keyword) {
    const docs = {
      'SELECT': 'Used to select data from a database\n\nExample:\nSELECT column1, column2 FROM table_name',
      'WHERE': 'Used to filter records\n\nExample:\nWHERE age >= 18',
      'JOIN': 'Used to combine rows from two or more tables\n\nExample:\nJOIN table2 ON table1.id = table2.id',
      // ... 添加更多关键字文档
    }
    return docs[keyword] || keyword
  }

  // 添加函数文档说明函数
  function getSQLFunctionDoc(func) {
    const docs = {
      'COUNT': 'Returns the number of rows\n\nExample:\nCOUNT(*) or COUNT(column)',
      'SUM': 'Returns the sum of a numeric column\n\nExample:\nSUM(column)',
      'AVG': 'Returns the average value of a numeric column\n\nExample:\nAVG(column)',
      // ... 添加更多函数文档
    }
    return docs[func] || func
  }

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
    semanticHighlighting: true,
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
    autoSurround: 'quotes'
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

  // 使用防抖处理内变化
  const handleContentChange = debounce((value) => {
    emit('update:modelValue', value)
    emit('change', value)
  }, 300)

  // 创建一个独立的验证函数
  const validateSQL = (text) => {
    const errors = []
    
    if (!text.trim()) {
      return errors
    }

    try {
      const ast = parser.parse(text)
      console.log('SQL AST:', JSON.stringify(ast, null, 2))
      
      // 增强语义检查
      if (Array.isArray(ast)) {
        ast.forEach((statement, index) => {
          // 检查 SELECT *
          if (statement.type === 'select') {
            const columns = statement.columns
            if (columns.length === 1 && columns[0].expr.type === 'star') {
              errors.push({
                startLineNumber: statement.location?.start?.line || 1,
                endLineNumber: statement.location?.end?.line || 1,
                startColumn: statement.location?.start?.column || 1,
                endColumn: statement.location?.end?.column || 2,
                message: 'Warning: Using SELECT * is not recommended. Consider specifying columns explicitly.',
                severity: monaco.MarkerSeverity.Warning
              })
            }

            // 检查 FROM 子句
            if (statement.from) {
              statement.from.forEach(table => {
                // 暂时注释掉表名检查
                /*
                if (table.table && table.table.includes('.')) {
                  errors.push({
                    startLineNumber: statement.location?.start?.line || 1,
                    endLineNumber: statement.location?.end?.line || 1,
                    startColumn: statement.location?.start?.column || 1,
                    endColumn: statement.location?.end?.column || text.length,
                    message: 'Error: Invalid table name in FROM clause',
                    severity: monaco.MarkerSeverity.Error
                  })
                }
                */
              })
            }
          }

          // 检查缺少 WHERE 子句
          if (['update', 'delete'].includes(statement.type) && !statement.where) {
            errors.push({
              startLineNumber: statement.location?.start?.line || 1,
              endLineNumber: statement.location?.end?.line || 1,
              startColumn: statement.location?.start?.column || 1,
              endColumn: statement.location?.end?.column || text.length + 1,
              message: `Warning: ${statement.type.toUpperCase()} statement without WHERE clause could affect all rows`,
              severity: monaco.MarkerSeverity.Warning
            })
          }

          // 检查 JOIN 条件
          if (statement.type === 'select' && statement.from) {
            statement.from.forEach(table => {
              if (table.join && !table.on) {
                errors.push({
                  startLineNumber: table.location?.start?.line || 1,
                  endLineNumber: table.location?.end?.line || 1,
                  startColumn: table.location?.start?.column || 1,
                  endColumn: table.location?.end?.column || text.length + 1,
                  message: 'Error: JOIN must have ON condition',
                  severity: monaco.MarkerSeverity.Error
                })
              }
            })
          }
        })
      }
    } catch (e) {
      console.error('Parse error:', e)
      const errorMessage = e.message
      const posMatch = errorMessage.match(/line\s+(\d+):\s*(\d+)/)
      const line = posMatch ? parseInt(posMatch[1]) : 1
      const column = posMatch ? parseInt(posMatch[2]) : 1

      errors.push({
        startLineNumber: line,
        endLineNumber: line,
        startColumn: column,
        endColumn: column + 1,
        message: `SQL Syntax Error: ${errorMessage}`,
        severity: monaco.MarkerSeverity.Error
      })
    }

    return errors
  }

  // 创建模型并设置验证器
  const model = toRaw(editor.value).getModel()
  if (model) {
    // 使用防抖进行验证
    const debouncedValidate = debounce(() => {
      const text = model.getValue()
      const errors = validateSQL(text)
      
      // 设置错误标记
      monaco.editor.setModelMarkers(model, 'sql', errors)

      // 添加错误装饰器
      const errorDecorations = errors.map(error => ({
        range: new monaco.Range(
          error.startLineNumber,
          error.startColumn,
          error.endLineNumber,
          error.endColumn
        ),
        options: {
          isWholeLine: false,
          className: error.severity === monaco.MarkerSeverity.Error ? 'sql-error-decoration' : 'sql-warning-decoration',
          glyphMarginClassName: error.severity === monaco.MarkerSeverity.Error ? 'sql-error-glyph' : 'sql-warning-glyph',
          hoverMessage: { value: error.message },
          minimap: {
            color: error.severity === monaco.MarkerSeverity.Error ? '#ff0000' : '#ffa500',
            position: 1
          },
          glyphMarginHoverMessage: { value: error.message },
          overviewRuler: {
            color: error.severity === monaco.MarkerSeverity.Error ? '#ff0000' : '#ffa500',
            position: monaco.editor.OverviewRulerLane.Right
          }
        }
      }))

      // 应用装饰器
      toRaw(editor.value).deltaDecorations([], errorDecorations)
    }, 300)

    // 监听内容变化
    model.onDidChangeContent(() => {
      debouncedValidate()
    })

    // 初始验证
    debouncedValidate()
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
    editor.value.dispose()
  }
})

// 暴露方法给父组件
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

/* 添错误和警告装饰器样式 */
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