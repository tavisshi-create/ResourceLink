import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { fetchJson } from '../lib/api';
import { PROVIDER_STATS, MOCK_EQUIPMENT, type EquipmentItem } from './mockData';

// Shape returned by GET /api/ResourceAllocations (camelCase, per
// ASP.NET Core's default System.Text.Json naming policy).
type ResourceAllocationDto = {
  id: string;
  name: string;
  category: string;
  ratePerHour: number;
  totalCostAlgo: number;
  status: string;
  location: string;
  images?: string[];
};

// A small "Demo data" tag for the panels below that have nothing to plug
// into yet - the backend's ResourceAllocation model doesn't track
// utilization %, leased hours, or time-of-day distribution today, so
// faking a "live" number here would be worse than labeling it clearly.
function DemoTag() {
  return (
    <span className="ml-2 align-middle rounded-full border border-black/10 bg-[#f8f8f6] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-black/40">
      Demo data
    </span>
  );
}

export const StatsOverview: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState(PROVIDER_STATS.timeDistribution[0]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>(MOCK_EQUIPMENT);
  const [liveRevenueAlgo, setLiveRevenueAlgo] = useState<number | null>(null);

  useEffect(() => {
    fetchJson<ResourceAllocationDto[]>('/ResourceAllocations').then((data) => {
      if (data && data.length > 0) {
        const mapped: EquipmentItem[] = data.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category as EquipmentItem['category'],
          modelNumber: d.category,
          status: d.status === 'Available' ? 'Active' : 'Maintenance',
          ratePerHour: d.ratePerHour,
          totalEarningsAlgo: d.totalCostAlgo,
          // Utilization isn't tracked in ResourceAllocation yet - leave at
          // 0 rather than inventing a number for live rows.
          utilizationRate: 0,
          location: d.location,
          imageUrl: d.images?.[0] || MOCK_EQUIPMENT[0].imageUrl,
        }));
        setEquipment(mapped);
        setLiveRevenueAlgo(mapped.reduce((sum, item) => sum + item.totalEarningsAlgo, 0));
      }
    });
  }, []);

  const mostActive = [...equipment]
    .sort((a, b) => b.ratePerHour - a.ratePerHour)
    .slice(0, 4);

  const revenueAlgo = liveRevenueAlgo ?? PROVIDER_STATS.totalRevenueAlgo;

  return (
    <div className="w-full space-y-10">
      {/* Top Metric Cards with Thicker Black Border on Hover */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Algorand Yield', val: `${revenueAlgo.toLocaleString()} ALGO`, live: liveRevenueAlgo !== null },
          { label: 'Leased Machine Hours', val: `${PROVIDER_STATS.totalLeasedHours} hrs`, live: false },
          { label: 'Fleet Utilization', val: `${PROVIDER_STATS.overallUtilization}%`, live: false },
          { label: 'Hardware Uptime', val: `${PROVIDER_STATS.ratings.uptime}%`, live: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 md:p-8 rounded-2xl border-[1.5px] border-black/10 transition-all duration-300 hover:border-black hover:ring-1 hover:ring-black hover:shadow-md cursor-default"
          >
            <div className="text-2xl font-medium tracking-tight text-[#111] md:text-3xl">
              {stat.val}
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-black/45 font-semibold">
              {stat.label}
              {!stat.live && <DemoTag />}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts with Thicker Black Border on Hover */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Settlement Stream */}
        <div className="rounded-3xl border-[1.5px] border-black/10 bg-white p-7 shadow-sm transition-all duration-300 hover:border-black hover:ring-1 hover:ring-black hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-black/40 uppercase">
                Settlement Stream
                <DemoTag />
              </span>
              <h3 className="mt-1 text-2xl font-medium tracking-tight text-[#111]">
                {revenueAlgo.toLocaleString()} ALGO
              </h3>
              <p className="text-xs text-black/45 mt-1">Verified on Algorand Testnet (x402)</p>
            </div>
            <span className="rounded-full border border-black/10 bg-[#f8f8f6] px-2.5 py-1 text-[9px] font-medium text-black/60">
              +{PROVIDER_STATS.growthPercentage}% vs last cycle
            </span>
          </div>

          <div className="h-48 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROVIDER_STATS.dailyCapacityTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#a3a3a3" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`${value} ALGO`, 'Revenue']}
                />
                <Bar dataKey="current" fill="#111111" radius={[3, 3, 0, 0]} />
                <Bar dataKey="previous" fill="#e5e5e5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-black/5 text-[10px] text-black/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111]"></span> Current Period
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-300"></span> Previous Period
            </div>
          </div>
        </div>

        {/* Operational Rhythm Donut */}
        <div className="rounded-3xl border-[1.5px] border-black/10 bg-white p-7 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-black hover:ring-1 hover:ring-black hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-black/40 uppercase">
                Operational Rhythm
                <DemoTag />
              </span>
              <h3 className="mt-1 text-2xl font-medium tracking-tight text-[#111]">
                Time-Slot Split
              </h3>
              <p className="text-xs text-black/45 mt-1">Utilization across day shifts</p>
            </div>
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROVIDER_STATS.timeDistribution}
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveSegment(PROVIDER_STATS.timeDistribution[index])}
                  >
                    <Cell fill="#111111" />
                    <Cell fill="#737373" />
                    <Cell fill="#d4d4d4" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-xl font-medium text-[#111]">{activeSegment.value}%</span>
                <span className="block text-[8px] uppercase tracking-wider text-black/40">Load</span>
              </div>
            </div>

            <div className="flex justify-between w-full mt-4 text-[10px]">
              {PROVIDER_STATS.timeDistribution.map((item, idx) => (
                <div
                  key={item.name}
                  onClick={() => setActiveSegment(item)}
                  className="text-center cursor-pointer p-2 rounded-xl transition hover:bg-[#f8f8f6]"
                >
                  <div className="flex items-center gap-1.5 justify-center text-black/60 font-medium">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: idx === 0 ? '#111' : idx === 1 ? '#737373' : '#d4d4d4' }}
                    />
                    <span>{item.name.split(' ')[0]}</span>
                  </div>
                  <div className="font-medium text-[#111] mt-1">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Demand & Continuous Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Most Active Machinery */}
        <div className="rounded-3xl border-[1.5px] border-black/10 bg-white p-7 shadow-sm transition-all duration-300 hover:border-black hover:ring-1 hover:ring-black hover:shadow-md">
          <span className="text-[9px] font-semibold tracking-[0.2em] text-black/40 uppercase">
            Asset Demand
          </span>
          <h3 className="mt-1 text-lg font-medium text-[#111]">Most Active Machinery</h3>
          <p className="text-xs text-black/45 mb-4">Highest rate-per-hour assets in your registered inventory</p>

          <div className="divide-y divide-black/5">
            {mostActive.map((item) => (
              <div key={item.id} className="flex items-center gap-3.5 py-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover border border-black/10 grayscale-20"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-[#111] truncate">{item.name}</h4>
                  <p className="text-[10px] text-black/40 truncate">{item.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-[#111]">{item.ratePerHour} ALGO/hr</div>
                  <span className="text-[9px] text-black/45">{item.utilizationRate}% allocated</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Volume Line Chart */}
        <div className="rounded-3xl border-[1.5px] border-black/10 bg-white p-7 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-black hover:ring-1 hover:ring-black hover:shadow-md">
          <div>
            <span className="text-[9px] font-semibold tracking-[0.2em] text-black/40 uppercase">
              Throughput
              <DemoTag />
            </span>
            <h3 className="mt-1 text-lg font-medium text-[#111]">Operating Volume</h3>
            <p className="text-xs text-black/45">Concurrent telemetry load across peak hours</p>

            <div className="h-44 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PROVIDER_STATS.hourlyLeaseVolume}>
                  <XAxis dataKey="time" stroke="#a3a3a3" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${value}% Capacity`, 'Live Load']}
                  />
                  <Line type="monotone" dataKey="current" stroke="#111111" strokeWidth={2} dot={{ r: 3, fill: '#111' }} />
                  <Line type="monotone" dataKey="previous" stroke="#a3a3a3" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-black/5 text-[10px] text-black/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111]"></span> Live Telemetry
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-400"></span> Baseline Benchmark
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;