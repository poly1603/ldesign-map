/**
 * DataTransformer - 数据转换器
 * 提供各种数据格式之间的转换功能
 */
import type { FeatureCollection, Feature } from './types';
export declare class DataTransformer {
    /**
     * 将CSV数据转换为GeoJSON
     */
    static csvToGeoJSON(csv: string, longitudeField?: string, latitudeField?: string, delimiter?: string): FeatureCollection;
    /**
     * 将JSON数组转换为GeoJSON
     */
    static arrayToGeoJSON(data: Array<Record<string, any>>, longitudeField?: string, latitudeField?: string): FeatureCollection;
    /**
     * GeoJSON 转 CSV
     */
    static geoJSONToCSV(geoJSON: FeatureCollection, delimiter?: string): string;
    /**
     * 扁平化嵌套的GeoJSON properties
     */
    static flattenProperties(geoJSON: FeatureCollection, separator?: string): FeatureCollection;
    /**
     * 扁平化对象
     */
    private static flattenObject;
    /**
     * 合并多个GeoJSON
     */
    static mergeGeoJSON(geoJSONs: FeatureCollection[]): FeatureCollection;
    /**
     * 按属性分组GeoJSON
     */
    static groupGeoJSONByProperty(geoJSON: FeatureCollection, property: string): Map<any, FeatureCollection>;
    /**
     * 过滤GeoJSON features
     */
    static filterGeoJSON(geoJSON: FeatureCollection, predicate: (feature: Feature) => boolean): FeatureCollection;
    /**
     * 转换坐标系（简单的坐标变换）
     */
    static transformCoordinates(geoJSON: FeatureCollection, transformer: (coords: [number, number]) => [number, number]): FeatureCollection;
    /**
     * 添加自定义属性到所有features
     */
    static addProperty(geoJSON: FeatureCollection, propertyName: string, valueOrFunction: any | ((feature: Feature, index: number) => any)): FeatureCollection;
    /**
     * 删除属性
     */
    static removeProperty(geoJSON: FeatureCollection, propertyName: string): FeatureCollection;
    /**
     * 重命名属性
     */
    static renameProperty(geoJSON: FeatureCollection, oldName: string, newName: string): FeatureCollection;
    /**
     * 统计属性值
     */
    static calculateStatistics(geoJSON: FeatureCollection, propertyName: string): {
        min: number;
        max: number;
        mean: number;
        median: number;
        sum: number;
        count: number;
    } | null;
}
//# sourceMappingURL=DataTransformer.d.ts.map