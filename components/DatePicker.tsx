"use client";

import { useEffect, useState } from "react";
import { getDaysInMonth, isValid, parse } from "date-fns";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label: string;
  required?: boolean;
  maxDate?: Date;
}

export default function DatePicker({
  value,
  onChange,
  label,
  required = false,
  maxDate,
}: DatePickerProps) {
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [year, setYear] = useState<string>("");

  // Initialize from value
  useEffect(() => {
    if (value && isValid(value)) {
      setMonth(String(value.getMonth() + 1));
      setDay(String(value.getDate()));
      setYear(String(value.getFullYear()));
    }
  }, []);

  // Update parent when any field changes
  useEffect(() => {
    if (month && day && year) {
      const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
      if (isValid(parsed)) {
        onChange(parsed);
      }
    } else if (!month && !day && !year) {
      onChange(null);
    }
  }, [month, day, year, onChange]);

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

  // Birth-date range: today back ~20 years. The CDC growth reference covers
  // 0-240 months (0-20 years), so anything older than ~20 years ago is
  // outside the chart's domain anyway.
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - i);

  const daysInMonth = month && year ? getDaysInMonth(new Date(parseInt(year), parseInt(month) - 1)) : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
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
          onChange={(e) => setDay(e.target.value)}
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
          onChange={(e) => setYear(e.target.value)}
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
    </div>
  );
}

