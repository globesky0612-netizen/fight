const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 讓後端伺服器可以直接讀取並顯示名為 "public" 資料夾內的檔案
app.use(express.static('public'));

const TP_TOKEN = "dca5fbaa8f73b53dd3de8909a7e167e4"; 

app.get('/api/search-flights', async (req, res) => {
    try {
        const { origin, date } = req.query; 
        
        // 設定基本的 API 請求參數
        let apiParams = {
            origin: origin,
            currency: 'TWD',
            limit: 10,
            token: TP_TOKEN
        };

        // 如果前端有傳送日期過來，就加入參數中
        if (date) {
            apiParams.beginning_of_period = date;
            console.log(`收到請求：尋找從 ${origin} 出發，日期為 ${date} 的機票`);
        } else {
            console.log(`收到請求：尋找從 ${origin} 出發的近期特價機票`);
        }

        const response = await axios.get('https://api.travelpayouts.com/v2/prices/latest', {
            params: apiParams
        });

        const flightData = response.data.data;
        
        if (!flightData || flightData.length === 0) {
            return res.json({ message: '目前沒有找到該時段的特價機票' });
        }

        res.json(flightData);

    } catch (error) {
        console.error("API 呼叫失敗:", error.message);
        res.status(500).json({ error: '獲取航班失敗' });
    }
});

// 為了雲端部署，Port 必須支援環境變數
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 伺服器已運行於 port ${PORT}`));
