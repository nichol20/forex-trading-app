export const toUtcDateString = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export const checkIf1MinuteHasPassed = (timeInMs: number) => {
    return Date.now() - timeInMs >= 1000 * 60
}