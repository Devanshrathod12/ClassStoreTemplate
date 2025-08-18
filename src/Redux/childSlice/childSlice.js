import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    children: [],
};

const childSlice = createSlice({
    name: 'child',
    initialState,
    reducers: {
        setChildren: (state, action) => {
            state.children = action.payload;
        },
        resetChildren: (state) => {
            state.children = [];
        }
    },
});

export const { setChildren, resetChildren } = childSlice.actions;

export default childSlice.reducer;