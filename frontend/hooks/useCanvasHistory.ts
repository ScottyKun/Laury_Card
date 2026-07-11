"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";

export function useCanvasHistory(canvas: Canvas | null) {
  const historyRef = useRef<string[]>([]);
  const indexRef = useRef(-1);
  const isRestoringRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  const pushState = useCallback(() => {
    if (!canvas || isRestoringRef.current) return;
    const json = JSON.stringify(canvas.toJSON());
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(json);
    indexRef.current = historyRef.current.length - 1;
    updateFlags();
  }, [canvas, updateFlags]);

  useEffect(() => {
    if (!canvas) return;

    historyRef.current = [JSON.stringify(canvas.toJSON())];
    indexRef.current = 0;
    updateFlags();

    canvas.on("object:added", pushState);
    canvas.on("object:modified", pushState);
    canvas.on("object:removed", pushState);

    return () => {
      canvas.off("object:added", pushState);
      canvas.off("object:modified", pushState);
      canvas.off("object:removed", pushState);
    };
  }, [canvas, pushState, updateFlags]);

  const restore = useCallback(
    (index: number) => {
      if (!canvas) return;
      const json = historyRef.current[index];
      if (!json) return;

      isRestoringRef.current = true;
      canvas.loadFromJSON(JSON.parse(json)).then(() => {
        canvas.renderAll();
        isRestoringRef.current = false;
      });
    },
    [canvas]
  );

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    restore(indexRef.current);
    updateFlags();
  }, [restore, updateFlags]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    restore(indexRef.current);
    updateFlags();
  }, [restore, updateFlags]);

  return { undo, redo, canUndo, canRedo };
}