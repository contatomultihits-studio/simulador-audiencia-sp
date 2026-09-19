"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { demoRadios } from "../lib/demo-data";
import { loadOfficialAudience } from "../lib/audience";

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(Math.round(n));

export default function Home() {
  const [radios, setRadios] = useState(demoRadios);
  const [dataMode, setDataMode] = useState<"demo" | "official" | "partial">("demo");
  const [selected, setSelected] = useState("Disney");
  const [projections, setProjections] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<"current" | "projection">("current");
  const [recorte, setRecorte] = useState<"todos_os_dias" | "seg_sex_06_19">("todos_os_dias");
  const [loadingRecorte, setLoadingRecorte] = useState(false);
  const [recorteError, setRecorteError] = useState("");

  useEffect(() => {
    let active = true;

    setLoadingRecorte(true);
    Promise.race([
      loadOfficialAudience(recorte),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tempo limite ao consultar a base oficial")), 10000)
      )
    ])
      .then((official) => {
        if (!active) return;

        if (!official.length) {
          throw new Error("Recorte oficial sem dados");
        }

        setRadios(official);
        setDataMode(official.length >= 15 ? "official" : "partial");
        setSelected(official.some((r) => r.radio === "Disney") ? "Disney" : official[0].radio);
      })
      .catch((error) => {
        if (!active) return;
        setRadios([]);
        setDataMode("demo");
        setRecorteError(error instanceof Error ? error.message : "Não foi possível carregar a base oficial.");
      })
      .finally(() => {
        if (active) setLoadingRecorte(false);
      });

    return () => {
      active = false;
    };
  }, [recorte]);

  const hasSimulation = Object.keys(projections).length > 0;

  useEffect(() => {
    setProjections({});
  }, [recorte]);

  const currentRanking = useMemo(() => {
    return [...radios]
      .map((radio) => ({
        ...radio,
        media: (radio.jun + radio.jul + radio.ago) / 3,
        change: 0
      }))
      .sort((a, b) => b.media - a.media);
  }, [radios]);

  const ranking = useMemo(() => {
    if (viewMode === "current") return currentRanking;

    return radios
      .map((radio) => {
        const projection = projections[radio.radio] ?? radio.ago;
        const media = (radio.jul + radio.ago + projection) / 3;
        const currentMedia = (radio.jun + radio.jul + radio.ago) / 3;
        return { ...radio, media, change: media - currentMedia };
      })
      .sort((a, b) => b.media - a.media);
  }, [radios, projections, viewMode, currentRanking]);

  const selectedData = ranking.find((r) => r.radio === selected) ?? ranking[0];
  const position = ranking.findIndex((r) => r.radio === selected) + 1;

  const currentMedia = selectedData
    ? (selectedData.jun + selectedData.jul + selectedData.ago) / 3
    : 0;

  const previousRanking = currentRanking;

  const previousPosition = previousRanking.findIndex((r) => r.radio === selected) + 1;
  const positionChange = viewMode === "projection" ? previousPosition - position : 0;

  const nextRadio = viewMode === "projection" ? ranking[position - 2] : null;
  const distanceToNext = nextRadio ? selectedData.media - nextRadio.media : 0;

  const september = selectedData ? (projections[selectedData.radio] ?? selectedData.ago) : 0;
  const projectionChange = selectedData ? september - selectedData.ago : 0;
  const positionText = positionChange === 0
    ? "mesma posição"
    : positionChange > 0
      ? "subiu " + positionChange + " posição" + (positionChange > 1 ? "ões" : "")
      : "caiu " + Math.abs(positionChange) + " posição" + (Math.abs(positionChange) > 1 ? "ões" : "");

  const chart = useMemo(() => {
    if (!selectedData) return { width: 640, height: 210, points: [], line: "" };
    const values = viewMode === "projection" ? [selectedData.jun, selectedData.jul, selectedData.ago, september] : [selectedData.jun, selectedData.jul, selectedData.ago];
    const width = 640;
    const height = 210;
    const padX = 38;
    const padY = 30;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, 1);
    const points = values.map((value, index) => {
      const x = padX + index * ((width - padX * 2) / (values.length - 1));
      const y = height - padY - ((value - min) / span) * (height - padY * 2);
      return { x, y, value };
    });
    return { width, height, points, line: points.map((p) => `${p.x},${p.y}`).join(" ") };
  }, [selectedData, september, viewMode]);

  if (loadingRecorte || !selectedData || recorteError) {
    return (
      <main className="shell">
        <header className="hero">
          <div>
            <div className="eyebrow">AUDIÊNCIA SP</div>
            <h1>Carregando<br />o recorte.</h1>
            <p>Atualizando a base de audiência para a visualização selecionada.</p>
          </div>
        </header>
      </main>
    );
  }

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

      <div className="view-switch recorte-switch" role="tablist" aria-label="Recorte de audiência">
        <button className="cut-all" aria-selected={recorte === "todos_os_dias"} onClick={() => setRecorte("todos_os_dias")} role="tab">
          TODOS OS DIAS<span>Segunda a segunda · 05–24</span>
        </button>
        <button className="cut-weekday" aria-selected={recorte === "seg_sex_06_19"} onClick={() => setRecorte("seg_sex_06_19")} role="tab">
          SEG–SEX · 06–19<span>Segunda a sexta · 06h às 19h</span>
        </button>
      </div>

      <div className="view-switch mode-switch" role="tablist" aria-label="Modo de visualização">
        <button className={viewMode === "current" ? "active" : ""} onClick={() => setViewMode("current")} role="tab" aria-selected={viewMode === "current"}>
          RANKING ATUAL<span>Dados da base</span>
        </button>
        <button className={viewMode === "projection" ? "active projection-tab" : ""} onClick={() => setViewMode("projection")} role="tab" aria-selected={viewMode === "projection"}>
          PROJEÇÃO<span>Simule setembro</span>
        </button>
      </div>

      <section className="grid">
        <div className="panel ranking-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">TOP 15 · MÉDIA MÓVEL · {recorte === "todos_os_dias" ? "TODOS OS DIAS" : "SEG–SEX · 06–19"}</div>
              <h2>Ranking</h2>
            </div>
            <div className="panel-actions"><span className="muted">{viewMode === "projection" ? "SETEMBRO · SIMULAÇÃO" : "BASE ATUAL"}</span>{viewMode === "projection" && hasSimulation ? <button className="reset-button" onClick={() => setProjections({})}>↺ LIMPAR SIMULAÇÃO</button> : null}</div>
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
                  {viewMode === "projection" ? ((r.change >= 0 ? "+" : "") + fmt(r.change)) : "—"}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <aside className="panel simulator">
          <div className="eyebrow">{viewMode === "projection" ? "PROJEÇÃO" : "RANKING ATUAL"}</div>
          <h2>{selectedData.radio}</h2>

          <div className="projection-top">
            <div>
              <div className="position-label">{viewMode === "projection" ? "posição projetada" : "posição atual"}</div>
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
              <span>{viewMode === "projection" ? "SETEMBRO" : "AGOSTO"}</span>
              <strong>{fmt(viewMode === "projection" ? september : selectedData.ago)}</strong>
              <small>{viewMode === "projection" ? ((projectionChange >= 0 ? "+" : "") + fmt(projectionChange) + " vs. agosto") : "último mês da base"}</small>
            </div>
          </div>

          <div className="history">
            <div className="history-head">
              <div>
                <span className="eyebrow">EVOLUÇÃO MÊS A MÊS</span>
                <strong>{viewMode === "projection" ? "Histórico → projeção" : "Histórico real"}</strong>
              </div>
              <span className="projection-badge">{viewMode === "projection" ? "SET · SIMULAÇÃO" : "BASE REAL"}</span>
            </div>

            <div className="chart-wrap">
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`Audiência de junho a setembro de ${selectedData.radio}`}>
                <line x1="38" y1="180" x2="602" y2="180" className="chart-axis" />
                <polyline points={chart.line} className="chart-line" />
                {viewMode === "projection" ? <line x1={chart.points[2].x} y1="22" x2={chart.points[2].x} y2="190" className="projection-divider" /> : null}
                {chart.points.map((point, index) => (
                  <g key={index}>
                    <circle cx={point.x} cy={point.y} r={index === 3 ? 6 : 4.5} className={index === 3 ? "chart-dot projected" : "chart-dot"} />
                    <text x={point.x} y="202" textAnchor="middle" className="chart-label">
                      {(viewMode === "projection" ? ["JUN", "JUL", "AGO", "SET"] : ["JUN", "JUL", "AGO"])[index]}
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
              {viewMode === "projection" ? <div className="projected"><span>SET</span><b>{fmt(september)}</b></div> : null}
            </div>
          </div>

          {viewMode === "projection" ? <div className="audience-control">
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
          </div> : null}

          <div className="average-flow">
            <div>
              <span>MÉDIA ATUAL</span>
              <b>{fmt(currentMedia)}</b>
            </div>
            <div className="flow-arrow">{viewMode === "projection" ? "→" : "•"}</div>
            <div className="projected">
              <span>{viewMode === "projection" ? "MÉDIA PROJETADA" : "MÉDIA 3 MESES"}</span>
              <b>{fmt(selectedData.media)}</b>
            </div>
            <div className={"flow-change " + (selectedData.change >= 0 ? "up" : "down")}>
              {viewMode === "projection" ? (selectedData.change >= 0 ? "+" : "") + fmt(selectedData.change) : "base"}
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
          ? "Recorte selecionado: " + (recorte === "todos_os_dias" ? "todos os dias · 05–24" : "seg–sex · 06–19") + ". Os meses históricos são preservados. A projeção de setembro existe apenas no simulador e não altera a base oficial."
          : dataMode === "partial"
            ? "A base oficial ainda não está completa. A projeção é apenas para visualização e não altera os dados oficiais."
            : "Modo demonstração: os dados históricos são ilustrativos. A projeção de setembro não altera a base."}
      </footer>

      <footer className="methodology">
        <div className="methodology-label">RECORTE E CÁLCULO</div>
        <p><strong>Recorte selecionado:</strong> {recorte === "todos_os_dias" ? <>segunda a segunda, todos os dias da semana, Day Parts <strong>05h–24h</strong>.</> : <>segunda a sexta, Day Parts <strong>06h–19h</strong>.</>}</p>
        <p><strong>Como calculamos:</strong> o ranking utiliza uma <strong>média móvel de 3 meses</strong>. No cenário real, a média é calculada com <strong>junho + julho + agosto</strong>. Ao projetar setembro, o mês mais antigo é descartado e a nova média passa a considerar <strong>julho + agosto + setembro</strong>.</p>
        <p>Na simulação, cada rádio pode receber sua própria projeção para setembro. As rádios que ainda não receberam uma projeção <strong>repetem o resultado de agosto</strong>. Os dados históricos permanecem preservados e a simulação não altera os dados oficiais.</p>
      </footer>
    </main>
  );
}
