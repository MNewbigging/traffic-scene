import { WebGLRenderer, Scene, Camera, Uniform } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

export class PostProcessHandler {
    private readonly renderer: WebGLRenderer;
    private readonly renderPass: RenderPass;
    public readonly composer: EffectComposer;
    public camera: Camera;

    constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(scene, camera);
        this.composer.addPass(this.renderPass);
        
        this.composer.addPass(new BokehPass(scene, camera, {
            focus: 1,
            aspect: this.camera.userData.focusLength,
            aperture: 0.0025,
            maxblur: 1,
        }))
    }

    public addPass(pass: Pass): void {
        this.composer.addPass(pass);
    }

    public removePass(index: number, pass: Pass): void {
        this.composer.removePass(pass);
    }

    public getPasses(): Pass[] {
        return this.composer.passes;
    }

    public removePasses(): void {
        this.composer.passes.splice(1, this.composer.passes.length);
    }

    public update (): void {
        if (this.composer.passes[1]) { // need proper checks
        (this.composer.passes[1] as BokehPass).materialBokeh.uniforms['focus'].value = this.camera.userData.focusLength;
        }
    }
}