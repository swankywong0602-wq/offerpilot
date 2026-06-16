'use client';

interface Props {
  score: number;
  label: string;
  size?: 'sm' | 'lg';
}

export default function ScoreRing({ score, label, size = 'lg' }: Props) {
  const dims = size === 'lg' ? 120 : 80;
  const stroke = size === 'lg' ? 8 : 6;
  const radius = (dims - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={dims} height={dims} viewBox={`0 0 ${dims} ${dims}`}>
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${dims / 2} ${dims / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text
          x={dims / 2}
          y={dims / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`${size === 'lg' ? 'text-2xl' : 'text-lg'}`}
          fill="#1e293b"
          fontWeight="bold"
        >
          {score}
        </text>
      </svg>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
