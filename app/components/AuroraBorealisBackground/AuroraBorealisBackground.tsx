"use client";

import { useEffect, useRef } from "react";

import styles from "./AuroraBorealisBackground.module.css";

const TWO_PI = Math.PI * 2;
const FRAME_INTERVAL = 1000 / 24;
const MAX_PIXEL_RATIO = 1.5;
const GLOW_RENDER_SCALE = 0.5;

type Harmonic = {
  amplitude: number;
  cycles: number;
  phase: number;
  speed: number;
};

function gaussian(value: number, center: number, width: number) {
  const distance = (value - center) / width;
  return Math.exp(-(distance * distance));
}

function createRandom(seed: number) {
  let value = seed % 233280;

  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function randomBetween(random: () => number, minimum: number, maximum: number) {
  return minimum + random() * (maximum - minimum);
}

function createHarmonics(random: () => number): Harmonic[] {
  return Array.from({ length: 6 }, (_, index) => ({
    amplitude: randomBetween(random, 0.005, 0.015) / (1 + index * 0.1),
    cycles: randomBetween(random, 0.6, 2.4) + index * 0.14,
    phase: randomBetween(random, 0, TWO_PI),
    speed: randomBetween(random, 0.8, 0.5) * (random() > 0.5 ? 1 : -1),
  }));
}

function getWaveHeight(position: number, time: number, harmonics: Harmonic[]) {
  const referenceShape =
    0.39 +
    0.115 * gaussian(position, 0.11, 0.115) -
    0.075 * gaussian(position, 0.28, 0.1) +
    0.036 * gaussian(position, 0.345, 0.055) -
    0.07 * gaussian(position, 0.43, 0.105) +
    0.105 * gaussian(position, 0.55, 0.13) -
    0.2 * gaussian(position, 0.81, 0.16) +
    0.02 * gaussian(position, 1.03, 0.18);

  const edgeFalloff = 0.68 + Math.sin(Math.PI * position) * 0.32;
  const fineMotion = harmonics.reduce(
    (total, harmonic) =>
      total +
      harmonic.amplitude *
        Math.sin(
          TWO_PI * harmonic.cycles * position +
            harmonic.phase +
            time * harmonic.speed
        ),
    0
  );
  const crestMotion =
    0.018 *
      gaussian(position, 0.29, 0.18) *
      Math.sin(time * 0.28 + harmonics[0].phase) +
    0.026 *
      gaussian(position, 0.81, 0.22) *
      Math.sin(time * 0.21 + harmonics[1].phase) +
    0.01 * Math.sin(time * 0.17 + harmonics[2].phase);

  return Math.min(
    0.57,
    Math.max(0.11, referenceShape + fineMotion * edgeFalloff + crestMotion)
  );
}

function buildWavePaths(
  width: number,
  height: number,
  time: number,
  harmonics: Harmonic[]
) {
  const pointCount = Math.max(48, Math.ceil(width / 24));
  const points = Array.from({ length: pointCount + 1 }, (_, index) => {
    const position = index / pointCount;

    return {
      x: position * width,
      y: getWaveHeight(position, time, harmonics) * height,
    };
  });

  const line = new Path2D();
  line.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midpointX = (previous.x + current.x) / 2;
    const midpointY = (previous.y + current.y) / 2;

    line.quadraticCurveTo(previous.x, previous.y, midpointX, midpointY);
  }

  const lastPoint = points[points.length - 1];
  line.quadraticCurveTo(lastPoint.x, lastPoint.y, lastPoint.x, lastPoint.y);

  const areaBelowLine = new Path2D(line);
  areaBelowLine.lineTo(width, height);
  areaBelowLine.lineTo(0, height);
  areaBelowLine.closePath();

  return { areaBelowLine, line };
}

function createAuroraGradient(
  context: CanvasRenderingContext2D,
  width: number
) {
  const gradient = context.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#0875b8");
  gradient.addColorStop(0.2, "#11d7d2");
  gradient.addColorStop(0.4, "#0089c7");
  gradient.addColorStop(0.56, "#095bd9");
  gradient.addColorStop(0.7, "#0872f3");
  gradient.addColorStop(1, "#5264ee");
  return gradient;
}

function drawGlowStroke(
  context: CanvasRenderingContext2D,
  path: Path2D,
  gradient: CanvasGradient,
  lineWidth: number,
  opacity: number,
  blur: number
) {
  context.save();
  context.globalCompositeOperation = "lighter";
  context.globalAlpha = opacity;
  context.strokeStyle = gradient;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.filter = `blur(${blur}px)`;
  context.stroke(path);
  context.restore();
}

export default function AuroraBorealisBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const glowCanvas = document.createElement("canvas");
    const glowContext = glowCanvas.getContext("2d");

    if (!canvas || !context || !glowContext) return undefined;

    const random = createRandom(
      Date.now() + Math.floor(Math.random() * 100000)
    );
    const harmonics = createHarmonics(random);
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const startedAt = performance.now();

    let animationFrame = 0;
    let glowHeight = 0;
    let glowWidth = 0;
    let height = 0;
    let lastFrameAt = -FRAME_INTERVAL;
    let width = 0;

    const render = (timestamp: number) => {
      if (!width || !height || !glowWidth || !glowHeight) return;

      const elapsed = reducedMotionQuery.matches
        ? 0
        : (timestamp - startedAt) / 1000;
      const mainPaths = buildWavePaths(width, height, elapsed, harmonics);
      const glowPaths = buildWavePaths(
        glowWidth,
        glowHeight,
        elapsed,
        harmonics
      );
      const mainGradient = createAuroraGradient(context, width);
      const glowGradient = createAuroraGradient(glowContext, glowWidth);

      glowContext.clearRect(0, 0, glowWidth, glowHeight);

      glowContext.save();
      glowContext.clip(glowPaths.areaBelowLine);
      drawGlowStroke(
        glowContext,
        glowPaths.line,
        glowGradient,
        glowHeight * 0.38,
        0.4,
        Math.max(10, glowHeight * 0.07)
      );
      glowContext.restore();

      context.clearRect(0, 0, width, height);
      context.drawImage(glowCanvas, 0, 0, width, height);

      context.save();
      context.globalAlpha = 0.32;
      context.strokeStyle = mainGradient;
      context.lineWidth = Math.max(0.75, Math.min(1.2, width / 1800));
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke(mainPaths.line);
      context.restore();
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;

      if (!width || !height) return;

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_PIXEL_RATIO
      );
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      glowWidth = Math.max(1, Math.round(width * GLOW_RENDER_SCALE));
      glowHeight = Math.max(1, Math.round(height * GLOW_RENDER_SCALE));
      glowCanvas.width = glowWidth;
      glowCanvas.height = glowHeight;
      render(performance.now());
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameAt >= FRAME_INTERVAL) {
        render(timestamp);
        lastFrameAt = timestamp;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const startAnimation = () => {
      if (animationFrame || document.hidden || reducedMotionQuery.matches)
        return;
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    const handleMotionPreferenceChange = () => {
      if (reducedMotionQuery.matches) {
        stopAnimation();
        render(startedAt);
      } else {
        startAnimation();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
    resize();
    startAnimation();

    return () => {
      stopAnimation();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleMotionPreferenceChange
      );
    };
  }, []);

  return (
    <div className={styles.background} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
