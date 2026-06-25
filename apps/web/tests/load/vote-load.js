// K6_WEB_DASHBOARD=true k6 run -e POLL_ID=seed-0198 -e BASE_URL=http://localhost:3000 apps/web/tests/load/vote-load.js

import { check, sleep } from "k6";
import http from "k6/http";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const POLL_ID = __ENV.POLL_ID;

if (!POLL_ID) {
  throw new Error(
    "POLL_ID is required. Run: k6 run -e POLL_ID=<id> vote-load.js",
  );
}

export const options = {
  stages: [
    { duration: "30s", target: 500 },
    { duration: "60s", target: 500 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.05"],
  },
};

export function setup() {
  const signInRes = http.post(
    `${BASE_URL}/api/better-auth/sign-in/anonymous`,
    JSON.stringify({}),
    { headers: { "Content-Type": "application/json" } },
  );

  check(signInRes, {
    "anonymous sign-in: HTTP 200": (r) => r.status === 200,
  });

  const cookieString = Object.entries(signInRes.cookies)
    .map(([name, arr]) => `${name}=${arr[0].value}`)
    .join("; ");

  const input = JSON.stringify({ 0: { json: { urlId: POLL_ID } } });
  const pollRes = http.get(
    `${BASE_URL}/api/trpc/polls.get?batch=1&input=${encodeURIComponent(input)}`,
    { headers: { Cookie: cookieString } },
  );

  check(pollRes, { "poll found: HTTP 200": (r) => r.status === 200 });

  const poll = JSON.parse(pollRes.body)[0].result.data.json;
  const optionIds = poll.options.map((o) => o.id);

  console.log(`Poll: "${poll.title}" — ${optionIds.length} option(s)`);

  return { cookieString, optionIds };
}

export default function (data) {
  const { cookieString, optionIds } = data;

  const payload = JSON.stringify({
    0: {
      json: {
        pollId: POLL_ID,
        name: `Load Tester ${__VU}`,
        votes: optionIds.map((id) => ({ optionId: id, type: "yes" })),
      },
    },
  });

  const res = http.post(
    `${BASE_URL}/api/trpc/polls.participants.add?batch=1`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieString,
      },
    },
  );

  check(res, {
    "vote submitted: HTTP 200": (r) => r.status === 200,
    "no tRPC error": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body[0].result !== undefined;
      } catch (_) {
        return false;
      }
    },
  });

  // if (res.status !== 200) {
  //   console.error(`Request fehlgeschlagen! Status: ${res.status} | URL: ${res.url} | Body: ${res.body}`);
  // }

  sleep(1);
}
