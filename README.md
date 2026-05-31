# Donation Map

여러 기부 플랫폼의 공개 캠페인을 수집하고, 캠페인을 **대상 / 지원 유형 / 태그** 기준으로 정제해 검색할 수 있게 만든 기부 캠페인 탐색 프로토타입입니다.

현재 프로젝트의 핵심은 지도 기능보다 **기부 캠페인 검색과 필터링**입니다.

## 현재 상태

- 수집 플랫폼
  - Kakao Together
  - GoodNeighbors
  - Naver Happybean
- 최종 데이터
  - `processed/campaigns.json`
- 현재 캠페인 수
  - 1336개
- 데이터 정제 방식
  - Ollama LLM 정제
  - 규칙 기반 보정
  - cache 기반 증분 처리
- UI 검색/필터
  - 검색어
  - 대상
  - 지원 유형
  - 플랫폼
  - `#태그` 검색
  - 태그 chip 클릭 검색

## 핵심 데이터 구조

기존에는 `category` 하나에 여러 의미가 섞여 있었지만, 현재는 다음 구조로 정리합니다.

```text
target      = 누구를 돕는가
supportType = 무엇을 지원하는가
tags        = 세부 검색/분류 키워드
category    = 기존 호환용 필드, target과 동일
```

예시:

```json
{
  "title": "섬마을 독거 시각장애인 어르신들께 따뜻한 한 끼를 전해요!",
  "oneLineSummary": "장애 어르신 식사 지원",
  "target": "노인",
  "supportType": "식사지원",
  "category": "노인",
  "tags": ["식사지원", "시각장애인", "어르신", "독거", "장애인"]
}
```

## 분류 목록

### target

- 아동/청소년
- 노인
- 장애인
- 여성/가족
- 저소득/취약계층
- 재난/위기
- 동물
- 환경
- 지역사회
- 해외/국제
- 기타

### supportType

- 생계지원
- 의료지원
- 주거지원
- 교육지원
- 식사지원
- 심리/정서지원
- 보호/돌봄
- 문화/여가
- 환경개선
- 긴급구호
- 인식개선/캠페인
- 기타

## 정제 정책

- `titleRaw`가 있으면 최종 `title`은 항상 원본 제목을 사용합니다.
- LLM이 제목을 바꾸더라도 최종 결과에는 반영하지 않습니다.
- `target`과 `supportType`은 허용 목록 안의 값만 사용합니다.
- 허용 목록 밖 값은 `기타`로 보정합니다.
- `category`는 기존 UI/API 호환을 위해 유지하며, 최종적으로 `target`과 같게 둡니다.
- `tags`는 최대 5개까지 사용합니다.
- LLM 결과는 최종 결정값이 아니라 후보로 보고, 코드에서 검증합니다.
- 명확한 키워드가 있으면 규칙 기반 보정이 LLM 결과보다 우선합니다.

## 현재 데이터 품질

최종 확인 기준:

- 전체 캠페인 수: 1336개
- `target` 누락: 0개
- `supportType` 누락: 0개
- 허용 목록 밖 `target/supportType`: 0개
- `title !== raw.titleRaw`: 0개
- `category !== target`: 0개
- tags 배열/최대 5개 조건: 통과

품질 지표:

- target 기타 비율: 0.67%
- supportType 기타 비율: 2.84%
- target/supportType 모두 기타 비율: 0.00%
- tags 빈 배열 비율: 1.80%

## UI 기능

`main_service.html`은 `processed/campaigns.json`을 읽어 카드 UI를 렌더링합니다.

카드 상단에는 다음 chip이 표시됩니다.

```text
플랫폼 / 대상 / 지원 유형 / #태그들
```

예:

```text
Kakao Together / 노인 / 식사지원 / #식사지원 / #시각장애인 / #어르신
```

필터:

- 검색어
- 대상
- 지원 유형
- 플랫폼

검색:

- 일반 텍스트 검색 가능
- `#고양이 #치료비` 같은 해시태그 검색 가능
- 카드의 `#태그` chip 클릭 시 해당 태그로 즉시 검색

## Quick Start

```bash
npm ci

# 크롤링
npm run crawl:now:json
npm run crawl:goodneighbors:json
npm run crawl:happybean:json

# Ollama 모델 준비
ollama pull llama3.2:1b

# 데이터 정제
OLLAMA_MODEL=llama3.2:1b FORCE_REFINE=true CONCURRENCY=2 CHECKPOINT_EVERY=10 npm run build:processed

# 웹 실행
npm start
```

Windows PowerShell 예시:

```powershell
$env:OLLAMA_MODEL="llama3.2:1b"
$env:FORCE_REFINE="true"
$env:CONCURRENCY="2"
$env:CHECKPOINT_EVERY="10"
npm run build:processed
```

## Server Scripts

### `npm run server:refresh`

크롤링과 processed 데이터 생성을 한 번에 수행합니다.

```bash
npm run server:refresh
```

하는 일:

1. 3개 플랫폼 크롤링
2. `out/*.json` 갱신
3. `scripts/build-processed.js` 실행
4. `processed/cache.json`과 `processed/campaigns.json` 갱신

### `npm start`

웹 서버를 실행합니다.

```bash
npm start
```

라우팅:

- `/` -> `index.html`
- `/main_service.html` -> 캠페인 탐색 UI
- `/api/campaigns` -> `processed/campaigns.json`

기본 포트:

```text
http://127.0.0.1:8787
```

## Repository Layout

```text
bin/                  수집 CLI
src/                  플랫폼별 수집 모듈
scripts/              데이터 가공 및 서버 보조 스크립트
out/                  크롤링 원본 JSON
processed/            웹 UI가 읽는 최종 데이터와 cache
main_service.html     캠페인 검색 UI
server.js             정적 파일/API 서버
```

주요 파일:

- `scripts/build-processed.js`
  - `out/*.json`을 읽어 공통 캠페인 스키마로 정규화
  - LLM 정제/cache 병합
  - 최종 `processed/campaigns.json` 생성
- `scripts/llm-ollama.js`
  - Ollama API 호출
  - LLM 출력 검증
  - target/supportType/tags 보정
  - 규칙 기반 fallback
- `processed/campaigns.json`
  - 웹에서 사용하는 최종 데이터
- `processed/cache.json`
  - LLM 정제 결과 cache

## Build Processed

`npm run build:processed`는 다음을 수행합니다.

1. `out/*.json` 로드
2. 플랫폼별 데이터를 공통 campaign 구조로 정규화
3. 변경된 캠페인 또는 새 캠페인만 LLM 정제
4. LLM 결과를 검증/보정
5. cache와 병합
6. `processed/campaigns.json` 출력

## Environment Variables

- `RAW_DIR`
  - 기본값: `./out`
- `OUT_DIR`
  - 기본값: `./processed`
- `LLM_ENABLED`
  - 기본값: `true`
- `OLLAMA_HOST`
  - 기본값: `http://127.0.0.1:11434`
- `OLLAMA_MODEL`
  - 기본값: `llama3.2:1b`
- `CONCURRENCY`
  - 기본값: `2`
- `MAX_REFINE`
  - 기본값: 제한 없음
- `CHECKPOINT_EVERY`
  - 기본값: `10`
- `CHANGED_ONLY`
  - 기본값: `true`
- `FORCE_REFINE`
  - 기본값: `false`
- `RETRY_FAILED_ONLY`
  - 기본값: `false`

## 자동 갱신 방향

1시간마다 자동 갱신은 가능하지만, 매번 전체 LLM 재가공을 하는 방식은 비효율적입니다.

권장 방식:

```text
크롤링
→ 새/변경 캠페인만 LLM 정제
→ 기존 정제 결과는 cache 재사용
→ processed/campaigns.json 갱신
→ UI 표시
```

Railway에서 Ollama까지 직접 운영하기보다는, 로컬 또는 별도 작업 환경에서 정제한 결과를 GitHub/Railway에 반영하는 구조가 더 안정적입니다.

## Notes

- 크롤링 방식 자체는 크게 바꾸지 않았습니다.
- 주요 변경은 크롤링 이후의 정제/분류/표시 구조입니다.
- 현재 `tags`는 단순 표시가 아니라 해시태그 검색과 클릭 검색에 사용됩니다.
- `category`는 새 분류 체계의 핵심 필드가 아니라 기존 호환용 필드입니다.
