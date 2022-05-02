import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_BIKES_API_URL || 'https://gist.githubusercontent.com/cloudwalk-tests/be1b636e58abff14088c8b5309f575d8/raw/df6ef4a9c0b326ce3760233ef24ae8bfa8e33940/qgames.log';

type LogDataState = {
    error: string,
    logData: string,
    status: string,
    name: string,
}

const initialState: LogDataState = {
    error: '',
    logData: '',
    status: '',
    name: '',
}

const logDataSlice = createSlice({
    name: 'logdata',
    initialState: initialState,
    reducers: {
        logDataRequest(state: LogDataState, action: PayloadAction<{ name: string }>) {
            state.error = '';
            state.status = 'pending';
            state.name = action.payload.name;
        },
        logDataSuccess(state: LogDataState, action: PayloadAction<{ logData: string }>) {
            state.logData = action.payload.logData;
            state.status = 'success';
        },
        logDataFail(state: LogDataState, action: PayloadAction<string>) {
            state.error = action.payload;
            state.status = 'failed';
        }
    }
});

const logDataActions = logDataSlice.actions;

export const fetchLogData = () => {
    return async (dispatch: Dispatch) => {
        dispatch(logDataActions.logDataRequest({ name: 'LIST' }));
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
            });
            const data = await response.text();
            if (!response.ok) {
                throw new Error(data || response.statusText);
            }
            const logData = data;
            dispatch(logDataActions.logDataSuccess({ logData }));
        } catch (error) {
            dispatch(logDataActions.logDataFail('error occured'))
        }
    }
}

export default logDataSlice;