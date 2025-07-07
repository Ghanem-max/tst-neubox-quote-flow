
import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.title': 'Neubox Consolidation',
    'header.subtitle': 'LCL Freight Quote Request',
    'header.toggleLang': 'إلى العربية',
    
    // Shipment Section
    'shipment.title': 'Shipment Details',
    'shipment.pol': 'Port of Loading',
    'shipment.pod': 'Port of Discharge',
    'shipment.readyDate': 'Ready Date',
    'shipment.incoterm': 'Incoterm',
    'shipment.pickupAddress': 'Pickup/Delivery Address',
    'shipment.commodity': 'Commodity Description',
    'shipment.packages': 'Package Details',
    'shipment.grossWeight': 'Gross Weight (kg)',
    'shipment.hazardous': 'Hazardous Cargo?',
    'shipment.customs': 'Customs Clearance Required?',
    'shipment.attachments': 'Attachments (Optional)',
    
    // Package Table
    'packages.length': 'Length (cm)',
    'packages.width': 'Width (cm)',
    'packages.height': 'Height (cm)',
    'packages.qty': 'Qty',
    'packages.cbm': 'CBM',
    'packages.addRow': 'Add Package',
    'packages.removeRow': 'Remove',
    'packages.totalCbm': 'Total CBM',
    
    // Contact Section
    'contact.title': 'Contact Information',
    'contact.company': 'Company Name',
    'contact.person': 'Contact Person',
    'contact.email': 'Work Email',
    'contact.mobile': 'Mobile Number',
    
    // Form
    'form.submit': 'Get Quote',
    'form.submitting': 'Processing...',
    'form.required': 'This field is required',
    'form.invalidEmail': 'Please use your company email',
    'form.searchPort': 'Search ports...',
    'form.selectPort': 'Select port',
    
    // Messages
    'success.title': 'Thank you!',
    'success.message': 'We\'ll revert to you shortly.',
    'success.withQuote': 'Your indicative LCL freight is USD {{amount}}, subject to final confirmation.',
    'error.general': 'Something went wrong. Please try again.',
    
    // Options
    'options.yes': 'Yes',
    'options.no': 'No',
    'incoterms.exw': 'EXW - Ex Works',
    'incoterms.fca': 'FCA - Free Carrier',
    'incoterms.fob': 'FOB - Free on Board',
    'incoterms.cpt': 'CPT - Carriage Paid To',
    'incoterms.cif': 'CIF - Cost Insurance Freight',
    'incoterms.dap': 'DAP - Delivered at Place',
    'incoterms.ddp': 'DDP - Delivered Duty Paid'
  },
  ar: {
    // Header
    'header.title': 'نيوبوكس للشحن',
    'header.subtitle': 'طلب عرض سعر شحن جماعي',
    'header.toggleLang': 'English',
    
    // Shipment Section
    'shipment.title': 'تفاصيل الشحنة',
    'shipment.pol': 'ميناء التحميل',
    'shipment.pod': 'ميناء التفريغ',
    'shipment.readyDate': 'تاريخ الاستعداد',
    'shipment.incoterm': 'شروط التسليم',
    'shipment.pickupAddress': 'عنوان الاستلام/التسليم',
    'shipment.commodity': 'وصف البضاعة',
    'shipment.packages': 'تفاصيل الطرود',
    'shipment.grossWeight': 'الوزن الإجمالي (كغ)',
    'shipment.hazardous': 'بضائع خطرة؟',
    'shipment.customs': 'مطلوب تخليص جمركي؟',
    'shipment.attachments': 'مرفقات (اختياري)',
    
    // Package Table
    'packages.length': 'الطول (سم)',
    'packages.width': 'العرض (سم)',
    'packages.height': 'الارتفاع (سم)',
    'packages.qty': 'الكمية',
    'packages.cbm': 'متر مكعب',
    'packages.addRow': 'إضافة طرد',
    'packages.removeRow': 'حذف',
    'packages.totalCbm': 'إجمالي الأمتار المكعبة',
    
    // Contact Section
    'contact.title': 'معلومات الاتصال',
    'contact.company': 'اسم الشركة',
    'contact.person': 'الشخص المسؤول',
    'contact.email': 'البريد الإلكتروني للعمل',
    'contact.mobile': 'رقم الهاتف المحمول',
    
    // Form
    'form.submit': 'احصل على عرض سعر',
    'form.submitting': 'جاري المعالجة...',
    'form.required': 'هذا الحقل مطلوب',
    'form.invalidEmail': 'يرجى استخدام البريد الإلكتروني للشركة',
    'form.searchPort': 'البحث عن الموانئ...',
    'form.selectPort': 'اختر الميناء',
    
    // Messages
    'success.title': 'شكراً لك!',
    'success.message': 'سيتواصل معك فريق التسعير قريباً.',
    'success.withQuote': 'سعر الشحن الاسترشادي هو {{amount}} دولار أمريكي، وذلك خاضع للتأكيد النهائي.',
    'error.general': 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    
    // Options
    'options.yes': 'نعم',
    'options.no': 'لا',
    'incoterms.exw': 'EXW - تسليم في المصنع',
    'incoterms.fca': 'FCA - تسليم حر للناقل',
    'incoterms.fob': 'FOB - تسليم حر على الباخرة',
    'incoterms.cpt': 'CPT - النقل مدفوع إلى',
    'incoterms.cif': 'CIF - التكلفة والتأمين والشحن',
    'incoterms.dap': 'DAP - تسليم في المكان',
    'incoterms.ddp': 'DDP - تسليم بالرسوم مدفوعة'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    
    // Update document direction and lang attributes
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }, [language]);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    let translation = translations[language][key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{{${paramKey}}}`, value);
      });
    }
    
    return translation;
  }, [language]);

  const value = {
    language,
    isRTL: language === 'ar',
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
