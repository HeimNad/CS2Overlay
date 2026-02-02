export const SPRING_SMOOTH = { type: 'spring' as const, stiffness: 260, damping: 24 };
export const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 400, damping: 20 };
export const SPRING_CARD = { type: 'spring' as const, stiffness: 300, damping: 22 };
export const SPRING_GENTLE = { type: 'spring' as const, stiffness: 200, damping: 20 };
export const FADE = { duration: 0.4 };
export const staggerDelay = (index: number, interval = 0.08) => index * interval;
