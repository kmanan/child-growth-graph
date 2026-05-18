import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — Growth Charts",
  description: "Educational use disclaimer for the cdc-growth-charts tool.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          href="/"
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          ← Back to growth charts
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-8">Disclaimer</h1>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Educational purposes only
            </h2>
            <p>
              The information provided by this tool is intended for general
              educational and informational purposes only. It is{" "}
              <strong>not</strong> intended to be a substitute for professional
              medical advice, diagnosis, or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Not medical advice</h2>
            <p>
              The growth chart percentiles, z-scores, and explanations shown by
              this tool are derived from the U.S. Centers for Disease Control
              and Prevention (CDC) growth reference. They describe a
              population-level statistical comparison and do{" "}
              <strong>not</strong> constitute a clinical assessment of any
              individual child&rsquo;s growth, nutrition, or development.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              Always consult a qualified provider
            </h2>
            <p>
              Always seek the advice of your child&rsquo;s pediatrician or
              another qualified healthcare provider with any questions you may
              have regarding your child&rsquo;s growth or any medical
              condition. Never disregard professional medical advice or delay
              in seeking it because of something you have read or seen using
              this tool.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">In an emergency</h2>
            <p>
              If you believe your child may be experiencing a medical
              emergency, call your local emergency services immediately (911
              in the United States) or go to the nearest emergency room. Do{" "}
              <strong>not</strong> rely on this tool for emergency medical
              decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">No warranty</h2>
            <p>
              This software is provided &ldquo;as is&rdquo; without warranty of
              any kind, express or implied, including but not limited to the
              warranties of merchantability, fitness for a particular purpose,
              and noninfringement. See{" "}
              <a
                href="https://www.apache.org/licenses/LICENSE-2.0"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                the Apache License 2.0
              </a>{" "}
              for the full license text.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Data source</h2>
            <p>
              Reference percentile curves are computed from the CDC growth
              charts L/M/S tables, retrieved from{" "}
              <a
                href="https://www.cdc.gov/growthcharts/percentile_data_files.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                cdc.gov/growthcharts
              </a>
              . The CDC data are works of the U.S. federal government and are
              in the public domain.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            ← Back to growth charts
          </Link>
        </div>
      </div>
    </main>
  );
}
