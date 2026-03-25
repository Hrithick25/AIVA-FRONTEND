import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useFaceTracking } from "./useFaceTracking";

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function AvatarBase({ scene, actions, groupRef, facePos }) {
  const placement = useMemo(() => {
    if (!scene) {
      return null;
    }

    scene.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    const hasValidBox =
      Number.isFinite(size.x) &&
      Number.isFinite(size.y) &&
      Number.isFinite(size.z) &&
      size.y > 1e-6;

    if (!hasValidBox) {
      return null;
    }

    const mqTabLarge = window.matchMedia(
      '(min-width: 1024px) and (max-width: 1250px) and (min-height: 1366px) and (max-height: 1950px)'
    );
    const mqTabletPortrait = window.matchMedia(
      '(hover: none) and (pointer: coarse) and (min-width: 700px) and (max-width: 1400px) and (min-height: 900px) and (orientation: portrait)'
    );
    const mqTabletLandscape = window.matchMedia(
      '(hover: none) and (pointer: coarse) and (min-width: 900px) and (max-width: 2200px) and (min-height: 600px) and (orientation: landscape)'
    );

    const isTabLarge = mqTabLarge.matches;
    const isTabletPortrait = mqTabletPortrait.matches;
    const isTabletLandscape = mqTabletLandscape.matches;

    const isTablet = isTabletPortrait || isTabletLandscape;

    const targetHeight = isTabLarge ? 2.58 : (isTablet ? (isTabletLandscape ? 2.0 : 2.15) : 1.75);
    const scale = targetHeight / size.y;

    const innerOffset = new THREE.Vector3(-center.x, -bbox.min.y, -center.z);

    const groupPosition = isTabLarge
      ? [0, -1.6, 0.15]
      : (isTablet
        ? (isTabletLandscape ? [0, -0.95, 0.15] : [0, -1.15, 0.15])
        : [0, -0.85, 0.15]);
    const groupRotation = [0, 0, 0];

    return {
      scale,
      groupPosition,
      groupRotation,
      innerOffset,
    };
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current || !facePos) return;

    const maxYaw = 0.35;
    const maxPitch = 0.18;

    const targetY = clamp(facePos.x * maxYaw, -maxYaw, maxYaw);
    const targetX = clamp(-facePos.y * maxPitch, -maxPitch, maxPitch);

    const lerpFactor = 0.13;  // increased from 0.06 for faster face tracking
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      lerpFactor
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      lerpFactor
    );
  });

  // Fix materials and shadows
  useMemo(() => {
    if (!scene) return;
    scene.traverse((child) => {
      child.frustumCulled = false;
      if (child.isMesh) {
        if (child.isSkinnedMesh && child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.depthWrite = true;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!actions) return;
    const keys = Object.keys(actions);
    if (keys.length === 0) return;

    console.log("[AIVA] Available animations:", keys);

    // Prefer animation with 'idle' in name, or just fallback to the first one available
    let actionName = keys.find(k => k.toLowerCase().includes('idle')) || keys[0];
    const action = actions[actionName];

    if (action) {
      action.reset();
      action.enabled = true;
      action.timeScale = 1;
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.fadeIn(0.5);
      action.play();
    }

    return () => {
      if (action) {
        action.fadeOut(0.5);
      }
    };
  }, [actions]);

  if (!placement) return null;

  return (
    <group
      ref={groupRef}
      position={placement.groupPosition}
      rotation={placement.groupRotation}
      scale={placement.scale}
    >
      <primitive object={scene} position={placement.innerOffset} />
    </group>
  );
}

export function Avatar(props) {
  const group = useRef();
  const facePos = useFaceTracking();
  const { gl } = useThree();

  const { isSpeaking = false, audioVolume = 0 } = props || {};
  const mouthTargetsRef = useRef([]);
  const smileTargetsRef = useRef([]);

  // Only use idle, no thinking or talking models / logic
  const { scene, animations } = useGLTF("/Aiva_girl_idle.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!scene) return;

    const maxAnisotropy = gl?.capabilities?.getMaxAnisotropy
      ? gl.capabilities.getMaxAnisotropy()
      : 1;

    scene.traverse((child) => {
      if (!child || !child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of materials) {
        if (!mat) continue;
        for (const key of [
          'map',
          'normalMap',
          'roughnessMap',
          'metalnessMap',
          'aoMap',
          'emissiveMap',
          'clearcoatMap',
          'clearcoatNormalMap',
          'specularMap',
          'alphaMap'
        ]) {
          const tex = mat[key];
          if (!tex || !tex.isTexture) continue;
          tex.anisotropy = Math.max(tex.anisotropy || 1, maxAnisotropy);
          tex.needsUpdate = true;
        }
        mat.needsUpdate = true;
      }
    });
  }, [scene, gl]);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (!child || !child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of materials) {
        if (!mat) continue;
        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
          mat.envMapIntensity = Math.max(mat.envMapIntensity ?? 1, 1.35);
          if (typeof mat.roughness === 'number') {
            mat.roughness = clamp(mat.roughness, 0.18, 1);
          }
          if (typeof mat.metalness === 'number') {
            mat.metalness = clamp(mat.metalness, 0, 0.85);
          }
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!scene) return;
    const candidates = [];
    const smileCandidates = [];
    scene.traverse((child) => {
      if (!child || !child.isMesh) return;
      if (!child.morphTargetDictionary || !child.morphTargetInfluences) return;

      const dict = child.morphTargetDictionary;
      const keys = Object.keys(dict);
      const smileKeys = keys.filter((k) => /smile|happy|grin/i.test(k));
      const preferred = keys.filter(
        (k) => /jaw|mouth|viseme|open/i.test(k) && !/smile|happy|grin/i.test(k)
      );
      const selected = preferred.length > 0 ? preferred : keys;

      smileKeys.forEach((k) => {
        const idx = dict[k];
        if (typeof idx === "number") {
          smileCandidates.push({ mesh: child, index: idx, name: k });
        }
      });

      selected.forEach((k) => {
        const idx = dict[k];
        if (typeof idx === 'number') {
          candidates.push({ mesh: child, index: idx, name: k });
        }
      });
    });

    // Keep the list small and deterministic
    mouthTargetsRef.current = candidates.slice(0, 8);
    smileTargetsRef.current = smileCandidates.slice(0, 4);
  }, [scene]);

  useFrame(() => {
    const targets = mouthTargetsRef.current;
    if (!targets || targets.length === 0) return;

    const v = Number.isFinite(audioVolume) ? audioVolume : 0;
    const target = isSpeaking ? clamp(v, 0, 1) : 0;

    for (const t of targets) {
      const infl = t.mesh.morphTargetInfluences;
      if (!infl || typeof infl[t.index] !== 'number') continue;
      infl[t.index] = THREE.MathUtils.lerp(infl[t.index], target, 0.45);  // was 0.25
    }

    const smileTargets = smileTargetsRef.current;
    if (!smileTargets || smileTargets.length === 0) return;

    const idleSmile = 0.12;
    const smileTarget = isSpeaking ? 0 : idleSmile;

    for (const t of smileTargets) {
      const infl = t.mesh.morphTargetInfluences;
      if (!infl || typeof infl[t.index] !== "number") continue;
      infl[t.index] = THREE.MathUtils.lerp(infl[t.index], smileTarget, 0.08);
    }
  });

  return (
    <AvatarBase
      scene={scene}
      actions={actions}
      groupRef={group}
      facePos={facePos}
    />
  );
}

useGLTF.preload("/Aiva_girl_idle.glb");