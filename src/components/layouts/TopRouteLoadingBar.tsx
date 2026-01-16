export function TopRouteLoadingBar({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="relative w-full h-1 overflow-hidden">
      <style>{`
        @keyframes routebar { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(450%); } 
        }
        @keyframes routebar2 { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(600%); } 
        }
      `}</style>
      <div className="absolute inset-0 opacity-20 bg-primary" />
      <div
        className="absolute left-[-30%] top-0 h-full w-[30%] bg-primary"
        style={{ animation: 'routebar 1.0s ease-in-out infinite' }}
      />
      <div
        className="absolute left-[-20%] top-0 h-full w-[20%] bg-primary/70"
        style={{ animation: 'routebar2 1.2s ease-in-out infinite' }}
      />
    </div>
  );
}
