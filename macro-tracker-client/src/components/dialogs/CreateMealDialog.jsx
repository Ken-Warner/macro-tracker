import { useRef, useState, useEffect } from "react";
import Loader from "../Loader";
import ToastMessage from "../reusables/ToastMessage";
import { postMealNonComposed } from "../../utilities/api";

export default function CreateMealDialog({
  isOpen,
  onClose,
  onAddNewMeal,
  mealToCopy,
}) {
  const createMealModal = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(mealToCopy);

  const [toast, setToast] = useState(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    const modal = createMealModal.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T");

    const copiedMealData = {
      ...mealToCopy,
      date: today[0],
      time: today[1].split(".")[0].slice(0, -3),
      id: 0,
    };

    setFormData(copiedMealData);
  }, [mealToCopy]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    async function fetchCreateNewMeal() {
      try {
        setIsLoading(true);

        onAddNewMeal(await postMealNonComposed(formData));
      } catch (error) {
        setToast({ type: "error", message: error.message });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreateNewMeal();
    onClose();
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      <dialog
        className="container-item"
        onClose={onClose}
        ref={createMealModal}
      >
        <div className="container-item-header">Add Meal</div>
        {isLoading ? (
          <>
            <br />
            <Loader size={1.5} thickness={3} />
          </>
        ) : (
          <div className="container-item-body">
            <form className="form" onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
              <label htmlFor="date">Date</label>
              <input
                type="date"
                name="date"
                className="input"
                value={formData.date}
                onChange={handleChange}
              />
              <label htmlFor="time">Time</label>
              <input
                type="time"
                name="time"
                className="input"
                step={60}
                value={formData.time}
                onChange={handleChange}
              />
              <label htmlFor="calories">Calories</label>
              <input
                type="number"
                name="calories"
                className="input"
                value={formData.calories}
                onChange={handleChange}
                onFocus={(event) => event.target.select()}
              />
              <label htmlFor="protein">Protein</label>
              <input
                type="number"
                name="protein"
                className="input"
                value={formData.protein}
                onChange={handleChange}
                onFocus={(event) => event.target.select()}
              />
              <label htmlFor="carbohydrates">Carbohydrates</label>
              <input
                type="number"
                name="carbohydrates"
                className="input"
                value={formData.carbohydrates}
                onChange={handleChange}
                onFocus={(event) => event.target.select()}
              />
              <label htmlFor="fats">Fats</label>
              <input
                type="number"
                name="fats"
                className="input"
                value={formData.fats}
                onChange={handleChange}
                onFocus={(event) => event.target.select()}
              />
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                className="textarea"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
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
        )}
      </dialog>
    </>
  );
}
