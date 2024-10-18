import { useState, useCallback, useRef } from "react";

const useDebounce = (func, wait) => {
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef(null);

    const debouncedFunc = useCallback((...args) => {
        setLoading(true);  
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            func(...args);
            setLoading(false);  
        }, wait);
    }, [func, wait]);

    return [debouncedFunc, loading];
};

export default useDebounce;
