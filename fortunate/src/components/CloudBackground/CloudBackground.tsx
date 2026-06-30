import React, { useEffect, useRef } from "react";
import styles from "./CloudBackground.module.css";

interface CloudConfig {
  id: number;
  width: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  opacity: number;
  speed: number;
  animDuration: string;
  animDelay: string;
  animName: "floatA" | "floatB";
  rotate?: string;
  scale?: string;
}

const CLOUDS: CloudConfig[] = [
  {
    id: 1,
    width: "42rem",
    top: "2%",
    left: "-4%",
    opacity: 0.55,
    speed: 0.015,
    animDuration: "28s",
    animDelay: "0s",
    animName: "floatA",
  },
  {
    id: 2,
    width: "30rem",
    top: "8%",
    right: "-2%",
    opacity: 0.4,
    speed: 0.028,
    animDuration: "36s",
    animDelay: "-14s",
    animName: "floatB",
    rotate: "180deg",
  },
  {
    id: 3,
    width: "22rem",
    top: "42%",
    left: "5%",
    opacity: 0.28,
    speed: 0.02,
    animDuration: "24s",
    animDelay: "-7s",
    animName: "floatA",
    rotate: "8deg",
  },
  {
    id: 4,
    width: "26rem",
    top: "55%",
    right: "3%",
    opacity: 0.32,
    speed: 0.033,
    animDuration: "20s",
    animDelay: "-9s",
    animName: "floatB",
    rotate: "175deg",
  },
  {
    id: 5,
    width: "16rem",
    top: "25%",
    left: "48%",
    opacity: 0.2,
    speed: 0.042,
    animDuration: "18s",
    animDelay: "-5s",
    animName: "floatA",
    rotate: "-5deg",
  },
  {
    id: 6,
    width: "34rem",
    bottom: "8%",
    left: "14%",
    opacity: 0.38,
    speed: 0.018,
    animDuration: "32s",
    animDelay: "-20s",
    animName: "floatB",
  },
];

export function CloudBackground() {
  const refs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      refs.current.forEach((el, i) => {
        if (!el) return;
        const { speed } = CLOUDS[i];
        el.style.translate = `${dx * speed}px ${dy * speed}px`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={styles.container} aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <img
          key={cloud.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          src="/cloud.png"
          className={`${styles.cloud} ${styles[cloud.animName]}`}
          style={{
            width: cloud.width,
            top: cloud.top,
            bottom: cloud.bottom,
            left: cloud.left,
            right: cloud.right,
            opacity: cloud.opacity,
            rotate: cloud.rotate,
            animationDuration: cloud.animDuration,
            animationDelay: cloud.animDelay,
          }}
        />
      ))}
    </div>
  );
}
