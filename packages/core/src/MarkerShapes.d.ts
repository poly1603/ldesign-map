/**
 * MarkerShapes - 标记形状库
 * 提供各种内置标记形状的 SVG 定义
 */
/**
 * 标记形状接口
 */
export interface MarkerShape {
    name: string;
    svg: string;
    width: number;
    height: number;
    anchorX: number;
    anchorY: number;
}
/**
 * 预定义的标记形状
 */
export declare const MarkerShapes: Record<string, MarkerShape>;
/**
 * 获取标记形状
 */
export declare function getMarkerShape(name: string): MarkerShape | undefined;
/**
 * 获取所有标记形状名称
 */
export declare function getAllMarkerShapeNames(): string[];
/**
 * 创建自定义标记形状
 */
export declare function createCustomShape(name: string, svg: string, width?: number, height?: number, anchorX?: number, anchorY?: number): MarkerShape;
/**
 * 将 SVG 转换为 Data URL
 */
export declare function svgToDataUrl(svg: string): string;
/**
 * 将颜色应用到 SVG
 */
export declare function applySvgColor(svg: string, color: number[]): string;
//# sourceMappingURL=MarkerShapes.d.ts.map