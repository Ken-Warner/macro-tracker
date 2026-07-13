import { lazy, Suspense, useEffect, useState } from "react";
import {
  MacroData,
  WeighInData,
  type GetMealHistoryResponse,
} from "@macro-tracker/macro-tracker-shared";
import Container from "./components/Container";
import ContainerItem from "./components/ContainerItem";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Login from "./components/Login";
import ToastMessage, { type Toast } from "./components/reusables/ToastMessage";
import MealDay from "./components/MealDay";
import DailyMacros from "./components/DailyMacros";
import WeighInForm from "./components/WeighInForm";
const WeightHistoryChart = lazy(
  () => import("./components/WeightHistoryChart"),
);
import Pantry from "./components/Pantry";
import Recipes from "./components/Recipes";
import CreateMealDialog from "./components/dialogs/CreateMealDialog";
import { EMPTY_MEAL, type Meal } from "./types/meal";
import { useUser } from "./context/useUser";

import {
  getMostRecentWeighIn,
  getMealHistoryFromRange,
  getTodaysMacros,
} from "./utilities/api";

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
  const { user, isLoggedIn, logout } = useUser();

  const [selectedNavItem, setSelectedNavItem] = useState<string>(
    navItems.MACROS,
  );
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const [meals, setMeals] = useState<GetMealHistoryResponse>([]);
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
      const todayDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000,
      );

      const tenDaysAgo = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        todayDate.getDate() - 10,
      );

      try {
        const mealHistoryResult = await getMealHistoryFromRange(
          tenDaysAgo,
          todayDate,
        );
        if (mealHistoryResult.ok) {
          setMeals(mealHistoryResult.body);
        } else {
          setToast({
            type: "error",
            message: "Unable to get meal history",
          });
        }
      } catch {
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
        : [...currentMeals, { mealsDate: newMeal.date, meals: [newMeal] }];
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
      <Banner />
      {isLoggedIn && (
        <Nav
          navItems={Object.values(navItems)}
          selectedNavItem={selectedNavItem}
          onClick={setSelectedNavItem}
        />
      )}
      <Container
        className={
          isLoggedIn
            ? containerClassByNav[selectedNavItem]
            : "container--form"
        }
      >
        {isLoggedIn && selectedNavItem === navItems.MACROS && (
          <>
            <ContainerItem gridArea="user-info" itemHeader="User Info">
              <p>
                Logged in as {user!.username}. (
                <span className="link" onClick={logout}>
                  Logout
                </span>
                )
              </p>
              <p>
                Contains current goals setting (bulk, cut, maintain), last
                weight in date and weight.
              </p>
            </ContainerItem>
            <ContainerItem gridArea="macro-history" itemHeader="Macro History">
              <button className="button" onClick={() => setIsAllExpanded(true)}>
                Expand All
              </button>
              <button
                className="button"
                onClick={() => setIsAllExpanded(false)}
              >
                Collapse All
              </button>
              {meals.length > 0 ? (
                meals.map((mealDay, index) => (
                  <MealDay
                    key={mealDay.mealsDate}
                    mealDay={mealDay}
                    onDeleteMeal={handleDeleteMeal}
                    onRecurringChange={handleSetRecurringMeal}
                    canBeRecurring={
                      index === 0 && mealDay.mealsDate === today ? true : false
                    }
                    handleSetCopyMeal={handleClickCopyMeal}
                    expanded={isAllExpanded}
                  />
                ))
              ) : (
                <p>You have no macro history ☹</p>
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
          <ContainerItem gridArea="general-form-container" itemHeader="Pantry">
            <Pantry />
          </ContainerItem>
        )}
        {isLoggedIn && selectedNavItem === navItems.RECIPES && (
          <ContainerItem gridArea="general-form-container" itemHeader="Recipes">
            <Recipes />
          </ContainerItem>
        )}
        {isLoggedIn && selectedNavItem === navItems.SETTINGS && (
          <ContainerItem
            gridArea="general-form-container"
            itemHeader="Settings"
          >
            🚧 Under construction 🚧
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
