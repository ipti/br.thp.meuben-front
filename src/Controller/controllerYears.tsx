const FIRST_AVAILABLE_YEAR = 2021;

export function controllerYears(date = new Date()) {
  const currentYear = date.getFullYear();
  const lastAvailableYear =
    date.getMonth() >= 10 ? currentYear + 1 : currentYear;
  const yearsOptions: Array<{ value: number }> = [];

  for (let year = FIRST_AVAILABLE_YEAR; year <= lastAvailableYear; year++) {
    yearsOptions.push({ value: year });
  }

  return { yearsOptions, currentYear };
}
