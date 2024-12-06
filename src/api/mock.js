// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟SQL响应生成器
export const generateSqlResponse = async (input) => {
  await delay(1000) // 模拟网络延迟
  
  // 模拟响应数据
  return {
    text: "根据您的需求，我为您生成了以下SQL查询语句：",
    sqltext: `SELECT name, age
FROM students
WHERE age > 18
ORDER BY age DESC;`
  }
} 