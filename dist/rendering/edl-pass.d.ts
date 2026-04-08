import { Camera, Object3D, WebGLRenderer } from 'three';
import { PointCloudOctree } from '../point-cloud-octree';
export type EDLPassParams = {
    renderer: WebGLRenderer;
    scene: Object3D;
    camera: Camera;
    pointClouds?: PointCloudOctree[];
    pointCloudLayer?: number;
};
export declare class EDLPass {
    edlStrength: number;
    radius: number;
    opacity: number;
    neighbourCount: number;
    private rtEDL;
    private rtTypeChecked;
    private edlMaterial;
    private screenPass;
    private size;
    constructor();
    private ensureRenderTargetType;
    dispose(): void;
    private resizeToRenderer;
    render(params: EDLPassParams): void;
}
