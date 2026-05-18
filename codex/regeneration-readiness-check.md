# 데이터 재생성 준비 점검

작성일: 2026-05-14

## 1. 점검 목적

이번 점검은 `processed/campaigns.json`과 `processed/cache.json`을 새 `target/supportType` 스키마로 재생성하기 전에, 코드 반영 상태와 현재 데이터 상태, 백업 필요 범위, 실행 후보 명령, 재생성 후 검증 기준을 미리 확정하기 위한 것이다.

현재 데이터는 아직 기존 `category` 중심 구조이고, UI도 `platform/category/tags` 표시 구조에 머물러 있다. 따라서 재생성 전에 기존 산출물을 보존하고, old schema cache가 새 결과에 섞이지 않도록 하는 계획이 필요하다.

## 2. 현재 코드 수정 반영 여부

확인한 파일:

- `scripts/llm-ollama.js`
- `scripts/build-processed.js`

반영 여부:

- `scripts/llm-ollama.js`에 `TARGETS`, `SUPPORT_TYPES`, `REFINED_SCHEMA_VERSION = 2`가 반영되어 있다.
- LLM 프롬프트는 `{ title, oneLineSummary, target, supportType, category, tags }` 출력 스키마를 요구한다.
- 프롬프트는 `title`이 `input.titleRaw`를 그대로 복사해야 한다고 명시한다.
- 프롬프트는 `target`과 `supportType`을 허용 목록 중 하나로만 선택하게 한다.
- 프롬프트는 `category`를 `target`과 같은 값으로 출력하게 한다.
- `sanitizeRefinedCampaign`은 LLM 결과를 그대로 쓰지 않고 보정한다.
- `target`이 허용 목록 밖이면 `기타`로 보정된다.
- `supportType`이 허용 목록 밖이면 `기타`로 보정된다.
- `category`는 최종적으로 항상 `target`으로 강제된다.
- `titleRaw`가 있으면 최종 `title`은 `titleRaw`를 우선한다.
- `oneLineSummary`는 비어 있으면 `summaryRaw` 또는 `categoryRaw` 기반 fallback을 사용하고, 50자 기준으로 축약된다.
- `tags`는 배열만 허용하고, trim/중복 제거/일반어 제거 후 최대 5개로 제한된다.
- LLM JSON 파싱 실패 시 `sanitizeRefinedCampaign(null, campaign)` 경로를 통해 raw 기반 fallback을 반환한다.
- fallback에서는 `target`, `supportType`, `category`를 `기타`로 둔다.

`scripts/build-processed.js` 반영 여부:

- `TARGETS`, `SUPPORT_TYPES`, `REFINED_SCHEMA_VERSION`, `fallbackRefinedCampaign`, `sanitizeRefinedCampaign`을 import한다.
- cache에 `refinedSchemaVersion = REFINED_SCHEMA_VERSION`을 기록하도록 되어 있다.
- cache item의 `schemaVersion`이 현재 `REFINED_SCHEMA_VERSION`과 다르거나, `target/supportType`이 없거나 허용 목록 밖이면 schema mismatch로 재가공 대상이 된다.
- 최종 병합 단계에서 `title = c.titleRaw || refined.title || ''`로 처리한다.
- 최종 item에 `target`, `supportType`이 포함된다.
- 최종 `category`는 `target`과 같게 설정된다.
- 최종 `tags`는 `refined.tags.slice(0, 5)`로 최대 5개만 포함된다.
- old schema cache가 남아 있으면 새 schema version과 맞지 않으므로 재가공 대상이 되거나, 최종 병합에서는 fallback이 적용된다.

판단:

- 데이터 파이프라인 코드는 1차 스키마 변경을 반영한 상태로 보인다.
- 다만 실제 문법 확인과 실행 검증은 아직 하지 않았다. 사용자 허락 전에는 `node`, `npm run`, 데이터 재생성 명령을 실행하지 않는다.

## 3. 현재 데이터 파일 상태

현재 확인 결과:

- `processed/campaigns.json`은 존재한다.
- `processed/cache.json`은 존재한다.
- `processed/campaigns.json` 크기: 약 1.37MB
- `processed/cache.json` 크기: 약 657KB
- 두 파일의 수정 시각은 2026-05-11 13:23:25로 확인된다.
- `out/` 폴더는 현재 프로젝트 루트에서 확인되지 않았다.
- `processed/campaigns.json`은 정규식 기준 `category` 1195개, `tags` 1195개를 포함한다.
- `processed/campaigns.json`은 정규식 기준 `target` 0개, `supportType` 0개 상태다.
- `processed/cache.json`은 정규식 기준 `refined` 객체 1179개, `refined: null` 16개를 포함한다.
- `processed/cache.json`은 정규식 기준 `schemaVersion`, `refinedSchemaVersion`, `target`, `supportType`이 0개다.

판단:

- 현재 `processed/campaigns.json`은 old schema 산출물이다.
- 현재 `processed/cache.json`도 old schema cache다.
- 현재 `out/` 원본 데이터가 보이지 않으므로, `build:processed`만 실행하면 입력 raw 데이터가 없어서 빈 결과가 생성될 위험이 있다.
- JSON 파싱 정상 여부는 이번 작업에서 실행 검증하지 않았다. 이전 기록에는 `processed/campaigns.json` 파싱 실패 이력이 있으므로, 재생성 전후에 JSON 유효성 검증이 필요하다.

JSON 검증 후보 명령:

```powershell
Get-Content -Raw -Encoding UTF8 processed\campaigns.json | ConvertFrom-Json | Out-Null
Get-Content -Raw -Encoding UTF8 processed\cache.json | ConvertFrom-Json | Out-Null
```

주의:

- 위 명령은 읽기/파싱 확인용이지만, 이번 작업에서는 실행하지 않았다.
- 재생성 직전 또는 직후 사용자 허락을 받고 실행하는 것이 좋다.

## 4. 재생성 전 백업 계획

백업 필요 여부:

- `processed/campaigns.json`: 백업 필요
- `processed/cache.json`: 백업 필요
- `out/*.json`: `out/` 폴더가 존재하거나 크롤링 후 생성된다면 백업 권장

이유:

- `processed/campaigns.json`은 현재 UI가 사용 중인 최종 산출물이다.
- `processed/cache.json`은 기존 LLM 정제 결과와 실패 이력을 포함한다.
- 새 스키마 재생성은 cache schema를 바꾸므로, 기존 cache를 복구할 수 있게 보존하는 것이 안전하다.
- `out/*.json`은 raw 입력 데이터이므로, 같은 입력으로 재현하려면 백업 가치가 높다.

추천 백업 위치:

```text
backups/processed-YYYYMMDD-HHMM/
```

예상 백업 대상:

```text
processed/campaigns.json
processed/cache.json
out/*.json
```

주의:

- `codex/backups/`는 기록 문서 폴더의 성격이 강하므로 대용량 데이터 백업 위치로는 부적절하다.
- 이번 작업에서는 백업 폴더를 만들지 않았다.
- 실제 백업은 사용자 허락 후 별도 작업으로 진행해야 한다.

## 5. 재생성 시 실행할 후보 명령

`package.json` 기준 후보 명령:

### `npm run build:processed`

실제 명령:

```powershell
npm run build:processed
```

내부 실행:

```text
node scripts/build-processed.js
```

역할:

- `out/` 폴더의 JSON raw 데이터를 읽는다.
- `processed/cache.json`을 읽거나 생성한다.
- Ollama LLM을 호출해 정제 cache를 갱신한다.
- `processed/campaigns.json`과 `processed/cache.json`을 쓴다.

구분:

- 크롤링은 하지 않는다.
- 기존 `out/` raw 데이터가 있어야 의미 있는 결과를 만들 수 있다.
- 현재 `out/` 폴더가 없으므로 바로 실행하면 위험하다.

### `npm run server:refresh`

실제 명령:

```powershell
npm run server:refresh
```

내부 흐름:

- `npm run crawl:now:json`
- `npm run crawl:goodneighbors:json`
- `npm run crawl:happybean:json`
- `npm run build:processed`

역할:

- 3개 플랫폼을 다시 크롤링해 `out/*.json`을 만든다.
- 이후 `build:processed`를 실행해 LLM 가공 및 processed 산출물을 만든다.

구분:

- 크롤링까지 포함한다.
- 외부 사이트 상태에 따라 결과 수와 내용이 달라질 수 있다.
- 현재 `out/`이 없으므로 재현보다 최신화가 목적이라면 이 명령이 더 적합할 수 있다.

### 개별 크롤링 명령

후보:

```powershell
npm run crawl:now:json
npm run crawl:goodneighbors:json
npm run crawl:happybean:json
```

역할:

- 각 플랫폼별 raw JSON을 `out/` 폴더에 생성한다.

구분:

- LLM 가공이나 `processed/campaigns.json` 생성은 하지 않는다.
- 크롤링만 먼저 수행하고 raw 결과를 확인한 뒤 `build:processed`를 실행하는 단계형 접근에 사용할 수 있다.

### `node scripts/build-processed.js`

역할:

- `npm run build:processed`와 동일한 실질 동작이다.

판단:

- package script를 따르는 `npm run build:processed`가 더 명확하다.
- 단, 이번 작업에서는 어떤 명령도 실행하지 않았다.

## 6. 재생성 후 검증 계획

재생성 후 검증 항목:

- `processed/campaigns.json`이 JSON으로 정상 파싱되는지 확인한다.
- `processed/cache.json`이 JSON으로 정상 파싱되는지 확인한다.
- `count`와 `items.length`가 일치하는지 확인한다.
- 모든 item에 `target`이 있는지 확인한다.
- 모든 item에 `supportType`이 있는지 확인한다.
- 모든 `target`이 허용 목록 안에 있는지 확인한다.
- 모든 `supportType`이 허용 목록 안에 있는지 확인한다.
- 모든 item에서 `category === target`인지 확인한다.
- `raw.titleRaw`가 있는 경우 `title === raw.titleRaw`인지 확인한다.
- `tags`가 배열인지 확인한다.
- `tags.length <= 5`인지 확인한다.
- UI 필터 후보 목록이 과도하게 늘어나지 않는지 확인한다.

검증 후보 명령:

```powershell
Get-Content -Raw -Encoding UTF8 processed\campaigns.json | ConvertFrom-Json | Out-Null
Get-Content -Raw -Encoding UTF8 processed\cache.json | ConvertFrom-Json | Out-Null
```

추가 검증은 별도 Node/Powershell 스크립트로 작성할 수 있다. 예를 들어 다음 값을 집계한다.

- `count`
- `items.length`
- `target` 고유값 목록
- `supportType` 고유값 목록
- 허용 목록 밖 `target/supportType` 개수
- `category !== target` 개수
- `raw.titleRaw`가 있는데 `title !== raw.titleRaw`인 개수
- `tags`가 배열이 아닌 항목 수
- `tags`가 5개를 초과하는 항목 수

UI 필터 검증:

- 대상 필터는 최대 11개 허용 목록 안에서 구성되어야 한다.
- 지원 유형 필터는 최대 12개 허용 목록 안에서 구성되어야 한다.
- `category`처럼 자유 생성된 세부 문구가 필터 옵션으로 늘어나면 안 된다.

## 7. 위험 요소

- `out/` 원본 데이터가 없으면 `build:processed`만으로는 기존 1195개 데이터를 재현할 수 없다.
- 기존 cache를 그대로 쓰면 old schema가 섞일 수 있다.
- 현재 코드는 schema mismatch를 재가공 대상으로 잡지만, Ollama가 준비되지 않았거나 LLM이 실패하면 fallback `기타`가 늘어날 수 있다.
- Ollama 모델 응답 품질에 따라 `target/supportType` 분류 품질이 흔들릴 수 있다.
- 현재 JSON 파싱 문제가 남아 있다면 재생성 전 원인 확인이 필요할 수 있다.
- 한글 깨짐 문제가 raw 데이터 또는 코드 문자열에 남아 있으면 재생성 후에도 결과에 남을 수 있다.
- `server:refresh`는 크롤링까지 수행하므로 외부 사이트 변화에 따라 기존 데이터와 결과 수가 달라질 수 있다.
- `build:processed`는 `processed/campaigns.json`과 `processed/cache.json`을 실제로 덮어쓴다.

## 8. 추천 실행 순서

사용자가 허락했을 때 권장 순서:

1. `git status --short` 확인
2. `processed/campaigns.json`, `processed/cache.json` 현재 상태 백업
3. `out/` 원본 데이터 존재 여부 재확인
4. `out/`이 없다면 크롤링을 다시 할지 사용자 확인
5. 기존 `processed/cache.json`을 백업하고 old schema cache를 새 schema와 분리
6. Ollama 실행 여부와 사용할 모델 확인
7. 필요하면 개별 크롤링 명령으로 `out/*.json` 생성
8. `npm run build:processed` 실행
9. `processed/campaigns.json` JSON 유효성 검증
10. `processed/cache.json` JSON 유효성 검증
11. `target/supportType/category/title/tags` 스키마 검증
12. 샘플 캠페인 수동 확인
13. `codex/work-log.md`에 재생성 결과 기록
14. UI 수정 단계로 이동

추천 방식:

- 현재 `out/`이 없으므로 바로 `npm run build:processed`를 실행하는 방식은 추천하지 않는다.
- 기존 raw 입력을 복구할 수 없다면 `npm run server:refresh` 또는 개별 `crawl:*:json` 후 `npm run build:processed` 흐름이 더 현실적이다.
- 단, 최신 크롤링은 기존 결과와 달라질 수 있으므로 백업 후 진행해야 한다.

## 9. 사용자에게 확인할 질문

1. `processed/campaigns.json`과 `processed/cache.json`을 백업 후 재생성해도 될까요?
2. 크롤링까지 다시 할까요, 아니면 기존 `out` 원본을 확보한 뒤 processed만 재생성할까요?
3. Ollama 모델은 현재 기본값인 `llama3.2:1b`를 그대로 사용할까요?
4. 재생성 후 UI 수정을 바로 이어서 진행해도 될까요?
5. 재생성 전에 한글 깨짐/JSON 파싱 문제를 별도 점검으로 먼저 분리할까요?
