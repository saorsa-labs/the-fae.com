/* Fae Static Logo — renders the orb logo via canvas on page load */
(function() {
  var F2=.5*(Math.sqrt(3)-1),G2=(3-Math.sqrt(3))/6,grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  function Noise(seed){this.perm=new Uint8Array(512);this.pm12=new Uint8Array(512);var p=new Uint8Array(256);for(var i=0;i<256;i++)p[i]=i;var s=seed*2147483647;for(var i=255;i>0;i--){s=(s*16807)%2147483647;var j=s%(i+1);var t=p[i];p[i]=p[j];p[j]=t}for(var i=0;i<512;i++){this.perm[i]=p[i&255];this.pm12[i]=this.perm[i]%12}}
  Noise.prototype.n2d=function(x,y){var s=(x+y)*F2,i=Math.floor(x+s),j=Math.floor(y+s),t=(i+j)*G2,x0=x-(i-t),y0=y-(j-t),i1=x0>y0?1:0,j1=x0>y0?0:1,x1=x0-i1+G2,y1=y0-j1+G2,x2=x0-1+2*G2,y2=y0-1+2*G2,ii=i&255,jj=j&255;function d(gi,dx,dy){return grad3[gi][0]*dx+grad3[gi][1]*dy}var n0=0,n1=0,n2=0,t0=.5-x0*x0-y0*y0;if(t0>=0){t0*=t0;n0=t0*t0*d(this.pm12[ii+this.perm[jj]],x0,y0)}var t1=.5-x1*x1-y1*y1;if(t1>=0){t1*=t1;n1=t1*t1*d(this.pm12[ii+i1+this.perm[jj+j1]],x1,y1)}var t2=.5-x2*x2-y2*y2;if(t2>=0){t2*=t2;n2=t2*t2*d(this.pm12[ii+1+this.perm[jj+1]],x2,y2)}return 70*(n0+n1+n2)};

  function hex(h){var n=parseInt(h.replace('#',''),16);return[(n>>16)&255,(n>>8)&255,n&255]}
  function lerp(a,b,t){return[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)]}
  function rgba(c,a){return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}

  var V={seed:204,time:2.9,layers:11,amp:1.52,nB:39,nG:54,aB:0.11,aG:0.15,bM:0.62,oS:0.58,pN:22,pSz:[1.7,3],pA:0.46,pSp:[0.70,0.30]};
  var cols=[hex('#F0A830'),hex('#C47A20'),hex('#7A4010')];
  var pCols=[hex('#F0A830'),hex('#D49138'),hex('#E8B840')];

  function render(canvas,sz){
    var noise=new Noise(V.seed),rng=new Noise(V.seed+99);
    canvas.width=sz;canvas.height=sz;
    var ctx=canvas.getContext('2d');
    var s=sz/240;ctx.setTransform(s,0,0,s,0,0);
    var w=240,cx=120,cy=120,oR=w*V.oS,sp=0.6,tm=V.time;

    // transparent bg
    ctx.clearRect(0,0,w,w);

    for(var l=0;l<V.layers;l++){
      var lT=l/V.layers,lR=oR*(0.15+lT*0.85),nS=1+lT*0.7;
      var nA=(V.nB+lT*V.nG)*V.amp,al=V.aB+lT*V.aG;
      var c=lT<0.35?lerp(cols[2],cols[1],lT/0.35):lerp(cols[1],cols[0],(lT-0.35)/0.65);
      ctx.beginPath();
      for(var i=0;i<=120;i++){
        var a=(i/120)*Math.PI*2;
        var n1=noise.n2d(Math.cos(a)*nS*0.5+tm*0.2*sp+l*0.7,Math.sin(a)*nS*0.5+tm*0.15*sp+l*0.5);
        var n2=noise.n2d(Math.cos(a)*nS*2.2+tm*0.35*sp+l*1.3+5.5,Math.sin(a)*nS*2.2+tm*0.25*sp+l*0.9+5.5);
        var n=n1*V.bM+n2*(1-V.bM),r=lR+n*nA;
        var x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      var g=ctx.createRadialGradient(cx,cy,lR*0.05,cx,cy,lR*1.1);
      g.addColorStop(0,rgba(c,al*2));g.addColorStop(0.3,rgba(c,al*1.2));
      g.addColorStop(0.65,rgba(c,al*0.4));g.addColorStop(1,rgba(c,0));
      ctx.fillStyle=g;ctx.fill();
    }
    // bright point
    var ba=tm*0.15+Math.sin(tm*0.23)*0.8,br=oR*(0.2+Math.sin(tm*0.18)*0.12);
    var bx=cx+Math.cos(ba)*br,by=cy+Math.sin(ba)*br;
    var bg=ctx.createRadialGradient(bx,by,0,bx,by,oR*0.12);
    bg.addColorStop(0,'rgba(255,240,200,0.25)');bg.addColorStop(0.2,'rgba(245,220,160,0.12)');
    bg.addColorStop(0.5,'rgba(230,190,120,0.04)');bg.addColorStop(1,'rgba(220,170,100,0)');
    ctx.fillStyle=bg;ctx.beginPath();ctx.arc(bx,by,oR*0.08,0,Math.PI*2);ctx.fill();
    var bc=ctx.createRadialGradient(bx,by,0,bx,by,1.5);
    bc.addColorStop(0,'rgba(255,250,238,0.8)');bc.addColorStop(1,'rgba(255,235,180,0)');
    ctx.fillStyle=bc;ctx.beginPath();ctx.arc(bx,by,1.5,0,Math.PI*2);ctx.fill();
    // particles
    for(var i=0;i<V.pN;i++){
      var pa=(i/V.pN)*Math.PI*2+rng.n2d(i,0)*1.5;
      var pr=(V.pSp[0]+rng.n2d(i,1)*0.5*V.pSp[1])*w*0.5;
      var px=cx+Math.cos(pa)*pr,py=cy+Math.sin(pa)*pr;
      var ps=V.pSz[0]+Math.abs(rng.n2d(i,2))*(V.pSz[1]-V.pSz[0]);
      var pal=V.pA*(0.5+Math.abs(rng.n2d(i,3))*0.5);
      var ci=Math.floor(Math.abs(rng.n2d(i,4))*pCols.length)%pCols.length;
      ctx.beginPath();ctx.arc(px,py,ps,0,Math.PI*2);
      ctx.fillStyle=rgba(pCols[ci],pal);ctx.fill();
    }
  }

  document.addEventListener('DOMContentLoaded',function(){
    var imgs=document.querySelectorAll('.nav__logo-orb');
    if(!imgs.length)return;
    var c=document.createElement('canvas');
    render(c,256);
    var url=c.toDataURL('image/png');
    for(var i=0;i<imgs.length;i++){
      if(imgs[i].tagName==='IMG') imgs[i].src=url;
    }
  });
})();
