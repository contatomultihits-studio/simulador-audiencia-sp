"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { demoRadios } from "../lib/demo-data";
import { loadOfficialAudience } from "../lib/audience";
import { calculateRanking } from "../lib/ranking";

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(Math.round(n));

export default function Home() {
  const [radios, setRadios] = useState(demoRadios);
  const [dataMode, setDataMode] = useState<"demo" | "official">("demo");
  const [selected, setSelected] = useState("Disney");
  const [september, setSeptember] = useState(55002);
  const [mode, setMode] = useState<"simulador" | "desafio">("simulador");

  useEffect(() => {
    loadOfficialAudience()
      .then((official) => {
        if (!official.length) return;
        setRadios(official);
        setDataMode("official");
        setSelected(official.some((r) => r.radio === "Disney") ? "Disney" : official[0].radio);
      })
      .catch(() => setDataMode("demo"));
  }, []);

  const ranking = useMemo(
    () => calculateRanking(radios, selected, september),
    [radios, selected, september]
  );

  const selectedData = ranking.find((r) => r.radio === selected) ?? ranking[0];
  const position = ranking.findIndex((r) => r.radio === selected) + 1;
  const currentMedia = selectedData
    ? (selectedData.jun + selectedData.jul + selectedData.ago) / 3
    : 0;

  const previousRanking = useMemo(
    () => [...radios].sort((a, b) =>
      (b.jun + b.jul + b.ago) - (a.jun + a.jul + a.ago)
    ),
    [radios]
  );

  const previousPosition = previousRanking.findIndex((r) => r.radio === selected) + 1;
  const positionChange = previousPosition - position;
  const targetPosition = 10;
  const challengeComplete = selected === "Disney" && position <= targetPosition;

  const nextRadio = ranking[position - 2];
  const distanceToNext = nextRadio ? selectedData.media - nextRadio.media : 0;

  const positionText = positionChange === 0
    ? "mesma posição"
    : positionChange > 0
      ? "subiu " + positionChange + " posição" + (positionChange > 1 ? "ões" : "")
      : "caiu " + Math.abs(positionChange) + " posição" + (Math.abs(positionChange) > 1 ? "ões" : "");

  if (!selectedData) return null;

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <div className="eyebrow">AUDIÊNCIA SP</div>
          <h1>O ranking<br />está nas suas mãos.</h1>
          <p>Mexa em setembro e veja a média móvel de 3 meses mudar em tempo real.</p>
        </div>
        <div className="status">
          <span className={dataMode === "official" ? "dot live" : "dot"} />
          {dataMode === "official" ? "DADOS OFICIAIS · SP CAPITAL" : "BASE DE DEMONSTRAÇÃO"}
        </div>
      </header>

      <nav className="modebar">
        <button className={mode === "simulador" ? "active" : ""} onClick={() => setMode("simulador")}>SIMULADOR</button>
        <button className={mode === "desafio" ? "active" : ""} onClick={() => { setMode("desafio"); setSelected("Disney"); }}>DESAFIO</button>
      </nav>

      <AnimatePresence mode="wait">
        {mode === "desafio" ? (
          <motion.section
            key="challenge"
            className="challenge"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div>
              <div className="eyebrow">DESAFIO 01</div>
              <h2>Leve a Disney para o Top 10.</h2>
              <p>Você controla apenas setembro. As outras rádios repetem agosto nesta simulação.</p>
            </div>
            <div className={"challenge-result " + (challengeComplete ? "complete" : "")}>
              <div className="challenge-label">{challengeComplete ? "DESAFIO CONCLUÍDO" : "AINDA NÃO"}</div>
              <div className="challenge-position">#{String(position).padStart(2, "0")}</div>
              <div className="challenge-small">Disney · {fmt(september)} em setembro</div>
            </div>
            <div className="challenge-controls">
              <input
                aria-label="Audiência da Disney em setembro"
                type="range" min="30000" max="90000" step="1000"
                value={september}
                onChange={(e) => setSeptember(Number(e.target.value))}
              />
              <div className="quick">
                {[60000, 65000, 70000, 75000, 80000].map((v) => (
                  <button key={v} onClick={() => setSeptember(v)}>{v / 1000}k</button>
                ))}
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section className="grid">
        <div className="panel ranking-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">TOP 15 · MÉDIA MÓVEL</div>
              <h2>Ranking</h2>
            </div>
            <span className="muted">SETEMBRO SIMULADO</span>
          </div>

          <div className="rows">
            <AnimatePresence initial={false}>
              {ranking.map((r, i) => (
                <motion.button
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  key={r.radio}
                  onClick={() => { setSelected(r.radio); setSeptember(r.ago); }}
                  className={"rank-row " + (r.radio === selected ? "selected" : "")}
                >
                  <span className="rank-number">#{String(i + 1).padStart(2, "0")}</span>
                  <span className="radio-name">{r.radio}</span>
                  <span className="media">{fmt(r.media)}</span>
                  <span className={"delta " + (r.change >= 0 ? "up" : "down")}>
                    {r.change >= 0 ? "+" : ""}{fmt(r.change)}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <aside className="panel simulator">
          <div className="eyebrow">SIMULAR SETEMBRO</div>
          <h2>{selectedData.radio}</h2>
          <div className="position-label">posição projetada</div>
          <motion.div
            key={position}
            initial={{ scale: .82, opacity: .5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="big-position"
          >
            #{String(position).padStart(2, "0")}
          </motion.div>
          <div className={"movement " + (positionChange > 0 ? "up" : positionChange < 0 ? "down" : "")}>
            {positionText}
          </div>

          <div className="audience-label">AUDIÊNCIA EM SETEMBRO</div>
          <div className="audience-value">{fmt(september)}</div>
          <input
            aria-label="Audiência simulada de setembro"
            type="range" min="30000" max="90000" step="1000"
            value={september}
            onChange={(e) => setSeptember(Number(e.target.value))}
          />
          <div className="range-labels"><span>30 mil</span><span>90 mil</span></div>

          <div className="quick">
            {[55000, 60000, 70000, 80000].map((v) => (
              <button key={v} onClick={() => setSeptember(v)}>{v / 1000}k</button>
            ))}
          </div>

          <div className="stats">
            <div><span>MÉDIA PROJETADA</span><b>{fmt(selectedData.media)}</b></div>
            <div><span>MÉDIA ATUAL</span><b>{fmt(currentMedia)}</b></div>
            <div><span>VARIAÇÃO</span><b>{selectedData.change >= 0 ? "+" : ""}{fmt(selectedData.change)}</b></div>
          </div>

          {nextRadio ? (
            <div className="next-target">
              <span>PRÓXIMA RÁDIO</span>
              <strong>{nextRadio.radio}</strong>
              <small>{Math.abs(distanceToNext).toLocaleString("pt-BR")} de diferença</small>
            </div>
          ) : null}
        </aside>
      </section>

      <footer>
        {dataMode === "official"
          ? "Dados oficiais carregados do Supabase. A simulação não altera os dados oficiais."
          : "Aguardando a base oficial completa. A tela usa demonstração enquanto isso."}
      </footer>
    </main>
  );
}
