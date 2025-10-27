import type { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
export interface Feature<G = any, P = any> {
    type: 'Feature';
    geometry: G;
    properties: P;
}
export interface FeatureCollection<G = any, P = any> {
    type: 'FeatureCollection';
    features: Feature<G, P>[];
}
export type GeoJsonProperties = {
    [key: string]: any;
} | null;
export type ViewMode = '2d' | '3d';
export type SelectionMode = 'none' | 'single' | 'multiple';
export interface SelectionStyle {
    strokeColor?: number[];
    strokeWidth?: number;
    fillOpacity?: number;
    highlightColor?: number[];
}
export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
    transitionDuration?: number;
}
export interface MapRendererOptions {
    mode?: ViewMode;
    longitude?: number;
    latitude?: number;
    zoom?: number;
    pitch?: number;
    bearing?: number;
    viewState?: Partial<ViewState>;
    autoFit?: boolean;
    smoothZoom?: boolean;
    zoomSpeed?: number;
    transitionDuration?: number;
    inertia?: boolean;
    selectionMode?: SelectionMode;
    selectionStyle?: SelectionStyle;
    showTooltip?: boolean;
    onSelect?: (selectedFeatures: Feature[]) => void;
}
export interface TextLabelOptions {
    pickable?: boolean;
    fontSize?: number;
    getSize?: number | ((d: any) => number);
    getAngle?: number | ((d: any) => number);
    getTextAnchor?: string | ((d: any) => string);
    getAlignmentBaseline?: string | ((d: any) => string);
    getColor?: 'auto' | number[] | ((d: any) => number[]);
    getBackgroundColor?: number[] | ((d: any) => number[]);
    backgroundColor?: boolean;
    backgroundPadding?: number[];
    fontFamily?: string;
    fontWeight?: string | number;
    sdf?: boolean;
    buffer?: number;
    outlineWidth?: number;
    outlineColor?: number[];
    sizeScale?: number;
    sizeMinPixels?: number;
    sizeMaxPixels?: number;
    billboard?: boolean;
    characterSet?: string;
    wordBreak?: string;
    maxWidth?: number;
    lineHeight?: number;
}
export type ColorMode = 'single' | 'gradient' | 'category' | 'custom' | 'random' | 'data';
export interface ColorScheme {
    mode: ColorMode;
    color?: number[];
    startColor?: number[];
    endColor?: number[];
    colors?: number[][];
    categoryField?: string;
    dataField?: string;
    dataRange?: [number, number];
    colorStops?: Array<{
        value: number;
        color: number[];
    }>;
    customFunction?: (feature: any, index: number) => number[];
    opacity?: number;
}
export interface LayerOptions {
    id?: string;
    pickable?: boolean;
    stroked?: boolean;
    filled?: boolean;
    extruded?: boolean;
    wireframe?: boolean;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    getLineColor?: number[] | ((feature: any) => number[]);
    getFillColor?: number[] | ((feature: any, info?: any) => number[]);
    getLineWidth?: number | ((feature: any) => number);
    getElevation?: number | ((feature: any) => number);
    elevationScale?: number;
    material?: any;
    transitions?: any;
    showLabels?: boolean;
    labelOptions?: TextLabelOptions;
    colorScheme?: ColorScheme;
}
export interface CityMarker {
    name: string;
    coordinates: [number, number];
    longitude?: number;
    latitude?: number;
    radius?: number;
    color?: number[];
}
export interface CityMarkerOptions {
    id?: string;
    pickable?: boolean;
    opacity?: number;
    stroked?: boolean;
    filled?: boolean;
    radiusScale?: number;
    radiusMinPixels?: number;
    radiusMaxPixels?: number;
    lineWidthMinPixels?: number;
    getPosition?: (d: CityMarker) => [number, number];
    getRadius?: (d: CityMarker) => number;
    getFillColor?: (d: CityMarker) => number[];
    getLineColor?: number[] | ((d: CityMarker) => number[]);
}
export interface TooltipInfo {
    object?: Feature<any, GeoJsonProperties>;
    x?: number;
    y?: number;
    coordinate?: [number, number];
}
export type DeckGLLayer = GeoJsonLayer | ScatterplotLayer | any;
//# sourceMappingURL=types.d.ts.map