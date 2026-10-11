import { Canvas, useThree } from '@react-three/fiber';
import DNAHelix from './DNAHelix';

function Scene({ reducedMotion }) {
    const { size } = useThree();
    const compact = size.width < 640;
    return (
        <>
            <ambientLight intensity={0.75} />
            <directionalLight position={[4, 5, 7]} intensity={2.1} color="#e0f2fe" />
            <pointLight position={[-4, -2, 4]} intensity={18} distance={12} color="#2dd4bf" />
            <DNAHelix
                reducedMotion={reducedMotion}
                position={[compact ? 2.05 : 1.65, compact ? -0.08 : -0.2, 0]}
                scale={compact ? 0.76 : 0.92}
            />
        </>
    );
}

export default function DNAExperience({ reducedMotion = false }) {
    return (
        <Canvas
            className="!absolute !inset-0 opacity-65 sm:opacity-75 lg:opacity-80"
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 8.2], fov: 38 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
            <Scene reducedMotion={reducedMotion} />
        </Canvas>
    );
}
