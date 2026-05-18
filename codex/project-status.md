# 프로젝트 상태 기록

작성일: 2026-05-11

## 프로젝트 한 줄 설명

`donation-map`은 여러 공개 기부 캠페인 데이터를 수집하고, 공통 JSON 데이터로 가공한 뒤, 정적 HTML UI와 간단한 Node.js 서버로 검색/필터링 화면을 제공하는 프로토타입입니다.

## 프로젝트의 핵심 목표

- Kakao Together, GoodNeighbors, Naver Happybean의 공개 기부 캠페인 목록을 수집한다.
- 수집한 원본 데이터를 `processed/campaigns.json`의 공통 스키마로 통합한다.
- 크롤링한 데이터를 사용자에게 보여주기 좋은 형태로 정제한다.
- 카테고리 정제는 현재 Ollama 로컬 LLM을 사용하지만, 반드시 LLM이어야 하거나 특정 모델이어야 하는 것은 아니다.
- `/api/campaigns` API와 `main_service.html` 화면을 통해 캠페인을 탐색할 수 있게 한다.

## 현재 구현된 주요 기능

- CLI 기반 수집 명령 제공: `bin/cli.js`
- Kakao Together 현재 모금 목록 API 수집: `src/kakaoTogether.js`
- GoodNeighbors 캠페인 목록 HTML 파싱: `src/goodNeighbors.js`
- Naver Happybean 기부 목록 API 수집: `src/happybean.js`
- 원본 JSON을 공통 캠페인 스키마로 변환하고 LLM 정제 결과를 병합: `scripts/build-processed.js`
- Ollama API 연동, JSON 응답 검증, 카테고리/태그 정리: `scripts/llm-ollama.js`
- 정적 파일과 `/api/campaigns`를 제공하는 간단한 HTTP 서버: `server.js`
- 랜딩 페이지: `index.html`
- 캠페인 검색/필터 UI: `main_service.html`
- Node 내장 테스트 러너 기반 단위/통합 테스트: `test/*.js`

## 전체 데이터 흐름

1. 사용자가 npm script 또는 CLI로 수집 명령을 실행한다.
2. `bin/cli.js`가 `src/index.js`를 통해 수집 모듈을 호출한다.
3. 수집 모듈이 외부 사이트의 공개 API 또는 HTML 목록을 읽고 JSON/CSV/Markdown 형태로 출력한다.
4. README와 스크립트 기준 원본 JSON의 주요 위치는 `out/*.json`이다.
5. `scripts/build-processed.js`가 `out/fundraisings-now.json`, `out/goodneighbors-campaigns.json`, `out/happybean-donations.json`을 읽는다.
6. 각 플랫폼별 데이터가 `uid`, `source`, `platform`, `titleRaw`, `summaryRaw`, 금액, 기간, 링크 등을 포함한 공통 내부 형태로 정규화된다.
7. Ollama가 사용 가능하면 `scripts/llm-ollama.js`를 통해 캠페인별 제목, 한 줄 요약, 카테고리, 태그가 정제된다.
8. 정제 결과와 오류/캐시 정보는 `processed/cache.json`에 저장된다.
9. UI와 API가 사용하는 최종 데이터는 `processed/campaigns.json`에 저장된다.
10. `server.js`는 `/api/campaigns`에서 `processed/campaigns.json`을 반환한다.
11. `main_service.html`은 `/api/campaigns`를 fetch해 카드 목록, 검색어, 카테고리, 플랫폼 필터를 렌더링한다.

## 주요 폴더와 파일의 역할

- `.git/`: 현재 폴더가 Git 저장소임을 나타낸다.
- `bin/cli.js`: 플랫폼별 수집 명령을 실행하고 출력 형식을 선택하는 CLI 진입점이다.
- `src/index.js`: 수집 모듈을 한 곳에서 export하는 라이브러리 진입점이다.
- `src/kakaoTogether.js`: Kakao Together 현재 모금 목록을 API로 수집하고 Markdown/CSV 변환을 제공한다.
- `src/goodNeighbors.js`: GoodNeighbors 캠페인 목록 페이지를 가져와 cheerio로 파싱한다.
- `src/happybean.js`: Naver Happybean 기부 목록 API를 페이지 단위로 수집한다.
- `scripts/build-processed.js`: 원본 수집 JSON을 최종 `processed` 데이터로 변환한다.
- `scripts/llm-ollama.js`: Ollama 로컬 LLM 호출과 정제 결과 검증을 담당한다.
- `scripts/server-setup.js`: 의존성 설치, Ollama 모델 확인/다운로드, 초기 데이터 갱신을 자동화하는 스크립트다.
- `scripts/server-refresh.js`: 세 플랫폼 데이터를 다시 수집하고 `processed` 데이터를 갱신한다.
- `scripts/server-start.js`: `processed/campaigns.json` 존재 여부를 확인한 뒤 서버를 시작한다.
- `scripts/discover-kakao-api.js`: Playwright로 Kakao Together 네트워크 요청을 관찰하는 디버그 도구다.
- `server.js`: 정적 HTML 파일과 `/api/campaigns` API를 제공하는 Node HTTP 서버다.
- `index.html`: Donation Map 랜딩 페이지다.
- `main_service.html`: 캠페인 탐색 UI다.
- `processed/campaigns.json`: 현재 UI/API가 사용하는 최종 캠페인 데이터다. 현재 `count`는 1195로 확인된다.
- `processed/cache.json`: LLM 정제 결과와 오류 캐시다.
- `test/kakaoTogether.test.js`: URL 생성, 정규화, 변환, GoodNeighbors/Happybean 일부 로직 단위 테스트를 포함한다.
- `test/crawlNow.integration.test.js`: Kakao Together 실제 엔드포인트를 호출하는 통합 테스트다.
- `test/happybean.integration.test.js`: Happybean 실제 API를 호출하는 통합 테스트다.
- `package.json`: npm scripts, Node 버전, 의존성, CLI 설정을 정의한다.
- `package-lock.json`: 설치 의존성의 잠금 파일이다.
- `README.md`: 프로젝트 설명과 실행 방법을 담고 있으나 현재 한글 인코딩이 깨져 보인다.

## 실행 흐름

- 개발/사용자가 `npm start`를 실행하면 `server.js`가 시작되고 기본 포트 `8787`에서 서비스된다.
- `/` 또는 `/index.html`은 랜딩 페이지를 반환한다.
- `/main_service.html`은 캠페인 탐색 UI를 반환한다.
- `/api/campaigns`는 `processed/campaigns.json`이 있으면 해당 파일을 JSON으로 반환한다.
- `npm run server:refresh`는 세 플랫폼 수집 명령을 실행한 뒤 `npm run build:processed`를 실행하도록 구성되어 있다.
- `npm run server:setup`은 `node_modules` 확인, Ollama 모델 확인/다운로드, 데이터 갱신을 포함하므로 프로젝트 상태를 바꿀 수 있다.
- 이번 분석에서는 실행, 설치, 데이터 재생성 명령을 실행하지 않았다.

## 외부 서비스 또는 라이브러리 의존성

- Node.js `>=18`
- npm scripts
- Kakao Together 공개/내부 API
- GoodNeighbors 캠페인 목록 HTML
- Naver Happybean 기부 목록 API
- Ollama 로컬 서버: 기본 `http://127.0.0.1:11434`
- 기본 Ollama 모델: 코드 기준 `llama3.2:1b`
- 런타임 의존성: `cheerio`, `iconv-lite`
- 개발 의존성: `playwright`
- UI CDN 의존성: `https://cdn.tailwindcss.com`

## 현재 확인된 문제점

- README, HTML, 테스트 문자열, 일부 JavaScript 문자열, `processed` 데이터에서 한글이 깨져 보인다.
- `package.json`의 `description` 값도 한글이 깨져 보인다.
- LLM 카테고리 taxonomy와 일부 정규화 문자열도 깨진 상태로 보이며, 정제 품질에 영향을 줄 수 있다.
- `processed/campaigns.json`의 실제 캠페인 제목/요약/태그도 깨져 보여 현재 UI 사용성이 낮을 가능성이 크다.
- 프로젝트 이름은 `donation-map`이지만 현재 구현에서 실제 지도, 좌표, 지리 기반 시각화 기능은 확인되지 않았다.
- README는 `out/` 원본 데이터 폴더를 설명하지만 현재 파일 목록에는 `out/` 폴더가 보이지 않았다.
- `scripts/server-setup.js`는 `npm i`, Ollama 모델 다운로드, 데이터 갱신을 수행할 수 있어 기록 전용 작업에서는 실행하면 안 된다.
- 일부 테스트는 실제 외부 API를 호출하는 통합 테스트라 네트워크 상태와 외부 서비스 변경에 영향을 받을 수 있다.
- `scripts/discover-kakao-api.js`는 Playwright 브라우저 실행을 요구하는 디버그 도구다.

## 아직 구현되지 않았거나 불명확한 부분

- 실제 지도 기반 UI 또는 위치 기반 캠페인 탐색 기능은 확인되지 않았고, 사용자 답변 기준 최종 방향도 지도 서비스보다는 기부 캠페인 검색 서비스에 가깝다.
- `out/` 원본 데이터가 현재 저장소에 존재하지 않는 이유는 확인되지 않았다.
- 깨진 한글이 원본 파일 인코딩 문제인지, 이전 저장/변환 과정에서 이미 손상된 데이터인지 확인되지 않았다.
- 정제 로직은 필요하지만 LLM 자체는 필수 조건이 아니다. 규칙 기반, 외부 모델, 다른 정제 파이프라인으로 대체 가능성을 열어둔다.
- GoodNeighbors 데이터의 금액/기간 같은 상세 정보 수집 여부는 현재 목록 파싱만으로는 제한적이다.
- 수집 대상 플랫폼은 현재 3개를 중심으로 보되, 확장 가능성은 열어둔다.
- `processed` 데이터는 계속 갱신되는 데이터로 취급한다.

## 현재 프로토타입 단계 판단

확인된 파일과 사용자 답변 기준 이 프로젝트는 "작동 가능한 기부 캠페인 검색 서비스 프로토타입" 단계로 판단된다. 수집기, 가공기, 서버, UI, 테스트가 모두 존재하지만, 한글 인코딩/데이터 품질 문제가 크고 정제 파이프라인의 교체 가능성을 검토해야 하므로 제품 완성 단계라기보다는 기능 검증용 MVP 또는 초기 통합 프로토타입에 가깝다.

## 다음에 확인하면 좋을 사항

- 한글 깨짐이 어느 단계에서 발생했는지 원인을 추적하고, 이후 별도 복구 계획을 작성한다.
- `out/` 원본 JSON이 의도적으로 제외된 것인지, 생성 전 상태인지 확인한다.
- `processed/campaigns.json`을 직접 수정하지 않고 재생성 파이프라인으로 복구 가능한지 검토한다.
- 프로젝트 목표는 지도보다 기부 캠페인 검색 서비스에 가깝다는 방향을 기준으로 UI와 데이터 구조를 정리한다.
- 지도 기능은 핵심 목표로 두지 않고, 필요성이 생길 때만 별도 검토한다.
- 외부 API 호출 통합 테스트를 기본 테스트에서 분리할지 검토한다.
- `server-setup`, `server-refresh`처럼 상태를 바꾸는 스크립트 실행 조건과 운영 절차를 문서화한다.
- LLM 없이도 가능한 카테고리 정제 방식과, LLM을 쓰더라도 모델 교체가 쉬운 구조를 검토한다.
- 계속 갱신되는 `processed` 데이터의 보관/갱신/검증 정책을 정리한다.

## 사용자에게 확인이 필요한 질문

추가 질문 없음

## 사용자 답변 반영 사항

- A1. 최종 방향은 실제 지도 서비스보다 기부 캠페인 검색 서비스에 가깝다.
- A2. 한글 깨짐 문제는 원인 분석을 넘어 복구 계획까지 목표로 한다.
- A3. 목표는 크롤링 데이터를 정제하는 것이며, LLM은 필수도 특정 모델 고정도 아니다.
- A4. 수집 대상 플랫폼은 현재 범위를 중심으로 하되 확장 가능성 정도는 열어둔다.
- A5. `processed` 데이터는 계속 갱신되는 데이터다.
