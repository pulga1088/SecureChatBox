import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390;

export function createResponsiveMetrics(width: number) {
    const scale = width / BASE_WIDTH;

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const moderate = (size: number, factor = 0.5) => {
        const scaled = size + (size * scale - size) * factor;
        return Math.round(clamp(scaled, size * 0.8, size * 1.2));
    };
    const round = (size: number) => Math.round(size * scale);

    return {
        width,
        scale,
        isCompact: width < 390,
        isSmall: width < 360,
        round,
        moderate,
        spacing: (size: number) => round(size),
        font: (size: number) => moderate(size, 0.65),
    };
}

export function useResponsiveMetrics() {
    const { width } = useWindowDimensions();
    return createResponsiveMetrics(width);
}