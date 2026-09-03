const express = require('express');
const app = express();

app.use(express.json());

// 서라벌고 나이스 실시간 급식 API
app.get('/api/meal', async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const ymd = `${year}${month}${day}`;

        const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010536&MLSV_YMD=${ymd}`;

        const response = await fetch(url);
        const data = await response.json();

        let lunch = "오늘 점심 정보가 없습니다.";
        let dinner = "오늘 저녁 정보가 없습니다.";

        if (data.mealServiceDietInfo && data.mealServiceDietInfo[1].row) {
            const meals = data.mealServiceDietInfo[1].row;

            meals.forEach(meal => {
                const cleanMenu = meal.DDISH_NM
                    .replace(/<br\/>/g, '\n')
                    .replace(/\([0-9.]+\)/g, '')
                    .trim();

                if (meal.MMEAL_SC_CODE === '2') {
                    lunch = cleanMenu;
                } else if (meal.MMEAL_SC_CODE === '3') {
                    dinner = cleanMenu;
                }
            });
        }

        res.json({ lunch, dinner });
    } catch (error) {
        res.status(500).json({
            lunch: "급식 정보를 불러오는 중 오류가 발생했습니다.",
            dinner: "급식 정보를 불러오는 중 오류가 발생했습니다."
        });
    }
});

app.post('/api/check-duplicate', async (req, res) => {
    const { field, value } = req.body;
    if (!field || !value) {
        return res.status(400).json({ available: false, message: "잘못된 요청입니다." });
    }

    try {
        res.json({ available: true, message: `사용 가능한 ${field === 'username' ? '아이디' : '닉네임'}입니다.` });
    } catch (error) {
        res.status(500).json({ available: false, message: "서버 오류가 발생했습니다." });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "회원가입 처리 중 오류가 발생했습니다." });
    }
});

app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    try {
        res.json({
            success: true,
            user: { username: username, nickname: "서라벌고학생" }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "로그인 처리 중 오류가 발생했습니다." });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        res.json([]);
    } catch (error) {
        res.status(500).json({ error: "게시글 목록을 불러오지 못했습니다." });
    }
});

module.exports = app;