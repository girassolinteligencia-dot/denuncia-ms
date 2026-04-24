'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface ChartData {
  date: string
  total: number
}

export const ProtocolEvolutionChart = ({ data }: { data: ChartData[] }) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#021691" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#021691" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFF', 
              borderRadius: '12px', 
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: '#021691' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#021691"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTotal)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
