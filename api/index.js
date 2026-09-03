const express = require('express');
const app = express();

app.use(express.json());

// 1. 서라벌고등학교 실시간 급식 조회 API (교육부 나이스 연동)
app.get('/api/meal', async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const ymd = `${year}${month}${day}`;

        // 서울특별시교육청(B10) - 서라벌고등학교(7010536)
        const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010536&MLSV_YMD=${ymd}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('NEIS API Server Error');
        }

        const data = await response.json();

        let lunch = "오늘 점심 정보가 없습니다.";
        let dinner = "오늘 저녁 정보가 없습니다.";

        if (data && data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
            const meals = data.mealServiceDietInfo[1].row;

            meals.forEach(meal => {
                if (meal.DDISH_NM) {
                    const cleanMenu = meal.DDISH_NM
                        .replace(/<br\/>/g, '\n')
                        .replace(/\([0-9.]+\)/g, '') // 알레르기 수치 번호 정제
                        .trim();

                    if (meal.MMEAL_SC_CODE === '2') {
                        lunch = cleanMenu;
                    } else if (meal.MMEAL_SC_CODE === '3') {
                        dinner = cleanMenu;
                    }
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

// 2. 아이디 / 닉네임 중복확인 API
app.post('/api/check-duplicate', async (req, res) => {
    const { field, value } = req.body;

    if (!field || !value) {
        return res.status(400).json({ available: false, message: "잘못된 요청 파라미터입니다." });
    }

    try {
        res.json({ available: true, message: `사용 가능한 ${field === 'username' ? '아이디' : '닉네임'}입니다.` });
    } catch (error) {
        res.status(500).json({ available: false, message: "서버 처리 중 에러가 발생했습니다." });
    }
});

// 3. 회원가입 API
app.post('/api/register', async (req, res) => {
    try {
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "회원가입 처리 실패" });
    }
});

// 4. 로그인 API
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    try {
        res.json({
            success: true,
            user: { username: username, nickname: "서라벌고학생" }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "로그인 처리 실패" });
    }
});

// 5. 게시글 목록 API
app.get('/api/posts', async (req, res) => {
    try {
        res.json([]);
    } catch (error) {
        res.status(500).json({ error: "게시글 목록 불러오기 실패" });
    }
});

module.exports = app;
