import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Clapperboard, Film, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Film,
    title: '8K Oversampling',
    description:
      '고해상도 촬영 데이터를 기반으로 선명한 디테일과 안정적인 후반 작업 품질을 확보합니다.',
  },
  {
    icon: Clapperboard,
    title: 'Cine EI Workflow',
    description:
      '촬영 현장의 노출 관리부터 색보정까지 일관된 시네마틱 제작 워크플로우를 설계합니다.',
  },
  {
    icon: Sparkles,
    title: 'Color Grade',
    description:
      '브랜드의 분위기와 메시지에 맞춰 영상의 감정선을 완성하는 컬러 그레이딩을 제공합니다.',
  },
];

function InsightObject() {
  return (
    <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.4}>
      <mesh>
        <sphereGeometry args={[1.45, 64, 64]} />
        <MeshDistortMaterial
          color="#d8b76a"
          distort={0.34}
          speed={2.2}
          roughness={0.18}
          metalness={0.82}
        />
      </mesh>
    </Float>
  );
}

function Insight() {
  return (
    <section id="insight" className="section insight-section">
      <div className="section-heading">
        <p className="eyebrow">BDPRODUCTION INSIGHT</p>
        <h2>프리미엄 영상 제작을 위한 기술 기반</h2>
        <p>
          BDPRODUCTION은 촬영, 색보정, 납품까지 이어지는 제작 파이프라인을
          하나의 완성도 높은 결과물로 연결합니다.
        </p>
      </div>

      <div className="insight-grid">
        <motion.div
          className="insight-visual"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8 }}
        >
          <Canvas camera={{ position: [0, 0, 4.6], fov: 45 }}>
            <ambientLight intensity={0.9} />
            <pointLight position={[4, 4, 4]} intensity={2.4} />
            <pointLight position={[-3, -2, -2]} intensity={1.1} />
            <InsightObject />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </motion.div>

        <div className="feature-list">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                className="feature-card"
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Insight;