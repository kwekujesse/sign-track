"use client";

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

export interface SignaturePadRef {
  clear: () => void;
  toDataURL: () => string;
  isEmpty: () => boolean;
}

const SignaturePad = forwardRef<
  SignaturePadRef,
  React.CanvasHTMLAttributes<HTMLCanvasElement>
>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const getContext = () => {
    return canvasRef.current?.getContext("2d");
  };

  const setCanvasSize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    }
  };

  useEffect(() => {
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const context = getContext();
    if (context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 3;
      context.strokeStyle = "#000";
    }

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  const getCoords = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e instanceof MouseEvent) {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    if (e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getCoords(e);
    [lastX.current, lastY.current] = [x, y];
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const context = getContext();
    if (context) {
      const { x, y } = getCoords(e);
      context.beginPath();
      context.moveTo(lastX.current, lastY.current);
      context.lineTo(x, y);
      context.stroke();
      [lastX.current, lastY.current] = [x, y];
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const context = getContext();
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    toDataURL: () => {
      return canvasRef.current?.toDataURL("image/png") || "";
    },
    isEmpty: () => {
      const canvas = canvasRef.current;
      if (!canvas) return true;
      const context = getContext();
      if (!context) return true;

      // Check if the canvas is blank
      const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
      );

      return !pixelBuffer.some(color => color !== 0);
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className={cn(
        "w-full h-48 rounded-md border-2 border-dashed bg-muted/50 cursor-crosshair",
        props.className
      )}
    />
  );
});

SignaturePad.displayName = "SignaturePad";

export { SignaturePad };
