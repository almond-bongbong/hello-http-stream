# HTTP 스트리밍 데모

이 프로젝트는 Node.js와 Express를 사용한 HTTP 스트리밍 데모 애플리케이션입니다. Server-Sent Events (SSE)를 활용하여 실시간 데이터 스트리밍을 구현했습니다.

## 주요 기능

- 실시간 카운터 업데이트 스트리밍
- 카운터 증가/감소 API 엔드포인트
- CORS 지원
- 비동기 스트림 처리

## 기술 스택

- Node.js
- Express.js
- Server-Sent Events (SSE)

## 시작하기

### 설치

```bash
npm install
```

### 실행

```bash
npm start
```

서버는 기본적으로 `http://localhost:4100`에서 실행됩니다.

## API 엔드포인트

### 카운터 증가

```
POST /increment
Content-Type: application/json

{
  "value": 1
}
```

### 카운터 감소

```
POST /decrement
Content-Type: application/json

{
  "value": 1
}
```

### 실시간 스트림 구독

```
GET /stream
```

스트림은 SSE 형식으로 데이터를 전송합니다:

```
data: {"value": 1}

data: {"value": 2}
...
```

## 클라이언트 예시 코드

```javascript
const eventSource = new EventSource("http://localhost:4100/stream");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("새로운 값:", data.value);
};

// 카운터 증가
fetch("http://localhost:4100/increment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ value: 1 }),
});

// 카운터 감소
fetch("http://localhost:4100/decrement", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ value: 1 }),
});
```

## 주의사항

- 카운터는 음수가 될 수 없습니다.
- 스트림 연결이 끊어지면 자동으로 재연결을 시도합니다.
- CORS가 활성화되어 있어 모든 도메인에서 접근 가능합니다.

## 라이선스

MIT
