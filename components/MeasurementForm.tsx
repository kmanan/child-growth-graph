"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  MeasurementData,
  UnitSystem,
  getAgeInMonths,
  lbToKg,
  inToCm,
} from "@/lib/growthCalculations";
import DatePicker from "./DatePicker";

type ChildInfo = {
  name: string;
  sex: "male" | "female";
  birthDate: Date | null;
};

interface MeasurementFormProps {
  childInfo: ChildInfo;
  setChildInfo: (info: ChildInfo) => void;
  units: UnitSystem;
  setUnits: (u: UnitSystem) => void;
  onAddMeasurement: (measurement: MeasurementData) => void;
}

function formatDateValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateFromValue(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function parsePositive(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
}

export default function MeasurementForm({
  childInfo,
  setChildInfo,
  units,
  setUnits,
  onAddMeasurement,
}: MeasurementFormProps) {
  const [measurementDate, setMeasurementDate] = useState(formatDateValue(new Date()));
  const [error, setError] = useState<string | null>(null);
  // Metric inputs
  const [weightKg, setWeightKg] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [headCm, setHeadCm] = useState("");
  // US inputs (lb + oz, inches)
  const [weightLb, setWeightLb] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [lengthIn, setLengthIn] = useState("");
  const [headIn, setHeadIn] = useState("");

  const resetInputs = () => {
    setWeightKg("");
    setLengthCm("");
    setHeadCm("");
    setWeightLb("");
    setWeightOz("");
    setLengthIn("");
    setHeadIn("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!childInfo.birthDate) {
      setError("Please enter a valid birth date first.");
      return;
    }

    const date = dateFromValue(measurementDate);
    const today = new Date();
    if (!date) {
      setError("Please enter a valid measurement date.");
      return;
    }
    if (date < childInfo.birthDate) {
      setError("Measurement date cannot be before birth date.");
      return;
    }
    if (date > new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      setError("Measurement date cannot be in the future.");
      return;
    }

    const ageMonths = getAgeInMonths(childInfo.birthDate, date);

    let weight: number | undefined;
    let length: number | undefined;
    let head: number | undefined;

    if (units === "metric") {
      weight = parsePositive(weightKg);
      length = parsePositive(lengthCm);
      head = parsePositive(headCm);
    } else {
      const lb = parsePositive(weightLb);
      const oz = parsePositive(weightOz);
      if (Number.isNaN(lb) || Number.isNaN(oz)) {
        setError("Weight must use positive numbers.");
        return;
      }
      if (oz !== undefined && oz >= 16) {
        setError("Ounces must be less than 16.");
        return;
      }
      if (lb !== undefined || oz !== undefined) {
        weight = lbToKg((lb ?? 0) + (oz ?? 0) / 16);
      }
      const lengthValue = parsePositive(lengthIn);
      const headValue = parsePositive(headIn);
      length = lengthValue === undefined ? undefined : inToCm(lengthValue);
      head = headValue === undefined ? undefined : inToCm(headValue);
    }

    if ([weight, length, head].some(Number.isNaN)) {
      setError("Measurements must use positive numbers.");
      return;
    }
    if (weight === undefined && length === undefined && head === undefined) {
      setError("Enter at least one measurement.");
      return;
    }

    onAddMeasurement({
      date,
      ageMonths,
      weight,
      length,
      headCircumference: head,
    });
    resetInputs();
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sex
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="male"
                checked={childInfo.sex === "male"}
                onChange={(e) =>
                  setChildInfo({
                    ...childInfo,
                    sex: e.target.value as "male" | "female",
                  })
                }
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Male</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="female"
                checked={childInfo.sex === "female"}
                onChange={(e) =>
                  setChildInfo({
                    ...childInfo,
                    sex: e.target.value as "male" | "female",
                  })
                }
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Female</span>
            </label>
          </div>
        </div>

        <DatePicker
          key={childInfo.birthDate ? childInfo.birthDate.toISOString() : "birth-empty"}
          value={childInfo.birthDate}
          onChange={(date) => setChildInfo({ ...childInfo, birthDate: date })}
          label="Birth Date"
          required
          maxDate={new Date()}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Units
          </label>
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setUnits("us")}
              className={`px-4 py-2 text-sm font-medium transition ${
                units === "us"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              US (lb / in)
            </button>
            <button
              type="button"
              onClick={() => setUnits("metric")}
              className={`px-4 py-2 text-sm font-medium transition ${
                units === "metric"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              Metric (kg / cm)
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enter measurements in the units your pediatrician uses. US doctors
            usually report pounds and inches.
          </p>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Add Measurement
        </h3>

        <DatePicker
          key={`measurement-${measurementDate}-${childInfo.birthDate?.toISOString() ?? "no-birth"}`}
          value={dateFromValue(measurementDate)}
          onChange={(date) => setMeasurementDate(date ? formatDateValue(date) : "")}
          label="Measurement Date"
          required
          minDate={childInfo.birthDate ?? undefined}
          maxDate={new Date()}
        />

        {units === "metric" ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className={inputClass}
                placeholder="3.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length / Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value)}
                className={inputClass}
                placeholder="50.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Head (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={headCm}
                onChange={(e) => setHeadCm(e.target.value)}
                className={inputClass}
                placeholder="35.0"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (lb / oz)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={weightLb}
                  onChange={(e) => setWeightLb(e.target.value)}
                  className={inputClass}
                  placeholder="lb (e.g. 22)"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15.9"
                  value={weightOz}
                  onChange={(e) => setWeightOz(e.target.value)}
                  className={inputClass}
                  placeholder="oz (optional)"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Length / Height (in)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={lengthIn}
                  onChange={(e) => setLengthIn(e.target.value)}
                  className={inputClass}
                  placeholder="20.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Head (in)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={headIn}
                  onChange={(e) => setHeadIn(e.target.value)}
                  className={inputClass}
                  placeholder="13.8"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!childInfo.birthDate}
        className="w-full bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 dark:hover:from-primary-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Measurement
      </button>
    </form>
  );
}
