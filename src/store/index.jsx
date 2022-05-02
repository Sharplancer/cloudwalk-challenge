import { AnyAction, combineReducers, configureStore, Reducer } from "@reduxjs/toolkit";
import logDataSlice from "./logdata-slice";

const combinedReducer = combineReducers({
  logData: logDataSlice.reducer
});

export type RootState = ReturnType<typeof combinedReducer>;

const rootReducer: Reducer = (state: ReturnType<typeof store.getState>, action: AnyAction) => { 
  return combinedReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer
});

export default store;