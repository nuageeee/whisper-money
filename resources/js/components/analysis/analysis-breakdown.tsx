import { CategoryIcon } from '@/components/shared/category-combobox';
import { AmountDisplay } from '@/components/ui/amount-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useChartColors } from '@/hooks/use-chart-color-scheme';
import { cn } from '@/lib/utils';
import { type Account } from '@/types/account';
import { type Category } from '@/types/category';
import { getLabelColorClasses } from '@/types/label';
import { __ } from '@/utils/i18n';
import { CreditCard, Tag } from 'lucide-react';

export interface ResolvedRow {
    key: string | null;
    label: string;
    amount: number;
    count: number;
    category?: Category;
    labelColor?: string;
    account?: Account;
}

interface AnalysisBreakdownProps {
    title: string;
    rows: ResolvedRow[];
    currency: string;
    loading?: boolean;
    onDrill?: (row: ResolvedRow) => void;
}

export function AnalysisBreakdown({
    title,
    rows,
    currency,
    loading,
    onDrill,
}: AnalysisBreakdownProps) {
    const { categoryBarColor } = useChartColors();
    const maxAmount = Math.max(...rows.map((row) => Math.abs(row.amount)), 1);

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="size-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                </div>
                                <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        {__('No transactions match these filters')}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {rows.map((row, index) => {
                            const barColor = row.category
                                ? categoryBarColor(row.category.color, index)
                                : 'var(--chart-1)';
                            const widthPercentage =
                                (Math.abs(row.amount) / maxAmount) * 100;

                            return (
                                <button
                                    key={row.key ?? '__null__'}
                                    type="button"
                                    onClick={() => onDrill?.(row)}
                                    disabled={!onDrill}
                                    className={cn(
                                        '-mx-1.5 block w-full space-y-1.5 rounded-md px-1.5 py-1.5 text-left transition-colors',
                                        onDrill &&
                                            'cursor-pointer hover:bg-muted',
                                    )}
                                >
                                    <div className="flex min-w-0 items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <RowIcon row={row} />
                                            <span className="min-w-0 truncate text-sm font-medium">
                                                {row.label}
                                            </span>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                ({row.count})
                                            </span>
                                        </div>
                                        <AmountDisplay
                                            amountInCents={row.amount}
                                            currencyCode={currency}
                                            variant="compact"
                                            showSign
                                            minimumFractionDigits={0}
                                            maximumFractionDigits={0}
                                        />
                                    </div>
                                    <Progress
                                        value={widthPercentage}
                                        className="h-1.5"
                                        indicatorColor={barColor}
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function RowIcon({ row }: { row: ResolvedRow }) {
    if (row.category) {
        return (
            <div className="shrink-0">
                <CategoryIcon category={row.category} />
            </div>
        );
    }

    if (row.account) {
        return (
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                <CreditCard className="size-3.5" />
            </div>
        );
    }

    if (row.labelColor) {
        const colorClasses = getLabelColorClasses(row.labelColor);
        return (
            <div
                className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full',
                    colorClasses.bg,
                )}
            >
                <Tag className={cn('size-3.5', colorClasses.text)} />
            </div>
        );
    }

    return null;
}
