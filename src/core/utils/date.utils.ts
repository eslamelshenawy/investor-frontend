/**
 * ======================================
 * DATE UTILITIES - أدوات التاريخ
 * ======================================
 * 
 * دوال مساعدة للتعامل مع التواريخ والأوقات
 * Helper functions for date and time manipulation
 */

/**
 * تنسيق التاريخ بصيغة عربية
 * Format date in Arabic locale
 * 
 * @param date - التاريخ (Date object or ISO string)
 * @param format - نوع التنسيق
 * @returns التاريخ المنسق
 * 
 * @example
 * formatDate(new Date(), 'short') // "٣/١/٢٠٢٦"
 * formatDate('2026-01-03', 'long') // "٣ يناير ٢٠٢٦"
 */
export const formatDate = (
    date: Date | string,
    format: 'short' | 'long' | 'relative' = 'short'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'تاريخ غير صالح';
    }

    switch (format) {
        case 'short':
            return dateObj.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            });

        case 'long':
            return dateObj.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

        case 'relative':
            return getRelativeTime(dateObj);

        default:
            return dateObj.toLocaleDateString('ar-SA');
    }
};

/**
 * الحصول على الوقت النسبي (منذ 5 دقائق، منذ ساعة، إلخ)
 * Get relative time (5 minutes ago, 1 hour ago, etc.)
 * 
 * @param date - التاريخ
 * @returns الوقت النسبي بالعربية
 * 
 * @example
 * getRelativeTime(new Date(Date.now() - 60000)) // "منذ دقيقة"
 */
export const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} ${diffMin === 1 ? 'دقيقة' : 'دقائق'}`;
    if (diffHour < 24) return `منذ ${diffHour} ${diffHour === 1 ? 'ساعة' : 'ساعات'}`;
    if (diffDay < 7) return `منذ ${diffDay} ${diffDay === 1 ? 'يوم' : 'أيام'}`;
    if (diffWeek < 4) return `منذ ${diffWeek} ${diffWeek === 1 ? 'أسبوع' : 'أسابيع'}`;
    if (diffMonth < 12) return `منذ ${diffMonth} ${diffMonth === 1 ? 'شهر' : 'أشهر'}`;
    return `منذ ${diffYear} ${diffYear === 1 ? 'سنة' : 'سنوات'}`;
};

/**
 * التحقق من صحة التاريخ
 * Validate if a date is valid
 * 
 * @param date - التاريخ للتحقق منه
 * @returns true إذا كان التاريخ صالحاً
 */
export const isValidDate = (date: any): boolean => {
    if (date instanceof Date) {
        return !isNaN(date.getTime());
    }
    if (typeof date === 'string') {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
    }
    return false;
};

/**
 * الحصول على بداية اليوم
 * Get start of day
 */
export const startOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

/**
 * الحصول على نهاية اليوم
 * Get end of day
 */
export const endOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
};

/**
 * إضافة أيام إلى تاريخ
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

/**
 * الفرق بين تاريخين بالأيام
 * Difference between two dates in days
 */
export const daysBetween = (date1: Date, date2: Date): number => {
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};
