"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MeasurementData, getAgeInMonths } from "@/lib/growthCalculations";
import DatePicker from "./DatePicker";

interface MeasurementFormProps {
  childInfo: {
    name: string;
    sex: "male" | "female";
    birthDate: Date | null;
  };
  setChildInfo: (info: any) => void;
  onAddMeasurement: (measurement: MeasurementData) => void;
}

export default function MeasurementForm({
  childInfo,
  setChildInfo,
  onAddMeasurement,
}: MeasurementFormProps) {
  const [measurementDate, setMeasurementDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!childInfo.birthDate) {
      alert("Please enter birth date first");
      return;
    }

    const date = new Date(measurementDate);
    const ageMonths = getAgeInMonths(childInfo.birthDate, date);

    const measurement: MeasurementData = {
      date,
      ageMonths,
      weight: weight ? parseFloat(weight) : undefined,
      length: length ? parseFloat(length) : undefined,
      headCircumference: headCircumference
        ? parseFloat(headCircumference)
        : undefined,
    };

    onAddMeasurement(measurement);

    // Reset form
    setWeight("");
    setLength("");
    setHeadCircumference("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Child Info */}
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
            setChildInfo({
              ...childInfo,
              birthDate: date,
            })
          }
          label="Birth Date"
          required
        />
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Measurements */}
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

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="3.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Length (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder-gray-400 dark:placeholder-gray-500"
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
              value={headCircumference}
              onChange={(e) => setHeadCircumference(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="35.0"
            />
          </div>
        </div>
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
