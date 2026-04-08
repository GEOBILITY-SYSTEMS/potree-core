import { Matrix4, RawShaderMaterial, Texture } from 'three';
import { IUniform } from './types';
export interface IEyeDomeLightingMaterialUniforms {
    [name: string]: IUniform<any>;
    screenWidth: IUniform<number>;
    screenHeight: IUniform<number>;
    edlStrength: IUniform<number>;
    radius: IUniform<number>;
    opacity: IUniform<number>;
    neighbours: IUniform<Float32Array>;
    uProj: IUniform<Float32Array>;
    colorMap: IUniform<Texture | null>;
    far: IUniform<number>;
    useOrthographicCamera: IUniform<boolean>;
}
export declare class EyeDomeLightingMaterial extends RawShaderMaterial {
    uniforms: IEyeDomeLightingMaterialUniforms;
    private _neighbourCount;
    private _useLogDepth;
    private _useReversedDepth;
    private neighboursArray;
    constructor();
    get neighbourCount(): number;
    set neighbourCount(value: number);
    set useLogDepth(value: boolean);
    get useLogDepth(): boolean;
    set useReversedDepth(value: boolean);
    get useReversedDepth(): boolean;
    private initializeNeighboursArray;
    private getDefines;
    updateShaderSource(): void;
    setProjectionMatrix(projectionMatrix: Matrix4): void;
}
