import { AmountDisplay } from '@/components/ui/amount-display';
import { Card, CardContent } from '@/components/ui/card';
import { type AnalysisSummary } from '@/hooks/use-analysis-data';
import { cn } from '@/lib/utils';
import { __ } from '@/utils/i18n';

interface AnalysisSummaryCardsProps {
    summary: AnalysisSummary;
    currency: string;
    loading?: boolean;
}

export function AnalysisSummaryCards({
    summary,
    currency,
    loading,
}: AnalysisSummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard label={__('Income')} loading={loading}>
                <AmountDisplay
                    amountInCents={summary.income}
                    currencyCode={currency}
                    weight="semibold"
                    size="xl"
                    className="text-emerald-600 dark:text-emerald-400"
                />
            </SummaryCard>

            <SummaryCard label={__('Spent')} loading={loading}>
                <AmountDisplay
                    amountInCents={summary.expense}
                    currencyCode={currency}
                    weight="semibold"
                    size="xl"
                    className="text-rose-600 dark:text-rose-400"
                />
            </SummaryCard>

            <SummaryCard label={__('Net')} loading={loading}>
                <AmountDisplay
                    amountInCents={summary.net}
                    currencyCode={currency}
                    weight="semibold"
                    size="xl"
                    showSign
                    className={cn(
                        summary.net >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400',
                    )}
                />
            </SummaryCard>

            <SummaryCard label={__('Transactions')} loading={loading}>
                <span className="text-xl font-semibold tabular-nums">
                    {summary.count.toLocaleString()}
                </span>
            </SummaryCard>
        </div>
    );
}

function SummaryCard({
    label,
    loading,
    children,
}: {
    label: string;
    loading?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{label}</span>
                {loading ? (
                    <div className="h-7 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
