# 유료 구독 (인앱 결제)

## 정책
| 기간 | 이용 범위 |
|---|---|
| 처음 쓴 날부터 30일 (1~30일째) | 모든 기능 무료 |
| 31일째부터, 구독하지 않으면 | 하루에 동화 **2권**. 오늘 이미 연 동화는 다시 열어도 셈하지 않아요. 낱말 놀이·따라 쓰기·받아쓰기·부모 화면은 그대로 |
| 가족 구독 (월 4,900원, 자동 갱신) | 모든 서비스, 기기 안의 모든 아이 |

- 기준은 **기기(가족) 단위**예요. 아이를 추가해도 하루 2권이 늘지 않아요.
- 날짜는 기기의 자정 기준으로 바뀌어요.
- 결제 화면 앞에는 **보호자 확인**(곱셈 문제)이 있어요. 아이 화면에는 가격과 결제 버튼이 없어요.

## 코드 위치
- `src/lib/plan.tsx`: 체험·하루 한도·구독 상태 (`emb-firstUse`, `emb-reads`, `emb-sub`)
- `src/lib/billing.ts`: 스토어 연결. 웹에서는 구독 불가 안내, 앱 안에서는 스토어 플러그인 사용
- `src/screens/Subscribe.tsx`: 오늘 다 읽었어요 화면, 보호자 확인, 구독 안내, 상태 표시
- 테스트: 주소에 `?plan=trial`, `?plan=free`, `?plan=sub` 를 붙이면 그 상태로 보여요 (예: `/?plan=free#read-star`).

## 남은 일: 앱으로 출시
인앱 결제는 웹(GitHub Pages)에서는 할 수 없어요. 같은 코드를 **Capacitor**로 감싸 App Store·Google Play 앱으로 내요.

1. **앱 껍데기 만들기** (iOS 빌드에는 macOS가 필요해요. Mac이 없으면 GitHub Actions의 macOS 빌드 환경이나 Codemagic 같은 클라우드 빌드로 만들고 TestFlight로 iPhone에 설치해요. Android는 Linux에서도 빌드돼요)
   - `npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
   - `npx cap init "엄마말 그림책" kr.co.project30s.eommamal --web-dir dist`
   - `npm run build && npx cap add ios && npx cap add android`
2. **구독 상품 등록**
   - App Store Connect: 자동 갱신 구독, 상품 ID `eommamal_family_monthly`, 1개월, 대한민국 가격 4,900원(가격표에 있는지 확인)
   - Google Play Console: 같은 ID의 정기 결제, 기본 요금제 월 4,900원
3. **결제 연결**: RevenueCat Capacitor 플러그인 (`@revenuecat/purchases-capacitor`)
   - RevenueCat에 두 스토어 상품을 연결하고 권한(entitlement) 이름을 `family` 로 만들어요.
   - 앱 시작 시 `Purchases.configure({ apiKey })` 한 줄을 넣으면 `billing.ts` 가 자동으로 스토어를 써요.
4. **심사 준비**
   - 구독 화면에 이용약관·개인정보처리방침 링크, 가격·기간·자동 갱신 안내 (화면 문구는 이미 있음, 링크 추가 필요)
   - 어린이 카테고리로 낼 경우: 보호자 확인(완료), 외부 광고·분석 도구 금지 규정 확인, 결제 SDK가 허용되는지 확인
   - Google Play 가족 정책 확인

## 알려진 한계
- 로그인하지 않은 기기는 체험 시작일이 기기에만 저장돼서, 앱 데이터를 지우면 체험이 다시 시작돼요. 로그인한 가족은 서버의 시작일을 따라요(docs/SUPABASE.md).
- 구독 상태는 스토어 계정 기준이라, 같은 스토어 계정의 다른 기기에서는 "구독 복원하기"로 되살려요.
