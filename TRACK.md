# Darslinker - Loyiha Tahlili va Rejalar

📅 **Sanasi:** 2026-01-27
👤 **Tahlilchi:** Claude Code

---

## 📁 Loyiha Strukturasi

```
Darslinker new/
├── backend/          # Express + Prisma (Node.js)
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/         # Next.js 16 + React 19
│   ├── src/
│   ├── public/
│   └── package.json
└── TRACK.md         # Bu fayl
```

---

## 🎯 Loyiha Haqida

**Nom:** Darslinker
**Maqsad:** Onlayn ta'lim platformasi (LMS - Learning Management System)

### Asosiy Xususiyatlar:
1. **Video Darslar** - HLS streaming format
2. **Test Tizimi** - 6 xil savol turi (choice, drag-drop, fill-blank, etc.)
3. **Progress Tracking** - O'quvchi yutuqlarini kuzatish
4. **Achievement System** - Badge'lar va sertifikatlar
5. **To'lov Tizimi** - Kurs sotib olish
6. **4 ta rol:** Admin, Moderator, Teacher, Student
7. **3 til:** O'zbek, Rus, Ingliz

---

## 🛠 Texnologiyalar

### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **UI Library:** React 19.2.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + Shadcn/ui
- **HTTP Client:** Ky (token management)
- **Video Player:** Vidstack + HLS.js
- **Forms:** React Hook Form + Zod validation
- **State:** React Context API

### Backend
- **Framework:** Express.js
- **Database:** Prisma ORM (PostgreSQL)
- **Auth:** JWT + bcrypt
- **File Upload:** Multer + AWS S3
- **Validation:** Zod
- **Bot:** Telegram Bot (Grammy)
- **Testing:** Vitest

---

## ⚠️ MUHIM SECURITY MUAMMO!

### 🚨 Git Remote'da Token Expose Bo'lgan!

**Muammo:** Git remote URL'da GitHub personal access token ochiq holda!
```
https://[REDACTED_GITHUB_TOKEN]@github.com/katovdev/frontend.git
```

**Xavfi:**
- ✗ Har kim bu token bilan sizning repo'laringizga kirishishi mumkin
- ✗ Code o'chirishi yoki o'zgartirishi mumkin
- ✗ Private repo'larni ko'rishi mumkin

**Hal Qilish Kerak:**
1. GitHub'da bu tokenni darhol revoke qiling
2. Yangi token yarating
3. Git remote'ni to'g'irlang (quyida ko'rsatilgan)

---

## 📋 BAJARILISHI KERAK BO'LGAN ISHLAR

### 1. 🔴 BIRINCHI NAVBAT - Security Fix (ZARUR!)

#### A. GitHub Token'ni Revoke Qilish
1. GitHub'ga kiring: https://github.com/settings/tokens
2. `[REDACTED_GITHUB_TOKEN]` tokenni toping
3. "Revoke" tugmasini bosing
4. Yangi token yarating (agar kerak bo'lsa)

#### B. Git Remote'ni Tuzatish
```bash
# 1. Remote'ni o'chirish
git remote remove origin

# 2. Token'siz remote qo'shish
git remote add origin https://github.com/katovdev/frontend.git

# 3. Tekshirish
git remote -v

# 4. Keyingi push'da login so'raladi
# Username: katovdev
# Password: [YANGI_TOKEN] yoki GitHub parolingiz
```

**Yoki SSH ishlatish (yaxshiroq):**
```bash
# 1. SSH key yaratish (agar yo'q bo'lsa)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. SSH key'ni GitHub'ga qo'shish
cat ~/.ssh/id_ed25519.pub
# Bu chiqayotgan key'ni GitHub Settings > SSH Keys'ga qo'shing

# 3. Remote'ni SSH'ga o'zgartirish
git remote set-url origin git@github.com:katovdev/frontend.git

# 4. Tekshirish
git remote -v
```

---

### 2. 🟡 Backend Setup

Backend hozir mavjud (`/backend/` papkada), lekin ishga tushirish kerak:

```bash
# 1. Backend papkasiga o'ting
cd backend

# 2. Dependencies o'rnatish
npm install

# 3. Environment o'rnatish
cp .env.example .env
# .env faylni to'ldiring:
# - DATABASE_URL
# - JWT_SECRET
# - AWS_S3 credentials
# - SMS_API_KEY (OTP uchun)

# 4. Database setup
npm run db:generate
npm run db:push
# yoki
npm run db:migrate

# 5. Backend'ni ishga tushirish
npm run dev
# http://localhost:8000
```

**Database kerak:**
- PostgreSQL 14+ (tavsiya qilinadi)
- yoki MongoDB (agar backend qo'llab-quvvatlasa)

```bash
# PostgreSQL o'rnatish (macOS)
brew install postgresql@14
brew services start postgresql@14
createdb darslinker
```

---

### 3. 🟢 Frontend Setup

Frontend tayyor, faqat environment sozlash kerak:

```bash
# 1. Frontend papkasiga o'ting
cd frontend

# 2. Dependencies allaqachon o'rnatilgan
# Agar kerak bo'lsa: npm install

# 3. .env.local mavjud:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 4. Frontend ishga tushirish
npm run dev
# http://localhost:3000
```

---

### 4. ✅ Code Quality Check

```bash
cd frontend

# TypeScript type checking
npm run build          # ✅ Success

# Linting
npm run lint          # Xatolarni tekshiradi

# Formatting
npm run format:check  # Format tekshiradi
npm run format        # Format qiladi
```

---

### 5. 🔵 GitHub'ga Push Qilish

**DIQQAT:** Birinchi security fix'ni bajaring!

```bash
# 1. O'zgarishlarni ko'rish
git status

# 2. Fayllarni staging'ga qo'shish
git add .

# 3. Commit yaratish
git commit -m "feat: improve security and project structure"

# 4. Push qilish
git push origin master
```

**Agar push'da xato bo'lsa:**
```bash
# Avval pull qiling
git pull origin master --rebase

# Keyin push qiling
git push origin master
```

---

## 🔍 Loyiha Statistikasi

### Frontend
- **Sahifalar:** 50+ page
- **Komponentlar:** 107 (40 UI component)
- **API Endpoints:** 23 file
- **Services:** 9
- **Types:** 11
- **Hooks:** 7
- **Estimated LOC:** ~15,000 lines

### Backend
- **Controllers:** ?
- **Models:** Prisma schema bilan
- **Middleware:** Auth, error handling
- **Routes:** RESTful API
- **Tests:** Vitest

---

## 🧪 Test Qilish Rejasi

### Backend Test (port 8000)
```bash
cd backend
npm run dev

# Test endpoints:
curl http://localhost:8000/api
curl http://localhost:8000/api/health
```

### Frontend Test (port 3000)
```bash
cd frontend
npm run dev

# Browser'da test qiling:
# - http://localhost:3000 (landing)
# - http://localhost:3000/login
# - http://localhost:3000/pricing
# - http://localhost:3000/courses
```

### Integration Test
1. Backend ishga tushiring (8000)
2. Frontend ishga tushiring (3000)
3. Login qiling
4. Kurs yarating/ko'ring
5. Video o'ynating
6. Test ishlating

---

## 📱 API Endpoints (Backend)

### Auth
- `POST /api/auth/otp` - OTP so'rash
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Token yangilash
- `GET /api/auth/me` - User ma'lumotlari
- `POST /api/auth/logout` - Logout

### Courses
- `GET /api/courses` - Barcha kurslar
- `GET /api/courses/:id` - Bitta kurs
- `POST /api/courses` - Kurs yaratish (teacher)
- `PUT /api/courses/:id` - Kurs yangilash
- `DELETE /api/courses/:id` - Kurs o'chirish

### Progress
- `GET /api/progress` - Progress olish
- `POST /api/progress` - Progress yangilash

### Payments
- `POST /api/payments/create` - To'lov yaratish
- `GET /api/payments/:id` - To'lov status

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Vercel CLI o'rnatish
npm i -g vercel

# Deploy qilish
cd frontend
vercel

# Environment variables qo'shish:
# NEXT_PUBLIC_API_URL=https://api.darslinker.uz/api
```

### Backend (Server/Railway/Render)
```bash
# Production build
cd backend
npm run build

# Start production
npm start

# Environment variables (production):
# - DATABASE_URL (PostgreSQL)
# - JWT_SECRET
# - AWS_S3_*
# - FRONTEND_URL
```

---

## 📝 Keyingi Qadamlar (Ustuvorlik tartibida)

### Immediate (Bugun)
- [ ] ❗ Security: GitHub token'ni revoke qilish
- [ ] ❗ Git remote'ni tuzatish
- [ ] ✅ Backend'ni ishga tushirish
- [ ] ✅ Frontend'ni test qilish

### Short-term (1-2 kun)
- [ ] Backend database migration
- [ ] Auth flow test qilish
- [ ] Video upload va streaming test
- [ ] Payment integration test

### Mid-term (1 hafta)
- [ ] Bug'larni topish va tuzatish
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Mobile responsiveness

### Long-term (1 oy)
- [ ] Feature enhancements
- [ ] Documentation
- [ ] Testing (unit + integration)
- [ ] Production deployment
- [ ] Monitoring va logging

---

## 🐛 Known Issues

### 1. Security Issue ❗
- Git remote'da token expose bo'lgan
- **Fix:** Yuqorida ko'rsatilgan

### 2. Backend Dependency
- Frontend to'liq backend'ga bog'liq
- Backend ishlamasa, hech narsa ishlamaydi
- **Solution:** Backend'ni ishga tushiring

### 3. Environment Variables
- Frontend: ✅ Fixed (`.env.local` qo'shilgan)
- Backend: ⏳ Setup kerak

### 4. CORS (Potential)
- Browser CORS error berishi mumkin
- **Fix:** Backend'da CORS sozlash:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://darslinker.uz'],
  credentials: true
}));
```

---

## 📚 Resources

### Documentation
- **Frontend README:** `/frontend/README.md`
- **Frontend TRACK:** `/frontend/TRACK.md` (detailed)
- **Backend:** `/backend/README.md` (check)

### Repositories
- Frontend: https://github.com/katovdev/frontend
- Backend: (URL topish kerak)

### Tech Docs
- Next.js: https://nextjs.org/docs
- Prisma: https://prisma.io/docs
- Shadcn/ui: https://ui.shadcn.com

---

## ✅ GitHub Push Imkoniyati

### Hozirgi Holat: ⚠️ CHEKLANGAN

**Sabab:** Git remote URL'da token expose bo'lgan va bu token revoke qilinishi kerak.

**Push qilish mumkin:**
✅ Ha, texnik jihatdan push qilish mumkin
⚠️ Lekin BIRINCHI security fix bajaring!

**Push qilish jarayoni:**
1. Token'ni revoke qiling (yuqorida)
2. Remote'ni tuzatang
3. Changes commit qiling
4. Push qiling

**Xavfsiz usul:**
```bash
# 1. Security fix
git remote remove origin
git remote add origin git@github.com:katovdev/frontend.git

# 2. Commit va push
git add .
git commit -m "docs: add project tracking and analysis"
git push origin master
```

---

## 💡 Tavsiyalar

### Security
1. ✅ `.gitignore` faylda `.env*` borligini tekshiring
2. ❗ GitHub token'larni revoke qiling
3. ✅ SSH key'dan foydalaning (HTTPS o'rniga)
4. ✅ Sensitive data'ni `.env` faylga qo'ying

### Development
1. Backend'ni avval ishga tushiring
2. Database migration'larni bajarish
3. Test account yarating
4. Har bir feature'ni alohida test qiling

### Code Quality
1. ESLint va Prettier ishlatilgan ✅
2. TypeScript strict mode qo'shing
3. Unit testlar yozing (Vitest)
4. Git hooks qo'shing (pre-commit, pre-push)

---

## 🔗 Foydali Linklar

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/api/docs (check)
- Database Studio: `npm run db:studio` (Prisma)

---

**Status:** ✅ Frontend rang sxemasi yangilandi
**Next Step:** Test qilish va deploy
**Priority:** MEDIUM - Local test va optimizatsiya

---

## 🎨 Oxirgi O'zgarishlar (2026-01-27)

### Frontend Color Scheme Update
✅ **Rang sxemasi yangilandi:**
- Primary: **#7ea2d4** (ko'k accent)
- Background (dark): **#232324**
- Foreground (light): **#fbffff**

✅ **O'zgarishlar:**
1. [globals.css](frontend/src/app/globals.css) - Light va dark mode ranglari yangilandi
2. [theme-provider.tsx](frontend/src/components/providers/theme-provider.tsx) - Default theme: dark
3. [.env.example](frontend/.env.example) - Environment config example qo'shildi

✅ **GitHub Push:**
- Repository: https://github.com/katovdev/frontend
- Commit: `d81f344` - "style: update color scheme to dark theme"
- Branch: master
- Status: Pushed ✓

---

*Tayyorlagan: Claude Code*
*Oxirgi yangilanish: 2026-01-27 (21:00)*
