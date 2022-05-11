import { WebGLRenderer, Scene, Camera } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export class PostProcessHandler {
    private readonly renderer: WebGLRenderer;
    private readonly renderPass: RenderPass;
    private passes: Pass[] = [];
    public readonly composer: EffectComposer;

    constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
        this.renderer = renderer;
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(scene, camera);
        this.composer.addPass(this.renderPass);
    }

    addPass(pass: Pass): void {
        this.passes.push(pass);
        this.composer.addPass(pass);
    }

    removePass(index: number, pass: Pass): void {
        this.passes.splice(index);
        this.composer.removePass(pass);
    }

    getPasses(): Pass[] {
        return this.passes;
    }

    removePasses(): void {
        this.passes.length = 0;
    }
}