
import React from 'react';
import { Ship, Globe, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage, LanguageProvider } from '@/hooks/useLanguage';
import { QuoteForm } from '@/components/QuoteForm';
import { Button } from '@/components/ui/button';

const IndexContent: React.FC = () => {
  const { t, isRTL, toggleLanguage } = useLanguage();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Header */}
      <header className="maritime-gradient text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/a5467a55-b509-4002-a9d7-27fb79a1469b.png" 
                alt="Neubox Consolidation Logo" 
                className="h-16 w-auto md:h-20"
              />
              <div>
                <h1 className="text-2xl font-bold">{t('header.title')}</h1>
                <p className="text-blue-100 text-sm">{t('header.subtitle')}</p>
              </div>
            </div>
            
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <Globe className="h-4 w-4 mr-2" />
              {t('header.toggleLang')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {t('hero.title')}
            </h2>
            
            {/* Company Description */}
            <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-6 leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="flex justify-center items-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{t('hero.feature1')}</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{t('hero.feature2')}</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{t('hero.feature3')}</span>
              </div>
            </div>
          </div>

          {/* Quote Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {t('features.title')}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="maritime-gradient-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Ship className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t('features.global.title')}</h4>
              <p className="text-gray-600">
                {t('features.global.desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="maritime-gradient-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t('features.quotes.title')}</h4>
              <p className="text-gray-600">
                {t('features.quotes.desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="maritime-gradient-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t('features.support.title')}</h4>
              <p className="text-gray-600">
                {t('features.support.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/lovable-uploads/a5467a55-b509-4002-a9d7-27fb79a1469b.png" 
                  alt="Neubox Consolidation Logo" 
                  className="h-10 w-auto filter brightness-0 invert md:h-12"
                />
                <span className="text-xl font-bold">{t('footer.company')}</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t('footer.tagline')}
              </p>
              <p className="text-gray-500 text-sm">
                <strong>{t('footer.disclaimer')}</strong>
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('footer.contact')}</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <a href="mailto:quotation@Neubox.com" className="text-gray-300 hover:text-white transition-colors">
                    quotation@Neubox.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <a href="tel:+201223245666" className="text-gray-300 hover:text-white transition-colors">
                    +20 122 324 5666
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                  <span className="text-gray-300">
                    {t('footer.address')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <IndexContent />
    </LanguageProvider>
  );
};

export default Index;
