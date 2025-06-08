'use client';

import { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface DataPoint {
  [key: string]: any;
}

interface LineConfig {
  dataKey: string;
  color: string;
  name: string;
  strokeDasharray?: string;
}

interface InteractiveLineChartProps {
  data: DataPoint[];
  lines: LineConfig[];
  xDataKey: string;
  height?: number;
  showBrush?: boolean;
  showZoomControls?: boolean;
  onDataPointClick?: (data: any) => void;
}

export function InteractiveLineChart({
  data,
  lines,
  xDataKey,
  height = 300,
  showBrush = true,
  showZoomControls = true,
  onDataPointClick,
}: InteractiveLineChartProps) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const [zoomDomain, setZoomDomain] = useState<{ x?: [number, number]; y?: [number, number] }>({});
  const [brushDomain, setBrushDomain] = useState<[number, number] | undefined>();

  const handleLegendClick = useCallback((dataKey: string) => {
    setHiddenLines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  }, []);

  const handleZoomIn = () => {
    const currentDomain = brushDomain || [0, data.length - 1];
    const range = currentDomain[1] - currentDomain[0];
    const newRange = Math.max(2, Math.floor(range * 0.7));
    const center = (currentDomain[0] + currentDomain[1]) / 2;
    const newStart = Math.max(0, Math.floor(center - newRange / 2));
    const newEnd = Math.min(data.length - 1, newStart + newRange);
    setBrushDomain([newStart, newEnd]);
  };

  const handleZoomOut = () => {
    const currentDomain = brushDomain || [0, data.length - 1];
    const range = currentDomain[1] - currentDomain[0];
    const newRange = Math.min(data.length - 1, Math.floor(range * 1.3));
    const center = (currentDomain[0] + currentDomain[1]) / 2;
    const newStart = Math.max(0, Math.floor(center - newRange / 2));
    const newEnd = Math.min(data.length - 1, newStart + newRange);
    setBrushDomain([newStart, newEnd]);
  };

  const handleReset = () => {
    setBrushDomain(undefined);
    setZoomDomain({});
  };

  const customizedLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 text-sm">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenLines.has(entry.dataKey);
          return (
            <li
              key={`item-${index}`}
              className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                isHidden ? 'opacity-40' : ''
              }`}
              onClick={() => handleLegendClick(entry.dataKey)}
            >
              <span
                className="w-4 h-0.5"
                style={{
                  backgroundColor: isHidden ? '#ccc' : entry.color,
                  textDecoration: isHidden ? 'line-through' : 'none',
                }}
              />
              <span className={isHidden ? 'line-through' : ''}>{entry.value}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const handleClick = (data: any) => {
    if (onDataPointClick && data && data.activePayload) {
      onDataPointClick(data.activePayload[0]);
    }
  };

  return (
    <div className="w-full">
      {showZoomControls && (
        <div className="flex justify-end gap-2 mb-2">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleZoomIn}
            disabled={brushDomain && brushDomain[1] - brushDomain[0] <= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleZoomOut}
            disabled={!brushDomain || brushDomain[1] - brushDomain[0] >= data.length - 1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleReset}
            disabled={!brushDomain}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          onClick={handleClick}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={xDataKey} />
          <YAxis domain={zoomDomain.y} />
          <RechartsTooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover/95 backdrop-blur-sm rounded-md border shadow-md p-3">
                    <p className="text-sm font-medium mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                      </p>
                    ))}
                    {onDataPointClick && (
                      <p className="text-xs text-muted-foreground mt-1">Click for details</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend content={customizedLegend} />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.strokeDasharray}
              hide={hiddenLines.has(line.dataKey)}
              dot={{ fill: line.color, r: 3 }}
              activeDot={{ r: 5, cursor: 'pointer' }}
            />
          ))}
          {showBrush && (
            <Brush
              dataKey={xDataKey}
              height={30}
              stroke="#f59e0b"
              startIndex={brushDomain?.[0]}
              endIndex={brushDomain?.[1]}
              onChange={(domain: any) => {
                if (domain.startIndex !== undefined && domain.endIndex !== undefined) {
                  setBrushDomain([domain.startIndex, domain.endIndex]);
                }
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}