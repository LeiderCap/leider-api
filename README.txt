Deploy notes:
1. Create a GitHub repo named leider-api.
2. Upload all files from this folder.
3. In DigitalOcean App Platform:
   - Build command: pip install -r requirements.txt
   - Run command: uvicorn main:app --host 0.0.0.0 --port 8080
   - Env var: DATABASE_URL=<your DigitalOcean Postgres connection string>
4. Test:
   - GET /health
   - POST /companies with ticker JSON
   - POST /score/AMCX
