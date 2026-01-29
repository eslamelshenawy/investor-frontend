/**
 * ======================================
 * FORMAT UTILITIES - أدوات التنسيق
 * ======================================
 * 
 * دوال مساعدة لتنسيق الأرقام والنصوص
 * Helper functions for formatting numbers and text
 */

/**
 * تنسيق الأرقام بالفواصل العربية
 * Format numbers with Arabic locale
 * 
 * @param value - الرقم المراد تنسيقه
 * @param decimals - عدد الخانات العشرية (افتراضي: 0)
 * @returns الرقم المنسق
 * 
 * @example
 * formatNumber(1234567) // "١٬٢٣٤٬٥٦٧"
 * formatNumber(1234.56, 2) // "١٬٢٣٤٫٥٦"
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
    if (isNaN(value)) return '٠';

    return value.toLocaleString('ar-SA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * تنسيق الأرقام الكبيرة (K, M, B)
 * Format large numbers with suffixes
 * 
 * @param value - الرقم
 * @param decimals - عدد الخانات العشرية
 * @returns الرقم المنسق مع اللاحقة
 * 
 * @example
 * formatCompactNumber(1234) // "1.2K"
 * formatCompactNumber(1234567) // "1.2M"
 * formatCompactNumber(1234567890) // "1.2B"
 */
export const formatCompactNumber = (value: number, decimals: number = 1): string => {
    if (isNaN(value)) return '0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1_000_000_000) {
        return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`;
    }
    if (absValue >= 1_000_000) {
        return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`;
    }
    if (absValue >= 1_000) {
        return `${sign}${(absValue / 1_000).toFixed(decimals)}K`;
    }

    return `${sign}${absValue.toFixed(decimals)}`;
};

/**
 * تنسيق العملة (ريال سعودي)
 * Format currency (Saudi Riyal)
 * 
 * @param value - المبلغ
 * @param showCurrency - إظهار رمز العملة (افتراضي: true)
 * @returns المبلغ المنسق
 * 
 * @example
 * formatCurrency(1234.56) // "١٬٢٣٤٫٥٦ ر.س"
 * formatCurrency(1234.56, false) // "١٬٢٣٤٫٥٦"
 */
export const formatCurrency = (value: number, showCurrency: boolean = true): string => {
    if (isNaN(value)) return showCurrency ? '٠ ر.س' : '٠';

    const formatted = value.toLocaleString('ar-SA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return showCurrency ? `${formatted} ر.س` : formatted;
};

/**
 * تنسيق النسبة المئوية
 * Format percentage
 * 
 * @param value - القيمة (0-100 أو 0-1)
 * @param decimals - عدد الخانات العشرية
 * @param isDecimal - هل القيمة عشرية (0-1) أم مئوية (0-100)
 * @returns النسبة المنسقة
 * 
 * @example
 * formatPercentage(45.67) // "٤٥٫٦٧٪"
 * formatPercentage(0.4567, 2, true) // "٤٥٫٦٧٪"
 */
export const formatPercentage = (
    value: number,
    decimals: number = 2,
    isDecimal: boolean = false
): string => {
    if (isNaN(value)) return '٠٪';

    const percentage = isDecimal ? value * 100 : value;
    const formatted = percentage.toLocaleString('ar-SA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return `${formatted}٪`;
};

/**
 * تنسيق حجم الملف
 * Format file size
 * 
 * @param bytes - الحجم بالبايت
 * @param decimals - عدد الخانات العشرية
 * @returns الحجم المنسق
 * 
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * اختصار النص الطويل
 * Truncate long text
 * 
 * @param text - النص
 * @param maxLength - الطول الأقصى
 * @param suffix - اللاحقة (افتراضي: "...")
 * @returns النص المختصر
 * 
 * @example
 * truncateText("نص طويل جداً", 10) // "نص طويل..."
 */
export const truncateText = (
    text: string,
    maxLength: number,
    suffix: string = '...'
): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * تحويل النص إلى Slug
 * Convert text to URL-friendly slug
 * 
 * @param text - النص
 * @returns الـ slug
 * 
 * @example
 * toSlug("رادار المستثمر") // "رادار-المستثمر"
 */
export const toSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
        .replace(/-+/g, '-');
};

/**
 * تحويل الحرف الأول إلى كبير
 * Capitalize first letter
 * 
 * @param text - النص
 * @returns النص مع حرف أول كبير
 */
export const capitalize = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * إزالة المسافات الزائدة
 * Remove extra whitespace
 * 
 * @param text - النص
 * @returns النص بدون مسافات زائدة
 */
export const cleanWhitespace = (text: string): string => {
    return text.trim().replace(/\s+/g, ' ');
};

/**
 * التحقق من النص الفارغ
 * Check if text is empty or whitespace
 * 
 * @param text - النص
 * @returns true إذا كان النص فارغاً
 */
export const isEmpty = (text: string | null | undefined): boolean => {
    return !text || text.trim().length === 0;
};
