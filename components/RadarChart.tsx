"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { POINT_LABELS } from "@/types/assessment-schema";

interface RadarChartProps {
  scores: number[];
}

export default function RadarChart({ scores }: RadarChartProps) {
  // Prepare data for recharts
  const data = POINT_LABELS.map((label, index) => ({
    point: label,
    score: scores[index] || 0,
    fullMark: 5,
  }));

  return (
    <div className="w-full h-[600px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="#DCE1E5" />
          <PolarAngleAxis
            dataKey="point"
            tick={{ fill: "#4A4F57", fontSize: 12, fontWeight: 500 }}
            tickLine={{ stroke: "#4A4F57" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: "#4A4F57", fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Church Health Score"
            dataKey="score"
            stroke="#D9A441"
            fill="#1A4D7A"
            fillOpacity={0.6}
            strokeWidth={2}
            dot={{ fill: "#D9A441", r: 4 }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}







