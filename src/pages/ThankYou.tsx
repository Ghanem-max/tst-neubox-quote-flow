
import React from 'react';
import { CheckCircle, Ship, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const { t, isRTL } = useLanguage();
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Header */}
      <header className="maritime-gradient text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
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
        </div>
      </header>

      {/* Thank You Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div className="mb-8">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {t('thankyou.title')}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('thankyou.message')}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-primary">
                    <Ship className="h-5 w-5" />
                    <span className="text-sm font-medium">Professional Service</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">24/7 Support</span>
                  </div>
                </div>
                
                <Link to="/">
                  <Button className="maritime-gradient text-white hover:opacity-90 transition-opacity">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/lovable-uploads/a5467a55-b509-4002-a9d7-27fb79a1469b.png" 
                alt="Neubox Consolidation Logo" 
                className="h-8 w-auto filter brightness-0 invert md:h-10"
              />
              <span className="text-xl font-bold">{t('footer.company')}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {t('footer.tagline')}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ThankYou;
