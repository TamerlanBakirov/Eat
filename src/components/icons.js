/* Vektör ikon seti (react-native-svg) — tutarlı 2px çizgi, 24 viewBox.
   Emoji yerine kullanılır: ölçeklenebilir, tema uyumlu, keskin. */
import React from "react";
import Svg, { Path, Circle, Line, Rect, Polyline } from "react-native-svg";

const PATHS = {
  overview: (p) => (
    <>
      <Line x1="6" y1="20" x2="6" y2="14" {...p} />
      <Line x1="12" y1="20" x2="12" y2="4" {...p} />
      <Line x1="18" y1="20" x2="18" y2="10" {...p} />
      <Line x1="3" y1="20" x2="21" y2="20" {...p} />
    </>
  ),
  nutrition: (p) => (
    <>
      <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" {...p} />
      <Path d="M2 21c0-3 1.85-5.36 5.08-6" {...p} />
    </>
  ),
  workout: (p) => (
    <>
      <Rect x="2.5" y="8" width="3.5" height="8" rx="1.4" {...p} />
      <Rect x="18" y="8" width="3.5" height="8" rx="1.4" {...p} />
      <Line x1="6" y1="12" x2="18" y2="12" {...p} />
      <Line x1="1.5" y1="10.5" x2="1.5" y2="13.5" {...p} />
      <Line x1="22.5" y1="10.5" x2="22.5" y2="13.5" {...p} />
    </>
  ),
  progress: (p) => (
    <>
      <Path d="M3 17 9 11l4 4 8-8" {...p} />
      <Path d="M17 4h4v4" {...p} />
    </>
  ),
  profile: (p) => (
    <>
      <Path d="M20 21v-1.5a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5V21" {...p} />
      <Circle cx="12" cy="7.5" r="4" {...p} />
    </>
  ),
  chevronLeft: (p) => <Path d="m15 18-6-6 6-6" {...p} />,
  chevronRight: (p) => <Path d="m9 18 6-6-6-6" {...p} />,
  plus: (p) => (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" {...p} />
      <Line x1="5" y1="12" x2="19" y2="12" {...p} />
    </>
  ),
  minus: (p) => <Line x1="5" y1="12" x2="19" y2="12" {...p} />,
  close: (p) => (
    <>
      <Path d="M18 6 6 18" {...p} />
      <Path d="m6 6 12 12" {...p} />
    </>
  ),
  check: (p) => <Path d="M20 6 9 17l-5-5" {...p} />,
  flame: (p) => (
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" {...p} />
  ),
  droplet: (p) => <Path d="M12 2.7l5.66 5.65a8 8 0 1 1-11.31 0z" {...p} />,
  trash: (p) => (
    <>
      <Path d="M3 6h18" {...p} />
      <Path d="M8 6V4h8v2" {...p} />
      <Path d="M18.5 6 17.5 20H6.5L5.5 6" {...p} />
      <Line x1="10" y1="10.5" x2="10" y2="16.5" {...p} />
      <Line x1="14" y1="10.5" x2="14" y2="16.5" {...p} />
    </>
  ),
  edit: (p) => (
    <>
      <Path d="M12 20h9" {...p} />
      <Path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" {...p} />
    </>
  ),
  target: (p) => (
    <>
      <Circle cx="12" cy="12" r="9" {...p} />
      <Circle cx="12" cy="12" r="5" {...p} />
      <Circle cx="12" cy="12" r="1.2" {...p} />
    </>
  ),
  clock: (p) => (
    <>
      <Circle cx="12" cy="12" r="9" {...p} />
      <Path d="M12 7v5l3 2" {...p} />
    </>
  ),
  scale: (p) => (
    <>
      <Circle cx="12" cy="9" r="6" {...p} />
      <Path d="M12 5v4l2.5 1.5" {...p} />
      <Path d="M5.5 14.5 3 21h18l-2.5-6.5" {...p} />
    </>
  ),
  moon: (p) => <Path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" {...p} />,
  sun: (p) => (
    <>
      <Circle cx="12" cy="12" r="4" {...p} />
      <Line x1="12" y1="2" x2="12" y2="4.5" {...p} />
      <Line x1="12" y1="19.5" x2="12" y2="22" {...p} />
      <Line x1="2" y1="12" x2="4.5" y2="12" {...p} />
      <Line x1="19.5" y1="12" x2="22" y2="12" {...p} />
      <Line x1="4.9" y1="4.9" x2="6.6" y2="6.6" {...p} />
      <Line x1="17.4" y1="17.4" x2="19.1" y2="19.1" {...p} />
      <Line x1="4.9" y1="19.1" x2="6.6" y2="17.4" {...p} />
      <Line x1="17.4" y1="6.6" x2="19.1" y2="4.9" {...p} />
    </>
  ),
  water: (p) => <Path d="M12 2.7l5.66 5.65a8 8 0 1 1-11.31 0z" {...p} />,
  dot: (p) => <Circle cx="12" cy="12" r="3" {...p} fill={p.stroke} />,
  star: (p) => <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" {...p} />,
  search: (p) => (
    <>
      <Circle cx="11" cy="11" r="7" {...p} />
      <Path d="m20 20-3.5-3.5" {...p} />
    </>
  ),
};

export function Icon({ name, size = 22, color = "#000", strokeWidth = 2, fill = "none" }) {
  const render = PATHS[name];
  if (!render) return null;
  const p = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(p)}
    </Svg>
  );
}
