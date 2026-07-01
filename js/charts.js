/* Bağımlılıksız SVG grafik üreticileri */
window.Charts = (function () {
  const NS = "http://www.w3.org/2000/svg";

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* Dairesel ilerleme halkası. value/target oranını gösterir. */
  function ring({ value, target, size = 140, stroke = 12, color, label, sublabel }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const ratio = target > 0 ? Math.min(value / target, 1) : 0;
    const over = target > 0 && value > target;
    const col = over ? cssVar("--danger") : (color || cssVar("--primary"));
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
          stroke="${cssVar("--surface-2")}" stroke-width="${stroke}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
          stroke="${col}" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - ratio)}"
          transform="rotate(-90 ${size / 2} ${size / 2})"
          style="transition: stroke-dashoffset 0.5s ease"/>
        <text x="50%" y="47%" text-anchor="middle" font-size="${size * 0.17}" font-weight="800"
          fill="${cssVar("--text")}">${label}</text>
        <text x="50%" y="62%" text-anchor="middle" font-size="${size * 0.085}"
          fill="${cssVar("--text-muted")}">${sublabel || ""}</text>
      </svg>`;
  }

  /* Çubuk grafik: data = [{label, value}], hedef çizgisi opsiyonel */
  function barChart({ data, target, height = 200, color, formatValue }) {
    const w = Math.max(320, data.length * 46);
    const padL = 6, padR = 6, padT = 18, padB = 26;
    const innerH = height - padT - padB;
    const maxVal = Math.max(target || 0, ...data.map((d) => d.value), 1);
    const barW = (w - padL - padR) / data.length;
    const col = color || cssVar("--primary");
    const fmt = formatValue || ((v) => Utils.fmt(v));

    let bars = "";
    data.forEach((d, i) => {
      const h = (d.value / maxVal) * innerH;
      const x = padL + i * barW + barW * 0.18;
      const y = padT + innerH - h;
      const bw = barW * 0.64;
      bars += `
        <rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h, 2)}" rx="5"
          fill="${d.value > 0 ? col : cssVar("--surface-2")}">
          <title>${Utils.esc(d.label)}: ${fmt(d.value)}</title>
        </rect>
        ${d.value > 0 ? `<text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle"
          font-size="10" fill="${cssVar("--text-muted")}">${fmt(d.value)}</text>` : ""}
        <text x="${x + bw / 2}" y="${height - 8}" text-anchor="middle"
          font-size="11" fill="${cssVar("--text-muted")}">${Utils.esc(d.label)}</text>`;
    });

    let targetLine = "";
    if (target) {
      const ty = padT + innerH - (target / maxVal) * innerH;
      targetLine = `<line x1="${padL}" x2="${w - padR}" y1="${ty}" y2="${ty}"
        stroke="${cssVar("--warning")}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    }

    return `<svg viewBox="0 0 ${w} ${height}" width="${w}" height="${height}">${bars}${targetLine}</svg>`;
  }

  /* Çizgi grafik: data = [{label, value}] */
  function lineChart({ data, height = 200, color, unit = "" }) {
    const valid = data.filter((d) => d.value != null);
    if (valid.length === 0) return `<div class="empty-note">Henüz veri yok</div>`;

    const w = Math.max(320, data.length * 52);
    const padL = 10, padR = 10, padT = 20, padB = 26;
    const innerW = w - padL - padR;
    const innerH = height - padT - padB;
    const values = valid.map((d) => d.value);
    let min = Math.min(...values), max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const range = max - min;
    min -= range * 0.15; max += range * 0.15;

    const xFor = (i) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const yFor = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;
    const col = color || cssVar("--primary");

    let path = "", dots = "", labels = "";
    let started = false;
    data.forEach((d, i) => {
      const x = xFor(i);
      labels += `<text x="${x}" y="${height - 8}" text-anchor="middle" font-size="11"
        fill="${cssVar("--text-muted")}">${Utils.esc(d.label)}</text>`;
      if (d.value == null) return;
      const y = yFor(d.value);
      path += started ? ` L ${x} ${y}` : `M ${x} ${y}`;
      started = true;
      dots += `
        <circle cx="${x}" cy="${y}" r="4" fill="${col}">
          <title>${Utils.esc(d.label)}: ${Utils.fmt(d.value, 1)}${unit}</title>
        </circle>
        <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="10"
          fill="${cssVar("--text-muted")}">${Utils.fmt(d.value, 1)}</text>`;
    });

    return `<svg viewBox="0 0 ${w} ${height}" width="${w}" height="${height}">
      <path d="${path}" fill="none" stroke="${col}" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}${labels}
    </svg>`;
  }

  return { ring, barChart, lineChart };
})();
