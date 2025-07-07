
import React from 'react';
import { Ship, Globe, ArrowRight } from 'lucide-react';
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
              <div className="bg-white/20 p-2 rounded-lg">
                <Ship className="h-8 w-8" />
              </div>
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
              Professional LCL Freight Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get instant quotes for your Less-than-Container-Load shipments with our advanced quoting engine. 
              Fast, reliable, and competitive rates worldwide.
            </p>
            <div className="flex justify-center items-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">1000+ Ports Worldwide</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Instant Quote Engine</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">24/7 Support</span>
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
              Why Choose Neubox Consolidation?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our advanced LCL consolidation services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="maritime-gradient-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Ship className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Global Network</h4>
              <p className="text-gray-600">
                Access to 1000+ seaports worldwide with comprehensive coverage
              </p>
            </div>

            <div className="text-center p-6">
              <div className="maritime-gradient-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Fast Quotes</h4>
              <p className="text-gray-600">
                Get instant freight quotes with our automated quoting engine
              </p>
            </div>

            <div className="text-center p-6">
              <div className="maritime-gradient-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Bilingual Support</h4>
              <p className="text-gray-600">
                Full Arabic and English support for Middle East operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Ship className="h-6 w-6" />
              <span className="text-xl font-bold">Neubox Consolidation</span>
            </div>
            <p className="text-gray-400 text-sm">
              Professional LCL freight consolidation services worldwide
            </p>
            <p className="text-gray-400 text-xs mt-2">
              © 2024 Neubox Consolidation. All rights reserved.
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
