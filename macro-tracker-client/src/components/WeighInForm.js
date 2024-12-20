import { useEffect, useState, useRef } from "react";
import Loader from "./Loader";

export default function WeighInForm({ userId }) {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const weighInForm = useRef(null);

  useEffect(() => {
    //on render we need to get data from the API
    //last weigh in date, weight, and target macros from the time,
    //and all meals between that date and today.
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    //make API call to save new weight and target macro data

    //on success either notify user or switch to macro screen or both
  }

  function handleCurrentWeightChange(e) {
    if (e.target.value.length < 2) return;

    //recalculate all target values based on weight
    //set values using form ref
    weighInForm.current.elements.targetCalories.value = "10";
    weighInForm.current.elements.targetProtein.value = "11";
    weighInForm.current.elements.targetCarbohydrates.value = "12";
    weighInForm.current.elements.targetFats.value = "13";

    setCurrentWeight(e.target.value);
  }

  return (
    <>
      {!isLoading ? (
        <form className="form" onSubmit={handleSubmit} ref={weighInForm}>
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
          <label htmlFor="currentWeight">Current Weight</label>
          <input
            type="number"
            name="currentWeight"
            className="input"
            defaultValue={currentWeight}
            onChange={handleCurrentWeightChange}
          />
          <label htmlFor="targetCalories">New Target Calories</label>
          <input
            type="number"
            name="targetCalories"
            className="input"
            defaultValue={0}
          />
          <label htmlFor="targetProtein">New Target Protein</label>
          <input
            type="number"
            name="targetProtein"
            className="input"
            defaultValue={0}
          />
          <label htmlFor="targetCarbohydrates">New Target Carbohydrates</label>
          <input
            type="number"
            name="targetCarbohydrates"
            className="input"
            defaultValue={0}
          />
          <label htmlFor="targetFats">New Target Fats</label>
          <input
            type="number"
            name="targetFats"
            className="input"
            defaultValue={0}
          />
          <button className="button submit" type="submit">
            Accept
          </button>
        </form>
      ) : (
        <Loader size={3} />
      )}
    </>
  );
}
