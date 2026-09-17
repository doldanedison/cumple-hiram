// Ilustraciones SVG propias, estilo acuarela pastel (Arca de Noé)
window.ART = (function () {
  const cloud = (x, y, s = 1, o = .95) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">
    <ellipse cx="0" cy="10" rx="46" ry="18" fill="#fff"/><circle cx="-18" cy="0" r="20" fill="#fff"/>
    <circle cx="12" cy="-8" r="26" fill="#fff"/><circle cx="36" cy="6" r="16" fill="#fff"/></g>`;

  const rainbow = (cx, cy, r, w = 14) => {
    const cols = ["#f4b6c2", "#f9d8a8", "#f6eea8", "#c7e5c0", "#b9d6f0", "#cfc2ec"];
    return cols.map((c, i) => {
      const rr = r - i * w;
      return `<path d="M${cx - rr} ${cy} A${rr} ${rr} 0 0 1 ${cx + rr} ${cy}" stroke="${c}" stroke-width="${w + 1}" fill="none" stroke-linecap="round"/>`;
    }).join("");
  };

  const dove = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-30 6 C-10 -4 10 -2 26 8 C12 18 -10 20 -30 6Z" fill="#fff" stroke="#c9d6e6" stroke-width="2"/>
    <path d="M-6 4 C-2 -30 20 -34 30 -26 C18 -18 10 -6 6 6Z" fill="#fff" stroke="#c9d6e6" stroke-width="2"/>
    <circle cx="20" cy="6" r="2.4" fill="#5b6b82"/><path d="M26 8 l10 2 -10 3Z" fill="#f2b56b"/>
    <path d="M36 10 q10 -8 18 -4" stroke="#8fb58a" stroke-width="2.5" fill="none"/>
    <ellipse cx="46" cy="4" rx="5" ry="2.6" fill="#a9cf9f" transform="rotate(-25 46 4)"/>
    <ellipse cx="53" cy="8" rx="5" ry="2.6" fill="#a9cf9f" transform="rotate(20 53 8)"/></g>`;

  const balloon = (x, y, c, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 40 q-6 30 4 60" stroke="#b9a894" stroke-width="1.6" fill="none"/>
    <ellipse cx="0" cy="0" rx="26" ry="32" fill="${c}"/><path d="M-4 31 l4 8 4 -8Z" fill="${c}"/>
    <ellipse cx="-9" cy="-12" rx="6" ry="10" fill="#fff" opacity=".45"/></g>`;

  const star = (x, y, s = 1, c = "#f7d98b") => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L3 -3 10 -3 4 2 6 10 0 5 -6 10 -4 2 -10 -3 -3 -3Z" fill="${c}"/>`;

  const waves = (y, w = 400) => `
    <path d="M0 ${y} q25 -18 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V${y + 200} H0Z" fill="#b9d6f0"/>
    <path d="M-20 ${y + 22} q25 -16 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V${y + 200} H-20Z" fill="#9cc3e6" opacity=".85"/>
    <path d="M0 ${y + 44} q25 -14 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V${y + 200} H0Z" fill="#dcecf8" opacity=".9"/>`;

  // --- animales ---
  const eyes = (dx = 7, y = -2) => `<circle cx="${-dx}" cy="${y}" r="2.6" fill="#3d3a3a"/><circle cx="${dx}" cy="${y}" r="2.6" fill="#3d3a3a"/>
    <circle cx="${-dx + .8}" cy="${y - .9}" r=".9" fill="#fff"/><circle cx="${dx + .8}" cy="${y - .9}" r=".9" fill="#fff"/>`;
  const cheeks = (dx = 12, y = 5) => `<circle cx="${-dx}" cy="${y}" r="3.5" fill="#f5a9b8" opacity=".6"/><circle cx="${dx}" cy="${y}" r="3.5" fill="#f5a9b8" opacity=".6"/>`;
  const smile = (y = 7) => `<path d="M-4 ${y} q4 4 8 0" stroke="#3d3a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;

  const lion = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${Math.cos(a) * 24}" cy="${Math.sin(a) * 24}" r="11" fill="#e8a868"/>`; }).join("")}
    <circle r="24" fill="#d9925a"/><circle cx="-16" cy="-17" r="6" fill="#f6cf8e"/><circle cx="16" cy="-17" r="6" fill="#f6cf8e"/>
    <circle r="19" fill="#f6cf8e"/>${eyes()}${cheeks()}<ellipse cx="0" cy="4" rx="4" ry="3" fill="#b8745a"/>${smile(9)}</g>`;

  const elephant = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="-24" cy="0" rx="16" ry="20" fill="#a9bdd6"/><ellipse cx="-24" cy="0" rx="10" ry="13" fill="#f3c6cf"/>
    <ellipse cx="24" cy="0" rx="16" ry="20" fill="#a9bdd6"/><ellipse cx="24" cy="0" rx="10" ry="13" fill="#f3c6cf"/>
    <circle r="20" fill="#b9cbe0"/><path d="M-5 6 q0 20 10 22 q4 0 3 -5 q-6 -2 -5 -17Z" fill="#b9cbe0"/>
    ${eyes(8, -4)}${cheeks(13, 5)}</g>`;

  const giraffe = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-8" y="0" width="16" height="70" rx="6" fill="#f3cf7a"/>
    <circle cx="-2" cy="20" r="4" fill="#d69a5a"/><circle cx="4" cy="40" r="3.5" fill="#d69a5a"/><circle cx="-3" cy="56" r="4" fill="#d69a5a"/>
    <line x1="-6" y1="-20" x2="-8" y2="-32" stroke="#c98a4e" stroke-width="3"/><line x1="6" y1="-20" x2="8" y2="-32" stroke="#c98a4e" stroke-width="3"/>
    <circle cx="-8" cy="-33" r="3.5" fill="#c98a4e"/><circle cx="8" cy="-33" r="3.5" fill="#c98a4e"/>
    <ellipse cx="-17" cy="-16" rx="7" ry="4" fill="#f3cf7a" transform="rotate(-25 -17 -16)"/><ellipse cx="17" cy="-16" rx="7" ry="4" fill="#f3cf7a" transform="rotate(25 17 -16)"/>
    <ellipse cx="0" cy="-8" rx="16" ry="18" fill="#f6d98a"/><ellipse cx="0" cy="4" rx="11" ry="7" fill="#f7e3b0"/>
    ${eyes(6, -10)}${cheeks(11, -2)}<circle cx="-3" cy="3" r="1.3" fill="#8a6a4a"/><circle cx="3" cy="3" r="1.3" fill="#8a6a4a"/></g>`;

  const hippo = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="-13" cy="-16" r="6" fill="#e9b2c4"/><circle cx="13" cy="-16" r="6" fill="#e9b2c4"/>
    <ellipse rx="21" ry="18" fill="#f1bfd0"/><ellipse cy="10" rx="20" ry="12" fill="#f6d0dc"/>
    ${eyes(8, -6)}<circle cx="-6" cy="8" r="2" fill="#c98aa0"/><circle cx="6" cy="8" r="2" fill="#c98aa0"/></g>`;

  const zebra = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="-12" cy="-20" rx="5" ry="9" fill="#fff" stroke="#6b6b75" stroke-width="1.5"/><ellipse cx="12" cy="-20" rx="5" ry="9" fill="#fff" stroke="#6b6b75" stroke-width="1.5"/>
    <ellipse rx="17" ry="20" fill="#fff" stroke="#6b6b75" stroke-width="1.5"/>
    <path d="M-15 -8 q8 2 10 -2 M15 -8 q-8 2 -10 -2 M-16 2 q7 1 9 -2 M16 2 q-7 1 -9 -2 M-4 -19 q4 6 8 0" stroke="#6b6b75" stroke-width="2.5" fill="none"/>
    <ellipse cy="12" rx="12" ry="8" fill="#c9c3cf"/>${eyes(7, -4)}</g>`;

  const bunny = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="-7" cy="-22" rx="5" ry="14" fill="#fff" stroke="#e3d9e8"/><ellipse cx="7" cy="-22" rx="5" ry="14" fill="#fff" stroke="#e3d9e8"/>
    <ellipse cx="-7" cy="-22" rx="2.5" ry="9" fill="#f6cbd6"/><ellipse cx="7" cy="-22" rx="2.5" ry="9" fill="#f6cbd6"/>
    <circle r="14" fill="#fff" stroke="#e3d9e8"/>${eyes(5, -2)}<circle cy="3" r="2" fill="#f2a5b8"/>${cheeks(9, 5)}</g>`;

  const noah = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-30 30 q30 -18 60 0 v60 h-60Z" fill="#9fbde0"/><path d="M-6 40 h12 v50 h-12Z" fill="#e9dcc3"/>
    <rect x="-30" y="58" width="60" height="6" fill="#b88a5c"/>
    <circle r="24" fill="#f7d7bf"/><path d="M-26 -4 q-6 -22 10 -26 q16 -10 32 0 q16 4 10 26 q-4 -16 -26 -16 q-22 0 -26 16Z" fill="#fff" stroke="#e5e5ee"/>
    <path d="M-22 6 q0 40 22 44 q22 -4 22 -44 q-10 12 -22 12 q-12 0 -22 -12Z" fill="#fff" stroke="#e5e5ee"/>
    ${eyes(8, -4)}<circle cx="-14" cy="4" r="4" fill="#f5a9b8" opacity=".6"/><circle cx="14" cy="4" r="4" fill="#f5a9b8" opacity=".6"/>
    <ellipse cx="0" cy="4" rx="4" ry="3" fill="#eeb39a"/>${smile(14)}
    <path d="M36 -10 q14 0 12 14 V100" stroke="#a87a50" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;

  const ark = (x, y, s = 1, animals = true) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-70" y="-78" width="140" height="80" rx="4" fill="#d6ad7d"/>
    ${[-60, -40, -20, 0, 20, 40].map(v => `<line x1="${v + 10}" y1="-78" x2="${v + 10}" y2="2" stroke="#c49a6a" stroke-width="1.5"/>`).join("")}
    <path d="M-86 -74 L0 -124 L86 -74Z" fill="#b88458"/><path d="M-86 -74 L0 -124 L86 -74" stroke="#9e6f47" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <circle cx="0" cy="-94" r="9" fill="#8b5e3c"/>
    ${animals ? `${giraffe(-86, -80, .9)}${giraffe(-56, -60, .75)}${lion(-18, -26, .95)}${elephant(34, -24, .95)}${hippo(78, -14, .9)}${zebra(110, -8, .85)}` : ""}
    <path d="M-150 -6 H150 Q140 60 90 70 H-90 Q-140 60 -150 -6Z" fill="#c89464"/>
    <path d="M-148 10 H148 M-140 32 H140 M-120 52 H120" stroke="#b07f52" stroke-width="2"/>
    <path d="M-150 -6 H150" stroke="#a87650" stroke-width="7" stroke-linecap="round"/>
    ${[-80, 0, 80].map(v => `<circle cx="${v}" cy="28" r="15" fill="#8b5e3c"/><circle cx="${v}" cy="28" r="11" fill="#fff7ea"/>`).join("")}
    ${bunny(-80, 32, .6)}${bunny(80, 32, .6)}</g>`;

  const svg = (inner, vb = "0 0 400 520") => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  const sky = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcebf8"/><stop offset="1" stop-color="#fdf8f1"/></linearGradient></defs><rect width="400" height="520" fill="url(#sky)"/>`;

  return {
    cloud, rainbow, dove, balloon, star, waves, ark, noah, lion, elephant, giraffe, hippo, zebra, bunny, svg,
    slides: [
      // 1: arcoíris y paloma
      svg(`${sky}${star(60, 70)}${star(340, 110, .8)}${star(300, 40, .6, "#b9d6f0")}
        <g class="a-rise">${rainbow(200, 330, 150, 16)}</g>${cloud(70, 330, 1.3)}${cloud(330, 330, 1.3)}
        <g class="a-fly">${dove(150, 150, 1.4)}</g>${waves(430)}`),
      // 2: los animales
      svg(`${sky}${cloud(80, 90)}${cloud(320, 70, .8)}
        <g class="a-pop" style="animation-delay:.1s">${giraffe(90, 300, 1.5)}</g>
        <g class="a-pop" style="animation-delay:.4s">${elephant(290, 290, 1.7)}</g>
        <g class="a-pop" style="animation-delay:.7s">${lion(130, 400, 1.5)}</g>
        <g class="a-pop" style="animation-delay:1s">${hippo(270, 400, 1.6)}</g>
        ${waves(460)}`),
      // 3: el arca navegando
      svg(`${sky}${rainbow(200, 300, 170, 12)}${cloud(60, 280, 1.1)}${cloud(350, 290, 1.1)}
        <g class="a-boat">${ark(200, 360, 1.1)}</g>${noah(330, 330, .9)}${waves(430)}`),
      // 4: globos
      svg(`${sky}${cloud(90, 420, 1.2)}${cloud(310, 440, 1.3)}
        <g class="a-float">${balloon(120, 160, "#b9d6f0", 1.3)}${balloon(200, 120, "#f9d8a8", 1.4)}${balloon(280, 170, "#c7e5c0", 1.3)}</g>
        ${star(60, 60)}${star(350, 80, .9)}${bunny(200, 420, 1.8)}${waves(470)}`)
    ]
  };
})();
