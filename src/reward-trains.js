// Orthographic side elevations share a right-facing cab and wheel contact at y=278.
// These are illustrated three-car display consists, not actual operating formations.
export const REWARD_TRAIN_DESIGNS = {
  hayabusa: { type:'long', body:'#f3f6f5', roof:'#009d83', stripe:'#d44082', nose:210, series:'E5' },
  komachi: { type:'long', body:'#f7f6f3', roof:'#d6243e', stripe:'#adadad', nose:180, series:'E6' },
  nozomi: { type:'long', body:'#f9fbff', roof:'#f2f7fc', stripe:'#1c58a1', nose:195, series:'N700S', doubleStripe:true },
  kagayaki: { type:'long', body:'#faf8f0', roof:'#2581bf', stripe:'#b88640', nose:130, series:'E7', doubleStripe:true },
  'doctor-yellow': { type:'long', body:'#ffd833', roof:'#ffe151', stripe:'#214988', nose:155, series:'923', inspection:true },
  sakura: { type:'long', body:'#dcebf1', roof:'#dcebf1', stripe:'#305b85', nose:195, series:'N700', gold:true },
  tsubasa: { type:'long', body:'#f6f4f2', roof:'#724b8b', stripe:'#ec8645', nose:175, series:'E8' },
  'e4-max': { type:'double', body:'#fafbf8', roof:'#2876a6', stripe:'#efb444', nose:140, series:'MAX' },
  yamanote: { type:'commuter', body:'#ced6db', roof:'#d8e1e5', stripe:'#84bd2e', doors:4, series:'E235', doorColor:true },
  'chuo-e233': { type:'commuter', body:'#dce0e3', roof:'#d7dfe3', stripe:'#f07428', doors:4, series:'E233' },
  marunouchi: { type:'metro', body:'#e83139', roof:'#f8585c', stripe:'#f2f1ea', doors:3, series:'2000' },
  enoden: { type:'vintage', body:'#265d46', roof:'#c7cfcb', stripe:'#f0dfad', doors:2, series:'江ノ電' },
  azusa: { type:'express', body:'#f6f8fa', roof:'#fafbff', stripe:'#8750a2', nose:75, series:'E353' },
  'narita-express': { type:'express', body:'#f1f4f5', roof:'#d5dbdf', stripe:'#e02837', nose:35, series:'N’EX', blackCab:true },
  rapit: { type:'rapit', body:'#244c95', roof:'#426abc', stripe:'#173671', nose:75, series:'50000', round:true },
  sonic: { type:'express', body:'#1464b7', roof:'#2277ca', stripe:'#10478e', nose:80, series:'883', fins:true },
  yufuin: { type:'panorama', body:'#29704b', roof:'#4c9161', stripe:'#d8ba63', nose:70, series:'ゆふいんの森', gold:true },
  momotaro: { type:'freight', body:'#3271a2', roof:'#cbd1d4', stripe:'#e8edf0', series:'EF210' },
  'spacia-x': { type:'express', body:'#ece9df', roof:'#f4f2e9', stripe:'#b0aa97', nose:100, series:'SPACIA X', diamond:true },
  laview: { type:'bubble', body:'#dce1e4', roof:'#f4f6f7', stripe:'#9aabb5', nose:65, series:'001', bigWindows:true },
  hinotori: { type:'express', body:'#a91f35', roof:'#cd394b', stripe:'#b89953', nose:105, series:'ひのとり', gold:true },
  'saphir-odoriko': { type:'panorama', body:'#145b71', roof:'#257c8c', stripe:'#afa78c', nose:75, series:'E261', doubleStripe:true },
  cassiopeia: { type:'double', body:'#dce1e4', roof:'#bbbfc7', stripe:'#526bc0', nose:45, series:'E26', rainbow:true },
  sunrise: { type:'double', body:'#efdab0', roof:'#9f273a', stripe:'#ba4350', nose:65, series:'285' },
  haruka: { type:'express', body:'#f7f5ec', roof:'#f4f1e7', stripe:'#237bab', nose:65, series:'281', blackCab:true },
  shiokaze: { type:'express', body:'#f4f3ed', roof:'#edf1f1', stripe:'#e67925', nose:80, series:'8600', blackCab:true },
  'reward-book-urbanliner': { type:'express', body:'#f6f1e4', roof:'#fbf6ec', stripe:'#e38034', nose:90, series:'21000' },
  'reward-book-shinano': { type:'express', body:'#d5dcdf', roof:'#d8e2e7', stripe:'#df7025', nose:65, series:'383', blackCab:true },
  'reward-book-hida': { type:'express', body:'#e2e6e8', roof:'#d7dfe4', stripe:'#e7842c', nose:35, series:'HC85', blackCab:true },
  'reward-book-lilac': { type:'express', body:'#f5f6f4', roof:'#eeeff2', stripe:'#776490', nose:85, series:'789', greenCab:true },
  'reward-book-aoniyoshi': { type:'vintage', body:'#663774', roof:'#785286', stripe:'#c4a15c', doors:1, series:'あをによし', gold:true },
  'reward-book-seven-stars': { type:'luxury', body:'#542b2a', roof:'#75433a', stripe:'#d3ac61', series:'ななつ星', gold:true },
  'reward-book-shikishima': { type:'panorama', body:'#d8c8a2', roof:'#ede1c4', stripe:'#857652', nose:100, series:'E001', bigWindows:true, diamond:'trapezoid' },
  'reward-book-royal-express': { type:'panorama', body:'#164989', roof:'#3564a4', stripe:'#d3ae63', nose:55, series:'THE ROYAL', gold:true },
  'reward-book-west-express-ginga': { type:'express', body:'#214a84', roof:'#345d92', stripe:'#a0b9d9', nose:25, series:'銀河' },
  'reward-book-resort-shirakami': { type:'panorama', body:'#edf1e8', roof:'#337c43', stripe:'#75a247', nose:45, series:'HB-E300', greenCab:true },
};

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const highlight = color => `#${[1,3,5].map(i => Math.round(parseInt(color.slice(i,i+2),16)*.84+255*.16).toString(16).padStart(2,'0')).join('')}`;
const rect = (x,y,w,h,fill,rx=0,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;

function bodyPath(c, front, top) {
  if (!front) return `M18 ${top+20} Q18 ${top} 42 ${top} H488 Q512 ${top} 512 ${top+20} V230 H18 Z`;
  const n=c.nose || 35, shoulder=520-n;
  if(front&&c.series==='N700S'||front&&c.series==='N700') return `M18 ${top+20} Q18 ${top} 42 ${top} H${shoulder-25} Q${shoulder+35} ${top} ${shoulder+60} ${top+49} C${shoulder+90} 192 471 183 511 211 Q532 227 506 235 H18 Z`;
  if(front&&c.series==='E6') return `M18 ${top+20} Q18 ${top} 42 ${top} H${shoulder-38} Q${shoulder+23} ${top} ${shoulder+54} ${top+52} C${shoulder+98} 194 477 184 519 217 Q527 232 507 235 H18 Z`;
  if(c.type==='long' || c.type==='double') return `M18 ${top+20} Q18 ${top} 42 ${top} H${shoulder-34} Q${shoulder+20} ${top} ${shoulder+54} ${top+43} C${shoulder+105} ${top+102} 490 182 519 214 Q531 229 507 235 H18 Z`;
  if(c.type==='bubble') return `M18 ${top+20} Q18 ${top} 42 ${top} H428 Q492 ${top} 515 ${top+61} Q530 157 513 230 H18 Z`;
  if(c.type==='rapit') return `M18 ${top+20} Q18 ${top} 42 ${top} H424 Q472 ${top} 494 ${top+33} L519 149 V207 Q519 235 490 235 H18 Z`;
  if(c.type==='panorama') return `M18 ${top+20} Q18 ${top} 42 ${top} H${shoulder-35} Q${shoulder} ${top} ${shoulder+18} ${top+25} L513 174 V222 Q513 235 495 235 H18 Z`;
  if(c.type==='commuter'||c.type==='metro'||c.type==='vintage') return `M18 ${top+20} Q18 ${top} 42 ${top} H472 Q505 ${top} 508 ${top+30} V211 Q508 235 483 235 H18 Z`;
  return `M18 ${top+20} Q18 ${top} 42 ${top} H${shoulder-25} Q${shoulder+5} ${top} ${shoulder+24} ${top+31} L519 181 V214 Q519 235 493 235 H18 Z`;
}

function bogie(x,prefix) {
  return `<g transform="translate(${x} 0)">${rect(-50,238,100,22,'#364451',7)}${rect(-34,235,68,8,'#71818d',3)}<path d="M-36 252 H36 M-28 245 L-14 258 M28 245 L14 258" stroke="#8d9ba5" stroke-width="3"/>${[-29,29].map(w=>`<circle cx="${w}" cy="263" r="15" fill="#152431"/><circle cx="${w}" cy="263" r="10" fill="url(#${prefix}-wheel)"/><circle cx="${w}" cy="263" r="4" fill="#a0abb1"/><path d="M${w-7} 239 h14 m-14 3 h14 m-14 3 h14" stroke="#a1acb3" stroke-width="1.4"/>`).join('')}${rect(-8,244,16,12,'#657a88',3)}<path d="M-19 254 Q0 269 19 254" fill="none" stroke="#1e3240" stroke-width="3"/></g>`;
}

function windows(c,front,top,p) {
  const end=front ? 500-(c.nose||35)-22 : 476, start=55;
  let out='';
  if(c.type==='double') {
    for(let x=start;x<end-26;x+=58) out+=rect(x,top+29,36,25,`url(#${p}-glass)`,7)+rect(x,top+94,36,25,`url(#${p}-glass)`,6);
    return out;
  }
  const y=c.type==='long' ? top+36 : top+31;
  const h=c.bigWindows?94:c.type==='panorama'?66:47;
  const step=c.round?62:c.bigWindows?76:c.diamond?76:58;
  for(let x=start;x<end-28;x+=step) {
    if(c.round) out+=`<ellipse cx="${x+19}" cy="${y+23}" rx="21" ry="24" fill="#c3d0df"/><ellipse cx="${x+19}" cy="${y+23}" rx="17" ry="20" fill="url(#${p}-glass)"/>`;
    else if(c.diamond==='trapezoid') out+=`<path d="M${x+13} ${y} H${x+58} L${x+48} ${y+76} H${x} Z" fill="url(#${p}-glass)" stroke="#a7b0b4" stroke-width="2"/>`;
    else if(c.diamond) out+=`<path d="M${x+12} ${y} H${x+43} L${x+54} ${y+28} L${x+42} ${y+57} H${x+12} L${x} ${y+28} Z" fill="url(#${p}-glass)" stroke="#a7b0b4" stroke-width="2"/>`;
    else out+=rect(x,y,c.bigWindows?60:38,h,`url(#${p}-glass)`,c.bigWindows?12:7,'stroke="#8799a5" stroke-width="1.5"');
    if(!c.round&&!c.diamond) out+=`<path d="M${x+6} ${y+5} H${x+(c.bigWindows?51:30)}" stroke="#bfe3f0" stroke-width="2" opacity=".6"/>`;
  }
  return out;
}

function doors(c,front,top,p) {
  const count=c.doors||1,end=front?500-(c.nose||35):490;
  const positions=count>1?Array.from({length:count},(_,i)=>48+i*(end-95)/Math.max(1,count-1)):[front?Math.max(285,end-46):447];
  return positions.map(x=>rect(x,top+19,count>1?40:28,139,c.doorColor?c.stripe:`url(#${p}-body)`,4,'stroke="#7e8d94" stroke-width="1.5"')+rect(x+5,top+35,count>1?30:18,42,`url(#${p}-glass)`,4)+`<path d="M${x+(count>1?20:14)} ${top+21} V${top+154}" stroke="#7e8d94" stroke-width="1"/>`+rect(x+3,top+151,count>1?34:22,3,'#6b7b84',1)).join('');
}

function locomotive(c,p,x,freight) {
  return `<g transform="translate(${x} 0)">${bogie(110,p)}${bogie(397,p)}<path d="M18 230 V78 Q18 65 35 65 H458 L513 105 V232 Z" fill="url(#${p}-body)" stroke="#526471" stroke-width="2"/>${rect(25,61,434,12,c.roof,6)}${rect(28,164,478,22,c.stripe)}${rect(387,80,75,66,`url(#${p}-glass)`,6)}<path d="M472 83 L501 105 V139 H472 Z" fill="url(#${p}-glass)"/>${rect(367,84,9,135,'#a3adb3',2)}${Array.from({length:12},(_,i)=>rect(50+i*23,100,12,42,'#243e50',2)).join('')}${rect(42,191,285,18,'#274457',3)}<text x="50" y="159" fill="${freight?'#fff':c.stripe}" font-size="22" font-weight="700" font-family="sans-serif">${escape(c.series)}</text>${rect(496,153,11,10,'#fff1bd',3)}<path d="M506 232 L519 245 H455" fill="#2d3b47"/>${freight ? pantograph(180)+pantograph(322) : rect(195,52,180,13,c.roof,5)}</g>`;
}
function pantograph(x) { return `<g stroke="#526471" stroke-width="3" fill="none"><path d="M${x-25} 58 L${x} 24 L${x+25} 58 M${x-25} 58 H${x+25} M${x-32} 22 H${x+32}"/></g>`; }

function carriage(c,front,p,x,rear=false) {
  const top=c.type==='double'?45:c.type==='long'?104:c.type==='panorama'?68:78;
  const shape=bodyPath(c,front,top),clip=`${p}-clip-${x}`;
  return `<g transform="${rear ? `translate(${x+530} 0) scale(-1 1)` : `translate(${x} 0)`}">${bogie(113,p)}${bogie(front&&c.type==='long'?326:407,p)}<defs><clipPath id="${clip}"><path d="${shape}"/></clipPath></defs><path d="${shape}" fill="url(#${p}-body)" stroke="#657581" stroke-width="2"/><g clip-path="url(#${clip})">${rect(0,top-2,540,c.type==='long'?50:15,c.roof)}${rect(0,c.type==='long'?top+73:185,540,c.type==='metro'?12:15,c.stripe)}${c.doubleStripe?rect(0,205,540,5,c.stripe):''}${c.rainbow?['#c86a85','#d9b254','#62a88c'].map((color,i)=>rect(0,205+i*4,540,4,color)).join(''):''}${windows(c,front,top,p)}${doors(c,front,top,p)}${rect(0,top,540,235-top,`url(#${p}-shade)`)}${rect(0,222,540,13,'#344957',0,'opacity=".26"')}<path d="M25 ${top+18} H490" stroke="#fff" stroke-width="3" opacity=".38"/>${c.gold?`<path d="M30 214 H493 M30 181 H493" stroke="${c.stripe}" stroke-width="2"/><circle cx="245" cy="204" r="8" fill="none" stroke="${c.stripe}" stroke-width="2"/><path d="M245 192 V216 M233 204 H257" stroke="${c.stripe}" stroke-width="1"/>`:''}${front?cab(c,top,p):''}<text x="${front?300:365}" y="216" font-size="11" letter-spacing="1" fill="${c.gold?c.stripe:'#516775'}" font-family="sans-serif">${escape(c.series)}</text></g>${rect(85,top-9,78,9,'#a8b2b8',3)}${c.inspection?rect(211,top-10,90,10,'#76828b',3):''}${c.fins?`<path d="M361 ${top} V${top-20} H375 V${top} M389 ${top} V${top-27} H402 V${top}" fill="#255087"/>`:''}${rect(183,238,121,13,'#54636e',3)}${rect(220,240,41,8,'#8e9ba3',2)}</g>`;
}
function cab(c,top,p) {
  const shoulder=520-(c.nose||35);
  if(c.type==='long'||c.type==='double') return `<path d="M${shoulder-2} ${top+10} Q${shoulder+32} ${top+15} ${shoulder+61} ${top+55} L${shoulder+33} ${top+58} Q${shoulder+8} ${top+37} ${shoulder-7} ${top+34} Z" fill="url(#${p}-glass)"/><path d="M${shoulder+62} 210 L493 217" stroke="#fff2c1" stroke-width="5" stroke-linecap="round"/><path d="M498 229 H518" stroke="#708390" stroke-width="3"/>`;
  const frontColor=c.greenCab?'#5c945a':c.blackCab?'#162b38':c.body;
  return `${rect(shoulder+6,top+10,120,145,frontColor,12)}<path d="M${shoulder+6} ${top+21} L${Math.min(498,shoulder+50)} ${top+25} L513 166 H${shoulder+6} Z" fill="url(#${p}-glass)"/><path d="M${shoulder+13} ${top+31} L${Math.min(483,shoulder+41)} ${top+36}" stroke="#bedfe9" stroke-width="3" opacity=".7"/>${rect(493,188,17,7,'#fff0c0',3)}${rect(490,211,16,4,c.stripe,2)}<path d="M480 228 H513" stroke="#70808c" stroke-width="3"/>`;
}
function container(x,c,p,index) {
  return `<g transform="translate(${x} 0)">${bogie(112,p)}${bogie(404,p)}${rect(18,222,490,18,'#526270',3)}${rect(27,90,474,130,index?'#6e3657':'#405f72',7,'stroke="#243b4b" stroke-width="2"')}${Array.from({length:24},(_,i)=>`<path d="M${40+i*19} 98 V213" stroke="#d0d8dc" stroke-width="3" opacity=".15"/>`).join('')}${rect(239,94,4,121,'#ad9daf')}<text x="61" y="174" fill="#e6ecec" font-size="34" font-weight="700" font-family="sans-serif">JRF</text></g>`;
}

export function rewardTrainMarkup(train) {
  const c=REWARD_TRAIN_DESIGNS[train.id];
  if(!c) return '';
  const p=`reward-${String(train.id).replace(/[^a-zA-Z0-9-]/g,'')}`;
  const cars=c.type==='freight'?container(18,c,p,0)+container(538,c,p,1)+locomotive(c,p,1058,true):c.type==='luxury'?carriage({...c,type:'vintage',doors:1},false,p,18)+carriage({...c,type:'vintage',doors:1},false,p,538)+locomotive(c,p,1058,false):carriage(c,true,p,18,true)+carriage(c,false,p,538)+carriage(c,true,p,1058);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="reward-runner" data-train-design="${escape(train.id)}" viewBox="0 0 1600 300" role="img" aria-label="${escape(train.name)}" preserveAspectRatio="xMidYMid meet"><title>${escape(train.name)}の ごほうびでんしゃ</title><defs><linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.body}"/><stop offset=".3" stop-color="${c.body}"/><stop offset=".52" stop-color="${highlight(c.body)}"/><stop offset=".64" stop-color="${c.body}"/><stop offset="1" stop-color="${c.body}"/></linearGradient><linearGradient id="${p}-glass" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#152c43"/><stop offset=".42" stop-color="#2f586e"/><stop offset=".45" stop-color="#769cab"/><stop offset="1" stop-color="#183847"/></linearGradient><linearGradient id="${p}-shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff" stop-opacity=".2"/><stop offset=".16" stop-color="#ffffff" stop-opacity="0"/><stop offset=".7" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#102939" stop-opacity=".38"/></linearGradient><radialGradient id="${p}-wheel"><stop stop-color="#9caab3"/><stop offset=".65" stop-color="#667580"/><stop offset="1" stop-color="#283c4a"/></radialGradient></defs><g stroke-linejoin="round">${[535,1055].map(x=>rect(x,214,35,8,'#4d6070',3)+rect(x+2,106,15,112,'#536674',3)).join('')}${cars}</g></svg>`;
}
