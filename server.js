// ... existing code ...
import express from 'express';
import cors from 'cors';
const app = express();
const port = 8080;
// ... rest of the code remains the same ...

app.use(cors());
app.use(express.json());

app.post('/sqlai/api/sql/translate', (req, res) => {
    const { sql, prompt } = req.body;
    console.log('Received request:', { sql, prompt });

    // 设置 SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // 模拟响应数据
    const responseData = {
        type: 'ai',
        content: {
            text: '这是AI的回复内容，将会逐字发送。',
            sqltext: sql || 'SELECT * FROM example_table WHERE condition = true;'
        }
    };

    // 逐字发送 text 内容
    for(let char of responseData.content.text) {
        const chunk = {
            type: 'ai',
            content: {
                text: char,
                sqltext: responseData.content.sqltext
            }
        };
        
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    // 发送结束标记
    res.write('data: [DONE]\n\n');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Test URL: http://localhost:${port}/api/chat`);
});