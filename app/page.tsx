"use client";

import { useState } from "react";
import { Baby, Calendar, Weight, Ruler, Brain } from "lucide-react";
import MeasurementForm from "@/components/MeasurementForm";
import GrowthChart from "@/components/GrowthChart";
import { MeasurementData } from "@/lib/growthCalculations";

export default function Home() {
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [childInfo, setChildInfo] = useState<{
    name: string;
    sex: "male" | "female";
    birthDate: Date | null;
  }>({
    name: "",
    sex: "male",
    birthDate: null,
  });

  const addMeasurement = (measurement: MeasurementData) => {
    setMeasurements([...measurements, measurement]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Baby className="w-12 h-12 text-primary-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Growth Charts
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track your child's growth with beautiful, interactive charts based on WHO and CDC standards
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-800">
                <Calendar className="w-6 h-6 mr-2 text-primary-600" />
                Child Information
              </h2>
              <MeasurementForm
                childInfo={childInfo}
                setChildInfo={setChildInfo}
                onAddMeasurement={addMeasurement}
              />
            </div>

            {/* Quick Stats */}
            {measurements.length > 0 && (
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Latest Measurements</h3>
                <div className="grid grid-cols-3 gap-4">
                  {measurements[measurements.length - 1].weight && (
                    <div className="text-center">
                      <Weight className="w-6 h-6 mx-auto mb-2 opacity-90" />
                      <div className="text-2xl font-bold">
                        {measurements[measurements.length - 1].weight}
                      </div>
                      <div className="text-sm opacity-90">kg</div>
                    </div>
                  )}
                  {measurements[measurements.length - 1].length && (
                    <div className="text-center">
                      <Ruler className="w-6 h-6 mx-auto mb-2 opacity-90" />
                      <div className="text-2xl font-bold">
                        {measurements[measurements.length - 1].length}
                      </div>
                      <div className="text-sm opacity-90">cm</div>
                    </div>
                  )}
                  {measurements[measurements.length - 1].headCircumference && (
                    <div className="text-center">
                      <Brain className="w-6 h-6 mx-auto mb-2 opacity-90" />
                      <div className="text-2xl font-bold">
                        {measurements[measurements.length - 1].headCircumference}
                      </div>
                      <div className="text-sm opacity-90">cm</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Charts */}
          <div className="space-y-6">
            {measurements.length > 0 ? (
              <>
                <GrowthChart
                  measurements={measurements}
                  sex={childInfo.sex}
                  type="weight"
                />
                <GrowthChart
                  measurements={measurements}
                  sex={childInfo.sex}
                  type="length"
                />
                <GrowthChart
                  measurements={measurements}
                  sex={childInfo.sex}
                  type="headCircumference"
                />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <Baby className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No measurements yet
                </h3>
                <p className="text-gray-500">
                  Add your child's information and measurements to see beautiful growth charts
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Based on WHO 2006 Growth Standards and CDC 2000 Growth Reference with gradual transition (2-5 years)
          </p>
          <p className="mt-2">
            Reference: Daymont et al., Pediatrics, 2025
          </p>
        </div>
      </div>
    </main>
  );
}
