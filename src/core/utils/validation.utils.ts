/**
 * ======================================
 * VALIDATION UTILITIES - أدوات التحقق
 * ======================================
 * 
 * دوال للتحقق من صحة البيانات
 * Functions for data validation
 */

/**
 * التحقق من البريد الإلكتروني
 * Validate email address
 * 
 * @param email - البريد الإلكتروني
 * @returns true إذا كان البريد صالحاً
 * 
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid-email") // false
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * التحقق من رقم الجوال السعودي
 * Validate Saudi phone number
 * 
 * @param phone - رقم الجوال
 * @returns true إذا كان الرقم صالحاً
 * 
 * @example
 * isValidSaudiPhone("0501234567") // true
 * isValidSaudiPhone("+966501234567") // true
 */
export const isValidSaudiPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '');
    const saudiPhoneRegex = /^(05|5|\+9665)[0-9]{8}$/;
    return saudiPhoneRegex.test(cleanPhone);
};

/**
 * التحقق من قوة كلمة المرور
 * Validate password strength
 * 
 * @param password - كلمة المرور
 * @returns كائن يحتوي على النتيجة والأخطاء
 * 
 * @example
 * validatePassword("Weak123") 
 * // { isValid: false, errors: ["يجب أن تحتوي على رمز خاص"] }
 */
export const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
} => {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length < 8) {
        errors.push('يجب أن تكون 8 أحرف على الأقل');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('يجب أن تحتوي على حرف كبير');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('يجب أن تحتوي على حرف صغير');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('يجب أن تحتوي على رقم');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('يجب أن تحتوي على رمز خاص');
    }

    // Calculate strength
    if (errors.length === 0) {
        if (password.length >= 12) {
            strength = 'strong';
        } else {
            strength = 'medium';
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
    };
};

/**
 * التحقق من الرقم
 * Validate if value is a number
 * 
 * @param value - القيمة
 * @returns true إذا كانت رقماً
 */
export const isNumber = (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * التحقق من الرقم الموجب
 * Validate if number is positive
 * 
 * @param value - الرقم
 * @returns true إذا كان موجباً
 */
export const isPositiveNumber = (value: number): boolean => {
    return isNumber(value) && value > 0;
};

/**
 * التحقق من النطاق
 * Validate if number is within range
 * 
 * @param value - القيمة
 * @param min - الحد الأدنى
 * @param max - الحد الأقصى
 * @returns true إذا كانت ضمن النطاق
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
    return isNumber(value) && value >= min && value <= max;
};

/**
 * التحقق من URL
 * Validate URL
 * 
 * @param url - الرابط
 * @returns true إذا كان الرابط صالحاً
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * التحقق من طول النص
 * Validate text length
 * 
 * @param text - النص
 * @param min - الحد الأدنى
 * @param max - الحد الأقصى
 * @returns true إذا كان الطول صالحاً
 */
export const isValidLength = (text: string, min: number, max: number): boolean => {
    const length = text.trim().length;
    return length >= min && length <= max;
};

/**
 * التحقق من صيغة الملف
 * Validate file type
 * 
 * @param file - الملف
 * @param allowedTypes - الصيغ المسموحة
 * @returns true إذا كانت الصيغة مسموحة
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
};

/**
 * التحقق من حجم الملف
 * Validate file size
 * 
 * @param file - الملف
 * @param maxSizeInMB - الحجم الأقصى بالميجابايت
 * @returns true إذا كان الحجم مناسباً
 */
export const isValidFileSize = (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
};

/**
 * التحقق من JSON
 * Validate JSON string
 * 
 * @param str - النص
 * @returns true إذا كان JSON صالحاً
 */
export const isValidJson = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

/**
 * التحقق من القيمة الفارغة
 * Check if value is empty
 * 
 * @param value - القيمة
 * @returns true إذا كانت فارغة
 */
export const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

/**
 * التحقق من القيمة المطلوبة
 * Validate required field
 * 
 * @param value - القيمة
 * @param fieldName - اسم الحقل
 * @returns رسالة الخطأ أو null
 */
export const validateRequired = (value: any, fieldName: string): string | null => {
    if (isEmpty(value)) {
        return `${fieldName} مطلوب`;
    }
    return null;
};
