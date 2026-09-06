"use client";

import { useId } from "react";

import styles from "./AnimatedNukleioIcon.module.css";

type AnimatedNukleioIconProps = {
  className?: string;
  title?: string;
};

export default function AnimatedNukleioIcon({
  className = "",
  title,
}: AnimatedNukleioIconProps) {
  const id = useId().replace(/:/g, "");
  const hexagonGradientId = `${id}-hexagon-gradient`;
  const titleId = `${id}-title`;

  return (
    <svg
      className={`${styles.icon} ${className}`}
      width="100%"
      height="100%"
      viewBox="0 0 310 310"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      focusable="false"
      role={title ? "img" : undefined}
    >
      {title && <title id={titleId}>{title}</title>}

      <g className={styles.hexagon}>
        <path
          d="M150.5 8.37109C153.285 6.76356 156.715 6.76356 159.5 8.37109L279.734 77.7891C282.519 79.3968 284.234 82.3678 284.234 85.583V224.417C284.234 227.632 282.519 230.603 279.734 232.211L159.5 301.629C156.802 303.186 153.498 303.235 150.763 301.774L150.5 301.629L30.2656 232.211C27.4813 230.603 25.7656 227.632 25.7656 224.417V85.583C25.7656 82.3678 27.4813 79.3968 30.2656 77.7891L150.5 8.37109Z"
          fill="#070B18"
          stroke={`url(#${hexagonGradientId})`}
          strokeWidth="10"
        />
      </g>

      <g className={styles.letter}>
        <path
          d="M99 210C97.8954 210 97 209.105 97 208V97C97 95.8954 97.8954 95 99 95H121.623C122.214 95 122.775 95.2614 123.155 95.714L183.392 167.46C184.592 168.89 186.924 168.041 186.924 166.174V97C186.924 95.8954 187.819 95 188.924 95H210C211.105 95 212 95.8954 212 97V208C212 209.105 211.105 210 210 210H187.376C186.786 210 186.225 209.739 185.845 209.287L125.288 137.216C124.087 135.787 121.757 136.637 121.757 138.503V208C121.757 209.105 120.862 210 119.757 210H99Z"
          fill="white"
        />
      </g>

      <g className={styles.node}>
        <circle
          cx="258"
          cy="66"
          r="15"
          stroke="currentColor"
          strokeWidth="10"
        />
        <path
          d="M268 66C268 71.5228 263.523 76 258 76C252.477 76 248 71.5228 248 66C248 60.4772 252.477 56 258 56C263.523 56 268 60.4772 268 66Z"
          fill="#070B18"
        />
      </g>

      <defs>
        <linearGradient
          id={hexagonGradientId}
          x1="22.4342"
          y1="78.5197"
          x2="287.566"
          y2="231.48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8EE5C3" />
          <stop offset="1" stopColor="#378AFB" />
        </linearGradient>
      </defs>
    </svg>
  );
}
