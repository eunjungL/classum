# 설치
## 파일 설치
1. git을 통해 파일 다운
2. 필요한 패키지 설치
```typescript
npm install
```
## DB 설정
### 데이터베이스 생성
1. development 환경용 DB `classum_dev`
2. production 환경용 DB `classum_production`

두 데이터 베이스 모두 생성

### 테이블 생성
`/sql` 디렉토리 내부에 들어있는 파일을 사용, mysql에서 `source`를 사용해 테이블 생성
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
---
# 추가 설명
## 게시글 상태 표시
1. 새로운 상태가 생길 때마다 게시글 상태를 변경한다.
    1. 생기자마자 0
    2. 수정되면 1
    3. 댓글이 달리면 2
2. Post 상세 보기를 할 때마다 `post_read` 테이블에 읽은 상태를 추가 한다. `read_state` 
    1. 읽은 상태 == 게시글 상태
        
        Ex) 수정됐을 때 읽으면 1, 댓글이 달렸을 때 읽으면 2
        
3. post 목록을 불러 올 때 읽은 상태와 게시글 상태를 비교한다.

| 게시글 상태 | 읽은 상태 | 표시할 상태 |
| --- | --- | --- |
| 0 | 0 | X |
| 1 | 0 | 1 |
| 1 | 1 | X |
| 1 | 2 | 1 |
| 2 | 0 | 2 |
| 2 | 1 | 2 |
| 2 | 2 | X |
| 0 | X | 0 |
| 1 | X | 0 |
| 2 | X | 0 |
