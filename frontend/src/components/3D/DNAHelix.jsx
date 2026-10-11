import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const atomGeometry = new THREE.SphereGeometry(0.13, 18, 18);
const rungGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);

function Rung({ start, end, index }) {
    const { midpoint, quaternion, length } = useMemo(() => {
        const from = new THREE.Vector3(...start);
        const to = new THREE.Vector3(...end);
        const direction = to.clone().sub(from);
        return {
            midpoint: from.clone().add(to).multiplyScalar(0.5),
            quaternion: new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize(),
            ),
            length: direction.length(),
        };
    }, [start, end]);

    return (
        <group>
            <mesh geometry={rungGeometry} position={midpoint} quaternion={quaternion} scale={[1, length, 1]}>
                <meshStandardMaterial color="#d9f6ff" transparent opacity={0.48} roughness={0.35} />
            </mesh>
            <mesh geometry={atomGeometry} position={start}>
                <meshPhysicalMaterial color={index % 2 ? '#5eead4' : '#67e8f9'} emissive="#14b8a6" emissiveIntensity={0.42} roughness={0.22} metalness={0.08} clearcoat={0.75} />
            </mesh>
            <mesh geometry={atomGeometry} position={end}>
                <meshPhysicalMaterial color={index % 2 ? '#7dd3fc' : '#99f6e4'} emissive="#0284c7" emissiveIntensity={0.38} roughness={0.22} metalness={0.08} clearcoat={0.75} />
            </mesh>
        </group>
    );
}

export default function DNAHelix({ reducedMotion = false, ...props }) {
    const group = useRef();
    const helix = useMemo(() => {
        const turns = Math.PI * 4.6;
        const radius = 1.05;
        const height = 5.8;
        const curvePoints = 72;
        const rungCount = 22;
        const pointAt = (progress, offset = 0) => {
            const angle = progress * turns + offset;
            return [Math.cos(angle) * radius, (progress - 0.5) * height, Math.sin(angle) * radius];
        };
        const strandA = Array.from({ length: curvePoints }, (_, index) => new THREE.Vector3(...pointAt(index / (curvePoints - 1))));
        const strandB = Array.from({ length: curvePoints }, (_, index) => new THREE.Vector3(...pointAt(index / (curvePoints - 1), Math.PI)));
        const rungs = Array.from({ length: rungCount }, (_, index) => {
            const progress = index / (rungCount - 1);
            return [pointAt(progress), pointAt(progress, Math.PI)];
        });
        return {
            curveA: new THREE.CatmullRomCurve3(strandA),
            curveB: new THREE.CatmullRomCurve3(strandB),
            rungs,
        };
    }, []);

    useFrame((state, delta) => {
        if (!group.current || reducedMotion) return;
        group.current.rotation.y += delta * 0.16;
        group.current.rotation.z = -0.17 + Math.sin(state.clock.elapsedTime * 0.35) * 0.025;
        group.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
    });

    return (
        <group ref={group} rotation={[-0.08, -0.45, -0.17]} {...props}>
            <mesh>
                <tubeGeometry args={[helix.curveA, 96, 0.055, 10, false]} />
                <meshPhysicalMaterial color="#67e8f9" emissive="#0891b2" emissiveIntensity={0.46} roughness={0.2} clearcoat={0.9} />
            </mesh>
            <mesh>
                <tubeGeometry args={[helix.curveB, 96, 0.055, 10, false]} />
                <meshPhysicalMaterial color="#5eead4" emissive="#0d9488" emissiveIntensity={0.42} roughness={0.2} clearcoat={0.9} />
            </mesh>
            {helix.rungs.map(([start, end], index) => <Rung key={index} start={start} end={end} index={index} />)}
        </group>
    );
}
