import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { Suspense, useState } from 'react';
import BDStudioScene from './BDStudioScene.jsx';

function BDStudioShowroom() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section id="studio" className="section studio-showroom-section">
            <div className="studio-showroom-heading">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.28 }}
                    transition={{ duration: 0.65 }}
                >
                    <p className="eyebrow">BD STUDIO</p>
                    <h2>HAVE IDEA FOR YOUR PROJECT?</h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.28 }}
                    transition={{ duration: 0.65, delay: 0.08 }}
                >
                    BDPRODUCTION의 쇼릴을 3D 스튜디오 공간 안에서 확인할 수 있도록 구성한
                    인터랙티브 쇼룸입니다. 영상 파일을 연결하면 중앙 스크린에서 실제 영상이
                    재생됩니다.
                </motion.p>
            </div>

            <motion.div
                className="studio-showroom-frame"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.75 }}
            >
                <div className="studio-showroom-controls">
                    <button
                        type="button"
                        className={isPlaying ? '' : 'is-active'}
                        onClick={() => setIsPlaying(true)}
                    >
                        <Play size={15} />
                        START MOVIE
                    </button>

                    <button
                        type="button"
                        className={isPlaying ? 'is-active' : ''}
                        onClick={() => setIsPlaying(false)}
                    >
                        <Pause size={15} />
                        STOP MOVIE
                    </button>
                </div>

                <Canvas
                    shadows
                    camera={{
                        position: [0, 1.45, 6.9],
                        fov: 28,
                    }}
                    gl={{
                        antialias: true,
                        alpha: false,
                    }}
                >
                    <Suspense fallback={null}>
                        <BDStudioScene isPlaying={isPlaying} />
                    </Suspense>
                </Canvas>
            </motion.div>

            <p className="studio-showroom-note">
                영상 파일 연결 위치: <strong>frontend/public/videos/showreel.mp4</strong>
            </p>
        </section>
    );
}

export default BDStudioShowroom;