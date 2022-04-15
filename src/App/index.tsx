import React, { useRef, useEffect } from 'react';
import styles from './index.module.scss';
import {
  Mesh, Scene, ShaderMaterial, WebGLRenderer, Clock,
  PerspectiveCamera, IcosahedronGeometry, Vector2, AdditiveBlending,
} from 'three';
import fragment from './shader/fragment.frag';
import vertex from './shader/vertex.vert';
import gsap from 'gsap';

const ScrollMark = () =>{

  return <div className={styles.mark}>
    <p>Scroll</p>
  </div>
}

class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private timer = 0;
  private renderer: WebGLRenderer;
  private clock = new Clock();
  private material: ShaderMaterial;
  private mouse = new Vector2();
  constructor(container: HTMLDivElement) {
    const { offsetWidth: width, offsetHeight: height } = container;
    this.renderer = new WebGLRenderer();
    this.renderer.setClearColor(0x222222);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(width, height);
    container.append(this.renderer.domElement);

    this.camera = new PerspectiveCamera(75, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 2.5);
    this.camera.lookAt(0, 0, 0);
    this.scene = new Scene();

    const geometry = new IcosahedronGeometry(1, 64);
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFrequency: { value: 1 },
        uAmplitude: { value: 1 },
        uDensity: { value: 1 },
        uStrength: { value: 1 },
      },
      wireframe: true,
      blending: AdditiveBlending,
      vertexShader: vertex,
      fragmentShader: fragment,
    })
    const mesh = new Mesh(geometry, this.material);
    this.scene.add(mesh);

    gsap.defaults({
      ease: 'power2',
      duration: 1,
      overwrite: true
    })
  }
  public draw = () => {
    const time = this.clock.getElapsedTime();
    this.material.uniforms.uTime.value = time;
    this.renderer.render(this.scene, this.camera);

    this.timer = requestAnimationFrame(this.draw);
  }
  public move = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    this.mouse.x = (clientX / this.renderer.domElement.clientWidth) * 4;
    this.mouse.y = (clientY / this.renderer.domElement.clientHeight) * 2;

    gsap.to(this.material.uniforms.uFrequency, { value: this.mouse.x })
    gsap.to(this.material.uniforms.uAmplitude, { value: this.mouse.x })
    gsap.to(this.material.uniforms.uDensity, { value: this.mouse.y })
    gsap.to(this.material.uniforms.uStrength, { value: this.mouse.y })
  }
  public scroll = (value: number) => {
    gsap.to(this.material.uniforms.uDensity, { value: Math.max(value / 500, 0.1) })
  }
  public dispose = () => {
    cancelAnimationFrame(this.timer);
  }
}

export const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  const refWorld = useRef<World>();
  useEffect(() => {
    if (!ref.current) { return }
    const container = ref.current;
    refWorld.current = new World(container);
    refWorld.current.draw();
    return () => refWorld.current?.dispose();
  }, [ref])

  const scroll = (e: React.UIEvent<HTMLDivElement>) => {
    refWorld.current?.scroll(e.currentTarget.scrollTop);
  }

  return <div
    className={styles.main}
    onScroll={scroll}
    onMouseMove={e => refWorld.current?.move(e)}
  >
    <div
      ref={ref}
      className={styles.container}
    />
    <ScrollMark />
    <section className={styles.section} />
    <section className={styles.section} />
    <section className={styles.section} />
  </div>
}