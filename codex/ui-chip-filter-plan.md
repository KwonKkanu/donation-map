# UI chip 및 필터 구조 개선 계획

작성일: 2026-05-14

## 1. 현재 UI 구조 요약

현재 `main_service.html`의 카드 UI는 캠페인마다 `renderCard(it)` 함수에서 HTML 문자열을 생성한다.

카드 상단 chip 영역:

```js
<div class="flex items-center gap-2 mb-3">
    ${chip(it.platform)}
    ${it.category ? chip(it.category) : ''}
</div>
```

현재 상단 chip은 다음 두 값만 표시한다.

- `it.platform`: 캠페인 출처
- `it.category`: 기존 단일 분류값

즉, 카드 상단에 보이는 chip은 태그 목록이 아니라 `platform + category` 표시다.

실제 `tags` 배열은 카드 하단에서 별도 영역으로 렌더링된다.

```js
const tags = Array.isArray(it.tags) ? it.tags.slice(0, 6) : [];
...
${tags.length ? `
    <div class="mt-4 flex flex-wrap gap-2">
        ${tags.map(t => `<span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">${escapeHtml(t)}</span>`).join('')}
    </div>
` : ''}
```

현재 하단 tags 영역은:

- `it.tags`가 배열일 때만 사용한다.
- 최대 6개까지 표시한다.
- tags가 없거나 빈 배열이면 태그 영역 전체를 숨긴다.
- `#` 접두사는 붙이지 않는다.

현재 `processed/campaigns.json` 확인 결과:

- 정규식 기준 `category` 필드는 1195개 확인된다.
- 정규식 기준 `tags` 필드는 1195개 확인된다.
- 정규식 기준 `target` 필드는 0개다.
- 정규식 기준 `supportType` 필드는 0개다.
- 따라서 현재 화면 데이터는 아직 새 분류 스키마가 아니라 `platform/category/tags` 구조를 기준으로 표시된다.

필터 UI는 현재 다음 상태값을 사용한다.

- `q`
- `category`
- `source`

`applyFilters`는 `source`, `category`, 검색어 조건을 적용한다. 검색어 대상에는 `title`, `org`, `oneLineSummary`, `platform`, `category`, `tags`, `raw.titleRaw`, `raw.summaryRaw`가 포함된다.

## 2. 현재 사용자가 헷갈릴 수 있는 지점

- 카드 상단 chip이 여러 태그처럼 보일 수 있지만, 실제로는 `platform`과 `category`만 표시한다.
- `tags` 배열은 상단 chip이 아니라 카드 하단 별도 영역에 표시된다.
- 하단 tags 영역은 금액/진행률/기관 정보 아래에 있어 상대적으로 눈에 덜 띌 수 있다.
- 현재 `category`는 `target/supportType` 도입 전 임시 단일 분류값이다.
- 현재 `category`에는 "누구를 돕는가"와 "무엇을 지원하는가"가 섞여 보일 수 있다.
- 아직 `processed/campaigns.json`을 새 스키마로 재생성하지 않았기 때문에 화면 데이터에는 `target`과 `supportType`이 반영되지 않았다.
- 새 코드 파이프라인은 `target/supportType`을 생성하도록 바뀌었지만, 데이터 재생성과 UI 수정이 아직 끝나지 않으면 사용자는 기존 `platform/category/tags` 구조만 보게 된다.

## 3. 권장 카드 표시 구조

데이터 구조의 역할을 UI에서도 분명하게 나누는 것이 좋다.

목표 데이터 의미:

- `platform`: 캠페인 출처
- `target`: 누구를 돕는가
- `supportType`: 무엇을 지원하는가
- `tags`: 검색/키워드용 태그 배열

권장 카드 상단:

- platform chip
- target chip
- supportType chip

권장 카드 하단:

- tags 배열을 `#태그` 형태로 3~5개 표시

예시:

```text
[Kakao Together] [노인] [주거지원]
#어르신 #주거 #환경개선
```

표시 우선순위:

1. 상단에는 출처와 구조화된 분류를 보여준다.
2. 하단에는 검색/키워드 보조용 tags를 보여준다.
3. `category` chip은 숨기거나, `target` fallback으로만 사용한다.

권장 tags 표시:

- 최대 5개 표시
- 표시 텍스트는 `#${tag}` 형태
- tags가 비어 있으면 하단 태그 영역을 숨긴다.
- tags는 분류가 아니라 키워드라는 점이 시각적으로 드러나게 색상/위치를 구분한다.

## 4. 필터 UI 개선안

기존 필터:

- 검색어
- 카테고리
- 플랫폼

개선 필터:

- 검색어
- 대상
- 지원 유형
- 플랫폼

상태값 변경 계획:

```js
const state = {
  data: null,
  items: [],
  q: '',
  target: '',
  supportType: '',
  source: ''
};
```

기존 데이터 fallback:

- `target`이 없으면 `category`를 대상 fallback으로 사용한다.
- `supportType`이 없으면 빈 값으로 취급한다.
- 구 데이터에서 지원 유형 필터를 선택하면 매칭 항목이 줄어들 수 있으므로, UI 수정은 processed 데이터 재생성 이후 적용하는 것이 안전하다.

옵션 생성 계획:

- 대상 옵션은 `it.target || it.category`에서 생성한다.
- 지원 유형 옵션은 `it.supportType`에서 생성한다.
- 플랫폼 옵션은 기존처럼 고정값을 유지하거나 데이터에서 추출할 수 있다.

## 5. renderCard 수정 계획

`main_service.html`의 `renderCard(it)`에서 다음 영역을 수정하면 된다.

현재:

```js
${chip(it.platform)}
${it.category ? chip(it.category) : ''}
```

개선 계획:

- `platform` chip은 유지한다.
- `category` chip 대신 `target`과 `supportType` chip을 사용한다.
- `target`이 없으면 `category`를 fallback으로 사용한다.
- `supportType`이 없으면 표시를 생략하는 방안을 우선 추천한다.
- `supportType`이 `기타`인 경우 표시할지 숨길지는 사용자 결정이 필요하다.
- tags는 하단에서 유지하되 최대 5개만 표시한다.
- tags 표시 텍스트는 `#태그` 형태로 바꾼다.
- tags가 비어 있으면 기존처럼 태그 영역을 숨긴다.

예상 보조 변수:

```js
const target = it.target || it.category || '';
const supportType = it.supportType || '';
const tags = Array.isArray(it.tags) ? it.tags.slice(0, 5) : [];
```

예상 상단 chip:

```js
${chip(it.platform)}
${target ? chip(target) : ''}
${supportType ? chip(supportType) : ''}
```

예상 하단 tag:

```js
${tags.map(t => `<span ...>#${escapeHtml(t)}</span>`).join('')}
```

주의:

- 현재 UI 한글 문구가 깨져 보이므로, 실제 수정 시 UI 문구 정리와 인코딩 복구 계획을 함께 고려해야 한다.
- 카드 상단 chip이 너무 많아질 수 있으므로 모바일에서 줄바꿈이 자연스럽게 되도록 `flex-wrap`을 검토한다.

## 6. applyFilters 수정 계획

필터 조건:

- `q`: 검색어
- `source`: 플랫폼
- `target`: 대상
- `supportType`: 지원 유형

기존:

```js
if (src && it.source !== src) return false;
if (cat && it.category !== cat) return false;
```

개선 계획:

```js
const targetValue = it.target || it.category || '';
const supportTypeValue = it.supportType || '';

if (src && it.source !== src) return false;
if (target && targetValue !== target) return false;
if (supportType && supportTypeValue !== supportType) return false;
```

검색어 대상 확장:

- `it.title`
- `it.org`
- `it.oneLineSummary`
- `it.platform`
- `it.target`
- `it.supportType`
- `it.category`
- `it.tags`
- `it.raw?.titleRaw`
- `it.raw?.summaryRaw`
- `it.raw?.categoryRaw`

기존 데이터 호환:

- `target` fallback으로 `category`를 사용하는 것을 추천한다.
- `supportType`은 기존 데이터에 없으므로 fallback을 만들기 어렵다.
- 따라서 UI 수정은 새 processed 데이터가 재생성된 뒤 진행하는 편이 안전하다.

## 7. 데이터 재생성 전/후 UI 차이

재생성 전:

- `processed/campaigns.json`에는 `target`과 `supportType`이 없을 수 있다.
- 카드 상단은 계속 `platform/category` 중심으로 표시된다.
- 지원 유형 필터를 추가해도 데이터가 없어 정상 동작을 기대하기 어렵다.
- tags는 기존 LLM 결과 기준으로 하단에만 표시된다.

재생성 후:

- 각 item에 `target`, `supportType`, `category`가 포함된다.
- `category`는 1차 호환 정책에 따라 `target`과 같은 값이 된다.
- 카드 상단을 `platform/target/supportType`으로 바꿀 수 있다.
- 필터를 `대상/지원 유형/플랫폼/검색어`로 나눌 수 있다.
- tags는 하단에서 3~5개 키워드로 표시할 수 있다.

판단:

- UI 수정은 데이터 파이프라인 수정과 processed/cache 재생성 이후에 하는 것이 안전하다.
- 데이터가 새 스키마로 준비되지 않은 상태에서 UI를 먼저 바꾸면 supportType 필터가 비어 보이거나 동작하지 않을 수 있다.

## 8. 단계별 적용 순서

추천 순서:

1. 데이터 파이프라인 수정 완료
2. `processed/cache.json`과 `processed/campaigns.json` 백업
3. 새 스키마 기준으로 processed/cache 재생성
4. `processed/campaigns.json` JSON 유효성 검증
5. 모든 item에 `target`, `supportType`, `category`가 있는지 검증
6. `main_service.html` 카드 상단 chip 구조 수정
7. 하단 tags를 `#태그` 형태로 최대 5개 표시하도록 정리
8. 필터를 category에서 target/supportType으로 분리
9. 기존 category-only 데이터 fallback 확인
10. 카드 표시 샘플 확인
11. `codex/work-log.md`에 결과 기록

## 9. 사용자에게 확인할 질문

1. 카드 상단에 `platform`, `target`, `supportType`을 모두 표시해도 될까요?
2. tags는 카드 하단에 `#태그` 형태로 유지할까요?
3. 기존 `category` chip은 숨기고 `target/supportType`으로 대체해도 될까요?
4. 기존 데이터에서 `supportType`이 없을 때 표시를 생략할까요, 아니면 `기타`로 보여줄까요?
5. tags가 5개보다 많을 경우 UI에서는 최대 5개만 보여주는 방향으로 확정해도 될까요?
