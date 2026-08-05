"use client";

import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Menyimpan data...",
}) => {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ animation: "fade-in 0.2s ease-out" }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative flex flex-col items-center gap-6 bg-white rounded-3xl shadow-2xl px-12 py-10"
        style={{ animation: "float-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Orbiting dots spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0"
            style={{
              animation: "pulse-ring 1.5s ease-out infinite",
            }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-0"
            style={{
              animation: "pulse-ring 1.5s ease-out 0.5s infinite",
            }}
          />

          {/* Center dot */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-300" />

          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${i * 90}deg)` }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    i === 0
                      ? "#3B82F6"
                      : i === 1
                      ? "#6366F1"
                      : i === 2
                      ? "#8B5CF6"
                      : "#A78BFA",
                  animation: `orbit 1.4s linear ${i * 0.35}s infinite`,
                  transformOrigin: "50% 50%",
                  opacity: 0.85,
                }}
              />
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <p className="font-semibold text-slate-800 text-base">{message}</p>
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-1.5 h-1.5 rounded-full bg-blue-400"
                style={{
                  animation: `spin-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Shimmer bar */}
        <div className="w-40 h-1.5 rounded-full overflow-hidden bg-slate-100">
          <div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #dbeafe 0%, #3B82F6 40%, #6366F1 60%, #dbeafe 100%)",
              backgroundSize: "200% auto",
              animation: "shimmer 1.8s linear infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
};
