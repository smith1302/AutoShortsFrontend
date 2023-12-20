import { useState, useEffect, useLayoutEffect } from 'react';

/*
    Allows us to use "isMobile" as a prop in the inner component
*/
export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(null);
    useEffect(() => {
        function updateSize() {
            const mobileStatus = window.innerWidth <= 640;
            if (mobileStatus != isMobile) {
                setIsMobile(mobileStatus);
            }
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return isMobile;
}