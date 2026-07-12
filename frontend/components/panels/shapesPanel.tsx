"use client";

import { useEffect, useRef, useState } from "react";
import {
  Canvas, Rect, Circle, Triangle, Line, Ellipse, Polygon,
  FabricObject, PencilBrush, Point,
} from "fabric";
import { Pencil, Hexagon } from "lucide-react";

const shapes: { label: string; icon: string; create: () => FabricObject }[] = [
  { label: "Rectangle", icon: "▭", create: () => new Rect({ left: 80, top: 80, width: 140, height: 100, fill: "#F0785A" }) },
  { label: "Arrondi", icon: "▢", create: () => new Rect({ left: 80, top: 80, width: 140, height: 100, fill: "#F79C86", rx: 20, ry: 20 }) },
  { label: "Cercle", icon: "●", create: () => new Circle({ left: 80, top: 80, radius: 60, fill: "#F79C86" }) },
  { label: "Ellipse", icon: "⬭", create: () => new Ellipse({ left: 80, top: 80, rx: 80, ry: 50, fill: "#DCEEFB" }) },
  { label: "Triangle", icon: "▲", create: () => new Triangle({ left: 80, top: 80, width: 120, height: 100, fill: "#2A211D" }) },
  { label: "Ligne", icon: "—", create: () => new Line([50, 50, 200, 50], { stroke: "#1f2937", strokeWidth: 3 }) },
  {
    label: "Pentagone", icon: "⬠",
    create: () => new Polygon(
      [
        { x: 60, y: 0 }, { x: 120, y: 40 }, { x: 96, y: 110 },
        { x: 24, y: 110 }, { x: 0, y: 40 },
      ],
      { left: 80, top: 80, fill: "#E9E1F9" }
    ),
  },
  {
    label: "Étoile", icon: "★",
    create: () => {
      const points = [];
      const outer = 60, inner = 25;
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? outer : inner;
        points.push({ x: outer + r * Math.cos(angle), y: outer + r * Math.sin(angle) });
      }
      return new Polygon(points, { left: 80, top: 80, fill: "#FDE2E4" });
    },
  },
  {
    label: "Cœur", icon: "♥",
    create: () => new Polygon(
      [
        { x: 50, y: 20 }, { x: 65, y: 0 }, { x: 90, y: 0 }, { x: 100, y: 25 },
        { x: 100, y: 45 }, { x: 50, y: 100 }, { x: 0, y: 45 }, { x: 0, y: 25 },
        { x: 10, y: 0 }, { x: 35, y: 0 },
      ],
      { left: 80, top: 80, fill: "#F0785A" }
    ),
  },
  {
    label: "Flèche", icon: "➜",
    create: () => new Polygon(
      [
        { x: 0, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 0 }, { x: 100, y: 35 },
        { x: 60, y: 70 }, { x: 60, y: 50 }, { x: 0, y: 50 },
      ],
      { left: 80, top: 80, fill: "#2A211D" }
    ),
  },
];

type Props = {
  canvas: Canvas | null;
  onChange: () => void;
};

export default function ShapesPanel({ canvas, onChange }: Props) {
  const [drawingMode, setDrawingMode] = useState(false);
  const [buildingPolygon, setBuildingPolygon] = useState(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const previewRef = useRef<Polygon | null>(null);

  function addShape(create: () => FabricObject) {
    if (!canvas) return;
    const shape = create();
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    onChange();
  }

  // Dessin libre (pinceau)
  function toggleFreeDraw() {
    if (!canvas) return;
    const next = !drawingMode;
    setDrawingMode(next);
    setBuildingPolygon(false);
    canvas.isDrawingMode = next;
    if (next) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#1f2937";
      canvas.freeDrawingBrush.width = 4;
    }
  }

  // Forme personnalisée : clic pour placer des points, double-clic pour clôturer
  useEffect(() => {
    if (!canvas || !buildingPolygon) return;

    function handleClick(opt: any) {
      const pointer = canvas!.getScenePoint(opt.e);
      pointsRef.current.push({ x: pointer.x, y: pointer.y });

      if (previewRef.current) canvas!.remove(previewRef.current);
      if (pointsRef.current.length >= 2) {
        const preview = new Polygon(pointsRef.current, {
          fill: "rgba(240,120,90,0.2)",
          stroke: "#F0785A",
          strokeWidth: 2,
          selectable: false,
          evented: false,
        });
        previewRef.current = preview;
        canvas!.add(preview);
        canvas!.renderAll();
      }
    }

    function handleDblClick() {
      if (pointsRef.current.length < 3) return;
      if (previewRef.current) canvas!.remove(previewRef.current);

      const finalShape = new Polygon(pointsRef.current, { fill: "#F79C86" });
      canvas!.add(finalShape);
      canvas!.setActiveObject(finalShape);
      canvas!.renderAll();

      pointsRef.current = [];
      previewRef.current = null;
      setBuildingPolygon(false);
      onChange();
    }

    canvas.on("mouse:down", handleClick);
    canvas.on("mouse:dblclick", handleDblClick);

    return () => {
      canvas.off("mouse:down", handleClick);
      canvas.off("mouse:dblclick", handleDblClick);
    };
  }, [canvas, buildingPolygon, onChange]);

  function toggleBuildPolygon() {
    setBuildingPolygon((v) => !v);
    setDrawingMode(false);
    if (canvas) canvas.isDrawingMode = false;
    pointsRef.current = [];
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="grid grid-cols-3 gap-2">
        {shapes.map((shape) => (
          <button
            key={shape.label}
            onClick={() => addShape(shape.create)}
            className="flex flex-col items-center gap-1 rounded-lg border border-dark/10 py-3 text-xs hover:border-coral hover:bg-coral/5"
          >
            <span className="text-xl">{shape.icon}</span>
            {shape.label}
          </button>
        ))}
      </div>

      <div className="border-t border-dark/10 pt-4">
        <p className="mb-2 text-xs font-medium uppercase text-dark/50">Formes libres</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={toggleFreeDraw}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
              drawingMode ? "border-coral bg-coral/5 text-coral" : "border-dark/10"
            }`}
          >
            <Pencil size={16} /> {drawingMode ? "Arrêter le dessin libre" : "Dessin libre"}
          </button>
          <button
            onClick={toggleBuildPolygon}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
              buildingPolygon ? "border-coral bg-coral/5 text-coral" : "border-dark/10"
            }`}
          >
            <Hexagon size={16} />
            {buildingPolygon ? "Clic = point, double-clic = valider" : "Construire une forme"}
          </button>
        </div>
      </div>
    </div>
  );
}