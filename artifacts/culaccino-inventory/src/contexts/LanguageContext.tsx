import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Lang = 'en' | 'ar';

const LANG_KEY = 'culaccino_lang';

const translations = {
  en: {
    // App Shell
    culaccino: 'Culaccino',
    inventory: 'Inventory',
    auditLog: 'Audit Log',
    reports: 'Reports',
    toggleTheme: 'Toggle theme',
    managerMode: 'Manager Mode',
    employeeMode: 'Employee Mode',
    manager: 'Manager',
    employee: 'Employee',
    langToggle: 'عربي',

    // Categories
    all: 'All',
    coffeeBeans: 'Coffee Beans',
    dairyMilk: 'Dairy & Milk',
    syrups: 'Syrups',
    cupsPackaging: 'Cups & Packaging',
    cleaningSupplies: 'Cleaning Supplies',
    other: 'Other',

    // Transaction types
    restock: 'Restock',
    withdrawal: 'Withdrawal',
    adjustment: 'Adjustment',
    addition: 'Addition',
    deletion: 'Deletion',

    // Inventory page
    inventoryTitle: 'Inventory',
    inventorySubtitle: 'Manage stock levels, restock, and withdraw.',
    addNewItem: 'Add New Item',
    searchItems: 'Search items...',
    noItemsFound: 'No items found',
    noItemsSearch: 'No results match "{q}". Try adjusting your filters.',
    emptyInventory: 'Your inventory is empty.',
    currentStock: 'Current Stock',
    lowStock: 'Low Stock',
    withdraw: 'Withdraw',
    restockBtn: 'Restock',
    deleteItem: 'Delete Item',
    confirmDeleteTitle: 'Are you absolutely sure?',
    confirmDeleteDesc: 'This will permanently delete {name} from the inventory catalog. This action cannot be undone.',
    cancel: 'Cancel',

    // Audit log page
    auditLogTitle: 'Audit Log',
    auditLogSubtitle: 'Complete history of all inventory movements and changes.',
    searchByItemOrEmployee: 'Search by item or employee...',
    allTypes: 'All Types',
    dateTime: 'Date & Time',
    item: 'Item',
    type: 'Type',
    change: 'Change',
    performedBy: 'Performed By',
    note: 'Note',
    noTransactions: 'No transactions found matching your filters.',
    previous: 'Previous',
    next: 'Next',
    showing: 'Showing {from} to {to} of {total}',

    // Reports page
    reportsTitle: 'Reports & Analytics',
    reportsSubtitle: 'Inventory movement and stock distribution.',
    totalCatalogItems: 'Total Catalog Items',
    itemsTracked: 'Items tracked in system',
    lowStockAlerts: 'Low Stock Alerts',
    itemsRequiringRestock: 'Items requiring restock',
    totalRestocked: 'Total Restocked',
    unitsAdded: 'Units added in period',
    totalWithdrawn: 'Total Withdrawn',
    unitsConsumed: 'Units consumed in period',
    inventoryValuation: 'Inventory Valuation',
    inventoryValuationSubtitle: 'Current value of every item based on price × quantity.',
    unitPrice: 'Unit Price',
    itemTotalValue: 'Item Total Value',
    grandTotalInventory: 'Grand Total Inventory',
    currentInventoryCapital: 'Capital tied up in current stock',
    movementActivity: 'Movement Activity',
    catalogDistribution: 'Catalog Distribution',
    printReport: 'Print Report',
    exportCSV: 'Export to CSV',
    last7Days: 'Last 7 Days',
    last14Days: 'Last 14 Days',
    last30Days: 'Last 30 Days',
    withdrawals: 'Withdrawals',
    restocks: 'Restocks',
    printHeader: 'Culaccino Coffee House — Inventory Report',
    generatedOn: 'Generated on {date}',
    timeRange: 'Time Range: Last {n} Days',

    // Add Item Modal
    addItemTitle: 'Add New Item',
    addItemDesc: 'Create a new item in the inventory catalog.',
    itemName: 'Item Name',
    category: 'Category',
    unit: 'Unit',
    initialQuantity: 'Initial Quantity',
    lowStockAlertAt: 'Low Stock Alert At',
    costPerUnit: 'Cost per unit ($) (Optional)',
    createItem: 'Create Item',
    selectCategory: 'Select a category',
    unitPlaceholder: 'kg, L, pcs...',
    itemNamePlaceholder: 'e.g. Almond Milk',

    // Edit Item Modal
    editItemTitle: 'Edit Item',
    editItemDesc: 'Update details for {name}.',
    currentQuantity: 'Current Quantity',
    saveChanges: 'Save Changes',

    // Withdraw Modal
    withdrawTitle: 'Withdraw Stock',
    withdrawDesc: 'Record a withdrawal for {name}. Current stock is {qty} {unit}.',
    yourName: 'Your Name',
    yourNamePlaceholder: 'e.g. Sarah',
    quantityLabel: 'Quantity ({unit})',
    noteOptional: 'Note (Optional)',
    notePlaceholder: 'Reason for withdrawal...',
    confirmWithdrawal: 'Confirm Withdrawal',

    // Restock Modal
    restockTitle: 'Restock Item',
    restockDesc: 'Add new inventory for {name}.',
    authorizedBy: 'Authorized By',
    quantityToAdd: 'Quantity to Add ({unit})',
    restockNotePlaceholder: 'Delivery reference, supplier, etc.',
    addStock: 'Add Stock',

    // Toasts
    itemDeleted: 'Item deleted',
    itemDeletedDesc: '{name} removed from inventory.',
    itemCreated: 'Item Created',
    itemCreatedDesc: '{name} added to inventory.',
    itemUpdated: 'Item Updated',
    itemUpdatedDesc: '{name} has been updated.',
    withdrawalConfirmed: 'Withdrawal confirmed',
    withdrawalConfirmedDesc: 'Removed {qty} {unit} of {name}',
    restockSuccessful: 'Restock successful',
    restockSuccessfulDesc: 'Added {qty} {unit} to {name}',
  },
  ar: {
    // App Shell
    culaccino: 'كولاشينو',
    inventory: 'المخزون',
    auditLog: 'سجل المراجعة',
    reports: 'التقارير',
    toggleTheme: 'تبديل المظهر',
    managerMode: 'وضع المدير',
    employeeMode: 'وضع الموظف',
    manager: 'مدير',
    employee: 'موظف',
    langToggle: 'EN',

    // Categories
    all: 'الكل',
    coffeeBeans: 'حبوب القهوة',
    dairyMilk: 'الألبان والحليب',
    syrups: 'الشراب',
    cupsPackaging: 'الأكواب والتغليف',
    cleaningSupplies: 'مستلزمات التنظيف',
    other: 'أخرى',

    // Transaction types
    restock: 'تعبئة',
    withdrawal: 'سحب',
    adjustment: 'تعديل',
    addition: 'إضافة',
    deletion: 'حذف',

    // Inventory page
    inventoryTitle: 'المخزون',
    inventorySubtitle: 'إدارة مستويات المخزون والتعبئة والسحب.',
    addNewItem: 'إضافة صنف جديد',
    searchItems: 'البحث عن الأصناف...',
    noItemsFound: 'لا توجد أصناف',
    noItemsSearch: 'لا توجد نتائج تطابق "{q}". حاول تعديل الفلاتر.',
    emptyInventory: 'المخزون فارغ.',
    currentStock: 'المخزون الحالي',
    lowStock: 'مخزون منخفض',
    withdraw: 'سحب',
    restockBtn: 'تعبئة',
    deleteItem: 'حذف الصنف',
    confirmDeleteTitle: 'هل أنت متأكد تمامًا؟',
    confirmDeleteDesc: 'سيتم حذف {name} نهائيًا من قائمة المخزون. لا يمكن التراجع عن هذا الإجراء.',
    cancel: 'إلغاء',

    // Audit log page
    auditLogTitle: 'سجل المراجعة',
    auditLogSubtitle: 'السجل الكامل لجميع تحركات المخزون والتغييرات.',
    searchByItemOrEmployee: 'البحث بالصنف أو الموظف...',
    allTypes: 'كل الأنواع',
    dateTime: 'التاريخ والوقت',
    item: 'الصنف',
    type: 'النوع',
    change: 'التغيير',
    performedBy: 'بواسطة',
    note: 'ملاحظة',
    noTransactions: 'لا توجد معاملات تطابق الفلاتر المحددة.',
    previous: 'السابق',
    next: 'التالي',
    showing: 'عرض {from} إلى {to} من {total}',

    // Reports page
    reportsTitle: 'التقارير والتحليلات',
    reportsSubtitle: 'حركة المخزون وتوزيع الفئات.',
    totalCatalogItems: 'إجمالي الأصناف',
    itemsTracked: 'الأصناف المسجلة في النظام',
    lowStockAlerts: 'تنبيهات المخزون المنخفض',
    itemsRequiringRestock: 'الأصناف التي تحتاج إعادة تعبئة',
    totalRestocked: 'إجمالي التعبئة',
    unitsAdded: 'الوحدات المضافة في الفترة',
    totalWithdrawn: 'إجمالي السحب',
    unitsConsumed: 'الوحدات المستهلكة في الفترة',
    inventoryValuation: 'تقييم المخزون',
    inventoryValuationSubtitle: 'القيمة الحالية لكل صنف بناءً على السعر × الكمية.',
    unitPrice: 'سعر الوحدة',
    itemTotalValue: 'القيمة الإجمالية للصنف',
    grandTotalInventory: 'إجمالي قيمة المخزون',
    currentInventoryCapital: 'رأس المال المرتبط بالمخزون الحالي',
    movementActivity: 'نشاط الحركة',
    catalogDistribution: 'توزيع الفئات',
    printReport: 'طباعة التقرير',
    exportCSV: 'تصدير CSV',
    last7Days: 'آخر 7 أيام',
    last14Days: 'آخر 14 يوم',
    last30Days: 'آخر 30 يوم',
    withdrawals: 'السحب',
    restocks: 'التعبئة',
    printHeader: 'كولاشينو كوفي هاوس — تقرير المخزون',
    generatedOn: 'تاريخ الإصدار: {date}',
    timeRange: 'الفترة الزمنية: آخر {n} أيام',

    // Add Item Modal
    addItemTitle: 'إضافة صنف جديد',
    addItemDesc: 'أنشئ صنفًا جديدًا في قائمة المخزون.',
    itemName: 'اسم الصنف',
    category: 'الفئة',
    unit: 'الوحدة',
    initialQuantity: 'الكمية الأولية',
    lowStockAlertAt: 'تنبيه المخزون المنخفض عند',
    costPerUnit: 'التكلفة للوحدة ($) (اختياري)',
    createItem: 'إنشاء الصنف',
    selectCategory: 'اختر الفئة',
    unitPlaceholder: 'كجم، لتر، قطعة...',
    itemNamePlaceholder: 'مثال: حليب اللوز',

    // Edit Item Modal
    editItemTitle: 'تعديل الصنف',
    editItemDesc: 'تحديث بيانات {name}.',
    currentQuantity: 'الكمية الحالية',
    saveChanges: 'حفظ التغييرات',

    // Withdraw Modal
    withdrawTitle: 'سحب من المخزون',
    withdrawDesc: 'تسجيل سحب لـ {name}. المخزون الحالي: {qty} {unit}.',
    yourName: 'اسمك',
    yourNamePlaceholder: 'مثال: سارة',
    quantityLabel: 'الكمية ({unit})',
    noteOptional: 'ملاحظة (اختياري)',
    notePlaceholder: 'سبب السحب...',
    confirmWithdrawal: 'تأكيد السحب',

    // Restock Modal
    restockTitle: 'تعبئة الصنف',
    restockDesc: 'إضافة مخزون جديد لـ {name}.',
    authorizedBy: 'بإذن من',
    quantityToAdd: 'الكمية المضافة ({unit})',
    restockNotePlaceholder: 'مرجع التسليم، المورد، إلخ.',
    addStock: 'إضافة المخزون',

    // Toasts
    itemDeleted: 'تم الحذف',
    itemDeletedDesc: 'تمت إزالة {name} من المخزون.',
    itemCreated: 'تم إنشاء الصنف',
    itemCreatedDesc: 'تمت إضافة {name} إلى المخزون.',
    itemUpdated: 'تم التحديث',
    itemUpdatedDesc: 'تم تحديث بيانات {name}.',
    withdrawalConfirmed: 'تم تأكيد السحب',
    withdrawalConfirmedDesc: 'تمت إزالة {qty} {unit} من {name}',
    restockSuccessful: 'تمت التعبئة بنجاح',
    restockSuccessfulDesc: 'تمت إضافة {qty} {unit} إلى {name}',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
  getCategoryLabel: (cat: string) => string;
  getTypeLabel: (type: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const CATEGORY_KEYS: Record<string, TranslationKey> = {
  'All': 'all',
  'Coffee Beans': 'coffeeBeans',
  'Dairy & Milk': 'dairyMilk',
  'Syrups': 'syrups',
  'Cups & Packaging': 'cupsPackaging',
  'Cleaning Supplies': 'cleaningSupplies',
  'Other': 'other',
};

const TYPE_KEYS: Record<string, TranslationKey> = {
  'restock': 'restock',
  'withdrawal': 'withdrawal',
  'adjustment': 'adjustment',
  'addition': 'addition',
  'deletion': 'deletion',
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem(LANG_KEY) as Lang) || 'en';
  });

  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem(LANG_KEY, newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>): string => {
    let str: string = translations[lang][key] as string;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  }, [lang]);

  const getCategoryLabel = useCallback((cat: string): string => {
    const key = CATEGORY_KEYS[cat];
    return key ? (translations[lang][key] as string) : cat;
  }, [lang]);

  const getTypeLabel = useCallback((type: string): string => {
    const key = TYPE_KEYS[type];
    return key ? (translations[lang][key] as string) : type;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL, getCategoryLabel, getTypeLabel }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
