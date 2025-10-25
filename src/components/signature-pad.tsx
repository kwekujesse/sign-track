
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
  const pointsRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const dprRef = useRef(1);
  const originalOverflowRef = useRef<string | null>(null);
  const originalOverscrollRef = useRef<string | null>(null);

  const getContext = () => {
    return canvasRef.current?.getContext("2d");
  };
  
  const setCanvasSize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      dprRef.current = dpr;
      // Resize the internal canvas to match device pixel ratio for crisp lines
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = getContext();
      if (ctx) {
        // Reset any existing transforms then scale for DPR
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#000";
        ctx.miterLimit = 1;
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
      context.lineWidth = 2.5;
      context.strokeStyle = "#000";
      context.fillStyle = "#000";
    }
  }, []);

  const getCoords = (e: MouseEvent | TouchEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const event = 'touches' in e ? e.touches[0] : (e as MouseEvent | PointerEvent);
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const lockScroll = () => {
    if (typeof document === 'undefined') return;
    originalOverflowRef.current = document.body.style.overflow ?? '';
    originalOverscrollRef.current = document.documentElement.style.overscrollBehavior ?? '';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
  }

  const unlockScroll = () => {
    if (typeof document === 'undefined') return;
    if (originalOverflowRef.current !== null) {
      document.body.style.overflow = originalOverflowRef.current;
    }
    if (originalOverscrollRef.current !== null) {
      document.documentElement.style.overscrollBehavior = originalOverscrollRef.current;
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    const { x, y } = getCoords(e.nativeEvent as any);
    isDrawing.current = true;
    pointsRef.current = [{ x, y, t: Date.now() }];
    const canvas = canvasRef.current;
    if (canvas && 'pointerId' in e) {
      try { (canvas as any).setPointerCapture?.((e as React.PointerEvent).pointerId); } catch { /* ignore */ }
    }
    lockScroll();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const context = getContext();
    if (context) {
      const { x, y } = getCoords(e.nativeEvent as any);
      const pts = pointsRef.current;
      pts.push({ x, y, t: Date.now() });
      const len = pts.length;
      context.beginPath();
      if (len < 3) {
        // draw simple segment
        const p1 = pts[len - 2];
        const p2 = pts[len - 1];
        if (p1 && p2) {
          context.moveTo(p1.x, p1.y);
          context.lineTo(p2.x, p2.y);
        }
      } else {
        // Smooth with quadratic curve between midpoints
        const p0 = pts[len - 3];
        const p1 = pts[len - 2];
        const p2 = pts[len - 1];
        const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        context.moveTo(mid1.x, mid1.y);
        context.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      }
      context.stroke();
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const ctx = getContext();
    const pts = pointsRef.current;
    if (ctx && pts.length <= 1 && pts[0]) {
      // Draw a dot if it was just a tap
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, Math.max(1.5, ctx.lineWidth / 2), 0, Math.PI * 2);
      ctx.fill();
    }
    pointsRef.current = [];
    unlockScroll();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = getContext();
    if (canvas && context) {
        const rect = canvas.getBoundingClientRect();
        context.clearRect(0, 0, rect.width, rect.height);
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
      onPointerDown={startDrawing as any}
      onPointerMove={draw as any}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      onMouseLeave={stopDrawing}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "w-full h-48 rounded-md border-2 border-dashed bg-muted/50 cursor-crosshair touch-none select-none overscroll-none",
        props.className
      )}
    />
  );
});

SignaturePad.displayName = "SignaturePad";

export { SignaturePad };
