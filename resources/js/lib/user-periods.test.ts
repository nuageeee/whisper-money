import {
    getUserPeriodRange,
    sameUserPeriod,
    shiftUserPeriod,
    userMonthStartDay,
} from '@/lib/user-periods';
import { describe, expect, it } from 'vitest';

const ymd = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

describe('userMonthStartDay', () => {
    it('passes through allowed values', () => {
        expect(userMonthStartDay(25)).toBe(25);
        expect(userMonthStartDay(1)).toBe(1);
    });

    it('falls back to 1 for unsupported values', () => {
        expect(userMonthStartDay(24)).toBe(1);
        expect(userMonthStartDay('25')).toBe(1);
        expect(userMonthStartDay(undefined)).toBe(1);
        expect(userMonthStartDay(null)).toBe(1);
    });
});

describe('getUserPeriodRange month', () => {
    it('returns natural month for start day 1', () => {
        const range = getUserPeriodRange(new Date(2026, 1, 14), 'month', 1);

        expect(ymd(range.from)).toBe('2026-02-01');
        expect(ymd(range.to)).toBe('2026-03-01');
        expect(ymd(range.endInclusive)).toBe('2026-02-28');
    });

    it('returns salary month for custom start day', () => {
        const range = getUserPeriodRange(new Date(2026, 1, 14), 'month', 25);

        expect(ymd(range.from)).toBe('2026-01-25');
        expect(ymd(range.to)).toBe('2026-02-25');
        expect(ymd(range.endInclusive)).toBe('2026-02-24');
    });

    it('keeps the current period when the date is on the start day', () => {
        const range = getUserPeriodRange(new Date(2026, 1, 25), 'month', 25);

        expect(ymd(range.from)).toBe('2026-02-25');
        expect(ymd(range.to)).toBe('2026-03-25');
    });
});

describe('getUserPeriodRange quarter', () => {
    it('anchors the quarter to the custom start day', () => {
        const range = getUserPeriodRange(new Date(2026, 1, 14), 'quarter', 25);

        expect(ymd(range.from)).toBe('2026-01-25');
        expect(ymd(range.to)).toBe('2026-04-25');
        expect(ymd(range.endInclusive)).toBe('2026-04-24');
    });

    it('rolls back to the previous quarter before the start day', () => {
        const range = getUserPeriodRange(new Date(2026, 0, 10), 'quarter', 25);

        expect(ymd(range.from)).toBe('2025-10-25');
        expect(ymd(range.to)).toBe('2026-01-25');
    });
});

describe('getUserPeriodRange year', () => {
    it('anchors the year to January on the custom start day', () => {
        const range = getUserPeriodRange(new Date(2026, 1, 14), 'year', 25);

        expect(ymd(range.from)).toBe('2026-01-25');
        expect(ymd(range.to)).toBe('2027-01-25');
        expect(ymd(range.endInclusive)).toBe('2027-01-24');
    });

    it('rolls back to the previous year before the start day', () => {
        const range = getUserPeriodRange(new Date(2026, 0, 10), 'year', 25);

        expect(ymd(range.from)).toBe('2025-01-25');
        expect(ymd(range.to)).toBe('2026-01-25');
    });
});

describe('shiftUserPeriod', () => {
    it('shifts salary months by the start day', () => {
        const next = shiftUserPeriod(new Date(2026, 1, 14), 'month', 25, 1);
        const previous = shiftUserPeriod(
            new Date(2026, 1, 14),
            'month',
            25,
            -1,
        );

        expect(ymd(next)).toBe('2026-02-25');
        expect(ymd(previous)).toBe('2025-12-25');
    });

    it('shifts custom quarters by three months', () => {
        const next = shiftUserPeriod(new Date(2026, 1, 14), 'quarter', 25, 1);

        expect(ymd(next)).toBe('2026-04-25');
    });
});

describe('sameUserPeriod', () => {
    it('treats dates within the same salary month as equal', () => {
        expect(
            sameUserPeriod(
                new Date(2026, 1, 14),
                new Date(2026, 1, 20),
                'month',
                25,
            ),
        ).toBe(true);
    });

    it('distinguishes dates across the start-day boundary', () => {
        expect(
            sameUserPeriod(
                new Date(2026, 1, 14),
                new Date(2026, 1, 26),
                'month',
                25,
            ),
        ).toBe(false);
    });
});
