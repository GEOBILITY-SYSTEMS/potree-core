import { Camera, Object3D, WebGLRenderer } from 'three';
import { PointCloudOctree } from '../point-cloud-octree';
import { Potree } from '../potree';
import { IVisibilityUpdateResult } from '../types';
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
    private edlPass;
    private edlOptions;
    private lastPointClouds;
    private overriddenMaterials;
    private overriddenLayerMasks;
    constructor(options?: PotreeRendererOptions);
    /** Releases internally owned GPU resources (render targets). */
    dispose(): void;
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
     * - EDL disabled: calls `renderer.render(scene, camera)`.
     * - EDL enabled: runs the EDL multi-pass pipeline via {@link EDLPass}.
     */
    render(params: PotreeRendererRenderParams): void;
    /** Convenience helper: `updatePointClouds()` followed by {@link render}. */
    updateAndRender(potree: Potree, pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer, scene: Object3D): IVisibilityUpdateResult;
}
