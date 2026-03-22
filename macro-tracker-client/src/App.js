import { useState } from "react";
import Container from "./components/Container";
import ContainerItem from "./components/ContainerItem";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Login from "./components/Login";
import ToastMessage from "./components/reusables/ToastMessage.js";
import MealDay from "./components/MealDay";
import DailyMacros from "./components/DailyMacros";
import WeighInForm from "./components/WeighInForm";
import CreateMealDialog from "./components/dialogs/CreateMealDialog";

import {
  getMostRecentWeighIn,
  getMealHistoryFromRange,
  getTodaysMacros,
  getUserLogout,
} from "./utilities/api.js";

const tempUser = {
  userId: 1,
  username: "Ken",
};

const tempMeals = [
  {
    mealsDate: "2026-03-08",
    meals: [
      {
        id: 2,
        name: "Steak",
        description: "Steak and veggies.",
        date: "2024-12-11",
        time: "16:30:00",
        calories: 554,
        protein: 35,
        carbohydrates: 42,
        fats: 12,
        isRecurring: true,
      },
      {
        id: 1,
        name: "Ramen",
        description: "ramen noodles from the package",
        date: "2024-12-11",
        time: "12:30:00",
        calories: 254,
        protein: 11,
        carbohydrates: 34,
        fats: 3,
      },
    ],
  },
  {
    mealsDate: "2024-12-11",
    meals: [
      {
        id: 2,
        name: "Steak",
        description: "Steak and veggies.",
        date: "2024-12-11",
        time: "16:30:00",
        calories: 554,
        protein: 35,
        carbohydrates: 42,
        fats: 12,
        isRecurring: true,
      },
      {
        id: 1,
        name: "Ramen",
        description: "ramen noodles from the package",
        date: "2024-12-11",
        time: "12:30:00",
        calories: 254,
        protein: 11,
        carbohydrates: 34,
        fats: 3,
      },
    ],
  },
  {
    mealsDate: "2024-12-10",
    meals: [
      {
        id: 3,
        name: "Salmon",
        description: "Salmon as in the fish bruh.",
        date: "2024-12-10",
        time: "12:35:00",
        calories: 400,
        protein: 14,
        carbohydrates: 13,
        fats: 20,
      },
    ],
  },
];

const tempMacros = {
  date: "2024-12-11",
  calories: 1222,
  carbohydrates: 45,
  protein: 23,
  fats: 12,
};

const initialTodaysMacros = {
  date: "2024-12-21",
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fats: 0,
};

const navItems = {
  MACROS: "Macros",
  PANTRY: "Pantry",
  METRICS: "Metrics",
  SETTINGS: "Settings",
  SUPPORT: "Support",
};

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6000)
  .toISOString()
  .split("T")[0];

const emptyMeal = {
  id: 0,
  name: "",
  description: "",
  date: "",
  time: "",
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fats: 0,
  isRecurring: false,
};

export default function App() {
  //UI States
  const [selectedNavItem, setSelectedNavItem] = useState(navItems.MACROS);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  //Application Data States
  const [user, setUser] = useState({});
  const isUserLoggedIn = user.userId !== undefined;
  const [meals, setMeals] = useState([]);
  const [recentWeighInData, setRecentWeighInData] = useState({});
  const [todaysMacros, setTodaysMacros] = useState({});

  //Dialog States
  const [createMealDialogOpen, setCreateMealDialogOpen] = useState(false);
  const [mealToCopy, setMealToCopy] = useState(emptyMeal);

  //Toast Messages
  const [toast, setToast] = useState(null);
  const isToastDisplayed = toast != null;

  function handleLogUserIn(user) {
    setUser(user);

    async function fetchRecentWeighInData() {
      try {
        const recentWeighInData = await getMostRecentWeighIn();

        if (recentWeighInData === "") {
          return;
        }

        setRecentWeighInData(recentWeighInData);
      } catch {
        setToast({ type: "error", message: "Unable to get weigh in data" });
      }
    }

    async function fetchMealHistory() {
      const today = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000,
      );

      const tenDaysAgo = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 10,
      );

      try {
        setMeals(await getMealHistoryFromRange(tenDaysAgo, today));
      } catch {
        setToast({
          type: "error",
          message: "Unable to get meal history",
        });
      }

      try {
        setTodaysMacros(await getTodaysMacros(today));
      } catch {
        setToast({
          type: "error",
          message: "Unable to get current macro totals",
        });
      }
    }

    fetchRecentWeighInData();
    fetchMealHistory();
  }

  function handleLogUserOut() {
    async function fetchLogout() {
      try {
        await getUserLogout();
      } catch (error) {
        setToast({ type: "error", message: error.message });
      }
    }
    fetchLogout();
    setUser({});
  }

  function handleAddNewMeal(newMeal) {
    setMeals((meals) => {
      return meals.some((meal) => meal.mealsDate === newMeal.date)
        ? meals.map((mealDay) =>
            mealDay.mealsDate !== newMeal.date
              ? {
                  mealsDate: mealDay.mealsDate,
                  meals: [...mealDay.meals],
                }
              : {
                  mealsDate: mealDay.mealsDate,
                  meals: [...mealDay.meals, newMeal].sort((a, b) =>
                    a.time < b.time ? -1 : 1,
                  ),
                },
          )
        : [...meals, { mealsDate: newMeal.date, meals: [newMeal] }];
    });

    if (newMeal.date === todaysMacros.date) {
      setTodaysMacros((macros) => {
        return {
          date: macros.date,
          calories: macros.calories + newMeal.calories,
          protein: macros.protein + newMeal.protein,
          carbohydrates: macros.carbohydrates + newMeal.carbohydrates,
          fats: macros.fats + newMeal.fats,
        };
      });
    }
  }

  function handleClickCopyMeal(meal) {
    setMealToCopy(meal);
    setCreateMealDialogOpen(true);
  }

  function handleDeleteMeal(mealToDelete) {
    setMeals((meals) => {
      return meals
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
        return {
          date: macros.date,
          calories: macros.calories - mealToDelete.calories,
          protein: macros.protein - mealToDelete.protein,
          carbohydrates: macros.carbohydrates - mealToDelete.carbohydrates,
          fats: macros.fats - mealToDelete.fats,
        };
      });
    }
  }

  function handleSetRecurringMeal(mealId, isRecurring) {
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
      {isUserLoggedIn && (
        <Nav
          navItems={Object.values(navItems)}
          selectedNavItem={selectedNavItem}
          onClick={setSelectedNavItem}
        />
      )}
      <Container>
        {isUserLoggedIn && selectedNavItem === navItems.MACROS && (
          <>
            <ContainerItem gridArea="user-info" itemHeader="User Info">
              <p>
                Logged in as {user.username}. (
                <span className="link" onClick={handleLogUserOut}>
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
        {isUserLoggedIn && selectedNavItem === navItems.METRICS && (
          <ContainerItem
            gridArea="general-form-container"
            itemHeader="Weigh-In"
          >
            <WeighInForm />
          </ContainerItem>
        )}
        {isUserLoggedIn && selectedNavItem === navItems.PANTRY && (
          <ContainerItem gridArea="general-form-container" itemHeader="Pantry">
            🚧 Under construction 🚧
          </ContainerItem>
        )}
        {isUserLoggedIn && selectedNavItem === navItems.SETTINGS && (
          <ContainerItem
            gridArea="general-form-container"
            itemHeader="Settings"
          >
            🚧 Under construction 🚧
          </ContainerItem>
        )}
        {isUserLoggedIn && selectedNavItem === navItems.SUPPORT && (
          <ContainerItem
            gridArea="general-form-container"
            itemHeader="Settings"
          >
            🚧 Under construction 🚧
          </ContainerItem>
        )}
        {!isUserLoggedIn && <Login onUserLogin={handleLogUserIn} />}
      </Container>
      <Footer />
      <CreateMealDialog
        isOpen={createMealDialogOpen}
        onClose={() => {
          setCreateMealDialogOpen(false);
          setMealToCopy(emptyMeal);
        }}
        onAddNewMeal={handleAddNewMeal}
        mealToCopy={mealToCopy}
      />
    </>
  );
}
