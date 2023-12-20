import {useState} from "react";
const memoryState = {};

export default function useMemoryState(key, initialState) {
    const [state, setState] = useState(() => {
        if (memoryState.hasOwnProperty(key)) {
            return memoryState[key]
        } else {
            return typeof initialState === 'function' ? initialState() : initialState;
        }
    });

    function onChange(nextState) {
        memoryState[key] = nextState;
        setState(nextState);
    }

    return [state, onChange];
}