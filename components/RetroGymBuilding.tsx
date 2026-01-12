import React, { useEffect, useRef, useCallback } from 'react';

interface RetroGymBuildingProps {
    isNightMode: boolean;
    currentSeason: 'winter' | 'spring' | 'summer' | 'autumn';
}

const RetroGymBuilding: React.FC<RetroGymBuildingProps> = ({ isNightMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const imageLoadedRef = useRef(false);

    // Load the background image
    useEffect(() => {
        const img = new Image();
        img.src = '/gym_scene.png';
        img.onload = () => {
            imageRef.current = img;
            imageLoadedRef.current = true;
        };
    }, []);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image with proper aspect ratio
        if (imageRef.current && imageLoadedRef.current) {
            const img = imageRef.current;

            // Calculate aspect ratio to cover the canvas without distortion
            const imgRatio = img.width / img.height;
            const canvasRatio = canvas.width / canvas.height;

            let drawWidth, drawHeight, drawX, drawY;

            if (imgRatio > canvasRatio) {
                drawHeight = canvas.height;
                drawWidth = drawHeight * imgRatio;
                drawX = (canvas.width - drawWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = canvas.width;
                drawHeight = drawWidth / imgRatio;
                drawX = 0;
                drawY = (canvas.height - drawHeight) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

            // Apply subtle night overlay if night mode
            if (isNightMode) {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        } else {
            // Fallback gradient while image loads
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            if (isNightMode) {
                gradient.addColorStop(0, '#0f172a');
                gradient.addColorStop(1, '#1e1b4b');
            } else {
                gradient.addColorStop(0, '#87ceeb');
                gradient.addColorStop(1, '#e0f4ff');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        animationRef.current = requestAnimationFrame(render);
    }, [isNightMode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 600;
        canvas.height = 250;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        animationRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationRef.current);
    }, [render]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
                objectFit: 'cover',
                opacity: 1,
                zIndex: 0
            }}
        />
    );
};

export default RetroGymBuilding;
