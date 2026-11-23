import { Camera, WebGLRenderer } from 'three';
import { PointCloudOctree } from '../point-cloud-octree';
/** Screen-space reconstruction settings used by PointShape.CLOSED. */
export interface ClosedPointOptions {
    /** Square-kernel radius in physical pixels, rounded to the nearest integer. Default: 2. */
    radius?: number;
    /** Maximum relative view-depth difference for interpolation. Default: 0.02 (2%). */
    depthThreshold?: number;
}
interface ClosedEDLOptions {
    enabled: boolean;
    strength?: number;
    radius?: number;
    opacity?: number;
    neighbourCount?: number;
}
/** Internal GPU resources, reused sequentially across clouds to keep memory bounded. */
export declare class ClosedPointPass {
    private samples;
    private dilated;
    private closedMask;
    private screenPass;
    private state;
    private erosion;
    private dilation;
    private composite;
    /** Release all owned targets, materials and fullscreen geometry. */
    dispose(): void;
    /** Validate before rendering the scene so unsupported hardware fails without changing state. */
    validate(renderer: WebGLRenderer, camera: Camera): void;
    /** Reconstruct one cloud and composite into the current target without clearing its depth. */
    render(renderer: WebGLRenderer, cloud: PointCloudOctree, camera: Camera, options: ClosedPointOptions, edl: ClosedEDLOptions): void;
}
export {};
