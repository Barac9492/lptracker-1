# Supabase 설정 가이드

이 프로젝트는 Supabase anon key를 사용하여 더 안정적인 데이터베이스 연결을 제공합니다.

## 📋 필요한 환경 변수

### 1. Supabase 프로젝트에서 정보 가져오기

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. Settings → API로 이동

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 값들을 추가하세요:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL="https://ajxkrseogzecazdlprnd.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# 선택사항: API Keys
NEWS_API_KEY=""
APIFY_API_KEY=""
WEBHOOK_SECRET="your-secret"
```

## 🔑 Supabase API 정보 찾기

### Project URL
- Settings → API → Project URL
- 형식: `https://xxxxx.supabase.co`

### Anon (public) Key
- Settings → API → Project API keys → `anon` `public`
- 매우 긴 문자열 (약 200자)
- 이 키는 공개되어도 안전합니다 (Row Level Security로 보호됨)

**중요:** `service_role` 키가 아닌 `anon` 키를 사용하세요!

## ✅ 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 파일들을 순서대로 실행하세요:

### 1. schema.sql 실행
```sql
-- 프로젝트 루트의 schema.sql 파일 내용을 복사하여 실행
```

### 2. seed.sql 실행 (선택사항)
```sql
-- 샘플 데이터를 원하면 seed.sql 파일 내용을 실행
```

## 🚀 Vercel 배포 설정

### Environment Variables 추가

Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://ajxkrseogzecazdlprnd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = (your-anon-key)
```

선택사항:
```
NEWS_API_KEY = (your-news-api-key)
APIFY_API_KEY = (your-apify-key)
WEBHOOK_SECRET = (your-webhook-secret)
SLACK_WEBHOOK_URL = (your-slack-webhook)
```

### Redeploy

환경 변수 추가 후 Vercel에서 자동으로 재배포됩니다.

## 🧪 연결 테스트

### 로컬에서 테스트

```bash
# 개발 서버 시작
npm run dev

# 헬스 체크 엔드포인트 확인
curl http://localhost:3000/api/health
```

정상 응답 예시:
```json
{
  "timestamp": "2025-11-03T...",
  "environment": "development",
  "supabaseUrl": "Set",
  "supabaseKey": "Set (hidden)",
  "lpCount": 3,
  "database": "OK",
  "supabaseClient": "Connected"
}
```

### Production에서 테스트

```bash
curl https://your-app.vercel.app/api/health
```

## ⚠️ 일반적인 문제 해결

### Error: "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"

**원인:** 환경 변수가 설정되지 않음

**해결:**
1. `.env` 파일 확인
2. Vercel Environment Variables 확인
3. 파일 이름이 정확히 `.env`인지 확인 (`.env.local` 아님)

### Error: "Invalid API key"

**원인:** 잘못된 anon key 사용

**해결:**
1. Supabase Dashboard → Settings → API 확인
2. `anon` `public` 키를 복사 (service_role 아님!)
3. 키를 따옴표 없이 그대로 복사

### Error: "relation 'LP' does not exist"

**원인:** 데이터베이스 테이블이 생성되지 않음

**해결:**
1. Supabase Dashboard → SQL Editor
2. `schema.sql` 파일 내용 실행
3. 성공 메시지 확인

### Error: "Row Level Security" 관련 오류

**원인:** RLS가 활성화되어 있지만 정책이 없음

**해결 (개발용):**
```sql
-- 모든 테이블에 대해 RLS 비활성화 (개발 환경만!)
ALTER TABLE "LP" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Signal" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Outreach" DISABLE ROW LEVEL SECURITY;
```

**해결 (프로덕션용):**
```sql
-- 읽기 허용
CREATE POLICY "Enable read access for all users" ON "LP"
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "LP"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON "LP"
  FOR UPDATE USING (true);

-- Signal, Outreach 테이블도 동일하게 설정
```

## 📚 이전 방식과의 차이

### 이전: DATABASE_URL (직접 PostgreSQL 연결)
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```
- ❌ 연결 문제 발생
- ❌ Serverless 환경에서 불안정
- ❌ Connection pooling 설정 복잡

### 현재: Supabase Client (REST API)
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
```
- ✅ 안정적인 연결
- ✅ Serverless 최적화
- ✅ 간단한 설정
- ✅ Vercel 배포 문제 없음

## 🔒 보안 참고사항

### Anon Key는 안전한가요?

**예, 안전합니다:**
- `anon` 키는 클라이언트 측에서 사용하도록 설계됨
- Row Level Security (RLS)로 데이터 접근 제어
- 브라우저에 노출되어도 괜찮음

**주의사항:**
- `service_role` 키는 **절대** 노출하면 안 됩니다!
- `service_role`은 모든 RLS 규칙을 우회합니다

### 프로덕션 보안 강화

1. **RLS 활성화:**
```sql
ALTER TABLE "LP" ENABLE ROW LEVEL SECURITY;
```

2. **정책 추가:**
```sql
-- 예: 인증된 사용자만 접근
CREATE POLICY "Authenticated users only" ON "LP"
  FOR ALL USING (auth.role() = 'authenticated');
```

3. **Webhook Secret 설정:**
```env
WEBHOOK_SECRET="strong-random-string-here"
```

## 🎉 완료!

이제 Supabase anon key 방식으로 안정적인 데이터베이스 연결을 사용할 수 있습니다.

### 다음 단계:
1. ✅ 환경 변수 설정 완료
2. ✅ 데이터베이스 테이블 생성 완료
3. ✅ /api/health 확인 완료
4. 🚀 Signal catching 시작: `npm run catch-signals`
5. 📊 Dashboard 확인: `http://localhost:3000`

문제가 있으면 `/api/health` 엔드포인트를 확인하세요!
