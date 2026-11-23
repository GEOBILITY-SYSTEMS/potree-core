import { Vector4, WebGLRenderer, WebGLRenderTarget } from 'three';
/** Reusable snapshot of the renderer state changed by offscreen point passes. */
export declare class RendererState {
    target: WebGLRenderTarget | null;
    viewport: Vector4;
    private globalViewport;
    private globalScissor;
    private scissor;
    private logicalRectangle;
    private clearColor;
    private clearAlpha;
    private autoClear;
    private globalScissorTest;
    private scissorTest;
    private cubeFace;
    private mipLevel;
    capture(renderer: WebGLRenderer): void;
    /** Rebind the output for compositing, keeping autoClear disabled. */
    bindTarget(renderer: WebGLRenderer): void;
    restore(renderer: WebGLRenderer): void;
}
