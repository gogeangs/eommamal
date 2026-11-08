// Hangul stroke-order data (unit box 0..100) and trace matching.
/* eslint-disable */
export const CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const JUNG=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
export const JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const ring=(cx,cy,r,ry=r)=>{const p=[];for(let i=0;i<=28;i++){const a=-Math.PI/2-i*Math.PI*2/28;p.push([cx+r*Math.cos(a),cy+ry*Math.sin(a)])}return p};
export const J={
 'ㄱ':[[[15,18],[82,18],[76,88]]],
 'ㄴ':[[[20,12],[20,82],[88,82]]],
 'ㄷ':[[[18,18],[84,18]],[[18,18],[18,82],[88,82]]],
 'ㄹ':[[[18,12],[80,12],[80,46]],[[20,46],[80,46]],[[20,46],[20,86],[86,86]]],
 'ㅁ':[[[20,16],[20,84]],[[20,16],[80,16],[80,84]],[[20,84],[80,84]]],
 'ㅂ':[[[22,10],[22,86]],[[78,10],[78,86]],[[22,48],[78,48]],[[22,86],[78,86]]],
 'ㅅ':[[[52,12],[16,88]],[[44,48],[86,88]]],
 'ㅇ':[ring(50,50,34,36)],
 'ㅈ':[[[16,16],[80,16],[20,88]]],
 'ㅊ':[[[50,4],[50,18]],[[16,30],[80,30],[22,92]],[[52,60],[86,92]]],
 'ㅋ':[[[15,18],[82,18],[76,88]],[[22,52],[80,52]]],
 'ㅌ':[[[18,14],[84,14]],[[18,48],[84,48]],[[18,14],[18,84],[88,84]]],
 'ㅍ':[[[14,16],[86,16]],[[36,16],[32,80]],[[64,16],[68,80]],[[10,82],[90,82]]],
 'ㅎ':[[[50,2],[50,16]],[[18,28],[82,28]],ring(50,64,24,26)],
 'ㅣ':[[[50,4],[50,96]]],
 'ㅏ':[[[40,4],[40,96]],[[40,48],[80,48]]],
 'ㅑ':[[[40,4],[40,96]],[[40,34],[80,34]],[[40,64],[80,64]]],
 'ㅓ':[[[20,48],[60,48]],[[60,4],[60,96]]],
 'ㅕ':[[[20,34],[60,34]],[[20,64],[60,64]],[[60,4],[60,96]]],
 'ㅐ':[[[28,4],[28,96]],[[28,48],[56,48]],[[70,4],[70,96]]],
 'ㅔ':[[[16,48],[44,48]],[[44,4],[44,96]],[[74,4],[74,96]]],
 'ㅗ':[[[50,14],[50,58]],[[4,58],[96,58]]],
 'ㅛ':[[[34,14],[34,58]],[[66,14],[66,58]],[[4,58],[96,58]]],
 'ㅜ':[[[4,36],[96,36]],[[50,36],[50,88]]],
 'ㅠ':[[[4,36],[96,36]],[[34,36],[34,88]],[[66,36],[66,88]]],
 'ㅡ':[[[4,50],[96,50]]],
};
J['ㅈ'].push([[50,50],[86,88]]);
[['ㄲ','ㄱ'],['ㄸ','ㄷ'],['ㅃ','ㅂ'],['ㅆ','ㅅ'],['ㅉ','ㅈ']].forEach(([d,b])=>{J[d]=[0,52].flatMap(ox=>J[b].map(s=>s.map(([x,y])=>[ox+x*.48,y])))});
export const VERT=new Set(['ㅏ','ㅐ','ㅑ','ㅓ','ㅔ','ㅕ','ㅣ']),HOR=new Set(['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ']);
export function strokesFor(ch){
  const c=ch.charCodeAt(0)-0xAC00;if(c<0||c>11171)return null;
  const i=CHO[Math.floor(c/588)],v=JUNG[Math.floor(c%588/28)],fn=JONG[c%28];
  if(!J[i]||!J[v]||(fn&&!J[fn])||!(VERT.has(v)||HOR.has(v)))return null;
  const vt=VERT.has(v);
  const B=fn?(vt?{i:[8,6,44,44],v:[56,2,38,56],f:[20,62,60,34]}:{i:[24,4,52,32],v:[6,38,88,24],f:[24,66,52,30]})
            :(vt?{i:(i==='ㅇ'||i==='ㅎ')?[8,20,46,60]:[8,12,46,76],v:[58,4,36,92]}:{i:[22,6,56,46],v:[6,52,88,40]});
  const map=(pts,[x,y,w,h])=>pts.map(([px,py])=>[x+px/100*w,y+py/100*h]);
  const out=[];[[i,'i'],[v,'v']].concat(fn?[[fn,'f']]:[]).forEach(([j,k])=>J[j].forEach(s=>out.push(map(s,B[k]))));
  return out;
}
export const plen=p=>p.reduce((s,q,i)=>i?s+Math.hypot(q[0]-p[i-1][0],q[1]-p[i-1][1]):0,0);
export function resample(p,n=24){
  if(p.length<2)return Array(n).fill(p[0]);
  const L=plen(p),out=[p[0]];let acc=0,j=1,prev=p[0];const step=L/(n-1);
  for(let k=1;k<n;k++){const target=k*step;
    while(j<p.length){const seg=Math.hypot(p[j][0]-prev[0],p[j][1]-prev[1]);
      if(acc+seg>=target){const t=seg?(target-acc)/seg:0;prev=[prev[0]+(p[j][0]-prev[0])*t,prev[1]+(p[j][1]-prev[1])*t];acc=target;break}
      acc+=seg;prev=p[j];j++}
    out.push(prev)}
  return out}
export function partial(p,t){const L=plen(p)*t,out=[p[0]];let acc=0;for(let i=1;i<p.length;i++){const s=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(acc+s>=L){const k=s?(L-acc)/s:0;out.push([p[i-1][0]+(p[i][0]-p[i-1][0])*k,p[i-1][1]+(p[i][1]-p[i-1][1])*k]);return out}acc+=s;out.push(p[i])}return out}
export function matches(u,r){
  if(u.length<2)return false;
  const a=resample(u),b=resample(r);
  const avg=a.reduce((s,p,i)=>s+Math.hypot(p[0]-b[i][0],p[1]-b[i][1]),0)/a.length;
  const st=Math.hypot(a[0][0]-b[0][0],a[0][1]-b[0][1]);
  return avg<15&&st<20&&plen(u)>plen(r)*.45}

