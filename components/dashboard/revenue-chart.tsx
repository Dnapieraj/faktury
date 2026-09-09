import { formatMoney } from '@/lib/money'
import type { MonthlyRevenuePoint } from '@/lib/data/invoices'

export function RevenueChart({ data }: { data: MonthlyRevenuePoint[] }) {
  const max = Math.max(...data.map((d) => d.total), 1)
  const width = 640
  const height = 200
  const padX = 8
  const padTop = 12
  const padBottom = 28
  const gap = 16
  const barW = (width - padX * 2 - gap * (data.length - 1)) / data.length
  const chartH = height - padTop - padBottom

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Przychód (faktury opłacone) w ostatnich miesiącach"
      >
        <line
          x1={padX}
          x2={width - padX}
          y1={padTop + chartH}
          y2={padTop + chartH}
          className="stroke-border"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const h = d.total > 0 ? Math.max((d.total / max) * chartH, 2) : 0
          const x = padX + i * (barW + gap)
          const y = padTop + chartH - h
          return (
            <g key={d.month}>
              {h > 0 && (
                <rect x={x} y={y} width={barW} height={h} rx={4} className="fill-primary/80">
                  <title>{`${d.label}: ${formatMoney(d.total)}`}</title>
                </rect>
              )}
              <text
                x={x + barW / 2}
                y={height - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] capitalize"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>Suma: {formatMoney(data.reduce((s, d) => s + d.total, 0))}</span>
        <span>Maks. miesiąc: {formatMoney(max === 1 ? 0 : max)}</span>
      </div>
    </div>
  )
}
