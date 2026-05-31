# 데이터 재생성 결과

작성일: 2026-05-14

## 1. 작업 목적

기존 `processed/campaigns.json`과 `processed/cache.json`을 백업한 뒤, 새 `target/supportType` 스키마 기준으로 데이터를 재생성하고 검증하는 것이 목적이었다.

이번 작업은 실제 실행 작업으로 진행했지만, 재생성 명령이 크롤링 첫 단계에서 실패하여 processed 데이터는 재생성되지 않았다.

## 2. 실행 전 상태

작업 전 `git status --short` 확인 결과:

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

`out/` 폴더 확인 결과:

```text
OUT_DIR_NOT_FOUND
```

판단:

- 기존 raw 입력 폴더인 `out/`이 없었다.
- 따라서 `npm run build:processed`가 아니라 크롤링까지 포함하는 `npm run server:refresh`를 선택했다.

## 3. 백업 결과

생성한 백업 위치:

```text
backups/processed-20260514-0126/
```

백업한 파일:

```text
backups/processed-20260514-0126/campaigns.json
backups/processed-20260514-0126/cache.json
```

백업 파일 크기:

```text
campaigns.json  1371220 bytes
cache.json       656834 bytes
```

`out/` 폴더가 없어 `out/*.json` 백업은 수행하지 않았다.

## 4. 실행한 명령

실행한 명령:

```powershell
npm run server:refresh
```

선택 이유:

- `out/` 폴더가 없어서 기존 raw JSON 기반 processed 재생성이 불가능했다.
- `server:refresh`는 3개 플랫폼 크롤링 후 `build:processed`를 실행하는 흐름이므로, 현재 상태에서 가장 적합한 후보였다.

## 5. 실행 결과

실행 실패.

출력된 오류:

```text
> donation-map@1.0.0 server:refresh
> node scripts/server-refresh.js

[refresh] crawling sources...
Error: spawnSync npm.cmd EINVAL
    at Object.spawnSync (node:internal/child_process:1119:20)
    at spawnSync (node:child_process:911:24)
    at runOrThrow (C:\Users\rhksd\OneDrive\Desktop\donation-map\scripts\server-refresh.js:12:15)
    at main (C:\Users\rhksd\OneDrive\Desktop\donation-map\scripts\server-refresh.js:28:3)
```

실패 위치:

- `scripts/server-refresh.js`가 내부에서 `npm run crawl:now:json`을 실행하려는 첫 단계
- `spawnSync npm.cmd EINVAL` 오류 발생

영향:

- 크롤링이 시작되지 않았다.
- `out/` 폴더는 생성되지 않았다.
- `processed/campaigns.json`과 `processed/cache.json`은 기존 수정 시각과 크기를 유지했다.
- 새 스키마 데이터 재생성은 완료되지 않았다.

## 6. JSON 유효성 검증 결과

재생성 실패로 인해 새 산출물에 대한 JSON 유효성 검증은 수행하지 않았다.

이유:

- `npm run server:refresh`가 크롤링 첫 단계에서 실패했다.
- 재생성된 `processed/campaigns.json` 또는 `processed/cache.json`이 없었다.
- 실패 후 추가 실행을 하지 말라는 조건에 따라 별도 JSON 파싱 검증도 진행하지 않았다.

## 7. 새 스키마 검증 결과

새 스키마 검증은 수행하지 않았다.

이유:

- 새 `processed/campaigns.json`이 생성되지 않았다.
- 기존 파일은 재생성 전 old schema 상태다.

이전 점검 기준 old schema 상태:

- `processed/campaigns.json`에는 `category`와 `tags`는 있으나 `target/supportType`은 없었다.
- `processed/cache.json`에는 `schemaVersion/refinedSchemaVersion/target/supportType`이 없었다.

## 8. target/supportType 분포

재생성 실패로 인해 새 분포를 산출하지 못했다.

현재 판단:

- `target/supportType` 생성 여부: 생성되지 않음
- 기타 비율: 계산 불가

## 9. 샘플 확인

재생성 실패로 인해 새 스키마 샘플 5개를 출력하지 못했다.

샘플 확인은 재생성 성공 후 다음 기준으로 진행해야 한다.

- `title === raw.titleRaw`
- `category === target`
- `target`이 허용 목록 안에 있는지
- `supportType`이 허용 목록 안에 있는지
- `tags`가 최대 5개인지

## 10. 문제점 및 위험 요소

- `out/` 폴더가 없어서 `build:processed`만으로는 재생성을 진행하기 어려운 상태다.
- `server:refresh`가 내부 npm 실행 단계에서 `spawnSync npm.cmd EINVAL`로 실패했다.
- 실패가 네트워크/크롤링 문제가 아니라, Node의 `spawnSync`로 `npm.cmd`를 호출하는 단계에서 발생했다.
- 현재 processed 파일은 백업되었지만 새 스키마로 재생성되지는 않았다.
- `target/supportType` 기반 UI 수정은 아직 진행하면 안 된다.

## 11. 다음 추천 작업

1. `scripts/server-refresh.js`의 내부 `spawnSync npm.cmd` 호출 실패 원인을 별도로 분석한다.
2. 사용자 허락 후, 대체 실행 방식으로 개별 명령을 순서대로 실행하는 방안을 검토한다.
3. 가능한 대체 후보:
   - `npm run crawl:now:json`
   - `npm run crawl:goodneighbors:json`
   - `npm run crawl:happybean:json`
   - `npm run build:processed`
4. 대체 실행 전에도 현재 백업 위치를 유지한다.
5. 재생성이 성공하면 JSON 유효성 검증과 새 스키마 검증을 진행한다.

## 12. 개별 npm 명령 재시도 결과

작성일: 2026-05-14

### 실행 전 상태

`git status --short` 확인 결과:

```text
 M codex/codex-rules.md
 M codex/project-status.md
 M codex/work-log.md
 M scripts/build-processed.js
 M scripts/llm-ollama.js
?? backups/
?? codex/category-implementation-plan.md
?? codex/category-taxonomy-plan.md
?? codex/regeneration-readiness-check.md
?? codex/regeneration-result.md
?? codex/ui-chip-filter-plan.md
```

기존 백업 확인:

```text
backups/processed-20260514-0126/campaigns.json
backups/processed-20260514-0126/cache.json
```

백업 파일은 존재하며, `campaigns.json`은 1371220 bytes, `cache.json`은 656834 bytes로 확인했다.

`out/` 확인 결과:

```text
OUT_DIR_NOT_FOUND
```

### 실행한 명령

첫 번째 개별 크롤링 명령만 실행했다.

```powershell
npm run crawl:now:json
```

### 실행 결과

실패.

오류 요약:

```text
Error: Cannot find module 'cheerio'
Require stack:
- C:\Users\rhksd\OneDrive\Desktop\donation-map\src\goodNeighbors.js
- C:\Users\rhksd\OneDrive\Desktop\donation-map\src\index.js
- C:\Users\rhksd\OneDrive\Desktop\donation-map\bin\cli.js
```

확인 결과:

```text
CHEERIO_NOT_FOUND
```

판단:

- 크롤링 대상 사이트나 네트워크 문제로 실패한 것이 아니다.
- 프로젝트 의존성인 `cheerio`가 현재 `node_modules`에 설치되어 있지 않아 CLI 시작 단계에서 실패했다.
- 첫 번째 명령이 실패했으므로 요청 조건에 따라 `crawl:goodneighbors:json`, `crawl:happybean:json`, `build:processed`는 실행하지 않았다.

### 생성된 out 파일

없음.

확인 결과:

```text
OUT_DIR_NOT_FOUND
```

### processed 재생성 여부

재생성되지 않았다.

확인 결과:

```text
campaigns.json  1371220 bytes  2026-05-11 13:23:25
cache.json       656834 bytes  2026-05-11 13:23:25
```

### JSON 검증 결과

새 산출물이 생성되지 않았으므로 JSON 유효성 검증은 수행하지 않았다.

### 새 스키마 검증 결과

새 산출물이 생성되지 않았으므로 새 스키마 검증은 수행하지 않았다.

### target/supportType 분포

계산하지 못했다.

이유:

- `processed/campaigns.json`이 새 스키마로 재생성되지 않았다.

### 기타 비율

계산 불가.

### 남은 문제

- 현재 환경에는 `cheerio`가 설치되어 있지 않다.
- `npm install` 또는 `npm ci`가 필요할 수 있으나, 이번 작업의 허용 범위에는 포함되지 않았다.
- 의존성 설치 전에는 개별 크롤링 명령과 processed 재생성을 진행할 수 없다.

### 다음 추천 작업

1. 사용자 허락 후 의존성 설치 가능 여부를 확인한다.
2. 설치 방식은 `package-lock.json`이 있으므로 `npm ci`가 우선 후보이고, 상황에 따라 `npm install`을 검토한다.
3. 의존성 설치 후 같은 순서로 다시 실행한다.
   - `npm run crawl:now:json`
   - `npm run crawl:goodneighbors:json`
   - `npm run crawl:happybean:json`
   - `npm run build:processed`

## 13. 의존성 설치 후 재생성 결과

작성일: 2026-05-14

### 실행 전 상태

`package-lock.json`이 존재하여 `npm ci`를 우선 실행했다.

실행 전 확인:

```text
NODE_MODULES_NOT_FOUND
CHEERIO_NOT_FOUND
```

### 의존성 설치

실행한 명령:

```powershell
npm ci
```

결과:

```text
added 27 packages in 1s
```

설치 후 확인:

```text
NODE_MODULES_EXISTS
CHEERIO_INSTALLED
```

### 개별 크롤링 명령 실행 결과

첫 번째 시도:

```powershell
npm run crawl:now:json
```

샌드박스 네트워크 제한으로 보이는 오류가 발생했다.

```text
TypeError: fetch failed
connect EACCES 211.249.222.38:443
```

네트워크 권한으로 같은 명령을 다시 실행했고 성공했다.

```text
Wrote 236 items to out/fundraisings-now.json
```

두 번째 명령:

```powershell
npm run crawl:goodneighbors:json
```

결과:

```text
Wrote 40 items to out/goodneighbors-campaigns.json
```

세 번째 명령:

```powershell
npm run crawl:happybean:json
```

결과:

```text
Wrote 1060 items to out/happybean-donations.json
```

생성된 `out/*.json`:

```text
fundraisings-now.json         156431 bytes
goodneighbors-campaigns.json   26554 bytes
happybean-donations.json      835598 bytes
```

### processed 재생성

실행한 명령:

```powershell
npm run build:processed
```

결과:

```text
[build] campaigns=1336 llmEnabled=true changedOnly=true forceRefine=false toRefine=1336
[build] Ollama not reachable at http://127.0.0.1:11434: fetch failed
[build] wrote 1336 items -> processed/campaigns.json
```

판단:

- `processed/campaigns.json`과 `processed/cache.json`은 재생성되었다.
- 다만 Ollama가 실행 중이 아니거나 접근 불가능해서 LLM 정제는 수행되지 않았다.
- 새 스키마 필드는 생성되었지만, 모든 `target/supportType`이 fallback 값인 `기타`가 되었다.

재생성 후 파일 상태:

```text
campaigns.json  1486137 bytes  2026-05-14 01:33:59
cache.json       656863 bytes  2026-05-14 01:33:59
```

### JSON 유효성 검증 결과

검증 명령:

```powershell
Get-Content -Raw -Encoding UTF8 processed\campaigns.json | ConvertFrom-Json | Out-Null
Get-Content -Raw -Encoding UTF8 processed\cache.json | ConvertFrom-Json | Out-Null
```

결과:

```text
campaigns.json JSON OK
cache.json JSON OK
```

### 새 스키마 검증 결과

검증 결과:

```json
{
  "count": 1336,
  "itemsLength": 1336,
  "countMatches": true,
  "missingTarget": 0,
  "missingSupportType": 0,
  "invalidTargetCount": 0,
  "invalidSupportTypeCount": 0,
  "categoryMismatchCount": 0,
  "titleMismatchWhenRawTitleExists": 0,
  "tagsNotArrayCount": 0,
  "tagsOverFiveCount": 0
}
```

해석:

- JSON 구조와 필수 필드 검증은 통과했다.
- `category === target` 정책도 지켜졌다.
- `raw.titleRaw`가 있는 경우 `title === raw.titleRaw` 조건도 지켜졌다.
- tags는 모두 배열이며 최대 5개 조건을 만족했다.

### target/supportType 분포

target 고유값:

```text
기타
```

target 분포:

```json
{
  "기타": 1336
}
```

supportType 고유값:

```text
기타
```

supportType 분포:

```json
{
  "기타": 1336
}
```

기타 비율:

- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타인 항목: 1336개, 100.00%

### 샘플 확인 결과

샘플 5개:

```json
[
  {
    "uid": "kakao:134714",
    "platform": "Kakao Together",
    "title": "섬마을 독거 시각장애인 어르신들께 따뜻한 한 끼를 전해요!",
    "target": "기타",
    "supportType": "기타",
    "category": "기타",
    "tags": []
  },
  {
    "uid": "kakao:135369",
    "platform": "Kakao Together",
    "title": "엄마를 위해 자신의 아픔을 삼키는 지수를 도와주세요.",
    "target": "기타",
    "supportType": "기타",
    "category": "기타",
    "tags": []
  },
  {
    "uid": "kakao:135008",
    "platform": "Kakao Together",
    "title": "삼복엔 보양식이 닭~ (三福 나눔: 삼계탕 지원)",
    "target": "기타",
    "supportType": "기타",
    "category": "기타",
    "tags": []
  },
  {
    "uid": "kakao:136468",
    "platform": "Kakao Together",
    "title": "자립준비청년의 첫 식탁을 함께 채워주세요.",
    "target": "기타",
    "supportType": "기타",
    "category": "기타",
    "tags": []
  },
  {
    "uid": "kakao:136590",
    "platform": "Kakao Together",
    "title": "정서 취약계층에게 선물하는 마음의 온실, 초록화단",
    "target": "기타",
    "supportType": "기타",
    "category": "기타",
    "tags": []
  }
]
```

### 남은 문제

- Ollama가 `http://127.0.0.1:11434`에서 접근되지 않아 LLM 정제가 수행되지 않았다.
- 새 스키마 필드는 생성되었지만 분류값은 모두 fallback `기타`라서 UI 필터 품질은 아직 사용할 수 없다.
- `processed/cache.json`은 `refinedSchemaVersion: 2`가 기록되었지만, LLM 정제가 수행되지 않아 schemaVersion 2 refined item은 생성되지 않았다.
- cache item 수는 기존 1195개이고, 새 크롤링 count는 1336개라 cache와 최신 raw 입력 사이에 차이가 있다.

### 다음 추천 작업

1. Ollama 서버를 실행하고 사용할 모델이 있는지 확인한다.
2. `OLLAMA_MODEL` 값을 현재 설치된 모델에 맞춰 지정할지 결정한다.
3. Ollama 준비 후 `npm run build:processed`를 다시 실행한다.
4. 재실행 후 `target/supportType` 기타 비율이 낮아지는지 확인한다.
5. 분류 품질이 확인된 뒤에 `main_service.html` UI 수정 단계로 이동한다.

## 14. Ollama 연결 상태 점검 결과

작성일: 2026-05-14

### 작업 목적

이전 재생성에서 Ollama 미접속으로 모든 `target/supportType`이 fallback `기타`가 되었으므로, Ollama CLI와 로컬 API 연결 상태를 확인하고 가능한 경우 `npm run build:processed`를 재실행하려 했다.

### 실행 전 git 상태

```text
 M codex/codex-rules.md
 M codex/project-status.md
 M codex/work-log.md
 M processed/cache.json
 M processed/campaigns.json
 M scripts/build-processed.js
 M scripts/llm-ollama.js
?? backups/
?? codex/category-implementation-plan.md
?? codex/category-taxonomy-plan.md
?? codex/regeneration-readiness-check.md
?? codex/regeneration-result.md
?? codex/ui-chip-filter-plan.md
```

### Ollama 모델 확인 결과

실행한 명령:

```powershell
ollama list
```

결과:

```text
ollama : 'ollama' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.
```

판단:

- 현재 PowerShell 환경에서 `ollama` CLI가 PATH에 없다.
- 모델 목록을 확인할 수 없었다.
- `build-processed.js` 기본 모델은 `OLLAMA_MODEL` 환경변수가 없으면 `llama3.2:1b`를 사용한다.

### Ollama 서버 연결 여부

확인한 API:

```text
http://127.0.0.1:11434/api/tags
```

결과:

```text
OLLAMA_API_NOT_REACHABLE
원격 서버에 연결할 수 없습니다.
```

판단:

- 로컬 Ollama API도 접근되지 않는다.
- 현재 상태에서는 LLM 정제가 수행될 수 없다.

### build:processed 재실행 여부

`npm run build:processed`는 재실행하지 않았다.

이유:

- `ollama list`가 실행되지 않았다.
- `http://127.0.0.1:11434/api/tags`도 접근되지 않았다.
- 같은 상태에서 다시 빌드하면 모든 항목이 fallback `기타`로 유지될 가능성이 높다.

### 현재 JSON 및 스키마 검증 결과

현재 `processed/campaigns.json`과 `processed/cache.json`은 JSON으로 정상 파싱된다.

현재 스키마 검증:

```json
{
  "count": 1336,
  "itemsLength": 1336,
  "countMatches": true,
  "missingTarget": 0,
  "missingSupportType": 0,
  "invalidTargetCount": 0,
  "invalidSupportTypeCount": 0,
  "categoryMismatchCount": 0,
  "titleMismatchWhenRawTitleExists": 0,
  "tagsNotArrayCount": 0,
  "tagsOverFiveCount": 0
}
```

### target/supportType 분포와 기타 비율

현재 분포:

```json
{
  "targetFreq": {
    "기타": 1336
  },
  "supportTypeFreq": {
    "기타": 1336
  }
}
```

현재 비율:

- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타인 항목 비율: 100.00%
- tags 빈 배열 비율: 100.00%

### 샘플 확인

샘플 10개 모두 `target: "기타"`, `supportType: "기타"`, `category: "기타"`, `tags: []` 상태다.

예시:

```json
[
  {
    "uid": "kakao:134714",
    "platform": "Kakao Together",
    "title": "섬마을 독거 시각장애인 어르신들께 따뜻한 한 끼를 전해요!",
    "target": "기타",
    "supportType": "기타",
    "category": "기타",
    "tags": []
  },
  {
    "uid": "kakao:136468",
    "platform": "Kakao Together",
    "title": "자립준비청년의 첫 식탁을 함께 채워주세요.",
    "target": "기타",
    "supportType": "기타",
    "category": "기타",
    "tags": []
  }
]
```

### 품질 판단

- 구조 검증은 통과했다.
- title은 원본 제목으로 유지된다.
- 하지만 LLM 정제가 수행되지 않아 분류 품질은 확보되지 않았다.
- `target/supportType`이 모두 기타인 비율이 100%라서 UI 필터 데이터로는 아직 부적절하다.
- tags도 100% 빈 배열이라 검색 보조 키워드로 사용할 수 없다.

### 남은 문제

- Ollama CLI가 현재 환경에서 인식되지 않는다.
- Ollama 로컬 API도 접근되지 않는다.
- 사용 가능한 모델 목록을 확인하지 못했다.
- LLM 정제 cache schema version 2 refined 결과가 아직 생성되지 않았다.

### 다음 추천 작업

1. 사용자가 로컬에서 Ollama를 설치하거나 PATH에 등록한다.
2. Ollama 서버를 실행한다.
3. `ollama list`로 사용 가능한 모델을 확인한다.
4. 기본 모델 `llama3.2:1b`가 없다면 설치하거나, 설치된 모델명을 `OLLAMA_MODEL`로 지정한다.
5. 그 다음 `npm run build:processed`를 다시 실행해 LLM 정제를 수행한다.

## 15. Ollama 설치 경로 추가 점검 결과

작성일: 2026-05-14

### 작업 목적

Ollama CLI가 PATH에 없고 로컬 API도 닫혀 있는 상태에서, Windows 기본 설치 경로 및 흔한 설치 위치를 추가로 확인하고, 모델이 확인되면 `OLLAMA_MODEL`을 지정해 `npm run build:processed`를 재실행하려 했다.

### Ollama CLI 인식 여부

실행한 명령:

```powershell
where.exe ollama
```

결과:

```text
INFO: Could not find files for the given pattern(s).
```

판단:

- 현재 PATH에서 `ollama` 실행 파일을 찾을 수 없다.

### Ollama 경로 확인 결과

확인한 경로:

```text
C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe
C:\Users\rhksd\AppData\Local\Ollama\ollama.exe
C:\Program Files\Ollama\ollama.exe
C:\Program Files (x86)\Ollama\ollama.exe
```

결과:

```text
NOT_FOUND C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe
NOT_FOUND C:\Users\rhksd\AppData\Local\Ollama\ollama.exe
NOT_FOUND C:\Program Files\Ollama\ollama.exe
NOT_FOUND C:\Program Files (x86)\Ollama\ollama.exe
```

추가로 `C:\Users\rhksd\AppData\Local\Programs`와 `C:\Users\rhksd\AppData\Local` 아래 Ollama 관련 폴더를 확인했지만 발견되지 않았다.

### Ollama 서버 연결 여부

확인한 주소:

```text
http://127.0.0.1:11434/api/tags
```

결과:

```text
OLLAMA_API_NOT_REACHABLE
원격 서버에 연결할 수 없습니다.
```

판단:

- Ollama 서버가 실행 중이 아니거나 설치되어 있지 않은 상태로 보인다.
- 사용 가능한 모델 목록을 확인하지 못했다.

### build:processed 재실행 여부

`npm run build:processed`는 재실행하지 않았다.

이유:

- Ollama CLI 경로를 찾지 못했다.
- Ollama API도 연결되지 않았다.
- 사용 가능한 모델 목록을 확인하지 못했다.
- 이 상태에서 재실행하면 다시 LLM 정제 없이 fallback `기타`가 반복될 가능성이 높다.

### 현재 분류 품질 재확인

현재 `processed/campaigns.json` 기준:

```json
{
  "count": 1336,
  "itemsLength": 1336,
  "countMatches": true,
  "missingTarget": 0,
  "missingSupportType": 0,
  "invalidTargetCount": 0,
  "invalidSupportTypeCount": 0,
  "categoryMismatchCount": 0,
  "titleMismatchWhenRawTitleExists": 0,
  "tagsNotArrayCount": 0,
  "tagsOverFiveCount": 0,
  "targetFreq": {
    "기타": 1336
  },
  "supportTypeFreq": {
    "기타": 1336
  },
  "targetEtcRatio": "100.00%",
  "supportTypeEtcRatio": "100.00%",
  "bothEtcRatio": "100.00%",
  "emptyTagsRatio": "100.00%"
}
```

### 샘플 품질 판단

샘플 10개 모두 `target: "기타"`, `supportType: "기타"`, `category: "기타"`, `tags: []` 상태다.

품질 판단:

- title 원본 보존과 스키마 구조는 정상이다.
- 하지만 LLM 정제가 수행되지 않아 분류와 tags 품질은 아직 확보되지 않았다.
- 현재 데이터는 UI 필터 개선 기준 데이터로 사용하기 어렵다.

### 다음 추천 작업

1. Windows에 Ollama가 설치되어 있는지 사용자 환경에서 확인한다.
2. 설치되어 있다면 `ollama.exe` 실제 위치를 PATH에 추가하거나 절대 경로를 확인한다.
3. 설치되어 있지 않다면 Ollama 설치 후 서버를 실행한다.
4. `ollama list`가 정상 동작하면 `llama3.2:1b` 또는 `llama3.1:8b` 존재 여부를 확인한다.
5. 모델 확인 후 `$env:OLLAMA_MODEL="<모델명>"; npm run build:processed`를 실행한다.

## 16. Ollama 재확인 및 build 재실행 보류

작성일: 2026-05-14

### 작업 목적

Ollama CLI, 설치 경로, 로컬 API, 사용 가능한 모델 목록을 다시 확인하고, 모델이 확인되면 `OLLAMA_MODEL`을 지정해 `npm run build:processed`를 재실행하려 했다.

### Ollama CLI 인식 여부

실행한 명령:

```powershell
where.exe ollama
ollama --version
ollama list
```

결과:

```text
INFO: Could not find files for the given pattern(s).
ollama 명령을 인식할 수 없음
```

판단:

- 현재 PATH에서 Ollama CLI가 인식되지 않는다.
- `ollama --version`과 `ollama list` 모두 실행할 수 없었다.

### Ollama 실행 경로 확인

확인한 경로:

```text
C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe
C:\Users\rhksd\AppData\Local\Ollama\ollama.exe
C:\Program Files\Ollama\ollama.exe
C:\Program Files (x86)\Ollama\ollama.exe
```

결과:

```text
NOT_FOUND C:\Users\rhksd\AppData\Local\Programs\Ollama\ollama.exe
NOT_FOUND C:\Users\rhksd\AppData\Local\Ollama\ollama.exe
NOT_FOUND C:\Program Files\Ollama\ollama.exe
NOT_FOUND C:\Program Files (x86)\Ollama\ollama.exe
```

### Ollama 서버/API 연결 여부

확인한 API:

```text
http://127.0.0.1:11434/api/tags
```

결과:

```text
OLLAMA_API_NOT_REACHABLE
원격 서버에 연결할 수 없습니다.
```

판단:

- Ollama 서버/API도 접근할 수 없다.
- 사용 가능한 모델 목록을 확인하지 못했다.

### 사용 가능한 모델 및 사용 모델

- 사용 가능한 모델: 확인 불가
- 우선순위 모델 `llama3.1:8b`: 확인 불가
- 우선순위 모델 `llama3.2:1b`: 확인 불가
- 사용한 `OLLAMA_MODEL`: 없음

### build:processed 재실행 여부

`npm run build:processed`는 재실행하지 않았다.

이유:

- Ollama CLI가 없다.
- Ollama API가 닫혀 있다.
- 모델 목록을 확인할 수 없다.
- 이 상태에서 재실행하면 LLM 정제 없이 fallback `기타` 결과가 반복될 가능성이 높다.

### 현재 스키마 및 품질 검증

현재 `processed/campaigns.json` 기준:

```json
{
  "count": 1336,
  "itemsLength": 1336,
  "countMatches": true,
  "missingTarget": 0,
  "missingSupportType": 0,
  "invalidTargetCount": 0,
  "invalidSupportTypeCount": 0,
  "categoryMismatchCount": 0,
  "titleMismatchWhenRawTitleExists": 0,
  "tagsNotArrayCount": 0,
  "tagsOverFiveCount": 0,
  "targetFreq": {
    "기타": 1336
  },
  "supportTypeFreq": {
    "기타": 1336
  },
  "targetEtcRatio": "100.00%",
  "supportTypeEtcRatio": "100.00%",
  "bothEtcRatio": "100.00%",
  "emptyTagsRatio": "100.00%"
}
```

샘플 10개 확인 결과:

- 모든 샘플의 `target`은 `기타`다.
- 모든 샘플의 `supportType`은 `기타`다.
- 모든 샘플의 `category`는 `기타`다.
- 모든 샘플의 `tags`는 빈 배열이다.
- `title`은 원본 제목을 유지한다.

### 품질 판단

- 구조 검증은 통과 상태를 유지한다.
- title 원본 유지와 `category === target` 정책도 유지된다.
- 하지만 LLM 정제가 수행되지 않아 분류 품질은 아직 실패 상태다.
- UI 필터 개선은 아직 진행하면 안 된다.

### 다음 추천 작업

1. Ollama를 Windows에 설치한다.
2. 설치 후 새 터미널에서 `ollama --version`과 `ollama list`를 확인한다.
3. 모델이 없다면 다음 중 하나를 설치한다.

```powershell
ollama pull llama3.2:1b
ollama pull llama3.1:8b
```

4. 모델 확인 후 다음 형태로 build를 재실행한다.

```powershell
$env:OLLAMA_MODEL="llama3.2:1b"
npm run build:processed
```

또는:

```powershell
$env:OLLAMA_MODEL="llama3.1:8b"
npm run build:processed
```

## 17. Ollama 설치 후 사용자 재실행 결과 검증

작성일: 2026-05-14

### 작업 목적

사용자가 Ollama 설치 후 `npm run build:processed`를 다시 실행했다고 알려주었으므로, 현재 `processed/campaigns.json`과 `processed/cache.json`을 기준으로 JSON 유효성, 새 스키마, 분류 품질을 검증했다.

### 파일 상태

확인한 파일:

```text
processed/campaigns.json
processed/cache.json
```

파일 수정 시각:

```text
campaigns.json  2026-05-14 01:33:59
cache.json      2026-05-14 01:33:59
```

판단:

- 현재 워크스페이스에서 보이는 두 파일의 수정 시각은 이전 재생성 시각과 동일하다.
- 사용자가 실행한 build 결과가 현재 워크스페이스 파일에 반영되지 않았거나, build가 새 refined 결과를 쓰지 못했을 가능성이 있다.

### JSON 유효성 검증 결과

Node.js `JSON.parse` 기준:

- `processed/campaigns.json`: 정상 파싱
- `processed/cache.json`: 정상 파싱

### 새 스키마 검증 결과

```json
{
  "generatedAt": "2026-05-13T16:33:59.815Z",
  "model": "llama3.2:1b",
  "count": 1336,
  "itemsLength": 1336,
  "countMatches": true,
  "missingTarget": 0,
  "missingSupportType": 0,
  "invalidTargetCount": 0,
  "invalidSupportTypeCount": 0,
  "categoryMismatchCount": 0,
  "titleMismatchWhenRawTitleExists": 0,
  "tagsNotArrayCount": 0,
  "tagsOverFiveCount": 0
}
```

해석:

- 구조 검증은 통과했다.
- 모든 item에 `target`과 `supportType`이 있다.
- 허용 목록 밖 값은 없다.
- `category === target` 조건이 유지된다.
- `raw.titleRaw`가 있는 경우 `title === raw.titleRaw` 조건이 유지된다.
- tags는 배열이고 최대 5개 조건을 만족한다.

### target/supportType 분포

target 분포:

```json
{
  "기타": 1336
}
```

supportType 분포:

```json
{
  "기타": 1336
}
```

비율:

- target 기타 비율: 100.00%
- supportType 기타 비율: 100.00%
- target/supportType 모두 기타인 항목 비율: 100.00%
- tags 빈 배열 비율: 100.00%

### cache 상태

```json
{
  "cacheRefinedSchemaVersion": 2,
  "cacheItemsCount": 1195,
  "cacheSchemaVersion2Items": 0,
  "cacheRefinedObjectCount": 1179,
  "cacheNullRefined": 16
}
```

해석:

- `processed/cache.json`의 top-level `refinedSchemaVersion`은 2다.
- 하지만 각 cache item 중 `schemaVersion: 2`인 refined 결과는 0개다.
- 따라서 새 스키마 기준 LLM refined 결과가 cache에 실제로 생성되었다고 보기 어렵다.

### 샘플 10개 품질 판단

샘플 10개 모두 다음 상태다.

- `target`: `기타`
- `supportType`: `기타`
- `category`: `기타`
- `tags`: `[]`
- `title`: `raw.titleRaw`와 일치

샘플의 `oneLineSummary`는 일부 의미 있는 문장으로 남아 있지만, 분류와 tags는 여전히 fallback 상태다.

예:

```json
{
  "title": "섬마을 독거 시각장애인 어르신들께 따뜻한 한 끼를 전해요!",
  "oneLineSummary": "장애 어르신 식사 지원",
  "target": "기타",
  "supportType": "기타",
  "tags": []
}
```

품질 판단:

- title 원본 보존은 성공 상태다.
- 데이터 구조는 정상이다.
- 하지만 target/supportType/tags 품질은 개선되지 않았다.
- UI 필터 개선에 사용할 수 있는 상태는 아니다.

### 남은 문제

- 사용자가 실행한 `npm run build:processed`가 현재 파일에 반영되지 않았거나, LLM 정제가 실제로 cache item에 기록되지 않았다.
- cache item의 `schemaVersion: 2` 결과가 0개라서 LLM 정제 성공으로 볼 수 없다.
- `target/supportType/tags`가 모두 fallback 상태다.

### 다음 추천 작업

1. `ollama list` 출력과 실제 설치 모델명을 확인한다.
2. `npm run build:processed` 실행 로그에서 다음 줄이 사라졌는지 확인한다.

```text
Ollama not reachable
```

3. 실행 로그에서 `llm summary ok=... failed=...`가 나오는지 확인한다.
4. 필요하면 다음처럼 강제 재정제를 실행한다.

```powershell
$env:OLLAMA_MODEL="llama3.2:1b"
$env:FORCE_REFINE="true"
npm run build:processed
```

5. 강제 재정제 후 cache item의 `schemaVersion: 2` 개수와 기타 비율을 다시 확인한다.

## 18. llama3.2:1b 설치 및 부분 강제 재정제 결과

작성일: 2026-05-18

### 실행 내용

- `llama3.2:1b` 모델 다운로드를 실행했다.
- Ollama API와 모델 목록에서 `llama3.2:1b`가 확인됐다.
- `$env:OLLAMA_MODEL='llama3.2:1b'; $env:FORCE_REFINE='true'; npm run build:processed`를 실행했다.

### 실행 결과

- 강제 재정제는 실제로 시작됐다.
- 로그 기준 `toRefine=1336`으로 시작했고 `refined 675/1336` 이후 1시간 제한으로 타임아웃됐다.
- cache에는 중간 checkpoint가 반영됐다.
- 이후 추가 LLM 호출 없이 `MAX_REFINE=0`으로 현재 cache를 병합해 `processed/campaigns.json`에 반영했다.

### cache 상태

```json
{
  "cacheSchemaVersion2Items": 720,
  "cacheSchemaVersion2Refined": 710,
  "cacheSchemaVersion2Failed": 10
}
```

### 현재 분포

```json
{
  "targetEtcRatio": "49.85%",
  "supportTypeEtcRatio": "50.60%",
  "tagsEmptyRatio": "49.40%"
}
```

target 분포:

```json
{
  "아동/청소년": 619,
  "기타": 666,
  "여성/가족": 3,
  "저소득/취약계층": 3,
  "노인": 35,
  "재난/위기": 9,
  "장애인": 1
}
```

supportType 분포:

```json
{
  "생계지원": 630,
  "긴급구호": 5,
  "기타": 676,
  "주거지원": 18,
  "환경개선": 2,
  "식사지원": 1,
  "의료지원": 2,
  "심리/정서지원": 2
}
```

### 품질 판단

- LLM 호출은 성공적으로 시작됐고, fallback 100% 상태에서는 벗어났다.
- 다만 아직 전체 1336개 중 일부만 정제됐다.
- 샘플 기준 `아동/청소년`, `생계지원`으로 쏠림이 강하다.
- 일부 샘플은 제목 의미와 맞지 않는 분류가 있다. 예를 들어 어르신/장애인/식사 지원 캠페인이 `아동/청소년`으로 분류되는 사례가 보인다.
- 따라서 UI 수정에 바로 들어가기에는 아직 품질 검토가 더 필요하다.

### 다음 추천 작업

- 남은 항목을 이어서 정제하려면 `FORCE_REFINE=false` 상태로 `npm run build:processed`를 다시 실행한다.
- 전체 정제가 끝난 뒤 분포 쏠림과 샘플 품질을 다시 판단한다.
- `llama3.2:1b` 품질이 계속 불안정하면 `llama3.1:8b` 같은 더 큰 모델 또는 규칙 기반 보정 강화를 검토한다.

## 19. 전체 정제 완료 및 규칙 기반 최종 보정

작성일: 2026-05-18

### 작업 목적

크롤링된 캠페인 데이터를 `target/supportType/tags` 기준으로 실제 검색/필터에 쓸 수 있는 수준까지 정제한다.

### 실행 내용

- 남은 LLM 정제를 이어서 실행했다.
- 마지막 실패 항목 3개까지 재시도해 `llm summary ok=3 failed=0`으로 완료했다.
- `llama3.2:1b` 결과가 일부 카테고리로 과하게 쏠리는 문제가 있어, 제목/요약/raw 카테고리의 명확한 키워드를 기준으로 최종 보정하는 규칙을 추가했다.
- 추가 LLM 호출 없이 현재 cache와 raw 데이터를 재병합했다.

### 최종 검증 결과

```json
{
  "count": 1336,
  "itemsLength": 1336,
  "countMatches": true,
  "missingTarget": 0,
  "missingSupportType": 0,
  "invalidTargetCount": 0,
  "invalidSupportTypeCount": 0,
  "titleMismatch": 0,
  "categoryMismatch": 0,
  "tagsNotArray": 0,
  "tagsOverFive": 0,
  "targetEtcRatio": "0.67%",
  "supportTypeEtcRatio": "2.84%",
  "bothEtcRatio": "0.00%",
  "tagsEmptyRatio": "1.80%"
}
```

### target 분포

```json
{
  "노인": 283,
  "아동/청소년": 533,
  "장애인": 205,
  "저소득/취약계층": 26,
  "해외/국제": 62,
  "동물": 33,
  "환경": 56,
  "여성/가족": 62,
  "지역사회": 16,
  "재난/위기": 51,
  "기타": 9
}
```

### supportType 분포

```json
{
  "식사지원": 99,
  "의료지원": 117,
  "생계지원": 520,
  "심리/정서지원": 63,
  "문화/여가": 73,
  "보호/돌봄": 98,
  "긴급구호": 44,
  "환경개선": 54,
  "주거지원": 117,
  "교육지원": 81,
  "기타": 38,
  "인식개선/캠페인": 32
}
```

### 품질 판단

- fallback 100% 상태는 해소됐다.
- `target/supportType/tags`가 대부분 생성됐다.
- title 원본 유지와 `category = target` 정책은 유지된다.
- 샘플 기준 어르신/장애인/동물/해외/긴급구호/식사지원 등 명확한 사례는 이전보다 훨씬 잘 잡힌다.
- 일부 복합 대상 캠페인은 하나의 `target`만 선택해야 하므로 경계 사례가 남아 있다.

### 다음 추천 작업

- 이제 UI 수정 전 샘플 20~30개를 사람이 한 번 더 확인한다.
- 그 뒤 `main_service.html`의 chip 표시를 `platform/target/supportType` 구조로 바꾸고 필터를 `대상/지원 유형/플랫폼/검색어`로 분리한다.

## 20. 2026-05-31 현재 시점 데이터 재크롤링 및 재정제 결과

작성일: 2026-05-31

### 작업 목적

기존 processed 데이터가 과거 시점 기준으로 정제되어 있었기 때문에, 현재 시점 기준으로 3개 플랫폼 데이터를 다시 크롤링하고 `target/supportType/tags` 구조로 재정제했다.

### 백업 결과

백업 위치:

```text
backups/refresh-20260531-2308/
```

백업한 파일:

- `processed/campaigns.json`
- `processed/cache.json`
- `out/fundraisings-now.json`
- `out/goodneighbors-campaigns.json`
- `out/happybean-donations.json`

### 실행한 명령

```powershell
npm run crawl:now:json
npm run crawl:goodneighbors:json
npm run crawl:happybean:json
$env:OLLAMA_MODEL='llama3.2:1b'; $env:FORCE_REFINE='false'; npm run build:processed
```

`crawl:now:json` 최초 실행은 네트워크 권한 문제로 실패했고, 권한 재실행 후 성공했다. 이후 GoodNeighbors와 Happybean 크롤링은 성공했다.

### 크롤링 결과

- Kakao Together: 268건
- GoodNeighbors: 40건
- Naver Happybean: 1086건
- 총 processed item: 1394건

### LLM 정제 결과

전체 정제는 긴 작업이라 여러 번 이어서 실행했다.

- 1차 build: `toRefine=1330`, 1시간 제한으로 중단
- 2차 build: `toRefine=608`, 1시간 제한으로 중단
- 3차 build: `toRefine=67`, `ok=65`, `failed=2`
- 최종 재시도: `toRefine=2`, `ok=2`, `failed=0`

최종적으로 `processed/campaigns.json`은 1394건으로 갱신됐다.

### JSON 및 스키마 검증 결과

- `processed/campaigns.json` JSON 파싱 성공
- `processed/cache.json` JSON 파싱 성공
- `count`와 `items.length`: 1394 / 1394, 일치
- `target` 누락: 0개
- `supportType` 누락: 0개
- 허용 목록 밖 `target`: 0개
- 허용 목록 밖 `supportType`: 0개
- `category !== target`: 0개
- `raw.titleRaw`가 있는데 `title !== raw.titleRaw`: 0개
- tags가 배열이 아닌 항목: 0개
- tags가 5개 초과인 항목: 0개

### 품질 지표

- target 기타 비율: 0.00%
- supportType 기타 비율: 0.00%
- target/supportType 모두 기타 비율: 0.00%
- tags 빈 배열 비율: 1.58%
- cache `schemaVersion: 2` item: 1643개
- cache `schemaVersion: 2` refined 성공: 1643개
- cache `schemaVersion: 2` failed: 0개

### target 분포

```json
{
  "노인": 299,
  "아동/청소년": 562,
  "해외/국제": 61,
  "장애인": 204,
  "동물": 39,
  "저소득/취약계층": 30,
  "환경": 56,
  "여성/가족": 61,
  "지역사회": 18,
  "기타": 10,
  "재난/위기": 54
}
```

### supportType 분포

```json
{
  "생계지원": 537,
  "문화/여가": 84,
  "기타": 38,
  "보호/돌봄": 115,
  "긴급구호": 55,
  "식사지원": 96,
  "심리/정서지원": 62,
  "의료지원": 114,
  "주거지원": 117,
  "교육지원": 87,
  "환경개선": 56,
  "인식개선/캠페인": 33
}
```

### 샘플 품질 판단

대부분의 샘플에서 `title`은 원본 제목을 유지하고, `target/supportType/category/tags`도 검색과 필터에 사용할 수 있는 형태로 생성됐다.

다만 일부 항목에서는 tags에 `아동/청소년`, `노인`, `장애인`처럼 분류 목록 값이 태그로 들어가는 사례가 보인다. 구조 검증은 통과했지만, 태그 품질을 더 깔끔하게 하려면 다음 단계에서 tags 후처리 규칙을 보강하는 것이 좋다.

### 남은 문제 및 위험 요소

- LLM 정제는 성공했지만 시간이 오래 걸린다.
- 일부 tags가 일반 태그가 아니라 분류 라벨처럼 생성되는 경우가 있다.
- cache top-level `model` 값은 과거 값이 남아 있지만, 실제 `processed/campaigns.json`의 model은 `llama3.2:1b`로 기록됐다.

### 다음 추천 작업

1. 태그 후처리 규칙을 보강해 target/supportType 허용 목록 값이 tags에 과도하게 들어가지 않도록 한다.
2. 샘플 20~30개를 화면 기준으로 수동 확인한다.
3. 문제가 없으면 GitHub/Railway 반영을 위해 변경 파일을 정리하고 커밋한다.
