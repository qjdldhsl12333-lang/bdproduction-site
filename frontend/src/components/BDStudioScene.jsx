import { ContactShadows, Environment, Float, MeshReflectorMaterial, Sparkles, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function BDStudioScene({ isPlaying }) {
  const rigRef = useRef(null);
  const coreRef = useRef(null);
  const ringsRef = useRef(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;

    if (rigRef.current) {
      rigRef.current.rotation.y = THREE.MathUtils.lerp(
        rigRef.current.rotation.y,
        pointer.x * 0.18,
        0.045
      );
      rigRef.current.rotation.x = THREE.MathUtils.lerp(
        rigRef.current.rotation.x,
        -pointer.y * 0.075,
        0.045
      );
      rigRef.current.position.x = THREE.MathUtils.lerp(rigRef.current.position.x, pointer.x * 0.16, 0.04);
      rigRef.current.position.y = THREE.MathUtils.lerp(rigRef.current.position.y, -pointer.y * 0.045, 0.04);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.42;
      coreRef.current.rotation.x = Math.sin(elapsed * 0.55) * 0.09;
      coreRef.current.position.y = Math.sin(elapsed * 0.72) * 0.055;
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.y -= delta * 0.28;
      ringsRef.current.rotation.z = Math.sin(elapsed * 0.34) * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={['#010405']} />
      <fog attach="fog" args={['#010405', 5.8, 12.5]} />

      <ambientLight intensity={0.34} />
      <directionalLight position={[2.4, 4.6, 3.2]} intensity={1.05} color="#d9fff0" castShadow />
      <pointLight position={[-3.2, 1.6, 2.4]} intensity={16} color="#95ff00" distance={6.8} />
      <pointLight position={[3.4, 2.2, -0.6]} intensity={9} color="#18a1aa" distance={7.2} />
      <spotLight position={[0, 4.6, 3.2]} angle={0.36} penumbra={0.72} intensity={3.2} color="#ffffff" castShadow />

      <Environment preset="night" />

      <group ref={rigRef} position={[0, -0.2, 0]}>
        <ReflectiveStage />
        <BackGlow />
        <CinematicPrism coreRef={coreRef} ringsRef={ringsRef} />
        <ShowreelGlassScreen isPlaying={isPlaying} />
        <FloatingLightPanels />
        <NeonRails />
      </group>

      <Sparkles
        count={80}
        scale={[6, 2.8, 4.8]}
        size={1.35}
        speed={0.24}
        opacity={0.55}
        color="#95ff00"
        position={[0, 0.7, -0.5]}
      />

      <ContactShadows
        position={[0, -1.18, 0]}
        opacity={0.42}
        scale={7.2}
        blur={2.8}
        far={3.2}
        color="#000000"
      />
    </>
  );
}

function ReflectiveStage() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.22, 0]} receiveShadow>
        <planeGeometry args={[8.4, 6.2]} />
        <MeshReflectorMaterial
          color="#020606"
          metalness={0.66}
          roughness={0.16}
          blur={[520, 120]}
          mixBlur={1.15}
          mixStrength={1.35}
          resolution={1024}
          mirror={0.62}
          depthScale={0.35}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.205, 0.05]}>
        <ringGeometry args={[1.58, 1.62, 160]} />
        <meshBasicMaterial color="#95ff00" transparent opacity={0.38} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.202, 0.05]}>
        <ringGeometry args={[2.42, 2.45, 180]} />
        <meshBasicMaterial color="#18a1aa" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function BackGlow() {
  return (
    <group position={[0, 0.15, -1.92]}>
      <mesh>
        <planeGeometry args={[5.2, 2.9]} />
        <meshBasicMaterial color="#031013" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.4, 1.72]} />
        <meshBasicMaterial color="#095b4d" transparent opacity={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[1.25, 1.29, 128]} />
        <meshBasicMaterial color="#95ff00" transparent opacity={0.24} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <ringGeometry args={[1.86, 1.88, 128]} />
        <meshBasicMaterial color="#18a1aa" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function CinematicPrism({ coreRef, ringsRef }) {
  return (
    <Float speed={1.35} rotationIntensity={0.1} floatIntensity={0.16}>
      <group ref={coreRef} position={[0, 0.38, -0.28]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.68, 1]} />
          <meshPhysicalMaterial
            color="#dfffee"
            emissive="#0f3a29"
            emissiveIntensity={0.35}
            metalness={0.38}
            roughness={0.12}
            transmission={0.34}
            thickness={0.72}
            transparent
            opacity={0.72}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>

        <mesh scale={[1.04, 1.04, 1.04]}>
          <icosahedronGeometry args={[0.69, 1]} />
          <meshBasicMaterial color="#95ff00" transparent opacity={0.055} wireframe />
        </mesh>

        <group ref={ringsRef}>
          <NeonRing rotation={[Math.PI / 2, 0, 0]} color="#95ff00" opacity={0.78} />
          <NeonRing rotation={[0.62, 0.18, Math.PI / 2]} color="#18a1aa" opacity={0.44} scale={1.18} />
          <NeonRing rotation={[0.2, Math.PI / 2, -0.42]} color="#a6e4db" opacity={0.26} scale={1.36} />
        </group>
      </group>
    </Float>
  );
}

function NeonRing({ rotation, color, opacity, scale = 1 }) {
  return (
    <mesh rotation={rotation} scale={scale}>
      <torusGeometry args={[1.0, 0.012, 12, 160]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function ShowreelGlassScreen({ isPlaying }) {
  const [videoReady, setVideoReady] = useState(false);

  const video = useMemo(() => {
    const element = document.createElement('video');
    element.src = '/videos/showreel.mp4';
    element.crossOrigin = 'anonymous';
    element.loop = true;
    element.muted = true;
    element.playsInline = true;
    element.preload = 'auto';
    return element;
  }, []);

  const texture = useMemo(() => {
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    return videoTexture;
  }, [video]);

  useEffect(() => {
    const handleCanPlay = () => setVideoReady(true);
    const handleError = () => setVideoReady(false);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.pause();
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      texture.dispose();
    };
  }, [texture, video]);

  useEffect(() => {
    if (!videoReady) {
      return;
    }

    if (isPlaying) {
      video.play().catch(() => setVideoReady(false));
    } else {
      video.pause();
    }
  }, [isPlaying, video, videoReady]);

  return (
    <group position={[0, 0.28, 0.78]} rotation={[-0.06, 0, 0]}>
      <mesh position={[0, 0, -0.035]} castShadow>
        <boxGeometry args={[2.58, 1.18, 0.055]} />
        <meshPhysicalMaterial
          color="#061214"
          metalness={0.62}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.28, 0.82]} />
        {videoReady ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#020303" emissive="#0b2a22" emissiveIntensity={0.8} roughness={0.25} />
        )}
      </mesh>

      {!videoReady && <ScreenFallbackText />}

      {videoReady && !isPlaying && (
        <mesh position={[0, 0, 0.014]}>
          <planeGeometry args={[2.3, 0.84]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.34} />
        </mesh>
      )}

      <mesh position={[0, -0.62, -0.02]}>
        <boxGeometry args={[2.72, 0.045, 0.1]} />
        <meshStandardMaterial color="#95ff00" emissive="#95ff00" emissiveIntensity={0.72} roughness={0.18} />
      </mesh>
    </group>
  );
}

function ScreenFallbackText() {
  return (
    <group position={[0, 0, 0.02]}>
      <Text fontSize={0.11} color="#f5f7ee" anchorX="center" anchorY="middle" letterSpacing={0.05}>
        BDPRODUCTION
      </Text>
      <Text position={[0, -0.18, 0]} fontSize={0.045} color="#95ff00" anchorX="center" anchorY="middle" letterSpacing={0.12}>
        SHOWREEL READY
      </Text>
    </group>
  );
}

function FloatingLightPanels() {
  const panels = [
    { position: [-1.88, 0.42, -0.62], rotation: [0.04, 0.36, -0.03], scale: [0.42, 1.32, 0.018], color: '#95ff00', opacity: 0.22 },
    { position: [1.82, 0.52, -0.72], rotation: [-0.03, -0.34, 0.04], scale: [0.42, 1.1, 0.018], color: '#18a1aa', opacity: 0.2 },
    { position: [-1.22, -0.14, 0.65], rotation: [0.08, 0.18, 0.04], scale: [0.32, 0.86, 0.014], color: '#a6e4db', opacity: 0.12 },
    { position: [1.12, -0.06, 0.66], rotation: [-0.06, -0.2, -0.05], scale: [0.32, 0.74, 0.014], color: '#95ff00', opacity: 0.13 },
  ];

  return (
    <group>
      {panels.map((panel, index) => (
        <Float key={index} speed={1 + index * 0.12} rotationIntensity={0.08} floatIntensity={0.12}>
          <mesh position={panel.position} rotation={panel.rotation} scale={panel.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhysicalMaterial
              color={panel.color}
              emissive={panel.color}
              emissiveIntensity={0.35}
              roughness={0.06}
              metalness={0.2}
              transmission={0.55}
              transparent
              opacity={panel.opacity}
              clearcoat={1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function NeonRails() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 2.05, -0.92, 0.12]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.018, 0.018, 3.1]} />
          <meshStandardMaterial color="#95ff00" emissive="#95ff00" emissiveIntensity={1.1} roughness={0.22} />
        </mesh>
      ))}

      <mesh position={[0, -0.91, -1.28]}>
        <boxGeometry args={[3.8, 0.014, 0.014]} />
        <meshStandardMaterial color="#18a1aa" emissive="#18a1aa" emissiveIntensity={0.75} roughness={0.22} />
      </mesh>
    </group>
  );
}

export default BDStudioScene;
