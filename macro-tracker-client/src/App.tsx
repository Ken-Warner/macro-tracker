import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  MacroData,
  WeighInData,
  type GetMealHistoryResponse,
} from "@macro-tracker/macro-tracker-shared";
import Container from "./components/Container";
import ContainerItem from "./components/ContainerItem";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Login from "./components/Login";
import Loader from "./components/Loader";
import ToastMessage, { type Toast } from "./components/reusables/ToastMessage";
import MealDay from "./components/MealDay";
import DailyMacros from "./components/DailyMacros";
import WeighInForm from "./components/WeighInForm";
const WeightHistoryChart = lazy(
  () => import("./components/WeightHistoryChart"),
);
import Pantry from "./components/Pantry";
import Recipes from "./components/Recipes";
import Settings from "./components/Settings";
import CreateMealDialog from "./components/dialogs/CreateMealDialog";
import { EMPTY_MEAL, type Meal } from "./types/meal";
import { useUser } from "./context/useUser";

import {
  getMostRecentWeighIn,
  getMealHistoryFromRange,
  getTodaysMacros,
  hasMealHistoryBefore,
} from "./utilities/api";

const HISTORY_PAGE_DAYS = 10;

function getLocalTodayDate(): Date {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
}

function addCalendarDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
  );
}

function mergeMealHistory(
  current: GetMealHistoryResponse,
  incoming: GetMealHistoryResponse,
): GetMealHistoryResponse {
  const existingDates = new Set(current.map((day) => day.mealsDate));
  const newDays = incoming.filter((day) => !existingDates.has(day.mealsDate));
  return [...current, ...newDays].sort((a, b) =>
    (a.mealsDate ?? "") > (b.mealsDate ?? "") ? -1 : 1,
  );
}

const navItems = {
  MACROS: "Macros",
  PANTRY: "Pantry",
  RECIPES: "Recipes",
  METRICS: "Metrics",
  SETTINGS: "Settings",
  SUPPORT: "Support",
} as const;

const containerClassByNav: Record<string, string> = {
  [navItems.MACROS]: "container--macros",
  [navItems.METRICS]: "container--metrics",
  [navItems.PANTRY]: "container--form",
  [navItems.RECIPES]: "container--form",
  [navItems.SETTINGS]: "container--form",
  [navItems.SUPPORT]: "container--form",
};

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

export default function App() {
  const { user, isLoggedIn } = useUser();

  const [selectedNavItem, setSelectedNavItem] = useState<string>(
    navItems.MACROS,
  );
  const [isAllExpanded, setIsAllExpanded] = useState({
    version: 0,
    expanded: false,
  });

  const [meals, setMeals] = useState<GetMealHistoryResponse>([]);
  const [oldestLoadedDate, setOldestLoadedDate] = useState<Date | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const oldestLoadedDateRef = useRef<Date | null>(null);
  const isLoadingMoreRef = useRef(false);
  const hasMoreHistoryRef = useRef(true);
  const [recentWeighInData, setRecentWeighInData] =
    useState<WeighInData | null>(null);
  const [todaysMacros, setTodaysMacros] = useState(() => new MacroData());

  const [createMealDialogOpen, setCreateMealDialogOpen] = useState(false);
  const [mealToCopy, setMealToCopy] = useState<Meal>(EMPTY_MEAL);

  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;
  const [weighInChartRefreshKey, setWeighInChartRefreshKey] = useState(0);

  async function getRecentWeighInData(): Promise<WeighInData | null> {
    const recentWeighInResult = await getMostRecentWeighIn();
    return recentWeighInResult.ok ? recentWeighInResult.body : null;
  }

  async function refreshRecentWeighInData() {
    try {
      const data = await getRecentWeighInData();
      if (data !== null) {
        setRecentWeighInData(data);
      }
    } catch {
      setToast({ type: "error", message: "Unable to get weigh in data" });
    }
  }

  useEffect(() => {
    if (!user) return;

    async function fetchRecentWeighIn() {
      try {
        const data = await getRecentWeighInData();
        if (data !== null) {
          setRecentWeighInData(data);
        }
      } catch {
        setToast({ type: "error", message: "Unable to get weigh in data" });
      }
    }

    async function fetchMealHistory() {
      const todayDate = getLocalTodayDate();
      const tenDaysAgo = addCalendarDays(todayDate, -HISTORY_PAGE_DAYS);

      setMeals([]);
      setOldestLoadedDate(null);
      oldestLoadedDateRef.current = null;
      setHasMoreHistory(true);
      hasMoreHistoryRef.current = true;

      try {
        const mealHistoryResult = await getMealHistoryFromRange(
          tenDaysAgo,
          todayDate,
        );
        if (mealHistoryResult.ok) {
          setMeals(mealHistoryResult.body);
          oldestLoadedDateRef.current = tenDaysAgo;
          setOldestLoadedDate(tenDaysAgo);

          if (mealHistoryResult.body.length === 0) {
            const existsResult = await hasMealHistoryBefore(tenDaysAgo);
            if (!existsResult.ok || !existsResult.body.hasMore) {
              hasMoreHistoryRef.current = false;
              setHasMoreHistory(false);
            }
          }
        } else {
          hasMoreHistoryRef.current = false;
          setHasMoreHistory(false);
          setToast({
            type: "error",
            message: "Unable to get meal history",
          });
        }
      } catch {
        hasMoreHistoryRef.current = false;
        setHasMoreHistory(false);
        setToast({
          type: "error",
          message: "Unable to get meal history",
        });
      }

      try {
        setTodaysMacros(await getTodaysMacros(todayDate));
      } catch {
        setToast({
          type: "error",
          message: "Unable to get current macro totals",
        });
      }
    }

    void fetchRecentWeighIn();
    void fetchMealHistory();
  }, [user]);

  const loadMoreHistory = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreHistoryRef.current) return;
    const oldest = oldestLoadedDateRef.current;
    if (!oldest) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    const toDate = addCalendarDays(oldest, -1);
    const fromDate = addCalendarDays(oldest, -HISTORY_PAGE_DAYS);

    try {
      const mealHistoryResult = await getMealHistoryFromRange(fromDate, toDate);
      if (!mealHistoryResult.ok) {
        hasMoreHistoryRef.current = false;
        setHasMoreHistory(false);
        setToast({
          type: "error",
          message: "Unable to get meal history",
        });
        return;
      }

      setMeals((current) => mergeMealHistory(current, mealHistoryResult.body));
      oldestLoadedDateRef.current = fromDate;
      setOldestLoadedDate(fromDate);

      if (mealHistoryResult.body.length === 0) {
        const existsResult = await hasMealHistoryBefore(fromDate);
        if (!existsResult.ok || !existsResult.body.hasMore) {
          hasMoreHistoryRef.current = false;
          setHasMoreHistory(false);
        }
      }
    } catch {
      hasMoreHistoryRef.current = false;
      setHasMoreHistory(false);
      setToast({
        type: "error",
        message: "Unable to get meal history",
      });
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!hasMoreHistory || isLoadingMore || oldestLoadedDate === null) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreHistory();
        }
      },
      { root: null, rootMargin: "80px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasMoreHistory,
    isLoadingMore,
    oldestLoadedDate,
    meals.length,
    loadMoreHistory,
    selectedNavItem,
  ]);

  function handleAddNewMeal(newMeal: Meal) {
    setMeals((currentMeals) => {
      return currentMeals.some((meal) => meal.mealsDate === newMeal.date)
        ? currentMeals.map((mealDay) =>
            mealDay.mealsDate !== newMeal.date
              ? {
                  mealsDate: mealDay.mealsDate,
                  meals: [...mealDay.meals],
                }
              : {
                  mealsDate: mealDay.mealsDate,
                  meals: [...mealDay.meals, newMeal].sort((a, b) =>
                    (a.time ?? "") < (b.time ?? "") ? -1 : 1,
                  ),
                },
          )
        : [...currentMeals, { mealsDate: newMeal.date, meals: [newMeal] }].sort(
            (a, b) => ((a.mealsDate ?? "") > (b.mealsDate ?? "") ? -1 : 1),
          );
    });

    if (newMeal.date === todaysMacros.date) {
      setTodaysMacros((macros) => {
        return new MacroData(
          macros.date,
          macros.calories + newMeal.calories,
          macros.protein + newMeal.protein,
          macros.carbohydrates + newMeal.carbohydrates,
          macros.fats + newMeal.fats,
        );
      });
    }
  }

  function handleClickCopyMeal(meal: Meal) {
    setMealToCopy(meal);
    setCreateMealDialogOpen(true);
  }

  function handleDeleteMeal(mealToDelete: Meal) {
    setMeals((currentMeals) => {
      return currentMeals
        .map((mealDay) =>
          mealDay.mealsDate !== mealToDelete.date
            ? { mealsDate: mealDay.mealsDate, meals: [...mealDay.meals] }
            : {
                mealsDate: mealDay.mealsDate,
                meals: mealDay.meals.filter(
                  (meal) => meal.id !== mealToDelete.id,
                ),
              },
        )
        .filter((mealDay) => mealDay.meals.length > 0);
    });

    if (mealToDelete.date === todaysMacros.date) {
      setTodaysMacros((macros) => {
        return new MacroData(
          macros.date,
          macros.calories - mealToDelete.calories,
          macros.protein - mealToDelete.protein,
          macros.carbohydrates - mealToDelete.carbohydrates,
          macros.fats - mealToDelete.fats,
        );
      });
    }
  }

  function handleSetRecurringMeal(mealId: number, isRecurring: boolean) {
    setMeals(
      meals.map((mealDay) => {
        return {
          ...mealDay,
          meals: mealDay.meals.map((meal) =>
            meal.id === mealId ? { ...meal, isRecurring: isRecurring } : meal,
          ),
        };
      }),
    );
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      <div className="app-layout">
        <Banner
          navItems={Object.values(navItems)}
          selectedNavItem={selectedNavItem}
          onClick={setSelectedNavItem}
          isLoggedIn={isLoggedIn}
        />
        <Container
          className={
            isLoggedIn
              ? containerClassByNav[selectedNavItem]
              : "container--form"
          }
        >
          {isLoggedIn && selectedNavItem === navItems.MACROS && (
            <>
              <ContainerItem
                gridArea="macro-history"
                itemHeader="Macro History"
              >
                <div className="macro-history-actions">
                  <button
                    className="button button-square"
                    onClick={() =>
                      setIsAllExpanded((current) => ({
                        version: current.version + 1,
                        expanded: true,
                      }))
                    }
                    aria-label="Expand All"
                    title="Expand All"
                  >
                    <img src="/expand-all.svg" alt="" className="button-icon" />
                  </button>
                  <button
                    className="button button-square"
                    onClick={() =>
                      setIsAllExpanded((current) => ({
                        version: current.version + 1,
                        expanded: false,
                      }))
                    }
                    aria-label="Collapse All"
                    title="Collapse All"
                  >
                    <img
                      src="/collapse-all.svg"
                      alt=""
                      className="button-icon"
                    />
                  </button>
                </div>
                {meals.length > 0
                  ? meals.map((mealDay, index) => (
                      <MealDay
                        key={`${mealDay.mealsDate}-${isAllExpanded.version}`}
                        mealDay={mealDay}
                        onDeleteMeal={handleDeleteMeal}
                        onRecurringChange={handleSetRecurringMeal}
                        canBeRecurring={
                          index === 0 && mealDay.mealsDate === today
                            ? true
                            : false
                        }
                        handleSetCopyMeal={handleClickCopyMeal}
                        defaultExpanded={isAllExpanded.expanded}
                      />
                    ))
                  : !hasMoreHistory &&
                    oldestLoadedDate !== null && (
                      <p>You have no macro history ☹</p>
                    )}
                {isLoadingMore && (
                  <div className="macro-history-load-more">
                    <Loader size={1.5} thickness={5} />
                  </div>
                )}
                {oldestLoadedDate !== null && hasMoreHistory && (
                  <div
                    ref={sentinelRef}
                    className="macro-history-sentinel"
                    aria-hidden="true"
                  />
                )}
              </ContainerItem>
              <ContainerItem gridArea="daily-macros" itemHeader="Daily Macros">
                <DailyMacros
                  dailyMacros={todaysMacros}
                  macroTargets={recentWeighInData}
                />
                <button
                  className="button"
                  onClick={() => setCreateMealDialogOpen(true)}
                >
                  Add Meal
                </button>
              </ContainerItem>
            </>
          )}
          {isLoggedIn && selectedNavItem === navItems.METRICS && (
            <>
              <ContainerItem
                gridArea="weight-history"
                itemHeader="Weight History"
              >
                <Suspense fallback={null}>
                  <WeightHistoryChart refreshKey={weighInChartRefreshKey} />
                </Suspense>
              </ContainerItem>
              <ContainerItem
                gridArea="general-form-container"
                itemHeader="Weigh-In"
              >
                <WeighInForm
                  onWeighInSaved={() => {
                    setWeighInChartRefreshKey((key) => key + 1);
                    void refreshRecentWeighInData();
                  }}
                />
              </ContainerItem>
            </>
          )}
          {isLoggedIn && selectedNavItem === navItems.PANTRY && (
            <ContainerItem
              gridArea="general-form-container"
              itemHeader="Pantry"
            >
              <Pantry />
            </ContainerItem>
          )}
          {isLoggedIn && selectedNavItem === navItems.RECIPES && (
            <ContainerItem
              gridArea="general-form-container"
              itemHeader="Recipes"
            >
              <Recipes />
            </ContainerItem>
          )}
          {isLoggedIn && selectedNavItem === navItems.SETTINGS && (
            <ContainerItem
              gridArea="general-form-container"
              itemHeader="Settings"
            >
              <Settings />
            </ContainerItem>
          )}
          {isLoggedIn && selectedNavItem === navItems.SUPPORT && (
            <ContainerItem
              gridArea="general-form-container"
              itemHeader="Support"
            >
              🚧 Under construction 🚧
            </ContainerItem>
          )}
          {!isLoggedIn && <Login />}
        </Container>
        <Footer />
      </div>
      <CreateMealDialog
        isOpen={createMealDialogOpen}
        onClose={() => {
          setCreateMealDialogOpen(false);
          setMealToCopy(EMPTY_MEAL);
        }}
        onAddNewMeal={handleAddNewMeal}
        mealToCopy={mealToCopy}
      />
    </>
  );
}
