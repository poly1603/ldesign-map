import type { DeckGLLayer } from './types';
/**
 * POI 类型
 */
export type POIType = 'restaurant' | 'hotel' | 'shopping' | 'hospital' | 'school' | 'bank' | 'gas_station' | 'parking' | 'transit' | 'entertainment' | 'government' | 'company' | 'scenic' | 'custom';
/**
 * POI 数据
 */
export interface POIData {
    id: string;
    name: string;
    type: POIType;
    position: [number, number];
    address?: string;
    phone?: string;
    rating?: number;
    tags?: string[];
    distance?: number;
    description?: string;
    icon?: string;
    color?: number[];
    metadata?: any;
}
/**
 * 搜索选项
 */
export interface SearchOptions {
    keyword?: string;
    types?: POIType[];
    center?: [number, number];
    radius?: number;
    limit?: number;
    sortBy?: 'distance' | 'rating' | 'name';
    filters?: SearchFilter[];
}
/**
 * 搜索过滤器
 */
export interface SearchFilter {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in';
    value: any;
}
/**
 * 搜索结果
 */
export interface SearchResult {
    total: number;
    results: POIData[];
    center?: [number, number];
    radius?: number;
    searchTime: number;
}
/**
 * POI 分类配置
 */
export interface POICategoryConfig {
    type: POIType;
    name: string;
    icon: string;
    color: number[];
    visible?: boolean;
    minZoom?: number;
    maxZoom?: number;
}
/**
 * POISearch - POI搜索管理器
 * 支持关键字搜索、空间搜索、分类筛选等
 */
export declare class POISearch {
    private poiDatabase;
    private poiIndex;
    private searchHistory;
    private layers;
    private visiblePOIs;
    private selectedPOI;
    private categoryConfigs;
    constructor();
    /**
     * 初始化分类配置
     */
    private initializeCategoryConfigs;
    /**
     * 添加 POI
     */
    addPOI(poi: POIData): void;
    /**
     * 批量添加 POI
     */
    addPOIs(pois: POIData[]): void;
    /**
     * 更新 POI
     */
    updatePOI(poiId: string, updates: Partial<POIData>): void;
    /**
     * 删除 POI
     */
    removePOI(poiId: string): void;
    /**
     * 清空所有 POI
     */
    clearPOIs(): void;
    /**
     * 搜索 POI
     */
    search(options: SearchOptions): SearchResult;
    /**
     * 附近搜索
     */
    searchNearby(center: [number, number], radius: number, type?: POIType): SearchResult;
    /**
     * 沿路搜索
     */
    searchAlongRoute(route: [number, number][], bufferDistance: number, type?: POIType): SearchResult;
    /**
     * 获取 POI 详情
     */
    getPOIDetail(poiId: string): POIData | null;
    /**
     * 选中 POI
     */
    selectPOI(poiId: string): void;
    /**
     * 取消选中
     */
    clearSelection(): void;
    /**
     * 设置分类可见性
     */
    setCategoryVisibility(type: POIType, visible: boolean): void;
    /**
     * 获取分类配置
     */
    getCategoryConfig(type: POIType): POICategoryConfig | undefined;
    /**
     * 获取所有分类
     */
    getAllCategories(): POICategoryConfig[];
    /**
     * 获取搜索历史
     */
    getSearchHistory(): SearchResult[];
    /**
     * 清空搜索历史
     */
    clearSearchHistory(): void;
    /**
     * 获取统计信息
     */
    getStatistics(): any;
    /**
     * 获取图层
     */
    getLayers(): DeckGLLayer[];
    /**
     * 导出 POI 数据
     */
    exportPOIs(type?: POIType): POIData[];
    /**
     * 导入 POI 数据
     */
    importPOIs(pois: POIData[]): void;
    /**
     * 更新图层
     */
    private updateLayers;
    /**
     * 应用过滤器
     */
    private applyFilters;
    /**
     * 排序结果
     */
    private sortResults;
    /**
     * 计算两点距离
     */
    private calculateDistance;
    /**
     * 点到线段的距离
     */
    private pointToSegmentDistance;
}
/**
 * 创建 POI 搜索管理器
 */
export declare function createPOISearch(): POISearch;
/**
 * 从 GeoJSON 创建 POI
 */
export declare function createPOIsFromGeoJSON(geojson: any, typeField?: string): POIData[];
//# sourceMappingURL=POISearch.d.ts.map