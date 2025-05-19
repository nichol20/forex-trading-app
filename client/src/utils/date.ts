export const toUtcDateString = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
} 
  
export const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}