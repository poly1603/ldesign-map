import type { ColorScheme } from './types';
/**
 * 图例位置
 */
export type LegendPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
/**
 * 图例项
 */
export interface LegendItem {
    label: string;
    color: number[];
    value?: number | string;
}
/**
 * 图例配置选项
 */
export interface LegendOptions {
    title?: string;
    position?: LegendPosition;
    items?: LegendItem[];
    colorScheme?: ColorScheme;
    width?: number;
    maxHeight?: number;
    style?: Partial<CSSStyleDeclaration>;
}
/**
 * Legend - 图例组件
 * 用于显示颜色方案说明
 */
export declare class Legend {
    private container;
    private legendElement;
    private options;
    constructor(container: HTMLElement, options?: LegendOptions);
    /**
     * 创建图例元素
     */
    private create;
    /**
     * 渲染图例项
     */
    private renderItems;
    /**
     * 从颜色方案生成图例项
     */
    private generateItemsFromColorScheme;
    /**
     * 创建单个图例项元素
     */
    private createLegendItem;
    /**
     * 获取位置样式
     */
    private getPositionStyles;
    /**
     * 应用样式到元素
     */
    private applyStyles;
    /**
     * RGB 数组转 CSS 颜色字符串
     */
    private rgbArrayToCss;
    /**
     * 更新图例
     */
    update(options: Partial<LegendOptions>): void;
    /**
     * 显示图例
     */
    show(): void;
    /**
     * 隐藏图例
     */
    hide(): void;
    /**
     * 切换图例显示状态
     */
    toggle(): void;
    /**
     * 销毁图例
     */
    destroy(): void;
    /**
     * 获取图例元素
     */
    getElement(): HTMLDivElement | null;
}
//# sourceMappingURL=Legend.d.ts.map