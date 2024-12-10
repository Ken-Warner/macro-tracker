import { useState } from "react";
import Loader from "./Loader";

export default function AddMealButton({ onError, onAddNewMeal }) {
  const [isLoading, setIsLoading] = useState(false);

  function handleOnClick() {
    if (isLoading) return;
    const modal = document.getElementById("addMealDialog");
    modal.showModal();
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newMeal = {
      name: e.target.elements.name.value,
      description: e.target.elements.description.value,
      date: e.target.elements.date.value,
      time: e.target.elements.time.value,
      calories: e.target.elements.calories.value,
      protein: e.target.elements.protein.value,
      carbohydrates: e.target.elements.carbohydrates.value,
      fats: e.target.elements.fats.value,
    };

    async function fetchCreateNewMeal() {
      try {
        setIsLoading(true);
        onError("");

        const apiResult = await fetch("/api/meals/nonComposed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMeal),
        });

        const jsonResult = await apiResult.json();

        if (apiResult.ok) {
          onAddNewMeal(jsonResult);
          e.target.reset();
        } else if (apiResult.status === 400) {
          onError(jsonResult.error);
        }
      } catch {
        onError("There was a problem adding this new meal.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreateNewMeal();
    document.getElementById("addMealDialog").close();
  }

  return (
    <>
      <button className="button" onClick={handleOnClick}>
        {isLoading ? "Loading..." : "Add Meal"}
      </button>
      <dialog id="addMealDialog" className="container-item">
        <div className="container-item-header">Add Meal</div>
        <div className="container-item-body">
          <form className="form" onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" className="input" required />
            <label htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              className="input"
              defaultValue={
                new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .split("T")[0]
              }
            />
            <label htmlFor="time">Time</label>
            <input
              type="time"
              name="time"
              className="input"
              step={60}
              defaultValue={new Date(
                Date.now() - new Date().getTimezoneOffset() * 60000
              )
                .toISOString()
                .split("T")[1]
                .split(".")[0]
                .slice(0, -3)}
            />
            <label htmlFor="calories">Calories</label>
            <input
              type="number"
              name="calories"
              className="input"
              defaultValue={0}
            />
            <label htmlFor="protein">Protein</label>
            <input
              type="number"
              name="protein"
              className="input"
              defaultValue={0}
            />
            <label htmlFor="carbohydrates">Carbohydrates</label>
            <input
              type="number"
              name="carbohydrates"
              className="input"
              defaultValue={0}
            />
            <label htmlFor="fats">Fats</label>
            <input
              type="number"
              name="fats"
              className="input"
              defaultValue={0}
            />
            <label htmlFor="description">Description</label>
            <textarea name="description" className="textarea"></textarea>
            <button className="button" type="submit">
              Submit
            </button>
            <button
              className="button"
              type="button"
              onClick={() => document.getElementById("addMealDialog").close()}
            >
              Cancel
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
