"use client";

import { useMemo, useState } from "react";

type Radio = {
  radio: string;
  jun: number;
  jul: number;
  ago: number;
};

const radios: Radio[] = [
  { radio:"Alpha FM", jun:120152, jul:109915, ago:99675 },
  { radio:"Antena 1", jun:96518, jul:91659, ago:89584 },
  { radio:"Band FM", jun:93431, jul:92000, ago:87297 },
  { radio:"Jovem Pan", jun:94555, jul:79405, ago:74582 },
  { radio:"Nativa", jun:77908, jul:78259, ago:79313 },
  { radio:"89 Rock", jun:83684, jul:76000, ago:65634 },
  { radio:"Transcontinental", jun:66779, jul:70500, ago:72419 },
  { radio:"105", jun:58881, jul:88450, ago:52127 },
  { radio:"Gazeta", jun:62234, jul:57080, ago:64607 },
  { radio:"Mix", jun:60577, jul:57625, ago:59458 },
  { radio:"Metropolitana", jun:59243, jul:51878, ago:65496 },
  { radio:"Kiss", jun:65031, jul:59532, ago:47083 },
  { radio:"Disney", jun:55421, jul:51844, ago:55002 },
  { radio:"BandNews", jun:43988, jul:47968, ago:42669 },
  { radio:"Energia 97", jun:38736, jul:40996, ago:40996 }
];

const fmt = (n:number) => new Intl.NumberFormat("pt-BR").format(Math.round(n));

export default function Home() {
  const [selected, setSelected] = useState("Disney");
  const [september, setSeptember] = useState(55002);

  const ranking = useMemo(() => {
    return radios.map(r => ({
      ...r,
      media: (r.jul + r.ago + (r.radio === selected ? september : r.ago)) / 3
    })).sort((a,b)=>b.media-a.media);
  }, [selected,september]);

  const selectedData = ranking.find(r=>r.radio===selected)!;
  const pos = ranking.findIndex(r=>r.radio===selected)+1;
  const previousMedia = (selectedData.jun+selectedData.jul+selectedData.ago)/3;

  return (
    <main style={{maxWidth:1200,margin:"0 auto",padding:"48px 24px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:24,marginBottom:42}}>
        <div>
          <div style={{fontSize:13,letterSpacing:3,color:"#8d96a8",fontWeight:700}}>AUDIÊNCIA SP</div>
          <h1 style={{fontSize:"clamp(38px,6vw,72px)",lineHeight:.95,margin:"12px 0",letterSpacing:-3}}>O ranking<br/>está nas suas mãos.</h1>
          <p style={{color:"#9da6b5",fontSize:17,maxWidth:650}}>Simule setembro e veja a média móvel de 3 meses mudar em tempo real.</p>
        </div>
        <div style={{border:"1px solid #202532",borderRadius:16,padding:"12px 16px",color:"#8d96a8",fontSize:12}}>SIMULADOR · SP CAPITAL</div>
      </div>

      <section style={{display:"grid",gridTemplateColumns:"1.3fr .7fr",gap:18,marginBottom:22}}>
        <div style={{border:"1px solid #202532",borderRadius:24,padding:24,background:"#0b0e14"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div><div style={{fontSize:12,color:"#7f899b",letterSpacing:1}}>TOP 15 · MÉDIA 3 MESES</div><h2 style={{margin:"7px 0 0",fontSize:25}}>Ranking</h2></div>
            <div style={{fontSize:11,color:"#6f7888"}}>REAL + SIMULAÇÃO</div>
          </div>
          <div>
            {ranking.map((r,i)=>(
              <button key={r.radio} onClick={()=>{setSelected(r.radio);setSeptember(r.ago)}} style={{width:"100%",display:"grid",gridTemplateColumns:"42px 1fr 130px 52px",alignItems:"center",gap:12,padding:"13px 10px",background:r.radio===selected?"#121722":"transparent",color:"#f5f7fb",border:"0",borderRadius:12,textAlign:"left",cursor:"pointer"}}>
                <span style={{color:"#687285",fontWeight:700}}>#{String(i+1).padStart(2,"0")}</span>
                <span style={{fontWeight:700}}>{r.radio}</span>
                <span style={{textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmt(r.media)}</span>
                <span style={{textAlign:"right",color:"#667082",fontSize:12}}>aud.</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{border:"1px solid #202532",borderRadius:24,padding:26,background:"#0b0e14"}}>
          <div style={{fontSize:12,color:"#7f899b",letterSpacing:1}}>SIMULAR SETEMBRO</div>
          <h2 style={{fontSize:38,margin:"8px 0 4px"}}>{selected}</h2>
          <div style={{color:"#8e98a8"}}>posição projetada</div>
          <div style={{fontSize:78,fontWeight:800,letterSpacing:-5,margin:"12px 0"}}>#{String(pos).padStart(2,"0")}</div>
          <div style={{fontSize:13,color:"#7f899b"}}>AUDIÊNCIA EM SETEMBRO</div>
          <div style={{fontSize:30,fontWeight:800,margin:"5px 0 18px"}}>{fmt(september)}</div>
          <input type="range" min="30000" max="90000" step="1000" value={september} onChange={e=>setSeptember(Number(e.target.value))} style={{width:"100%"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#626c7d",marginTop:7}}><span>30 mil</span><span>90 mil</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginTop:18}}>
            {[55000,60000,70000].map(v=><button key={v} onClick={()=>setSeptember(v)} style={{background:"#151a24",color:"#dce1ea",border:"1px solid #252c3a",borderRadius:10,padding:"9px 4px",cursor:"pointer"}}>{v/1000}k</button>)}
          </div>
          <div style={{marginTop:20,paddingTop:18,borderTop:"1px solid #202532",color:"#929baa",fontSize:13,lineHeight:1.6}}>
            Média projetada: <b style={{color:"#fff"}}>{fmt(selectedData.media)}</b><br/>
            Média atual: <b style={{color:"#fff"}}>{fmt(previousMedia)}</b>
          </div>
        </div>
      </section>

      <div style={{color:"#5f697a",fontSize:12}}>Dados oficiais entram pelo Supabase. Esta tela é a primeira camada do simulador; a simulação não altera os dados oficiais.</div>
    </main>
  );
}
