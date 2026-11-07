# Happy — 포트폴리오 아카이브

풀스크린 슬라이드 뷰와 가로형 텍스트 리스트 뷰를 오가는 미니멀 포트폴리오 아카이브 사이트입니다.

## 실행 방법

```bash
npm install
npm run dev
```

- **메인 포트폴리오 화면**: `http://localhost:5173/`
- **로컬 관리 페이지 (프로젝트 추가·수정·순서 변경·저장)**: `http://localhost:5173/admin` (또는 `http://localhost:5173/#admin`)

## 모듈 구조

- `src/styles/tokens.css`: 한글 지원 통합 폰트(`Pretendard Variable`), 크기 스케일, 컬러, 여백, 트랜지션 변수
- `src/components/ui/Title`: 한글 자모 조합 타이핑 효과를 지원하는 타이틀 모듈 (`hero` / `tile` / `section`)
- `src/components/ui/KeywordText`: `#` 접두사가 붙는 순수 텍스트 키워드 모듈
- `src/components/ui/TextLinkButton`: 중앙에서 펼쳐지는 밑줄 호버 및 새 창 이동 텍스트 링크 모듈
- `src/components/ui/FlipCounter`: 양방향 3D 스플릿 플립 페이지 카운터 모듈
- `src/components/ui/CircleIconButton`: 우측 상단 뷰 전환 타일 및 상하 이동 화살표 아이콘 버튼 모듈
- `src/components/views/SlideView`: 풀스크린 슬라이드 뷰
- `src/components/views/BentoGridView`: 가로형 텍스트 목록 뷰
- `src/components/views/AdminView`: 로컬 포트폴리오 관리 뷰
- `src/data/projects.json`: 포트폴리오 데이터 원본 파일 (로컬 관리 페이지에서 저장 시 자동 반영)
