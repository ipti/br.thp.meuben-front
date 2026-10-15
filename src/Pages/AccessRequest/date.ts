/**
 * Formata uma data civil (como nascimento) sem convertê-la para o fuso local.
 * Valores YYYY-MM-DD representam um dia do calendário, não um instante UTC.
 */
export function formatCalendarDate(value?: string | null): string {
  if (!value) return "—";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
