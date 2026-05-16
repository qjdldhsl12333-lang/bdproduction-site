import { ContactShadows, Environment, Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function BDStudioScene({ isPlaying }) {
    const studioRef = useRef(null);

    useFrame((state) => {
        if (!studioRef.current) {
            return;
        }

        studioRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.025;
    });

    return (
        <>
            <color attach="background" args={['#d8d8d8']} />
            <ambientLight intensity={1.25} />
            <directionalLight position={[3, 4, 3]} intensity={1.1} castShadow />


            <group ref={studioRef} position={[0, -0.65, 0]} rotation={[0, -0.08, 0]}>
                <StudioSet isPlaying={isPlaying} />
            </group>

            <ContactShadows
                position={[0, -1.18, 0]}
                opacity={0.18}
                scale={6}
                blur={2.4}
                far={2.5}
            />

        </>
    );
}

function StudioSet({ isPlaying }) {
    return (
        <group>
            <Platform />
            <BackWall />
            <SideWall />
            <ScreenFrame />
            <VideoScreen isPlaying={isPlaying} />
            <StudioFurniture />
            <WallLights />
        </group>
    );
}

function Platform() {
    return (
        <group>
            {/* 바깥 플랫폼 */}
            <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
                <boxGeometry args={[5.2, 0.26, 3.05]} />
                <meshStandardMaterial color="#6a6470" roughness={0.88} />
            </mesh>

            {/* 안쪽 카펫 */}
            <mesh position={[0.18, 0.045, 0.08]} receiveShadow>
                <boxGeometry args={[3.9, 0.03, 2.15]} />
                <meshStandardMaterial color="#6b2247" roughness={0.95} />
            </mesh>
        </group>
    );
}

function BackWall() {
    return (
        <mesh position={[0, 1.3, -1.55]} receiveShadow castShadow>
            <boxGeometry args={[4.8, 2.8, 0.18]} />
            <meshStandardMaterial color="#625d66" roughness={0.82} />
        </mesh>
    );
}

function SideWall() {
    return (
        <mesh
            position={[-2.0, 1.02, -0.18]}
            rotation={[0, Math.PI / 2, 0]}
            receiveShadow
            castShadow
        >
            <boxGeometry args={[2.05, 2.15, 0.14]} />
            <meshStandardMaterial color="#6b6570" roughness={0.92} />
        </mesh>
    );
}

function ScreenFrame() {
    return (
        <group position={[0.18, 1.18, -1.18]}>
            {/* 본체 프레임 */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[2.92, 1.28, 0.12]} />
                <meshStandardMaterial color="#5d5862" roughness={0.86} />
            </mesh>

            {/* 스크린 아래 받침대 */}
            <mesh position={[0, -0.86, 0.08]} castShadow>
                <boxGeometry args={[3.14, 0.24, 0.34]} />
                <meshStandardMaterial color="#6b6670" roughness={0.86} />
            </mesh>
        </group>
    );
}

function VideoScreen({ isPlaying }) {
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
        const handleCanPlay = () => {
            setVideoReady(true);
        };

        const handleError = () => {
            setVideoReady(false);
        };

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
            video.play().catch(() => {
                setVideoReady(false);
            });
        } else {
            video.pause();
        }
    }, [isPlaying, video, videoReady]);

    return (
        <group position={[0.18, 1.18, -1.1]}>
            <mesh>
                <planeGeometry args={[2.42, 0.92]} />
                {videoReady ? (
                    <meshBasicMaterial map={texture} toneMapped={false} />
                ) : (
                    <meshStandardMaterial color="#111111" emissive="#1c1c1c" emissiveIntensity={0.72} />
                )}
            </mesh>

            {!videoReady && (
                <>
                    <mesh position={[0, 0, 0.004]}>
                        <planeGeometry args={[3.35, 1.43]} />
                        <meshBasicMaterial color="#171717" transparent opacity={0.92} />
                    </mesh>

                    <Text
                        position={[0, 0.08, 0.018]}
                        fontSize={0.11}
                        color="#d8b76a"
                        anchorX="center"
                        anchorY="middle"
                    >
                        BD PRODUCTION
                    </Text>

                    <Text
                        position={[0, -0.11, 0.018]}
                        fontSize={0.05}
                        color="#f5f0e6"
                        anchorX="center"
                        anchorY="middle"
                    >
                        SHOWREEL SCREEN READY
                    </Text>
                </>
            )}

            {videoReady && !isPlaying && (
                <mesh position={[0, 0, 0.012]}>
                    <planeGeometry args={[3.38, 1.46]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.28} />
                </mesh>
            )}
        </group>
    );
}

function StudioFurniture() {
    return (
        <group>
            <SimpleBench position={[0.18, 0.1, 0.48]} />
            <SimpleSeat position={[-0.55, 0.03, 0.84]} />
            <SimpleSeat position={[0.72, 0.03, 0.84]} />
        </group>
    );
}

function SimpleBench({ position }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.18, 0]} castShadow>
                <boxGeometry args={[1.2, 0.08, 0.22]} />
                <meshStandardMaterial color="#bcb8b3" roughness={0.9} />
            </mesh>

            {[
                [-0.48, 0.06, -0.06],
                [0.48, 0.06, -0.06],
                [-0.48, 0.06, 0.06],
                [0.48, 0.06, 0.06],
            ].map((leg) => (
                <mesh key={leg.join('-')} position={leg} castShadow>
                    <boxGeometry args={[0.05, 0.18, 0.05]} />
                    <meshStandardMaterial color="#8b8482" roughness={0.95} />
                </mesh>
            ))}
        </group>
    );
}

function SimpleSeat({ position }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.18, 0]} castShadow>
                <boxGeometry args={[0.34, 0.34, 0.08]} />
                <meshStandardMaterial color="#aaa6a4" roughness={0.92} />
            </mesh>

            {[
                [-0.12, 0.06, -0.12],
                [0.12, 0.06, -0.12],
                [-0.12, 0.06, 0.12],
                [0.12, 0.06, 0.12],
            ].map((leg) => (
                <mesh key={leg.join('-')} position={leg} castShadow>
                    <boxGeometry args={[0.04, 0.2, 0.04]} />
                    <meshStandardMaterial color="#8f8b88" roughness={0.95} />
                </mesh>
            ))}
        </group>
    );
}

function Table({ position }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.55, 0.08, 0.58]} />
                <meshStandardMaterial color="#b8b3aa" roughness={0.72} />
            </mesh>

            {[
                [-0.64, 0.12, -0.22],
                [0.64, 0.12, -0.22],
                [-0.64, 0.12, 0.22],
                [0.64, 0.12, 0.22],
            ].map((legPosition) => (
                <mesh key={legPosition.join('-')} position={legPosition} castShadow>
                    <boxGeometry args={[0.08, 0.28, 0.08]} />
                    <meshStandardMaterial color="#77716d" roughness={0.82} />
                </mesh>
            ))}
        </group>
    );
}

function Chair({ position, rotation = [0, 0, 0] }) {
    return (
        <group position={position} rotation={rotation}>
            {/* 좌석 */}
            <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.46, 0.08, 0.42]} />
                <meshStandardMaterial color="#bdbab2" roughness={0.78} />
            </mesh>

            {/* 등받이: 카메라 쪽에 있고, 사람은 스크린 방향을 바라보는 구조 */}
            <mesh position={[0, 0.52, 0.22]} castShadow>
                <boxGeometry args={[0.5, 0.5, 0.08]} />
                <meshStandardMaterial color="#b8b5ad" roughness={0.78} />
            </mesh>

            {/* 다리 */}
            {[
                [-0.17, 0.08, -0.15],
                [0.17, 0.08, -0.15],
                [-0.17, 0.08, 0.15],
                [0.17, 0.08, 0.15],
            ].map((legPosition) => (
                <mesh key={legPosition.join('-')} position={legPosition} castShadow>
                    <boxGeometry args={[0.055, 0.24, 0.055]} />
                    <meshStandardMaterial color="#7a7770" roughness={0.86} />
                </mesh>
            ))}
        </group>
    );
}

function WallLights() {
    return (
        <group>
            {[-0.26, 0, 0.26].map((offset, index) => (
                <mesh
                    key={index}
                    position={[-1.9, 1.18 + offset, -0.9]}
                    rotation={[0, Math.PI / 2, 0]}
                >
                    <boxGeometry args={[0.03, 0.18, 0.06]} />
                    <meshStandardMaterial
                        color="#fff8e4"
                        emissive="#fff7d6"
                        emissiveIntensity={1.35}
                        roughness={0.45}
                    />
                </mesh>
            ))}
        </group>
    );
}

function DecorativeFilmReel() {
    return (
        <Float speed={1.25} rotationIntensity={0.14} floatIntensity={0.12}>
            <group position={[1.95, 2.28, -1.04]} rotation={[0.18, -0.45, 0.08]}>
                <mesh castShadow>
                    <torusGeometry args={[0.34, 0.035, 14, 64]} />
                    <meshStandardMaterial color="#2f2f31" metalness={0.25} roughness={0.42} />
                </mesh>

                {[0, 1, 2, 3, 4].map((item) => {
                    const angle = (item / 5) * Math.PI * 2;

                    return (
                        <mesh
                            key={item}
                            position={[Math.cos(angle) * 0.16, Math.sin(angle) * 0.16, 0.01]}
                        >
                            <circleGeometry args={[0.055, 24]} />
                            <meshStandardMaterial color="#5f5f63" roughness={0.52} />
                        </mesh>
                    );
                })}
            </group>
        </Float>
    );
}

export default BDStudioScene;