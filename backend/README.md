# Bridge Note API

خادم Person 2. الطلبات لا تُحفظ: لا قاعدة بيانات، ولا كتابة لنص المستخدم على القرص. السجل يكتب المسار ورمز الحالة والزمن فقط.

## التشغيل المحلي

من مجلد `backend`:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

الصحة: `GET http://127.0.0.1:8000/health`

ضع `GEMINI_API_KEY` في `.env` فقط. لا ترفع هذا الملف.

## المسارات

`Content-Type: application/json`

- `POST /api/check-risk`
- `POST /api/generate-drafts`
- `POST /api/faithfulness`

مهلة النموذج 10 ثوانٍ. الواجهة يفضّل أن تنتظر حوالي 15 ثانية.

## النشر

الخدمة تُبنى من مجلد `backend` على Render.

- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- المتغيرات: `GEMINI_API_KEY` في بيئة الاستضافة، و`GEMINI_MODEL=gemini-flash-lite-latest`، و`CORS_ORIGINS=http://localhost:3000`

أضف أصل واجهة Person 1 إلى `CORS_ORIGINS` عندما يعطيك الرابط، مفصولاً بفاصلة. المفتاح لا يوضع في المستودع.

رابط القاعدة يُكتب هنا بعد أن تصبح الخدمة عامة.

## الاختبارات

من مجلد `backend`:

```powershell
pytest
```
