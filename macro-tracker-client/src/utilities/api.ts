import type { weighIn } from "../types/weighIn";
import type {
  CreateMealRawRequest,
  GetMealHistoryResponse,
} from "@macro-tracker/macro-tracker-shared";
import { WeighInData } from "@macro-tracker/macro-tracker-shared";

export async function getMealHistoryFromRange(
  fromDate: Date,
  toDate: Date,
): Promise<APIResult<GetMealHistoryResponse>> {
  const searchParams = new URLSearchParams({
    fromDate: fromDate.toISOString().split("T")[0],
    toDate: toDate.toISOString().split("T")[0],
  });

  const apiResult = await fetch(
    `/api/meals/history?${searchParams.toString()}`,
  );

  if (apiResult.ok) {
    return {
      ok: true,
      status: apiResult.status,
      body: await apiResult.json(),
    };
  } else {
    return {
      ok: false,
      status: apiResult.status,
      errorMessage: "Unable to get meal history",
    };
  }
}

export async function getTodaysMacros(today: Date) {
  const searchParams = new URLSearchParams({
    today: today.toISOString().split("T")[0],
  });

  const apiResult = await fetch(`/api/macros/today?${searchParams.toString()}`);

  if (apiResult.ok) {
    return await apiResult.json();
  } else {
    throw new Error("Unable to get current macro totals");
  }
}

export async function getUserLogout() {
  const apiResult = await fetch(`/api/users/logout`);
  if (!apiResult.ok) throw new Error("An error occurred while logging out.");
}

export async function postCreateNewUser(
  username: string,
  password: string,
  confirmedPassword: string,
  email: string,
) {
  const apiResult = await fetch(`/api/users/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      password: password,
      passwordConfirm: confirmedPassword,
      emailAddress: email,
    }),
  });

  if (apiResult.ok) {
    return await apiResult.json();
  } else if (apiResult.status === 400) {
    const jsonResult = await apiResult.json();
    throw new Error(jsonResult.errorMessage);
  } else {
    throw new Error("An error occurred while attempting to create a user.");
  }
}

export async function postUserLogin(
  username: string,
  password: string,
  rememberMe: boolean,
) {
  const apiResult = await fetch(`/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      password: password,
      rememberMe: rememberMe,
    }),
  });

  if (apiResult.ok) {
    return await apiResult.json();
  } else if (apiResult.status === 400) {
    const jsonResult = await apiResult.json();
    throw new Error(jsonResult.errorMessage);
  } else {
    throw new Error("An error occurred while attempting to log in.");
  }
}

export async function deleteMeal(mealId: number) {
  const apiResult = await fetch(`/api/meals/${mealId}`, {
    method: "DELETE",
  });

  if (apiResult.ok) {
    return true;
  } else {
    return false;
  }
}

export async function putMealRecurring(mealId: number, isRecurring: boolean) {
  const apiResult = await fetch(`/api/meals/${mealId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isRecurring: isRecurring }),
  });

  return apiResult.ok;
}

export async function getMostRecentWeighIn(): Promise<APIResult<WeighInData>> {
  const apiResult = await fetch(`/api/weighIn/recent`);

  if (!apiResult.ok) {
    return {
      ok: false,
      status: apiResult.status,
      errorMessage: "Could not retrieve weigh in data.",
    };
  } else {
    const tmp = WeighInData.fromRecentJSON(await apiResult.json());
    console.log(tmp);

    return {
      ok: true,
      status: apiResult.status,
      body: WeighInData.fromRecentJSON(await apiResult.json()),
    };
  }
}

export async function postWeighIn(weighInData: weighIn) {
  const apiResult = await fetch(`/api/weighIn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weighInData),
  });

  if (!apiResult.ok) throw new Error("Error sending new macro targets.");
}

export async function postMealNonComposed(newMeal: CreateMealRawRequest) {
  const apiResult = await fetch(`/api/meals/nonComposed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newMeal),
  });

  if (apiResult.ok) {
    return await apiResult.json();
  } else if (apiResult.status === 400) {
    const jsonResult = await apiResult.json();
    throw new Error(jsonResult.error);
  } else {
    throw new Error("There was a problem adding the new meal.");
  }
}

export type APIResult<T> =
  | {
      ok: true;
      status: number;
      body: T;
    }
  | {
      ok: false;
      status: number;
      errorMessage: string;
    };
