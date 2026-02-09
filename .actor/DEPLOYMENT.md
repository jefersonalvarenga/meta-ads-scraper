# Deployment Guide

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Apify token to `.env`

4. Run locally:
```bash
npm run dev
```

## Deploy to Apify

### Option 1: Using Apify CLI

1. Install Apify CLI:
```bash
npm install -g apify-cli
```

2. Login to Apify:
```bash
apify login
```

3. Push to Apify:
```bash
apify push
```

### Option 2: Using Git Integration

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. In Apify Console:
   - Go to Actors > Create new
   - Select "Import from GitHub"
   - Connect your repository
   - Select the repository and branch
   - Click "Create"

### Option 3: Manual Upload

1. Create a zip file of your project (excluding node_modules and apify_storage)
2. Go to Apify Console
3. Create a new Actor
4. Upload the zip file
5. Build and run

## Testing

Test the actor with the provided INPUT.json:

```bash
apify run --input-file .actor/INPUT.json
```

## Environment Variables

Make sure to set these in Apify Console under Settings > Environment Variables:

- `APIFY_TOKEN`: Your Apify API token (if needed for sub-tasks)

## Proxy Configuration

The actor is configured to use Apify Residential proxies by default. You can change this in the input configuration.

## Notes

- Facebook pages may require login for some features
- The actor extracts publicly available information
- Using residential proxies is highly recommended to avoid rate limiting
- Some fields may be null if the information is not available on the page
