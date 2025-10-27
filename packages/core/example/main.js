import { MapRenderer, LayerManager, AnimationController, EventManager } from '@ldesign-map/core';
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer, PathLayer, PolygonLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';

// 全局变量
let mapRenderer;
let layerManager;
let animationController;
let eventManager;
const layers = new Map();
let animationFrameId = null;

// 示例数据
const sampleData = {
    cities: [
        { position: [116.4074, 39.9042], name: '北京', value: 100, color: [255, 0, 0] },
        { position: [121.4737, 31.2304], name: '上海', value: 95, color: [0, 128, 255] },
        { position: [113.2644, 23.1291], name: '广州', value: 85, color: [255, 165, 0] },
        { position: [114.0579, 22.5431], name: '深圳', value: 90, color: [0, 255, 0] },
        { position: [104.0665, 30.5723], name: '成都', value: 75, color: [255, 0, 255] },
        { position: [118.7969, 32.0603], name: '南京', value: 70, color: [0, 255, 255] },
        { position: [120.1551, 30.2741], name: '杭州', value: 80, color: [255, 255, 0] },
        { position: [106.5507, 29.5647], name: '重庆', value: 65, color: [128, 0, 255] },
        { position: [114.3055, 30.5928], name: '武汉', value: 60, color: [255, 128, 0] },
        { position: [117.2010, 39.0842], name: '天津', value: 55, color: [128, 255, 0] }
    ],
    path: [
        [116.4074, 39.9042],
        [117.2010, 39.0842],
        [121.4737, 31.2304],
        [120.1551, 30.2741],
        [118.7969, 32.0603]
    ],
    polygon: [
        [116.3, 39.9],
        [116.5, 39.9],
        [116.5, 39.7],
        [116.3, 39.7],
        [116.3, 39.9]
    ]
};

// 初始化地图
async function initMap() {
    try {
        updateStatus('正在初始化...', '');
        
        const container = document.getElementById('map');
        if (!container) {
            throw new Error('Map container not found');
        }

        // 创建 Deck 实例
        const deck = new Deck({
            container: 'map',
            initialViewState: {
                longitude: 116.4074,
                latitude: 39.9042,
                zoom: 5,
                pitch: 0,
                bearing: 0
            },
            controller: true,
            onViewStateChange: ({ viewState }) => {
                updateZoomLevel(viewState.zoom);
            },
            onClick: (info) => {
                if (info.coordinate) {
                    updateLastAction(`点击: [${info.coordinate[0].toFixed(4)}, ${info.coordinate[1].toFixed(4)}]`);
                }
            },
            onHover: (info) => {
                if (info.coordinate) {
                    updateMousePos(info.coordinate);
                }
            }
        });
        
        // 保存全局引用
        window.deck = deck;
        
        updateStatus('就绪', 'success');
        updateLastAction('地图初始化完成');
        
        // 自动添加一个示例图层
        setTimeout(() => {
            addScatterplotLayer();
        }, 500);
        
        // 启动FPS监控
        startFPSMonitor();
        
    } catch (error) {
        console.error('Failed to initialize map:', error);
        updateStatus('初始化失败', 'error');
        updateLastAction(error.message);
    }
}

// FPS 监控
let lastTime = performance.now();
let frames = 0;
function startFPSMonitor() {
    function update() {
        frames++;
        const now = performance.now();
        if (now >= lastTime + 1000) {
            const fps = Math.round((frames * 1000) / (now - lastTime));
            document.getElementById('fps').textContent = fps;
            frames = 0;
            lastTime = now;
        }
        requestAnimationFrame(update);
    }
    update();
}

// 更新状态
function updateStatus(text, type = '') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = text;
    statusEl.className = 'status';
    if (type) {
        statusEl.classList.add(type);
    }
}

// 更新鼠标位置
function updateMousePos(coordinate) {
    const el = document.getElementById('mousePos');
    if (coordinate) {
        el.textContent = `[${coordinate[0].toFixed(4)}, ${coordinate[1].toFixed(4)}]`;
    }
}

// 更新缩放级别
function updateZoomLevel(zoom) {
    const el = document.getElementById('zoomLevel');
    el.textContent = zoom.toFixed(2);
}

// 更新图层数量
function updateLayerCount() {
    const el = document.getElementById('layerCount');
    el.textContent = layers.size;
    updateLayerList();
}

// 更新最后操作
function updateLastAction(action) {
    const el = document.getElementById('lastAction');
    el.textContent = action;
}

// 更新图层列表
function updateLayerList() {
    const listEl = document.getElementById('layerList');
    if (layers.size === 0) {
        listEl.innerHTML = '<div class="empty">暂无图层</div>';
    } else {
        listEl.innerHTML = Array.from(layers.entries()).map(([id, name]) => `
            <div class="layer-item">
                <span>${name}</span>
                <button onclick="removeLayerById('${id}')">删除</button>
            </div>
        `).join('');
    }
}

// 添加散点图层
window.addScatterplotLayer = function() {
    if (!window.deck) return;
    
    const layerId = `scatterplot-${Date.now()}`;
    const layer = new ScatterplotLayer({
        id: layerId,
        data: sampleData.cities,
        getPosition: d => d.position,
        getRadius: d => d.value * 1000,
        getFillColor: d => d.color,
        getLineColor: [255, 255, 255],
        lineWidthMinPixels: 2,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 50,
        opacity: 0.8
    });
    
    const currentLayers = window.deck.props.layers || [];
    window.deck.setProps({ layers: [...currentLayers, layer] });
    
    layers.set(layerId, '散点图层');
    updateLayerCount();
    updateLastAction('添加了散点图层');
};

// 添加路径图层
window.addPathLayer = function() {
    if (!window.deck) return;
    
    const layerId = `path-${Date.now()}`;
    const layer = new PathLayer({
        id: layerId,
        data: [{ path: sampleData.path, name: '路径' }],
        getPath: d => d.path,
        getColor: [80, 180, 230, 255],
        getWidth: 5,
        widthMinPixels: 2,
        pickable: true,
        opacity: 0.9
    });
    
    const currentLayers = window.deck.props.layers || [];
    window.deck.setProps({ layers: [...currentLayers, layer] });
    
    layers.set(layerId, '路径图层');
    updateLayerCount();
    updateLastAction('添加了路径图层');
};

// 添加多边形图层
window.addPolygonLayer = function() {
    if (!window.deck) return;
    
    const layerId = `polygon-${Date.now()}`;
    const layer = new PolygonLayer({
        id: layerId,
        data: [{ contour: sampleData.polygon, name: '区域' }],
        getPolygon: d => d.contour,
        getFillColor: [160, 180, 200, 100],
        getLineColor: [80, 80, 80],
        getLineWidth: 3,
        lineWidthMinPixels: 2,
        pickable: true
    });
    
    const currentLayers = window.deck.props.layers || [];
    window.deck.setProps({ layers: [...currentLayers, layer] });
    
    layers.set(layerId, '多边形图层');
    updateLayerCount();
    updateLastAction('添加了多边形图层');
};

// 添加六边形图层
window.addHexagonLayer = function() {
    if (!window.deck) return;
    
    const layerId = `hexagon-${Date.now()}`;
    const layer = new HexagonLayer({
        id: layerId,
        data: sampleData.cities,
        getPosition: d => d.position,
        getElevationWeight: d => d.value,
        elevationScale: 1000,
        extruded: true,
        radius: 50000,
        coverage: 0.9,
        pickable: true,
        opacity: 0.8
    });
    
    const currentLayers = window.deck.props.layers || [];
    window.deck.setProps({ layers: [...currentLayers, layer] });
    
    layers.set(layerId, '六边形图层');
    updateLayerCount();
    updateLastAction('添加了六边形图层');
};

// 清除所有图层
window.clearAllLayers = function() {
    if (!window.deck) return;
    
    window.deck.setProps({ layers: [] });
    layers.clear();
    updateLayerCount();
    updateLastAction('清除了所有图层');
};

// 删除指定图层
window.removeLayerById = function(layerId) {
    if (!window.deck) return;
    
    const currentLayers = window.deck.props.layers || [];
    const newLayers = currentLayers.filter(layer => layer.id !== layerId);
    window.deck.setProps({ layers: newLayers });
    
    const name = layers.get(layerId);
    layers.delete(layerId);
    updateLayerCount();
    updateLastAction(`删除了${name}`);
};

// 飞行到北京
window.flyToBeijing = function() {
    if (!window.deck) return;
    
    window.deck.setProps({
        initialViewState: {
            longitude: 116.4074,
            latitude: 39.9042,
            zoom: 10,
            pitch: 45,
            bearing: 0,
            transitionDuration: 2000,
            transitionInterpolator: null
        }
    });
    
    updateLastAction('飞行到北京');
};

// 飞行到上海
window.flyToShanghai = function() {
    if (!window.deck) return;
    
    window.deck.setProps({
        initialViewState: {
            longitude: 121.4737,
            latitude: 31.2304,
            zoom: 10,
            pitch: 45,
            bearing: 0,
            transitionDuration: 2000
        }
    });
    
    updateLastAction('飞行到上海');
};

// 重置视图
window.resetView = function() {
    if (!window.deck) return;
    
    window.deck.setProps({
        initialViewState: {
            longitude: 116.4074,
            latitude: 39.9042,
            zoom: 5,
            pitch: 0,
            bearing: 0,
            transitionDuration: 1000
        }
    });
    
    updateLastAction('重置了视图');
};

// 旋转视图
window.rotateView = function() {
    if (!window.deck) return;
    
    const currentView = window.deck.viewState || window.deck.props.initialViewState;
    window.deck.setProps({
        initialViewState: {
            ...currentView,
            bearing: (currentView.bearing || 0) + 90,
            transitionDuration: 1000
        }
    });
    
    updateLastAction('旋转了视图');
};

// 启动动画
window.startAnimation = function() {
    if (animationFrameId) return;
    
    let angle = 0;
    function animate() {
        if (!window.deck) return;
        
        angle += 0.5;
        const currentView = window.deck.viewState || window.deck.props.initialViewState;
        window.deck.setProps({
            initialViewState: {
                ...currentView,
                bearing: angle
            }
        });
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    updateLastAction('启动了旋转动画');
};

// 停止动画
window.stopAnimation = function() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        updateLastAction('停止了动画');
    }
};

// 脉冲动画
window.pulseAnimation = function() {
    if (!window.deck) return;
    
    let scale = 1;
    let growing = true;
    
    function pulse() {
        if (growing) {
            scale += 0.05;
            if (scale >= 2) growing = false;
        } else {
            scale -= 0.05;
            if (scale <= 1) {
                growing = true;
                return;
            }
        }
        
        // 重新创建图层
        const currentLayers = window.deck.props.layers || [];
        const newLayers = currentLayers.map(layer => {
            if (layer.id.startsWith('scatterplot-')) {
                return new ScatterplotLayer({
                    ...layer.props,
                    getRadius: d => d.value * 1000 * scale
                });
            }
            return layer;
        });
        
        window.deck.setProps({ layers: newLayers });
        requestAnimationFrame(pulse);
    }
    
    pulse();
    updateLastAction('启动了脉冲动画');
};

// 添加1000个点
window.add1000Points = function() {
    if (!window.deck) return;
    
    const points = generateRandomPoints(1000);
    const layerId = `points-1k-${Date.now()}`;
    
    const layer = new ScatterplotLayer({
        id: layerId,
        data: points,
        getPosition: d => d.position,
        getRadius: 5000,
        getFillColor: [255, 140, 0, 200],
        pickable: false,
        radiusMinPixels: 2
    });
    
    const currentLayers = window.deck.props.layers || [];
    window.deck.setProps({ layers: [...currentLayers, layer] });
    
    layers.set(layerId, '1000个随机点');
    updateLayerCount();
    updateLastAction('添加了1000个随机点');
};

// 添加10000个点
window.add10000Points = function() {
    if (!window.deck) return;
    
    const points = generateRandomPoints(10000);
    const layerId = `points-10k-${Date.now()}`;
    
    const layer = new ScatterplotLayer({
        id: layerId,
        data: points,
        getPosition: d => d.position,
        getRadius: 3000,
        getFillColor: [0, 180, 255, 180],
        pickable: false,
        radiusMinPixels: 1
    });
    
    const currentLayers = window.deck.props.layers || [];
    window.deck.setProps({ layers: [...currentLayers, layer] });
    
    layers.set(layerId, '10000个随机点');
    updateLayerCount();
    updateLastAction('添加了10000个随机点');
};

// 生成随机点
function generateRandomPoints(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        points.push({
            position: [
                100 + Math.random() * 40, // 100-140 经度
                20 + Math.random() * 30   // 20-50 纬度
            ],
            value: Math.random() * 100
        });
    }
    return points;
}

// 显示性能信息
window.showPerformance = function() {
    const info = `
图层数: ${layers.size}
总数据点: ${Array.from(layers.values()).join(', ')}
FPS: ${document.getElementById('fps').textContent}
    `;
    alert(info);
    updateLastAction('显示了性能信息');
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initMap);

