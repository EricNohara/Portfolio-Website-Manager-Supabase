"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./AuthBackground.module.css";
import AnimatedNukleioIcon from "../AnimatedNukleioIcon/AnimatedNukleioIcon";

import type { CSSProperties } from "react";

type AuthBackgroundProps = {
  className?: string;
};

type CloudDirection = "left" | "right";
type CloudDepth = "far" | "middle" | "near";

type CloudAsset = {
  height: number;
  src: string;
  width: number;
};

type CloudConfig = {
  delay: number;
  depth: CloudDepth;
  direction?: CloudDirection;
  duration: number;
  size: number;
  top: string;
};

type CloudProps = CloudConfig & {
  assetSeed: number;
};

type CloudStyle = CSSProperties & {
  "--cloud-delay": string;
  "--cloud-duration": string;
  "--cloud-size": string;
  "--cloud-top": string;
};

const CLOUD_ASSETS: CloudAsset[] = [
  { height: 252, src: "/images/clouds/cloud-variant-01.png", width: 445 },
  { height: 164, src: "/images/clouds/cloud-variant-02.png", width: 298 },
  { height: 156, src: "/images/clouds/cloud-variant-03.png", width: 389 },
  { height: 251, src: "/images/clouds/cloud-variant-04.png", width: 339 },
  { height: 184, src: "/images/clouds/cloud-variant-05.png", width: 330 },
  { height: 143, src: "/images/clouds/cloud-variant-06.png", width: 391 },
  { height: 233, src: "/images/clouds/cloud-variant-07.png", width: 412 },
  { height: 170, src: "/images/clouds/cloud-variant-08.png", width: 300 },
  { height: 132, src: "/images/clouds/cloud-variant-09.png", width: 388 },
  { height: 184, src: "/images/clouds/cloud-variant-10.png", width: 378 },
  { height: 155, src: "/images/clouds/cloud-variant-11.png", width: 279 },
  { height: 143, src: "/images/clouds/cloud-variant-12.png", width: 411 },
  { height: 190, src: "/images/clouds/cloud-variant-13.png", width: 482 },
  { height: 142, src: "/images/clouds/cloud-variant-14.png", width: 273 },
  { height: 154, src: "/images/clouds/cloud-variant-15.png", width: 421 },
];

const clouds: CloudConfig[] = [
  { delay: -18, depth: "far", duration: 108, size: 13, top: "9%" },
  { delay: -64, depth: "far", duration: 92, size: 16, top: "36%" },
  { delay: -15, depth: "middle", duration: 76, size: 21, top: "24%" },
  { delay: -49, depth: "middle", duration: 68, size: 24, top: "57%" },
  { delay: -8, depth: "near", duration: 58, size: 40, top: "77%" },
  { delay: -31, depth: "near", duration: 52, size: 52, top: "84%" },
  { delay: -20, depth: "near", duration: 64, size: 46, top: "89%" },
  { delay: -47, depth: "near", duration: 56, size: 58, top: "93%" },
];

function pickCloudAsset(seed: number) {
  // A coprime step walks the asset set without repeats for adjacent clouds.
  return CLOUD_ASSETS[(seed * 7 + 3) % CLOUD_ASSETS.length];
}

function Cloud({
  assetSeed,
  delay,
  depth,
  direction = "right",
  duration,
  size,
  top,
}: CloudProps) {
  const asset = pickCloudAsset(assetSeed);
  const isMirrored = assetSeed % 2 === 0;
  const style = {
    "--cloud-delay": `${delay}s`,
    "--cloud-duration": `${duration}s`,
    "--cloud-size": `${size}rem`,
    "--cloud-top": top,
  } as CloudStyle;

  return (
    <span
      className={`${styles.cloud} ${styles[depth]} ${styles[direction]} ${isMirrored ? styles.mirrored : ""}`}
      style={style}
    >
      <Image
        src={asset.src}
        alt=""
        width={asset.width}
        height={asset.height}
        sizes={`${size}rem`}
        className={styles.cloudImage}
        draggable={false}
      />
    </span>
  );
}

export default function AuthBackground({ className = "" }: AuthBackgroundProps) {
  const [cloudSeed, setCloudSeed] = useState<number | null>(null);

  useEffect(() => {
    setCloudSeed(Math.floor(Math.random() * CLOUD_ASSETS.length));
  }, []);

  return (
    <div className={`${styles.background} ${className}`} aria-hidden="true">
      <div className={styles.starField} />

      <div className={styles.orbitStage}>
        <span className={`${styles.orbit} ${styles.orbitOne}`}>
          <span className={`${styles.orbitParticle} ${styles.orbitParticleOne}`} />
        </span>
        <span className={`${styles.orbit} ${styles.orbitTwo}`}>
          <span className={`${styles.orbitParticle} ${styles.orbitParticleTwo}`} />
        </span>
        <span className={`${styles.orbit} ${styles.orbitThree}`}>
          <span className={`${styles.orbitParticle} ${styles.orbitParticleThree}`} />
        </span>

        <span className={styles.iconAura} />
        <span className={styles.iconWrapper}>
          <AnimatedNukleioIcon />
        </span>
      </div>

      <div className={styles.cloudLayer}>
        {cloudSeed !== null && clouds.map((cloud, index) => (
          <Cloud
            key={`${cloud.depth}-${index}`}
            assetSeed={cloudSeed + index}
            {...cloud}
          />
        ))}
      </div>

      <div className={styles.vignette} />
    </div>
  );
}
