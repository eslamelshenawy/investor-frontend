/**
 * ======================================
 * CLASSNAME UTILITIES - أدوات أسماء الفئات
 * ======================================
 * 
 * دوال لإدارة أسماء فئات CSS بشكل ديناميكي
 * Functions for managing CSS class names dynamically
 */

type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
type ClassArray = ClassValue[];
type ClassDictionary = Record<string, any>;

/**
 * دمج أسماء الفئات بشكل ديناميكي
 * Merge class names dynamically (similar to clsx/classnames)
 * 
 * @param classes - أسماء الفئات أو كائنات شرطية
 * @returns سلسلة نصية بأسماء الفئات
 * 
 * @example
 * cn('btn', 'btn-primary') // "btn btn-primary"
 * cn('btn', { 'btn-active': isActive }) // "btn btn-active" or "btn"
 * cn(['btn', 'btn-primary'], { 'disabled': isDisabled }) // "btn btn-primary disabled"
 */
export const cn = (...classes: ClassValue[]): string => {
    const result: string[] = [];

    for (const cls of classes) {
        if (!cls) continue;

        if (typeof cls === 'string' || typeof cls === 'number') {
            result.push(String(cls));
        } else if (Array.isArray(cls)) {
            const inner = cn(...cls);
            if (inner) result.push(inner);
        } else if (typeof cls === 'object') {
            for (const key in cls) {
                if (cls[key]) {
                    result.push(key);
                }
            }
        }
    }

    return result.join(' ');
};

/**
 * دمج أسماء فئات Tailwind مع حل التعارضات
 * Merge Tailwind classes with conflict resolution
 * 
 * @param classes - أسماء الفئات
 * @returns سلسلة نصية بأسماء الفئات بدون تعارضات
 * 
 * @example
 * twMerge('px-4 py-2', 'px-6') // "py-2 px-6"
 */
export const twMerge = (...classes: ClassValue[]): string => {
    const merged = cn(...classes);
    const classList = merged.split(' ').filter(Boolean);

    // Simple conflict resolution for common Tailwind patterns
    const conflicts: Record<string, string[]> = {
        padding: ['p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-'],
        margin: ['m-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-'],
        width: ['w-'],
        height: ['h-'],
        text: ['text-'],
        bg: ['bg-'],
        border: ['border-'],
        rounded: ['rounded-'],
    };

    const result: string[] = [];
    const seen = new Set<string>();

    // Process from right to left (last class wins)
    for (let i = classList.length - 1; i >= 0; i--) {
        const cls = classList[i];
        let isConflict = false;

        for (const group in conflicts) {
            const prefixes = conflicts[group];
            for (const prefix of prefixes) {
                if (cls.startsWith(prefix)) {
                    if (seen.has(group)) {
                        isConflict = true;
                        break;
                    }
                    seen.add(group);
                    break;
                }
            }
            if (isConflict) break;
        }

        if (!isConflict) {
            result.unshift(cls);
        }
    }

    return result.join(' ');
};

/**
 * إنشاء دالة لإنشاء أسماء فئات بناءً على متغيرات
 * Create a function for generating class names based on variants
 * 
 * @param base - الفئات الأساسية
 * @param variants - المتغيرات
 * @returns دالة لإنشاء أسماء الفئات
 * 
 * @example
 * const button = cva('btn', {
 *   variants: {
 *     color: {
 *       primary: 'bg-blue-600',
 *       secondary: 'bg-gray-600'
 *     },
 *     size: {
 *       sm: 'px-3 py-1',
 *       lg: 'px-6 py-3'
 *     }
 *   }
 * });
 * button({ color: 'primary', size: 'lg' }) // "btn bg-blue-600 px-6 py-3"
 */
export const cva = <T extends Record<string, Record<string, string>>>(
    base: string,
    config?: {
        variants?: T;
        defaultVariants?: Partial<{ [K in keyof T]: keyof T[K] }>;
    }
) => {
    return (props?: Partial<{ [K in keyof T]: keyof T[K] }> & { className?: string }) => {
        const classes: string[] = [base];

        if (config?.variants && props) {
            for (const variantKey in config.variants) {
                const variantValue = props[variantKey] || config.defaultVariants?.[variantKey];
                if (variantValue) {
                    const variantClass = config.variants[variantKey][variantValue as string];
                    if (variantClass) {
                        classes.push(variantClass);
                    }
                }
            }
        }

        if (props?.className) {
            classes.push(props.className);
        }

        return twMerge(...classes);
    };
};

/**
 * فئات شرطية بناءً على القيمة
 * Conditional classes based on value
 * 
 * @param condition - الشرط
 * @param trueClasses - الفئات عند true
 * @param falseClasses - الفئات عند false
 * @returns أسماء الفئات
 * 
 * @example
 * conditional(isActive, 'bg-blue-600', 'bg-gray-400')
 */
export const conditional = (
    condition: boolean,
    trueClasses: string,
    falseClasses: string = ''
): string => {
    return condition ? trueClasses : falseClasses;
};
