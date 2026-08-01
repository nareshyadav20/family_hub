import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  ArrowLeft, Globe, User, MapPin, CheckCircle, 
  Clock, Server, Save, Info, AlertCircle, RefreshCw, ChevronDown, Check, ChevronRight,
  CreditCard, Calendar as CalendarIcon, Hash, Link,
  Upload, FileText, Send, Mail, PlayCircle, ShieldCheck, Download, Copy, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import useDomainStore from '../store/useDomainStore';

const schema = z.object({
  // Family Details
  familyName: z.string().min(1, 'Family Name is required'),
  familyCode: z.string().optional(),
  familyHead: z.string().min(1, 'Family Head is required'),
  adminName: z.string().min(1, 'Admin Name is required'),
  adminMobile: z.string().min(1, 'Admin Mobile is required'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  
  // Domain Management Option
  domainOption: z.enum(['OPTION_1', 'OPTION_2']).default('OPTION_1'),

  // Option 1 Fields
  rootDomain: z.string().optional(),
  currentRegistrar: z.string().optional(),
  domainExpiryDate: z.string().optional(),
  currentNameservers: z.string().optional(),
  hostingProvider: z.string().optional(),
  currentWebsite: z.string().optional(),
  
  // Ownership
  confirmOwnership: z.boolean().optional(),
  ownershipProof: z.any().optional(),
  registrantName: z.string().optional(),
  registrantEmail: z.string().optional(),
  techContactName: z.string().optional(),
  techContactEmail: z.string().optional(),
  techContactMobile: z.string().optional(),

  // DNS
  dnsAccessAvailable: z.enum(['Yes', 'No', 'Need Help']).optional(),
  registrarUsername: z.string().optional(),
  registrarEmail: z.string().optional(),
  dnsNotes: z.string().optional(),

  // Migration
  existingWebsiteType: z.enum(['No Website', 'Static Website', 'WordPress', 'React', 'NextJS', 'Custom', 'Other']).optional(),
  migrationRequired: z.enum(['Yes', 'No']).optional(),
  migrationPriority: z.enum(['Low', 'Medium', 'High']).optional(),
  expectedGoLiveDate: z.string().optional(),

  specialInstructions: z.string().optional(),
  
  // Option 2 Fields
  preferredDomain: z.string().optional(),
  alternativeDomain1: z.string().optional(),
  alternativeDomain2: z.string().optional(),
  preferredExtension: z.string().optional(),
  registrationPeriod: z.string().optional(),
  purchaseAccount: z.string().optional(),
  autoRenew: z.boolean().optional(),
  billingEmail: z.string().optional(),
  billingPhone: z.string().optional(),
  internalNotes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.domainOption === 'OPTION_1') {
    if (!data.rootDomain) {
      ctx.addIssue({ path: ['rootDomain'], message: 'Root Domain is required', code: z.ZodIssueCode.custom });
    }
    if (!data.currentRegistrar) {
      ctx.addIssue({ path: ['currentRegistrar'], message: 'Registrar is required', code: z.ZodIssueCode.custom });
    }
    if (!data.hostingProvider) {
      ctx.addIssue({ path: ['hostingProvider'], message: 'Hosting Provider is required', code: z.ZodIssueCode.custom });
    }
    if (!data.confirmOwnership) {
      ctx.addIssue({ path: ['confirmOwnership'], message: 'Domain ownership confirmation is required', code: z.ZodIssueCode.custom });
    }
    if (!data.techContactMobile) {
      ctx.addIssue({ path: ['techContactMobile'], message: 'Technical Contact Phone is required', code: z.ZodIssueCode.custom });
    }
    if (!data.dnsAccessAvailable) {
      ctx.addIssue({ path: ['dnsAccessAvailable'], message: 'Please select if family can access DNS', code: z.ZodIssueCode.custom });
    }
    if (!data.migrationRequired) {
      ctx.addIssue({ path: ['migrationRequired'], message: 'Please select if migration is required', code: z.ZodIssueCode.custom });
    }
  } else if (data.domainOption === 'OPTION_2') {
    if (!data.preferredDomain) {
      ctx.addIssue({ path: ['preferredDomain'], message: 'Preferred Domain is required', code: z.ZodIssueCode.custom });
    }
    if (!data.preferredExtension) {
      ctx.addIssue({ path: ['preferredExtension'], message: 'Preferred Extension is required', code: z.ZodIssueCode.custom });
    }
    if (!data.alternativeDomain1) {
      ctx.addIssue({ path: ['alternativeDomain1'], message: 'Alternative Domain 1 is required', code: z.ZodIssueCode.custom });
    }
    if (!data.alternativeDomain2) {
      ctx.addIssue({ path: ['alternativeDomain2'], message: 'Alternative Domain 2 is required', code: z.ZodIssueCode.custom });
    }
    if (!data.registrationPeriod) {
      ctx.addIssue({ path: ['registrationPeriod'], message: 'Registration Period is required', code: z.ZodIssueCode.custom });
    }
    if (!data.purchaseAccount) {
      ctx.addIssue({ path: ['purchaseAccount'], message: 'Purchase Account is required', code: z.ZodIssueCode.custom });
    }
    if (!data.billingEmail) {
      ctx.addIssue({ path: ['billingEmail'], message: 'Billing Email is required', code: z.ZodIssueCode.custom });
    }
    if (!data.billingPhone) {
      ctx.addIssue({ path: ['billingPhone'], message: 'Billing Phone is required', code: z.ZodIssueCode.custom });
    }
  }
});

export default function CreateFamily() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const initialOption = queryParams.get('domainOption') === 'OPTION_2' ? 'OPTION_2' : 'OPTION_1';
  
  const { familyId, domainId, domainStatus, setFamilyAndDomain, setDomainStatus } = useDomainStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      domainOption: initialOption,
      dnsAccessAvailable: 'Yes',
      existingWebsiteType: 'No Website',
      migrationPriority: 'Medium',
      autoRenew: true,
      preferredExtension: '.com',
      registrationPeriod: '1 Year',
      purchaseAccount: 'FamilyHub Business Account'
    }
  });

  const watchAllFields = watch();
  const domainOption = watch('domainOption');

  const [actionLoading, setActionLoading] = useState({});

  const handleDevopsAction = async (endpoint) => {
    if (!domainId) {
      toast.error('No Domain ID found! Please create a family first.');
      return;
    }
    setActionLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await axios.put(`http://localhost:5000/api/v1/new-domains/devops/${endpoint}`, { domainId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(`Successfully executed: ${endpoint.replace(/-/g, ' ').toUpperCase()}`);
        if (response.data.data?.domainStatus) {
          setDomainStatus(response.data.data.domainStatus);
        }
      } else {
        toast.error(response.data.message || `Failed to execute ${endpoint}`);
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message;
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  useEffect(() => {
    if (domainId) {
      const fetchStatus = async () => {
        try {
          const token = localStorage.getItem('superadmin_token');
          const response = await axios.get(`http://localhost:5000/api/v1/domains/status/${domainId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success && response.data.data?.domainStatus) {
            setDomainStatus(response.data.data.domainStatus);
          }
        } catch (e) {
          console.error('Failed to fetch domain status', e);
        }
      };
      fetchStatus();
    }
  }, [domainId, setDomainStatus]);


  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const nameParts = (data.adminName || '').trim().split(' ');
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      let rawDomain = data.domainOption === 'OPTION_1' ? data.rootDomain : data.preferredDomain;
      if (data.domainOption === 'OPTION_2' && rawDomain && !rawDomain.includes('.')) {
        rawDomain = `${rawDomain}${data.preferredExtension || '.com'}`;
      }

      const rootDomain = (rawDomain || '').replace(/^(https?:\/\/)?(www\.)?/, '').trim();

      let cleanPhone = data.adminMobile ? data.adminMobile.replace(/[^\d+]/g, '') : undefined;
      if (cleanPhone && cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }


      const payload = {
        familyName: data.familyName || "Unnamed Family",
        admin: {
          firstName: firstName || "Admin",
          lastName: lastName || "User",
          email: data.adminEmail || "admin@example.com",
          password: data.adminPassword || data.password || "Password123!",
          phone: cleanPhone || undefined
        },
        domain: {
          rootDomain: rootDomain || "example.com",
          ownershipType: data.domainOption === 'OPTION_1' ? 'FAMILY_OWNED' : 'MANAGED_BY_FAMILYHUB',
          registrar: data.currentRegistrar || undefined,
          registrationYears: parseInt(data.registrationPeriod) || 1
        },
        contacts: {
          owner: {
            name: data.registrantName || data.adminName || "Admin User",
            email: data.adminEmail || "admin@example.com",
            phone: cleanPhone || undefined
          }
        }
      };

      const token = localStorage.getItem('superadmin_token');
      const response = await axios.post('http://localhost:5000/api/v1/families', payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });

      if (response.data.success) {
        toast.success('Family and Custom Domain onboarding created successfully!');
        setFamilyAndDomain(response.data.familyId, response.data.domainId);
        // Do not navigate immediately so the user can use the DevOps Panel
      } else {
        toast.error(response.data.message || 'Error creating family');
      }
    } catch (err) {
      console.error('Create Family Error:', err);
      let errorText = err.response?.data?.message || 'Error creating family';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const firstErr = err.response.data.errors[0];
        if (typeof firstErr === 'string') {
          errorText = firstErr;
        } else if (firstErr && firstErr.message) {
          errorText = firstErr.message;
        }
      }
      toast.error(errorText);
    } finally {
      setSubmitting(false);
    }
  };

  const workflowStepsOption2 = [
    { label: 'Request Submitted', desc: 'Domain request captured.', updatedBy: '-', date: '-' },
    { label: 'Domain Purchased', desc: 'DevOps purchases domain.', updatedBy: '-', date: '-' },
    { label: 'DNS Configuration', desc: 'Internal DNS mapping.', updatedBy: '-', date: '-' },
    { label: 'SSL Certificate', desc: 'Generating secure certificate.', updatedBy: '-', date: '-' },
    { label: 'Website Live', desc: 'Website is fully accessible.', updatedBy: '-', date: '-' }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900/50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-[1500px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/families')}
            className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Family</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure family details and domain onboarding workflow.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto flex flex-col xl:flex-row gap-8">
        
        {/* Left Column - Form */}
        <div className="flex-1 space-y-8">
          
          <form id="create-family-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <input type="hidden" {...register('domainOption')} value={initialOption} />
            
            {/* Section 0: Family Details (Required Context) */}
            {/* Section 0: Family Details (Required Context) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(124,58,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Family Name <span className="text-red-500 ml-0.5">*</span></label>
                    <input {...register('familyName')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.familyName ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="e.g. Smith Family" />
                    {errors.familyName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.familyName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Family Head <span className="text-red-500 ml-0.5">*</span></label>
                    <input {...register('familyHead')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.familyHead ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="Name of family head" />
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Admin Account</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Name <span className="text-red-500 ml-0.5">*</span></label>
                    <input {...register('adminName')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.adminName ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Mobile <span className="text-red-500 ml-0.5">*</span></label>
                    <input {...register('adminMobile')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.adminMobile ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="+1 (555) 000-0000" />
                    {errors.adminMobile && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.adminMobile.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Email <span className="text-red-500 ml-0.5">*</span></label>
                    <input type="email" {...register('adminEmail')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.adminEmail ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="admin@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Password <span className="text-red-500 ml-0.5">*</span></label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        autoComplete="new-password"
                        {...register('adminPassword')} 
                        className={`w-full pl-4 pr-11 py-2.5 rounded-xl border ${errors.adminPassword ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {errors.adminPassword && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.adminPassword.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* DOMAIN MANAGEMENT SUPER CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(124,58,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden relative">
              
              <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-start gap-4 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900">
                <div className="p-3 bg-purple-100 dark:bg-blue-900/40 rounded-xl shadow-sm">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Domain Management</h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Select how the family's root domain will be managed.
                  </p>
                </div>
              </div>
              
              <div className="p-8">
                <div className="mb-8">
                  {domainOption === 'OPTION_1' ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-blue-900/10 dark:border-blue-800">
                      <div className="p-2 bg-purple-100 dark:bg-blue-900/40 rounded-lg">
                        <Globe className="w-5 h-5 text-purple-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Family Already Owns a Domain</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Our technical team will verify ownership and provide DNS instructions.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-indigo-900/10 dark:border-indigo-800">
                      <div className="p-2 bg-purple-100 dark:bg-indigo-900/40 rounded-lg">
                        <Server className="w-5 h-5 text-purple-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">FamilyHub Purchases the Domain</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">FamilyHub technical team will purchase, configure and activate the domain.</p>
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  
                  {/* OPTION 1 CONTENT */}
                  {domainOption === 'OPTION_1' && (
                    <motion.div
                      key="opt1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-10 overflow-hidden"
                    >
                      
                      <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-500" /> Domain Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Root Domain <span className="text-red-500 ml-0.5">*</span></label>
                            <input {...register('rootDomain')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.rootDomain ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="Example: panga.com" />
                            {errors.rootDomain && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.rootDomain.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Current Website <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <input type="url" {...register('currentWebsite')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Example: https://panga.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Current Domain Registrar <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <select {...register('currentRegistrar')} className={`appearance-none w-full px-4 py-2.5 rounded-xl border ${errors.currentRegistrar ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`}>
                                <option value="">Select Registrar</option>
                                <option value="GoDaddy">GoDaddy</option>
                                <option value="Cloudflare">Cloudflare</option>
                                <option value="Hostinger">Hostinger</option>
                                <option value="Namecheap">Namecheap</option>
                                <option value="BigRock">BigRock</option>
                                <option value="Route53">AWS Route53</option>
                                <option value="Other">Other</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                            {errors.currentRegistrar && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.currentRegistrar.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Domain Expiry Date</label>
                            <input type="date" {...register('domainExpiryDate')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Current Nameservers</label>
                            <textarea {...register('currentNameservers')} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all resize-none" placeholder="ns01.domaincontrol.com&#10;ns02.domaincontrol.com"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Current Hosting Provider <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <select {...register('hostingProvider')} className={`appearance-none w-full px-4 py-2.5 rounded-xl border ${errors.hostingProvider ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`}>
                                <option value="">Select Provider</option>
                                <option value="AWS">AWS</option>
                                <option value="Azure">Azure</option>
                                <option value="Google Cloud">Google Cloud</option>
                                <option value="Hostinger">Hostinger</option>
                                <option value="Bluehost">Bluehost</option>
                                <option value="DigitalOcean">DigitalOcean</option>
                                <option value="Render">Render</option>
                                <option value="Vercel">Vercel</option>
                                <option value="Other">Other</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                            {errors.hostingProvider && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.hostingProvider.message}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                           <ShieldCheck className="w-5 h-5 text-purple-500" /> Domain Ownership
                        </h3>
                        <div className="space-y-6">
                           <label className="flex items-start gap-3 cursor-pointer">
                              <div className="flex items-center h-5 mt-0.5">
                                <input type="checkbox" {...register('confirmOwnership')} className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">Family confirms ownership of this domain <span className="text-red-500">*</span></span>
                                <span className="text-xs text-gray-500 mt-0.5">Verify that the family legally owns this domain before proceeding.</span>
                              </div>
                            </label>
                                    <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Upload Domain Ownership Proof <span className="text-red-500">*</span></label>
                               <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                          <p className="text-xs text-gray-400 dark:text-gray-500">Examples: Invoice, Screenshot, WHOIS, Purchase Receipt</p>
                                      </div>
                                      <input type="file" className="hidden" />
                                  </label>
                               </div>
                               {errors.confirmOwnership && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.confirmOwnership.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registrant Name</label>
                                 <input {...register('registrantName')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all" />
                               </div>
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registrant Email</label>
                                 <input type="email" {...register('registrantEmail')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all" />
                               </div>
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Technical Contact Name</label>
                                 <input {...register('techContactName')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all" />
                               </div>
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Technical Contact Email</label>
                                 <input type="email" {...register('techContactEmail')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all" />
                               </div>
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Technical Contact Phone <span className="text-red-500">*</span></label>
                                 <input {...register('techContactMobile')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.techContactMobile ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} />
                                 {errors.techContactMobile && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.techContactMobile.message}</p>}
                               </div>
                            </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Server className="w-5 h-5 text-purple-500"/> DNS Access</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Can Family Access DNS? <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                  <label className={`flex-1 flex items-center gap-3 p-4 cursor-pointer rounded-xl border-2 transition-all ${watchAllFields.dnsAccessAvailable === 'Yes' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-purple-300 bg-white dark:bg-slate-800'}`}>
                                    <input type="radio" value="Yes" {...register('dnsAccessAvailable')} className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600" />
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Yes</span>
                                  </label>
                                  <label className={`flex-1 flex items-center gap-3 p-4 cursor-pointer rounded-xl border-2 transition-all ${watchAllFields.dnsAccessAvailable === 'No' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-purple-300 bg-white dark:bg-slate-800'}`}>
                                    <input type="radio" value="No" {...register('dnsAccessAvailable')} className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600" />
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">No</span>
                                  </label>
                                  <label className={`flex-1 flex items-center gap-3 p-4 cursor-pointer rounded-xl border-2 transition-all ${watchAllFields.dnsAccessAvailable === 'Need Help' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-purple-300 bg-white dark:bg-slate-800'}`}>
                                    <input type="radio" value="Need Help" {...register('dnsAccessAvailable')} className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600" />
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Need Help</span>
                                  </label>
                                </div>
                                {errors.dnsAccessAvailable && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.dnsAccessAvailable.message}</p>}
                            </div>
                            
                            <AnimatePresence mode="wait">
                                {watchAllFields.dnsAccessAvailable === 'Yes' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">DNS Login Available</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registrar Username</label>
                                              <input {...register('registrarUsername')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all" />
                                            </div>
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registrar Email</label>
                                              <input type="email" {...register('registrarEmail')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Notes</label>
                                                <textarea {...register('dnsNotes')} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all resize-none"></textarea>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {(watchAllFields.dnsAccessAvailable === 'No' || watchAllFields.dnsAccessAvailable === 'Need Help') && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-purple-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
                                        <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                                        <p className="text-sm text-purple-800 dark:text-blue-200">FamilyHub DevOps Team will configure DNS after receiving temporary access.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-blue-500"/> Migration Information</h3>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Existing Website</label>
                                <div className="flex flex-wrap gap-3">
                                    {['No Website', 'Static Website', 'WordPress', 'React', 'NextJS', 'Custom', 'Other'].map(type => (
                                        <label key={type} className={`px-4 py-2 rounded-full border cursor-pointer text-sm font-medium transition-all ${watchAllFields.existingWebsiteType === type ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>
                                            <input type="radio" value={type} {...register('existingWebsiteType')} className="hidden" />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Migration Required? <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="flex gap-4">
                                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-all ${watchAllFields.migrationRequired === 'Yes' ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-900/10' : 'border-gray-250 dark:border-slate-700'}`}>
                                        <input type="radio" value="Yes" {...register('migrationRequired')} className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Yes</span>
                                      </label>
                                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-all ${watchAllFields.migrationRequired === 'No' ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-900/10' : 'border-gray-250 dark:border-slate-700'}`}>
                                        <input type="radio" value="No" {...register('migrationRequired')} className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">No</span>
                                      </label>
                                    </div>
                                    {errors.migrationRequired && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.migrationRequired.message}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Migration Priority</label>
                                    <div className="relative">
                                      <select {...register('migrationPriority')} className="appearance-none w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all text-sm">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                      </select>
                                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Expected Go Live Date</label>
                                    <input type="date" {...register('expectedGoLiveDate')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all text-gray-600 dark:text-gray-300 text-sm" />
                                </div>
                            </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Notes</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Special Instructions</label>
                          <textarea {...register('specialInstructions')} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all resize-none" placeholder="Example: The family website is currently hosted on GoDaddy. DNS changes must be scheduled after 8 PM."></textarea>
                        </div>
                      </div>
                      
                      {Object.keys(errors).length > 0 && (
                        <div className="text-red-500 text-sm font-semibold flex justify-center mb-4">
                          Form has errors: {Object.keys(errors).join(', ')}
                        </div>
                      )}
                      {/* Centered Actions */}
                      <div className="flex justify-center items-center gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => navigate('/families')}
                          className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          onClick={handleSubmit(onSubmit, (err) => console.log("Form Validation Errors:", err))}
                          disabled={submitting}
                          className="px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
                        >
                          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Create Family
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* OPTION 2 CONTENT */}
                  {domainOption === 'OPTION_2' && (
                    <motion.div
                      key="opt2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-10 overflow-hidden"
                    >
                      <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-start gap-3 p-4 mb-8 rounded-xl bg-purple-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-purple-900 dark:text-blue-200 leading-relaxed">
                            <p className="font-bold mb-1">Information Box</p>
                            <p>FamilyHub DevOps will purchase the domain. After purchase the system will guide DNS setup. SSL will be generated after DNS verification.</p>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-gray-200 dark:bg-slate-700"></span>
                          Section 1: Domain Preferences
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Preferred Domain <span className="text-red-500 ml-0.5">*</span></label>
                            <input {...register('preferredDomain')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.preferredDomain ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="e.g. panga.com" />
                            {errors.preferredDomain && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.preferredDomain.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Preferred Extension <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <select {...register('preferredExtension')} className={`appearance-none w-full px-4 py-2.5 rounded-xl border ${errors.preferredExtension ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`}>
                                <option value=".com">.com</option>
                                <option value=".in">.in</option>
                                <option value=".org">.org</option>
                                <option value=".family">.family</option>
                                <option value=".net">.net</option>
                                <option value=".co">.co</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                            {errors.preferredExtension && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.preferredExtension.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Alternative Domain 1 <span className="text-red-500">*</span></label>
                            <input {...register('alternativeDomain1')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.alternativeDomain1 ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="e.g. panga-family.com" />
                            {errors.alternativeDomain1 && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.alternativeDomain1.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Alternative Domain 2 <span className="text-red-500">*</span></label>
                            <input {...register('alternativeDomain2')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.alternativeDomain2 ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="e.g. thepangas.com" />
                            {errors.alternativeDomain2 && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.alternativeDomain2.message}</p>}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-gray-200 dark:bg-slate-700"></span>
                          Section 2: Purchase Configuration
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registration Period <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <select {...register('registrationPeriod')} className={`appearance-none w-full px-4 py-2.5 rounded-xl border ${errors.registrationPeriod ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`}>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="5 Years">5 Years</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                            {errors.registrationPeriod && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.registrationPeriod.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Purchase Account <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <select {...register('purchaseAccount')} className={`appearance-none w-full px-4 py-2.5 rounded-xl border ${errors.purchaseAccount ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`}>
                                <option value="FamilyHub Business Account">FamilyHub Business Account</option>
                                <option value="Customer Account">Customer Account</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                            {errors.purchaseAccount && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.purchaseAccount.message}</p>}
                          </div>
                          <div className="md:col-span-2 pt-2">
                            <label className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">Auto Renew</span>
                                <span className="text-sm text-gray-500 mt-0.5">Automatically renew this domain before expiration.</span>
                              </div>
                              <div className="relative inline-block w-12 h-6 rounded-full">
                                <input type="checkbox" {...register('autoRenew')} className="peer sr-only" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </div>
                            </label>
                          </div>
                          <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Billing Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Billing Email <span className="text-red-500">*</span></label>
                                <input type="email" {...register('billingEmail')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.billingEmail ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="billing@example.com" />
                                {errors.billingEmail && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.billingEmail.message}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Billing Phone <span className="text-red-500">*</span></label>
                                <input {...register('billingPhone')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.billingPhone ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="+1 (555) 000-0000" />
                                {errors.billingPhone && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.billingPhone.message}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-gray-200 dark:bg-slate-700"></span>
                          Section 3: Notes
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Internal Notes</label>
                          <textarea {...register('internalNotes')} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white dark:bg-slate-800 outline-none transition-all resize-none" placeholder="Any internal instructions for DevOps..."></textarea>
                        </div>
                      </div>
                      
                      {Object.keys(errors).length > 0 && (
                        <div className="text-red-500 text-sm font-semibold flex justify-center mb-4">
                          Form has errors: {Object.keys(errors).join(', ')}
                        </div>
                      )}
                      {/* Centered Actions */}
                      <div className="flex justify-center items-center gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => navigate('/families')}
                          className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          onClick={handleSubmit(onSubmit, (err) => console.log("Form Validation Errors:", err))}
                          disabled={submitting}
                          className="px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
                        >
                          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Create Family
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="w-full xl:w-[420px] space-y-6">
          <div className="sticky top-8 space-y-6">
            
            {/* DEVOPS ACTION PANEL */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(124,58,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" /> DevOps Action Panel
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <button 
                  type="button" 
                  title={!domainId ? "Complete Family Creation first" : domainStatus !== 'PENDING_SETUP' ? `Domain is in ${domainStatus} state` : "Send DNS Instructions"}
                  disabled={!domainId || domainStatus !== 'PENDING_SETUP' || actionLoading["send-dns"]}
                  onClick={() => handleDevopsAction("send-dns")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 dark:bg-slate-850 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700/50 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading["send-dns"] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4"/>}
                  <span>Send DNS Instructions</span>
                </button>
                <button 
                  type="button" 
                  title={!domainId ? "Complete Family Creation first" : "Generate verification email"}
                  disabled={!domainId || actionLoading["gen-verify-email"]}
                  onClick={() => handleDevopsAction("gen-verify-email")} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 dark:bg-slate-850 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700/50 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading["gen-verify-email"] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4"/>}
                  <span>Gen Verify Email</span>
                </button>
                <button 
                  type="button" 
                  title={!domainId ? "Complete Family Creation first" : (domainStatus !== 'PENDING_SETUP' && domainStatus !== 'DNS_INSTRUCTIONS_SENT') ? `Cannot mark DNS configured in ${domainStatus} state` : "Mark DNS Configured"}
                  disabled={!domainId || (domainStatus !== 'PENDING_SETUP' && domainStatus !== 'DNS_INSTRUCTIONS_SENT') || actionLoading["mark-dns-configured"]}
                  onClick={() => handleDevopsAction("mark-dns-configured")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 dark:bg-slate-850 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700/50 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading["mark-dns-configured"] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4"/>}
                  <span>Mark DNS Configured</span>
                </button>
                <button 
                  type="button" 
                  title={!domainId ? "Complete Family Creation first" : domainStatus !== 'DNS_CONFIGURED' ? "DNS must be configured first" : "Generate SSL"}
                  disabled={!domainId || domainStatus !== 'DNS_CONFIGURED' || actionLoading["generate-ssl"]}
                  onClick={() => handleDevopsAction("generate-ssl")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 dark:bg-slate-850 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700/50 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading["generate-ssl"] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4"/>}
                  <span>Generate SSL</span>
                </button>
                <button 
                  type="button" 
                  title={!domainId ? "Complete Family Creation first" : domainStatus !== 'SSL_ENABLED' ? "SSL must be enabled first" : "Mark Website Live"}
                  disabled={!domainId || domainStatus !== 'SSL_ENABLED' || actionLoading["mark-live"]}
                  onClick={() => handleDevopsAction("mark-live")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all hover:translate-y-[-1px] active:translate-y-[1px] shadow-md hover:shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading["mark-live"] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4"/>}
                  <span>Mark Website Live</span>
                </button>
              </div>
            </div>
            
            {/* DOMAIN SUMMARY CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(124,58,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Domain Summary
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                  <span className="text-sm text-gray-500">Family Name</span>
                  <span className="font-semibold text-gray-900 dark:text-white max-w-[150px] truncate">{watchAllFields.familyName || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                  <span className="text-sm text-gray-500">Root Domain</span>
                  <span className="font-semibold text-purple-600 dark:text-blue-400 max-w-[150px] truncate">
                    {domainOption === 'OPTION_1' ? (watchAllFields.rootDomain || '-') : (watchAllFields.preferredDomain || '-')}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                  <span className="text-sm text-gray-500">Ownership</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {domainOption === 'OPTION_1' ? 'Family Owned' : 'FamilyHub Managed'}
                  </span>
                </div>
                
                {domainOption === 'OPTION_1' ? (
                  <>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                      <span className="text-sm text-gray-500">Registrar</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm max-w-[150px] truncate">{watchAllFields.currentRegistrar || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                      <span className="text-sm text-gray-500">Hosting</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm max-w-[150px] truncate">{watchAllFields.hostingProvider || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                      <span className="text-sm text-gray-500">Go Live Date</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{watchAllFields.expectedGoLiveDate || '-'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                      <span className="text-sm text-gray-500">Registration Period</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{watchAllFields.registrationPeriod || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 border-dashed">
                      <span className="text-sm text-gray-500">Auto Renew</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{watchAllFields.autoRenew ? 'Yes' : 'No'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DOMAIN VERIFICATION CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(124,58,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Domain Status</h3>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Ownership Status</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">🟡 Pending</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">DNS Status</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">🟡 Pending</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">SSL Status</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">🟡 Pending</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Website Status</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">🟡 Pending Setup</span>
                    </div>
                </div>
            </div>

            {/* DNS INSTRUCTIONS CARD */}
            {domainOption === 'OPTION_1' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(124,58,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">DNS Configuration</h3>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => toast.success('DNS Instructions copied')} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Copy"><Copy className="w-4 h-4"/></button>
                            <button type="button" onClick={() => toast.success('Downloading DNS Instructions PDF...')} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Download PDF"><Download className="w-4 h-4"/></button>
                            <button type="button" onClick={() => toast.success('DNS Email instructions sent')} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Email Instructions"><Mail className="w-4 h-4"/></button>
                        </div>
                    </div>
                    <div className="p-5 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-gray-500 border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="pb-2 font-medium">Type</th>
                                    <th className="pb-2 font-medium">Host</th>
                                    <th className="pb-2 font-medium">Value</th>
                                    <th className="pb-2 font-medium">TTL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                <tr>
                                    <td className="py-2 font-semibold">TXT</td>
                                    <td className="py-2 font-mono">_familyhub-challenge</td>
                                    <td className="py-2 font-mono text-purple-600 dark:text-purple-400 font-medium">
                                      {watchAllFields.rootDomain ? `fh_${watchAllFields.rootDomain.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10)}` : 'fh_token_...'}
                                    </td>
                                    <td className="py-2">300</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-semibold">CNAME</td>
                                    <td className="py-2 font-mono">@</td>
                                    <td className="py-2 font-mono">verify.familyhub.ai</td>
                                    <td className="py-2">300</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DEVOPS CHECKLIST */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(124,58,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">DevOps Checklist</h3>
                </div>
                <div className="p-5 space-y-3">
                    {['Domain Request Submitted', 'Domain Ownership Verification', 'DNS Instructions Dispatched', 'DNS Record Propagation', 'DNS Verified', 'SSL Certificate Issuance', 'Tenant Reverse Proxy Routing', 'Website Live'].map((task, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-600 cursor-pointer" defaultChecked={false} />
                            <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">{task}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* COMMUNICATION TIMELINE */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden text-white">
              <div className="px-6 py-4 border-b border-slate-700/50">
                <h3 className="font-bold flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-purple-400" /> Activity Timeline
                </h3>
              </div>
              <div className="p-6">
                <div className="relative pl-6 border-l border-slate-600 space-y-6">
                  {[
                      { title: 'Family & Domain Submitted', time: '--:--', date: 'Pending', by: 'Super Admin', status: 'Pending' },
                      { title: 'Verification Token Dispatched', time: '--:--', date: 'Pending', by: 'System Engine', status: 'Pending' },
                      { title: 'DNS Instructions Dispatched', time: '--:--', date: 'Pending', by: 'DevOps Worker', status: 'Pending' },
                      { title: 'DNS Record Propagated', time: '--:--', date: 'Pending', by: 'DNS Resolver', status: 'Pending' },
                      { title: 'DNS Verified', time: '--:--', date: 'Pending', by: 'Automated Worker', status: 'Pending' },
                      { title: 'SSL Issued', time: '--:--', date: 'Pending', by: "Let's Encrypt", status: 'Pending' },
                      { title: 'Website Live & Active', time: '--:--', date: 'Pending', by: 'Nginx Proxy', status: 'Pending' },
                  ].map((step, index) => (
                    <div key={index} className="relative">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[29px] w-3 h-3 rounded-full border-2 ${step.status === 'Done' ? 'bg-purple-500 border-purple-200' : 'bg-slate-800 border-slate-500'}`}></div>
                      
                      {/* Timeline Content */}
                      <div className="-mt-1">
                        <div className="text-sm font-semibold text-white mb-0.5">{step.title}</div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {step.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {step.time}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3"/> {step.by}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
