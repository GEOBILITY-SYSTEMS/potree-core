import 'three';
declare module 'three' {
    interface WebGLCapabilities {
        reverseDepthBuffer?: boolean;
    }
}
export {};
