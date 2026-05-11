# 프로젝트 상태 기록

## 프로젝트 한 줄 설명

여러 기부 플랫폼의 공개 캠페인 데이터를 수집하고, 공통 형식으로 가공한 뒤, 웹 화면에서 검색과 필터링으로 탐색할 수 있게 하는 기부 캠페인 통합 탐색기 프로토타입이다.

## 현재 확정된 방향

- 최종 방향은 실제 지도 기반 서비스보다 기부 캠페인 통합 탐색기에 가깝다.
- 한글 인코딩 문제는 복구하는 방향으로 진행한다.
- Ollama 로컬 모델은 임시 모델이며, 반드시 유지할 필요는 없다.
- 수집 대상 플랫폼은 현재 3개에 고정하지 않고 확장성을 염두에 둔다.
- 다음 우선순위는 UI 개선이다.

## 주요 기능

- Kakao Together, GoodNeighbors, Naver Happybean의 공개 캠페인 목록 수집
- 수집 데이터를 JSON, CSV, Markdown 형식으로 출력하는 CLI 제공
- 플랫폼별 원본 데이터를 공통 캠페인 스키마로 정규화
- LLM을 사용한 제목, 한 줄 요약, 카테고리, 태그 정리
- `processed/campaigns.json`을 API 응답 데이터로 제공
- 정적 HTML 기반 랜딩 페이지와 캠페인 탐색 UI 제공
- 캠페인 제목, 단체명, 요약, 플랫폼, 카테고리, 태그 기반 검색 및 필터링

## 데이터 흐름

1. `bin/cli.js`가 플랫폼별 수집 모듈을 호출한다.
2. `src/kakaoTogether.js`, `src/goodNeighbors.js`, `src/happybean.js`가 각 플랫폼의 공개 API 또는 HTML을 수집한다.
3. 수집 결과는 원본 출력 파일로 저장되는 구조이며, README 기준 주요 원본 경로는 `out/*.json`이다.
4. `scripts/build-processed.js`가 원본 JSON을 읽고 플랫폼별 데이터를 공통 스키마로 정규화한다.
5. `scripts/llm-ollama.js`가 LLM API를 통해 사용자 친화적인 메타데이터를 생성한다.
6. 가공 결과와 캐시는 `processed/campaigns.json`, `processed/cache.json`에 저장된다.
7. `server.js`가 `/api/campaigns`에서 `processed/campaigns.json`을 제공한다.
8. `main_service.html`이 `/api/campaigns`를 fetch하여 카드 목록으로 렌더링한다.

## 주요 파일 역할

- `package.json`: npm 스크립트, 의존성, CLI 엔트리, Node.js 요구 버전 정의
- `server.js`: 정적 파일 서버와 `/api/campaigns` API 제공
- `bin/cli.js`: 플랫폼별 크롤러를 실행하는 CLI
- `src/index.js`: 수집 모듈을 외부로 노출하는 라이브러리 엔트리
- `src/kakaoTogether.js`: Kakao Together 현재 모금 목록 수집 및 변환
- `src/goodNeighbors.js`: GoodNeighbors 캠페인 목록 HTML 파싱 및 변환
- `src/happybean.js`: Naver Happybean 기부 목록 API 수집 및 변환
- `scripts/build-processed.js`: 원본 수집 결과를 공통 스키마로 변환하고 LLM 후처리 결과를 생성
- `scripts/llm-ollama.js`: LLM API 호출, JSON 응답 검증, 카테고리 및 태그 정리
- `scripts/server-setup.js`: 서버 운영 준비용 설정 스크립트
- `scripts/server-refresh.js`: 데이터 재수집 및 가공 갱신 스크립트
- `scripts/server-start.js`: 서버 시작 보조 스크립트
- `index.html`: 랜딩 페이지
- `main_service.html`: 캠페인 검색 및 필터링 UI
- `processed/campaigns.json`: 웹 UI와 API가 사용하는 최종 캠페인 데이터
- `processed/cache.json`: LLM 가공 결과 및 오류 캐시
- `test/*.js`: 수집 URL 생성, 파싱, 진행률 계산, 실제 API 연동 일부 검증

## 현재 확인된 문제점

- README, HTML, 일부 JavaScript 문자열, 테스트 문자열, `processed/campaigns.json`의 한글이 깨져 보인다.
- LLM 카테고리 라벨과 한글 검증 정규식도 깨져 있어 LLM 후처리 품질에 영향을 줄 가능성이 있다.
- `processed/campaigns.json`의 실제 캠페인 제목과 요약도 깨진 항목이 보여 사용자 화면 품질 문제가 예상된다.
- 프로젝트명은 Donation Map이지만 현재 구현에는 실제 지도, 좌표, 지역 기반 시각화, 지도 라이브러리가 확인되지 않았다.
- UI는 CDN Tailwind를 사용하므로 네트워크 환경에 따라 스타일 렌더링이 달라질 수 있다.
- `out/` 폴더는 README에서 언급되지만 현재 파일 목록에는 보이지 않았다.
- 일부 테스트는 실제 외부 API를 호출하는 integration test라 네트워크 상태와 외부 서비스 변경에 영향을 받을 수 있다.

## 지도 서비스인지 캠페인 탐색기인지에 대한 판단

사용자 확인 결과, 이 프로젝트의 최종 방향은 지도 기반 서비스보다 기부 캠페인 통합 탐색기에 가깝다. 따라서 앞으로의 개선 방향은 지도 기능 추가보다 캠페인 데이터 품질, 탐색 경험, 확장 가능한 플랫폼 수집 구조, UI 완성도를 우선해야 한다.

## 다음에 확인하면 좋을 사항

- 한글 인코딩이 언제, 어느 단계에서 깨졌는지 원인 확인
- 원본 수집 결과인 `out/*.json` 생성 여부와 현재 누락 이유 확인
- 인코딩 복구를 원본 재수집, 파일 인코딩 복원, UI 문구 재작성 중 어떤 방식으로 나눌지 계획 수립
- LLM 모델 교체 가능성을 고려한 후처리 인터페이스 정리
- 플랫폼 추가 확장을 위한 수집 모듈 공통 인터페이스 확인
- UI 개선 범위 정의: 정보 구조, 카드 디자인, 검색/필터 UX, 반응형 레이아웃, 빈 상태, 오류 상태
- `processed/campaigns.json`을 직접 수정하지 않고 재생성 파이프라인으로 복구할 수 있는지 확인

## 사용자에게 확인할 질문

추가 질문 없음
