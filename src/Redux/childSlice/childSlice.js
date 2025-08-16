import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    children: [{ name: '', age: '', standard: '', schoolName: '' }],
};

const childSlice = createSlice({
    name: 'child',
    initialState,
    reducers: {
        addChild: (state) => {
            state.children.push({ name: '', age: '', standard: '', schoolName: '' });
        },
        removeChild: (state, action) => {
            state.children.splice(action.payload, 1);
        },
        updateChild: (state, action) => {
            const { index, field, value } = action.payload;
            state.children[index][field] = value;
        },
        resetChildren: (state) => {
            state.children = [{ name: '', age: '', standard: '', schoolName: '' }];
        }
    },
});

export const { addChild, removeChild, updateChild, resetChildren } = childSlice.actions;

export default childSlice.reducer;