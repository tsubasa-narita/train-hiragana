const stars = Array.from({ length: 42 }, (_, i) => {
  const x = 16 + i * 193 % 1168;
  const y = 14 + i * 83 % 231;
  return `<circle cx="${x}" cy="${y}" r="${i % 5 === 0 ? 2.6 : 1.25}" opacity="${.4 + i % 4 * .15}"/>`;
}).join('');

const skyline = Array.from({ length: 32 }, (_, i) => {
  const x = i * 38;
  const h = 16 + i * 19 % 46;
  return `<path d="M${x} 292v-${h}h${18 + i * 7 % 17}v${h}Z" fill="#172748"/>
    <path d="M${x + 5} ${299 - h}h5m4 0h5m-14 8h5m4 0h5" stroke="#ffe3a3" stroke-width="2" opacity=".7"/>`;
}).join('');

const bursts = [[18, 29, 84], [80, 23, 96], [91, 47, 61], [37, 13, 52]].map(([x, y, radius], index) => {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = i * Math.PI / 8;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const distance = radius * (.73 + i % 3 * .13);
    return `<path d="M${dx * distance * .59} ${dy * distance * .59}L${dx * distance} ${dy * distance}"/>`;
  }).join('');
  return `<svg class="reward-burst" viewBox="-106 -106 212 212" style="--burst-x:${x}%;--burst-y:${y}%;--burst-delay:${index * .16}s">${rays}</svg>`;
}).join('');

const sleepers = Array.from({ length: 12 }, (_, i) => {
  const depth = ((i + 1) / 12) ** 2;
  const y = 180 * depth;
  return `<path d="M${210 - 150 * depth} ${y}H${225 + 495 * depth}"/>`;
}).join('');

export function sceneryMarkup() {
  return `<div class="reward-world" aria-hidden="true">
    <svg class="reward-panorama" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="reward-horizon" x2="0" y2="1">
          <stop stop-color="#121739"/><stop offset=".64" stop-color="var(--reward-sky)"/><stop offset="1" stop-color="#ffd597"/>
        </linearGradient>
        <linearGradient id="reward-bridge" x2="0" y2="1">
          <stop stop-color="#385478"/><stop offset="1" stop-color="#132042"/>
        </linearGradient>
        <linearGradient id="reward-aurora">
          <stop stop-color="#62e4ff" stop-opacity="0"/><stop offset=".3" stop-color="#5cffe0"/>
          <stop offset=".62" stop-color="#b995ff"/><stop offset=".88" stop-color="#ffb57f"/><stop offset="1" stop-color="#ffb57f" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M0 0h1200v420H0z" fill="url(#reward-horizon)"/>
      <g class="reward-stars" fill="#fff4d1">${stars}</g>
      <g class="reward-aurora" fill="none" stroke="url(#reward-aurora)" stroke-linecap="round">
        <path d="M-105 170C210 280 345 16 634 63S965 240 1340 29" stroke-width="29" opacity=".14"/>
        <path d="M-105 155C210 265 345 1 634 48S965 225 1340 14" stroke-width="4" opacity=".62"/>
        <path d="M-105 191C210 301 345 37 634 84S965 261 1340 50" stroke-width="3" opacity=".46"/>
      </g>
      <g class="reward-route-rainbow" fill="none" stroke-linecap="round">
        <path d="M313 277Q600-163 887 277" stroke="#ffb1d6" stroke-width="8" opacity=".75"/>
        <path d="M328 279Q600-135 872 279" stroke="#ffe9a6" stroke-width="7" opacity=".8"/>
        <path d="M342 281Q600-107 858 281" stroke="#9cffda" stroke-width="6" opacity=".65"/>
      </g>
      <g class="reward-route-night">
        <circle cx="683" cy="148" r="63" fill="#ced9ff" opacity=".17"/>
        <path d="M704 106a45 45 0 1 0 24 69 45 45 0 0 1-24-69Z" fill="#ffebbe"/>
        <path d="M517 108q8 3 10 13 2-10 10-13-8-2-10-12-2 10-10 12m229 19q5 1 6 7 1-6 6-7-5-1-6-7-1 6-6 7" fill="#fff2be"/>
      </g>
      <path d="M0 229L105 173 198 210 312 147 443 250 535 202 625 261 761 221 900 138 1065 229 1200 166V420H0Z" fill="#53537f"/>
      <path d="M0 254L120 236 238 272 351 209 483 274 643 247 818 275 972 218 1200 263V420H0Z" fill="#2b4269"/>
      ${skyline}
      <g class="reward-route-station">
        <path d="M486 283v-78h228v78Z" fill="#2d214b" stroke="#a47b96" stroke-width="2"/>
        <path d="m469 209 32-29h198l31 29Z" fill="#5e385e" stroke="#ffd78d" stroke-width="3"/>
        <path d="M505 226h35v42h-35zm155 0h35v42h-35zm-86 17h52v40h-52z" fill="#ffdb9f"/>
        <path d="M522 227v40m-17-22h35m137-18v40m-17-22h35" stroke="#805065" stroke-width="3"/>
        <rect x="545" y="214" width="110" height="24" rx="8" fill="#ffecb8"/>
        <text x="600" y="231" text-anchor="middle" font-size="14" font-weight="700" fill="#543250">ひらがなえき</text>
      </g>
      <path d="M0 288h1200v132H0z" fill="#283753"/>
      <path d="M0 304h1200v18H0z" fill="#121d38"/>
      <path d="M0 300h1200m-1200 11h1200" stroke="#ffd794" stroke-width="2"/>
      <path d="M0 321h1200v99h-94v-34q-90-87-182 0v34H722v-34q-123-87-246 0v34H271v-34q-90-87-181 0v34H0Z" fill="url(#reward-bridge)"/>
      <path d="M0 328h1200" stroke="#94a1c5" stroke-width="3" opacity=".65"/>
    </svg>
    <svg class="reward-flight-track" viewBox="0 0 1000 180" preserveAspectRatio="none">
      <path d="M210 0H225L720 180H60Z" fill="#213758"/>
      <g fill="none" stroke="#b6aada" stroke-width="2" opacity=".62">${sleepers}</g>
      <path d="M210 0L60 180M225 0L720 180" fill="none" stroke="#a6e8ff" stroke-width="4"/>
    </svg>
    <div class="reward-depth">
      <div class="reward-portal">
        ${[0, 1, 2, 3, 4, 5].map(i => `<i style="--ring:${i}"></i>`).join('')}
      </div>
    </div>
    <div class="reward-speed-lines"></div>
    ${bursts}
    <div class="reward-confetti">${Array.from({ length: 25 }, (_, i) => `<i style="--x:${8 + i * 37 % 85}%;--y:${8 + i * 29 % 65}%;--angle:${i * 51}deg;--delay:${i % 5 * .08}s;--paper:${['#ffd480', '#83f3e5', '#f3a0fb', '#fff'][i % 4]}"></i>`).join('')}</div>
  </div>`;
}
