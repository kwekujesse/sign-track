"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js");
          // Handle updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Activate the new SW immediately
                reg.waiting?.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });

          // If there's a waiting worker, prompt it to activate
          reg.waiting?.postMessage({ type: "SKIP_WAITING" });
        } catch (e) {
          console.warn("SW registration failed", e);
        }
      };
      register();
    }
  }, []);
  return null;
}

