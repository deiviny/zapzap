interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'green' | 'blue' | 'red' | 'orange' | 'purple'
}

const colorMap: Record<StatsCardProps['color'], string> = {
  green: 'bg-green-50 text-green-700',
  blue: 'bg-blue-50 text-blue-700',
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  purple: 'bg-purple-50 text-purple-700',
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('pt-BR')}</p>
    </div>
  )
}
