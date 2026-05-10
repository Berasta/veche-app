import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  AuthUser,
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "@shared/api/authApi";
import * as authApi from "@shared/api/authApi";
import { pb, pbReady } from "@shared/api/pb";

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterInput,
  { rejectValue: string }
>("auth/registerUser", async (input, { rejectWithValue }) => {
  try {
    return await authApi.registerUser(input);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || err.message || "Registration failed",
    );
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginInput,
  { rejectValue: string }
>("auth/loginUser", async (input, { rejectWithValue }) => {
  try {
    return await authApi.loginUser(input);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || err.message || "Login failed",
    );
  }
});

export const fetchCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  // pbReady resolves immediately in browser (PocketBase loads from localStorage sync),
  // and waits for the Tauri store to finish loading in desktop builds.
  await pbReady;
  if (!pb.authStore.isValid) return rejectWithValue("No token");
  try {
    const { user } = await authApi.getCurrentUser();
    return user;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || err.message || "Failed to fetch user",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
        },
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          // Token is persisted by pb.authStore.onChange → tauri-plugin-store (Tauri)
          // or by PocketBase's default localStorage adapter (browser).
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<AuthUser>) => {
          state.loading = false;
          state.user = action.payload;
        },
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user";
        state.user = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
