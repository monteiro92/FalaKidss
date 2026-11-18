import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ANATOMY_PARTS,
  AnatomyPartId,
  CameraPresetId,
  sampleCharArticulation,
} from '../data/vocalTractData';

interface Mouth3DCanvasProps {
  activePhraseText: string;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedPart: AnatomyPartId;
  cameraPreset: CameraPresetId;
  onSelectPart: (part: AnatomyPartId) => void;
  onSelectCameraPreset: (preset: CameraPresetId) => void;
  onPhasePulse?: (phaseLabel: string) => void;
  onActivePartsChange?: (parts: AnatomyPartId[]) => void;
}

const CAMERA_PRESETS: Record<
  CameraPresetId,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  frontal: { pos: [0, 0.15, 6.2], target: [0, -0.15, -0.05] },
  lateral: { pos: [-5.9, 0.15, 0.15], target: [0, -0.2, -0.2] },
  'tres-quartos': { pos: [-3.9, 0.65, 5.0], target: [-0.05, -0.2, -0.15] },
};

const _emissiveHighlight = new THREE.Color('#38BDF8');
const _emissiveZero = new THREE.Color('#000000');

export const Mouth3DCanvas: React.FC<Mouth3DCanvasProps> = React.memo(({
  activePhraseText,
  isPlaying,
  playbackSpeed,
  selectedPart,
  cameraPreset,
  onSelectPart,
  onSelectCameraPreset,
  onPhasePulse,
  onActivePartsChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  const phraseRef = useRef(activePhraseText);
  const playingRef = useRef(isPlaying);
  const speedRef = useRef(playbackSpeed);
  const selectedPartRef = useRef(selectedPart);
  const cameraPresetRef = useRef(cameraPreset);
  const cameraLerpActiveRef = useRef(false);

  const onSelectPartRef = useRef(onSelectPart);
  const onPhasePulseRef = useRef(onPhasePulse);
  const onActivePartsRef = useRef(onActivePartsChange);

  useEffect(() => {
    phraseRef.current = activePhraseText;
  }, [activePhraseText]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    selectedPartRef.current = selectedPart;
  }, [selectedPart]);

  useEffect(() => {
    cameraPresetRef.current = cameraPreset;
    cameraLerpActiveRef.current = true;
  }, [cameraPreset]);

  useEffect(() => {
    onSelectPartRef.current = onSelectPart;
  }, [onSelectPart]);

  useEffect(() => {
    onPhasePulseRef.current = onPhasePulse;
  }, [onPhasePulse]);

  useEffect(() => {
    onActivePartsRef.current = onActivePartsChange;
  }, [onActivePartsChange]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EEF4FF');
    scene.fog = new THREE.Fog('#EEF4FF', 10, 24);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 45);
    const initialCam = CAMERA_PRESETS[cameraPresetRef.current];
    camera.position.set(...initialCam.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = 'none';

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialCam.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 10.5;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI - 0.35;
    controls.update();

    controls.addEventListener('start', () => {
      cameraLerpActiveRef.current = false;
    });

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    // 3-point warm/cool studio rig
    const hemi = new THREE.HemisphereLight('#FFFFFF', '#DBEAFE', 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#FFF7ED', 1.65);
    keyLight.position.set(-3.5, 4.5, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 18;
    const d = 3.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#BAE6FD', 0.85);
    rimLight.position.set(4.5, 2.0, -3.5);
    scene.add(rimLight);

    // Root anatomical vocal tract assembly
    const tractGroup = new THREE.Group();
    tractGroup.position.set(0, 0.18, 0);
    scene.add(tractGroup);

    // Materials (cloned/distinct per clickable structure for individual highlight)
    const lipMat = new THREE.MeshPhysicalMaterial({
      color: '#F45D78',
      roughness: 0.34,
      metalness: 0.0,
      clearcoat: 0.38,
      clearcoatRoughness: 0.25,
    });
    const toothMat = new THREE.MeshPhysicalMaterial({
      color: '#FFFFFF',
      roughness: 0.18,
      metalness: 0.0,
      clearcoat: 0.55,
    });
    const tongueMat = new THREE.MeshPhysicalMaterial({
      color: '#F472B6',
      roughness: 0.4,
      metalness: 0.0,
      clearcoat: 0.42,
      clearcoatRoughness: 0.22,
    });
    const hardPalateMat = new THREE.MeshStandardMaterial({
      color: '#FCDCE4',
      roughness: 0.55,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const softPalateMat = new THREE.MeshStandardMaterial({
      color: '#F472B6',
      roughness: 0.48,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const mandibleMat = new THREE.MeshPhysicalMaterial({
      color: '#F8FAFC',
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.3,
    });
    const pharynxMat = new THREE.MeshStandardMaterial({
      color: '#FDBA74',
      roughness: 0.68,
      metalness: 0.0,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide,
    });
    const nasalMat = new THREE.MeshStandardMaterial({
      color: '#BAE6FD',
      roughness: 0.45,
      metalness: 0.0,
      transparent: true,
      opacity: 0.72,
    });
    const larynxMat = new THREE.MeshPhysicalMaterial({
      color: '#7DD3FC',
      roughness: 0.3,
      metalness: 0.05,
      clearcoat: 0.35,
      side: THREE.DoubleSide,
    });
    const vocalFoldMat = new THREE.MeshStandardMaterial({
      color: '#FEF3C7',
      roughness: 0.42,
      metalness: 0.0,
    });

    const clickableMeshes: THREE.Object3D[] = [];
    const partMaterials: Record<AnatomyPartId, THREE.MeshStandardMaterial[]> = {
      labios: [lipMat],
      dentes: [toothMat],
      lingua: [tongueMat],
      palato: [hardPalateMat, softPalateMat],
      mandibula: [mandibleMat],
      faringe: [pharynxMat, nasalMat],
      cordas: [larynxMat, vocalFoldMat],
    };

    const tagPart = (obj: THREE.Object3D, partId: AnatomyPartId) => {
      obj.userData.partId = partId;
      obj.traverse((child) => {
        child.userData.partId = partId;
        if ((child as THREE.Mesh).isMesh) {
          clickableMeshes.push(child);
        }
      });
    };

    // 1. Nasal airway arc (top-front back to pharynx)
    const nasalGroup = new THREE.Group();
    const nasalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.35, 0.78),
      new THREE.Vector3(0, 0.95, 0.96),
      new THREE.Vector3(0, 0.78, 0.2),
      new THREE.Vector3(0, 0.62, -0.75),
    ]);
    const nasalTube = new THREE.Mesh(
      new THREE.TubeGeometry(nasalCurve, 28, 0.065, 12, false),
      nasalMat
    );
    nasalGroup.add(nasalTube);
    tractGroup.add(nasalGroup);

    // 2. Pharynx back wall (translucent curved shield behind mouth/uvula)
    const pharynxWall = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.62, 2.05, 24, 1, true, Math.PI * 0.72, Math.PI * 0.56),
      pharynxMat
    );
    pharynxWall.position.set(0, -0.35, -0.82);
    nasalGroup.add(pharynxWall);
    tagPart(nasalGroup, 'faringe');

    // 3. Hard palate + soft palate + uvula
    const palateGroup = new THREE.Group();
    const hardPalate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.84, 1.05, 24, 1, true, -Math.PI * 0.48, Math.PI * 0.96),
      hardPalateMat
    );
    hardPalate.rotation.x = Math.PI * 0.5;
    hardPalate.scale.set(1.0, 1.0, 0.42);
    hardPalate.position.set(0, 0.44, 0.16);
    palateGroup.add(hardPalate);

    const softPalateCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.58, -0.32),
      new THREE.Vector3(0, 0.5, -0.68),
      new THREE.Vector3(0, 0.32, -0.92),
    ]);
    const softPalate = new THREE.Mesh(
      new THREE.TubeGeometry(softPalateCurve, 16, 0.16, 12, false),
      softPalateMat
    );
    softPalate.scale.set(2.4, 0.55, 1.0);
    palateGroup.add(softPalate);

    const uvula = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.14, 8, 12), softPalateMat);
    uvula.position.set(0, 0.16, -0.92);
    palateGroup.add(uvula);
    tractGroup.add(palateGroup);
    tagPart(palateGroup, 'palato');

    // 4. Upper teeth arch
    const upperTeethGroup = new THREE.Group();
    upperTeethGroup.position.set(0, 0.24, 0.64);
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const offset = i > 0 ? i - 0.5 : i + 0.5;
      const angle = offset * 0.26;
      const tooth = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.09, 6, 12), toothMat);
      tooth.position.set(Math.sin(angle) * 0.58, 0, Math.cos(angle) * 0.32 - 0.18);
      tooth.rotation.y = angle;
      tooth.castShadow = true;
      upperTeethGroup.add(tooth);
    }
    tractGroup.add(upperTeethGroup);
    tagPart(upperTeethGroup, 'dentes');

    // 5. Lower jaw group (Mandible U-bone + Lower teeth + Tongue)
    const lowerJawPivot = new THREE.Group();
    lowerJawPivot.position.set(0, -0.02, -0.55);
    tractGroup.add(lowerJawPivot);

    const lowerJawGroup = new THREE.Group();
    lowerJawGroup.position.set(0, 0.02, 0.55);
    lowerJawPivot.add(lowerJawGroup);

    // Mandible U-shaped bone tube
    const mandibleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.62, 0.1, -0.82),
      new THREE.Vector3(-0.62, -0.42, -0.35),
      new THREE.Vector3(-0.46, -0.45, 0.42),
      new THREE.Vector3(0, -0.44, 0.72),
      new THREE.Vector3(0.46, -0.45, 0.42),
      new THREE.Vector3(0.62, -0.42, -0.35),
      new THREE.Vector3(0.62, 0.1, -0.82),
    ]);
    const mandibleBone = new THREE.Mesh(
      new THREE.TubeGeometry(mandibleCurve, 44, 0.115, 14, false),
      mandibleMat
    );
    mandibleBone.castShadow = true;
    lowerJawGroup.add(mandibleBone);
    tagPart(mandibleBone, 'mandibula');

    // Lower teeth arch
    const lowerTeethGroup = new THREE.Group();
    lowerTeethGroup.position.set(0, -0.2, 0.62);
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const offset = i > 0 ? i - 0.5 : i + 0.5;
      const angle = offset * 0.26;
      const tooth = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.08, 6, 12), toothMat);
      tooth.position.set(Math.sin(angle) * 0.54, 0, Math.cos(angle) * 0.3 - 0.18);
      tooth.rotation.y = angle;
      tooth.castShadow = true;
      lowerTeethGroup.add(tooth);
    }
    lowerJawGroup.add(lowerTeethGroup);
    tagPart(lowerTeethGroup, 'dentes');

    // 6. Articulated 3D Tongue
    const tongueRoot = new THREE.Group();
    tongueRoot.position.set(0, -0.06, -0.05);
    lowerJawGroup.add(tongueRoot);

    const tongueBody = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 22), tongueMat);
    tongueBody.scale.set(0.95, 0.36, 1.38);
    tongueBody.position.set(0, 0, 0.14);
    tongueBody.castShadow = true;
    tongueRoot.add(tongueBody);

    const tongueTipGroup = new THREE.Group();
    tongueTipGroup.position.set(0, 0.01, 0.48);
    tongueRoot.add(tongueTipGroup);

    const tongueTip = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), tongueMat);
    tongueTip.scale.set(1.15, 0.42, 1.28);
    tongueTip.position.set(0, 0, 0.16);
    tongueTip.castShadow = true;
    tongueTipGroup.add(tongueTip);
    tagPart(tongueRoot, 'lingua');

    // 7. Upper & Lower Curved Coral Lips (Tube + end caps updated smoothly)
    const createDynamicLip = (isUpper: boolean) => {
      const grp = new THREE.Group();
      const beads = 13;
      for (let i = 0; i < beads; i++) {
        const t = i / (beads - 1);
        const radius = 0.12 - Math.abs(t - 0.5) * 0.03;
        const seg = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 14), lipMat);
        seg.scale.set(1.35, 0.92, 0.92);
        seg.castShadow = true;
        grp.add(seg);
      }
      grp.userData.isUpper = isUpper;
      tagPart(grp, 'labios');
      return grp;
    };

    const upperLipGroup = createDynamicLip(true);
    const lowerLipGroup = createDynamicLip(false);
    tractGroup.add(upperLipGroup, lowerLipGroup);

    // 8. Larynx, Vocal Cords & Trachea Rings
    const larynxGroup = new THREE.Group();
    larynxGroup.position.set(0, -1.65, -0.78);
    tractGroup.add(larynxGroup);

    const larynxCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.25, 0.42, 24, 1, true),
      larynxMat
    );
    larynxCup.position.y = 0.18;
    larynxGroup.add(larynxCup);

    const leftFold = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.22, 6, 10), vocalFoldMat);
    leftFold.rotation.x = Math.PI * 0.5;
    leftFold.position.set(-0.07, 0.2, 0);
    const rightFold = leftFold.clone();
    rightFold.position.x = 0.07;
    larynxGroup.add(leftFold, rightFold);

    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.048, 12, 24), larynxMat);
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = -0.14 - r * 0.16;
      larynxGroup.add(ring);
    }
    tagPart(larynxGroup, 'cordas');

    // Animation state
    const anim = {
      mouthOpen: 0.35,
      smileWidth: 1.0,
      lipRound: 0.0,
      lipClose: 0.0,
      tongueOut: 0.0,
      tongueX: 0.0,
      tongueY: 0.0,
      tonguePitch: 0.0,
      voiced: 0.0,
    };

    const updateLipPositions = (
      openVal: number,
      smileW: number,
      pucker: number,
      closeVal: number
    ) => {
      const halfWidth = 0.64 * smileW * (1 - pucker * 0.32);
      const effectiveOpen = Math.max(0, openVal * (1 - closeVal * 0.92));
      [upperLipGroup, lowerLipGroup].forEach((grp) => {
        const isUpper = Boolean(grp.userData.isUpper);
        const kids = grp.children;
        const n = kids.length;
        for (let i = 0; i < n; i++) {
          const u = (i / (n - 1)) * 2 - 1;
          const arch = 1 - u * u;
          const x = u * halfWidth;
          const z = 0.72 + arch * (0.28 + pucker * 0.24);
          const y = isUpper
            ? 0.09 + arch * (0.17 + effectiveOpen * 0.1) - closeVal * 0.06
            : -0.09 - effectiveOpen * 0.38 - arch * (0.1 + effectiveOpen * 0.14) + closeVal * 0.06;
          kids[i].position.set(x, y, z);
        }
      });
    };

    updateLipPositions(anim.mouthOpen, anim.smileWidth, anim.lipRound, anim.lipClose);

    // Raycaster for clicking/tapping anatomical structures
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - downPos.x;
      const dy = e.clientY - downPos.y;
      if (Math.hypot(dx, dy) > 6) return; // Dragged camera, not a click

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const hitPart = hits[0].object.userData.partId as AnatomyPartId | undefined;
        if (hitPart) {
          onSelectPartRef.current(hitPart);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let lastPartsKey = '';
    let lastPhaseText = '';
    const clock = new THREE.Clock();
    const _targetCamPos = new THREE.Vector3();
    const _targetControlsTarget = new THREE.Vector3();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    let elapsed = 0;

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const speed = Math.max(0.4, speedRef.current || 1);

      if (playingRef.current) {
        elapsed += delta * speed;
      }

      // Smooth damped camera preset transitions
      if (cameraLerpActiveRef.current) {
        const preset = CAMERA_PRESETS[cameraPresetRef.current];
        _targetCamPos.set(...preset.pos);
        _targetControlsTarget.set(...preset.target);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 7, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 7, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 7, delta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetControlsTarget.x, 7, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetControlsTarget.y, 7, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetControlsTarget.z, 7, delta);

        if (camera.position.distanceTo(_targetCamPos) < 0.03) {
          camera.position.copy(_targetCamPos);
          controls.target.copy(_targetControlsTarget);
          cameraLerpActiveRef.current = false;
        }
      }

      controls.update();

      let targetOpen = 0.24;
      let targetSmile = 1.0;
      let targetRound = 0.0;
      let targetClose = 0.0;
      let targetOut = 0.0;
      let targetTX = 0.0;
      let targetTY = 0.0;
      let targetTPitch = 0.0;
      let targetVoiced = 0.0;
      let phaseText = 'Posição de repouso';
      let activeParts: AnatomyPartId[] = ['labios', 'lingua', 'dentes', 'mandibula'];

      const cleanPhrase = (phraseRef.current || 'Vamos embora!').trim();
      if (playingRef.current && cleanPhrase.length > 0) {
        const charsPerSec = 6.5;
        const charIdx = Math.floor(elapsed * charsPerSec) % cleanPhrase.length;
        const currentChar = cleanPhrase[charIdx];
        const frame = sampleCharArticulation(currentChar);
        targetOpen = frame.mouthOpen;
        targetSmile = frame.smileWidth;
        targetRound = frame.lipRound;
        targetClose = frame.lipClose;
        targetOut = frame.tongueOut;
        targetTX = frame.tongueX;
        targetTY = frame.tongueY;
        targetTPitch = frame.tonguePitch;
        targetVoiced = frame.voiced ? 1 : 0;
        activeParts = frame.activeParts;
        phaseText =
          currentChar === ' '
            ? 'Pausa suave entre palavras'
            : `Articulando som “${currentChar.toUpperCase()}”`;
      }

      const partsKey = activeParts.join(',');
      if (partsKey !== lastPartsKey) {
        lastPartsKey = partsKey;
        onActivePartsRef.current?.(activeParts);
      }

      if (playingRef.current && phaseText !== lastPhaseText) {
        lastPhaseText = phaseText;
        onPhasePulseRef.current?.(phaseText);
      } else if (!playingRef.current && lastPhaseText !== '') {
        lastPhaseText = '';
      }

      const dampSpeed = 11;
      anim.mouthOpen = THREE.MathUtils.damp(anim.mouthOpen, targetOpen, dampSpeed, delta);
      anim.smileWidth = THREE.MathUtils.damp(anim.smileWidth, targetSmile, dampSpeed, delta);
      anim.lipRound = THREE.MathUtils.damp(anim.lipRound, targetRound, dampSpeed, delta);
      anim.lipClose = THREE.MathUtils.damp(anim.lipClose, targetClose, dampSpeed, delta);
      anim.tongueOut = THREE.MathUtils.damp(anim.tongueOut, targetOut, dampSpeed, delta);
      anim.tongueX = THREE.MathUtils.damp(anim.tongueX, targetTX, dampSpeed, delta);
      anim.tongueY = THREE.MathUtils.damp(anim.tongueY, targetTY, dampSpeed, delta);
      anim.tonguePitch = THREE.MathUtils.damp(anim.tonguePitch, targetTPitch, dampSpeed, delta);
      anim.voiced = THREE.MathUtils.damp(anim.voiced, targetVoiced, dampSpeed, delta);

      lowerJawPivot.rotation.x = anim.mouthOpen * 0.34;

      tongueRoot.position.z = -0.05 + anim.tongueOut * 0.56;
      tongueRoot.position.y = -0.06 + anim.tongueY * 0.65;
      tongueRoot.position.x = anim.tongueX * 0.32;

      tongueTipGroup.position.x = anim.tongueX * 0.28;
      tongueTipGroup.rotation.z = -anim.tongueX * 0.35;
      tongueTipGroup.rotation.x = -anim.tonguePitch;

      updateLipPositions(anim.mouthOpen, anim.smileWidth, anim.lipRound, anim.lipClose);

      // Subtle vocal fold vibration when voiced sound is active
      const vib = anim.voiced * Math.sin(elapsed * 32) * 0.025;
      leftFold.position.x = -0.07 - vib;
      rightFold.position.x = 0.07 + vib;

      // Highlight selected anatomical part softly
      (Object.keys(partMaterials) as AnatomyPartId[]).forEach((pid) => {
        const isSel = pid === selectedPartRef.current;
        partMaterials[pid].forEach((m) => {
          m.emissive.copy(isSel ? _emissiveHighlight : _emissiveZero);
          m.emissiveIntensity = isSel ? 0.16 : 0;
        });
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      envTex.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] md:h-[450px] rounded-3xl overflow-hidden border border-sky-200 bg-[#EEF4FF] select-none">
      {/* Isolated WebGL mount container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Anatomia 3D interativa do trato vocal"
      />

      {/* Top-left selected structure badge (no backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 z-10 rounded-full bg-white/95 border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
        {ANATOMY_PARTS[selectedPart].label} · Arraste para girar
      </div>

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 max-w-[94%]">
        <button
          type="button"
          onClick={() => setControlsVisible((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm min-h-[34px]"
        >
          {controlsVisible ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ocultar Controles</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mostrar Controles 3D</span>
            </>
          )}
        </button>

        {controlsVisible && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white/95 border border-slate-200 p-1.5 shadow-md">
            {(
              [
                { id: 'frontal', label: 'Frontal' },
                { id: 'lateral', label: 'Lateral' },
                { id: 'tres-quartos', label: '3/4 Geral' },
              ] as { id: CameraPresetId; label: string }[]
            ).map((preset) => {
              const active = cameraPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectCameraPreset(preset.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition min-h-[36px] ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

