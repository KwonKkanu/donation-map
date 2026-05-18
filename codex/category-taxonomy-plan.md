# 카테고리 분류 체계 개선 계획

작성일: 2026-05-13

## 1. 문제 요약

현재 `donation-map` 프로젝트의 LLM 가공은 캠페인 데이터를 검색 UI에 보여주기 좋게 만들기 위한 단계지만, `title`, `category`, `oneLineSummary`, `tags`를 LLM이 직접 생성하면서 결과가 흔들릴 수 있는 구조다.

특히 다음 문제가 확인된다.

- `title`이 원본 제목과 다르게 바뀔 수 있다.
- `category`는 프롬프트상 허용 목록 중 하나를 요구하지만, 실제 데이터에는 목록 밖 값도 일부 섞여 있다.
- 기존 `category` 하나에 대상과 지원 유형이 섞여 있어 검색/필터 UI 축으로 쓰기 어렵다.
- 현재 UI는 `category` 단일 필터에 의존한다.
- `processed/campaigns.json`은 정규식 기준 `category` 필드가 1195개 확인되지만, `ConvertFrom-Json` 파싱은 실패했다. 한글 깨짐/따옴표 손상 등으로 JSON 유효성 문제까지 함께 확인해야 한다.

이번 개선의 핵심은 LLM이 자유롭게 분류명을 만들지 못하게 하고, 정해진 `target`과 `supportType` 중 하나만 선택하게 만드는 것이다.

## 2. 현재 LLM 가공 구조

### `scripts/build-processed.js`

- `out/fundraisings-now.json`, `out/goodneighbors-campaigns.json`, `out/happybean-donations.json`을 읽는 구조다.
- 플랫폼별 원본 데이터를 내부 공통 형태로 정규화한다.
- 정규화 단계에서 `titleRaw`, `orgRaw`, `summaryRaw`, `categoryRaw`, 링크, 이미지, 기간, 금액, 진행률, 참여자 수, 상태를 보존한다.
- `refineCampaignWithOllama`가 성공하면 cache의 `refined` 값을 사용한다.
- 최종 `processed/campaigns.json`에는 `title`, `oneLineSummary`, `category`, `tags`, `raw`를 병합한다.
- `raw.titleRaw`, `raw.summaryRaw`, `raw.categoryRaw`가 보존되므로 잘못된 LLM 결과를 복구할 수 있는 기반은 있다.

### `scripts/llm-ollama.js`

- 현재 LLM 출력 스키마는 `title`, `oneLineSummary`, `category`, `tags`다.
- 프롬프트는 `category MUST be exactly one of ...`라고 요구한다.
- 그러나 `title`은 원본 제목 보존이 강제되지 않는다.
- `oneLineSummary`는 90자 이하로 안내되어 있어 검색 카드용으로는 길 수 있다.
- `tags`는 3~7개를 요구하고 후처리도 최대 7개까지 허용한다.
- `normalizeCategory`는 허용 목록 밖이면 기타로 보내려는 의도지만, 현재 파일 자체의 한글 깨짐 때문에 taxonomy/alias 신뢰성이 낮다.

### 수집 모듈

- `src/kakaoTogether.js`: Kakao Together의 `title`, `subTopic`, `teamName` 등을 수집한다.
- `src/goodNeighbors.js`: GoodNeighbors HTML에서 `title`, `category`, `summary` 등을 파싱한다.
- `src/happybean.js`: Happybean API에서 `title`, `summary`, `hlogName` 등을 수집한다.
- 수집 모듈은 분류 체계를 완성하기보다 플랫폼별 원본 힌트를 가져오는 역할에 가깝다.

### `server.js`

- `/api/campaigns` 요청 시 `processed/campaigns.json` 파일을 그대로 반환한다.
- API 계층에서 분류 값을 보정하거나 변환하지 않는다.

### `main_service.html`

- `/api/campaigns`를 fetch해서 `state.items`에 저장한다.
- 필터 상태는 현재 `q`, `category`, `source`만 있다.
- `populateCategoryOptions`는 `items.map(it => it.category)`에서 고유 category 목록을 만든다.
- `applyFilters`는 `it.category === selectedCategory`만 검사한다.
- 화면 카드에는 `platform`과 `category` chip을 보여준다.

## 3. 현재 데이터에서 확인되는 문제

읽기 전용 분석 결과:

- `processed/campaigns.json`은 JSON 파서(`ConvertFrom-Json`)로 파싱 실패했다.
- 정규식 기준 `category` 필드는 1195개 확인됐다.
- 정규식 기준 category 고유값은 15종으로 확인됐다.
- cache 파일에서는 정규식 기준 `refined` 객체 1179개, `error` 16개, `refined: null` 16개가 확인됐다.
- `target` 필드는 0개, `supportType` 필드는 0개로 확인됐다.
- `raw.titleRaw`와 `raw.summaryRaw`는 정규식 기준 각각 1195개 확인됐다.
- `raw.categoryRaw`는 정규식 기준 217개만 확인됐다. Happybean 등 일부 원본에는 `categoryRaw`가 없을 수 있다.
- 일부 샘플에서 `title`이 `titleRaw`와 다르게 바뀐 사례가 확인됐다. 예: 한 항목에서 `title`이 대상 분류처럼 보이는 값으로 바뀌고 `titleRaw`는 별도 원본 제목으로 남아 있었다.

해석:

- 원본 보존 필드는 존재하므로 복구/재가공의 발판은 있다.
- 현재 결과 데이터는 분류값 이전에 JSON 유효성 검증이 필요하다.
- `category` 단일 필드는 대상인지 지원 유형인지 불명확하다.
- LLM 출력이 실패하거나 흔들릴 때 raw fallback은 존재하지만, 성공한 LLM 결과가 품질이 낮아도 그대로 채택되는 구조다.

## 4. 권장 분류 체계

분류 축은 하나로 합치지 말고 `누구를 돕는가`와 `무엇을 지원하는가`를 분리하는 것이 좋다.

### 4.1 대상 분류 target

허용 목록:

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

운영 규칙:

- 수혜 대상이 명확하면 해당 대상을 선택한다.
- 대상이 여러 개인 경우 캠페인 제목/요약에서 가장 중심이 되는 대상을 선택한다.
- 대상보다 이슈가 중심인 경우 `지역사회`, `환경`, `재난/위기`, `해외/국제`를 우선 검토한다.
- 판단이 어려우면 `기타`를 선택한다.

### 4.2 지원 유형 supportType

허용 목록:

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

운영 규칙:

- 실제 제공되는 지원 내용이 명확하면 해당 유형을 선택한다.
- 모금 목적이 시설 보수, 공간 개선, 청소, 안전 보강이면 `주거지원` 또는 `환경개선` 중 더 가까운 쪽을 선택한다.
- 재난, 전쟁, 긴급 생존 물품은 `긴급구호`를 우선한다.
- 단순 홍보/권리 옹호/사회적 인식 변화가 목적이면 `인식개선/캠페인`을 선택한다.
- 판단이 어려우면 `기타`를 선택한다.

## 5. 개선 스키마 제안

기존:

```json
{
  "title": "...",
  "oneLineSummary": "...",
  "category": "...",
  "tags": ["..."]
}
```

개선안:

```json
{
  "title": "원본 제목 유지",
  "oneLineSummary": "짧은 한 줄 요약",
  "target": "정해진 대상 분류 중 하나",
  "supportType": "정해진 지원 유형 중 하나",
  "category": "호환용 기존 필드",
  "tags": ["핵심 태그 3~5개"]
}
```

`category` 호환 전략:

- `category = target`: 기존 UI 호환이 가장 쉽지만 지원 유형이 드러나지 않는다.
- `category = "target · supportType"`: 표시 의미는 좋지만 조합 수가 늘어 필터가 다시 복잡해질 수 있다.
- `category`는 호환 필드로 남기고 UI는 `target`, `supportType`을 우선 사용: 가장 권장된다.

권장안:

- 데이터에는 `target`, `supportType`, `category`를 모두 둔다.
- 1차 마이그레이션에서 `category`는 `target` 값을 넣어 기존 UI 호환성을 유지한다.
- 카드 표시에서는 `target · supportType`을 UI에서 조합해 보여준다.
- 장기적으로 필터는 `target`과 `supportType`을 별도 select로 분리한다.

## 6. LLM 프롬프트 개선안

```text
You transform public donation campaign data into structured Korean metadata.
Output MUST be valid JSON only. No markdown. No commentary.

Allowed target values:
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

Allowed supportType values:
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

Hard rules:
- Output MUST be a single JSON object.
- Do not output keys other than: title, oneLineSummary, target, supportType, category, tags.
- title MUST preserve input.titleRaw exactly when input.titleRaw is non-empty.
- oneLineSummary MUST be Korean and 30 characters or fewer.
- target MUST be exactly one of the allowed target values.
- supportType MUST be exactly one of the allowed supportType values.
- category MUST be the same value as target for backward compatibility.
- tags MUST contain 3 to 5 Korean noun-like keywords.
- Do NOT invent facts not present in input.
- If target is ambiguous, use 기타.
- If supportType is ambiguous, use 기타.
- Never create a new target or supportType outside the allowed lists.

Output schema:
{"title":string,"oneLineSummary":string,"target":string,"supportType":string,"category":string,"tags":string[]}

Input:
{...}
```

추가 권장:

- `temperature`는 낮게 유지한다.
- LLM에게 분류 사유를 출력하게 하지 않는다.
- 허용 목록은 코드 상수와 프롬프트가 같은 값을 사용하게 한다.

## 7. LLM 결과 검증 및 fallback 규칙

필수 검증:

- `target`이 허용 목록에 없으면 `기타`로 변경한다.
- `supportType`이 허용 목록에 없으면 `기타`로 변경한다.
- `category`는 호환 정책에 따라 `target`으로 강제하거나 표시용 조합값을 코드에서 만든다.
- `titleRaw`가 있으면 `title`은 기본적으로 `titleRaw`로 덮어쓴다.
- `title`이 원본과 너무 다르면 원본 제목으로 복구한다.
- `oneLineSummary`가 비어 있으면 `summaryRaw`를 짧게 자르거나 기본 fallback 문구를 사용한다.
- `oneLineSummary`가 30자를 넘으면 문장 경계를 고려해 축약한다.
- `tags`는 3~5개만 유지한다.
- `tags`에서 빈 문자열, 중복, 너무 긴 값, 플랫폼명, 너무 일반적인 단어를 제거한다.
- LLM JSON 파싱 실패 시 raw 데이터 기반 fallback을 사용한다.

fallback 예시:

```json
{
  "title": "titleRaw",
  "oneLineSummary": "summaryRaw를 30자 이내로 축약",
  "target": "기타",
  "supportType": "기타",
  "category": "기타",
  "tags": []
}
```

규칙 기반 보조 분류도 고려한다.

- `어르신`, `노인`, `독거`가 있으면 target 후보 `노인`
- `아동`, `청소년`, `아이`, `어린이`가 있으면 target 후보 `아동/청소년`
- `장애`, `발달장애`가 있으면 target 후보 `장애인`
- `집`, `주거`, `보금자리`, `환경 개선`, `수리`가 있으면 supportType 후보 `주거지원` 또는 `환경개선`
- `식사`, `도시락`, `반찬`, `김치`, `급식`이 있으면 supportType 후보 `식사지원`
- `치료`, `수술`, `의료`, `병원`이 있으면 supportType 후보 `의료지원`

LLM은 최종 결정자가 아니라 후보 생성기로 두고, 코드 검증이 최종 게이트가 되는 구조가 안전하다.

## 8. UI 필터 구조 개선안

현재 UI 필터:

- 검색어
- 카테고리
- 플랫폼

권장 UI 필터:

- 검색어
- 대상
- 지원 유형
- 플랫폼

비교:

- 기존 category 필터 유지 + supportType 추가: 변경 폭은 작지만 category 의미가 계속 모호하다.
- category 필터를 target 필터로 이름 변경 + supportType 추가: 사용자에게 가장 명확하다.
- category 필터 유지하되 내부적으로 target 사용: 마이그레이션 초기에 안전하지만 화면 용어가 덜 명확하다.

권장안:

- UI 표시 이름은 `대상`, `지원 유형`, `플랫폼`, `검색어`로 나눈다.
- 카드 chip은 `target`, `supportType`, `platform`을 보여준다.
- 검색 대상에는 기존처럼 `title`, `org`, `oneLineSummary`, `tags`, `raw.titleRaw`, `raw.summaryRaw`를 포함한다.
- 이전 데이터와의 호환을 위해 `target`이 없으면 `category`를 대상 필터 fallback으로 사용할 수 있게 한다.

## 9. 마이그레이션 계획

### 1단계: 현재 LLM 출력 구조 분석

- `llm-ollama.js`의 출력 스키마와 프롬프트를 문서화한다.
- `build-processed.js`가 refined 결과를 최종 데이터에 병합하는 방식을 확인한다.
- 현재 `processed/campaigns.json`이 JSON으로 정상 파싱 가능한지 별도 검증한다.

### 2단계: target/supportType 허용 목록 정의

- `target`과 `supportType` 목록을 코드 상수로 정의한다.
- 프롬프트와 후처리 검증 함수가 같은 상수를 사용하게 한다.
- `기타`를 항상 fallback 값으로 둔다.

### 3단계: llm-ollama 프롬프트 수정

- 출력 스키마를 `title`, `oneLineSummary`, `target`, `supportType`, `category`, `tags`로 변경한다.
- `titleRaw`가 있으면 title을 원본 그대로 유지하라고 강제한다.
- `oneLineSummary`는 30자 이내로 줄인다.
- 목록 밖 target/supportType을 만들지 못하게 한다.

### 4단계: LLM 결과 검증 함수 추가

- 허용 목록 검증
- title 원본 복구
- summary 길이 제한
- tags 정리
- JSON 파싱 실패 fallback
- category 호환값 생성

### 5단계: processed 데이터 재생성

- 기존 `processed/campaigns.json`과 `processed/cache.json`을 손으로 수정하지 않는다.
- 코드 수정과 검증 계획 승인 후 `build-processed.js`를 통해 재생성한다.
- 재생성 전 기존 파일 백업 또는 Git 상태 확인 절차를 둔다.

### 6단계: UI 필터 수정

- `state`에 `target`, `supportType`을 추가한다.
- `populateCategoryOptions`를 `populateTargetOptions`, `populateSupportTypeOptions`로 분리한다.
- `applyFilters`에서 target/supportType/source/q를 모두 검사한다.
- 기존 데이터 호환을 위해 `it.target || it.category` fallback을 둔다.

### 7단계: 결과 검증

- `processed/campaigns.json`이 JSON 파서로 정상 파싱되는지 확인한다.
- 모든 item에 `target`, `supportType`, `category`, `raw.titleRaw`, `raw.summaryRaw`가 있는지 확인한다.
- `target`과 `supportType`이 허용 목록 밖으로 나가지 않는지 검사한다.
- title이 원본과 과도하게 달라진 항목이 없는지 검사한다.
- UI 필터 목록이 과도하게 늘어나지 않는지 확인한다.

## 10. 사용자에게 확인할 질문

1. `category` 호환 필드는 1차 마이그레이션에서 `target` 값으로 둘까요, 아니면 `"노인 · 주거지원"` 같은 표시용 조합값으로 둘까요?
2. `oneLineSummary` 30자 제한은 엄격히 자를까요, 아니면 UI 표시만 30자 내외로 하고 데이터는 50자 정도까지 허용할까요?
3. `target`과 `supportType`을 둘 다 `기타`로 판단한 항목은 UI에서 숨기지 않고 그대로 보여줄까요?
4. LLM 없이 규칙 기반 분류만으로 먼저 재가공하는 실험도 고려할까요?
