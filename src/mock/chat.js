// 修改模拟数据结构
export const mockChatResponse = {
  code: 200,
  data: {
    content: {
      text: "我已经帮你将 Oracle SQL 转换为 MySQL SQL。主要变更：\n1. 修改了序列语法\n2. 调整了日期函数\n3. 替换了 Oracle 特有的函数\n\n你可以复制下面的 SQL 直接在 MySQL 中使用：",
      sqltext: `SELECT o.order_id,
       c.customer_name,
       o.total_amount,
       -- 使用窗口函数计算排名，按客户分组，按订单金额降序排
       RANK() OVER (PARTITION BY c.customer_name ORDER BY o.total_amount DESC) AS amount_rank,
       -- 使用窗口函数计算累计金额，按客户分组
       SUM(o.total_amount) OVER (PARTITION BY c.customer_name ORDER BY o.order_date, o.order_id) AS running_total
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;`
    },
    type: 'text',
    timestamp: Date.now()
  },
  message: 'success'
}

// 修改提示语列表
export const mockPrompts = [
  {
    icon: 'Document',
    text: 'Oracle 序列转换为 MySQL 自增'
  },
  {
    icon: 'Message',
    text: 'Oracle 日期函数转换为 MySQL'
  },
  {
    icon: 'Monitor',
    text: 'Oracle 分析函数转 MySQL 窗口函数'
  },
  {
    icon: 'User',
    text: 'Oracle 存储过程转换为 MySQL'
  }
] 