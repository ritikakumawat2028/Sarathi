import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span
        className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
        style={{ animationDelay: '0ms', animationDuration: '900ms' }}
      />
      <span
        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
        style={{ animationDelay: '150ms', animationDuration: '900ms' }}
      />
      <span
        className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"
        style={{ animationDelay: '300ms', animationDuration: '900ms' }}
      />
    </div>
  );
}

/** Blinking cursor shown at the end of streaming text */
export function StreamCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 bg-indigo-600 ml-0.5 align-middle animate-pulse"
      style={{ animationDuration: '700ms' }}
    />
  );
}
