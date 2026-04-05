<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1MQFImNGZ-mQmEI0OQn5G9T1XVbU6uSgr

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production Routing (No 404 on Refresh)

This app uses `BrowserRouter` with clean URLs (`/about-us`, `/blog`, etc.).
For production behind Nginx, you must enable SPA fallback on the active HTTPS server block so refresh works on any page.

Use the sample config at:

`deploy/nginx/spa.conf`

Critical rule (inside the live `server {}` block that serves your domain, usually `listen 443`):

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Without that rule, direct access or refresh on nested routes will return `404 Not Found`.
