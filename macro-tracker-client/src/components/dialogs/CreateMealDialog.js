import { useRef, useState, useEffect } from "react";

export default function CreateMealDialog({ handleSubmit, isOpen, onClose }) {
  const createMealModal = useRef(null);

  useEffect(() => {
    const modal = createMealModal.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  return (
    <dialog className="container-item" onClose={onClose}>
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
              Date.now() - new Date().getTimezoneOffset() * 60000,
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
            onFocus={(event) => event.target.select()}
          />
          <label htmlFor="protein">Protein</label>
          <input
            type="number"
            name="protein"
            className="input"
            defaultValue={0}
            onFocus={(event) => event.target.select()}
          />
          <label htmlFor="carbohydrates">Carbohydrates</label>
          <input
            type="number"
            name="carbohydrates"
            className="input"
            defaultValue={0}
            onFocus={(event) => event.target.select()}
          />
          <label htmlFor="fats">Fats</label>
          <input
            type="number"
            name="fats"
            className="input"
            defaultValue={0}
            onFocus={(event) => event.target.select()}
          />
          <label htmlFor="description">Description</label>
          <textarea name="description" className="textarea"></textarea>
          <div className="modal-button-container">
            <button className="button" type="submit">
              Submit
            </button>
            <button className="button" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
