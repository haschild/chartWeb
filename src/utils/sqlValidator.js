import { Parser } from 'node-sql-parser';

export class SQLValidator {
  constructor() {
    this.parser = new Parser();
  }

  validate(sql) {
    try {
      const ast = this.parser.parse(sql);
      return {
        isValid: true,
        error: null,
        ast: ast
      };
    } catch (error) {
      return {
        isValid: false,
        error: {
          message: this.formatErrorMessage(error),
          line: error.line,
          column: error.column,
          details: error.message
        }
      };
    }
  }

  formatErrorMessage(error) {
    // 自定义错误消息格式化
    const msg = error.message.toLowerCase();
    
    // 常见错误的中文提示
    if (msg.includes('expected identifier')) {
      return '缺少标识符（可能是列名或表名）';
    }
    if (msg.includes('unexpected token')) {
      return '语法错误：意外的标记';
    }
    if (msg.includes('unexpected end of input')) {
      return 'SQL 语句不完整';
    }
    
    return error.message;
  }

  // SQL 格式化方法
  formatSQL(sql) {
    try {
      const ast = this.parser.parse(sql);
      return {
        formatted: this.parser.stringify(ast),
        error: null
      };
    } catch (error) {
      return {
        formatted: sql,
        error: error.message
      };
    }
  }
}

// 测试代码
function testValidator() {
  const validator = new SQLValidator();
  
  // 测试正确的 SQL
  const validSQL = "SELECT * FROM users WHERE id = 1;";
  console.log('Testing valid SQL:', validSQL);
  console.log('Result:', validator.validate(validSQL));

  // 测试错误的 SQL
  const invalidSQL = "SELEC * FORM users";  // 故意的拼写错误
  console.log('Testing invalid SQL:', invalidSQL);
  console.log('Result:', validator.validate(invalidSQL));
}

// testValidator();  // 注释掉测试代码