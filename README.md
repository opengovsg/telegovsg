# Telegov

A template to build Telegram bots for Singapore Government public officers

## Getting Started

### Prerequisites

- A GitHub account
- A computer with NodeJS and tools for web development
- Some familiarity with JavaScript or TypeScript

### Register an sgID client

1. Sign into the [sgID Developer Portal](https://developer.id.gov.sg/dashboard/).

- If this is your first time doing so, set your email to your gov.sg email address
  in your [profile page](https://developer.id.gov.sg/profile).

2. Create a new sgID client, with `NAME` and `PUBLIC OFFICER DETAILS` included in the scope.  
   Store the secrets in a safe location.
3. Add `http://localhost:3000/auth/sgid/callback` to the list of Redirect URLs.

### Create a Telegram bot

1. Create a new bot with [BotFather](https://t.me/botfather).
2. Store the bot's security token in a safe location.

### Create a Neon database

1. Create a database with [Neon](https://console.neon.tech/app/projects).
2. Store the database's connection url in a safe location.

### Migrations

```bash
npm run migrations
```

### Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopengovsg%2Ftelegovsg%2Ftree%2Fmain&env=SGID_CLIENT_ID,SGID_CLIENT_SECRET,SGID_PRIVATE_KEY,BOT_TOKEN,DATABASE_URL)

1. Click the button above to clone and deploy this project.
2. Enter the sgID secrets and Telegram bot token obtained from the previous two sections.
3. Visit the [sgID Developer Portal](https://developer.id.gov.sg/dashboard) and add a Redirect URL bearing
   your deployed application's domain name.  
   It should be in the following format: `https://<project_name>-git-main-<your_github_handle>.vercel.app/auth/sgid/callback`

## Setting up local development environment

Once you have created your new Telegov project from this template, follow these instructions
to prepare a development environment on your computer.

### Clone your git repository

```bash
$ git clone git@github.com:<your github repository>
$ cd <local dir that git cloned your repository to>
```

### Create env file

1. Copy .env.example to .env

```bash
$ cp .env.example .env
```

2. Set up an [ngrok tunnel](#set-up-an-ngrok-tunnel) for your local machine,
   setting `BOT_DOMAIN` in your .env file as you do so
3. Populate the rest of the .env file per [Environment variables](#environment-variables)

#### Environment variables

The server needs a few environment variables to be set for it to function. They are:

| Name                 | What It Is                                                  | Example                                                            |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `SGID_CLIENT_ID`     | The client ID given during client registration              | `TELEGOVSG-780ba228`                                               |
| `SGID_CLIENT_SECRET` | The client secret given during client registration          | `asdfn_v1_6DBRljleevjsd9DHPThsKDVDSenssCwW9zfA8W2ddf/T`            |
| `SGID_PRIVATE_KEY`   | The client private key given during client registration     | `-----BEGIN PRIVATE KEY-----...`                                   |
| `BOT_TOKEN`          | The secret token to identify your bot to Telegram           | `192830192:DSNVIELKSDFLKJSDF-3cslq`                                |
| `BOT_DOMAIN`         | The domain Telegram uses to send messages to your bot(\*)   | `https://........ngrok-free.app`                                   |
| `DATABASE_URL`       | The connection string uses to connect to your neon database | `postgresql://<user>:<password>@<host>/<database>?sslmode=require` |
| `POSTGRES_URL`       | An alias for `DATABASE_URL`                                 | `postgresql://<user>:<password>@<host>/<database>?sslmode=require` |

(\*): If not given, Telegov uses the `VERCEL_BRANCH_URL` environment variable instead. In your local environment, you can use ngrok.

### Set up an ngrok tunnel

1. Install ngrok
2. Go to [ngrok dashboard](https://dashboard.ngrok.com/cloud-edge/domains) and create a new permanent domain
3. Copy the domain and paste it in the .env file as `BOT_DOMAIN`
4. Run ngrok with the following command whenever you're doing local testing

```bash
$ ngrok http <YOUR_DOMAIN> 3000
```

### Run Telegov on your computer

1. Install dependencies for Telegov

```bash
$ npm ci
```

2. Start Telegov

```bash
$ npm run start:debug
```

### Lint

1. (Recommended) Install extensions [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
1. Otherwise, manually run

```bash
$ npm run lint
```
