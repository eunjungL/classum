# 설치
## 파일 설치
1. git을 통해 파일을 다운
2. 필요한 패키지 설치
```typescript
npm install
```
## DB 설정
### 데이터베이스 생성
1. development 환경용 DB `classum_dev`
2. production 환경용 DB `classum_production`

### 테이블 생성
`/sql` 디렉토리 내부에 들어있는 파일을 사용해 mysql에서 `source`를 사용해 테이블 생성
(**두 개의 데이터베이스에 모두 생성**)
1. user
2. space
3. spaceRole
4. participation
5. post
6. chat

순으로 생성
### `app.module.ts` 설정
```typescript
    TypeOrmModule.forRoot({
        type: 'mysql',
        host: '-', // mysql 설정에 맞게 변경
        port: 3306,
        username: '-', // mysql 설정에 맞게 변경
        password: '-', // mysql 설정에 맞게 변경
        database: process.env.DATABASE,
        entities: [User, Space, SpaceRole, Participation, Post, Chat, PostRead],
        synchronize: false,
    })
```
---
# 실행 방법
## Development 환경 
```typescript
npm run start:dev
```
## Production 환경
```typescript
npm run start
```
## API 명세서
- 자세한 실행 방법은 다음 링크를 참고해주세요.
[classum 1차 과제 API 명세](https://documenter.getpostman.com/view/13577383/UVyvwv3A)