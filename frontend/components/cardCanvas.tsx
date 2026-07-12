"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "fabric";

type CardCanvasProps = {
  width: number;
  height: number;
  onReady: (canvas: Canvas) => void;
};

export default function CardCanvas({ width, height, onReady }: CardCanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
    });

    fabricCanvasRef.current = canvas;
    onReady(canvas);

    return () => {
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redimensionne le canvas si le format change (sans le recréer)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.setDimensions({ width, height });
    canvas.renderAll();
  }, [width, height]);

  return (
    <div className="overflow-hidden rounded-xl shadow-lg">
      <canvas ref={canvasElRef} />
    </div>
  );
}