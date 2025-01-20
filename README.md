# 고양이 광장 [BE]

## 1.프로젝트 소개

> 카카오테크 클라우드 네이티브 in Jeju 2기 커뮤니티 과제 <br>
> 개발기간: 2024.11 ~ 진행중 <br>

### 🛠️ Stack

<div style="display:flex;gap:10px;">
    <img src="https://img.shields.io/badge/-Node.js-339933?style=flat&logo=nodedotjs&logoColor=white"/>
    <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=Express&logoColor=white"/>
    <img src="https://img.shields.io/badge/-Amazon RDS-527FFF?style=flat&logo=amazonrds&logoColor=white"/>
    <img src='https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square'>
</div>

### 📚 주요 기능

-   회원기능
    -   유저 회원가입
    -   유저 로그인
    -   유저 정보 조회, 수정, 삭제
    -   유저 로그아웃
-   게시판 기능
    -   게시글 작성,조회,수정,삭제
    -   게시글 좋아요 생성,취소
-   댓글 기능
    -   댓글 작성,조회,수정,삭제

### 📁 프로젝트 구조

```shell
.
├── Controllers #요청한 작업을 처리하고 결과를 반환하는 코드
├── Models #DB와 상호작용하는 코드
├── middlewares #미들웨어로 자주 사용되는 코드(인증/인가)
├── Routes #URL 요청 처리 관련 코드
├── config #설정 관련 코드(데이터베이스 설정)
├── data #DB연결 전 JSON형식으로 데이터 저장할때 사용
├── resource #이미지 저장파일
├── server.js #서버 시작 코드
├── README.md
├── package.json
└── package-lock.json
```

### 🗄️ ERD

![커뮤니티 ERD](https://github.com/user-attachments/assets/9c41a024-7e59-4bac-996d-af0070016fc7)

## 2.실행 방법

2-1. git clone

```shell
git clone https://github.com/100-hours-a-week/2-Leeroy-kim-community-be.git
```

2-2. 루트 디렉토리에 .env 파일 생성

```env
COOKIE_SECRET_KEY=secret-key #쿠키 시크릿 키
CLIENT_URL=URL #클라이언트 주소
BACKEND_URL=URL #백엔드 주소
DB_HOST=HOST #데이터베이스 호스트
DB_USER=admin #데이터베이스 사용자명
DB_PASSWORD=PASSWROD #데이터베이스 비밀번호
DB_NAME=NAME #데이터베이스 이름
DB_PORT=PORT #데이터베이스 포트
```

2-3. 데이터베이스 테이블 생성

```sql
CREATE DATABASE community;
USE community;

CREATE TABLE user(
    user_id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(40) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    nickname VARCHAR(15) NOT NULL,
    profile_img VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE boardInfo(
    board_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    content_img VARCHAR(255),
    board_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP,
    like_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (board_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE boardLike(
    like_id INT NOT NULL AUTO_INCREMENT,
    board_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (like_id),
    FOREIGN KEY (board_id) REFERENCES boardInfo(board_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE comment(
    comment_id INT NOT NULL AUTO_INCREMENT,
    board_id INT NOT NULL,=
    user_id INT NOT NULL,
    comment VARCHAR(255) NOT NULL,
    comment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (board_id) REFERENCES boardInfo(board_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);
```

2-4. 의존성 설치 및 시작

```shell
npm install
node server.js
```

## 💻 프론트엔드 리포지토리

https://github.com/100-hours-a-week/2-Leeroy-kim-community-fe
