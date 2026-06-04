"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'l-cardio': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: string;
        stroke?: string;
        speed?: string;
        color?: string;
      };
    }
  }
}

export default function Loader({ fullScreen = true }: { fullScreen?: boolean }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Dynamic import to prevent SSR issues with custom elements
    async function loadLdrs() {
      const { cardio } = await import('ldrs');
      cardio.register();
      setMounted(true);
    }
    loadLdrs();
  }, []);

  if (!mounted) {
    // Placeholder while loading the custom element script
    return (
      <div className={fullScreen ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[9999]" : "flex items-center justify-center p-8 w-full"}>
        <div className="w-[50px] h-[50px]"></div>
      </div>
    );
  }

  const color = theme?.mode === "dark" ? "white" : "black";

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center p-8 w-full">
        <l-cardio size="50" stroke="4" speed="2" color={color}></l-cardio>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[9999]">
      <l-cardio
        size="50"
        stroke="4"
        speed="2" 
        color={color}
      ></l-cardio>
    </div>
  );
}
