import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getLocales } from "expo-localization";

dayjs.extend(utc);
const locales = getLocales();
const deviceLanguage = locales[0].languageCode ?? "en";

/** Formato de mês aceito pelos helpers: `YYYY-MM` (igual às datas do modelo). */
export const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

export type YearMonth = {
  /** Ano com 4 dígitos (ex.: `2026`). */
  year: number;
  /** Mês de 1 a 12. */
  month: number;
};

export type MonthInfo = YearMonth & {
  /** Total de dias do mês (28 a 31, considerando anos bissextos). */
  daysInMonth: number;
  /**
   * Último dia do mês com valor conhecido: hoje no mês atual, o mês inteiro em
   * meses passados e `0` em meses futuros (nenhum dia aconteceu ainda).
   */
  lastKnownDay: number;
};

/** Índice absoluto do mês (`ano * 12 + mês`), útil para comparar meses. */
const getMonthIndex = (year: number, month: number) => year * 12 + month;

/** Dias de um mês (`month` de 1 a 12), considerando anos bissextos. */
export const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

/** Extrai ano e mês de uma string `YYYY-MM`; `null` se estiver inválida. */
export const parseMonth = (month: string): YearMonth | null => {
  const parsedMonth = MONTH_PATTERN.exec(month);

  if (parsedMonth === null) {
    return null;
  }

  const year = Number(parsedMonth[1]);
  const monthNumber = Number(parsedMonth[2]);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  return { year, month: monthNumber };
};

/** Mês (`YYYY-MM`) de uma data do modelo (`YYYY-MM-DD`). */
export const getMonthOfDate = (date: string) => date.slice(0, 7);

/** Dia (1 a 31) de uma data do modelo (`YYYY-MM-DD`). */
export const getDayOfDate = (date: string) => Number(date.slice(8, 10));

/** Último dia de um mês (`year`/`month`) que já aconteceu — ver `MonthInfo.lastKnownDay`. */
export const getLastKnownDayOfMonth = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  const currentMonthIndex = getMonthIndex(
    today.getFullYear(),
    today.getMonth() + 1,
  );
  const monthIndex = getMonthIndex(year, month);

  if (monthIndex > currentMonthIndex) {
    return 0;
  }

  return monthIndex === currentMonthIndex ? today.getDate() : daysInMonth;
};

/**
 * Informações de um mês `YYYY-MM` (dias totais e último dia já acontecido).
 * Retorna `null` se `month` não estiver no formato esperado.
 */
export const getMonthInfo = (month: string): MonthInfo | null => {
  const parsedMonth = parseMonth(month);

  if (parsedMonth === null) {
    return null;
  }

  const { year, month: monthNumber } = parsedMonth;

  return {
    year,
    month: monthNumber,
    daysInMonth: getDaysInMonth(year, monthNumber),
    lastKnownDay: getLastKnownDayOfMonth(year, monthNumber),
  };
};

export const dateUtc = (d?: Date) => {
  let dateObject = d ? new Date(d) : new Date();
  return dayjs(dateObject).utc();
};

export const displayDate = (d: Date, format: string) => {
  const display = dateUtc(d)
    .locale(deviceLanguage)
    .format(format)
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return display;
};
