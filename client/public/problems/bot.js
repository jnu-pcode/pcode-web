const puppeteer = require('puppeteer');
const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydb',
  password: '1234',
  port: 5432,
});

async function checkSubmissions() {
  const { rows } = await pool.query(
    "SELECT * FROM problem_submissions WHERE checked = false"
  );
  for (const submission of rows) {
    // 문제 환경 URL에 payload 반영
    const url = `http://localhost:3000/problems/xss-steal-cookie.html?payload=${encodeURIComponent(submission.answer)}`;
    const isFlagged = await visitPageAndCheck(url);
    // 결과 업데이트
    await pool.query(
      "UPDATE problem_submissions SET is_correct = $1, checked = true WHERE id = $2",
      [isFlagged, submission.id]
    );
    if (isFlagged) {
      // 정답 처리(서버에 API 호출)
      await axios.post('http://localhost:3001/api/problems/mark-correct', {
        user_id: submission.user_id,
        problem_id: submission.problem_id
      });
    }
  }
}

async function visitPageAndCheck(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // 플래그 쿠키를 더 이상 심지 않음
  // await page.setCookie({ ... });
  let flagged = false;
  // alert로 플래그가 노출되는지 감지 (flag{...} 형식만 허용)
  page.on('dialog', async dialog => {
    if (/^flag\{.*\}$/.test(dialog.message())) {
      flagged = true;
    }
    await dialog.dismiss();
  });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 3000));
  await browser.close();
  return flagged;
}

// 주기적으로 실행
setInterval(checkSubmissions, 10000);
console.log('관리자 봇이 서버 연동 모드로 실행 중입니다.'); 