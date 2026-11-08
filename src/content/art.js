// SVG illustration helpers. Each returns an SVG fragment string in a 320x220 scene.
/* eslint-disable */
export const starPts=(x,y,r)=>{let p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;p.push((x+rr*Math.cos(a)).toFixed(1)+','+(y+rr*Math.sin(a)).toFixed(1))}return p.join(' ')};
export const star=(x,y,r,c='#FFD866')=>`<polygon points="${starPts(x,y,r)}" fill="${c}"/>`;
export const twinkles=(n,seed=3)=>{let s='',v=seed;for(let i=0;i<n;i++){v=(v*9301+49297)%233280;const x=v/233280*320;v=(v*9301+49297)%233280;const y=v/233280*120;s+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(i%3)*.5+.8}" fill="#FFF6D6" opacity=".8"/>`}return s};
export const night=(extra='')=>`<rect width="320" height="220" fill="#1E2A4A"/><rect y="140" width="320" height="80" fill="#24345A"/>${twinkles(28)}${extra}`;
export const hill=c=>`<path d="M0 175 Q90 140 180 165 T320 160 V220 H0Z" fill="${c}"/>`;
export const cat=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">
 <path d="M18 8 Q40 0 34 -22" stroke="#E8913A" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="0" cy="8" rx="22" ry="16" fill="#F0A04B"/>
 <circle cx="-14" cy="-14" r="15" fill="#F0A04B"/>
 <polygon points="-27,-20 -24,-38 -14,-27" fill="#F0A04B"/><polygon points="-3,-22 -2,-38 -12,-28" fill="#F0A04B"/>
 <circle cx="-19" cy="-15" r="2.2" fill="#1E2A4A"/><circle cx="-9" cy="-15" r="2.2" fill="#1E2A4A"/>
 <path d="M-16 -9 q2 2 4 0" stroke="#1E2A4A" stroke-width="1.4" fill="none"/></g>`;
export const glow=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r*2.4}" fill="#FFD866" opacity=".18"/>${star(x,y,r)}`;
export const owl=(x,y)=>`<g transform="translate(${x} ${y})">
 <path d="M-18 0 Q-46 -14 -50 8 Q-34 2 -18 10Z" fill="#8C6A4E"/><path d="M18 0 Q46 -14 50 8 Q34 2 18 10Z" fill="#8C6A4E"/>
 <ellipse cx="0" cy="4" rx="20" ry="24" fill="#A9825F"/><ellipse cx="0" cy="12" rx="12" ry="13" fill="#E9D6B8"/>
 <circle cx="-8" cy="-6" r="7" fill="#FFF"/><circle cx="8" cy="-6" r="7" fill="#FFF"/>
 <circle cx="-8" cy="-6" r="3" fill="#1E2A4A"/><circle cx="8" cy="-6" r="3" fill="#1E2A4A"/>
 <polygon points="-3,0 3,0 0,5" fill="#F2B533"/></g>`;
export const rainBg=(n=46)=>{let s='<rect width="320" height="220" fill="#B9CBD8"/>';for(let i=0;i<n;i++){const x=(i*37)%330,y=(i*53)%200;s+=`<line x1="${x}" y1="${y}" x2="${x-5}" y2="${y+14}" stroke="#FFFFFF" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`}return s+'<rect y="180" width="320" height="40" fill="#8FA9BB"/><ellipse cx="90" cy="196" rx="44" ry="6" fill="#A9C0CF"/>'};
export const umbrella=(x,y,w=60,t=0)=>`<g transform="translate(${x} ${y}) rotate(${t})"><line x1="0" y1="0" x2="0" y2="${w*.95}" stroke="#4A3B2A" stroke-width="3"/><path d="M0 ${w*.95} q0 7 -7 7" stroke="#4A3B2A" stroke-width="3" fill="none"/><path d="M${-w} 0 A${w} ${w*.8} 0 0 1 ${w} 0 Q${w*.66} -8 ${w/3} 0 Q0 -8 ${-w/3} 0 Q${-w*.66} -8 ${-w} 0Z" fill="#F2B533"/></g>`;
export const girl=(x,y)=>`<g transform="translate(${x} ${y})"><line x1="-6" y1="40" x2="-6" y2="58" stroke="#3A2A22" stroke-width="4"/><line x1="6" y1="40" x2="6" y2="58" stroke="#3A2A22" stroke-width="4"/>
 <path d="M-16 42 L0 6 L16 42Z" fill="#E86A5A"/><circle cx="0" cy="-4" r="13" fill="#F1C9A5"/><path d="M-14 -4 Q-14 -20 0 -19 Q14 -20 14 -4 Q8 -12 0 -12 Q-8 -12 -14 -4Z" fill="#3A2A22"/>
 <circle cx="-5" cy="-3" r="1.6" fill="#1E2A4A"/><circle cx="5" cy="-3" r="1.6" fill="#1E2A4A"/><path d="M-3 3 q3 3 6 0" stroke="#1E2A4A" stroke-width="1.3" fill="none"/></g>`;
export const puppy=(x,y,wet=false)=>`<g transform="translate(${x} ${y})"><ellipse cx="0" cy="10" rx="20" ry="12" fill="#D9B48A"/><circle cx="-16" cy="-4" r="12" fill="#D9B48A"/>
 <ellipse cx="-26" cy="-2" rx="5" ry="10" fill="#A97D52"/><ellipse cx="-8" cy="-2" rx="5" ry="10" fill="#A97D52"/>
 <circle cx="-20" cy="-6" r="1.8" fill="#1E2A4A"/><circle cx="-12" cy="-6" r="1.8" fill="#1E2A4A"/><circle cx="-16" cy="0" r="2.4" fill="#1E2A4A"/>
 <path d="M18 4 q8 -8 6 -14" stroke="#D9B48A" stroke-width="5" fill="none" stroke-linecap="round"/>${wet?'<path d="M-6 -20 q3 -6 0 -10 q-3 4 0 10Z" fill="#E8F2F8"/><path d="M8 -6 q3 -6 0 -10 q-3 4 0 10Z" fill="#E8F2F8"/>':''}</g>`;
export const frog=(x,y)=>`<g transform="translate(${x} ${y})"><ellipse cx="0" cy="6" rx="14" ry="10" fill="#5FAE5A"/><circle cx="-7" cy="-4" r="5" fill="#5FAE5A"/><circle cx="7" cy="-4" r="5" fill="#5FAE5A"/><circle cx="-7" cy="-4" r="2" fill="#1E2A4A"/><circle cx="7" cy="-4" r="2" fill="#1E2A4A"/><path d="M-5 6 q5 3 10 0" stroke="#1E2A4A" stroke-width="1.3" fill="none"/></g>`;
export const bird=(x,y)=>`<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="11" ry="9" fill="#9B6B43"/><circle cx="-8" cy="-6" r="6" fill="#9B6B43"/><circle cx="-10" cy="-7" r="1.4" fill="#1E2A4A"/><polygon points="-14,-6 -19,-5 -14,-3" fill="#F2B533"/><path d="M2 -3 q8 -2 10 4" stroke="#7A5232" stroke-width="3" fill="none"/></g>`;
export const rainbow=()=>['#E86A5A','#F2B533','#F7DC6F','#5FAE5A','#5B8FD6','#8A6CC9'].map((c,i)=>`<path d="M30 190 A130 130 0 0 1 290 190" transform="translate(0 ${i*8})" stroke="${c}" stroke-width="8" fill="none"/>`).join('');
export const tree=()=>`<rect x="228" y="60" width="16" height="140" fill="#5A3E2B"/><circle cx="236" cy="70" r="40" fill="#2E5A47"/><circle cx="206" cy="96" r="26" fill="#2E5A47"/><circle cx="264" cy="100" r="26" fill="#2E5A47"/><line x1="236" y1="120" x2="196" y2="104" stroke="#5A3E2B" stroke-width="6"/>`;

export const svg=b=>`<svg viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${b}</svg>`;
export const room=(extra='')=>`<rect width="320" height="220" fill="#F6EBD9"/><rect y="150" width="320" height="70" fill="#E3C79C"/><g fill="none" stroke="#C9A877" stroke-width="3"><rect x="34" y="28" width="70" height="80" fill="#FBF5EA"/><line x1="69" y1="28" x2="69" y2="108"/><line x1="34" y1="54" x2="104" y2="54"/><line x1="34" y1="81" x2="104" y2="81"/></g>${extra}`;
export const hanbokGirl=(x,y,bow=0)=>`<g transform="translate(${x} ${y}) rotate(${bow} 0 40)"><path d="M-22 58 L-12 14 L12 14 L22 58Z" fill="#F08FAE"/><path d="M-13 8 L13 8 L15 22 L-15 22Z" fill="#F7D046"/><path d="M0 14 l-8 14 M0 14 l6 12" stroke="#D2443B" stroke-width="3"/>
 <circle cx="0" cy="-4" r="13" fill="#F1C9A5"/><path d="M-14 -4 Q-14 -20 0 -19 Q14 -20 14 -4 Q8 -12 0 -12 Q-8 -12 -14 -4Z" fill="#3A2A22"/><circle cx="-12" cy="-12" r="6" fill="#3A2A22"/>
 <circle cx="-5" cy="-3" r="1.6" fill="#1E2A4A"/><circle cx="5" cy="-3" r="1.6" fill="#1E2A4A"/><path d="M-3 3 q3 3 6 0" stroke="#1E2A4A" stroke-width="1.3" fill="none"/></g>`;
export const grandma=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-30 52 Q-28 18 0 14 Q28 18 30 52Z" fill="#8D79B8"/><path d="M-14 12 L14 12 L16 26 L-16 26Z" fill="#E9E2F2"/>
 <circle cx="0" cy="-4" r="14" fill="#EBC3A0"/><path d="M-15 -4 Q-15 -21 0 -20 Q15 -21 15 -4 Q8 -13 0 -13 Q-8 -13 -15 -4Z" fill="#C9C9CF"/><circle cx="0" cy="-22" r="7" fill="#C9C9CF"/>
 <path d="M-8 -4 q3 -3 6 0 M2 -4 q3 -3 6 0" stroke="#1E2A4A" stroke-width="1.4" fill="none"/><path d="M-4 4 q4 4 8 0" stroke="#1E2A4A" stroke-width="1.4" fill="none"/></g>`;
export const pouch=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -6 Q-22 18 0 20 Q22 18 14 -6Z" fill="#D2443B"/><path d="M-14 -6 Q0 -16 14 -6 Q0 -2 -14 -6Z" fill="#B8352E"/><path d="M-4 -8 q-6 -10 -2 -14 M4 -8 q6 -10 2 -14" stroke="#F7D046" stroke-width="2.4" fill="none"/><circle cx="0" cy="7" r="5" fill="#F7D046"/></g>`;
export const bowl=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 0 Q-18 18 0 18 Q18 18 20 0Z" fill="#FFFFFF" stroke="#C9A877" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="20" ry="5" fill="#F3E9D6"/><ellipse cx="-7" cy="0" rx="5" ry="2.4" fill="#FFFFFF"/><ellipse cx="5" cy="-1" rx="5" ry="2.4" fill="#FFFFFF"/><path d="M-6 -6 q-3 -6 0 -10 M6 -6 q3 -6 0 -10" stroke="#C9A877" stroke-width="1.5" fill="none" opacity=".7"/></g>`;
export const yut=(x,y,s=1,spread=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${[-18,-6,6,18].map((dx,i)=>`<g transform="translate(${dx*spread} ${i%2?-8*spread:0}) rotate(${(i-1.5)*14*spread})"><rect x="-4" y="-18" width="8" height="36" rx="4" fill="${i===1?'#E8D3A6':'#C8935A'}"/><line x1="0" y1="-12" x2="0" y2="12" stroke="#8C5F33" stroke-width="1.5"/></g>`).join('')}</g>`;
export const yard=(extra='')=>`<rect width="320" height="220" fill="#CFE6F2"/><circle cx="270" cy="38" r="18" fill="#F7DC6F"/><path d="M0 120 L320 120 L320 220 L0 220Z" fill="#E3C79C"/><path d="M0 120 L40 92 L120 92 L160 120Z" fill="#6B5A4A"/><rect x="18" y="120" width="124" height="22" fill="#F6EBD9"/>${extra}`;
export const globe=(x,y)=>`<g transform="translate(${x} ${y})"><circle r="44" fill="#7FB3DA"/><path d="M-30 -18 q12 -14 26 -6 q6 10 -6 16 q-12 4 -20 -10Z M8 6 q14 -6 24 4 q4 14 -10 20 q-16 0 -14 -24Z M-22 18 q8 -4 12 6 q-4 10 -12 2Z" fill="#9CCB8E"/><circle r="44" fill="none" stroke="#5A8DB6" stroke-width="3"/></g>`;
