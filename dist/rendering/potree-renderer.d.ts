import { Camera, Object3D, WebGLRenderer } from 'three';
import { PointCloudOctree } from '../point-cloud-octree';
import { Potree } from '../potree';
import { IVisibilityUpdateResult } from '../types';
import { ClosedPointOptions } from './closed-point-pass';
export type { ClosedPointOptions } from './closed-point-pass';
/**
 * Configuration for Eye-Dome Lighting (EDL) rendering.
 *
 * Note: EDL is a multi-pass / post-process effect (render default layer 0 (non-pointcloud), render point clouds to an offscreen target,
 * then composite). Therefore it cannot be expressed as a single `renderer.render(scene, camera)` call.
 */
export type PotreeRendererEDLOptions = {
    enabled: boolean;
    /** Defaults to 1 so layer 0 can remain reserved for non-pointcloud content in the first pass. */
    pointCloudLayer?: number;
    strength?: number;
    radius?: number;
    opacity?: number;
    neighbourCount?: number;
};
/**
 * Options for {@link PotreeRenderer}.
 *
 * This is intentionally additive and does not change existing Potree APIs.
 */
export type PotreeRendererOptions = {
    edl?: PotreeRendererEDLOptions;
    /** Reconstruction settings for clouds using PointShape.CLOSED. */
    closed?: ClosedPointOptions;
};
/**
 * Parameters required to render a frame.
 */
export type PotreeRendererRenderParams = {
    renderer: WebGLRenderer;
    scene: Object3D;
    camera: Camera;
    pointClouds?: PointCloudOctree[];
};
/**
 * Thin helper that renders Potree point clouds.
 *
 * Why this exists:
 * - Without EDL, users typically do: `potree.updatePointClouds(...)` then `renderer.render(scene, camera)`.
 * - With EDL enabled, users previously had to manually:
 *   1) keep point-cloud objects on a dedicated layer, and
 *   2) run `EDLPass.render(...)` instead of `renderer.render(...)`.
 *
 * `PotreeRenderer` keeps that wiring in one place while preserving backward compatibility.
 */
export declare class PotreeRenderer {
    private closedPass;
    private closedOptions;
    private closedClouds;
    private edlPass;
    private edlOptions;
    private lastPointClouds;
    private overriddenMaterials;
    private overriddenLayerMasks;
    constructor(options?: PotreeRendererOptions);
    /** Releases internally owned GPU resources (render targets). */
    dispose(): void;
    /**
     * Set the square closing radius (physical pixels) and relative depth tolerance.
     *
     * Missing settings retain their previous values. Defaults are radius 2 and tolerance 0.02.
     */
    setClosed(options: ClosedPointOptions): void;
    /**
     * Enables/disables EDL and updates EDL parameters.
     *
     * This method is safe to call at runtime (e.g. toggling EDL on/off).
     */
    setEDL(options: PotreeRendererEDLOptions): void;
    private setLayerMaskRecursive;
    /**
     * Ensures all point-cloud objects (including newly created child nodes) are on the provided layer.
      * Side effect: overwrites `Object3D.layers` for the point cloud subtree.
     *
     * When EDL is enabled, layer separation is required so we can render:
     * - non-pointcloud content first (layer 0), then
     * - point clouds on a dedicated layer into an offscreen target.
     */
    syncPointCloudLayers(pointClouds: PointCloudOctree[], layer: number): void;
    private applyEDLState;
    /**
     * Renders a frame.
     *
     * CLOSED clouds are rasterized at one physical pixel, dilated, eroded and
     * composited with interpolated color, view depth and normals. Each cloud is
     * reconstructed separately. EDL, when enabled, shades the reconstructed surface.
     * Requires WebGL2 with EXT_color_buffer_float for CLOSED; otherwise throws.
     * Other shapes use the normal renderer or the EDL pipeline.
     */
    render(params: PotreeRendererRenderParams): void;
    /** Convenience helper: `updatePointClouds()` followed by {@link render}. */
    updateAndRender(potree: Potree, pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer, scene: Object3D): IVisibilityUpdateResult;
}
