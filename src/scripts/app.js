import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

window.addEventListener('DOMContentLoaded', () => {
  const app = new App3();
}, false);

class App3 {
  static get CAMERA_PARAM() {
    return {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 50.0,
      x: 0.0,
      y: 0.0,
      z: 11.0,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }

  static get RENDERER_PARAM() {
    return {
      clearColor: 0x212121,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff,
      intensity: 1.0, 
      x: 0,
      y: 0,
      z: 5.0
    };
  }

  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: 0xffffff,
      intensity: 0.2,
    };
  }

  static get MATERIAL_PARAM() {
    return {
      color: 0xab987a,
      roughness: 0.45,
    };
  }

  static get ANIMATION_PARAM() {
    return {
      time: 0,
      duration: 1.0,
      step: 0.02,
    };
  }

  constructor() {
    this.renderer;
    this.scene;
    this.camera;
    this.directionalLight;
    this.ambientLight;
    this.material;
    this.controls;
    this.boxArray;
    this.initialPositions;

    this.$webgl = document.querySelector('[data-webgl]');
    this.$sphereBtn = document.querySelector('[data-sphere]');
    this.$resetBtn = document.querySelector('[data-reset]');

    this.render = this.render.bind(this);

    this.init();
    this.render();
    this.onClick();
    this.onResize();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor));
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height);
    this.$webgl.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      App3.CAMERA_PARAM.fovy,
      App3.CAMERA_PARAM.aspect,
      App3.CAMERA_PARAM.near,
      App3.CAMERA_PARAM.far,
    );
    this.camera.position.set(
      App3.CAMERA_PARAM.x,
      App3.CAMERA_PARAM.y,
      App3.CAMERA_PARAM.z,
    );
    this.camera.lookAt(App3.CAMERA_PARAM.lookAt);

    this.directionalLight = new THREE.DirectionalLight(
      App3.DIRECTIONAL_LIGHT_PARAM.color,
      App3.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.set(
      App3.DIRECTIONAL_LIGHT_PARAM.x,
      App3.DIRECTIONAL_LIGHT_PARAM.y,
      App3.DIRECTIONAL_LIGHT_PARAM.z,
    );
    this.scene.add(this.directionalLight);

    this.ambientLight = new THREE.AmbientLight(
      App3.AMBIENT_LIGHT_PARAM.color,
      App3.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);

    this.material = new THREE.MeshStandardMaterial(App3.MATERIAL_PARAM);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.createBox();
  }

  render() {
    requestAnimationFrame(this.render);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  createBox() {
    const BOX_COUNT = 100;
    const TRANSFORM_SCALE = 5.0;
    this.boxArray = [];
    for (let i = 0; i < BOX_COUNT; ++i) {
      const width = Math.random() * 1.5 + 0.1;
      const height = Math.random() * 1.5 + 0.1;
      const depth = Math.random() * 1.5 + 0.1;
      const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), this.material);
      box.position.x = (Math.random() * 4.0 - 2.0) * TRANSFORM_SCALE;
      box.position.y = (Math.random() * 4.0 - 2.0) * TRANSFORM_SCALE;
      box.position.z = (Math.random() * 2.0 - 1.0) * TRANSFORM_SCALE;
      this.scene.add(box);
      this.boxArray.push(box);
    }
    this.initialPositions = this.boxArray.map((box) => box.position.clone());
  }

  sphere() {
    const radius = 5;
    const boxCount = this.boxArray.length;
    let animationTime = App3.ANIMATION_PARAM.time;

    const animateSphere = () => {
      const duration = App3.ANIMATION_PARAM.duration;
      animationTime += App3.ANIMATION_PARAM.step;
      if (animationTime > duration) animationTime = duration
      this.boxArray.forEach((box, index) => {
        const phi = Math.acos(-1 + (2 * index) / boxCount); 
        const theta = Math.sqrt(boxCount * Math.PI) * phi;
        const x = Math.cos(theta) * Math.sin(phi) * radius;
        const y = Math.sin(theta) * Math.sin(phi) * radius;
        const z = Math.cos(phi) * radius;
        const targetPosition = new THREE.Vector3(x, y, z);
        const currentPosition = box.position.clone();
        const newPosition = currentPosition.lerp(targetPosition, animationTime);
        box.position.copy(newPosition);
      });
      if (animationTime < duration) requestAnimationFrame(animateSphere);
    };
    animateSphere();
  }

  reset() {
    const duration = App3.ANIMATION_PARAM.duration;
    let resetTime = App3.ANIMATION_PARAM.time;

    const animateReset = () => {
      resetTime += App3.ANIMATION_PARAM.step;
      if (resetTime > duration) resetTime = duration;
      this.boxArray.forEach((box) => {
        const initialPosition = this.initialPositions[this.boxArray.indexOf(box)];
        const currentPosition = box.position.clone();
        const targetPosition = initialPosition.clone();
        const newPosition = currentPosition.lerp(targetPosition, resetTime);
        box.position.copy(newPosition);
      });
      if (resetTime < duration) requestAnimationFrame(animateReset);
    };
    animateReset();
  }

  onClick() {
    this.$sphereBtn.addEventListener('click', () => this.sphere());
    this.$resetBtn.addEventListener('click', () => this.reset());
  }

  onResize() {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }
}