"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from "@/lib/utils";
import { SalesTrendData } from '@/services/analytics.service';

interface SalesChartProps {
    data: SalesTrendData[];
}

export function SalesChart({ data }: SalesChartProps) {
    // Format data for chart
    const chartData = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    return (
        <div className="bg-card border border-border/50 rounded-lg p-6">
            <h2 className="text-xl font-serif text-foreground mb-6">Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => formatPrice(value)}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [formatPrice(value), 'Revenue']}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
