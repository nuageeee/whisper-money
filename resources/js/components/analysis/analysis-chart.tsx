import { AmountDisplay } from '@/components/ui/amount-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useChartColors } from '@/hooks/use-chart-color-scheme';
import { useLocale } from '@/hooks/use-locale';
import { formatCompactNumber } from '@/utils/date';
import { __ } from '@/utils/i18n';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ReferenceLine,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export interface AnalysisChartPoint {
    key: string;
    label: string;
    amount: number;
}

interface AnalysisChartProps {
    title: string;
    data: AnalysisChartPoint[];
    currency: string;
    loading?: boolean;
    scrollable?: boolean;
}

interface TooltipPayloadItem {
    payload?: AnalysisChartPoint;
}

function CustomTooltip({
    active,
    payload,
    currency,
}: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    currency: string;
}) {
    if (!active || !payload?.length) {
        return null;
    }

    const point = payload[0].payload;
    if (!point) {
        return null;
    }

    return (
        <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
            <div className="mb-1 font-medium">{point.label}</div>
            <AmountDisplay
                amountInCents={point.amount}
                currencyCode={currency}
                showSign
                className="font-mono font-medium tabular-nums"
            />
        </div>
    );
}

export function AnalysisChart({
    title,
    data,
    currency,
    loading,
    scrollable,
}: AnalysisChartProps) {
    const locale = useLocale();
    const { cashflowIncomeColor, cashflowExpenseColor } = useChartColors();

    const chartConfig: ChartConfig = {
        amount: { label: __('Amount'), color: 'var(--color-chart-1)' },
    };

    const minChartWidth = scrollable ? data.length * 56 : undefined;

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[300px] animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                ) : data.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        {__('No transactions match these filters')}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <ChartContainer
                            config={chartConfig}
                            className="h-[300px] w-full"
                            style={
                                minChartWidth
                                    ? { minWidth: `${minChartWidth}px` }
                                    : undefined
                            }
                        >
                            <BarChart accessibilityLayer data={data}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--color-border)"
                                    opacity={0.3}
                                />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={60}
                                    tickFormatter={(value: number) =>
                                        formatCompactNumber(
                                            value / 100,
                                            locale,
                                            currency,
                                        )
                                    }
                                />
                                <ReferenceLine
                                    y={0}
                                    stroke="var(--color-border)"
                                    strokeDasharray="3 3"
                                />
                                <Tooltip
                                    content={
                                        <CustomTooltip currency={currency} />
                                    }
                                    cursor={{
                                        fill: 'var(--color-muted)',
                                        opacity: 0.3,
                                    }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {data.map((point) => (
                                        <Cell
                                            key={point.key}
                                            fill={
                                                point.amount >= 0
                                                    ? cashflowIncomeColor
                                                    : cashflowExpenseColor
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
