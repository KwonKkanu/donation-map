# 카테고리 분류 체계 구현 계획

작성일: 2026-05-13

## 1. 구현 목표

카테고리 분류 체계 개선의 목표는 LLM이 최종 데이터를 마음대로 결정하지 못하게 하고, 코드 검증을 거친 안정적인 검색/필터용 데이터를 생성하는 것이다.

확정 방향:

- 최종 `title`은 LLM 결과를 쓰지 않고 `titleRaw`가 있으면 항상 `titleRaw`를 사용한다.
- 기존 `category` 단일 구조를 `target`과 `supportType` 구조로 확장한다.
- `target`은 "누구를 돕는가"를 나타낸다.
- `supportType`은 "무엇을 지원하는가"를 나타낸다.
- `category` 필드는 기존 UI/API 호환을 위해 제거하지 않는다.
- 1차 마이그레이션에서는 `category = target`을 우선안으로 둔다.
- 카드 표시에서는 `target · supportType` 형태를 UI에서 조합해 보여주는 방향을 검토한다.
- LLM은 후보 생성기로만 사용하고, 최종 값은 코드 검증 함수에서 보정한다.
- `processed/campaigns.json`과 `processed/cache.json`은 직접 편집하지 않고 빌드 스크립트로 재생성한다.

## 2. 현재 구조 요약

- `scripts/llm-ollama.js`는 현재 `title`, `oneLineSummary`, `category`, `tags`를 LLM에서 받아온다.
- `scripts/build-processed.js`는 플랫폼별 원본 데이터를 정규화한 뒤 LLM 정제 결과와 병합한다.
- `build-processed.js`의 최종 병합은 `refined.title || c.titleRaw`, `refined.category || c.categoryRaw`처럼 LLM 결과를 우선한다.
- `main_service.html`은 `category`와 `source`만 필터링하며, `target`/`supportType` 필드는 아직 사용하지 않는다.
- `server.js`는 `/api/campaigns`에서 `processed/campaigns.json`을 그대로 제공한다.
- 정규식 기준 현재 `processed/campaigns.json`에는 `category`가 1195개 있고 `target`, `supportType`은 없다.
- `processed/cache.json`에는 기존 스키마의 `refined` 객체가 1179개, 실패 항목이 16개 확인됐다.
- 현재 `processed/campaigns.json`은 PowerShell `ConvertFrom-Json` 파싱이 실패하므로, 스키마 변경 전후에 JSON 유효성 검증이 필요하다.

## 3. 수정 대상 파일

### `scripts/llm-ollama.js`

수정 목적:

- LLM 출력 스키마를 `target`/`supportType` 중심으로 바꾼다.
- LLM이 title을 새로 만들지 못하게 하거나, 출력하더라도 최종 데이터에서는 신뢰하지 않게 한다.
- 허용 목록 밖 분류가 나오면 코드에서 `기타`로 보정한다.

수정할 함수 또는 영역:

- `refineCampaignWithOllama`
- 기존 `taxonomy`
- `normalizeCategory`
- LLM prompt 생성부
- LLM 응답 파싱/검증부

예상 변경 내용:

- `TARGETS`, `SUPPORT_TYPES` 상수를 추가한다.
- 기존 `taxonomy` 대신 `TARGETS`, `SUPPORT_TYPES`를 프롬프트에 넣는다.
- 출력 스키마를 `{ title, oneLineSummary, target, supportType, category, tags }`로 변경한다.
- `title`은 반환하더라도 후처리에서 원본으로 덮어쓰는 정책을 명시한다.
- `validateRefinedCampaign` 또는 비슷한 검증 함수를 추가한다.
- `normalizeCategory`는 `normalizeTarget`, `normalizeSupportType`으로 대체하거나 역할을 축소한다.
- `tags`는 3~5개로 제한한다.

위험 요소:

- 기존 cache의 `refined` 구조와 새 구조가 달라져 기존 cache를 그대로 쓰면 target/supportType이 비어 있을 수 있다.
- 현재 파일의 한글 깨짐 상태 때문에 상수 추가 전 인코딩 원인 확인이 필요하다.
- 작은 LLM 모델이 새 스키마를 안정적으로 따르지 못할 수 있다.

검증 방법:

- LLM 응답이 JSON으로 파싱되는지 확인한다.
- `target`과 `supportType`이 허용 목록 밖으로 나오지 않는지 검사한다.
- title이 최종 출력에서 `titleRaw`와 일치하는지 검사한다.
- tags가 5개를 넘지 않는지 검사한다.

### `scripts/build-processed.js`

수정 목적:

- 최종 병합 단계에서 LLM title을 우선하지 않고 원본 제목을 사용한다.
- `target`, `supportType`, `category`를 최종 `processed/campaigns.json`에 포함한다.
- 기존 cache 재사용 조건을 스키마 변경에 맞게 조정한다.

수정할 함수 또는 영역:

- 최종 `items = campaigns.map(...)` 병합 로직
- cache 읽기/쓰기 로직
- task 선정 로직의 cache version 또는 schema version 판단
- fallback 생성 로직

예상 변경 내용:

- 최종 `title`은 `c.titleRaw || refined?.title || ''` 순서로 결정한다.
- `target`은 검증된 `refined.target` 또는 fallback `기타`를 사용한다.
- `supportType`은 검증된 `refined.supportType` 또는 fallback `기타`를 사용한다.
- `category`는 1차 마이그레이션에서 `target`과 동일하게 둔다.
- `raw`에는 기존처럼 `titleRaw`, `summaryRaw`, `categoryRaw`를 보존한다.
- cache에 schema version을 추가하거나, 기존 cache와 새 cache를 구분하는 키를 추가한다.

위험 요소:

- 기존 cache를 그대로 재사용하면 새 필드가 없는 refined 결과가 최종 데이터에 섞일 수 있다.
- `processed/campaigns.json`이 현재 JSON 파싱 실패 상태라, 재생성 전후 차이를 주의해서 봐야 한다.
- `out/` 원본 파일이 현재 폴더에 보이지 않으므로 재생성 단계에서 입력 데이터 경로를 먼저 확인해야 한다.

검증 방법:

- 재생성 후 `processed/campaigns.json`이 JSON으로 정상 파싱되는지 확인한다.
- 모든 item에 `target`, `supportType`, `category`가 있는지 검사한다.
- `category === target`인지 검사한다.
- `title === raw.titleRaw` 조건을 검사한다.

### `main_service.html`

수정 목적:

- 기존 category 단일 필터를 대상/지원 유형 필터로 나눈다.
- 기존 데이터와 새 데이터가 모두 보일 수 있게 fallback을 둔다.
- 카드에서 `target · supportType` 형태를 보여준다.

수정할 함수 또는 영역:

- 필터 UI HTML
- `state`
- `renderCard`
- `applyFilters`
- `populateCategoryOptions`
- `load`
- `wire`
- reset 처리

예상 변경 내용:

- `state.target`, `state.supportType`을 추가한다.
- `category` select를 `target` select로 바꾸거나, label만 `대상`으로 변경한다.
- `supportType` select를 새로 추가한다.
- `populateTargetOptions`, `populateSupportTypeOptions`를 만든다.
- `applyFilters`에서 `it.target || it.category` fallback으로 대상 필터를 적용한다.
- `supportType`은 새 데이터에만 적용하고, 구 데이터에는 fallback 정책을 정한다.
- 카드 chip은 `platform`, `target`, `supportType`을 보여준다.

위험 요소:

- 기존 `category`만 있는 데이터에서 supportType 필터를 선택하면 모든 항목이 사라질 수 있다.
- 한글 UI 문구가 현재 깨져 있으므로 UI 문구 수정은 인코딩 복구 계획과 충돌하지 않게 진행해야 한다.
- HTML 단일 파일에 로직이 집중되어 있어 작은 수정도 UI 전체에 영향을 줄 수 있다.

검증 방법:

- 대상 필터 목록 개수가 허용 목록 수준으로 제한되는지 확인한다.
- 지원 유형 필터 목록이 허용 목록 수준으로 제한되는지 확인한다.
- 검색어, 대상, 지원 유형, 플랫폼 필터가 동시에 동작하는지 확인한다.
- 기존 category-only 데이터 fallback 동작을 확인한다.

### `server.js`

수정 목적:

- 1차 구현에서는 수정하지 않는 것이 우선이다.
- `/api/campaigns`는 계속 정적 JSON을 그대로 제공한다.

수정할 함수 또는 영역:

- 기본적으로 없음.
- 필요 시 `/api/campaigns` 응답 전 schema version 검증이나 오류 메시지 개선 정도만 검토한다.

예상 변경 내용:

- 없음이 권장된다.

위험 요소:

- API에서 보정을 시작하면 데이터 생성 책임과 제공 책임이 섞인다.

검증 방법:

- 새 `processed/campaigns.json`이 기존 경로에서 그대로 제공되는지 확인한다.

### `processed/campaigns.json`

수정 목적:

- 직접 수정 대상이 아니다.
- `build-processed.js` 실행 결과로 재생성되어야 한다.

수정할 함수 또는 영역:

- 직접 수정 없음.

예상 변경 내용:

- 모든 item에 `target`, `supportType`이 추가된다.
- `category`는 1차 마이그레이션에서 `target`과 동일한 값으로 유지된다.
- `title`은 `raw.titleRaw` 기반으로 복구된다.

위험 요소:

- 현재 파일은 JSON 파싱 실패가 확인되어 재생성 전 백업이 필요하다.
- 재생성 입력인 `out/` 원본 데이터가 없으면 같은 데이터를 재현하지 못할 수 있다.

검증 방법:

- JSON 파싱 확인
- 필드 존재 확인
- 허용 목록 검증
- 샘플 수동 확인

### `processed/cache.json`

수정 목적:

- 직접 수정 대상이 아니다.
- 새 refined schema에 맞게 백업 후 재생성하거나 schema version을 올려 무효화해야 한다.

수정할 함수 또는 영역:

- 직접 수정 없음.

예상 변경 내용:

- cache의 `refined`가 `{ title, oneLineSummary, target, supportType, category, tags }` 구조로 바뀐다.
- 기존 `{ title, oneLineSummary, category, tags }` cache는 새 스키마와 호환되지 않는다.

위험 요소:

- 기존 cache를 그대로 재사용하면 target/supportType이 누락된다.
- LLM 재호출 비용과 시간이 발생할 수 있다.

검증 방법:

- cache schema version 확인
- refined 객체의 target/supportType 존재 확인
- error/null refined 항목 수 확인

## 4. 데이터 스키마 변경 계획

기존 item 핵심 스키마:

```json
{
  "uid": "kakao:123",
  "source": "kakao",
  "platform": "Kakao Together",
  "title": "LLM 또는 원본 제목",
  "oneLineSummary": "LLM 또는 원본 요약",
  "category": "LLM 또는 원본 카테고리",
  "tags": ["..."],
  "raw": {
    "titleRaw": "...",
    "summaryRaw": "...",
    "categoryRaw": "..."
  }
}
```

개선 item 핵심 스키마:

```json
{
  "uid": "kakao:123",
  "source": "kakao",
  "platform": "Kakao Together",
  "title": "raw.titleRaw 기반 제목",
  "oneLineSummary": "검증된 한 줄 요약",
  "target": "노인",
  "supportType": "주거지원",
  "category": "노인",
  "tags": ["주거", "환경개선", "안전"],
  "raw": {
    "titleRaw": "...",
    "summaryRaw": "...",
    "categoryRaw": "..."
  }
}
```

호환 정책:

- `category`는 제거하지 않는다.
- 1차 마이그레이션에서는 `category = target`으로 둔다.
- UI 표시는 `target · supportType`으로 조합한다.
- 기존 클라이언트는 `category`를 계속 읽을 수 있고, 새 UI는 `target`/`supportType`을 사용한다.

## 5. LLM 프롬프트 수정 계획

프롬프트는 다음 방향으로 바꾼다.

- LLM에게 title 생성을 맡기지 않는다.
- 출력에 `title`을 포함하더라도 "input.titleRaw를 그대로 복사"하도록 한다.
- `target`은 허용 목록 중 하나만 출력하게 한다.
- `supportType`은 허용 목록 중 하나만 출력하게 한다.
- `category`는 `target`과 같은 값으로 출력하게 한다.
- `oneLineSummary`는 50자 내외 제한을 권장한다.
- `tags`는 3~5개만 출력하게 한다.
- 정보가 불명확하면 `기타`를 선택하게 한다.

권장 summary 정책:

- 30자 엄격 제한은 카드 UI에는 좋지만 의미가 손상될 가능성이 높다.
- 50자 내외 제한은 캠페인 의도를 보존하면서도 카드 UI에서 다루기 쉽다.
- 추천안은 데이터에는 50자 내외를 허용하고, UI에서는 CSS line clamp로 표시 길이를 제어하는 방식이다.

프롬프트 출력 스키마:

```json
{
  "title": "string",
  "oneLineSummary": "string",
  "target": "string",
  "supportType": "string",
  "category": "string",
  "tags": ["string"]
}
```

## 6. 후처리 검증 함수 설계

검증 함수는 LLM 결과와 raw campaign을 함께 받아 최종 refined 객체를 반환한다.

예상 함수:

```js
function validateRefinedCampaign(parsed, campaign) {
  const title = campaign.titleRaw || stripNewlines(parsed?.title) || '';
  const target = normalizeEnum(parsed?.target, TARGETS, '기타');
  const supportType = normalizeEnum(parsed?.supportType, SUPPORT_TYPES, '기타');
  const oneLineSummary = normalizeSummary(parsed?.oneLineSummary, campaign.summaryRaw);
  const tags = normalizeTags(parsed?.tags);

  return {
    title,
    oneLineSummary,
    target,
    supportType,
    category: target,
    tags,
  };
}
```

포함할 검증 로직:

- `titleRaw` 기반 title 복구
  - `campaign.titleRaw`가 있으면 최종 title은 무조건 `campaign.titleRaw`다.
  - LLM title은 참고하지 않거나 fallback으로만 사용한다.
- `target` 허용 목록 검증
  - `TARGETS.includes(value)`가 아니면 `기타`.
- `supportType` 허용 목록 검증
  - `SUPPORT_TYPES.includes(value)`가 아니면 `기타`.
- `category = target` 호환 처리
  - LLM이 category를 다르게 주더라도 최종 category는 target으로 덮어쓴다.
- `oneLineSummary` 길이 제한
  - 추천은 50자 내외.
  - 비어 있으면 `summaryRaw` 기반 fallback.
  - 너무 길면 문장부호나 공백 기준으로 축약.
- `tags` 정리
  - 배열이 아니면 빈 배열.
  - 문자열 trim.
  - 빈 값 제거.
  - 중복 제거.
  - 플랫폼명, 너무 일반적인 단어, 조사/동사형 표현 제거.
  - 3~5개 권장, 최대 5개로 제한.
- JSON 파싱 실패 fallback
  - LLM 응답 파싱 실패 시 raw 기반 refined 생성.
  - `target`, `supportType`, `category`는 `기타`.
  - `title`은 `titleRaw`.
  - `oneLineSummary`는 `summaryRaw` 축약.

추가 검토:

- 규칙 기반 키워드 분류 함수를 fallback 앞단에 둘 수 있다.
- 예: `어르신`, `독거`는 target `노인`, `집`, `주거`, `수리`는 supportType `주거지원`.

## 7. UI 필터 수정 계획

목표 필터:

- 검색어
- 대상
- 지원 유형
- 플랫폼

구현 방향:

- 기존 `category` select 영역을 `target` select로 바꾼다.
- `supportType` select를 새로 추가한다.
- `source` select는 유지한다.
- `state`에 `target`, `supportType`을 추가한다.
- `applyFilters`는 다음 조건을 적용한다.
  - source 일치
  - target 일치: `it.target || it.category`
  - supportType 일치: `it.supportType`
  - 검색어는 title, org, summary, platform, target, supportType, category, tags, raw 필드를 대상으로 검색
- 기존 데이터와의 호환을 위해 `target`이 없으면 `category`를 대상값으로 취급한다.
- 기존 데이터에 `supportType`이 없을 때는 지원 유형 필터를 선택하면 매칭되지 않는 것이 자연스럽다. 다만 마이그레이션 중에는 "지원 유형 없음" fallback을 둘지 검토한다.
- 카드 chip은 `platform`, `target`, `supportType`을 보여준다.
- category chip은 숨기거나 target fallback으로만 사용한다.

권장 UI 용어:

- `대상`
- `지원 유형`
- `플랫폼`
- `검색어`

## 8. processed/cache 처리 계획

기존 cache를 그대로 쓰면 안 되는 이유:

- 현재 cache의 refined 구조는 `title`, `oneLineSummary`, `category`, `tags` 중심이다.
- 새 구조에서 필수인 `target`, `supportType`이 없다.
- 기존 cache를 그대로 재사용하면 새 분류 체계가 적용되지 않는다.
- 기존 cache에는 잘못 바뀐 title도 포함되어 있을 수 있다.

스키마 변경 후 cache 재생성 여부:

- 재생성이 필요하다.
- 안전한 방식은 기존 `processed/cache.json`을 백업한 뒤 새 schema version으로 다시 생성하는 것이다.
- 또는 코드에서 `cache.version`/`refinedSchemaVersion`을 올려 기존 refined를 무효화한다.

재생성 전 백업 필요 여부:

- 필요하다.
- 현재 `processed` 데이터는 계속 갱신되는 데이터이고, 현재 파일은 JSON 파싱 실패도 확인되므로 재생성 전 상태 보존이 중요하다.

`processed/campaigns.json`을 직접 수정하지 않는 이유:

- 생성 산출물이므로 손수 편집하면 다음 빌드 때 덮어써진다.
- 원인과 파이프라인을 고치지 않으면 같은 문제가 반복된다.
- 데이터 수가 많아 수동 수정은 오류 가능성이 높다.
- `build-processed.js`를 통해 재생성해야 raw 보존, cache, LLM 결과, UI 스키마가 일관된다.

## 9. 단계별 작업 순서

1. Git 상태 확인
2. `processed/campaigns.json`, `processed/cache.json`, `out/` 입력 데이터 존재 여부 확인
3. `TARGETS`, `SUPPORT_TYPES` 상수 추가 계획 확정
4. `llm-ollama.js` 프롬프트를 target/supportType 스키마로 수정
5. LLM 결과 검증 함수 추가
6. JSON 파싱 실패 fallback과 raw 기반 fallback 추가
7. `build-processed.js` 병합 로직 수정
8. cache schema version 또는 cache 무효화 정책 추가
9. `processed/cache.json` 백업/재생성 계획 사용자 승인
10. `processed/campaigns.json` 재생성 계획 사용자 승인
11. `main_service.html` 필터 상태와 UI를 대상/지원 유형/플랫폼/검색어 구조로 수정
12. 기존 category-only 데이터 fallback 처리
13. JSON 파싱 및 필드 존재 검증
14. 허용 목록 밖 값 검증
15. title과 raw.titleRaw 불일치 검증
16. UI 필터 목록 개수 확인
17. 샘플 캠페인 수동 확인
18. `codex/work-log.md`에 실행 결과 기록

## 10. 테스트 및 검증 계획

JSON 파싱 정상 여부:

- `processed/campaigns.json`이 표준 JSON 파서로 정상 파싱되는지 확인한다.
- `processed/cache.json`도 정상 파싱되는지 확인한다.

모든 item에 target/supportType 존재 여부:

- 모든 item에 `target`, `supportType`, `category`가 있는지 검사한다.
- `raw.titleRaw`, `raw.summaryRaw` 보존 여부를 확인한다.

허용 목록 밖 값 존재 여부:

- `target`이 TARGETS 밖으로 나간 항목 수가 0인지 확인한다.
- `supportType`이 SUPPORT_TYPES 밖으로 나간 항목 수가 0인지 확인한다.

title과 raw.titleRaw 불일치 여부:

- `raw.titleRaw`가 있는 item에서 `title !== raw.titleRaw`인 항목 수가 0인지 확인한다.
- `titleRaw`가 비어 있는 항목은 별도 목록으로 확인한다.

UI 필터 목록 개수 확인:

- 대상 필터는 최대 11개 허용 목록 수준인지 확인한다.
- 지원 유형 필터는 최대 12개 허용 목록 수준인지 확인한다.
- 기존처럼 category 조합이 과도하게 늘어나지 않는지 확인한다.

샘플 캠페인 수동 확인:

- "하루를 살아도 깨끗한 집에서 안전하고 건강하게" 예시는 `target=노인`, `supportType=주거지원` 또는 `환경개선` 후보로 검토한다.
- 동물 구조 캠페인, 해외 긴급구호 캠페인, 아동 교육 캠페인, 장애인 의료/돌봄 캠페인을 각각 샘플로 확인한다.

## 11. 사용자에게 확인할 질문

1. `category`를 1차 마이그레이션에서 `target`으로 유지해도 될까요?
2. `oneLineSummary`는 30자 엄격 제한보다 50자 내외 제한을 추천하는데, 이 방향으로 갈까요?
3. 기존 `processed/cache.json`을 백업 후 새 스키마로 재생성해도 될까요?
4. UI 필터를 기존 category 하나에서 `대상`과 `지원 유형`으로 나눠도 될까요?
5. LLM 재가공 전에 규칙 기반 fallback 분류를 먼저 추가해도 될까요?
