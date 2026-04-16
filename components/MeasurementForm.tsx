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

interface MeasurementFormProps {
  childInfo: {
    name: string;
    sex: "male" | "female";
    birthDate: Date | null;
  };
  setChildInfo: (info: any) => void;
  units: UnitSystem;
  setUnits: (u: UnitSystem) => void;
  onAddMeasurement: (measurement: MeasurementData) => void;
}

export default function MeasurementForm({
  childInfo,
  setChildInfo,
  units,
  setUnits,
  onAddMeasurement,
}: MeasurementFormProps) {
  const [measurementDate, setMeasurementDate] = useState(
    new Date().toISOString().split("T")[0]
  );
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
    if (!childInfo.birthDate) {
      alert("Please enter birth date first");
      return;
    }
    const date = new Date(measurementDate);
    const ageMonths = getAgeInMonths(childInfo.birthDate, date);

    let weight: number | undefined;
    let length: number | undefined;
    let head: number | undefined;

    if (units === "metric") {
      if (weightKg) weight = parseFloat(weightKg);
      if (lengthCm) length = parseFloat(lengthCm);
      if (headCm) head = parseFloat(headCm);
    } else {
      const lb = weightLb ? parseFloat(weightLb) : 0;
      const oz = weightOz ? parseFloat(weightOz) : 0;
      if (weightLb || weightOz) weight = lbToKg(lb + oz / 16);
      if (lengthIn) length = inToCm(parseFloat(lengthIn));
      if (headIn) head = inToCm(parseFloat(headIn));
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
          value={childInfo.birthDate}
          onChange={(date) =>
            setChildInfo({ ...childInfo, birthDate: date })
          }
          label="Birth Date"
          required
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
          value={measurementDate ? new Date(measurementDate) : null}
          onChange={(date) =>
            setMeasurementDate(date ? date.toISOString().split("T")[0] : "")
          }
          label="Measurement Date"
          required
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
