import { Box3, Camera, Intersection, Object3D, Ray, Raycaster, Sphere, WebGLRenderer } from 'three';
import { PointCloudMaterial, PointSizeType } from './materials';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PickParams } from './point-cloud-octree-picker';
import { PointCloudTree } from './point-cloud-tree';
import { IPointCloudTreeNode, IPotree, PickPoint, PCOGeometry } from './types';
export declare class PointCloudOctree extends PointCloudTree {
    /**
     * The name of the point cloud octree.
     */
    potree: IPotree;
    /**
     * Indicates whether the point cloud octree has been disposed.
     *
     * This is set to true when the octree is disposed, and can be used to check if the octree is still valid.
     */
    disposed: boolean;
    /**
     * The geometry of the point cloud octree.
     *
     * This contains the root node and other properties related to the point cloud geometry.
     */
    pcoGeometry: PCOGeometry;
    /**
     * The bounding box of the point cloud octree.
     *
     * This is used to define the spatial extent of the point cloud.
     */
    boundingBox: Box3;
    /**
     * The bounding sphere of the point cloud octree.
     *
     * This is used for spatial queries and to determine visibility.
     */
    boundingSphere: Sphere;
    /**
     * The position of the point cloud octree in the 3D space.
     *
     * This is used to position the octree in the scene.
     */
    level: number;
    /**
     * The maximum level of detail for the point cloud octree.
     *
     * This is used to limit the depth of the octree when rendering or processing.
     */
    maxLevel: number;
    /**
     * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
     */
    minNodePixelSize: number;
    /**
     * The root node of the point cloud octree.
     */
    root: IPointCloudTreeNode | null;
    /**
     * Bounding box nodes for visualization.
     */
    boundingBoxNodes: Object3D[];
    /**
     * An array of visible nodes in the point cloud octree.
     *
     * These nodes are currently visible in the scene and can be rendered.
     */
    visibleNodes: PointCloudOctreeNode[];
    /**
     * An array of visible geometry nodes in the point cloud octree.
     *
     * These nodes contain the geometry data for rendering and are currently visible.
     */
    visibleGeometry: PointCloudOctreeGeometryNode[];
    /**
     * The number of visible points in the point cloud octree.
     *
     * This is used to keep track of how many points are currently visible in the scene.
     */
    numVisiblePoints: number;
    /**
     * Indicates whether the bounding box should be shown in the scene.
     *
     * This can be toggled to visualize the spatial extent of the point cloud octree.
     */
    showBoundingBox: boolean;
    private _material;
    /**
     * The bounds of the visible area in the point cloud octree.
     *
     * This is used to determine which nodes are currently visible based on the camera's frustum.
     */
    private visibleBounds;
    /**
     * The picker used for picking points in the point cloud octree.
     *
     * This is used to interact with the point cloud, such as selecting points or querying information.
     */
    private picker;
    constructor(potree: IPotree, pcoGeometry: PCOGeometry, material?: PointCloudMaterial);
    dispose(): void;
    get material(): PointCloudMaterial;
    set material(material: PointCloudMaterial);
    get pointSizeType(): PointSizeType;
    set pointSizeType(value: PointSizeType);
    toTreeNode(geometryNode: PointCloudOctreeGeometryNode, parent?: PointCloudOctreeNode | null): PointCloudOctreeNode;
    updateVisibleBounds(): void;
    updateBoundingBoxes(): void;
    updateMatrixWorld(force: boolean): void;
    hideDescendants(object: Object3D): void;
    moveToOrigin(): void;
    moveToGroundPlane(): void;
    getBoundingBoxWorld(): Box3;
    getVisibleExtent(): Box3;
    pick(renderer: WebGLRenderer, camera: Camera, ray: Ray, params?: Partial<PickParams>): PickPoint | null;
    /**
     * Implements THREE.js raycaster support for point cloud picking.
     *
     * When EDL is active, point cloud child nodes are moved to a dedicated rendering layer
     * (e.g. layer 1) so they are excluded from the normal scene render pass. This means
     * the default THREE.js layer test inside `Raycaster.intersectObject()` will fail for
     * those nodes, making `raycaster.intersectObject()` return no hits.
     *
     * This override handles that case by directly calling `raycast()` on each visible node's
     * scene node whenever the node's layer is NOT visible to the raycaster (i.e. EDL mode).
     * When nodes ARE on a raycaster-visible layer (non-EDL mode), this method does nothing
     * and lets the normal recursive traversal call `Points.raycast()` instead, avoiding
     * double-counting of intersections.
     */
    raycast(raycaster: Raycaster, intersects: Intersection[]): void;
    get progress(): number;
}
