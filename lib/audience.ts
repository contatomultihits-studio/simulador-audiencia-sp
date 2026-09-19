import type { RadioMonth } from "./ranking";
import { supabase } from "./supabase";

type AudienceRow = {
  radio: string;
  periodo: string;
  audiencia: number;
};

const monthKey = (date: string) => date.slice(0, 7);

export async function loadOfficialAudience(recorte: "todos_os_dias" | "seg_sex_06_19" = "todos_os_dias"): Promise<RadioMonth[]> {
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("audiencia_ranking")
    .select("radio, periodo, audiencia")
    .eq("cidade", "São Paulo")
    .eq("uf", "SP")
    .eq("recorte", recorte)
    .order("periodo", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as AudienceRow[];
  const periods = [...new Set(rows.map((row) => monthKey(row.periodo)))].slice(0, 3);

  const grouped = new Map<string, Record<string, number>>();

  for (const row of rows) {
    const key = monthKey(row.periodo);
    if (!periods.includes(key)) continue;

    const item = grouped.get(row.radio) ?? {};
    item[key] = row.audiencia;
    grouped.set(row.radio, item);
  }

  if (periods.length < 3) return [];

  const [latest, middle, oldest] = periods;
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
