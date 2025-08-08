import React, { useState } from 'react';
import { Calendar, Upload, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

    // File validation
    if (formData.attachments && !validateFileUpload(formData.attachments)) {
      newErrors.attachments = 'Invalid file type or size. Please upload PDF, DOC, JPG, PNG, or XLS files under 10MB.';
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
      
      const response = await fetch('https://script.google.com/macros/s/AKfycbyUf8P3CNC2oYhZsoTSNf2-Qx401iwbxUBgsKzRR33FkPrwiercQVOMzIN4lCAxIWEn/exec', 
        {
          method: 'POST',
          // mode: "no-cors", // suppresses CORS error, still sends data
          headers: { 'Content-Type': 'application/json',  },
          //body: JSON.stringify(submissionData),
          body: `data=${encodeURIComponent(JSON.stringify(submissionData))}`,
        });

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }

      // Since we're using no-cors mode, we can't read the response
      // but if we reach here without throwing, consider it successful
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Submission error:', error);
      // Show error to user - for now just log, could add toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    // Sanitize text inputs to prevent XSS
    const textFields = ['commodity', 'pickupAddress', 'company', 'contactPerson'];
    let sanitizedValue = value;
    
    if (textFields.includes(field) && typeof value === 'string') {
      sanitizedValue = DOMPurify.sanitize(value, { 
        ALLOWED_TAGS: [], 
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true 
      });
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Enhanced file validation
  const validateFileUpload = (files: FileList | null): boolean => {
    if (!files || files.length === 0) return true;
    
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return false;
      }
      
      // Check file size
      if (file.size > maxSize) {
        return false;
      }
    }
    
    return true;
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
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Thanks for getting in touch.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Your request has been received. Our team is reviewing the details and will contact you within 24 business hours.
            </p>
          </div>
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
                onChange={(e) => {
                  if (validateFileUpload(e.target.files)) {
                    updateFormData('attachments', e.target.files);
                  } else {
                    // Clear the input if validation fails
                    e.target.value = '';
                    setErrors(prev => ({ 
                      ...prev, 
                      attachments: 'Invalid file type or size. Please upload PDF, DOC, JPG, PNG, or XLS files under 10MB.' 
                    }));
                  }
                }}
                className="flex-1"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, JPG, PNG, XLS files only. Max 10MB per file.
            </p>
            {errors.attachments && (
              <p className="text-destructive text-sm mt-1">{errors.attachments}</p>
            )}
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
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? t('form.submitting') : t('form.submit')}
        </Button>
      </div>
    </form>
  );
};
