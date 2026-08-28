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
