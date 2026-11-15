# 음성 생성 및 운영 (A안)

현재 동화 제목 8개, 본문 60쪽, 낱말 39개는 한국어 + 6개 집 말로 생성합니다. 받아쓰기 문장 48개는 한국어만 생성합니다. MP3는 mono 24kHz / 48kbps입니다. 디자인 파일은 변경하지 않습니다.

## GitHub Secrets 등록

1. Azure Portal에서 Speech 리소스를 생성합니다.
2. 리소스의 Keys and Endpoint에서 API 키와 Region 값을 확인합니다.
3. GitHub > gogeangs/eommamal > Settings > Secrets and variables > Actions > New repository secret에서 AZURE_SPEECH_KEY와 AZURE_SPEECH_REGION을 각각 등록합니다. 지역 예: koreacentral.
4. GitHub > Settings > Actions > General에서 Workflow permissions: Read and write permissions를 선택하고 Allow GitHub Actions to create and approve pull requests 옵션을 허용합니다. 키는 코드·Variables·커밋에 넣지 마세요.
5. feature/voice 기능 PR을 main에 병합한 후 Actions > Generate recorded audio > Run workflow에서 먼저 scope=sample, languages=mn,uz, force=false로 발음을 검수합니다.
6. 전체 생성은 scope=full, languages=all, force=false로 실행합니다. 워크플로가 audio/update-<run-id> 브랜치를 만들고 음성 파일 PR을 생성합니다. main에 직접 푸시하지 않습니다.

## 작업 명령

npm ci
node scripts/audio/generate.mjs --dry-run --scope=full --languages=all
npm run build

--dry-run은 API 요청이나 파일 변경 없이 대상 개수와 문자 수를 출력합니다. 기존 녹음이 있고 textHash와 settingsHash가 같으면 해당 파일은 재생성하지 않습니다.

## 데이터 규칙

경로: public/audio/<lang>/<key>.mp3 및 public/audio/manifest.json
정규화: Unicode NFC, LF 줄바꿈, 앞뒤 공백 제거
textHash: 정규화된 문장 SHA-256
settingsHash: 음성·속도·형식 조합 SHA-256
audioHash: MP3 자체 SHA-256

앱은 문장이 수정되어 해시가 불일치하면 해당 음성을 사용하지 않고 브라우저 TTS로 돌아갑니다. MP3는 처음 들을 때만 CacheFirst 캐시에 저장됩니다. hasVoice는 해당 언어의 전체 생성이 끝났거나 기기 음성이 있는 경우 true가 됩니다.

원어민 파일을 교체할 때도 같은 키와 경로를 유지하고 manifest의 해시 및 source를 수정합니다. 부모의 개별 녹음은 공개 GitHub 저장소에 저장하지 않으며 3단계에 별도의 비공개 저장소를 설계합니다.
