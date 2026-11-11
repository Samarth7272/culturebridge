export default function Globe() {
  const n: [number, number, string][] = [[60, 120, "#10b981"], [150, 60, "#f6c453"], [250, 90, "#ff6f61"], [300, 190, "#8b5cf6"], [200, 280, "#2dd4bf"], [90, 240, "#4361ee"]];
  return (
    <svg viewBox="0 0 360 340" role="img" aria-label="Network of colleagues connected across the globe" className="float w-full max-w-md">
      <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0" stopColor="#2dd4bf" stopOpacity=".5" /><stop offset="1" stopColor="#4361ee" stopOpacity=".15" /></radialGradient></defs>
      <circle cx="180" cy="170" r="140" fill="url(#g)" stroke="#fff" strokeOpacity=".25" />
      {[40, 90, 130].map(r => <ellipse key={r} cx="180" cy="170" rx={r} ry="140" fill="none" stroke="#fff" strokeOpacity=".18" />)}
      {[60, 120, 170, 220, 280].map(y => <line key={y} x1="45" x2="315" y1={y} y2={y} stroke="#fff" strokeOpacity=".12" />)}
      {n.map((a, i) => { const b = n[(i + 1) % n.length]; return <path key={i} className="dash" d={`M${a[0]} ${a[1]} Q180 ${(a[1] + b[1]) / 2 - 50} ${b[0]} ${b[1]}`} fill="none" stroke="#f6c453" strokeWidth="1.5" />; })}
      {n.map(([x, y, c], i) => <g key={i}><circle cx={x} cy={y} r="12" fill={c} opacity=".3" /><circle cx={x} cy={y} r="6" fill={c} /></g>)}
    </svg>
  );
}
