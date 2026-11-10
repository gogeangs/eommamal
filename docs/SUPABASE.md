# 서버(Supabase)와 보호자 계정

## 무엇이 되나요
- **보호자 계정**: 이메일로 받은 6자리 코드로 로그인해요(비밀번호 없음). 부모 화면 → "보호자 계정"
- **기록 동기화**: 아이 프로필, 읽은 책, 낱말, 받아쓰기, 공부한 날이 계정에 저장되고 여러 기기에서 이어져요.
  - 모은 것(낱말, 다 읽은 책, 공부한 날)은 합치고, 별점은 높은 쪽, 설정과 읽던 쪽은 마지막에 바꾼 쪽을 따라요.
  - 한 기기에서 지운 아이는 다른 기기에서도 지워져요.
- **체험 기간 고정**: 30일 체험 시작일은 계정에 저장되고, 여러 기기 중 가장 이른 날이 기준이에요. 로그인한 가족은 앱 데이터를 지워도 체험이 다시 시작되지 않아요.
- **하루 2권**: 가족의 모든 기기가 함께 세요.
- **구독**: 앱에서 산 구독(RevenueCat → 서버)이 계정에 기록돼서, 같은 계정으로 로그인한 웹에서도 열려요.
- **계정 지우기**: 부모 화면에서 보호자 계정과 서버 기록을 지울 수 있어요(앱스토어 필수 조건).
- **콘텐츠 관리**: 관리자 계정으로 로그인하면 관리 화면에서 "서버에 게시하기"로 바로 게시돼요(그림은 서버 저장소로).
- 서버 설정이 없으면 앱은 지금처럼 이 기기에서만 동작하고 계정 메뉴가 보이지 않아요.

## 처음 한 번 설정 (고경민 님)
1. https://supabase.com 가입 → **New project** (지역: Northeast Asia (Seoul))
2. **SQL Editor**에 `supabase/migrations/001_init.sql` 전체를 붙여 넣고 Run
3. **Authentication → Sign In / Providers → Email**: 켜기, "Confirm email" 켜기
4. **Authentication → Emails → Magic Link** 템플릿 본문에 코드가 나오게 바꾸기:
   `<h2>엄마말 그림책 로그인 코드</h2><p>아래 6자리 코드를 앱에 입력해 주세요.</p><h1>{{ .Token }}</h1>`
5. (권장) **Authentication → Emails → SMTP**: 회사 메일 발송 서비스 연결. 기본 메일은 시간당 발송 수가 적어요.
6. **Project Settings → API**에서 `Project URL`과 `anon public` 키를 복사
7. GitHub 저장소 → **Settings → Secrets and variables → Actions → Variables** 에 추가
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public 키
   - 두 값은 공개돼도 되는 값이에요. 데이터는 행 단위 보안(RLS)으로 가족별로 막혀 있어요.
8. Actions에서 "Deploy to GitHub Pages"를 다시 실행하면 계정 메뉴가 나타나요.
9. 관리자 지정: 관리자 이메일로 앱에서 한 번 로그인한 뒤 SQL Editor에서
   `insert into public.admins (user_id) select id from auth.users where email = '관리자 이메일';`

## 구독 연결 (앱 출시 후)
- `supabase/functions/revenuecat-webhook` 를 배포하고 RevenueCat 웹훅을 연결해요. 방법은 파일 맨 위 주석에 있어요.
- 앱은 로그인한 보호자의 계정 ID로 RevenueCat에 구매자를 연결해요(`identifyBuyer`).

## 개인정보
- 받는 정보: 보호자 이메일, 아이 별명·그림, 학습 기록. 아이 실명·연락처·생년월일은 받지 않아요.
- 개인정보처리방침에 위 항목, 보관 기간(계정 삭제 시 즉시 삭제), 처리 위탁(Supabase, 앱 출시 후 RevenueCat)을 적어야 해요.
