export const getDateFromUnknown = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  const stringValue = String(value).trim();

  if (!stringValue) {
    return null;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(stringValue)) {
    const [day, month, year] = stringValue.split("/");
    const parsed = new Date(`${year}-${month}-${day}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(stringValue);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const getAgeFromBirthDate = (value: unknown): number | null => {
  const birthDate = getDateFromUnknown(value);

  if (!birthDate) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

export const isUnder18ByBirthDate = (value: unknown): boolean => {
  const age = getAgeFromBirthDate(value);
  return age !== null && age < 18;
};

export const shouldRequireBeneficiaryPhone = (value: unknown): boolean =>
  !isUnder18ByBirthDate(value);

export const shouldRequireResponsiblePhone = (value: unknown): boolean =>
  isUnder18ByBirthDate(value);

export const sanitizeDigits = (value: string | null | undefined): string =>
  (value || "").replace(/[^\d]/g, "");
