import express from "express";
import { ReadableStream } from "stream/web";

const app = express();
app.use(express.json());

let counter = 0;
let resolvers = new Set();

// 다음 값을 기다리는 Promise를 반환
async function nextValue() {
  return new Promise((resolve) => resolvers.add(resolve));
}

// 카운터 값을 스트리밍하는 제너레이터
async function* valueGenerator() {
  while (true) {
    yield await nextValue();
  }
}

// 명령어 처리 함수
async function processCommand(command) {
  counter = nextCounterValue(command);
  for (const resolver of resolvers) {
    resolver(counter);
    resolvers.delete(resolver);
  }
}

// 다음 카운터 값 계산
function nextCounterValue(command) {
  let next = counter;
  if (command.type === "increment") {
    next += command.amount;
  } else if (command.type === "decrement") {
    next -= command.amount;
  }
  if (next < 0) {
    throw new Error("카운터는 음수가 될 수 없습니다");
  }
  return next;
}

// CORS 미들웨어
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// 증가 엔드포인트
app.post("/increment", async (req, res) => {
  try {
    const { value } = req.body;
    await processCommand({ type: "increment", amount: value });
    res.status(200).send("OK");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// 감소 엔드포인트
app.post("/decrement", async (req, res) => {
  try {
    const { value } = req.body;
    await processCommand({ type: "decrement", amount: value });
    res.status(200).send("OK");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// 스트림 엔드포인트
app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = ReadableStream.from(valueGenerator());
  const reader = stream.getReader();

  const sendEvent = async () => {
    try {
      const { value, done } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(`data: ${JSON.stringify({ value })}\n\n`);
      sendEvent();
    } catch (error) {
      console.error("스트림 에러:", error);
      res.end();
    }
  };

  sendEvent();

  req.on("close", () => {
    reader.cancel();
  });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
