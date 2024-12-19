import { useState, useRef } from "react";

export default function AddMealButton({ onError, onAddNewMeal }) {
  const [isLoading, setIsLoading] = useState(false);
  const createMealModal = useRef(null);

  function handleOnClick() {
    if (isLoading) return;
    createMealModal.current.showModal();
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
    createMealModal.current.close();
  }

  return (
    <>
      <button className="button" onClick={handleOnClick}>
        {isLoading ? "Loading..." : "Add Meal"}
      </button>
      <dialog ref={createMealModal} className="container-item">
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
            <div className="modal-button-container">
              <button className="button" type="submit">
                Submit
              </button>
              <button
                className="button"
                type="button"
                onClick={() => createMealModal.current.close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
