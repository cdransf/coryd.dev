# coryd.dev

[![Netlify Status](https://api.netlify.com/api/v1/badges/f383dd0a-5c76-4c57-b910-20041af738c8/deploy-status)](https://app.netlify.com/sites/coryd/deploys)

Hi! I'm Cory. 👋🏻

This is the code for my personal website and portfolio. Built using [11ty](https://11ty.dev) and [other tools](https://coryd.dev/colophon).

- [Follow me on Mastodon](https://follow.coryd.dev/@cory)
- [Buy me a coffee](https://buymeacoffee.com/cory)
- [What I'm listening to](https://coryd.dev/music)
- [What I'm watching](https://coryd.dev/watching)
- [What I'm reading](https://coryd.dev/books)
- [What I'm doing now](https://coryd.dev/now)

---

## Local dev setup

1. `npm install`
2. `npm install netlify-cli -g`

## Local dev workflow

1. `npm start`
2. Open `http://localhost:8080`

## Commands

`npm run start`: starts 11ty.
`npm run "start:quick"`: starts 11ty a bit quicker (provided it's already been built).
`npm run build`: builds static site output.
`npm run debug`: runs 11ty with additional debug output.
`npm run update:deps`: checks for dependency updates and updates 11ty.
`npm run clean`: removes the build output folder to allow for a clean build.
`netlify dev`: local development with Netlify functions.

## Required environment variables

```plaintext
ACCOUNT_ID_PLEX
API_KEY_PLAUSIBLE
SUPABASE_URL
SUPABASE_KEY
DIRECTUS_URL
DIRECTUS_TOKEN
ARTIST_IMPORT_TOKEN
ARTIST_FLOW_ID
ALBUM_FLOW_ID
MASTODON_ACCESS_TOKEN
FORWARDEMAIL_API_KEY
DEPLOY_HOOK
```
