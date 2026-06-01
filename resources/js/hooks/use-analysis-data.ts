import { type TransactionFilters } from '@/types/transaction';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

export const ANALYSIS_DIMENSIONS = [
    'category',
    'month',
    'account',
    'label',
] as const;

export type AnalysisDimension = (typeof ANALYSIS_DIMENSIONS)[number];

export interface AnalysisSummary {
    income: number;
    expense: number;
    net: number;
    count: number;
}

export interface AnalysisGroup {
    key: string | null;
    amount: number;
    count: number;
}

export interface AnalysisData {
    summary: AnalysisSummary;
    groups: AnalysisGroup[];
    isLoading: boolean;
}

const emptySummary: AnalysisSummary = {
    income: 0,
    expense: 0,
    net: 0,
    count: 0,
};

function buildQuery(
    filters: TransactionFilters,
    groupBy: AnalysisDimension,
): string {
    const params = new URLSearchParams({ group_by: groupBy });

    if (filters.dateFrom) {
        params.set('date_from', format(filters.dateFrom, 'yyyy-MM-dd'));
    }
    if (filters.dateTo) {
        params.set('date_to', format(filters.dateTo, 'yyyy-MM-dd'));
    }
    if (filters.amountMin !== null) {
        params.set('amount_min', filters.amountMin.toString());
    }
    if (filters.amountMax !== null) {
        params.set('amount_max', filters.amountMax.toString());
    }
    if (filters.categoryIds.length > 0) {
        params.set('category_ids', filters.categoryIds.join(','));
    }
    if (filters.accountIds.length > 0) {
        params.set('account_ids', filters.accountIds.join(','));
    }
    if (filters.labelIds.length > 0) {
        params.set('label_ids', filters.labelIds.join(','));
    }
    if (filters.creditorName) {
        params.set('creditor_name', filters.creditorName);
    }
    if (filters.debtorName) {
        params.set('debtor_name', filters.debtorName);
    }
    if (filters.searchText) {
        params.set('search', filters.searchText);
    }

    return params.toString();
}

export function useAnalysisData(
    filters: TransactionFilters,
    groupBy: AnalysisDimension,
): AnalysisData & { refetch: () => void } {
    const [summary, setSummary] = useState<AnalysisSummary>(emptySummary);
    const [groups, setGroups] = useState<AnalysisGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const query = buildQuery(filters, groupBy);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/analysis?${query}`);
            const data = await response.json();
            setSummary(data.summary ?? emptySummary);
            setGroups(data.groups ?? []);
        } catch (error) {
            console.error('Failed to fetch analysis data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { summary, groups, isLoading, refetch: fetchData };
}
