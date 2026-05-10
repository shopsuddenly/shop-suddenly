"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OrderDistributionChartProps {
    data: {
        placed: number;
        packed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
}

const COLORS = {
    placed: 'hsl(var(--muted))',
    packed: 'hsl(210, 100%, 60%)',
    shipped: 'hsl(270, 100%, 65%)',
    delivered: 'hsl(142, 76%, 36%)',
    cancelled: 'hsl(0, 84%, 60%)',
};

const STATUS_LABELS = {
    placed: 'Placed',
    packed: 'Packed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

export function OrderDistributionChart({ data }: OrderDistributionChartProps) {
    const chartData = Object.entries(data)
        .filter(([_, value]) => value > 0)
        .map(([status, value]) => ({
            name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
            value,
            color: COLORS[status as keyof typeof COLORS],
        }));

    if (chartData.length === 0) {
        return (
            <div className="bg-card border border-border/50 rounded-lg p-6">
                <h2 className="text-xl font-serif text-foreground mb-6">Order Distribution</h2>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No orders yet
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border/50 rounded-lg p-6">
            <h2 className="text-xl font-serif text-foreground mb-6">Order Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
