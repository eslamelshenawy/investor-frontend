/**
 * ======================================
 * STORAGE UTILITIES - أدوات التخزين
 * ======================================
 * 
 * دوال للتعامل مع LocalStorage و SessionStorage
 * Functions for working with browser storage
 */

/**
 * حفظ قيمة في LocalStorage
 * Save value to LocalStorage
 * 
 * @param key - المفتاح
 * @param value - القيمة (سيتم تحويلها إلى JSON)
 * @returns true إذا تم الحفظ بنجاح
 * 
 * @example
 * setLocalStorage('user', { name: 'أحمد', role: 'admin' })
 */
export const setLocalStorage = <T>(key: string, value: T): boolean => {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage: ${key}`, error);
        return false;
    }
};

/**
 * قراءة قيمة من LocalStorage
 * Read value from LocalStorage
 * 
 * @param key - المفتاح
 * @param defaultValue - القيمة الافتراضية
 * @returns القيمة المحفوظة أو القيمة الافتراضية
 * 
 * @example
 * const user = getLocalStorage<User>('user', null)
 */
export const getLocalStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
    }
};

/**
 * حذف قيمة من LocalStorage
 * Remove value from LocalStorage
 * 
 * @param key - المفتاح
 * @returns true إذا تم الحذف بنجاح
 */
export const removeLocalStorage = (key: string): boolean => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
        return false;
    }
};

/**
 * مسح جميع القيم من LocalStorage
 * Clear all values from LocalStorage
 * 
 * @returns true إذا تم المسح بنجاح
 */
export const clearLocalStorage = (): boolean => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage', error);
        return false;
    }
};

/**
 * حفظ قيمة في SessionStorage
 * Save value to SessionStorage
 * 
 * @param key - المفتاح
 * @param value - القيمة
 * @returns true إذا تم الحفظ بنجاح
 */
export const setSessionStorage = <T>(key: string, value: T): boolean => {
    try {
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error(`Error saving to sessionStorage: ${key}`, error);
        return false;
    }
};

/**
 * قراءة قيمة من SessionStorage
 * Read value from SessionStorage
 * 
 * @param key - المفتاح
 * @param defaultValue - القيمة الافتراضية
 * @returns القيمة المحفوظة أو القيمة الافتراضية
 */
export const getSessionStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
        const item = sessionStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`Error reading from sessionStorage: ${key}`, error);
        return defaultValue;
    }
};

/**
 * حذف قيمة من SessionStorage
 * Remove value from SessionStorage
 * 
 * @param key - المفتاح
 * @returns true إذا تم الحذف بنجاح
 */
export const removeSessionStorage = (key: string): boolean => {
    try {
        sessionStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from sessionStorage: ${key}`, error);
        return false;
    }
};

/**
 * مسح جميع القيم من SessionStorage
 * Clear all values from SessionStorage
 * 
 * @returns true إذا تم المسح بنجاح
 */
export const clearSessionStorage = (): boolean => {
    try {
        sessionStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing sessionStorage', error);
        return false;
    }
};

/**
 * التحقق من دعم المتصفح للتخزين
 * Check if browser supports storage
 * 
 * @param type - نوع التخزين ('local' أو 'session')
 * @returns true إذا كان مدعوماً
 */
export const isStorageAvailable = (type: 'local' | 'session' = 'local'): boolean => {
    try {
        const storage = type === 'local' ? localStorage : sessionStorage;
        const testKey = '__storage_test__';
        storage.setItem(testKey, 'test');
        storage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

/**
 * الحصول على حجم التخزين المستخدم
 * Get storage size in bytes
 * 
 * @param type - نوع التخزين
 * @returns الحجم بالبايت
 */
export const getStorageSize = (type: 'local' | 'session' = 'local'): number => {
    try {
        const storage = type === 'local' ? localStorage : sessionStorage;
        let size = 0;
        for (const key in storage) {
            if (storage.hasOwnProperty(key)) {
                size += storage[key].length + key.length;
            }
        }
        return size;
    } catch {
        return 0;
    }
};

/**
 * حفظ قيمة مع تاريخ انتهاء
 * Save value with expiration date
 * 
 * @param key - المفتاح
 * @param value - القيمة
 * @param expirationInMinutes - مدة الصلاحية بالدقائق
 * @returns true إذا تم الحفظ بنجاح
 */
export const setWithExpiry = <T>(
    key: string,
    value: T,
    expirationInMinutes: number
): boolean => {
    try {
        const now = new Date();
        const item = {
            value,
            expiry: now.getTime() + expirationInMinutes * 60 * 1000,
        };
        localStorage.setItem(key, JSON.stringify(item));
        return true;
    } catch (error) {
        console.error(`Error saving with expiry: ${key}`, error);
        return false;
    }
};

/**
 * قراءة قيمة مع التحقق من تاريخ الانتهاء
 * Read value with expiration check
 * 
 * @param key - المفتاح
 * @returns القيمة أو null إذا انتهت الصلاحية
 */
export const getWithExpiry = <T>(key: string): T | null => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = new Date();

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value as T;
    } catch (error) {
        console.error(`Error reading with expiry: ${key}`, error);
        return null;
    }
};
