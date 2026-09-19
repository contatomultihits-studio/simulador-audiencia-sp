"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { demoRadios } from "../lib/demo-data";
import { loadOfficialAudience } from "../lib/audience";
import { calculateRanking } from "../lib/ranking";

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(Math.round(n));

export default function Home() {
  const [radios, setRadios] = useState(demoRadios);
  const [dataMode, setDataMode] = useState<"demo" | "official" | "partial">("demo");
  const [selected, setSelected] = useState("Disney");
  const [projections, setProjections] = useState<Record<string, number>>({});

  useEffect(() => {
    loadOfficialAudience()
      .then((official) => {
        if (!official.length) return;
        setRadios(official);
        setDataMode(official.length >= 15 ? "official" : "partial");
        setSelected(official.some((r) => r.radio === "Disney") ? "Disney" : official[0].radio);
      })
      .catch(() => setDataMode("demo"));
  }, []);

  const hasSimulation = Object.keys(projections).length > 0;

  const ranking = useMemo(() => {
    return radios
      .map((radio) => {
        const projection = projections[radio.radio] ?? radio.ago;
        const media = (radio.jul + radio.ago + projection) / 3;
        const currentMedia = (radio.jun + radio.jul + radio.ago) / 3;
        return { ...radio, media, change: media - currentMedia };
      })
      .sort((a, b) => b.media - a.media);
  }, [radios, projections]);

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

  const nextRadio = ranking[position - 2];
  const distanceToNext = nextRadio ? selectedData.media - nextRadio.media : 0;

  const september = projections[selectedData.radio] ?? selectedData.ago;
  const projectionChange = september - selectedData.ago;
  const positionText = positionChange === 0
    ? "mesma posição"
    : positionChange > 0
      ? "subiu " + positionChange + " posição" + (positionChange > 1 ? "ões" : "")
      : "caiu " + Math.abs(positionChange) + " posição" + (Math.abs(positionChange) > 1 ? "ões" : "");

  const chart = useMemo(() => {
    const values = [selectedData.jun, selectedData.jul, selectedData.ago, september];
    const width = 640;
    const height = 210;
    const padX = 38;
    const padY = 30;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, 1);
    const points = values.map((value, index) => {
      const x = padX + index * ((width - padX * 2) / 3);
      const y = height - padY - ((value - min) / span) * (height - padY * 2);
      return { x, y, value };
    });
    return { width, height, points, line: points.map((p) => `${p.x},${p.y}`).join(" ") };
  }, [selectedData, september]);

  if (!selectedData) return null;

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <div className="eyebrow">AUDIÊNCIA SP</div>
          <h1>Veja a audiência<br />se mover.</h1>
          <p>Histórico real, projeção de setembro e média móvel de 3 meses — tudo na mesma visualização.</p>
        </div>
        <div className="status">
          <span className={dataMode === "official" ? "dot live" : "dot"} />
          {dataMode === "official"
            ? "DADOS OFICIAIS · SP CAPITAL"
            : dataMode === "partial"
              ? "BASE OFICIAL PARCIAL · SP CAPITAL"
              : "BASE DE DEMONSTRAÇÃO"}
        </div>
      </header>

      <section className="grid">
        <div className="panel ranking-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">TOP 15 · MÉDIA MÓVEL</div>
              <h2>Ranking</h2>
            </div>
            <div className="panel-actions"><span className="muted">{hasSimulation ? "SETEMBRO · SIMULAÇÃO" : "DADOS REAIS"}</span>{hasSimulation ? <button className="reset-button" onClick={() => setProjections({})}>↺ VOLTAR AO ORIGINAL</button> : null}</div>
          </div>

          <div className="rows">
            {ranking.map((r, i) => (
              <motion.button
                layout
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                key={r.radio}
                onClick={() => setSelected(r.radio)}
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
          </div>
        </div>

        <aside className="panel simulator">
          <div className="eyebrow">SIMULADOR</div>
          <h2>{selectedData.radio}</h2>

          <div className="projection-top">
            <div>
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
            </div>
            <div className="projection-number">
              <span>SETEMBRO</span>
              <strong>{fmt(september)}</strong>
              <small>{projectionChange >= 0 ? "+" : ""}{fmt(projectionChange)} vs. agosto</small>
            </div>
          </div>

          <div className="history">
            <div className="history-head">
              <div>
                <span className="eyebrow">EVOLUÇÃO MÊS A MÊS</span>
                <strong>Histórico → projeção</strong>
              </div>
              <span className="projection-badge">{hasSimulation ? "SET · SIMULAÇÃO" : "SET · BASE REAL"}</span>
            </div>

            <div className="chart-wrap">
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`Audiência de junho a setembro de ${selectedData.radio}`}>
                <line x1="38" y1="180" x2="602" y2="180" className="chart-axis" />
                <polyline points={chart.line} className="chart-line" />
                <line x1={chart.points[2].x} y1="22" x2={chart.points[2].x} y2="190" className="projection-divider" />
                {chart.points.map((point, index) => (
                  <g key={index}>
                    <circle cx={point.x} cy={point.y} r={index === 3 ? 6 : 4.5} className={index === 3 ? "chart-dot projected" : "chart-dot"} />
                    <text x={point.x} y="202" textAnchor="middle" className="chart-label">
                      {["JUN", "JUL", "AGO", "SET"][index]}
                    </text>
                    <text x={point.x} y={Math.max(point.y - 12, 15)} textAnchor="middle" className="chart-value">
                      {fmt(point.value)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="history-values">
              <div><span>JUN</span><b>{fmt(selectedData.jun)}</b></div>
              <div><span>JUL</span><b>{fmt(selectedData.jul)}</b></div>
              <div><span>AGO</span><b>{fmt(selectedData.ago)}</b></div>
              <div className="projected"><span>SET</span><b>{fmt(september)}</b></div>
            </div>
          </div>

          <div className="audience-control">
            <div className="audience-control-head">
              <div>
                <span className="audience-label">ARRASTE SETEMBRO</span>
                <div className="audience-value">{fmt(september)}</div>
              </div>
              <div className="quick">
                {[55000, 60000, 65000, 70000, 75000, 80000].map((v) => (
                  <button key={v} onClick={() => setProjections((p) => ({ ...p, [selectedData.radio]: v }))}>{v / 1000}k</button>
                ))}
              </div>
            </div>
            <input
              aria-label={`Audiência simulada de setembro para ${selectedData.radio}`}
              type="range" min="30000" max="90000" step="1000"
              value={september}
              onChange={(e) => setProjections((p) => ({ ...p, [selectedData.radio]: Number(e.target.value) }))}
            />
            <div className="range-labels"><span>30 mil</span><span>90 mil</span></div>
          </div>

          <div className="average-flow">
            <div>
              <span>MÉDIA ATUAL</span>
              <b>{fmt(currentMedia)}</b>
            </div>
            <div className="flow-arrow">→</div>
            <div className="projected">
              <span>MÉDIA PROJETADA</span>
              <b>{fmt(selectedData.media)}</b>
            </div>
            <div className={"flow-change " + (selectedData.change >= 0 ? "up" : "down")}>
              {selectedData.change >= 0 ? "+" : ""}{fmt(selectedData.change)}
            </div>
          </div>

          {nextRadio ? (
            <div className="next-target">
              <div>
                <span>RÁDIO ACIMA</span>
                <strong>{nextRadio.radio}</strong>
              </div>
              <small>{Math.abs(distanceToNext).toLocaleString("pt-BR")} de diferença</small>
            </div>
          ) : null}
        </aside>
      </section>

      <footer>
        {dataMode === "official"
          ? "Os meses históricos são preservados. A projeção de setembro existe apenas no simulador e não altera a base oficial."
          : dataMode === "partial"
            ? "A base oficial ainda não está completa. A projeção é apenas para visualização e não altera os dados oficiais."
            : "Modo demonstração: os dados históricos são ilustrativos. A projeção de setembro não altera a base."}
      </footer>
    </main>
  );
}
