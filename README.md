# Node.js Request Logger

A zero-dependency Node.js HTTP server that logs incoming requests (method, URL, request body) to the terminal and responds with JSON.

## Requirements

Node.js 18 or newer.

## Run

```bash
npm start
```

By default the server listens on port `3000`. Use the `PORT` environment variable to override it.

## Test (PowerShell)

```powershell
Invoke-RestMethod -Uri http://localhost:3000/webhook -Method Post -ContentType 'application/json' -Body '{"name":"John","message":"Hello"}'
```

## Test (curl)

```bash
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{"name":"John","message":"Hello"}'
```

The server accepts any route and HTTP method. For `application/json`, it parses and logs the JSON object. Other content types are logged as text.

**Security note:** Requests may contain personal data or credentials. Don't publicly deploy this debugging logger without appropriate access controls, and never log sensitive request bodies in production.
