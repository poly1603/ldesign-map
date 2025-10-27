/**
 * Quadtree - 四叉树空间索引
 * 用于高效的空间查询和视口裁剪
 */

export interface Point {
  x: number;
  y: number;
  data?: any;
}

export interface Bounds {
  x: number;      // 左上角 x
  y: number;      // 左上角 y
  width: number;  // 宽度
  height: number; // 高度
}

export interface QuadtreeOptions {
  bounds: Bounds;
  capacity?: number;  // 节点容量，默认4
  maxDepth?: number;  // 最大深度，默认8
}

/**
 * Quadtree节点
 */
class QuadtreeNode {
  bounds: Bounds;
  capacity: number;
  maxDepth: number;
  depth: number;
  points: Point[] = [];
  divided: boolean = false;

  // 子节点：西北、东北、西南、东南
  northwest?: QuadtreeNode;
  northeast?: QuadtreeNode;
  southwest?: QuadtreeNode;
  southeast?: QuadtreeNode;

  constructor(bounds: Bounds, capacity: number, maxDepth: number, depth: number = 0) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.maxDepth = maxDepth;
    this.depth = depth;
  }

  /**
   * 检查点是否在边界内
   */
  contains(point: Point): boolean {
    return (
      point.x >= this.bounds.x &&
      point.x < this.bounds.x + this.bounds.width &&
      point.y >= this.bounds.y &&
      point.y < this.bounds.y + this.bounds.height
    );
  }

  /**
   * 检查边界是否相交
   */
  intersects(range: Bounds): boolean {
    return !(
      range.x > this.bounds.x + this.bounds.width ||
      range.x + range.width < this.bounds.x ||
      range.y > this.bounds.y + this.bounds.height ||
      range.y + range.height < this.bounds.y
    );
  }

  /**
   * 插入点
   */
  insert(point: Point): boolean {
    // 点不在边界内
    if (!this.contains(point)) {
      return false;
    }

    // 如果节点未满且未分裂，直接插入
    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);
      return true;
    }

    // 如果已达最大深度，强制插入
    if (this.depth >= this.maxDepth) {
      this.points.push(point);
      return true;
    }

    // 需要分裂
    if (!this.divided) {
      this.subdivide();
    }

    // 插入到子节点
    return (
      this.northwest!.insert(point) ||
      this.northeast!.insert(point) ||
      this.southwest!.insert(point) ||
      this.southeast!.insert(point)
    );
  }

  /**
   * 分裂节点为四个子节点
   */
  private subdivide(): void {
    const { x, y, width, height } = this.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const nw: Bounds = { x, y, width: halfWidth, height: halfHeight };
    const ne: Bounds = { x: x + halfWidth, y, width: halfWidth, height: halfHeight };
    const sw: Bounds = { x, y: y + halfHeight, width: halfWidth, height: halfHeight };
    const se: Bounds = { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight };

    this.northwest = new QuadtreeNode(nw, this.capacity, this.maxDepth, this.depth + 1);
    this.northeast = new QuadtreeNode(ne, this.capacity, this.maxDepth, this.depth + 1);
    this.southwest = new QuadtreeNode(sw, this.capacity, this.maxDepth, this.depth + 1);
    this.southeast = new QuadtreeNode(se, this.capacity, this.maxDepth, this.depth + 1);

    this.divided = true;

    // 将现有点重新插入子节点
    for (const point of this.points) {
      this.northwest.insert(point) ||
        this.northeast.insert(point) ||
        this.southwest.insert(point) ||
        this.southeast.insert(point);
    }

    // 清空当前节点的点（已移至子节点）
    this.points = [];
  }

  /**
   * 查询范围内的点
   */
  query(range: Bounds, found: Point[] = []): Point[] {
    // 范围不相交，返回空
    if (!this.intersects(range)) {
      return found;
    }

    // 检查当前节点的点
    for (const point of this.points) {
      if (this.pointInRange(point, range)) {
        found.push(point);
      }
    }

    // 如果已分裂，递归查询子节点
    if (this.divided) {
      this.northwest!.query(range, found);
      this.northeast!.query(range, found);
      this.southwest!.query(range, found);
      this.southeast!.query(range, found);
    }

    return found;
  }

  /**
   * 检查点是否在范围内
   */
  private pointInRange(point: Point, range: Bounds): boolean {
    return (
      point.x >= range.x &&
      point.x < range.x + range.width &&
      point.y >= range.y &&
      point.y < range.y + range.height
    );
  }

  /**
   * 获取所有点
   */
  getAllPoints(points: Point[] = []): Point[] {
    points.push(...this.points);

    if (this.divided) {
      this.northwest!.getAllPoints(points);
      this.northeast!.getAllPoints(points);
      this.southwest!.getAllPoints(points);
      this.southeast!.getAllPoints(points);
    }

    return points;
  }

  /**
   * 清空节点
   */
  clear(): void {
    this.points = [];
    this.divided = false;
    this.northwest = undefined;
    this.northeast = undefined;
    this.southwest = undefined;
    this.southeast = undefined;
  }

  /**
   * 获取节点统计
   */
  getStats(): {
    totalPoints: number;
    totalNodes: number;
    maxDepth: number;
    avgPointsPerNode: number;
  } {
    let totalPoints = this.points.length;
    let totalNodes = 1;
    let maxDepthFound = this.depth;

    if (this.divided) {
      const nwStats = this.northwest!.getStats();
      const neStats = this.northeast!.getStats();
      const swStats = this.southwest!.getStats();
      const seStats = this.southeast!.getStats();

      totalPoints += nwStats.totalPoints + neStats.totalPoints + swStats.totalPoints + seStats.totalPoints;
      totalNodes += nwStats.totalNodes + neStats.totalNodes + swStats.totalNodes + seStats.totalNodes;
      maxDepthFound = Math.max(
        maxDepthFound,
        nwStats.maxDepth,
        neStats.maxDepth,
        swStats.maxDepth,
        seStats.maxDepth
      );
    }

    return {
      totalPoints,
      totalNodes,
      maxDepth: maxDepthFound,
      avgPointsPerNode: totalPoints / totalNodes
    };
  }
}

/**
 * Quadtree - 四叉树主类
 */
export class Quadtree {
  private root: QuadtreeNode;
  private pointCount = 0;

  constructor(options: QuadtreeOptions) {
    const capacity = options.capacity || 4;
    const maxDepth = options.maxDepth || 8;

    this.root = new QuadtreeNode(options.bounds, capacity, maxDepth);
  }

  /**
   * 插入点
   */
  insert(point: Point): boolean {
    const success = this.root.insert(point);
    if (success) {
      this.pointCount++;
    }
    return success;
  }

  /**
   * 批量插入点
   */
  insertMany(points: Point[]): number {
    let inserted = 0;
    for (const point of points) {
      if (this.insert(point)) {
        inserted++;
      }
    }
    return inserted;
  }

  /**
   * 查询范围内的点
   */
  query(range: Bounds): Point[] {
    return this.root.query(range);
  }

  /**
   * 查询圆形范围内的点
   */
  queryCircle(centerX: number, centerY: number, radius: number): Point[] {
    // 先用正方形范围查询，再过滤圆形
    const squareRange: Bounds = {
      x: centerX - radius,
      y: centerY - radius,
      width: radius * 2,
      height: radius * 2
    };

    const candidates = this.query(squareRange);
    const radiusSquared = radius * radius;

    return candidates.filter(point => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      return dx * dx + dy * dy <= radiusSquared;
    });
  }

  /**
   * 查询最近的N个点
   */
  queryNearest(x: number, y: number, count: number = 1, maxRadius: number = Infinity): Point[] {
    // 使用扩展搜索
    let searchRadius = 10;
    let found: Point[] = [];

    while (found.length < count && searchRadius < maxRadius) {
      found = this.queryCircle(x, y, searchRadius);
      searchRadius *= 2;
    }

    // 计算距离并排序
    const withDistance = found.map(point => ({
      point,
      distance: Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2))
    }));

    withDistance.sort((a, b) => a.distance - b.distance);

    return withDistance.slice(0, count).map(item => item.point);
  }

  /**
   * 获取所有点
   */
  getAllPoints(): Point[] {
    return this.root.getAllPoints();
  }

  /**
   * 清空树
   */
  clear(): void {
    this.root.clear();
    this.pointCount = 0;
  }

  /**
   * 重建树（优化性能）
   */
  rebuild(): void {
    const allPoints = this.getAllPoints();
    this.clear();
    this.insertMany(allPoints);
  }

  /**
   * 获取点数量
   */
  size(): number {
    return this.pointCount;
  }

  /**
   * 获取边界
   */
  getBounds(): Bounds {
    return { ...this.root.bounds };
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalPoints: number;
    totalNodes: number;
    maxDepth: number;
    avgPointsPerNode: number;
    efficiency: number; // 0-1，越高越好
  } {
    const stats = this.root.getStats();
    const efficiency = stats.totalPoints / (stats.totalNodes * 4); // 理想情况下每节点4个点

    return {
      ...stats,
      efficiency: Math.min(efficiency, 1)
    };
  }

  /**
   * 可视化调试（返回所有节点边界）
   */
  getDebugBounds(): Bounds[] {
    const bounds: Bounds[] = [];

    const collectBounds = (node: QuadtreeNode) => {
      bounds.push({ ...node.bounds });

      if (node.divided) {
        collectBounds(node.northwest!);
        collectBounds(node.northeast!);
        collectBounds(node.southwest!);
        collectBounds(node.southeast!);
      }
    };

    collectBounds(this.root);
    return bounds;
  }
}

/**
 * GeoQuadtree - 地理坐标专用四叉树
 * 自动处理经纬度坐标
 */
export class GeoQuadtree extends Quadtree {
  constructor(options?: Partial<QuadtreeOptions>) {
    // 全球范围：经度 -180 到 180，纬度 -90 到 90
    const defaultBounds: Bounds = {
      x: -180,
      y: -90,
      width: 360,
      height: 180
    };

    super({
      bounds: options?.bounds || defaultBounds,
      capacity: options?.capacity || 4,
      maxDepth: options?.maxDepth || 8
    });
  }

  /**
   * 插入地理点 [经度, 纬度]
   */
  insertGeoPoint(lng: number, lat: number, data?: any): boolean {
    return this.insert({ x: lng, y: lat, data });
  }

  /**
   * 批量插入地理点
   */
  insertGeoPoints(points: Array<{ lng: number; lat: number; data?: any }>): number {
    return this.insertMany(points.map(p => ({ x: p.lng, y: p.lat, data: p.data })));
  }

  /**
   * 查询地理范围 [西, 南, 东, 北]
   */
  queryGeoRange(west: number, south: number, east: number, north: number): Point[] {
    return this.query({
      x: west,
      y: south,
      width: east - west,
      height: north - south
    });
  }

  /**
   * 查询地理圆形范围（单位：度）
   */
  queryGeoCircle(lng: number, lat: number, radiusDegrees: number): Point[] {
    return this.queryCircle(lng, lat, radiusDegrees);
  }
}

