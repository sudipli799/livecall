import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";

/* ================= REGISTER ================= */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.REGISTER,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);


export const agentregister = createAsyncThunk(
  "auth/agentregister",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AGENTREGISTER,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);



/* ================= LOGIN ================= */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.LOGIN,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Invalid Credentials"
      );
    }
  }
);

export const GoLiveVideo = createAsyncThunk(
  "auth/goLive",
  async ({ token, ...data }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.GOLIVE,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to go live"
      );
    }
  }
);


export const getLiveStatus  = createAsyncThunk(
  "auth/goLive",
  async ({ token, ...data }, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.LIVESTATUS,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to go live"
      );
    }
  }
);

export const getTipsByUser = createAsyncThunk(
  "tip/getTipsByUser",
  async (user_id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `${ENDPOINTS.TIP}/${user_id}`
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch tips"
      );
    }
  }
);

export const getTipHistory = createAsyncThunk(
  "tip/getTipHistory",
  async (user_id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `${ENDPOINTS.TIPHISTORY}/${user_id}`
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch tips"
      );
    }
  }
);


export const addtip = createAsyncThunk(
  "auth/addtip",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.ADDTIP,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const updateToken = createAsyncThunk(
  "auth/updateToken",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.UPDATETOKEN,
        data,
        
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const updateShow = createAsyncThunk(
  "auth/updateShow",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.SETPRIVATESHOW,
        data,
        
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    updateWallet: (state, action) => {
      if (state.user) {
        state.user.wallet = action.payload;

        localStorage.setItem(
          "user",
          JSON.stringify(state.user)
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder

      /* ===== REGISTER (AUTO LOGIN) ===== */
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;

        // 🔥 Save session immediately
        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.user)
        );
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== LOGIN ===== */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.user)
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});



export const { logout, updateWallet } = authSlice.actions;
export default authSlice.reducer;
