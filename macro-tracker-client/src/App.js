import { useState } from "react";
import Container from "./components/Container";
import ContainerItem from "./components/ContainerItem";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Login from "./components/Login";
import Error from "./components/Error";
import AddMealButton from "./components/AddMealButton";

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
              <p>
                This card contains a history of the meals someone has eaten,
                their macros, and the progress for each days' goals.
              </p>
              <button className="button" onClick={() => console.log(meals)}>
                Test
              </button>
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
