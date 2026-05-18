import Link from "next/link";

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
      <div className="container mx-auto px-4 py-2 max-w-7xl text-center text-xs sm:text-sm text-amber-900 dark:text-amber-100">
        <strong>For educational use only.</strong> Not medical advice. Always
        consult your pediatrician. In an emergency, call your local emergency
        services.{" "}
        <Link
          href="/disclaimer"
          className="underline font-medium hover:text-amber-700 dark:hover:text-amber-50"
        >
          Read full disclaimer
        </Link>
        .
      </div>
    </div>
  );
}
