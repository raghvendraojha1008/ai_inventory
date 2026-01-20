
export const setHapticsEnabled = (enabled: boolean) => {
    localStorage.setItem('haptics_enabled', String(enabled));
};

export const vibrate = (pattern: number | number[]) => {
    const enabled = localStorage.getItem('haptics_enabled') !== 'false';
    if (enabled && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

// FULL COMPATIBILITY OBJECT
// Includes both standard methods (impact, notification) 
// AND legacy aliases (medium, success, error)
export const haptic = {
    // Standard Methods
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => vibrate(style === 'heavy' ? 20 : style === 'medium' ? 10 : 5),
    notification: (type: 'success' | 'warning' | 'error') => {
        if (type === 'error') vibrate([50, 100, 50]);
        else if (type === 'success') vibrate([10, 50, 10]);
        else vibrate([30, 30]);
    },
    selection: () => vibrate(5),

    // Legacy Aliases (Fixes your build errors)
    light: () => vibrate(5),
    medium: () => vibrate(10),
    heavy: () => vibrate(20),
    success: () => vibrate([10, 50, 10]),
    warning: () => vibrate([30, 30]),
    error: () => vibrate([50, 100, 50])
};
