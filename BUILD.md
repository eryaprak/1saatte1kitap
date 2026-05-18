# iOS production build — 1 Saatte 1 Kitap

```bash
cd ~/Projects/1saatte1kitap
~/Projects/abby/scripts/app_store_preflight.sh && eas build --platform ios --profile production
```

Checklist: `~/Projects/abby/docs/APP_STORE_PREFLIGHT_CHECKLIST.md` — **book** type.

**Before build:** ensure `https://voxduru.com/privacy/1saatte1kitap` returns 200 (preflight fails on 404). Target build **8** (icon).
