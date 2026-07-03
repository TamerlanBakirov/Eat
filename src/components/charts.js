/* react-native-svg tabanlı grafikler: halka, çubuk, çizgi */
import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Svg, { Circle, Rect, Line, Path, Text as SvgText } from "react-native-svg";
import { useTheme } from "./ui";
import { fmt } from "../lib/utils";

/* Dairesel ilerleme halkası */
export function Ring({ value, target, size = 140, stroke = 12, color, label, sublabel }) {
  const c = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const ratio = target > 0 ? Math.min(Math.max(value, 0) / target, 1) : 0;
  const over = target > 0 && value > target;
  const col = over ? c.danger : color || c.primary;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.surface2} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={col} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ color: c.text, fontSize: size * 0.16, fontWeight: "800" }}>{label}</Text>
        {sublabel ? <Text style={{ color: c.muted, fontSize: size * 0.08 }}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

/* Çubuk grafik; opsiyonel hedef çizgisi */
export function BarChart({ data, target, height = 170, color, width }) {
  const c = useTheme();
  const { width: winW } = useWindowDimensions();
  const w = width || winW - 64;
  const padT = 16, padB = 22;
  const innerH = height - padT - padB;
  const maxVal = Math.max(target || 0, ...data.map((d) => d.value), 1);
  const barW = w / data.length;
  const col = color || c.primary;

  return (
    <Svg width={w} height={height}>
      {data.map((d, i) => {
        const h = (d.value / maxVal) * innerH;
        const x = i * barW + barW * 0.18;
        const y = padT + innerH - h;
        const bw = barW * 0.64;
        return (
          <React.Fragment key={i}>
            <Rect
              x={x} y={d.value > 0 ? y : padT + innerH - 2}
              width={bw} height={d.value > 0 ? Math.max(h, 2) : 2}
              rx={4} fill={d.value > 0 ? col : c.surface2}
            />
            {d.value > 0 && (
              <SvgText x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize={9} fill={c.muted}>
                {fmt(d.value)}
              </SvgText>
            )}
            <SvgText x={x + bw / 2} y={height - 6} textAnchor="middle" fontSize={10} fill={c.muted}>
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
      {target ? (
        <Line
          x1={0} x2={w}
          y1={padT + innerH - (target / maxVal) * innerH}
          y2={padT + innerH - (target / maxVal) * innerH}
          stroke={c.warning} strokeWidth={1.5} strokeDasharray="5 4"
        />
      ) : null}
    </Svg>
  );
}

/* Çizgi grafik */
export function LineChart({ data, height = 170, color, width }) {
  const c = useTheme();
  const { width: winW } = useWindowDimensions();
  const w = width || winW - 64;
  const valid = data.filter((d) => d.value != null);

  if (valid.length === 0) {
    return <Text style={{ color: c.muted, fontSize: 13, textAlign: "center", paddingVertical: 14 }}>Henüz veri yok</Text>;
  }

  const padL = 8, padR = 8, padT = 18, padB = 22;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const values = valid.map((d) => d.value);
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;
  min -= range * 0.15; max += range * 0.15;

  const xFor = (i) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yFor = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;
  const col = color || c.primary;

  let path = "";
  let started = false;
  data.forEach((d, i) => {
    if (d.value == null) return;
    const x = xFor(i), y = yFor(d.value);
    path += started ? ` L ${x} ${y}` : `M ${x} ${y}`;
    started = true;
  });

  return (
    <Svg width={w} height={height}>
      <Path d={path} fill="none" stroke={col} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = xFor(i);
        return (
          <React.Fragment key={i}>
            {d.value != null && (
              <>
                <Circle cx={x} cy={yFor(d.value)} r={4} fill={col} />
                <SvgText x={x} y={yFor(d.value) - 9} textAnchor="middle" fontSize={9} fill={c.muted}>
                  {fmt(d.value, 1)}
                </SvgText>
              </>
            )}
            <SvgText x={x} y={height - 6} textAnchor="middle" fontSize={10} fill={c.muted}>
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
