import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import {
  MapRenderer,
  LayerManager,
  AnimationController,
  EventManager,
  type MapOptions,
  type LayerOptions
} from '@ldesign-map/core';

/**
 * LDesign Map Web Component using Lit
 * @element ldesign-map
 */
@customElement('ldesign-map')
export class LDesignMapElement extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 400px;
    }

    .map-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 10;
    }

    ::slotted(*) {
      position: relative;
      z-index: 1;
    }
  `;

  // Properties
  @property({ type: Number }) width?: number;
  @property({ type: Number }) height?: number;
  @property({ type: Object }) options?: MapOptions;
  @property({ type: Array }) layers: LayerOptions[] = [];
  @property({ type: Object }) viewState?: any;
  @property({ type: Boolean }) interactive = true;

  // State
  @state() private loading = true;

  // DOM Query
  @query('.map-container') private container!: HTMLDivElement;

  // Private properties
  private mapInstance?: MapRenderer;
  private layerManager?: LayerManager;
  private animationController?: AnimationController;
  private eventManager?: EventManager;

  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();
    // Set host dimensions if provided
    if (this.width) {
      this.style.width = `${this.width}px`;
    }
    if (this.height) {
      this.style.height = `${this.height}px`;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.destroy();
  }

  override firstUpdated() {
    this.initializeMap();
  }

  override updated(changedProperties: PropertyValues) {
    // Handle layers update
    if (changedProperties.has('layers') && this.layerManager) {
      this.updateLayers();
    }

    // Handle viewState update
    if (changedProperties.has('viewState') && this.mapInstance && this.viewState) {
      this.mapInstance.setViewState(this.viewState);
    }
  }

  private async initializeMap() {
    if (!this.container) return;

    try {
      // Create map instance
      this.mapInstance = new MapRenderer(this.container, {
        ...this.options,
        interactive: this.interactive
      });

      // Create managers
      this.layerManager = new LayerManager(this.mapInstance);
      this.animationController = new AnimationController(this.mapInstance);
      this.eventManager = new EventManager();

      // Setup event listeners
      this.setupEventListeners();

      // Add initial layers
      if (this.layers && this.layers.length > 0) {
        this.layers.forEach(layer => {
          this.layerManager!.addLayer(layer);
        });
      }

      // Set initial view state
      if (this.viewState) {
        this.mapInstance.setViewState(this.viewState);
      }

      this.loading = false;

      // Dispatch ready event
      this.dispatchEvent(new CustomEvent('ready', {
        detail: { map: this.mapInstance },
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      console.error('Failed to initialize map:', error);
      this.loading = false;

      // Dispatch error event
      this.dispatchEvent(new CustomEvent('error', {
        detail: { error },
        bubbles: true,
        composed: true
      }));
    }
  }

  private setupEventListeners() {
    if (!this.mapInstance) return;

    this.mapInstance.on('click', (info: any) => {
      this.dispatchEvent(new CustomEvent('map-click', {
        detail: info,
        bubbles: true,
        composed: true
      }));
    });

    this.mapInstance.on('hover', (info: any) => {
      this.dispatchEvent(new CustomEvent('map-hover', {
        detail: info,
        bubbles: true,
        composed: true
      }));
    });

    this.mapInstance.on('viewStateChange', (viewState: any) => {
      this.dispatchEvent(new CustomEvent('view-change', {
        detail: viewState,
        bubbles: true,
        composed: true
      }));
    });
  }

  private updateLayers() {
    if (!this.layerManager) return;

    // Clear existing layers
    this.layerManager.clear();

    // Add new layers
    this.layers.forEach(layer => {
      const layerId = this.layerManager!.addLayer(layer);

      // Dispatch layer add event
      this.dispatchEvent(new CustomEvent('layer-add', {
        detail: { layerId },
        bubbles: true,
        composed: true
      }));
    });
  }

  // Public methods
  public addLayer(options: LayerOptions): string {
    if (!this.layerManager) throw new Error('Map not initialized');
    const layerId = this.layerManager.addLayer(options);

    this.dispatchEvent(new CustomEvent('layer-add', {
      detail: { layerId },
      bubbles: true,
      composed: true
    }));

    return layerId;
  }

  public removeLayer(layerId: string): boolean {
    if (!this.layerManager) throw new Error('Map not initialized');
    const result = this.layerManager.removeLayer(layerId);

    if (result) {
      this.dispatchEvent(new CustomEvent('layer-remove', {
        detail: { layerId },
        bubbles: true,
        composed: true
      }));
    }

    return result;
  }

  public updateLayer(layerId: string, updates: Partial<LayerOptions>): boolean {
    if (!this.layerManager) throw new Error('Map not initialized');
    const result = this.layerManager.updateLayer(layerId, updates);

    if (result) {
      this.dispatchEvent(new CustomEvent('layer-update', {
        detail: { layerId, updates },
        bubbles: true,
        composed: true
      }));
    }

    return result;
  }

  public flyTo(options: {
    longitude: number;
    latitude: number;
    zoom?: number;
    duration?: number;
  }): void {
    if (!this.animationController) throw new Error('Map not initialized');
    this.animationController.flyTo(options);
  }

  public getViewState(): any {
    if (!this.mapInstance) throw new Error('Map not initialized');
    return this.mapInstance.getViewState();
  }

  public setViewState(viewState: any): void {
    if (!this.mapInstance) throw new Error('Map not initialized');
    this.mapInstance.setViewState(viewState);
    this.viewState = viewState;
  }

  public getMapInstance(): MapRenderer | undefined {
    return this.mapInstance;
  }

  public getLayerManager(): LayerManager | undefined {
    return this.layerManager;
  }

  public getAnimationController(): AnimationController | undefined {
    return this.animationController;
  }

  private destroy() {
    if (this.eventManager) {
      this.eventManager.removeAll();
    }
    if (this.layerManager) {
      this.layerManager.destroy();
    }
    if (this.animationController) {
      this.animationController.destroy();
    }
    if (this.mapInstance) {
      this.mapInstance.destroy();
    }
  }

  override render() {
    return html`
      <div class="map-container">
        ${this.loading ? html`
          <div class="loading">
            <slot name="loading">Loading map...</slot>
          </div>
        ` : ''}
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-map': LDesignMapElement;
  }
}



