# 서버(Firebase)와 보호자 계정

무료 Spark 플랜(Authentication + Cloud Firestore)만 써요. 카드 등록이 필요 없어요.

## 무엇이 되나요
- **보호자 로그인**: "Google로 로그인" 또는 이메일로 받은 **로그인 링크**(비밀번호 없음). 설정 탭 → 보호자 계정
- **기록 동기화**: 아이 프로필, 읽은 책, 낱말, 받아쓰기, 공부한 날, 배울 말 설정이 계정에 저장되고 여러 기기에서 이어져요.
  - 모은 것은 합치고, 별점은 높은 쪽, 설정·읽던 쪽은 마지막에 바꾼 쪽을 따라요. 지운 아이는 모든 기기에서 지워져요.
- **계정 지우기**: 설정 탭에서 보호자 계정과 서버 기록을 지워요(앱스토어 필수 조건).
- **콘텐츠 관리**: 관리자 계정으로 로그인하면 "서버에 게시하기"로 글(동화·번역·낱말)을 바로 게시해요.
  - 무료 플랜에는 파일 저장소가 없어서 **새 그림은 지금처럼 파일(content.zip → GitHub)로 게시**해요.
- **번역 검수**: 검수자 계정으로 `#review`에서 "서버에 저장". 언어별 권한, 줄 단위로 합쳐져요.
- 설정이 없으면 앱은 지금처럼 기기 안에서만 동작하고, 서버 코드도 내려받지 않아요.

## 처음 한 번 설정
1. https://console.firebase.google.com → **프로젝트 추가** → 이름 `eommamal` (Google 애널리틱스는 꺼도 돼요)
2. **빌드 → Authentication → 시작하기 → 로그인 방법**
   - **Google** 사용 설정 (지원 이메일 선택)
   - **이메일/비밀번호** 사용 설정 → 그 안의 **이메일 링크(비밀번호 없는 로그인)** 도 사용 설정
   - **설정 → 승인된 도메인**에 `gogeangs.github.io` 추가
3. **빌드 → Firestore Database → 데이터베이스 만들기** → 위치 `asia-northeast3 (서울)` → 프로덕션 모드
   - **규칙** 탭에 저장소의 `firestore.rules` 내용을 붙여 넣고 **게시**
4. **프로젝트 설정(톱니바퀴) → 일반 → 내 앱 → 웹 앱 추가(</>)** → 이름 `eommamal-web` (호스팅 체크 안 함)
   - 나오는 `firebaseConfig`의 `apiKey`, `authDomain`, `projectId`, `appId` 를 복사
5. 그 값은 `.github/workflows/deploy.yml` 에 기본값으로 들어 있어요(공개돼도 되는 값이고, 데이터는 `firestore.rules` 가 가족별로 막아요). 다른 프로젝트로 바꿀 때만 GitHub → Settings → Secrets and variables → Actions → Variables 에 같은 이름(`VITE_FIREBASE_API_KEY` 등)으로 넣으면 그 값이 우선해요.

> **현재 상태 (2026-11-15)**: 위 1~4 완료. 프로젝트 `eommamal`, Firestore 서울(asia-northeast3), 규칙 게시됨, 웹 앱 `eommamal-web` 등록됨.

## 관리자·검수자 지정
앱에서 한 번 로그인한 뒤, Firebase 콘솔에서:
1. **Authentication → 사용자** 에서 그 사람의 **사용자 UID** 복사
2. **Firestore Database → 데이터**
   - 관리자: 컬렉션 `admins` → 문서 ID = UID, 필드 없이(또는 `note` 아무 글) 저장
   - 검수자: 컬렉션 `reviewers` → 문서 ID = UID, 필드 `langs` (배열) = `vi` 처럼 맡을 언어 코드(ru, mn, vi, uz, zh, en)

## 데이터 구조
- `families/{uid}` 체험 시작일 · `families/{uid}/children/{아이}` 기록 · `families/{uid}/reads/{날짜}` 그날 연 동화
- `content/main` 게시된 콘텐츠(글·번역 수정·검수 표시) · `admins`, `reviewers` 권한 · `subscriptions/{uid}` (유료화 때 서버가 씀)

## 무료 한도 (Spark)
- Firestore 하루 읽기 5만·쓰기 2만, 저장 1GB / 로그인 무제한(이메일 링크는 하루 발송 한도 있음)
- 가족 수백 곳까지는 충분해요. 넘으면 Blaze(종량제)로 올리면 돼요.

## 알아 둘 점
- 이메일 링크는 **보낸 기기·브라우저에서 열어야** 바로 로그인돼요. 다른 기기에서 열면 이메일 주소를 한 번 더 물어요.
- 홈 화면에 설치한 앱(PWA)에서 Google 로그인 창이 막히면 Google 화면으로 이동했다가 돌아와요.
- 유료 구독을 다시 켜고 앱스토어 결제를 서버에 기록하려면 Cloud Functions(Blaze 필요)가 있어야 해요. 지금은 결제가 꺼져 있어서 필요 없어요.
