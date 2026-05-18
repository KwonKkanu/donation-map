# 작업 기록

## 2026-05-11

### 작업 목적

- 현재 프로젝트 폴더의 실제 파일만 기준으로 프로젝트를 처음부터 다시 분석했다.
- 기존 프로젝트 파일은 수정하지 않고 `codex/` 폴더 안에만 기록을 남겼다.
- 현재 구현 상태, 데이터 흐름, 문제점, 다음 확인 사항을 한국어 문서로 정리했다.

### 읽은 파일

- `README.md`
- `package.json`
- `package-lock.json`
- `server.js`
- `bin/cli.js`
- `src/index.js`
- `src/kakaoTogether.js`
- `src/goodNeighbors.js`
- `src/happybean.js`
- `scripts/build-processed.js`
- `scripts/llm-ollama.js`
- `scripts/server-setup.js`
- `scripts/server-refresh.js`
- `scripts/server-start.js`
- `scripts/discover-kakao-api.js`
- `index.html`
- `main_service.html`
- `test/kakaoTogether.test.js`
- `test/crawlNow.integration.test.js`
- `test/happybean.integration.test.js`
- `processed/campaigns.json` 일부
- `processed/cache.json` 일부
- 기존 `codex/project-status.md`

### 생성/수정한 파일

- `codex/project-status.md`
- `codex/work-log.md`
- `codex/codex-rules.md`

### 수정하지 않은 파일

- 기존 소스 코드 전체
- `README.md`
- `package.json`
- `package-lock.json`
- `server.js`
- `index.html`
- `main_service.html`
- `src/`
- `scripts/`
- `processed/`
- `bin/`
- `test/`
- `.git/`

### 확인한 프로젝트 상태

- 현재 폴더는 `.git/`이 있는 Git 저장소다.
- 작업 전 `git status --short` 출력은 비어 있었다.
- 프로젝트 이름은 `donation-map`이다.
- Node.js CommonJS 프로젝트이며 `package.json` 기준 Node.js `>=18`을 요구한다.
- 주요 의존성은 `cheerio`, `iconv-lite`, 개발 의존성은 `playwright`다.
- 서버 진입점은 `server.js`이고 기본 포트는 `8787`이다.
- 최종 UI 데이터는 `processed/campaigns.json`에 있으며 확인 당시 `count`는 1195였다.
- `processed/cache.json`에는 Ollama 정제 결과 캐시가 저장되어 있다.
- 현재 파일 목록에는 `out/` 폴더가 보이지 않았다.

### 확인한 문제

- 여러 문서, HTML, 코드 문자열, processed 데이터에서 한글이 깨져 보인다.
- README 설명과 실제 구현은 큰 흐름에서 일치하지만 README 자체의 한글 가독성이 낮다.
- 프로젝트 이름은 지도 서비스를 암시하지만 실제 지도 기능은 확인되지 않았다.
- `out/` 원본 데이터 폴더가 README에는 언급되지만 현재 파일 목록에는 없다.
- `server:setup`, `server:refresh`, `build:processed` 등은 데이터를 바꾸는 명령이므로 허락 없이 실행하면 안 된다.
- 외부 API를 호출하는 통합 테스트가 있어 테스트 실행도 프로젝트 상태/네트워크 상황에 영향을 받을 수 있다.

### 사용자 답변 반영

- 프로젝트 방향은 실제 지도 서비스가 아니라 기부 캠페인 검색 서비스에 가깝다.
- 한글 깨짐 문제는 원인 분석뿐 아니라 복구 계획 수립까지 목표로 한다.
- LLM 또는 현재 Ollama 모델 자체가 핵심은 아니며, 크롤링 데이터를 잘 정제하는 것이 핵심이다.
- 수집 플랫폼은 현재 3개를 중심으로 유지하되 확장 가능성은 열어둔다.
- `processed` 데이터는 계속 갱신되는 데이터로 취급한다.

## 2026-05-13

### 작업 목적

- Ollama 로컬 LLM을 통한 캠페인 데이터 가공 구조를 분석한다.
- `category` 자유 생성과 title 변경 문제를 정리한다.
- `target`과 `supportType`을 분리하는 카테고리 체계 개선 계획을 `codex/` 안에 기록한다.
- 기존 코드와 데이터는 수정하지 않는다.

### 읽은 파일

- `scripts/llm-ollama.js`
- `scripts/build-processed.js`
- `src/kakaoTogether.js`
- `src/goodNeighbors.js`
- `src/happybean.js`
- `main_service.html`
- `server.js`
- `processed/campaigns.json` 읽기 전용 일부/정규식 집계
- `processed/cache.json` 읽기 전용 일부/정규식 집계
- `codex/work-log.md`

### 생성한 파일

- `codex/category-taxonomy-plan.md`

### 수정한 파일

- `codex/work-log.md`

### 수정하지 않은 파일

- `scripts/llm-ollama.js`
- `scripts/build-processed.js`
- `src/`
- `main_service.html`
- `server.js`
- `processed/campaigns.json`
- `processed/cache.json`
- `package.json`
- `README.md`

### 현재 확인한 프로젝트 상태

- 작업 전 `git status --short` 기준 기존 변경 파일은 `codex/codex-rules.md`, `codex/project-status.md`, `codex/work-log.md`였다.
- 이번 작업에서는 `codex/` 외부 파일을 수정하지 않았다.
- `processed/campaigns.json`은 `ConvertFrom-Json` 파싱이 실패했다. 한글 깨짐 또는 문자열 손상으로 JSON 유효성 확인이 필요하다.
- 정규식 기준 `processed/campaigns.json`의 `category` 필드는 1195개, 고유 category 값은 15종으로 확인했다.
- 정규식 기준 `target`과 `supportType` 필드는 아직 없다.
- 정규식 기준 `raw.titleRaw`, `raw.summaryRaw`는 각각 1195개 확인했다.
- 정규식 기준 `raw.categoryRaw`는 217개 확인했다.
- 정규식 기준 `processed/cache.json`에는 `refined` 객체 1179개, `error` 16개, `refined: null` 16개가 확인됐다.

### 확인한 문제

- 현재 LLM 출력은 `title`, `oneLineSummary`, `category`, `tags`를 모두 생성한다.
- `title`은 원본 보존이 강제되지 않아 원본 제목과 달라질 수 있다.
- `category`는 대상과 지원 유형이 섞인 단일 축이라 UI 필터로 쓰기 어렵다.
- 실제 데이터에는 프롬프트 허용 목록 밖으로 보이는 category 값도 일부 존재한다.
- UI는 현재 `category` 단일 필터와 `source` 필터만 제공한다.
- `processed` 데이터는 분류 체계 개선 전 JSON 유효성 검증도 필요하다.

### 다음 작업 제안

- `category-taxonomy-plan.md`를 기준으로 사용자가 `category` 호환 방식과 summary 길이 정책을 결정한다.
- 승인 후에만 `llm-ollama.js`, `build-processed.js`, `main_service.html` 수정 계획을 별도 작성한다.
- 실제 데이터 재생성은 코드 수정과 검증 계획 승인 후 `build-processed.js`를 통해 수행한다.

## 2026-05-13 구현 계획 작성

### 작업 목적

- `codex/category-taxonomy-plan.md`의 분석을 바탕으로 실제 코드 반영 전 구현 계획을 작성한다.
- 이번 작업은 코드 수정이 아니라 계획 문서 작성으로 제한한다.
- `titleRaw` 기반 title 복구, `target/supportType` 분류 확장, `category = target` 호환 정책, 후처리 검증 함수, UI 필터 수정, cache/processed 처리 계획을 정리한다.

### 읽은 파일

- `codex/category-taxonomy-plan.md`
- `scripts/llm-ollama.js`
- `scripts/build-processed.js`
- `main_service.html`
- `server.js`
- `processed/campaigns.json` 정규식 집계
- `processed/cache.json` 정규식 집계

### 생성한 파일

- `codex/category-implementation-plan.md`

### 수정한 파일

- `codex/work-log.md`

### 수정하지 않은 파일

- `scripts/llm-ollama.js`
- `scripts/build-processed.js`
- `main_service.html`
- `server.js`
- `processed/campaigns.json`
- `processed/cache.json`
- `package.json`
- `README.md`

### 현재 확인한 프로젝트 상태

- 작업 전 `git status --short` 기준 변경 파일은 `codex/` 내부 파일뿐이었다.
- 정규식 기준 `processed/campaigns.json`에는 `category` 1195개, `target` 0개, `supportType` 0개가 확인됐다.
- 정규식 기준 `processed/cache.json`에는 `refined` 객체 1179개, `refined: null` 16개, `error` 16개가 확인됐다.

### 이번 계획의 추천 방향

- 최종 title은 LLM 결과가 아니라 `titleRaw`를 사용한다.
- LLM은 `target`, `supportType`, `oneLineSummary`, `tags` 후보 생성기로만 사용한다.
- 최종 데이터 반영 전 코드 검증 함수로 모든 값을 보정한다.
- `category`는 1차 마이그레이션에서 `target` 값으로 유지한다.
- `oneLineSummary`는 30자 엄격 제한보다 50자 내외 제한을 추천한다.
- 기존 cache는 새 스키마와 맞지 않으므로 백업 후 재생성 또는 schema version 무효화가 필요하다.

## 2026-05-13 카테고리 분류 체계 1차 코드 반영

### 작업 목적

- UI 수정 없이 데이터 생성 파이프라인의 정제 스키마를 먼저 안정화한다.
- LLM의 category 단일 출력 구조를 `target/supportType` 구조로 확장한다.
- 최종 title은 LLM 결과가 아니라 `titleRaw` 기반으로 생성되게 한다.
- 데이터 재생성 없이 코드만 수정한다.

### 수정한 파일

- `scripts/llm-ollama.js`
- `scripts/build-processed.js`
- `codex/work-log.md`

### 수정하지 않은 파일

- `main_service.html`
- `server.js`
- `index.html`
- `README.md`
- `processed/campaigns.json`
- `processed/cache.json`
- `out/`
- `package.json`

### 주요 변경 요약

- `scripts/llm-ollama.js`
  - `TARGETS`, `SUPPORT_TYPES`, `REFINED_SCHEMA_VERSION` 상수를 추가했다.
  - LLM 프롬프트를 `target/supportType` 중심 출력 스키마로 변경했다.
  - `title`은 `input.titleRaw`를 그대로 복사하라고 프롬프트에 명시했다.
  - `oneLineSummary`는 50자 내외로 안내했다.
  - `tags`는 3~5개로 안내하고 코드에서 최대 5개로 제한한다.
  - `sanitizeRefinedCampaign`, `fallbackRefinedCampaign` 검증/fallback 함수를 추가했다.
  - target/supportType 허용 목록 검증, category=target 강제, titleRaw 기반 title 복구, summary fallback, tags 정리를 추가했다.
  - 간단한 규칙 기반 후보 분류 함수는 추가했지만, 1차 최종 fallback은 요청 기준에 맞춰 `기타`를 사용한다.

- `scripts/build-processed.js`
  - `llm-ollama.js`의 상수와 검증 함수를 import하도록 변경했다.
  - 기존 cache refined에 target/supportType이 없거나 schemaVersion이 다르면 재가공 대상으로 잡히도록 했다.
  - cache item에 `schemaVersion: REFINED_SCHEMA_VERSION`을 저장하도록 했다.
  - 최종 item 병합에서 `title`은 `c.titleRaw`를 최우선으로 사용하게 했다.
  - 최종 item에 `target`, `supportType`을 추가했다.
  - `category`는 1차 호환 정책에 따라 항상 `target`과 같게 설정했다.
  - 기존 raw 필드는 계속 보존한다.

### 실행하지 않은 명령

- `npm install`
- `npm run ...`
- `node ...`
- 데이터 크롤링
- `processed/campaigns.json` 재생성
- `processed/cache.json` 재생성
- `git add`
- `git commit`

### 다음 작업 제안

- 사용자 허락 후 코드 문법 확인 명령을 실행한다.
- 사용자 허락 후 `processed/cache.json` 백업 및 새 스키마 기준 재생성 절차를 진행한다.
- 재생성 후 모든 item의 `target/supportType/category/title` 검증을 수행한다.
- 이후 별도 작업으로 `main_service.html`의 UI 필터를 `대상/지원 유형/플랫폼/검색어` 구조로 바꾼다.

### 사용자 확인 필요 사항

- 다음 단계에서 데이터 재생성을 진행해도 되는지 확인이 필요하다.
- 재생성 전 `processed/cache.json`과 `processed/campaigns.json` 백업을 만들지 확인이 필요하다.
- UI 필터 분리 작업을 별도 단계로 진행할지 확인이 필요하다.

## 2026-05-14 UI chip 및 필터 구조 개선 계획

### 작업 목적

- `main_service.html`의 현재 캠페인 카드 chip 표시 구조를 분석한다.
- `target/supportType/tags` 도입 이후 어떤 UI 구조가 적절한지 계획으로 정리한다.
- 실제 UI 코드는 수정하지 않는다.

### 읽은 파일

- `main_service.html`
- `codex/category-implementation-plan.md`
- `codex/work-log.md`

### 생성한 파일

- `codex/ui-chip-filter-plan.md`

### 수정한 파일

- `codex/work-log.md`

### 수정하지 않은 파일

- `main_service.html`
- `processed/campaigns.json`
- `processed/cache.json`
- `server.js`
- `index.html`
- `README.md`
- `package.json`

### 현재 UI 구조 요약

- 카드 상단 chip 영역은 `platform`과 `category`만 표시한다.
- 실제 `tags` 배열은 카드 하단 별도 영역에서 최대 6개까지 표시된다.
- `target`과 `supportType`은 아직 UI에서 사용하지 않는다.
- 현재 필터는 `검색어`, `category`, `source` 구조다.

### 확인한 문제

- 상단 chip이 태그 목록처럼 보일 수 있지만 실제로는 플랫폼과 분류값이다.
- tags는 하단에 표시되어 사용자가 덜 인지할 수 있다.
- 새 스키마 데이터가 재생성되기 전에는 `target/supportType` 기반 UI를 완전히 적용하기 어렵다.

### 다음 작업 제안

- processed/cache 재생성 후 `target/supportType` 필드가 안정적으로 들어오는지 확인한다.
- 이후 `main_service.html`에서 상단 chip을 `platform/target/supportType` 구조로 바꾼다.
- 필터를 `대상`, `지원 유형`, `플랫폼`, `검색어`로 분리한다.
- 하단 tags는 `#태그` 형태로 최대 5개만 표시하도록 정리한다.

## 2026-05-14 UI chip 및 필터 구조 개선 계획 보강

### 작업 목적

- 현재 카드 상단 chip이 실제 tags가 아니라 `platform/category` 표시라는 점을 다시 확인한다.
- `processed/campaigns.json` 기준으로 `target/supportType` 필드가 아직 데이터에 반영되지 않았음을 기록한다.
- `target/supportType/tags` 도입 이후 UI 개선 계획을 최신 확인 내용으로 보강한다.

### 읽은 파일

- `main_service.html`
- `processed/campaigns.json` 정규식 집계
- `codex/category-implementation-plan.md`
- `codex/work-log.md`
- `codex/ui-chip-filter-plan.md`

### 수정한 파일

- `codex/ui-chip-filter-plan.md`
- `codex/work-log.md`

### 수정하지 않은 파일

- `main_service.html`
- `processed/campaigns.json`
- `processed/cache.json`
- `server.js`
- `index.html`
- `README.md`
- `package.json`

### 현재 확인한 UI 상태

- `renderCard(it)`의 카드 상단 chip 영역은 `chip(it.platform)`과 `chip(it.category)`만 렌더링한다.
- 실제 `tags` 배열은 카드 하단에서 별도 영역으로 렌더링되며 현재 최대 6개까지 표시된다.
- `applyFilters`는 현재 `q`, `category`, `source` 기준으로 동작한다.
- `processed/campaigns.json`은 정규식 기준 `category` 1195개, `tags` 1195개, `target` 0개, `supportType` 0개 상태다.

### 다음 작업 제안

- 먼저 processed 데이터를 새 스키마로 재생성해 `target/supportType`이 실제 데이터에 들어오는지 검증한다.
- 이후 `main_service.html`에서 상단 chip을 `platform/target/supportType` 구조로 바꾼다.
- 필터 UI를 `검색어/대상/지원 유형/플랫폼` 구조로 분리한다.
- 하단 tags는 `#태그` 형태로 최대 5개만 표시하도록 정리한다.

## 2026-05-14 데이터 재생성 준비 점검

### 작업 목적

- `target/supportType` 스키마 적용 후 실제 데이터 재생성을 실행하기 전에 준비 상태를 점검한다.
- 코드 반영 여부, 현재 processed/cache 상태, `out/` 원본 존재 여부, 백업 계획, 실행 후보 명령, 재생성 후 검증 계획을 문서화한다.
- 실제 백업, 실행, 데이터 재생성, UI 수정은 하지 않는다.

### 읽은 파일

- `codex/category-implementation-plan.md`
- `codex/ui-chip-filter-plan.md`
- `scripts/llm-ollama.js`
- `scripts/build-processed.js`
- `scripts/server-refresh.js`
- `package.json`
- `processed/campaigns.json` 정규식 집계
- `processed/cache.json` 정규식 집계
- `codex/work-log.md`

### 생성한 파일

- `codex/regeneration-readiness-check.md`

### 수정한 파일

- `codex/work-log.md`

### 수정하지 않은 파일

- `scripts/llm-ollama.js`
- `scripts/build-processed.js`
- `main_service.html`
- `server.js`
- `index.html`
- `README.md`
- `package.json`
- `processed/campaigns.json`
- `processed/cache.json`
- `out/`

### 현재 확인한 상태

- `scripts/llm-ollama.js`에는 `TARGETS`, `SUPPORT_TYPES`, `REFINED_SCHEMA_VERSION = 2`, LLM 결과 검증/fallback, tags 최대 5개 제한이 반영되어 있다.
- `scripts/build-processed.js`에는 `titleRaw` 우선 정책, `target/supportType` 최종 필드 추가, `category = target` 호환 정책, cache schema mismatch 판단이 반영되어 있다.
- `processed/campaigns.json`은 존재하지만 정규식 기준 `target/supportType`이 0개로 old schema 상태다.
- `processed/cache.json`은 존재하지만 정규식 기준 `schemaVersion/refinedSchemaVersion/target/supportType`이 없어 old schema 상태다.
- 프로젝트 루트에서 `out/` 폴더는 확인되지 않았다.

### 실행하지 않은 명령

- `npm run build:processed`
- `npm run server:refresh`
- `npm run crawl:*`
- `node scripts/build-processed.js`
- JSON 파싱 검증 명령
- 데이터 백업
- `git add`
- `git commit`

### 다음 작업 제안

- 사용자 허락 후 `processed/campaigns.json`과 `processed/cache.json`을 별도 `backups/processed-YYYYMMDD-HHMM/` 위치에 백업한다.
- `out/` 원본 데이터가 없으므로 크롤링까지 다시 할지, 기존 raw 데이터를 확보할지 먼저 결정한다.
- 이후 사용자 허락을 받고 재생성 명령을 실행한다.
- 재생성 후 JSON 유효성, `target/supportType/category/title/tags` 조건을 검증한다.

## 2026-05-14 데이터 재생성 실행 시도

### 작업 목적

- 기존 `processed/campaigns.json`과 `processed/cache.json`을 백업한다.
- `out/` 원본 데이터 존재 여부를 확인한다.
- `out/`이 없으면 크롤링까지 포함하는 재생성 명령을 실행한다.
- 재생성 결과와 검증 결과를 기록한다.

### 실행 전 git 상태

```text
 M codex/codex-rules.md
 M codex/project-status.md
 M codex/work-log.md
 M scripts/build-processed.js
 M scripts/llm-ollama.js
?? codex/category-implementation-plan.md
?? codex/category-taxonomy-plan.md
?? codex/regeneration-readiness-check.md
?? codex/ui-chip-filter-plan.md
```

### 백업한 파일

백업 위치:

```text
backups/processed-20260514-0126/
```

백업 파일:

- `processed/campaigns.json`
- `processed/cache.json`

`out/` 폴더는 존재하지 않아 `out/*.json`은 백업하지 않았다.

### 실행한 명령

```powershell
npm run server:refresh
```

선택 이유:

- 프로젝트 루트에 `out/` 폴더가 없었다.
- 따라서 기존 raw JSON 기반 `npm run build:processed`보다 크롤링까지 포함하는 `npm run server:refresh`가 적합하다고 판단했다.

### 실행 결과

실패.

오류 요약:

```text
[refresh] crawling sources...
Error: spawnSync npm.cmd EINVAL
```

실패 위치:

- `scripts/server-refresh.js`가 내부에서 `npm run crawl:now:json`을 호출하려는 첫 단계

### 생성/수정된 파일

- 생성: `backups/processed-20260514-0126/campaigns.json`
- 생성: `backups/processed-20260514-0126/cache.json`
- 생성: `codex/regeneration-result.md`
- 수정: `codex/work-log.md`

### 수정하지 않은 파일

- `processed/campaigns.json`
- `processed/cache.json`
- `package.json`
- `server.js`
- `main_service.html`
- `index.html`
- `README.md`
- `src/`
- `scripts/llm-ollama.js`
- `scripts/build-processed.js`

### 검증 결과

- 재생성이 실패했으므로 새 JSON 유효성 검증은 수행하지 않았다.
- 재생성이 실패했으므로 새 스키마 검증은 수행하지 않았다.
- `target/supportType` 새 데이터는 생성되지 않았다.

### 남은 문제

- `out/` 폴더가 없어 `build:processed`만으로 재생성을 진행하기 어렵다.
- `server:refresh` 내부 npm 호출이 `spawnSync npm.cmd EINVAL` 오류로 실패한다.
- 재생성 성공 전까지 UI를 `target/supportType` 기준으로 수정하면 안 된다.

### 다음 작업 제안

- `spawnSync npm.cmd EINVAL` 원인을 별도로 확인한다.
- 사용자 허락 후 개별 npm script를 순서대로 실행하는 대체 경로를 검토한다.
- 대체 후보는 `npm run crawl:now:json`, `npm run crawl:goodneighbors:json`, `npm run crawl:happybean:json`, `npm run build:processed` 순서다.

## 2026-05-14 개별 npm 명령 재시도

### 작업 목적

- `server:refresh` 내부 npm 호출 실패를 우회하기 위해 개별 npm 명령을 순서대로 직접 실행한다.
- 첫 번째 크롤링 성공 후 다음 크롤링으로 진행하고, 3개 크롤링이 모두 성공하면 `build:processed`를 실행할 계획이었다.

### 실행 전 상태

- `backups/processed-20260514-0126/` 백업 폴더가 존재한다.
- 백업 파일 `campaigns.json`, `cache.json`이 존재한다.
- `out/` 폴더는 존재하지 않는다.

### 실행한 명령

```powershell
npm run crawl:now:json
```

### 성공한 명령

- 없음

### 실패한 명령

- `npm run crawl:now:json`

오류 요약:

```text
Error: Cannot find module 'cheerio'
```

### 실행하지 않은 명령

- `npm run crawl:goodneighbors:json`
- `npm run crawl:happybean:json`
- `npm run build:processed`

첫 번째 명령이 실패했으므로 요청 조건에 따라 다음 명령으로 진행하지 않았다.

### 생성/수정된 파일

- 수정: `codex/regeneration-result.md`
- 수정: `codex/work-log.md`

### 수정하지 않은 파일

- `processed/campaigns.json`
- `processed/cache.json`
- `package.json`
- `server.js`
- `main_service.html`
- `index.html`
- `README.md`
- `src/`
- `scripts/server-refresh.js`
- `scripts/llm-ollama.js`
- `scripts/build-processed.js`

### 검증 결과

- `out/` 폴더는 생성되지 않았다.
- `node_modules/cheerio`가 존재하지 않는 것으로 확인했다.
- `processed/campaigns.json`과 `processed/cache.json`은 기존 크기와 수정 시각을 유지했다.
- 새 JSON 산출물이 없어 JSON 유효성 검증과 새 스키마 검증은 수행하지 않았다.

### 남은 문제

- 의존성 `cheerio`가 설치되어 있지 않아 CLI가 시작되지 못한다.
- 현재 상태에서는 크롤링과 processed 재생성을 진행할 수 없다.

### 다음 작업 제안

- 사용자 허락 후 `npm ci` 또는 `npm install`로 의존성을 설치할지 결정한다.
- 의존성 설치 후 개별 크롤링 명령을 다시 순서대로 실행한다.

## 2026-05-14 의존성 설치 후 데이터 재생성

### 작업 목적

- 누락된 프로젝트 의존성을 설치한다.
- 개별 크롤링 명령을 순서대로 실행해 `out/*.json`을 생성한다.
- `npm run build:processed`로 새 `target/supportType` 스키마의 processed 데이터를 재생성한다.
- JSON 유효성 및 새 스키마 조건을 검증한다.

### 실행한 명령

```powershell
npm ci
npm run crawl:now:json
npm run crawl:now:json
npm run crawl:goodneighbors:json
npm run crawl:happybean:json
npm run build:processed
```

첫 번째 `npm run crawl:now:json`은 샌드박스 네트워크 제한으로 보이는 `EACCES` 오류가 발생했고, 네트워크 권한으로 재실행해 성공했다.

### 성공한 명령

- `npm ci`
- `npm run crawl:now:json` 네트워크 권한 재실행
- `npm run crawl:goodneighbors:json`
- `npm run crawl:happybean:json`
- `npm run build:processed`

### 실패한 명령

- `npm run crawl:now:json` 최초 실행

오류 요약:

```text
TypeError: fetch failed
connect EACCES 211.249.222.38:443
```

### 생성된 out 파일

- `out/fundraisings-now.json` 156431 bytes
- `out/goodneighbors-campaigns.json` 26554 bytes
- `out/happybean-donations.json` 835598 bytes

### 생성/수정된 파일

- 생성: `node_modules/`
- 생성: `out/fundraisings-now.json`
- 생성: `out/goodneighbors-campaigns.json`
- 생성: `out/happybean-donations.json`
- 수정: `processed/campaigns.json`
- 수정: `processed/cache.json`
- 수정: `codex/regeneration-result.md`
- 수정: `codex/work-log.md`

### 검증 결과

- `processed/campaigns.json` JSON 파싱 성공
- `processed/cache.json` JSON 파싱 성공
- `count`와 `items.length`는 모두 1336으로 일치
- `target` 누락 0개
- `supportType` 누락 0개
- 허용 목록 밖 target 0개
- 허용 목록 밖 supportType 0개
- `category !== target` 0개
- `raw.titleRaw`가 있는데 `title !== raw.titleRaw`인 항목 0개
- tags가 배열이 아닌 항목 0개
- tags가 5개를 초과하는 항목 0개

### target/supportType 분포

- target 고유값: `기타`
- supportType 고유값: `기타`
- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타인 항목: 1336개, 100.00%

### 남은 문제

- `npm run build:processed` 실행 중 Ollama가 `http://127.0.0.1:11434`에서 접근되지 않았다.
- LLM 정제가 수행되지 않아 모든 item이 fallback `기타`로 생성되었다.
- 새 스키마 구조는 만들어졌지만, 실제 분류 품질은 아직 확보되지 않았다.

### 다음 작업 제안

- Ollama 서버 실행 여부와 모델 설치 여부를 확인한다.
- 필요하면 `OLLAMA_MODEL`을 실제 설치된 모델명으로 지정한다.
- Ollama 준비 후 `npm run build:processed`를 다시 실행한다.
- 기타 비율과 샘플 분류 품질을 재검증한 뒤 UI 수정으로 넘어간다.

## 2026-05-14 Ollama 연결 상태 점검

### 작업 목적

- Ollama CLI와 로컬 API 연결 상태를 확인한다.
- Ollama가 실행 가능한 상태라면 `npm run build:processed`를 재실행해 LLM 정제를 수행하려 했다.
- 현재 `target/supportType/tags` 품질 상태를 다시 검증한다.

### 실행한 명령

```powershell
git status --short
ollama list
Invoke-RestMethod http://127.0.0.1:11434/api/tags
node -e 형태의 JSON/스키마 검증
```

### 성공한 명령

- `git status --short`
- processed JSON/스키마 검증

### 실패한 명령

- `ollama list`
- `http://127.0.0.1:11434/api/tags` 접근

오류 요약:

```text
ollama 명령을 인식할 수 없음
원격 서버에 연결할 수 없음
```

### 실행하지 않은 명령

- `npm run build:processed`

실행하지 않은 이유:

- Ollama CLI와 API가 모두 사용 불가능해, 재실행해도 LLM 정제 없이 fallback `기타`가 반복될 가능성이 높다.

### 생성/수정된 파일

- 수정: `codex/regeneration-result.md`
- 수정: `codex/work-log.md`

### 검증 결과

- `processed/campaigns.json` JSON 파싱 정상
- `processed/cache.json` JSON 파싱 정상
- count 1336, items.length 1336 일치
- target/supportType 누락 0개
- 허용 목록 밖 target/supportType 0개
- `category === target` 조건 통과
- `title === raw.titleRaw` 조건 통과
- tags 배열 조건 및 최대 5개 조건 통과

### 품질 결과

- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타 비율: 100.00%
- tags 빈 배열 비율: 100.00%

### 남은 문제

- Ollama가 설치되어 있지 않거나 PATH에 없다.
- Ollama 서버가 `127.0.0.1:11434`에서 실행 중이 아니다.
- LLM 정제가 아직 수행되지 않아 UI 필터에 사용할 분류 품질이 없다.

### 다음 작업 제안

- 사용자 로컬 환경에서 Ollama 설치/PATH 등록/서버 실행을 먼저 진행한다.
- `ollama list`가 정상 출력되면 사용할 모델을 확인한다.
- 이후 `npm run build:processed`를 다시 실행하고 기타 비율 및 샘플 품질을 재검증한다.

## 2026-05-14 Ollama 설치 경로 추가 점검

### 작업 목적

- PATH에서 Ollama가 인식되지 않는 문제를 확인한다.
- Windows 기본 설치 경로와 흔한 설치 위치를 확인한다.
- Ollama 서버와 모델 확인이 가능하면 `build:processed` 재실행을 준비한다.

### 실행한 명령

```powershell
where.exe ollama
Test-Path C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe
Test-Path C:\Users\rhksd\AppData\Local\Ollama\ollama.exe
Test-Path C:\Program Files\Ollama\ollama.exe
Test-Path C:\Program Files (x86)\Ollama\ollama.exe
Invoke-RestMethod http://127.0.0.1:11434/api/tags
node -e 형태의 processed 스키마/분포 검증
```

### 확인 결과

- `where.exe ollama` 결과 PATH에서 Ollama를 찾지 못했다.
- 사용자 지정 기본 경로 `C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe`도 존재하지 않았다.
- `C:\Users\rhksd\AppData\Local\Ollama\ollama.exe`, `C:\Program Files\Ollama\ollama.exe`, `C:\Program Files (x86)\Ollama\ollama.exe`도 존재하지 않았다.
- `http://127.0.0.1:11434/api/tags` 연결도 실패했다.

### 실행하지 않은 명령

- `npm run build:processed`

실행하지 않은 이유:

- Ollama 실행 파일과 서버가 모두 확인되지 않았다.
- 사용 가능한 모델 목록을 확인하지 못했다.
- 재실행해도 LLM 정제 없이 fallback 결과가 반복될 가능성이 높다.

### 생성/수정된 파일

- 수정: `codex/regeneration-result.md`
- 수정: `codex/work-log.md`

### 현재 품질 지표

- count와 items.length: 1336으로 일치
- target 누락: 0개
- supportType 누락: 0개
- 허용 목록 밖 target/supportType: 0개
- `category !== target`: 0개
- `title !== raw.titleRaw`: 0개
- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타 비율: 100.00%
- tags 빈 배열 비율: 100.00%

### 남은 문제

- Ollama가 설치되어 있지 않거나 현재 작업 환경에서 접근할 수 없다.
- LLM 정제 결과가 없어 분류 품질이 확보되지 않았다.
- UI 수정은 아직 진행하면 안 된다.

### 다음 작업 제안

- Ollama 설치 여부를 사용자 환경에서 확인한다.
- Ollama 설치 후 `ollama list`가 정상 출력되는지 확인한다.
- 사용 가능한 모델명을 확인한 뒤 `OLLAMA_MODEL`을 지정해 `npm run build:processed`를 다시 실행한다.

## 2026-05-14 Ollama 재확인 및 build 보류

### 작업 목적

- Ollama CLI 인식 여부를 다시 확인한다.
- Windows 기본 설치 경로와 흔한 설치 위치를 확인한다.
- Ollama 서버/API와 모델 목록을 확인한다.
- 모델이 확인되면 `OLLAMA_MODEL`을 지정해 `npm run build:processed`를 재실행하려 했다.

### 실행한 명령

```powershell
git status --short
where.exe ollama
ollama --version
ollama list
Test-Path C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe
& C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe --version
& C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe list
Invoke-RestMethod http://127.0.0.1:11434/api/tags
node -e 형태의 processed 스키마/분포 검증
```

### 사용한 모델

- 없음

### 성공/실패 여부

- `git status --short`: 성공
- `where.exe ollama`: 실패, PATH에서 찾지 못함
- `ollama --version`: 실패
- `ollama list`: 실패
- 기본 경로 `ollama.exe` 실행: 실패, 파일 없음
- Ollama API 연결: 실패
- processed 스키마/분포 검증: 성공

### 실행하지 않은 명령

- `npm run build:processed`

실행하지 않은 이유:

- 사용 가능한 Ollama 모델을 확인하지 못했다.
- Ollama 서버/API가 접근되지 않는다.
- 재실행하면 fallback `기타` 결과가 반복될 가능성이 높다.

### 생성/수정된 파일

- 수정: `codex/regeneration-result.md`
- 수정: `codex/work-log.md`

### 검증 결과

- count와 items.length: 1336으로 일치
- target 누락: 0개
- supportType 누락: 0개
- 허용 목록 밖 target/supportType: 0개
- `category !== target`: 0개
- `title !== raw.titleRaw`: 0개
- tags 배열/최대 5개 조건: 통과
- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타 비율: 100.00%
- tags 빈 배열 비율: 100.00%

### 남은 문제

- Ollama가 현재 환경에서 설치되어 있지 않거나 접근되지 않는다.
- 사용 가능한 모델 목록을 확인할 수 없다.
- LLM 정제 결과가 없어 분류와 tags 품질이 확보되지 않았다.

### 다음 작업 제안

- Ollama 설치 및 서버 실행을 먼저 완료한다.
- `ollama list`에서 `llama3.2:1b` 또는 `llama3.1:8b` 모델을 확인한다.
- 모델 확인 후 `OLLAMA_MODEL`을 지정해 `npm run build:processed`를 다시 실행한다.

## 2026-05-14 Ollama 설치 후 재실행 결과 검증

### 작업 목적

- 사용자가 Ollama 설치 후 `npm run build:processed`를 다시 실행했다고 알려준 상태에서 현재 processed 결과를 검증한다.
- JSON 파싱, 새 스키마 조건, target/supportType/tags 품질, cache refined schema 상태를 확인한다.

### 실행한 명령

```powershell
git status --short
Get-Item processed\campaigns.json, processed\cache.json
node -e 형태의 processed/cache JSON 및 스키마 검증
```

### 검증 대상 파일

- `processed/campaigns.json`
- `processed/cache.json`

### 검증 결과

- `processed/campaigns.json` JSON 파싱 정상
- `processed/cache.json` JSON 파싱 정상
- count 1336, items.length 1336으로 일치
- target 누락 0개
- supportType 누락 0개
- 허용 목록 밖 target/supportType 0개
- `category !== target` 0개
- `title !== raw.titleRaw` 0개
- tags 배열/최대 5개 조건 통과

### 품질 결과

- target 분포: `기타` 1336개
- supportType 분포: `기타` 1336개
- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타 비율: 100.00%
- tags 빈 배열 비율: 100.00%

### cache 확인

- `cache.refinedSchemaVersion`: 2
- cache item 수: 1195
- `schemaVersion: 2` cache item 수: 0
- refined object 수: 1179
- refined null 수: 16

### 판단

- 구조 검증은 정상이다.
- title 원본 유지도 정상이다.
- 그러나 현재 파일 기준으로는 LLM 정제가 새 스키마 cache에 반영되지 않았다.
- 분류 품질은 개선되지 않았고, UI 수정으로 넘어가기 어렵다.

### 생성/수정된 파일

- 수정: `codex/regeneration-result.md`
- 수정: `codex/work-log.md`

### 다음 작업 제안

- Ollama 설치 후 실행한 `npm run build:processed` 로그를 확인한다.
- `Ollama not reachable`이 사라졌는지, `llm summary ok=...`가 출력됐는지 확인한다.
- 필요하면 `FORCE_REFINE=true`와 `OLLAMA_MODEL=<모델명>`을 지정해 강제 재정제를 실행한다.

## 2026-05-18 llama3.2:1b 설치 및 부분 재정제

### 작업 목적

- Ollama 모델 `llama3.2:1b`를 설치한다.
- 강제 재정제를 실행해 LLM refined 결과가 실제 cache에 생성되는지 확인한다.
- 부분 정제 결과를 `processed/campaigns.json`에 반영하고 품질을 확인한다.

### 실행한 명령

```powershell
& 'C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe' pull llama3.2:1b
& 'C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe' list
$env:OLLAMA_MODEL='llama3.2:1b'; $env:FORCE_REFINE='true'; npm run build:processed
$env:OLLAMA_MODEL='llama3.2:1b'; $env:FORCE_REFINE='false'; $env:MAX_REFINE='0'; npm run build:processed
```

### 결과

- `llama3.2:1b` 다운로드 성공
- Ollama API에서 모델 확인 성공
- 강제 재정제 시작 성공
- 1시간 제한으로 전체 완료 전 타임아웃
- cache에는 `schemaVersion: 2` 항목 720개가 생겼고, refined object는 710개다.
- 현재 cache를 병합해 `processed/campaigns.json`에 부분 정제 결과를 반영했다.

### 검증 결과

- target 기타 비율: 49.85%
- supportType 기타 비율: 50.60%
- tags 빈 배열 비율: 49.40%
- `title !== raw.titleRaw`: 0개
- `category !== target`: 0개

### 남은 문제

- 전체 1336개 중 일부만 LLM 정제됐다.
- 분류가 `아동/청소년`, `생계지원`으로 강하게 쏠린다.
- 샘플 중 일부는 제목과 분류가 맞지 않는다.

### 다음 작업 제안

- 남은 항목을 이어서 정제한다.
- 전체 정제 완료 후 분포와 샘플 품질을 다시 확인한다.
- 모델 품질이 부족하면 더 큰 모델 또는 규칙 기반 보정을 검토한다.

## 2026-05-18 전체 정제 완료 및 최종 보정

### 작업 목적

- 남은 LLM 정제를 끝까지 실행한다.
- `target/supportType/tags`가 실제 검색/필터에 쓸 수 있는 수준인지 확인한다.
- LLM 쏠림을 줄이기 위해 명확한 키워드 기반 최종 보정을 적용한다.

### 실행한 명령

```powershell
$env:OLLAMA_MODEL='llama3.2:1b'; $env:FORCE_REFINE='false'; npm run build:processed
$env:OLLAMA_MODEL='llama3.2:1b'; $env:FORCE_REFINE='false'; $env:MAX_REFINE='0'; npm run build:processed
```

### 수정한 파일

- `scripts/llm-ollama.js`
- `processed/campaigns.json`
- `processed/cache.json`
- `codex/regeneration-result.md`
- `codex/work-log.md`

### 검증 결과

- count/items.length: 1336/1336 일치
- target 누락: 0개
- supportType 누락: 0개
- 허용 목록 밖 target/supportType: 0개
- `title !== raw.titleRaw`: 0개
- `category !== target`: 0개
- tags 배열/최대 5개 조건: 통과
- target 기타 비율: 0.67%
- supportType 기타 비율: 2.84%
- target/supportType 모두 기타 비율: 0.00%
- tags 빈 배열 비율: 1.80%

### 품질 판단

- 전부 `기타`였던 상태는 해결됐다.
- LLM 정제와 규칙 기반 보정을 함께 사용해 분류 품질이 실사용 가능한 수준으로 올라왔다.
- 일부 복합 대상/복합 지원 유형 캠페인은 단일 라벨 선택의 한계가 있어 수동 샘플 검토가 필요하다.

### 다음 작업 제안

- UI 수정 전에 샘플 20~30개를 수동 확인한다.
- 이후 `main_service.html`에서 카드 chip과 필터 구조를 `target/supportType` 기준으로 변경한다.

## 2026-05-18 UI target/supportType 반영

### 작업 목적

- 새 `target/supportType/tags` 데이터를 실제 UI에 표현한다.
- 기존 category 단일 필터를 `대상/지원 유형/플랫폼/검색어` 구조로 바꾼다.
- 카드 상단 chip을 `platform/target/supportType`으로 변경한다.

### 수정한 파일

- `main_service.html`
- `codex/work-log.md`

### 주요 변경

- `category` select를 제거하고 `target`, `supportType` select를 추가했다.
- 카드 상단 chip을 `platform`, `target`, `supportType` 순서로 표시하도록 변경했다.
- 하단 tags는 최대 5개를 `#태그` 형태로 표시하도록 변경했다.
- 검색 대상에 `target`, `supportType`, `raw.categoryRaw`를 포함했다.
- 기존 데이터 호환을 위해 `target`이 없으면 `category`를 fallback으로 사용한다.

### 검증 결과

- 로컬 서버 `http://127.0.0.1:8787` 실행 확인
- `/api/campaigns` 응답 count 1336 확인
- 브라우저 검증에서 `target` 옵션과 `supportType` 옵션이 표시됨을 확인
- 첫 카드가 `Kakao Together / 노인 / 식사지원` chip으로 표시됨을 확인
- 기존 `#category` select가 사라진 것을 확인
- `대상=노인` 필터 결과 283개 확인
- `대상=노인`, `지원 유형=식사지원` 필터 결과 56개 확인

### 다음 작업 제안

- 실제 브라우저에서 모바일 폭과 긴 태그/긴 제목 표시를 확인한다.
- 샘플 카드 몇 개를 사람이 보고 분류 품질을 최종 확인한다.

## 2026-05-18 해시태그 검색 및 클릭 필터 개선

### 작업 목적

- tags를 단순 하단 표시가 아니라 카드 상단 chip 영역에서 카테고리성 검색 요소로 사용한다.
- 검색창에서 `#고양이 #치료비` 같은 해시태그 검색이 가능하게 한다.
- 카드의 태그 chip을 클릭하면 해당 태그로 바로 검색되게 한다.

### 수정한 파일

- `main_service.html`
- `codex/work-log.md`

### 주요 변경

- 검색창 placeholder를 해시태그 검색 예시 중심으로 바꿨다.
- 카드 상단 chip 영역에 `platform`, `target`, `supportType`, `#tags`를 함께 표시한다.
- 하단 tags 중복 표시는 제거했다.
- 태그 chip을 버튼으로 바꾸고 `data-tag`를 추가했다.
- 태그 chip 클릭 시 검색창에 `#태그`가 입력되고 즉시 필터링된다.
- 검색 로직에서 `#태그` 토큰을 인식해 tags와 본문 검색 대상에 매칭하도록 했다.

### 검증 결과

- 첫 카드 상단에 태그 5개가 표시되는 것을 확인했다.
- `#어르신` 검색 결과 262개 표시를 확인했다.
- 첫 카드의 `#식사지원` chip 클릭 시 검색창이 `#식사지원`으로 바뀌는 것을 확인했다.
- `#식사지원` 클릭 검색 결과 113개 표시를 확인했다.

### 다음 작업 제안

- 태그가 너무 많은 카드에서 모바일 줄바꿈을 확인한다.
- 자주 쓰는 태그를 별도 인기 태그 영역으로 노출할지 검토한다.
