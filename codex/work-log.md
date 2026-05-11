# 작업 기록

## 2026-05-11

### 작업 목적

현재 프로젝트의 기존 소스와 결과물을 수정하지 않고, 프로젝트 분석 결과와 앞으로의 작업 규칙을 `codex/` 폴더 안에 기록한다.

### 읽은 파일

- `README.md`
- `package.json`
- `server.js`
- `src/index.js`
- `src/kakaoTogether.js`
- `src/goodNeighbors.js`
- `src/happybean.js`
- `scripts/build-processed.js`
- `scripts/llm-ollama.js`
- `bin/cli.js`
- `index.html`
- `main_service.html`
- `processed/campaigns.json`
- `test/kakaoTogether.test.js`
- `test/happybean.integration.test.js`
- `test/crawlNow.integration.test.js`
- `codex/project-status.md`
- `codex/work-log.md`

### 생성한 파일

- `codex/project-status.md`
- `codex/work-log.md`
- `codex/codex-rules.md`

### 수정한 파일

- `codex/project-status.md`: 사용자 답변을 반영해 프로젝트 방향과 우선순위를 업데이트
- `codex/work-log.md`: 사용자 답변과 이번 기록 업데이트 내역을 추가

### 수정하지 않은 파일

- `README.md`
- `package.json`
- `package-lock.json`
- `server.js`
- `index.html`
- `main_service.html`
- `processed/campaigns.json`
- `processed/cache.json`
- `bin/cli.js`
- `src/` 폴더 내부 파일
- `scripts/` 폴더 내부 파일
- `test/` 폴더 내부 파일

### 확인한 문제

- Git 저장소는 로컬에 존재하며 현재 브랜치는 `master`이다.
- 원격 저장소는 연결되어 있지 않다.
- 작업 전 `git status --short --branch` 결과는 `## master`와 추적되지 않은 `codex/` 폴더로 표시되었다.
- README와 사용자 화면 텍스트, 일부 코드 문자열, 테스트 문자열, 최종 JSON 데이터의 한글 인코딩이 깨져 보인다.
- 현재 구현은 지도 기능보다 캠페인 검색 및 필터링 UI에 가깝다.
- `out/` 폴더는 README에서 언급되지만 현재 파일 목록에서는 확인되지 않았다.

### 사용자 답변으로 확정된 방향

- 프로젝트 최종 방향은 기부 캠페인 통합 탐색기에 가깝다.
- 한글 인코딩 문제는 복구하는 방향으로 진행한다.
- Ollama 로컬 모델은 임시 모델이며 반드시 유지하지 않아도 된다.
- 수집 대상 플랫폼은 확장성을 염두에 둔다.
- 다음 우선순위는 UI 개선이다.

### 다음 작업 제안

- UI 개선 전에 현재 화면의 정보 구조와 사용 흐름을 문서로 정리한다.
- 인코딩 복구는 바로 실행하지 말고, 깨진 파일 범위와 복구 전략을 먼저 `codex/` 안에 계획으로 작성한다.
- LLM 모델 교체 가능성을 고려해 후처리 단계를 모델 독립적으로 정리할 방안을 검토한다.
- 플랫폼 추가 확장을 위해 수집 모듈의 공통 출력 스키마를 문서화한다.
- 기존 파일을 수정해야 하는 작업은 먼저 계획 문서만 만들고 사용자 허락 후 진행한다.

### 사용자에게 확인할 질문

추가 질문 없음
