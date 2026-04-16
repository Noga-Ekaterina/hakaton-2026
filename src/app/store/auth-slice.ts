import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthUser } from "@/entities/auth";
import type { LoginValues } from "@/features/auth/login-form/model/login-schema";

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "checking" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

const AUTH_URL = "https://backend-hackathon-production-faa2.up.railway.app//api/auth/login";
const AUTH_ME_URL = "https://backend-hackathon-production-faa2.up.railway.app/api/auth/me";

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object" && data) {
    if ("message" in data && typeof (data as { message?: unknown }).message === "string") {
      return (data as { message: string }).message;
    }

    if ("error" in data && typeof (data as { error?: unknown }).error === "string") {
      return (data as { error: string }).error;
    }
  }

  return fallback;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    (candidate.role === "USER" || candidate.role === "ADMIN") &&
    (candidate.departmentId === null || typeof candidate.departmentId === "number") &&
    (candidate.departmentName === null || typeof candidate.departmentName === "string")
  );
}

export const loginUser = createAsyncThunk<AuthUser, LoginValues, { rejectValue: string }>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        return rejectWithValue(getErrorMessage(payload, `Не удалось войти. Сервер вернул статус ${response.status}.`));
      }

      if (!isAuthUser(payload)) {
        return rejectWithValue("Сервер вернул ответ в неожиданном формате.");
      }

      return payload;
    } catch {
      return rejectWithValue("Не удалось выполнить вход. Проверьте подключение к сети.");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  "auth/fetchCurrentUser",
  async (_arg, { rejectWithValue }) => {
    try {
      const response = await fetch(AUTH_ME_URL, {
        method: "GET",
        credentials: "include",
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        return rejectWithValue(getErrorMessage(payload, "Сессия не найдена."));
      }

      if (!isAuthUser(payload)) {
        return rejectWithValue("Сервер вернул ответ в неожиданном формате.");
      }

      return payload;
    } catch {
      return rejectWithValue("Не удалось проверить авторизацию.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload ?? "Не удалось войти.";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "checking";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.user = null;
        state.error = action.payload ?? null;
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

