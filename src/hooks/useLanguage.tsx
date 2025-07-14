
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
    
    // Hero Content
    'hero.title': 'Professional LCL Freight Solutions',
    'hero.description': 'Neubox Consolidation is a modern freight solutions provider based in Egypt, specializing in Less-than-Container Load (LCL) shipments. With a focus on efficiency, transparency, and global reach, Neubox helps businesses of all sizes move cargo seamlessly across borders.',
    'hero.feature1': '1000+ Ports Worldwide',
    'hero.feature2': 'Instant Quote Engine',
    'hero.feature3': '24/7 Support',
    'features.title': 'Why Choose Neubox Consolidation?',
    'features.subtitle': 'Experience the difference with our advanced LCL consolidation services',
    'features.global.title': 'Global Network',
    'features.global.desc': 'Access to 1000+ seaports worldwide with comprehensive coverage',
    'features.quotes.title': 'Fast Quotes',
    'features.quotes.desc': 'Get instant freight quotes with our automated quoting engine',
    'features.support.title': 'Bilingual Support',
    'features.support.desc': 'Full Arabic and English support for Middle East operations',
    'footer.company': 'Neubox Consolidation',
    'footer.tagline': 'Professional LCL freight consolidation services worldwide',
    'footer.disclaimer': 'Disclaimer: Neubox Consolidation provides shipping estimates based on the information provided. Final rates may vary.',
    'footer.contact': 'Contact Us',
    'footer.address': '41 Almoltaka Alarabi, Heliopolis, Cairo, Egypt',
    'footer.copyright': '© 2025 Neubox Consolidation. All rights reserved.',
    'thankyou.title': 'Thanks for getting in touch.',
    'thankyou.message': 'Your request has been received. Our team is reviewing the details and will contact you within 24 business hours.',
    
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
    'header.subtitle': 'طلب عرض سعر شحن جزئي',
    'header.toggleLang': 'English',
    
    // Hero Content
    'hero.title': 'حلول الشحن الجزئي الاحترافية',
    'hero.description': 'نيوبوكس للشحن هو مزود حديث لحلول الشحن مقره مصر، متخصص في شحنات أقل من حمولة الحاوية (LCL). مع التركيز على الكفاءة والشفافية والوصول العالمي، تساعد نيوبوكس الشركات من جميع الأحجام على نقل البضائع بسلاسة عبر الحدود.',
    'hero.feature1': 'أكثر من 1000 ميناء عالمياً',
    'hero.feature2': 'محرك عروض أسعار فوري',
    'hero.feature3': 'دعم على مدار الساعة',
    'features.title': 'لماذا تختار نيوبوكس للشحن؟',
    'features.subtitle': 'اختبر الفرق مع خدمات الشحن الجزئي المتقدمة لدينا',
    'features.global.title': 'شبكة عالمية',
    'features.global.desc': 'الوصول إلى أكثر من 1000 ميناء بحري في جميع أنحاء العالم مع تغطية شاملة',
    'features.quotes.title': 'عروض أسعار سريعة',
    'features.quotes.desc': 'احصل على عروض أسعار الشحن الفورية مع محرك التسعير الآلي لدينا',
    'features.support.title': 'دعم ثنائي اللغة',
    'features.support.desc': 'دعم كامل باللغتين العربية والإنجليزية لعمليات الشرق الأوسط',
    'footer.company': 'نيوبوكس للشحن',
    'footer.tagline': 'خدمات شحن جزئي احترافية في جميع أنحاء العالم',
    'footer.disclaimer': 'إخلاء المسؤولية: تقدم نيوبوكس للشحن تقديرات الشحن بناءً على المعلومات المقدمة. قد تختلف الأسعار النهائية.',
    'footer.contact': 'اتصل بنا',
    'footer.address': '41 ب المتلقى العربي, هليوبوليس, القاهرة, مصر',
    'footer.copyright': '© 2025 نيوبوكس للشحن. جميع الحقوق محفوظة.',
    'thankyou.title': 'شكراً لتواصلك معنا.',
    'thankyou.message': 'تم استلام طلبك. فريقنا يراجع التفاصيل وسيتواصل معك خلال 24 ساعة عمل.',
    
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
