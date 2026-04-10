import { RawShaderMaterial, WebGLRenderer, WebGLRenderTarget } from 'three';
export declare class ScreenPass {
    private scene;
    private camera;
    private quad;
    private geometry;
    private placeholderMaterial;
    constructor();
    dispose(): void;
    render(renderer: WebGLRenderer, material: RawShaderMaterial, target?: WebGLRenderTarget | null): void;
}
