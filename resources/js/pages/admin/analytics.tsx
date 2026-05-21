import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { format } from 'date-fns';
import {
    Ban,
    BarChart3,
    DollarSign,
    Percent,
    Receipt,
    TrendingDown,
    TrendingUp,
    CalendarIcon,
} from 'lucide-react';
import { Bar, BarChart, Pie, PieChart, XAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MonthlyData {
    label: string;
    revenue: number;
    refunds: number;
    bookings: number;
}

interface BookingStatuses {
    completed: number;
    confirmed: number;
    reserved: number;
    cancelled: number;
}

interface Props {
    metrics: {
        totalRevenue: number;
        totalRefunds: number;
        netRevenue: number;
        totalBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        avgBookingValue: number;
        occupancyRate: number;
    };
    monthlyData: MonthlyData[];
    bookingStatuses: BookingStatuses;
    filters: { start: string; end: string };
}

const statusLabels: Record<string, string> = {
    completed: 'Completed',
    confirmed: 'Confirmed',
    reserved: 'Reserved',
    cancelled: 'Cancelled',
};

export default function Analytics({ metrics, monthlyData, bookingStatuses, filters }: Props) {
    const [startDate, setStartDate] = useState<Date | undefined>(
        filters.start ? new Date(filters.start + 'T00:00:00') : undefined,
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        filters.end ? new Date(filters.end + 'T00:00:00') : undefined,
    );
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);

    const chartRevenueConfig = {
        revenue: { label: 'Revenue', color: 'var(--chart-1)' },
        refunds: { label: 'Refunds', color: 'var(--chart-2)' },
    } satisfies ChartConfig;

    const chartBookingsConfig = {
        bookings: { label: 'Bookings', color: 'var(--chart-1)' },
    } satisfies ChartConfig;

    const pieData = Object.entries(bookingStatuses)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => ({
            name: statusLabels[key] ?? key,
            value: count,
            fill: `var(--chart-${['completed', 'confirmed', 'reserved', 'cancelled'].indexOf(key) + 1})`,
        }));

    const pieConfig = Object.fromEntries(
        Object.entries(bookingStatuses)
            .filter(([, count]) => count > 0)
            .map(([key], i) => [
                key,
                {
                    label: statusLabels[key] ?? key,
                    color: `var(--chart-${i + 1})`,
                },
            ]),
    ) satisfies ChartConfig;

    function applyFilter() {
        const params: Record<string, string> = {};
        if (startDate) params.start = format(startDate, 'yyyy-MM-dd');
        if (endDate) params.end = format(endDate, 'yyyy-MM-dd');
        router.get('/admin/analytics', params, {
            preserveState: true,
            replace: true,
        });
    }

    const summaryCards = [
        {
            label: 'Total Revenue',
            value: `$${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-stitch-primary',
            bg: 'bg-stitch-primary-fixed/20',
        },
        {
            label: 'Total Refunds',
            value: `$${metrics.totalRefunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: TrendingDown,
            color: 'text-stitch-error',
            bg: 'bg-stitch-error-container/20',
        },
        {
            label: 'Net Revenue',
            value: `$${metrics.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: Receipt,
            color: 'text-stitch-secondary',
            bg: 'bg-stitch-secondary-fixed/20',
        },
        {
            label: 'Total Bookings',
            value: metrics.totalBookings.toLocaleString(),
            icon: BarChart3,
            color: 'text-stitch-primary',
            bg: 'bg-stitch-primary-fixed/20',
        },
        {
            label: 'Completed',
            value: metrics.completedBookings.toLocaleString(),
            icon: TrendingUp,
            color: 'text-stitch-secondary',
            bg: 'bg-stitch-secondary-fixed/20',
        },
        {
            label: 'Cancelled',
            value: metrics.cancelledBookings.toLocaleString(),
            icon: Ban,
            color: 'text-stitch-error',
            bg: 'bg-stitch-error-container/20',
        },
        {
            label: 'Avg Booking Value',
            value: `$${metrics.avgBookingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-stitch-tertiary',
            bg: 'bg-stitch-tertiary-fixed/20',
        },
        {
            label: 'Occupancy Rate',
            value: `${metrics.occupancyRate}%`,
            icon: Percent,
            color: 'text-stitch-primary',
            bg: 'bg-stitch-primary-fixed/20',
        },
    ];

    return (
        <>
            <Head title="Analytics" />

            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="font-display text-display-lg text-stitch-primary">
                        Analytics
                    </h2>
                    <p className="text-body-md text-stitch-on-surface-variant">
                        Revenue, bookings, and performance metrics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Popover open={startOpen} onOpenChange={setStartOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[150px] justify-start text-left font-normal border-stitch-outline-variant bg-stitch-surface text-stitch-on-surface"
                                >
                                    <CalendarIcon className="mr-2 size-4" />
                                    {startDate ? format(startDate, 'MMM d, yyyy') : <span className="text-stitch-on-surface-variant">Start date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(d) => {
                                        setStartDate(d);
                                        setStartOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-stitch-on-surface-variant">&ndash;</span>
                        <Popover open={endOpen} onOpenChange={setEndOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[150px] justify-start text-left font-normal border-stitch-outline-variant bg-stitch-surface text-stitch-on-surface"
                                >
                                    <CalendarIcon className="mr-2 size-4" />
                                    {endDate ? format(endDate, 'MMM d, yyyy') : <span className="text-stitch-on-surface-variant">End date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(d) => {
                                        setEndDate(d);
                                        setEndOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button onClick={applyFilter} className="bg-stitch-primary text-stitch-on-primary hover:opacity-90">
                        Apply
                    </Button>
                </div>
            </header>

            <section className="mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className="bg-stitch-surface-container-lowest p-gutter rounded-xl shadow-soft border border-stitch-outline-variant/10 flex items-center gap-4"
                        >
                            <div className={`p-3 ${card.bg} rounded-lg shrink-0`}>
                                <card.icon className={`size-6 ${card.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-label-sm text-stitch-on-surface-variant font-medium truncate">
                                    {card.label}
                                </p>
                                <h3 className={`font-display text-headline-md mt-1 ${card.color}`}>
                                    {card.value}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-12">
                <section className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                    <div className="p-gutter border-b border-stitch-outline-variant/10">
                        <h4 className="font-display text-headline-sm text-stitch-primary">
                            Revenue vs Refunds
                        </h4>
                        <p className="text-label-sm text-stitch-on-surface-variant">
                            Monthly comparison
                        </p>
                    </div>
                    <div className="p-gutter">
                        {monthlyData.length === 0 ? (
                            <div className="flex items-center justify-center h-64 text-stitch-on-surface-variant text-body-md">
                                No data available yet.
                            </div>
                        ) : (
                            <ChartContainer config={chartRevenueConfig} className="h-64 w-full">
                                <BarChart data={monthlyData} barGap={0}>
                                    <CartesianGrid vertical={false} stroke="var(--border)" />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(v: string) => v.split(' ')[0]}
                                        className="fill-stitch-on-surface-variant text-label-sm"
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="var(--color-revenue)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="refunds"
                                        fill="var(--color-refunds)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </div>
                </section>

                <section className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                    <div className="p-gutter border-b border-stitch-outline-variant/10">
                        <h4 className="font-display text-headline-sm text-stitch-primary">
                            Bookings per Month
                        </h4>
                        <p className="text-label-sm text-stitch-on-surface-variant">
                            Monthly booking count
                        </p>
                    </div>
                    <div className="p-gutter">
                        {monthlyData.length === 0 ? (
                            <div className="flex items-center justify-center h-64 text-stitch-on-surface-variant text-body-md">
                                No data available yet.
                            </div>
                        ) : (
                            <ChartContainer config={chartBookingsConfig} className="h-64 w-full">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid vertical={false} stroke="var(--border)" />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(v: string) => v.split(' ')[0]}
                                        className="fill-stitch-on-surface-variant text-label-sm"
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar
                                        dataKey="bookings"
                                        fill="var(--color-bookings)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-12">
                <section className="lg:col-span-1 bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                    <h4 className="font-display text-headline-sm text-stitch-primary mb-4">
                        Booking Status Distribution
                    </h4>
                    {pieData.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-stitch-on-surface-variant text-body-md">
                            No data yet.
                        </div>
                    ) : (
                        <ChartContainer config={pieConfig} className="h-64 w-full">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={55}
                                    outerRadius={80}
                                    strokeWidth={2}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="center"
                                        className="fill-stitch-primary text-[22px] font-bold"
                                    />
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    )}
                </section>

                <section className="lg:col-span-2 bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                    <div className="p-gutter border-b border-stitch-outline-variant/10">
                        <h4 className="font-display text-headline-sm text-stitch-primary">
                            Monthly Overview
                        </h4>
                        <p className="text-label-sm text-stitch-on-surface-variant">
                            {filters.start} to {filters.end}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stitch-surface-container-low text-stitch-on-surface-variant text-label-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-gutter py-4 font-bold">Month</th>
                                    <th className="px-gutter py-4 font-bold">Revenue</th>
                                    <th className="px-gutter py-4 font-bold">Refunds</th>
                                    <th className="px-gutter py-4 font-bold">Net</th>
                                    <th className="px-gutter py-4 font-bold">Bookings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stitch-outline-variant/10 text-body-md">
                                {monthlyData.map((row) => (
                                    <tr key={row.label} className="hover:bg-stitch-surface-container-low/50 transition-colors">
                                        <td className="px-gutter py-4 font-semibold text-stitch-primary">
                                            {row.label}
                                        </td>
                                        <td className="px-gutter py-4 text-stitch-on-surface">
                                            ${row.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-gutter py-4 text-stitch-error">
                                            ${row.refunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-gutter py-4 font-bold text-stitch-secondary">
                                            ${(row.revenue - row.refunds).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-gutter py-4">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-stitch-primary-fixed/20 px-3 py-1 text-label-sm font-bold text-stitch-primary">
                                                {row.bookings}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {monthlyData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-gutter py-8 text-center text-stitch-on-surface-variant">
                                            No data available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}
