"use client";

import { useState } from "react";
import { getDaysInMonth, isValid, parse } from "date-fns";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

function partsFromDate(value: Date | null) {
  if (!value || !isValid(value)) return { month: "", day: "", year: "" };
  return {
    month: String(value.getMonth() + 1),
    day: String(value.getDate()),
    year: String(value.getFullYear()),
  };
}

function dayOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isInBounds(date: Date, minDate?: Date, maxDate?: Date): boolean {
  const normalized = dayOnly(date);
  if (minDate && normalized < dayOnly(minDate)) return false;
  if (maxDate && normalized > dayOnly(maxDate)) return false;
  return true;
}

export default function DatePicker({
  value,
  onChange,
  label,
  required = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const initial = partsFromDate(value);
  const [month, setMonth] = useState<string>(initial.month);
  const [day, setDay] = useState<string>(initial.day);
  const [year, setYear] = useState<string>(initial.year);

  const commit = (nextMonth: string, nextDay: string, nextYear: string) => {
    if (!nextMonth || !nextDay || !nextYear) {
      if (!nextMonth && !nextDay && !nextYear) onChange(null);
      return;
    }

    const dateStr = `${nextYear}-${nextMonth.padStart(2, "0")}-${nextDay.padStart(2, "0")}`;
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    if (
      isValid(parsed) &&
      parsed.getFullYear() === Number(nextYear) &&
      parsed.getMonth() === Number(nextMonth) - 1 &&
      parsed.getDate() === Number(nextDay) &&
      isInBounds(parsed, minDate, maxDate)
    ) {
      onChange(parsed);
    } else {
      onChange(null);
    }
  };

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const today = new Date();
  const maxYear = maxDate ? maxDate.getFullYear() : today.getFullYear();
  const minYear = minDate ? minDate.getFullYear() : maxYear - 20;
  const years = Array.from(
    { length: Math.max(1, maxYear - minYear + 1) },
    (_, i) => maxYear - i
  );

  const daysInMonth =
    month && year
      ? getDaysInMonth(new Date(Number(year), Number(month) - 1))
      : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const selectedDate =
    month && day && year
      ? parse(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
          "yyyy-MM-dd",
          new Date()
        )
      : null;
  const outOfBounds =
    selectedDate &&
    isValid(selectedDate) &&
    !isInBounds(selectedDate, minDate, maxDate);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <select
          value={month}
          onChange={(e) => {
            const nextMonth = e.target.value;
            const nextDay =
              day &&
              year &&
              Number(day) >
                getDaysInMonth(new Date(Number(year), Number(nextMonth) - 1))
                ? ""
                : day;
            setMonth(nextMonth);
            setDay(nextDay);
            commit(nextMonth, nextDay, year);
          }}
          required={required}
          className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        >
          <option value="">Month</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={day}
          onChange={(e) => {
            const nextDay = e.target.value;
            setDay(nextDay);
            commit(month, nextDay, year);
          }}
          required={required}
          className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => {
            const nextYear = e.target.value;
            const nextDay =
              day &&
              month &&
              Number(day) >
                getDaysInMonth(new Date(Number(nextYear), Number(month) - 1))
                ? ""
                : day;
            setYear(nextYear);
            setDay(nextDay);
            commit(month, nextDay, nextYear);
          }}
          required={required}
          className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {outOfBounds && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          Date must be between{" "}
          {minDate ? minDate.toLocaleDateString() : "the supported start date"}{" "}
          and {maxDate ? maxDate.toLocaleDateString() : "today"}.
        </p>
      )}
    </div>
  );
}
