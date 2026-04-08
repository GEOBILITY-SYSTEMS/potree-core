import 'three';
declare module 'three' {
    interface WebGLRendererParameters {
        reversedDepthBuffer?: boolean;
    }
    interface WebGLCapabilities {
        reversedDepthBuffer?: boolean;
        reverseDepthBuffer?: boolean;
    }
}
export {};
