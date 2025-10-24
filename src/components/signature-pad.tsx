
"use client";

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
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
  
  // By using state for last coordinates, we can ensure re-renders if needed.
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const getContext = () => {
    return canvasRef.current?.getContext("2d");
  };
  
  const setCanvasSize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      const context = getContext();
      const imageData = context?.getImageData(0,0, canvas.width, canvas.height);

      canvas.width = width;
      canvas.height = height;

      if(context && imageData) {
        context.putImageData(imageData, 0, 0);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 3;
        context.strokeStyle = "#000";
      }
    }
  };

  useEffect(() => {
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);
  
  useEffect(() => {
    const context = getContext();
    if(context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 3;
      context.strokeStyle = "#000";
    }
  }, []);

  const getCoords = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const event = 'touches' in e ? e.touches[0] : e;
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoords(e.nativeEvent);
    isDrawing.current = true;
    setLastPosition({ x, y });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const context = getContext();
    if (context) {
      const { x, y } = getCoords(e.nativeEvent);
      context.beginPath();
      context.moveTo(lastPosition.x, lastPosition.y);
      context.lineTo(x, y);
      context.stroke();
      setLastPosition({ x, y });
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = getContext();
    if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  useImperativeHandle(ref, () => ({
    clear: () => {
      clearCanvas();
    },
    toDataURL: () => {
      return canvasRef.current?.toDataURL("image/png") || "";
    },
    isEmpty: () => {
      const canvas = canvasRef.current;
      if (!canvas) return true;
      const context = getContext();
      if (!context) return true;

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
