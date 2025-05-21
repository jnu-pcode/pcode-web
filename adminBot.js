const puppeteer = require('puppeteer');
const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: 'yourpassword', // 실제 비밀번호로 변경
  port: 5432,
});

async function checkSubmissions() {
  const { rows } = await pool.query(
    "SELECT * FROM problem_submissions WHERE checked = false"
  );
  for (const submission of rows) {
    // 문제 페이지 URL 생성 (예시)
    const url = `http://localhost:3000/problems/xss-challenge.html?payload=${encodeURIComponent(submission.answer)}`;
    const isFlagged = await visitPageAndCheck(url);
    // 결과 업데이트
    await pool.query(
      "UPDATE problem_submissions SET is_correct = $1, checked = true WHERE id = $2",
      [isFlagged, submission.id]
    );
    if (isFlagged) {
      // 정답 처리(예: users 점수 업데이트 등)
      await axios.post('http://localhost:5000/api/problems/mark-correct', {
        user_id: submission.user_id,
        problem_id: submission.problem_id
      });
    }
  }
}

async function visitPageAndCheck(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let flagged = false;
  // 쿠키 세팅 등 필요시 추가
  page.on('dialog', async dialog => {
    if (dialog.message().includes('FLAG{XSS_1s_Fun}')) {
      flagged = true;
    }
    await dialog.dismiss();
  });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(3000);
  await browser.close();
  return flagged;
}

// 주기적으로 실행
setInterval(checkSubmissions, 10000); 