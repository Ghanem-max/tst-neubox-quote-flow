import React, { useState } from 'react';
import { Calendar, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { PortSelector } from './PortSelector';
import { PackageTable } from './PackageTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { validateCompanyEmail, calculateTotalCBM, getUserIP } from '@/assets/js/quote';

interface FormData {
  // Shipment details
  pol: string;
  pod: string;
  readyDate: string;
  incoterm: string;
  pickupAddress: string;
  commodity: string;
  packages: Array<{
    id: string;
    length: number;
    width: number;
    height: number;
    qty: number;
  }>;
  grossWeight: number;
  hazardous: boolean;
  customs: boolean;
  attachments: FileList | null;
  
  // Contact details
  company: string;
  contactPerson: string;
  email: string;
  mobile: string;
}

export const QuoteForm: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [quoteResult, setQuoteResult] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    pol: '',
    pod: '',
    readyDate: '',
    incoterm: '',
    pickupAddress: '',
    commodity: '',
    packages: [{
      id: '1',
      length: 0,
      width: 0,
      height: 0,
      qty: 1
    }],
    grossWeight: 0,
    hazardous: false,
    customs: false,
    attachments: null,
    company: '',
    contactPerson: '',
    email: '',
    mobile: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Incoterms that require pickup/delivery address
  const addressRequiredIncoterms = ['EXW', 'FCA', 'DAP', 'DDP'];
  const showPickupAddress = addressRequiredIncoterms.includes(formData.incoterm);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.pol) newErrors.pol = t('form.required');
    if (!formData.pod) newErrors.pod = t('form.required');
    if (!formData.readyDate) newErrors.readyDate = t('form.required');
    if (!formData.incoterm) newErrors.incoterm = t('form.required');
    if (!formData.commodity) newErrors.commodity = t('form.required');
    if (!formData.grossWeight) newErrors.grossWeight = t('form.required');
    if (!formData.company) newErrors.company = t('form.required');
    if (!formData.email) newErrors.email = t('form.required');
    if (!formData.mobile) newErrors.mobile = t('form.required');

    // Email validation
    if (formData.email && !validateCompanyEmail(formData.email)) {
      newErrors.email = 'Please use your company email';
    }

    // Pickup address validation for specific incoterms
    if (showPickupAddress && !formData.pickupAddress) {
      newErrors.pickupAddress = t('form.required');
    }

    // Package validation
    const validPackages = formData.packages.filter(pkg => 
      pkg.length > 0 && pkg.width > 0 && pkg.height > 0 && pkg.qty > 0
    );
    if (validPackages.length === 0) {
      newErrors.packages = t('form.required');
    }

    // Ready date validation (must be future date)
    if (formData.readyDate) {
      const selectedDate = new Date(formData.readyDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.readyDate = 'Ready date must be today or in the future';
      }
    }

    // Mobile number validation (basic format check)
    if (formData.mobile && !formData.mobile.match(/^\+?[\d\s\-\(\)]{10,}$/)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Get user IP
      const userIP = await getUserIP();
      
      // Calculate total CBM
      const totalCBM = calculateTotalCBM(formData.packages);
      
      // Format mobile number to E.164
      const formattedMobile = formData.mobile.startsWith('+') ? formData.mobile : `+${formData.mobile.replace(/\D/g, '')}`;
      
      // Prepare submission data
      const submissionData = {
        ...formData,
        mobile: formattedMobile,
        totalCBM,
        userIP,
        timestamp: new Date().toISOString(),
        attachments: formData.attachments ? Array.from(formData.attachments).map(f => f.name) : []
      };

      // Call the quoting engine
      // const response = await fetch('/api/submit-quote', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(submissionData),
      // });
      
      const response = await fetch('https://script.google.com/macros/s/AKfycby82moPwaALiQ5Mabeakco7Q90AkIeedq9uGTHz1JhJaNiOAuirlGQdsnCz5mQTKM-9/exec', 
        {
          method: 'POST',
          mode: "no-cors", // suppresses CORS error, still sends data
          headers: { 'Content-Type': 'application/json',  },
          body: JSON.stringify(submissionData),
        });

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }

      const result = await response.json();
      
      if (result.quote) {
        setQuoteResult(result.quote.toString());
      }
      
      // Redirect to Thank You page instead of showing inline success
      navigate('/thank-you');
      
    } catch (error) {
      console.error('Submission error:', error);
      // Show error to user - for now just log, could add toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    return formData.pol && 
           formData.pod && 
           formData.readyDate && 
           formData.incoterm && 
           formData.commodity && 
           formData.grossWeight > 0 && 
           formData.company && 
           formData.email && 
           formData.mobile &&
           formData.packages.some(pkg => pkg.length > 0 && pkg.width > 0 && pkg.height > 0 && pkg.qty > 0) &&
           (!showPickupAddress || (showPickupAddress && formData.pickupAddress));
  };

  // Get today's date for min date restriction
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            {t('success.title')}
          </h2>
          {quoteResult ? (
            <p className="text-green-700 mb-4">
              {`Your indicative LCL freight is USD ${quoteResult}, subject to final confirmation.`}
            </p>
          ) : null}
          <p className="text-green-700">
            {t('success.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Shipment Details Section */}
      <Card className="fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            {t('shipment.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Port Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pol" className="text-sm font-medium">
                {t('shipment.pol')} *
              </Label>
              <PortSelector
                value={formData.pol}
                onChange={(port) => updateFormData('pol', port?.code || '')}
                placeholder={t('form.selectPort')}
                className="mt-1"
              />
              {errors.pol && (
                <p className="text-destructive text-sm mt-1">{errors.pol}</p>
              )}
            </div>

            <div>
              <Label htmlFor="pod" className="text-sm font-medium">
                {t('shipment.pod')} *
              </Label>
              <PortSelector
                value={formData.pod}
                onChange={(port) => updateFormData('pod', port?.code || '')}
                placeholder={t('form.selectPort')}
                className="mt-1"
              />
              {errors.pod && (
                <p className="text-destructive text-sm mt-1">{errors.pod}</p>
              )}
            </div>
          </div>

          {/* Ready Date and Incoterm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="readyDate" className="text-sm font-medium">
                {t('shipment.readyDate')} *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="readyDate"
                  type="date"
                  min={getTodayDate()}
                  value={formData.readyDate}
                  onChange={(e) => updateFormData('readyDate', e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                />
                <Calendar className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${
                  isRTL ? 'right-3' : 'left-3'
                }`} />
              </div>
              {errors.readyDate && (
                <p className="text-destructive text-sm mt-1">{errors.readyDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="incoterm" className="text-sm font-medium">
                {t('shipment.incoterm')} *
              </Label>
              <Select value={formData.incoterm} onValueChange={(value) => updateFormData('incoterm', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select incoterm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXW">{t('incoterms.exw')}</SelectItem>
                  <SelectItem value="FCA">{t('incoterms.fca')}</SelectItem>
                  <SelectItem value="FOB">{t('incoterms.fob')}</SelectItem>
                  <SelectItem value="CPT">{t('incoterms.cpt')}</SelectItem>
                  <SelectItem value="CIF">{t('incoterms.cif')}</SelectItem>
                  <SelectItem value="DAP">{t('incoterms.dap')}</SelectItem>
                  <SelectItem value="DDP">{t('incoterms.ddp')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.incoterm && (
                <p className="text-destructive text-sm mt-1">{errors.incoterm}</p>
              )}
            </div>
          </div>

          {/* Conditional Pickup Address */}
          {showPickupAddress && (
            <div className="fade-in">
              <Label htmlFor="pickupAddress" className="text-sm font-medium">
                {t('shipment.pickupAddress')} *
              </Label>
              <Textarea
                id="pickupAddress"
                value={formData.pickupAddress}
                onChange={(e) => updateFormData('pickupAddress', e.target.value)}
                className="mt-1"
                rows={3}
                placeholder="Enter complete address with postal code"
              />
              {errors.pickupAddress && (
                <p className="text-destructive text-sm mt-1">{errors.pickupAddress}</p>
              )}
            </div>
          )}

          {/* Commodity Description */}
          <div>
            <Label htmlFor="commodity" className="text-sm font-medium">
              {t('shipment.commodity')} *
            </Label>
            <Textarea
              id="commodity"
              value={formData.commodity}
              onChange={(e) => updateFormData('commodity', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Describe the goods to be shipped"
            />
            {errors.commodity && (
              <p className="text-destructive text-sm mt-1">{errors.commodity}</p>
            )}
          </div>

          {/* Package Table */}
          <div>
            <Label className="text-sm font-medium mb-4 block">
              {t('shipment.packages')} *
            </Label>
            <PackageTable
              packages={formData.packages}
              onChange={(packages) => updateFormData('packages', packages)}
            />
            {errors.packages && (
              <p className="text-destructive text-sm mt-1">{errors.packages}</p>
            )}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="grossWeight" className="text-sm font-medium">
                {t('shipment.grossWeight')} *
              </Label>
              <Input
                id="grossWeight"
                type="number"
                min="0"
                step="0.1"
                value={formData.grossWeight || ''}
                onChange={(e) => updateFormData('grossWeight', parseFloat(e.target.value) || 0)}
                className="mt-1"
                placeholder="0"
              />
              {errors.grossWeight && (
                <p className="text-destructive text-sm mt-1">{errors.grossWeight}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hazardous" className="text-sm font-medium">
                {t('shipment.hazardous')}
              </Label>
              <Select value={formData.hazardous.toString()} onValueChange={(value) => updateFormData('hazardous', value === 'true')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">{t('options.no')}</SelectItem>
                  <SelectItem value="true">{t('options.yes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customs" className="text-sm font-medium">
                {t('shipment.customs')}
              </Label>
              <Select value={formData.customs.toString()} onValueChange={(value) => updateFormData('customs', value === 'true')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">{t('options.no')}</SelectItem>
                  <SelectItem value="true">{t('options.yes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label htmlFor="attachments" className="text-sm font-medium">
              {t('shipment.attachments')}
            </Label>
            <div className="mt-1 flex items-center gap-4">
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={(e) => updateFormData('attachments', e.target.files)}
                className="flex-1"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, JPG, PNG, XLS files only. Max 10MB per file.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Contact Information Section */}
      <Card className="fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            {t('contact.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="text-sm font-medium">
                {t('contact.company')} *
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                className="mt-1"
                placeholder="Company name"
              />
              {errors.company && (
                <p className="text-destructive text-sm mt-1">{errors.company}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactPerson" className="text-sm font-medium">
                {t('contact.person')}
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => updateFormData('contactPerson', e.target.value)}
                className="mt-1"
                placeholder="Contact person name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                {t('contact.email')} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="mt-1"
                placeholder="work@company.com"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile" className="text-sm font-medium">
                {t('contact.mobile')} *
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => updateFormData('mobile', e.target.value)}
                className="mt-1"
                placeholder="+971-50-123-4567"
              />
              {errors.mobile && (
                <p className="text-destructive text-sm mt-1">{errors.mobile}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="text-center">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !isFormValid()}
          className="px-12 py-3 text-lg font-semibold maritime-gradient hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? t('form.submitting') : t('form.submit')}
        </Button>
      </div>
    </form>
  );
};
