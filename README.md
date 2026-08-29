## Ingredient OCR

Ingredient-from-image OCR is **off** unless a flag is the string `true`. Any other value (including unset) leaves it disabled.

There are two flags:

- `INGREDIENT_OCR_ENABLED` — API, read at **runtime**. When it is not `true`, `POST /api/ingredients/fromImage` returns 403.
- `VITE_INGREDIENT_OCR_ENABLED` — client, inlined at **Vite build / dev**. When it is not `true`, the Get From Image button is omitted from the bundle. Changing this flag requires restarting Vite or rebuilding the client.

### Local

**API:** set `INGREDIENT_OCR_ENABLED=true` in the environment used by `npm run dev` / `npm start` in `macro-tracker-api`. Unset or any other value disables the endpoint (403).

**Client:** set `VITE_INGREDIENT_OCR_ENABLED=true` when starting Vite (`npm run dev` in `macro-tracker-client`) so the Get From Image button is included. Restart Vite after changing it. Unset or any other value omits the button from the bundle.

### Production / Docker

**API:** set `INGREDIENT_OCR_ENABLED=true` in the host `.env` next to Compose (or export it) before `docker compose up`. `compose.yaml` passes it into the `api` service; omit it or set `false` to keep OCR off. Recreate or restart the API container after changing it. No image rebuild is required for the API flag.

**Client:** set `VITE_INGREDIENT_OCR_ENABLED=true` **before** `npm run build:client`, then rebuild the image (`docker compose build` / `npm run docker:build`). The SPA is baked at that Vite build; changing Compose `environment:` alone will not add or remove the button. To disable the UI in a deployed image, rebuild the client without the Vite flag (or with it not `true`) and redeploy.

## Todos

- Logout button takes 2 clicks for some reason.
- Implement Ingregdient OCR
- Password recovery workflow
- Some meal deletions don't delete from the UI but are deleted on the backend.
  - I might just need to do a meal history rework.
  - It is possible to delete all items from the meal history for a day and then when it reselects the meals
    for that day it will reselect all the recurring ones again and maintain your macros and so you can continually
    delete until your macros are negative. (This may be fixed with the recurring bug fix though).
- Meals can be created for tomorrow that don't show up but prevent daily macros from loading.
- Update scrollbar on long dialog windows
- Meal history search
  - Should this just search what is currently loaded? or open up a dialog with results that match from entire history?

## Completed Items

**Is a Database Update Required:** `NO`

- Added file upload to the client and API for ingredients. Laid groundwork for OCR tool.
- Fixed a linting error within the CreateIngredientDialog.

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
