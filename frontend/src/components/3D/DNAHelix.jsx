import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder } from '@react-three/drei';

export default function DNAHelix(props) {
    const group = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = t * 0.5;
        group.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    });

    const count = 20;
    const radius = 2;
    const height = 8;

    return (
        <group ref={group} {...props} dispose={null}>
            {Array.from({ length: count }).map((_, i) => {
                const t = i / count;
                const angle = t * Math.PI * 4;
                const y = (t - 0.5) * height;

                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;
                const x2 = Math.cos(angle + Math.PI) * radius;
                const z2 = Math.sin(angle + Math.PI) * radius;

                return (
                    <group key={i} position={[0, y, 0]}>
                        {/* Strands */}
                        <Sphere position={[x1, 0, z1]} args={[0.3, 16, 16]}>
                            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} roughness={0.2} />
                        </Sphere>
                        <Sphere position={[x2, 0, z2]} args={[0.3, 16, 16]}>
                            <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.5} roughness={0.2} />
                        </Sphere>

                        {/* Connector */}
                        <Cylinder position={[0, 0, 0]} args={[0.05, 0.05, radius * 2, 8]} rotation={[0, -angle, Math.PI / 2]}>
                            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
                        </Cylinder>
                    </group>
                );
            })}
        </group>
    );
}
