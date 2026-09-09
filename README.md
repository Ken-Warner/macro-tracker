# Macro Tracker

A personal nutrition tracker: meals, ingredients, recipes, pantry import/export, weigh-ins, and optional ingredient-from-image OCR.

This is an npm-workspaces monorepo:

| Package                               | Path                   | Role                                  |
| ------------------------------------- | ---------------------- | ------------------------------------- |
| `@macro-tracker/macro-tracker-shared` | `macro-tracker-shared` | Shared TypeScript types and contracts |
| `macro-tracker-api`                   | `macro-tracker-api`    | Express API and static SPA host       |
| `macro-tracker-client`                | `macro-tracker-client` | React (Vite) SPA                      |

The client production build is written to `macro-tracker-api/dist/public/` and served by the API.

## Prerequisites

- Node.js and npm
- Docker and Docker Compose (for the API + Postgres stack)

## Setup

1. Clone the repo and install workspace dependencies from the root:

   ```bash
   npm install
   ```

2. Create a `.env` file in the **repo root**. Docker Compose loads this file automatically and passes values into the `api` and `db` services. The file is gitignored. See [Environment variables](#environment-variables) for every key and an example file.

3. Build shared contracts (required before the API or client can run):

   ```bash
   npm run build:shared
   ```

The API does **not** load `.env` on its own. If you run the API on the host (`npm run dev` / `npm start` in `macro-tracker-api`) instead of in Docker, export the same variables in your shell (or otherwise inject them into the process). Vite **does** load `.env` files from `macro-tracker-client/`.

## Running the app

### Docker (API + database)

Build the SPA **before** the API image so `macro-tracker-api/dist/public/` is copied into the container. The API Dockerfile does not build the client.

```bash
npm run build:client
npm run docker:build:up
```

Then open [http://localhost:80](http://localhost:80). Compose always publishes **host** port 80 to the container `PORT`.

Useful variants:

- `npm run docker:build` — rebuild images only
- `npm run docker:up` — start existing images (no rebuild)

Postgres data is stored in `./data`. The `db` image initializes the schema from `db/macro_tracker_db_schema.sql` on first start of an empty volume.

`compose.production.yaml` overlays the same services for a reverse-proxy deploy (external `nginxproxymanager_default` network, pre-built `kenw1991/macro-tracker-api:latest` and `kenw1991/macro-tracker-db:latest` images). It still expects the root `.env` values used by `compose.yaml`.

### Local client (Vite) against a running API

With the API available at `http://localhost:80` (typically via Docker):

```bash
npm run build:shared
npm run dev --workspace=macro-tracker-client
```

Then open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to `API_PROXY_TARGET` (default `http://localhost:80`).

### Local API (without Docker)

You need a reachable Postgres instance (`DB_HOST` / `DB_PORT` / credentials). Compose does not publish 5432 to the host, so a Compose `db` is only reachable from other Compose services unless you add a port mapping.

```bash
npm run build:shared
npm run build --workspace=macro-tracker-api
npm run start --workspace=macro-tracker-api
```

For TypeScript reload during development, use `npm run dev --workspace=macro-tracker-api` (`nodemon` + `ts-node`) with the same environment variables set.

## Environment variables

Ingredient-from-image OCR and Amazon SES (password-recovery email) are **off** unless their flags are the string `true`. Any other value (including unset) leaves them disabled.

### Shared (repo-root `.env`, used by Compose for API and Postgres)

These live in the root `.env`. Compose interpolates them into both the `api` and `db` services.

| Variable      | Purpose                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| `DB_USER`     | Postgres username. Passed to the API pool and to `POSTGRES_USER` on the `db` service.     |
| `DB_PASSWORD` | Postgres password. Passed to the API pool and to `POSTGRES_PASSWORD` on the `db` service. |
| `DB_DATABASE` | Database name. Passed to the API pool and to `POSTGRES_DB` on the `db` service.           |

`macro-tracker-shared` does not read any environment variables.

### Server (`macro-tracker-api`)

Set these in the root `.env` for Docker, or in the API process environment for a host run. Docker Compose forwards each of them into the `api` container (except `PORT`, which is also used in the host port mapping).

| Variable                 | Purpose                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                   | Port the API listens on (default `80`). Compose maps host `80` to this container port.                                                                                               |
| `DB_HOST`                | Postgres hostname. Use `db` (the Compose service name) in Docker. Defaults to `127.0.0.1` if unset.                                                                                  |
| `DB_PORT`                | Postgres port (default `5432`).                                                                                                                                                      |
| `DB_USER`                | See [Shared](#shared-repo-root-env-used-by-compose-for-api-and-postgres). Default `postgres`.                                                                                        |
| `DB_PASSWORD`            | See [Shared](#shared-repo-root-env-used-by-compose-for-api-and-postgres). Default `test123`.                                                                                         |
| `DB_DATABASE`            | See [Shared](#shared-repo-root-env-used-by-compose-for-api-and-postgres). Default `postgres`.                                                                                        |
| `SESSION_SECRET`         | Secret for signing session cookies. Falls back to a hardcoded default if unset; set a long random value.                                                                             |
| `SESSION_COOKIE_SECURE`  | Session cookie `secure` flag. `true` / `false` force the value. If unset, cookies are secure only when `NODE_ENV` is `PROD`.                                                         |
| `NODE_ENV`               | `PROD` uses JSON logs (no `pino-pretty`) and defaults secure cookies on. `TEST` logs password-recovery email to the console instead of sending it. Any other value uses pretty logs. |
| `INGREDIENT_OCR_ENABLED` | OCR **runtime** flag. Must be the string `true` to allow `POST /api/ingredients/fromImage`; otherwise the endpoint returns 403.                                                      |
| `AWS_SES_ENABLED`        | Amazon SES **runtime** flag for the password-recovery workflow. Must be the string `true` to enable SES. Any other value (including unset) leaves it disabled.                       |
| `AWS_ACCESS_KEY_ID`      | IAM access key for Amazon SES. Required when sending password-recovery email through SES.                                                                                            |
| `AWS_SECRET_ACCESS_KEY`  | IAM secret key for Amazon SES. Required when sending password-recovery email through SES.                                                                                            |
| `AWS_REGION`             | AWS region for the SES client (for example `us-east-1`). Required when sending password-recovery email through SES.                                                                  |
| `FROM_EMAIL_ADDRESS`     | Verified SES sender address used as the From field for password-recovery email. Required when sending through SES.                                                                   |

**OCR on the API — local:** set `INGREDIENT_OCR_ENABLED=true` in the environment used by `npm run dev` / `npm start` in `macro-tracker-api`. Unset or any other value disables the endpoint (403).

**OCR on the API — production / Docker:** set `INGREDIENT_OCR_ENABLED=true` in the host `.env` next to Compose (or export it) before `docker compose up`. `compose.yaml` passes it into the `api` service (Compose default `false` if omitted). Recreate or restart the API container after changing it. No image rebuild is required for this flag.

**SES on the API — local:** set `AWS_SES_ENABLED=true` plus `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `FROM_EMAIL_ADDRESS` in the environment used by `npm run dev` / `npm start` in `macro-tracker-api`. Unset or any other value for the flag leaves SES disabled.

**SES on the API — production / Docker:** set `AWS_SES_ENABLED=true`, the three AWS credentials, and `FROM_EMAIL_ADDRESS` in the host `.env` next to Compose (or export them) before `docker compose up`. `compose.yaml` passes them into the `api` service (Compose default `false` for the flag if omitted). Recreate or restart the API container after changing them. No image rebuild is required.

### Client (`macro-tracker-client`)

Vite loads env files from `macro-tracker-client/` (for example `.env` or `.env.local`). `VITE_*` values are inlined at **dev / build** time. `API_PROXY_TARGET` is read only by `vite.config.ts` (dev proxy); it is not baked into the SPA.

| Variable                      | Purpose                                                                                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_INGREDIENT_OCR_ENABLED` | OCR **UI** flag. Must be the string `true` for the Get From Image button to be included. Any other value (including unset) omits the button from the bundle. Changing it requires restarting Vite or rebuilding the client. |
| `API_PROXY_TARGET`            | Dev-server proxy target for `/api` (default `http://localhost:80`). Used only by `npm run dev` in the client.                                                                                                               |

**OCR on the client — local:** set `VITE_INGREDIENT_OCR_ENABLED=true` when starting Vite (`npm run dev` in `macro-tracker-client`) so the Get From Image button is included. Restart Vite after changing it.

**OCR on the client — production / Docker:** set `VITE_INGREDIENT_OCR_ENABLED=true` **before** `npm run build:client`, then rebuild the image (`docker compose build` / `npm run docker:build`). The SPA is baked at that Vite build; changing Compose `environment:` alone will not add or remove the button. To disable the UI in a deployed image, rebuild the client without the Vite flag (or with it not `true`) and redeploy.

### Example root `.env`

```
PORT=80
SESSION_SECRET=change-me-to-a-long-random-string
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=test123
DB_DATABASE=postgres
NODE_ENV=TEST
SESSION_COOKIE_SECURE=false
INGREDIENT_OCR_ENABLED=false
AWS_SES_ENABLED=false
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
FROM_EMAIL_ADDRESS=
```

For local Vite, a `macro-tracker-client/.env` can look like:

```
VITE_INGREDIENT_OCR_ENABLED=true
API_PROXY_TARGET=http://localhost:80
```

## Scripts

### Root `package.json`

| Script            | What it does                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `build:all`       | Runs `build` in every workspace (`shared`, then `client`, then `api`).                                                           |
| `build:shared`    | Compiles `macro-tracker-shared` to `macro-tracker-shared/dist`. Run this before the API or client.                               |
| `build:client`    | Typechecks and Vite-builds the SPA into `macro-tracker-api/dist/public/`. Required before a Docker API image if you want the UI. |
| `build:api`       | Compiles the API TypeScript to `macro-tracker-api/dist`.                                                                         |
| `docker:up`       | `docker compose up -d` — start the API and Postgres in the background.                                                           |
| `docker:build`    | `docker compose build` — rebuild images without starting them.                                                                   |
| `docker:build:up` | `docker compose up --build -d` — rebuild and start in the background.                                                            |

### `macro-tracker-shared`

| Script  | What it does                                     |
| ------- | ------------------------------------------------ |
| `build` | `tsc` — emit shared contracts to `dist/`.        |
| `test`  | Placeholder; exits with an error (no tests yet). |

### `macro-tracker-client`

| Script    | What it does                                                               |
| --------- | -------------------------------------------------------------------------- |
| `dev`     | Vite dev server (port 5173) with `/api` proxied to the API.                |
| `build`   | `tsc -b && vite build` — production SPA into the API `dist/public` folder. |
| `lint`    | ESLint over the client.                                                    |
| `preview` | Serve the last production Vite build locally.                              |

### `macro-tracker-api`

| Script           | What it does                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `dev`            | `nodemon` + `ts-node` on `src/server.ts` for local API development.                         |
| `build`          | `tsc` — compile to `dist/`.                                                                 |
| `start`          | `node dist/server.js` — run the compiled API (used by the Docker image).                    |
| `watch`          | `tsc -w` — recompile on change without running the server.                                  |
| `test`           | Node test runner on `src/Utilities/nutritionLabelMatch.test.ts`.                            |
| `convert-pantry` | One-off `ts-node` script that converts `scripts/masterMealSheet.csv` into pantry seed data. |

From the repo root, workspace scripts can be run with `npm run <script> --workspace=<package-name>`.

## Todos

- Logout button takes 2 clicks for some reason.
- Password logged in creation request in production, needs to be omitted.
- Clean up password recovery workflow.
- **Add weigh-ins to backup before release**
- Some meal deletions don't delete from the UI but are deleted on the backend.
  - I might just need to do a meal history rework.
  - It is possible to delete all items from the meal history for a day and then when it reselects the meals
    for that day it will reselect all the recurring ones again and maintain your macros and so you can continually
    delete until your macros are negative. (This may be fixed with the recurring bug fix though).
- Meals can be created for tomorrow that don't show up but prevent daily macros from loading.
- Update scrollbar on long dialog windows
- Meal history search
  - Should this just search what is currently loaded? or open up a dialog with results that match from entire history?
- In pantry mode for a new meal it should show the current calculated macros for what you have selected.

## Completed Items

**Is a Database Update Required:** `NO`

- Return focus to text fields after ingredient clicked. (check other similar form elements for the same UX)
- Clicking an ingredient in the recipe tab should clear the search box there too.
- Check ingredients dialog: delete button should be red.
  - Maybe check other modal windows as well.

### Released 2026-09-05

- Phase 4 of password recovery
  - `simpleEmail.ts` finished up
  - New feature flag `AWS_SES_ENABLED` added to application to control email sending.

- Phase 3 of password recovery
  - New password API
  - Client side API and logic to update password and move to login form
  - Validated new schema

- Phase 2 of password recovery
  - Token verification API (checks token from email, if correct, creates verification UUID in DB and sends to client with 200)
  - Token verification form and new password input form in `PasswordRecoveryForm.tsx`
  - Updates to `api.ts` for client calls.

- Phase 1 of password recovery
  - Token creation API
  - Token storage in table with expiry time
  - Password recovery form on login page
  - Simple email sender stub

### Released 2026-08-29

- Added file upload to the client and API for ingredients. Laid groundwork for OCR tool.
- Fixed a linting error within the CreateIngredientDialog.
- Implement Ingregdient OCR
- Added OCR tool feature flag

### Released 2026-08-28

- Ingredients/Recipes export import so I can reseed my account between releases while I'm the only user.
- Remove `allowJS` option on `macro-tracker-api/tsconfig.json` once fully converted.
- Solution recipes
- For times on the meal dialog
  - Default minutes to 00
  - Remove seconds
  - Remove seconds from time display on accordian items
- Seems to be a bug with recurring meals. When one meal was set to recur, the next day, all meals were there for the next day.
- Macros on meal history popup are too wide
- When adding multiple meal items, values persist in the form from previous entries.
- The home page needs to be reworked.
  - Update header/footer
  - Remove Userinfo block and change to something more minimal
- When pressing an ingredient or recipe during meal creation, clear the search box.
- When copying a meal, set it's date to today by default.
- Resort meal list every time a meal is added.
- Add the recipe's description to the recipe dialog.
- Updated expand and collapse buttons and logic.
- Added sentinel/observer logic to the macro history to allow for infinite scrolling.
