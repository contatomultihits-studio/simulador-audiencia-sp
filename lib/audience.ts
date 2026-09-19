import type { RadioMonth } from "./ranking";
import { supabase } from "./supabase";

type AudienceRow = {
  radio: string;
  periodo: string;
  audiencia: number;
};

export type AudienceCut = "todos_os_dias" | "seg_sex_06_19";

const TABLE_BY_CUT: Record<AudienceCut, string> = {
  todos_os_dias: "audiencia_todos_os_dias",
  seg_sex_06_19: "audiencia_seg_sex_06_19"
};

const monthKey = (date: string) => date.slice(0, 7);

function buildRanking(rows: AudienceRow[]): RadioMonth[] {
  const periods = [...new Set(rows.map((row) => monthKey(row.periodo)))]
    .sort()
    .reverse()
    .slice(0, 3);

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

export async function loadOfficialAudience(
  recorte: AudienceCut = "todos_os_dias"
): Promise<RadioMonth[]> {
  if (!supabase) throw new Error("Supabase não configurado");

  const table = TABLE_BY_CUT[recorte];

  const { data, error } = await supabase
    .from(table)
    .select("radio, periodo, audiencia")
    .eq("cidade", "São Paulo")
    .eq("uf", "SP")
    .order("periodo", { ascending: false });

  if (error) throw error;

  return buildRanking((data ?? []) as AudienceRow[]);
}
