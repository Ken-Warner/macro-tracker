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

//todo
// - add loader spinner to 'Add Meal button'
// - make meal history accordian

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

export default function App() {
  const [error, setError] = useState("");
  const [user, setUser] = useState(tempUser);
  const [meals, setMeals] = useState(tempMeals);

  const isUserLoggedIn = user.userId !== undefined;

  function handleLogUserIn(user) {
    setUser(user);
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
  }

  return (
    <>
      {error && <Error errorMessage={error} onError={handleSetError} />}
      <Banner />
      {isUserLoggedIn && (
        <Nav>
          <span>Link</span>
          <span>Link</span>
          <span>Link</span>
        </Nav>
      )}
      <Container>
        {isUserLoggedIn ? (
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
                meals.map((mealDay) => (
                  <MealDay
                    key={mealDay.mealsDate}
                    mealDay={mealDay}
                    onDeleteMeal={handleDeleteMeal}
                  />
                ))
              ) : (
                <p>You have no macro history ☹</p>
              )}
            </ContainerItem>
            <ContainerItem gridArea="daily-macros" itemHeader="Daily Macros">
              <AddMealButton
                onError={handleSetError}
                onAddNewMeal={handleAddNewMeal}
              />
              <p>
                This pane contains todays macro goals and progress towards them.
              </p>
            </ContainerItem>
          </>
        ) : (
          <Login onUserLogin={handleLogUserIn} onError={handleSetError} />
        )}
      </Container>
      <Footer />
    </>
  );
}
