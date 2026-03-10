import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatNZDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-NZ', {
        timeZone: 'Pacific/Auckland',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(d);
}

export function formatNZTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-NZ', {
        timeZone: 'Pacific/Auckland',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(d);
}

export function formatNZDateTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    return `${formatNZDate(date)} ${formatNZTime(date)}`;
}
