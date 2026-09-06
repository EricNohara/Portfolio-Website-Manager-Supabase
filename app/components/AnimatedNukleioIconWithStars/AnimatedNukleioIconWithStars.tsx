"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./AnimatedNukleioIconWithStars.module.css";
import AnimatedNukleioIcon from "../AnimatedNukleioIcon/AnimatedNukleioIcon";

const TWO_PI = Math.PI * 2;
const MAX_ACTIVE_STARS = 20;
const STAR_SIZE_PRESETS = [1, 2.5, 5];

type AnimatedNukleioIconWithStarsProps = {
  className?: string;
  title?: string;
};

type Star = {
  id: number;
  style: CSSProperties;
};

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}

function distanceToViewportEdge(centerX: number, centerY: number, angle: number) {
  const horizontalDirection = Math.cos(angle);
  const verticalDirection = Math.sin(angle);
  const horizontalDistance = horizontalDirection > 0
    ? (window.innerWidth - centerX) / horizontalDirection
    : -centerX / horizontalDirection;
  const verticalDistance = verticalDirection > 0
    ? (window.innerHeight - centerY) / verticalDirection
    : -centerY / verticalDirection;

  return Math.min(horizontalDistance, verticalDistance) + 24;
}

export default function AnimatedNukleioIconWithStars({
  className = "",
  title,
}: AnimatedNukleioIconWithStarsProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const nextStarId = useRef(0);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!container) return undefined;

    setPortalTarget(document.body);

    let disposed = false;
    let isInViewport = true;
    let burstTimer = 0;

    const clearBurstTimer = () => {
      if (!burstTimer) return;
      window.clearTimeout(burstTimer);
      burstTimer = 0;
    };

    const shouldAnimate = () => (
      !disposed
      && !document.hidden
      && isInViewport
      && !reducedMotionQuery.matches
    );

    const emitBurst = () => {
      const bounds = container.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      if (!bounds.width || !bounds.height) return;

      const starCount = Math.floor(randomBetween(1, 5));
      const baseSpeed = randomBetween(150, 200);
      const speedStep = randomBetween(40, 65);
      const emittedStars = Array.from({ length: starCount }, (_, index) => {
        const angle = randomBetween(0, TWO_PI);
        const distance = distanceToViewportEdge(centerX, centerY, angle);
        const speed = baseSpeed + index * speedStep;
        const duration = Math.max(1400, Math.min(6500, (distance / speed) * 1000));
        const size = STAR_SIZE_PRESETS[Math.floor(Math.random() * STAR_SIZE_PRESETS.length)];

        nextStarId.current += 1;

        return {
          id: nextStarId.current,
          style: {
            "--star-x": `${Math.cos(angle) * distance}px`,
            "--star-y": `${Math.sin(angle) * distance}px`,
            animationDuration: `${Math.round(duration)}ms`,
            height: `${size}px`,
            left: `${centerX}px`,
            top: `${centerY}px`,
            width: `${size}px`,
          } as CSSProperties,
        };
      });

      setStars((currentStars) => [
        ...currentStars,
        ...emittedStars,
      ].slice(-MAX_ACTIVE_STARS));
    };

    const scheduleBurst = (initial = false) => {
      clearBurstTimer();
      if (!shouldAnimate()) return;

      burstTimer = window.setTimeout(() => {
        emitBurst();
        scheduleBurst();
      }, initial ? randomBetween(600, 1800) : randomBetween(450, 2600));
    };

    const pauseOrResume = () => {
      if (shouldAnimate()) {
        scheduleBurst(true);
      } else {
        clearBurstTimer();
        setStars([]);
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting;
      pauseOrResume();
    });

    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", pauseOrResume);
    reducedMotionQuery.addEventListener("change", pauseOrResume);
    scheduleBurst(true);

    return () => {
      disposed = true;
      clearBurstTimer();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", pauseOrResume);
      reducedMotionQuery.removeEventListener("change", pauseOrResume);
    };
  }, []);

  const removeStar = (starId: number) => {
    setStars((currentStars) => currentStars.filter((star) => star.id !== starId));
  };

  return (
    <span ref={containerRef} className={`${styles.container} ${className}`}>
      <AnimatedNukleioIcon className={styles.icon} title={title} />
      {portalTarget && createPortal(
        <span className={styles.starLayer} aria-hidden="true">
          {stars.map((star) => (
            <span
              key={star.id}
              className={styles.star}
              style={star.style}
              onAnimationEnd={() => removeStar(star.id)}
            />
          ))}
        </span>,
        portalTarget,
      )}
    </span>
  );
}
