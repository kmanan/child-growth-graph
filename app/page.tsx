"use client";

import { useState } from "react";
import { Baby, Calendar, Weight, Ruler, Brain, Apple, Sparkles, Heart, ExternalLink } from "lucide-react";
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
          <p className="text-gray-600 text-lg max-w-3xl mx-auto whitespace-nowrap">
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

        {/* Snack Spinner Promotion */}
        <div className="mt-16 mb-12">
          <div className="bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden border border-green-100">
            <div className="grid lg:grid-cols-2 gap-8 items-center p-8 md:p-12">
              {/* Left side - Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-700">New from Kryton Labs</span>
                </div>
                
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Snack Spinner
                  </h2>
                  <p className="text-xl text-gray-600 mb-4">
                    Make Nutrition Fun for Kids
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Help your child develop healthy eating habits through an engaging, gamified experience. 
                    Spin colorful food wheels, plan balanced meals, and unlock dessert rewards while learning about nutrition.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Apple className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Food Wheel Spinning</h3>
                      <p className="text-sm text-gray-600">Collect healthy foods from all food groups</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Weekly Meal Planner</h3>
                      <p className="text-sm text-gray-600">Create balanced 7-day meal plans</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Brain className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Educational Puzzles</h3>
                      <p className="text-sm text-gray-600">Learn through fun, adaptive games</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Privacy-First</h3>
                      <p className="text-sm text-gray-600">No internet required, all data local</p>
                    </div>
                  </div>
                </div>

                <a 
                  href="https://krytonlabs.com/yumyumgo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Learn More About Snack Spinner
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              {/* Right side - Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 shadow-xl transform lg:rotate-2">
                  <div className="bg-white rounded-xl p-6 shadow-lg transform -rotate-2">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">🎡</div>
                      <h3 className="text-2xl font-bold text-gray-900">Spin & Learn!</h3>
                      <div className="flex justify-center gap-3 text-4xl">
                        <span>🍎</span>
                        <span>🥕</span>
                        <span>🥛</span>
                        <span>🍞</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Collect foods from all groups to create balanced meals
                      </p>
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl">🏆</span>
                          <span className="font-semibold text-gray-900">Unlock Desserts!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
