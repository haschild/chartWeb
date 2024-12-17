import express from 'express';
import cors from 'cors';
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// 1. JSON格式响应的接口 (POST)
app.post('/sqlai/api/sql/translate', (req, res) => {
    const { sql, prompt } = req.body;
    console.log('Received request:', { sql, prompt });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('session-id', "11111111");
    const responseData = {
        code:1,
            data: {
                result: "这是AI的回复内容，将会逐字发送。",
                postgresqlSql: "SELECT * FROM example_table WHERE condition = true;"
            },
            message: "success"
    };

    res.json(responseData);
});

// 2. 事件流格式的接口 (GET)
app.get('/sqlai/stream/ora2pg/ddlconvert', (req, res) => {
    // 从 query 参数获取数据
    const { sql } = req.query;

    // 设置 SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    res.write('data:[2014-16-12 15:22:22] DEBUG: Sending COPY bulk output directly to PostgreSQ\n\n');
    // 发送结束标记
    res.write('data:@done文件名.sql;命令执行完毕，退出码：0\n\n');
    res.end();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});