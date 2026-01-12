import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface MuscleData {
    id: string;
    intensity: number;
    name: string;
}

interface Muscle3DProps {
    muscleHeatData: MuscleData[];
    isDarkMode?: boolean;
}

// Kas renk hesaplama
const getMuscleColor = (intensity: number): THREE.Color => {
    if (intensity === 0) return new THREE.Color(0x374151); // koyu gri
    if (intensity < 25) return new THREE.Color(0xfef08a); // hafif sarı
    if (intensity < 50) return new THREE.Color(0xfbbf24); // sarı
    if (intensity < 75) return new THREE.Color(0xf97316); // turuncu
    return new THREE.Color(0xef4444); // kırmızı
};

// Kas grubu pozisyonları ve şekilleri
const MUSCLE_CONFIGS: Record<string, { position: [number, number, number], scale: [number, number, number], rotation?: [number, number, number] }[]> = {
    'chest': [
        { position: [-0.15, 0.55, 0.12], scale: [0.18, 0.12, 0.08] },
        { position: [0.15, 0.55, 0.12], scale: [0.18, 0.12, 0.08] }
    ],
    'back': [
        { position: [0, 0.5, -0.12], scale: [0.35, 0.25, 0.06] }
    ],
    'shoulders': [
        { position: [-0.28, 0.65, 0], scale: [0.1, 0.08, 0.1] },
        { position: [0.28, 0.65, 0], scale: [0.1, 0.08, 0.1] }
    ],
    'biceps': [
        { position: [-0.35, 0.45, 0.03], scale: [0.06, 0.12, 0.06] },
        { position: [0.35, 0.45, 0.03], scale: [0.06, 0.12, 0.06] }
    ],
    'triceps': [
        { position: [-0.35, 0.45, -0.03], scale: [0.05, 0.11, 0.05] },
        { position: [0.35, 0.45, -0.03], scale: [0.05, 0.11, 0.05] }
    ],
    'core': [
        { position: [0, 0.25, 0.1], scale: [0.18, 0.2, 0.06] }
    ],
    'quads': [
        { position: [-0.1, -0.15, 0.05], scale: [0.1, 0.25, 0.1] },
        { position: [0.1, -0.15, 0.05], scale: [0.1, 0.25, 0.1] }
    ],
    'hamstrings': [
        { position: [-0.1, -0.15, -0.05], scale: [0.09, 0.22, 0.08] },
        { position: [0.1, -0.15, -0.05], scale: [0.09, 0.22, 0.08] }
    ],
    'glutes': [
        { position: [-0.1, 0.02, -0.08], scale: [0.12, 0.1, 0.1] },
        { position: [0.1, 0.02, -0.08], scale: [0.12, 0.1, 0.1] }
    ],
    'calves': [
        { position: [-0.1, -0.55, 0], scale: [0.06, 0.15, 0.07] },
        { position: [0.1, -0.55, 0], scale: [0.06, 0.15, 0.07] }
    ]
};

const Muscle3D: React.FC<Muscle3DProps> = ({ muscleHeatData, isDarkMode = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const bodyGroupRef = useRef<THREE.Group | null>(null);
    const frameRef = useRef<number>(0);

    const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
    const [isRotating, setIsRotating] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Kas veri haritası
    const muscleMap = useMemo(() => {
        const map: Record<string, MuscleData> = {};
        muscleHeatData.forEach(m => { map[m.id] = m; });
        return map;
    }, [muscleHeatData]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDarkMode ? 0x0f172a : 0xf8fafc);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0.2, 2.5);
        camera.lookAt(0, 0.1, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 3, 2);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0x88aaff, 0.3);
        backLight.position.set(-2, 1, -2);
        scene.add(backLight);

        // Body group
        const bodyGroup = new THREE.Group();
        bodyGroupRef.current = bodyGroup;
        scene.add(bodyGroup);

        // Base body (torso + extremities)
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: isDarkMode ? 0x4b5563 : 0x94a3b8,
            shininess: 30
        });

        // Head
        const headGeometry = new THREE.SphereGeometry(0.12, 32, 32);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.85, 0);
        bodyGroup.add(head);

        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.08, 16);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.set(0, 0.72, 0);
        bodyGroup.add(neck);

        // Torso base
        const torsoGeometry = new THREE.CylinderGeometry(0.2, 0.18, 0.5, 24);
        const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
        torso.position.set(0, 0.4, 0);
        bodyGroup.add(torso);

        // Hip area
        const hipGeometry = new THREE.SphereGeometry(0.2, 24, 24);
        hipGeometry.scale(1, 0.6, 0.8);
        const hip = new THREE.Mesh(hipGeometry, bodyMaterial);
        hip.position.set(0, 0.08, 0);
        bodyGroup.add(hip);

        // Upper Arms
        const armGeometry = new THREE.CapsuleGeometry(0.05, 0.2, 8, 16);
        const leftUpperArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftUpperArm.position.set(-0.35, 0.5, 0);
        leftUpperArm.rotation.z = 0.2;
        bodyGroup.add(leftUpperArm);

        const rightUpperArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightUpperArm.position.set(0.35, 0.5, 0);
        rightUpperArm.rotation.z = -0.2;
        bodyGroup.add(rightUpperArm);

        // Forearms
        const forearmGeometry = new THREE.CapsuleGeometry(0.04, 0.18, 8, 16);
        const leftForearm = new THREE.Mesh(forearmGeometry, bodyMaterial);
        leftForearm.position.set(-0.4, 0.22, 0);
        leftForearm.rotation.z = 0.1;
        bodyGroup.add(leftForearm);

        const rightForearm = new THREE.Mesh(forearmGeometry, bodyMaterial);
        rightForearm.position.set(0.4, 0.22, 0);
        rightForearm.rotation.z = -0.1;
        bodyGroup.add(rightForearm);

        // Upper Legs
        const upperLegGeometry = new THREE.CapsuleGeometry(0.08, 0.25, 8, 16);
        const leftUpperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
        leftUpperLeg.position.set(-0.1, -0.2, 0);
        bodyGroup.add(leftUpperLeg);

        const rightUpperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
        rightUpperLeg.position.set(0.1, -0.2, 0);
        bodyGroup.add(rightUpperLeg);

        // Lower Legs
        const lowerLegGeometry = new THREE.CapsuleGeometry(0.05, 0.25, 8, 16);
        const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
        leftLowerLeg.position.set(-0.1, -0.58, 0);
        bodyGroup.add(leftLowerLeg);

        const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
        rightLowerLeg.position.set(0.1, -0.58, 0);
        bodyGroup.add(rightLowerLeg);

        // Feet
        const footGeometry = new THREE.BoxGeometry(0.08, 0.04, 0.14);
        const leftFoot = new THREE.Mesh(footGeometry, bodyMaterial);
        leftFoot.position.set(-0.1, -0.85, 0.03);
        bodyGroup.add(leftFoot);

        const rightFoot = new THREE.Mesh(footGeometry, bodyMaterial);
        rightFoot.position.set(0.1, -0.85, 0.03);
        bodyGroup.add(rightFoot);

        // Muscle groups with heat colors
        Object.entries(MUSCLE_CONFIGS).forEach(([muscleId, configs]) => {
            const muscleData = muscleMap[muscleId];
            const intensity = muscleData?.intensity || 0;
            const color = getMuscleColor(intensity);

            const muscleMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 60,
                transparent: true,
                opacity: 0.95
            });

            configs.forEach((config, idx) => {
                const geometry = new THREE.SphereGeometry(0.5, 24, 24);
                geometry.scale(config.scale[0], config.scale[1], config.scale[2]);

                const mesh = new THREE.Mesh(geometry, muscleMaterial);
                mesh.position.set(...config.position);
                if (config.rotation) {
                    mesh.rotation.set(...config.rotation);
                }
                mesh.userData = { muscleId, muscleName: muscleData?.name || muscleId, intensity };
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                bodyGroup.add(mesh);
            });
        });

        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let isDragging = false;
        let previousMouseX = 0;

        const onMouseDown = (event: MouseEvent) => {
            isDragging = true;
            previousMouseX = event.clientX;
            setIsRotating(false);
        };

        const onMouseUp = () => {
            isDragging = false;
            setTimeout(() => setIsRotating(true), 2000);
        };

        const onMouseMove = (event: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });

            if (isDragging && bodyGroupRef.current) {
                const deltaX = event.clientX - previousMouseX;
                bodyGroupRef.current.rotation.y += deltaX * 0.01;
                previousMouseX = event.clientX;
            }

            // Raycast for hover
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(bodyGroup.children);

            if (intersects.length > 0) {
                const firstHit = intersects[0].object;
                if (firstHit.userData.muscleId) {
                    setHoveredMuscle(firstHit.userData.muscleName);
                } else {
                    setHoveredMuscle(null);
                }
            } else {
                setHoveredMuscle(null);
            }
        };

        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mouseup', onMouseUp);
        container.addEventListener('mouseleave', onMouseUp);
        container.addEventListener('mousemove', onMouseMove);

        // Animation loop
        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);

            if (isRotating && bodyGroupRef.current) {
                bodyGroupRef.current.rotation.y += 0.003;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current) return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousedown', onMouseDown);
            container.removeEventListener('mouseup', onMouseUp);
            container.removeEventListener('mouseleave', onMouseUp);
            container.removeEventListener('mousemove', onMouseMove);

            if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
                container.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
        };
    }, [muscleMap, isDarkMode, isRotating]);

    // Hover tooltip
    const hoveredMuscleData = hoveredMuscle
        ? muscleHeatData.find(m => m.name === hoveredMuscle)
        : null;

    return (
        <div className="relative w-full h-80">
            <div
                ref={containerRef}
                className="w-full h-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
            />

            {/* Hover Tooltip */}
            {hoveredMuscle && (
                <div
                    className="absolute pointer-events-none bg-slate-900/90 text-white px-3 py-2 rounded-xl text-sm font-medium shadow-xl z-10"
                    style={{
                        left: Math.min(mousePosition.x + 10, containerRef.current?.clientWidth ? containerRef.current.clientWidth - 120 : 0),
                        top: Math.min(mousePosition.y + 10, 260)
                    }}
                >
                    <div className="font-bold">{hoveredMuscle}</div>
                    {hoveredMuscleData && (
                        <div className="text-xs text-slate-300">
                            Yoğunluk: %{Math.round(hoveredMuscleData.intensity)}
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                <p className="text-[10px] text-white/70">🖱️ Döndürmek için sürükle</p>
            </div>

            {/* Heat Legend */}
            <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <span className="text-[9px] text-white/70">0</span>
                </div>
                <div className="w-16 h-2 rounded-full bg-gradient-to-r from-yellow-200 via-orange-500 to-red-500"></div>
                <span className="text-[9px] text-white/70">100%</span>
            </div>
        </div>
    );
};

export default Muscle3D;
