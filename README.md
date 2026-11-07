# Happy — 포트폴리오 아카이브

풀스크린 슬라이드 뷰와 비대칭 벤토 그리드 뷰를 오가는 미니멀 포트폴리오 아카이브 사이트입니다.

## 실행 방법

```bash
npm install
npm run dev
```

- **메인 포트폴리오 화면**: `http://localhost:5173/`
- **로컬 관리 페이지 (프로젝트 추가·수정·저장)**: `http://localhost:5173/#admin` (또는 `http://localhost:5173/admin`)

## 모듈 구조

- `src/styles/tokens.css`: 한글 지원 통합 폰트(`Pretendard Variable`), 크기 스케일, 컬러, 여백, 트랜지션 변수
- `src/components/ui/Title`: 프로젝트 타이틀 스타일 모듈 (`hero` / `tile` / `section`)
- `src/components/ui/KeywordText`: 캡슐 없는 순수 텍스트 키워드 모듈
- `src/components/ui/TextLinkButton`: 테두리·화살표 없는 새 창 이동 텍스트 버튼 모듈
- `src/components/ui/CircleIconButton`: 원형 아이콘 전용 버튼 모듈 (뷰 전환 / 슬라이드 양끝 이동)
- `src/components/ui/BentoTile`: 영역 고정 + 내부 이미지 확대/축소 호버 + 대표 링크 새 창 이동 타일 모듈
- `src/data/projects.json`: 포트폴리오 데이터 원본 파일 (로컬 관리 페이지에서 저장 시 자동 반영)
