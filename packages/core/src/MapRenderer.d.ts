import { Deck } from '@deck.gl/core';
import type { ViewMode, ViewState, MapRendererOptions, LayerOptions, CityMarker, CityMarkerOptions, DeckGLLayer, ColorScheme, SelectionMode, SelectionStyle, Feature, FeatureCollection, TextLabelOptions } from './types';
import { type MarkerOptions, type MarkerGroupOptions } from './MarkerRenderer';
/**
 * MapRenderer - A deck.gl based map renderer for GeoJSON data
 * Supports 2D and 3D visualization modes
 */
export declare class MapRenderer {
    private container;
    private mode;
    private deck;
    private layers;
    private viewState;
    private autoFit;
    private geoJsonBounds;
    private lastZoom;
    private layerLabelOptions;
    private originalLayerProps;
    private smoothZoom;
    private zoomSpeed;
    private transitionDuration;
    private inertia;
    private selectionMode;
    private selectionStyle;
    private showTooltip;
    private selectedFeatures;
    private onSelectCallback?;
    private markerRenderer;
    private animationFrameId;
    private rippleMarkers;
    private miniMap;
    private compass;
    private scaleBar;
    private coordinateDisplay;
    private performanceOverlay;
    private drawingMode;
    private currentDrawing;
    private drawings;
    private hoverTimeout;
    private lastInteractionTime;
    private idleCallback?;
    private enableMiniMap;
    private enableCompass;
    private enableScaleBar;
    private enableCoordinates;
    private enablePerformanceOverlay;
    private enableDrawing;
    private enableIdleDetection;
    private idleTimeout;
    constructor(container: HTMLElement | string, options?: MapRendererOptions);
    /**
     * Initialize deck.gl instance
     */
    private initDeck;
    /**
     * Setup mouse wheel control
     */
    private setupMouseWheelControl;
    /**
     * Handle click event for selection
     */
    private handleClick;
    /**
     * Get feature unique ID
     */
    private getFeatureId;
    /**
     * Get list of selected features
     */
    private getSelectedFeaturesList;
    /**
     * Update layers to show selection effect
     */
    private updateSelectionLayers;
    /**
     * Handle view state changes (zoom, pan, etc.)
     */
    private handleViewStateChange;
    /**
     * Update all text layers' size based on current zoom
     */
    private updateTextLayersSize;
    /**
     * Calculate luminance of an RGB color
     */
    private calculateLuminance;
    /**
     * Get contrasting text color (black or white) based on background color
     */
    private getContrastingTextColor;
    /**
     * Get tooltip HTML content
     */
    private getTooltipHTML;
    /**
     * Load and render GeoJSON data from URL
     */
    loadGeoJSON(url: string, layerOptions?: LayerOptions): Promise<FeatureCollection>;
    /**
     * Render GeoJSON data directly
     */
    renderGeoJSON(geoJson: FeatureCollection, layerOptions?: LayerOptions): void;
    /**
     * Create color function based on color scheme
     */
    private createColorFunction;
    /**
     * Create gradient color function
     */
    private createGradientColorFunction;
    /**
     * Create category color function
     */
    private createCategoryColorFunction;
    /**
     * Create data-driven color function
     */
    private createDataDrivenColorFunction;
    /**
     * Create random color function
     */
    private createRandomColorFunction;
    /**
     * Default fill color function
     */
    private getDefaultFillColor;
    /**
     * Add a layer to the map
     */
    addLayer(layer: DeckGLLayer): void;
    /**
     * Remove a layer by id
     */
    removeLayer(layerId: string): void;
    /**
     * Clear all layers
     */
    clearLayers(): void;
    /**
     * Update deck.gl layers
     */
    private updateLayers;
    /**
     * Switch between 2D and 3D mode
     */
    setMode(mode: ViewMode): void;
    /**
     * Get current mode
     */
    getMode(): ViewMode;
    /**
     * Update view state
     */
    setViewState(viewState: Partial<ViewState>): void;
    /**
     * Fly to specific location
     */
    flyTo(longitude: number, latitude: number, zoom?: number): void;
    /**
     * Add text labels for GeoJSON features
     */
    private addTextLabels;
    /**
     * Calculate the center point of a polygon feature
     */
    private calculatePolygonCenter;
    /**
     * Calculate polygon area for finding the largest polygon
     */
    private calculatePolygonArea;
    /**
     * Get feature name from properties
     */
    private getFeatureName;
    /**
     * Add city markers (deprecated - use addMarker instead)
     */
    addCityMarkers(cities: CityMarker[], options?: CityMarkerOptions): void;
    /**
     * Add a single marker to the map
     */
    addMarker(marker: MarkerOptions): string;
    /**
     * 启动动画循环
     */
    private startAnimationLoop;
    /**
     * 停止动画循环
     */
    private stopAnimationLoop;
    /**
     * Add multiple markers to the map
     */
    addMarkers(markers: MarkerOptions[]): string[];
    /**
     * Add a marker group
     */
    addMarkerGroup(group: MarkerGroupOptions): void;
    /**
     * Update a marker
     */
    updateMarker(markerId: string, updates: Partial<MarkerOptions>): void;
    /**
     * Remove a marker
     */
    removeMarker(markerId: string): void;
    /**
     * Remove a marker group
     */
    removeMarkerGroup(groupId: string): void;
    /**
     * Clear all markers
     */
    clearMarkers(): void;
    /**
     * Get a marker by ID
     */
    getMarker(markerId: string): MarkerOptions | undefined;
    /**
     * Get all markers
     */
    getAllMarkers(): MarkerOptions[];
    /**
     * Find markers by condition
     */
    findMarkers(predicate: (marker: MarkerOptions) => boolean): MarkerOptions[];
    /**
     * Set marker visibility
     */
    setMarkerVisibility(markerId: string, visible: boolean): void;
    /**
     * Highlight a marker
     */
    highlightMarker(markerId: string, highlightColor?: number[]): void;
    /**
     * Unhighlight a marker
     */
    unhighlightMarker(markerId: string): void;
    /**
     * 添加水波纹标记点
     * @param id 标记ID
     * @param longitude 经度
     * @param latitude 纬度
     * @param color 颜色 [R, G, B]
     * @param options 其他选项
     */
    addRippleMarker(id: string, longitude: number, latitude: number, color?: [number, number, number], options?: {
        baseRadius?: number;
        rippleCount?: number;
        animationSpeed?: number;
    }): void;
    /**
     * 批量添加水波纹标记
     */
    addRippleMarkers(markers: Array<{
        id: string;
        longitude: number;
        latitude: number;
        color?: [number, number, number];
        options?: {
            baseRadius?: number;
            rippleCount?: number;
            animationSpeed?: number;
        };
    }>): void;
    /**
     * 移除水波纹标记
     */
    removeRippleMarker(id: string): void;
    /**
     * 清除所有水波纹标记
     */
    clearRippleMarkers(): void;
    /**
     * Calculate optimal view state based on container dimensions
     */
    private calculateOptimalViewState;
    /**
     * Calculate bounds of GeoJSON data
     */
    private calculateGeoJsonBounds;
    /**
     * Fit view to GeoJSON bounds with proper padding
     */
    private fitToGeoJson;
    /**
     * Resize the map
     */
    resize(): void;
    /**
     * Destroy the map renderer
     */
    destroy(): void;
    /**
     * Get deck instance (for advanced usage)
     */
    getDeck(): Deck | null;
    /**
     * Get all layers
     */
    getLayers(): DeckGLLayer[];
    /**
     * Update zoom settings
     */
    setZoomOptions(options: {
        smoothZoom?: boolean;
        zoomSpeed?: number;
        transitionDuration?: number;
        inertia?: boolean;
    }): void;
    /**
     * Get current zoom settings
     */
    getZoomOptions(): {
        smoothZoom: boolean;
        zoomSpeed: number;
        transitionDuration: number;
        inertia: boolean;
    };
    /**
     * Set selection mode
     */
    setSelectionMode(mode: SelectionMode): void;
    /**
     * Get current selection mode
     */
    getSelectionMode(): SelectionMode;
    /**
     * Clear all selections
     */
    clearSelection(): void;
    /**
     * Get selected features
     */
    getSelectedFeatures(): Feature[];
    /**
     * Select features by IDs
     */
    selectFeatures(featureIds: string[]): void;
    /**
     * Update selection style
     */
    setSelectionStyle(style: Partial<SelectionStyle>): void;
    /**
     * Show or hide text labels for a specific layer
     */
    toggleLabels(layerId: string, show: boolean): void;
    /**
     * Update label style for a specific layer
     */
    updateLabelStyle(layerId: string, labelOptions: TextLabelOptions): void;
    /**
     * Update color scheme for a specific layer
     * This allows changing the color scheme without re-rendering the entire layer
     */
    updateColorScheme(layerId: string, colorScheme: ColorScheme): void;
}
//# sourceMappingURL=MapRenderer.d.ts.map