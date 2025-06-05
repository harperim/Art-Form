# Porting Manual
## 🛠️ 1. 사용 도구

| 항목         | 도구                         |
| ------------ | ---------------------------- |
| 코드 에디터  | Visual Studio Code (v1.99.3) |
| 이슈 관리    | Jira                         |
| 형상 관리    | GitLab                       |
| 커뮤니케이션 | Notion, MatterMost           |
| 디자인 협업  | Figma                        |
| 빌드 도구    | Expo CLI                     |
| 라우팅       | Expo Router (~4.0.19)        |
| 상태 관리    | Zustand (5.0.3)              |
| 네트워크 통신 |	Axios (v1.4.0)            |

## ⚙️ 2. 개발 환경
### ✔️ Frontend
| 기술  | 버전 |
| --- | --- |
| Node.js                  | v20.11.1                 |
| Expo SDK	               | 52.0.0                   |
| React Native             | 0.76.9                   |
| React                    | 19.0.0                   |
| TypeScript               | 5.8.2                    |
| Zustand                  | 5.0.3                    |
| Expo Router              | ~4.0.19                  |
| React Native (with Expo) | 0.76.9, Expo SDK 52 기반 |
| Axios                    | 1.4.0                    |

### ✔️ Backend

| 기술 | 버전 |
| --- | --- |
| Spring | 3.4.3 |
| JDK | 17 |
| JWT | 0.11.5 |
| AWS SDK | 2.31.7 |
| FastAPI | 0.115.12 |

### ✔️ Server

| 구성 요소 | 상세 정보 |
|-----------|------------|
| Jenkins | 2.492.2 |
| Docker | 28.0.1 |
| Nginx | 1.27.4 |

### ✔️ Database

| 기술 | 버전 |
|------|------|
| PostgreSQL | 17.4 |
| Redis | 7.4.2 |

## 🔐 3. 환경변수 형태
### 📍 Backend
- `backend/artform/.env`
```
REPO_URL=https://lab.ssafy.com/s12-ai-image-sub1/S12P21D103.git

SERVER_PORT=8081
SERVER_DOMAIN=j12d103.p.ssafy.io
DB_PORT=5432
DB_NAME=artform_core
DB_USERNAME=artform
DB_PASSWORD=d103GumiSsafy!@

BUCKET_NAME=artform-data
ACCESS_KEY_ID=**REPLACE_WITH_YOUR_ACCESS_KEY_ID**
SECRET_ACCESS_KEY=**REPLACE_WITH_YOUR_SECRET_ACCESS_KEY**

MQ_PORT=5672
MQ_NAME=artform
MQ_PASS=1234

JWT_SECRET=**REPLACE_WITH_YOUR_JWT_SECRET**

USER_SERVICE_URL=http://j12d103.p.ssafy.io:8082
```

- `backend/artform/.env`
```
REPO_URL=https://lab.ssafy.com/s12-ai-image-sub1/S12P21D103.git

SERVER_PORT=8082
SERVER_DOMAIN=j12d103.p.ssafy.io
DB_PORT=5433
DB_NAME=artform_user
DB_USERNAME=artform
DB_PASSWORD=d103GumiSsafy!@

REDIS_HOST=j12d103.p.ssafy.io
REDIS_PORT=6379
JWT_SECRET=**REPLACE_WITH_YOUR_JWT_SECRET**


; MQ_PORT=5672
; MQ_NAME=artform
; MQ_PASS=1234

CORE_URL=https://j12d103.p.ssafy.io:8081
```

## 4. 로컬 실행
### ✔️ 백엔드 (Spring Boot 서버)
#### 1. 경로 이동  
`S12P21D103\backend\artform-core` 및 `S12P21D103\backend\artform-user`

#### 2. .env 환경변수 설정 가이드
- 아래 목록을 참고하여 필요한 환경변수를 선택하여 작성  
#### 📦 공통 설정
| 변수명           | 설명 |
|------------------|------|
| `REPO_URL`        | jenkins에서 프로젝트를 clone 하기 위한 프로젝트 레포지토리 경로 |
| `SERVER_PORT`     | 서버 포트 번호 |
| `SERVER_DOMAIN`   | 배포 서버 도메인 주소 |
| `DB_PORT`         | PostgreSQL 포트 |
| `DB_NAME`         | PostgreSQL 데이터베이스 이름 |
| `DB_USERNAME`     | PostgreSQL 사용자 이름 |
| `DB_PASSWORD`     | PostgreSQL 비밀번호 |
| `JWT_SECRET`      | JWT 토큰 검증용 비밀 키 |
| `MQ_PORT`         | RabbitMQ 포트 |
| `MQ_NAME`         | RabbitMQ 사용자 이름 |
| `MQ_PASS`         | RabbitMQ 비밀번호 |


#### ⚙️ Core Server 설정
| 변수명               | 설명 |
|----------------------|------|
| `BUCKET_NAME`         | AWS S3 버킷 이름 |
| `ACCESS_KEY_ID`       | AWS S3 접근 키 |
| `SECRET_ACCESS_KEY`   | AWS S3 비밀 접근 키 |
| `USER_SERVICE_URL`    | 유저 서버 주소 (유저 정보 관련 연동용) |

#### 👤 User Server 설정
| 변수명           | 설명 |
|------------------|------|
| `REDIS_HOST`      | Redis 컨테이너 이름 |
| `REDIS_PORT`      | Redis 포트 |
| `REDIS_PASSWORD`  | Redis 비밀번호 |

#### 🧪 .env 예시 파일
```
REPO_URL=https://lab.ssafy.com/s12-ai-image-sub1/S12P21D103.git

SERVER_PORT=8081
SERVER_DOMAIN=j12d103.p.ssafy.io
DB_PORT=5432
DB_NAME=artform_core
DB_USERNAME=artform
DB_PASSWORD=d103GumiSsafy!@

BUCKET_NAME=artform-data
ACCESS_KEY_ID=**REPLACE_WITH_YOUR_ACCESS_KEY_ID**
SECRET_ACCESS_KEY=**REPLACE_WITH_YOUR_SECRET_ACCESS_KEY**

MQ_PORT=5672
MQ_NAME=artform
MQ_PASS=1234

JWT_SECRET=**REPLACE_WITH_YOUR_JWT_SECRET**
USER_SERVICE_URL=http://j12d103.p.ssafy.io:8082
```

#### 3. 빌드
```
./gradlew build 
```

#### 4. 실행
```
docker compose up --build -d
```

#### 5. 실행 확인
```
docker ps
docker logs -f <컨테이너 이름>
```

### ✔️ 프론트엔드 
#### 1️⃣ 의존성 설치

```bash
npm install
```

- package.json에 명시된 모든 의존성 패키지를 설치합니다.
- 프로젝트 최초 세팅 시 1회 실행합니다.

#### 2️⃣ 실행 및 배포 가이드 (Expo 기반)

####  2.1 개발 서버 실행

```bash
npm run start
```

또는

```bash
expo start
```

- Expo 개발 서버를 실행합니다.
- QR 코드를 통해 Android/iOS 기기에서 앱을 실행할 수 있습니다.  


####  2.2 캐시 초기화 후 실행 (선택)

```bash
npm run start:clear
```

- 캐시를 초기화한 후 Expo 개발 서버를 재시작합니다.
- 실행 오류나 의존성 문제 해결 시 유용합니다.
- Linting & Formatting 작업을 실행합니다.

