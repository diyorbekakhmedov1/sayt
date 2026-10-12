import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AiOrb3DProps {
  className?: string;
  isThinking?: boolean;
  isSpeaking?: boolean;
  size?: number;
}

export const AiOrb3D: React.FC<AiOrb3DProps> = ({
  className = '',
  isThinking = false,
  isSpeaking = false,
  size = 380,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for mouse interaction
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // Inner Core Sphere with custom wireframe/geometric look
    const coreGeometry = new THREE.IcosahedronGeometry(1.2, 16);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6, // electric violet
      emissive: 0x4c1d95,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    orbGroup.add(coreMesh);

    // Outer Translucent Shield / Aura
    const shieldGeometry = new THREE.SphereGeometry(1.4, 32, 32);
    const shieldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4, // bright cyan
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      wireframe: true,
    });
    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    orbGroup.add(shieldMesh);

    // Particle Swarm Ring around the Orb
    const particleCount = 220;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.6 + Math.random() * 0.7;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Cyan to Violet gradient
      const isViolet = Math.random() > 0.5;
      colors[i * 3] = isViolet ? 0.65 : 0.02;
      colors[i * 3 + 1] = isViolet ? 0.36 : 0.71;
      colors[i * 3 + 2] = isViolet ? 0.96 : 0.83;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    orbGroup.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xa855f7, 4, 10);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 4, 10);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Pointer Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 1.5;
      targetRotationX = y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer tracking
      orbGroup.rotation.y += (targetRotationY - orbGroup.rotation.y) * 0.05;
      orbGroup.rotation.x += (targetRotationX - orbGroup.rotation.x) * 0.05;

      // Base rotation
      coreMesh.rotation.y = elapsedTime * 0.4;
      coreMesh.rotation.x = elapsedTime * 0.2;

      shieldMesh.rotation.y = -elapsedTime * 0.25;
      shieldMesh.rotation.z = elapsedTime * 0.15;

      particles.rotation.y = elapsedTime * 0.15;
      particles.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;

      // Dynamic pulsation
      const pulseSpeed = isThinking ? 5 : isSpeaking ? 3.5 : 1.5;
      const pulseScale = 1 + Math.sin(elapsedTime * pulseSpeed) * (isThinking ? 0.08 : 0.03);
      coreMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // Color intensity dynamics
      if (isThinking) {
        coreMaterial.emissiveIntensity = 0.9 + Math.sin(elapsedTime * 8) * 0.3;
      } else if (isSpeaking) {
        coreMaterial.emissiveIntensity = 0.7 + Math.sin(elapsedTime * 5) * 0.2;
      } else {
        coreMaterial.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 2) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      coreGeometry.dispose();
      shieldGeometry.dispose();
      particleGeometry.dispose();
      container.innerHTML = '';
    };
  }, [size, isThinking, isSpeaking]);

  if (!hasWebGL) {
    // Elegant CSS-based fallback orb
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 blur-2xl opacity-60 animate-pulse" />
        <div className="absolute w-44 h-44 rounded-full border border-cyan-400/40 bg-gradient-to-br from-indigo-900/80 to-slate-950/90 shadow-[0_0_50px_rgba(139,92,246,0.5)] flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-violet-500/30 blur-md animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background ambient radial glow */}
      <div 
        className="absolute rounded-full pointer-events-none blur-3xl transition-all duration-700 opacity-60"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: isThinking 
            ? 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(6,182,212,0.3) 60%, transparent 80%)'
            : isSpeaking
            ? 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(139,92,246,0.3) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(6,182,212,0.2) 60%, transparent 80%)'
        }}
      />
      
      {/* Three.js Container */}
      <div ref={containerRef} style={{ width: size, height: size }} className="relative z-10 cursor-pointer" />
    </div>
  );
};
