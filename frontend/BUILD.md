# Coding Kitty — mobile app build

## Before you build

1. **Deploy the Go backend** somewhere reachable from phones (Railway, Render, Fly.io, etc.).
2. **Set production env vars** in EAS (see below). Do not use `localhost` for `EXPO_PUBLIC_API_URL`.
3. **Log in to Expo**: `npx eas login`
4. **Verify project**: from `frontend/`, run `npx expo-doctor`

## EAS environment variables

Cloud builds do not use your local `.env`. Set these on Expo:

```bash
cd frontend

npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co"
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_ANON_KEY"
npx eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://YOUR_DEPLOYED_API"
```

Optional (only if not routing AI through the backend):

```bash
npx eas secret:create --scope project --name EXPO_PUBLIC_GUIDE_GROQ_API_KEY --value "YOUR_KEY"
npx eas secret:create --scope project --name EXPO_PUBLIC_GROQ_API_KEY --value "YOUR_KEY"
```

List secrets: `npx eas secret:list`

## Build commands

Install EAS CLI once (optional): `npm install -g eas-cli`

### Preview APK (Android, easiest to install on a phone)

```bash
cd frontend
npx eas build --platform android --profile preview
```

### Production (store-ready)

```bash
# Android (AAB for Play Store)
npx eas build --platform android --profile production

# iOS (requires Apple Developer account)
npx eas build --platform ios --profile production
```

### Development client (with dev tools)

```bash
npx eas build --platform android --profile development
```

## Profiles

| Profile       | Use case                          |
|---------------|-----------------------------------|
| `preview`     | Internal testing, APK, HTTP API ok |
| `production`  | Store release, HTTPS API only      |
| `development` | Dev client with expo-dev-client    |

## After the build

- Download the build from the link EAS prints, or from [expo.dev](https://expo.dev).
- For Android preview APK: install directly on device (enable “Install unknown apps” if needed).
- For iOS preview: register device UDIDs or use TestFlight via `production` + `eas submit`.

## Backend checklist

Ensure the deployed backend has:

- `GROQ_API_KEY`, `GUIDE_GROQ_API_KEY`, `CAT_API_KEY`
- `CORS_ORIGINS=*` or your app origin
- `DATABASE_URL` if using Supabase Postgres for care data

## Troubleshooting

- **App can't reach API**: `EXPO_PUBLIC_API_URL` must be HTTPS in production builds.
- **Supabase auth fails**: confirm URL and anon key match your Supabase project.
- **Build fails on icons**: ensure `frontend/assets/icon.png` and android adaptive icons exist.
