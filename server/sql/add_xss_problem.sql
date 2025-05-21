-- Add XSS Challenge Problem
INSERT INTO problems (title, description, category, difficulty, points)
VALUES (
    E'XSS 마스터가 되어보자!',
    E'이 웹사이트는 사용자 입력을 검증하지 않고 있습니다. 관리자의 쿠키를 탈취해보세요!\n\n힌트: <script> 태그를 사용해보세요.',
    'web',
    1,
    100
); 