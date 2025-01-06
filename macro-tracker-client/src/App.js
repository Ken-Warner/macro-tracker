import { useState } from "react";
import Container from "./components/Container";
import ContainerItem from "./components/ContainerItem";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Login from "./components/Login";
import Error from "./components/Error";
import AddMealButton from "./components/AddMealButton";
import MealDay from "./components/MealDay";
import DailyMacros from "./components/DailyMacros";
import WeighInForm from "./components/WeighInForm";

const tempUser = {
  userId: 1,
  username: "Ken",
};

const tempMeals = [
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
  METRICS: "Metrics",
  SETTINGS: "Settings",
  SUPPORT: "Support",
};

const today = new Date(Date.now() - new Date().getTimezoneOffset())
  .toISOString()
  .split("T")[0];

export default function App() {
  //UI States
  const [error, setError] = useState("");
  const [selectedNavItem, setSelectedNavItem] = useState(navItems.MACROS);

  //Application Data States
  const [user, setUser] = useState(tempUser);
  const isUserLoggedIn = user.userId !== undefined;
  const [meals, setMeals] = useState(tempMeals);
  const [recentWeighInData, setRecentWeighInData] = useState({});
  const [todaysMacros, setTodaysMacros] = useState(tempMacros);

  function handleLogUserIn(user) {
    setUser(user);

    async function fetchRecentWeighInData() {
      try {
        handleSetError("");

        const apiResult = await fetch("/api/weighIn/recent");
        const jsonResult = await apiResult.json();

        if (apiResult.ok) {
          setRecentWeighInData(jsonResult);
        } else {
          handleSetError("Unable to get weigh in data");
        }
      } catch (e) {
        handleSetError("Unable to get weigh in data");
      }
    }

    async function fetchMealHistory() {
      try {
        handleSetError("");

        const today = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        );
        const tenDaysAgo = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 10
        );

        const searchParams = new URLSearchParams({
          fromDate: tenDaysAgo.toISOString().split("T")[0],
          toDate: today.toISOString().split("T")[0],
        });

        const apiResult = await fetch(
          `/api/meals/history?${searchParams.toString()}`
        );
        const jsonResult = await apiResult.json();

        if (apiResult.ok) setMeals(jsonResult);
        else handleSetError("Unable to get meal history");
      } catch {
        handleSetError("Unable to get meal history");
      }
    }

    async function fetchCurrentMacros() {
      try {
        handleSetError("");

        const searchParams = new URLSearchParams({
          today: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0],
        });

        const apiResult = await fetch(
          `/api/macros/today?${searchParams.toString()}`
        );
        const jsonResult = await apiResult.json();

        if (apiResult.ok) {
          setTodaysMacros(jsonResult);
        } else {
          handleSetError("Unable to get current macro totals");
        }
      } catch {
        handleSetError("Unable to get current macro totals");
      }
    }

    fetchRecentWeighInData();
    fetchMealHistory();
    fetchCurrentMacros();
  }

  function handleLogUserOut() {
    async function fetchLogout() {
      const apiResult = await fetch("/api/users/logout");
      if (!apiResult.ok) handleSetError("An error occurred while logging out.");
    }
    fetchLogout();
    setUser({});
  }

  function handleSetError(errorMessage) {
    setError(errorMessage);
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
                    a.time < b.time ? -1 : 1
                  ),
                }
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

  function handleDeleteMeal(mealToDelete) {
    setMeals((meals) => {
      return meals
        .map((mealDay) =>
          mealDay.mealsDate !== mealToDelete.date
            ? { mealsDate: mealDay.mealsDate, meals: [...mealDay.meals] }
            : {
                mealsDate: mealDay.mealsDate,
                meals: mealDay.meals.filter(
                  (meal) => meal.id !== mealToDelete.id
                ),
              }
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
            meal.id === mealId ? { ...meal, isRecurring: isRecurring } : meal
          ),
        };
      })
    );
  }

  return (
    <>
      {error && <Error errorMessage={error} onError={handleSetError} />}
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
              {meals.length > 0 ? (
                meals.map((mealDay, index) => (
                  <MealDay
                    key={mealDay.mealsDate}
                    mealDay={mealDay}
                    onDeleteMeal={handleDeleteMeal}
                    onError={handleSetError}
                    onRecurringChange={handleSetRecurringMeal}
                    canBeRecurring={
                      index === 0 && mealDay.mealsDate === today ? true : false
                    }
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
              <AddMealButton
                onError={handleSetError}
                onAddNewMeal={handleAddNewMeal}
              />
            </ContainerItem>
          </>
        )}
        {isUserLoggedIn && selectedNavItem === navItems.METRICS && (
          <ContainerItem
            gridArea="general-form-container"
            itemHeader="Weigh-In"
          >
            <WeighInForm onError={handleSetError} />
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
        {!isUserLoggedIn && (
          <Login onUserLogin={handleLogUserIn} onError={handleSetError} />
        )}
      </Container>
      <Footer />
    </>
  );
}
