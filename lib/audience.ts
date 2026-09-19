import type { RadioMonth } from "./ranking";
import { supabase } from "./supabase";

type AudienceRow = {
  radio: string;
  periodo: string;
  audiencia: number;
  recorte: "todos_os_dias" | "seg_sex_06_19";
};

export type AudienceCut = "todos_os_dias" | "seg_sex_06_19";
export type AudienceByCut = Record<AudienceCut, RadioMonth[]>;

const monthKey = (date: string) => date.slice(0, 7);

function buildRanking(rows: AudienceRow[]): RadioMonth[] {
  const periods = [...new Set(rows.map((row) => monthKey(row.periodo)))].sort().reverse().slice(0, 3);
  if (periods.length < 3) return [];

  const [latest, middle, oldest] = periods;
  const grouped = new Map<string, Record<string, number>>();

  for (const row of rows) {
    const key = monthKey(row.periodo);
    if (!periods.includes(key)) continue;
    const item = grouped.get(row.radio) ?? {};
    item[key] = row.audiencia;
    grouped.set(row.radio, item);
  }

  return [...grouped.entries()]
    .filter(([, values]) =>
      values[oldest] !== undefined &&
      values[middle] !== undefined &&
      values[latest] !== undefined
    )
    .map(([radio, values]) => ({
      radio,
      jun: values[oldest],
      jul: values[middle],
      ago: values[latest]
    }));
}

export async function loadOfficialAudienceSets(): Promise<AudienceByCut> {
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("audiencia_ranking")
    .select("radio, periodo, audiencia, recorte")
    .eq("cidade", "São Paulo")
    .eq("uf", "SP")
    .in("recorte", ["todos_os_dias", "seg_sex_06_19"])
    .order("periodo", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as AudienceRow[];

  return {
    todos_os_dias: buildRanking(rows.filter((row) => row.recorte === "todos_os_dias")),
    seg_sex_06_19: buildRanking(rows.filter((row) => row.recorte === "seg_sex_06_19"))
  };
}

export async function loadOfficialAudience(recorte: AudienceCut = "todos_os_dias"): Promise<RadioMonth[]> {
  const sets = await loadOfficialAudienceSets();
  return sets[recorte];
}
