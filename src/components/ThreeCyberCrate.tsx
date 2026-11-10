import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SummonCrateType } from '../types/game';

interface ThreeCyberCrateProps {
  stage: 'SCANNING' | 'OVERLOAD' | 'BURST' | 'FINISHED';
  crateType: SummonCrateType;
  hasGodly: boolean;
  hasMythic: boolean;
  scanProgress: number; // 0 to 100
}

export const ThreeCyberCrate: React.FC<ThreeCyberCrateProps> = ({
  stage,
  crateType,
  hasGodly,
  hasMythic,
  scanProgress,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const stateRef = useRef({ stage, crateType, hasGodly, hasMythic, scanProgress });
  stateRef.current = { stage, crateType, hasGodly, hasMythic, scanProgress };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL / support safely
    let isSoftwareGl = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let frameId = 0;

    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) || '');
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);

      // 1. Scene, Camera, Renderer
      const width = container.clientWidth || 420;
      const height = container.clientHeight || 360;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020617, 0.035);

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 2.3, 5.0);
      camera.lookAt(0, 0.75, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.replaceChildren(renderer.domElement);

      // Colors setup
      const primaryHex = hasGodly ? 0x38bdf8 : crateType === 'MYTHIC_CRATE' || hasMythic ? 0xef4444 : 0x00e5ff;
      const secondaryHex = hasGodly ? 0x1e3a8a : crateType === 'MYTHIC_CRATE' || hasMythic ? 0xf59e0b : 0x3b82f6;

      // 2. Lighting
      const ambient = new THREE.AmbientLight(0x0f172a, 1.8);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
      keyLight.position.set(3, 6, 4);
      keyLight.castShadow = !isSoftwareGl;
      scene.add(keyLight);

      const rimLightL = new THREE.PointLight(primaryHex, 6, 10);
      rimLightL.position.set(-3, 2, -2);
      scene.add(rimLightL);

      const rimLightR = new THREE.PointLight(secondaryHex, 6, 10);
      rimLightR.position.set(3, 1.5, 2);
      scene.add(rimLightR);

      // Interior Core Point Light (inside the hollow chest)
      const coreLight = new THREE.PointLight(primaryHex, 4, 8);
      coreLight.position.set(0, 0.6, 0);
      scene.add(coreLight);

      // 3. Ground Synthwave Grid & Pedestal
      const grid = new THREE.GridHelper(16, 20, primaryHex, 0x1e293b);
      grid.position.y = -0.01;
      scene.add(grid);

      // Pedestal
      const pedGeo = new THREE.CylinderGeometry(1.5, 1.7, 0.12, 16);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.9,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.y = -0.06;
      scene.add(pedMesh);

      // Pedestal Glowing Rim
      const pedRimGeo = new THREE.TorusGeometry(1.55, 0.02, 12, 36);
      const pedRimMat = new THREE.MeshBasicMaterial({ color: primaryHex });
      const pedRim = new THREE.Mesh(pedRimGeo, pedRimMat);
      pedRim.rotation.x = Math.PI / 2;
      pedRim.position.y = 0.002;
      scene.add(pedRim);

      // 4. THE PROCEDURAL HOLLOW 3D CYBER CHEST
      const crateRoot = new THREE.Group();
      scene.add(crateRoot);

      // Materials
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.22,
        side: THREE.DoubleSide,
      });

      const innerWallMat = new THREE.MeshStandardMaterial({
        color: 0x020617,
        metalness: 0.95,
        roughness: 0.1,
        side: THREE.DoubleSide,
      });

      const armorMat = new THREE.MeshStandardMaterial({
        color: hasGodly ? 0x172554 : crateType === 'MYTHIC_CRATE' ? 0x450a0a : 0x1e293b,
        metalness: 0.92,
        roughness: 0.18,
        side: THREE.DoubleSide,
      });

      const neonMat = new THREE.MeshBasicMaterial({
        color: primaryHex,
        side: THREE.DoubleSide,
      });

      const goldTrimMat = new THREE.MeshStandardMaterial({
        color: hasGodly ? 0x60a5fa : crateType === 'MYTHIC_CRATE' ? 0xf59e0b : 0x06b6d4,
        metalness: 0.9,
        roughness: 0.15,
        side: THREE.DoubleSide,
      });

      const crateW = 1.6;
      const crateH = 0.95;
      const crateD = 1.25;
      const wallThick = 0.08;

      // A. Hollow Base Hull (Floor + 4 Walls)
      const baseGroup = new THREE.Group();

      // Bottom Floor
      const floorGeo = new THREE.BoxGeometry(crateW, wallThick, crateD);
      const floorMesh = new THREE.Mesh(floorGeo, chassisMat);
      floorMesh.position.y = wallThick / 2;
      baseGroup.add(floorMesh);

      // Glowing Interior Reactor Floor Plate
      const innerGlowFloorGeo = new THREE.BoxGeometry(crateW - 0.2, 0.02, crateD - 0.2);
      const innerGlowFloor = new THREE.Mesh(innerGlowFloorGeo, neonMat);
      innerGlowFloor.position.y = wallThick + 0.01;
      baseGroup.add(innerGlowFloor);

      // Front Wall
      const frontWallGeo = new THREE.BoxGeometry(crateW, crateH, wallThick);
      const frontWall = new THREE.Mesh(frontWallGeo, chassisMat);
      frontWall.position.set(0, crateH / 2, crateD / 2 - wallThick / 2);
      baseGroup.add(frontWall);

      // Back Wall
      const backWallGeo = new THREE.BoxGeometry(crateW, crateH, wallThick);
      const backWall = new THREE.Mesh(backWallGeo, innerWallMat);
      backWall.position.set(0, crateH / 2, -crateD / 2 + wallThick / 2);
      baseGroup.add(backWall);

      // Left Wall
      const leftWallGeo = new THREE.BoxGeometry(wallThick, crateH, crateD - wallThick * 2);
      const leftWall = new THREE.Mesh(leftWallGeo, chassisMat);
      leftWall.position.set(-crateW / 2 + wallThick / 2, crateH / 2, 0);
      baseGroup.add(leftWall);

      // Right Wall
      const rightWallGeo = new THREE.BoxGeometry(wallThick, crateH, crateD - wallThick * 2);
      const rightWall = new THREE.Mesh(rightWallGeo, chassisMat);
      rightWall.position.set(crateW / 2 - wallThick / 2, crateH / 2, 0);
      baseGroup.add(rightWall);

      // Exterior Vent Conduits (Front & Sides)
      const ventGeo = new THREE.BoxGeometry(crateW * 0.7, 0.05, 0.03);
      const vent1 = new THREE.Mesh(ventGeo, neonMat);
      vent1.position.set(0, crateH * 0.4, crateD / 2 + 0.01);
      baseGroup.add(vent1);

      const vent2 = new THREE.Mesh(ventGeo, neonMat);
      vent2.position.set(0, crateH * 0.65, crateD / 2 + 0.01);
      baseGroup.add(vent2);

      // 4 Heavy Armored Corner Pillars
      const pillarGeo = new THREE.BoxGeometry(0.18, crateH + 0.04, 0.18);
      const corners = [
        [-crateW / 2, crateD / 2],
        [crateW / 2, crateD / 2],
        [-crateW / 2, -crateD / 2],
        [crateW / 2, -crateD / 2],
      ];
      corners.forEach(([cx, cz]) => {
        const pillar = new THREE.Mesh(pillarGeo, armorMat);
        pillar.position.set(cx, (crateH + 0.04) / 2, cz);
        baseGroup.add(pillar);

        const neonCap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.2), neonMat);
        neonCap.position.set(cx, 0.08, cz);
        baseGroup.add(neonCap);
      });

      // Front Locking Latch Dial
      const latchGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16);
      const latch = new THREE.Mesh(latchGeo, goldTrimMat);
      latch.rotation.x = Math.PI / 2;
      latch.position.set(0, crateH * 0.65, crateD / 2 + 0.04);
      baseGroup.add(latch);

      const latchCore = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 16), neonMat);
      latchCore.rotation.x = Math.PI / 2;
      latchCore.position.set(0, crateH * 0.65, crateD / 2 + 0.04);
      baseGroup.add(latchCore);

      crateRoot.add(baseGroup);

      // B. Openable Kinetic Lid (Hinged at top-rear edge: y = crateH, z = -crateD/2)
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, crateH, -crateD / 2);

      const lidH = 0.25;
      const lidGroup = new THREE.Group();

      // Lid Top Roof
      const lidRoofGeo = new THREE.BoxGeometry(crateW + 0.06, wallThick, crateD + 0.06);
      const lidRoof = new THREE.Mesh(lidRoofGeo, chassisMat);
      lidRoof.position.set(0, lidH - wallThick / 2, crateD / 2);
      lidGroup.add(lidRoof);

      // Lid Front Lip
      const frontLipGeo = new THREE.BoxGeometry(crateW + 0.06, lidH, wallThick);
      const frontLip = new THREE.Mesh(frontLipGeo, chassisMat);
      frontLip.position.set(0, lidH / 2, crateD + 0.03 - wallThick / 2);
      lidGroup.add(frontLip);

      // Lid Left & Right Lips
      const sideLipGeo = new THREE.BoxGeometry(wallThick, lidH, crateD);
      const leftLip = new THREE.Mesh(sideLipGeo, chassisMat);
      leftLip.position.set(-crateW / 2 - 0.03 + wallThick / 2, lidH / 2, crateD / 2);
      lidGroup.add(leftLip);

      const rightLip = new THREE.Mesh(sideLipGeo, chassisMat);
      rightLip.position.set(crateW / 2 + 0.03 - wallThick / 2, lidH / 2, crateD / 2);
      lidGroup.add(rightLip);

      // Lid Crown Plate & Neon Crest
      const crownGeo = new THREE.BoxGeometry(crateW * 0.65, 0.05, crateD * 0.65);
      const crown = new THREE.Mesh(crownGeo, armorMat);
      crown.position.set(0, lidH + 0.03, crateD / 2);
      lidGroup.add(crown);

      // Neon Cross on Top
      const crossA = new THREE.Mesh(new THREE.BoxGeometry(crateW * 0.55, 0.03, 0.06), neonMat);
      crossA.position.set(0, lidH + 0.06, crateD / 2);
      lidGroup.add(crossA);

      const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, crateD * 0.55), neonMat);
      crossB.position.set(0, lidH + 0.06, crateD / 2);
      lidGroup.add(crossB);

      lidPivot.add(lidGroup);
      crateRoot.add(lidPivot);

      // C. Ascending Quantum Relic / Core
      const coreGroup = new THREE.Group();
      coreGroup.position.set(0, 0.45, 0); // resting safely inside hollow chest

      // Crystal Gem
      const crystalGeo = new THREE.DodecahedronGeometry(0.28, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: primaryHex,
        emissive: primaryHex,
        emissiveIntensity: 2.2,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      coreGroup.add(crystal);

      // Orbiting Wireframe Diamond Cage
      const cageGeo = new THREE.OctahedronGeometry(0.42, 0);
      const cageMat = new THREE.MeshBasicMaterial({
        color: secondaryHex,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const cage = new THREE.Mesh(cageGeo, cageMat);
      coreGroup.add(cage);

      // Radiant Laser Pillar (starts invisible, shoots up when burst happens)
      const beamGeo = new THREE.CylinderGeometry(0.22, 0.4, 5.5, 20, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: primaryHex,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 2.75;
      coreGroup.add(beam);

      crateRoot.add(coreGroup);

      // D. Orbiting Holographic Rings
      const ring1Geo = new THREE.TorusGeometry(1.6, 0.018, 12, 40);
      const ring1Mat = new THREE.MeshBasicMaterial({ color: primaryHex, transparent: true, opacity: 0.5 });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = crateH * 0.6;
      scene.add(ring1);

      const ring2Geo = new THREE.TorusGeometry(1.85, 0.014, 12, 40);
      const ring2Mat = new THREE.MeshBasicMaterial({ color: secondaryHex, transparent: true, opacity: 0.4 });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.x = Math.PI / 3;
      ring2.position.y = crateH * 0.6;
      scene.add(ring2);

      // E. Floating Cyber Particle Embers
      const pCount = 90;
      const pGeo = new THREE.BufferGeometry();
      const pPositions = new Float32Array(pCount * 3);
      const pVelocities = new Float32Array(pCount * 3);

      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = 0.7 + Math.random() * 2.0;
        pPositions[i * 3 + 0] = Math.cos(theta) * radius;
        pPositions[i * 3 + 1] = Math.random() * 2.5;
        pPositions[i * 3 + 2] = Math.sin(theta) * radius;

        pVelocities[i * 3 + 0] = (Math.random() - 0.5) * 0.008;
        pVelocities[i * 3 + 1] = Math.random() * 0.015 + 0.004;
        pVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

      const pMat = new THREE.PointsMaterial({
        size: 0.07,
        color: primaryHex,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // 5. Interactive Pointer Movement
      let pointerX = 0;
      let pointerY = 0;
      const onMove = (e: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          pointerX = ((clientX - rect.left) / rect.width) * 2 - 1;
          pointerY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        }
      };

      container.addEventListener('mousemove', onMove);
      container.addEventListener('touchmove', onMove, { passive: true });

      // 6. Animation Loop
      const clock = new THREE.Clock();
      let currentLidAngle = 0;
      let currentCoreY = 0.45;
      let currentBeamOpacity = 0;

      const animate = () => {
        frameId = requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.08);
        const elapsed = clock.getElapsedTime();
        const current = stateRef.current;

        // Dynamic Colors update if status changes
        const activeColor = current.hasGodly
          ? 0x38bdf8
          : current.crateType === 'MYTHIC_CRATE' || current.hasMythic
          ? 0xef4444
          : 0x00e5ff;
        neonMat.color.setHex(activeColor);
        coreLight.color.setHex(activeColor);
        beamMat.color.setHex(activeColor);
        pMat.color.setHex(activeColor);

        // Stages Behavior
        let targetLid = 0;
        let targetCoreY = 0.45;
        let targetBeam = 0;

        if (current.stage === 'SCANNING') {
          targetLid = 0;
          targetCoreY = 0.45;
          targetBeam = 0;
          coreLight.intensity = 3 + (current.scanProgress / 100) * 3;
          crateRoot.position.y = Math.sin(elapsed * 2) * 0.025;
          crateRoot.position.x = 0;
          crateRoot.position.z = 0;
          crateRoot.rotation.z = 0;
          crateRoot.rotation.y = Math.sin(elapsed * 0.8) * 0.06 + pointerX * 0.2;
          crateRoot.rotation.x = pointerY * 0.1;
        } else if (current.stage === 'OVERLOAD') {
          // Intense vibration & slight lid crack
          targetLid = -0.18 + (Math.random() - 0.5) * 0.08; // slightly open
          targetCoreY = 0.55;
          targetBeam = 0.35 + Math.random() * 0.2;
          coreLight.intensity = 10 + Math.random() * 6;
          crateRoot.position.x = (Math.random() - 0.5) * 0.05;
          crateRoot.position.z = (Math.random() - 0.5) * 0.05;
          crateRoot.rotation.z = (Math.random() - 0.5) * 0.03;
          crateRoot.rotation.x = pointerY * 0.1;
        } else if (current.stage === 'BURST' || current.stage === 'FINISHED') {
          // Lid opens back smoothly (-105 degrees = -1.83 rad)
          targetLid = -1.85;
          // Core elevates out of the hollow chest!
          targetCoreY = 1.35;
          targetBeam = 0.9;
          coreLight.intensity = 16;
          crateRoot.position.x = 0;
          crateRoot.position.z = 0;
          crateRoot.rotation.z = 0;
          crateRoot.rotation.x = 0;
          crateRoot.rotation.y = elapsed * 0.5;
        }

        // Kinematic smooth damping
        currentLidAngle = THREE.MathUtils.damp(currentLidAngle, targetLid, 9, delta);
        lidPivot.rotation.x = currentLidAngle;

        currentCoreY = THREE.MathUtils.damp(currentCoreY, targetCoreY, 7, delta);
        coreGroup.position.y = currentCoreY;

        currentBeamOpacity = THREE.MathUtils.damp(currentBeamOpacity, targetBeam, 7, delta);
        beamMat.opacity = currentBeamOpacity;

        // Core continuous rotation
        crystal.rotation.x += delta * 1.8;
        crystal.rotation.y += delta * 2.5;
        cage.rotation.y -= delta * 1.2;
        cage.rotation.z += delta * 0.8;

        // Rings rotation
        ring1.rotation.z += delta * 0.5;
        ring2.rotation.y += delta * 0.8;

        // Particles flow
        const posArray = pGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < pCount; i++) {
          posArray[i * 3 + 1] += pVelocities[i * 3 + 1] * (current.stage === 'BURST' ? 3.5 : 1);
          posArray[i * 3 + 0] += pVelocities[i * 3 + 0];
          posArray[i * 3 + 2] += pVelocities[i * 3 + 2];

          if (posArray[i * 3 + 1] > 3.8) {
            posArray[i * 3 + 1] = 0.1;
            const theta = Math.random() * Math.PI * 2;
            const r = 0.6 + Math.random() * 1.8;
            posArray[i * 3 + 0] = Math.cos(theta) * r;
            posArray[i * 3 + 2] = Math.sin(theta) * r;
          }
        }
        pGeo.attributes.position.needsUpdate = true;

        // Camera gentle drift
        if (current.stage === 'BURST') {
          camera.position.z = THREE.MathUtils.damp(camera.position.z, 5.8, 3, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.6, 3, delta);
        } else {
          camera.position.z = THREE.MathUtils.damp(camera.position.z, 5.0, 4, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.2, 4, delta);
        }
        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      frameId = requestAnimationFrame(animate);

      // 7. Resize Observer
      const onResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      const ro = new ResizeObserver(onResize);
      ro.observe(container);

      // Cleanup
      return () => {
        cancelAnimationFrame(frameId);
        ro.disconnect();
        container.removeEventListener('mousemove', onMove);
        container.removeEventListener('touchmove', onMove);

        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        renderer?.dispose();
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.warn('ThreeCyberCrate WebGL init error, using fallback:', err);
      setWebGlSupported(false);
    }
  }, [hasGodly, hasMythic, crateType]);

  // Fallback if browser/context cannot load WebGL
  if (!webGlSupported) {
    return (
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <div
          className={`w-48 h-48 rounded-3xl border-4 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
            stage === 'BURST'
              ? 'scale-125 border-amber-400 bg-amber-950/80 shadow-amber-500/60'
              : stage === 'OVERLOAD'
              ? 'scale-105 border-red-500 bg-red-950/80 shadow-red-500/60 animate-bounce'
              : 'border-cyan-400 bg-slate-900/90 shadow-cyan-500/40'
          }`}
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/60 animate-spin flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,1)]" />
          </div>
          <span className="text-xs font-mono font-black text-white mt-3 uppercase tracking-wider">
            {stage === 'BURST' ? '⚡ AÇILDI!' : stage === 'OVERLOAD' ? '⚠️ YÜKLENİYOR...' : '🔒 KİLİTLİ'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
    />
  );
};
