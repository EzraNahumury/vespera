"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F2F2F7" }}>
      <div className="max-w-md w-full text-center rounded-2xl bg-white border border-black/5 p-10">
        <div className="w-14 h-14 rounded-2xl bg-[#FFE4E6] flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-[#9F1239]" />
        </div>
        <h2 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: "-0.02em" }}>
          Something went wrong
        </h2>
        <p className="text-black/50 text-sm leading-relaxed mb-7">
          An unexpected error occurred. You can try again, or reload the page.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#86EFAC] text-black font-medium px-7 py-3 rounded-full hover:bg-[#4ADE80] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
