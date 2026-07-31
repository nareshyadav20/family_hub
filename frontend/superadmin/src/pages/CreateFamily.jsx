import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Globe, User, MapPin, CheckCircle, 
  Clock, Server, Save, Info, AlertCircle, RefreshCw, ChevronDown, Check,
  CreditCard, Calendar as CalendarIcon, Hash, Link
} from 'lucide-react';

const schema = z.object({
  // Family Details
  familyName: z.string().min(1, 'Family Name is required'),
  familyCode: z.string().optional(),
  familyHead: z.string().min(1, 'Family Head is required'),
  adminName: z.string().min(1, 'Admin Name is required'),
  adminMobile: z.string().optional(),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
  
  // Domain Management Option
  domainOption: z.enum(['OPTION_1', 'OPTION_2']).default('OPTION_1'),

  // Option 1 Fields
  rootDomain: z.string().optional(),
  currentRegistrar: z.string().optional(),
  registrarAccountEmail: z.string().optional(),
  registrantName: z.string().optional(),
  techContactName: z.string().optional(),
  techContactEmail: z.string().optional(),
  techContactMobile: z.string().optional(),
  dnsAccessAvailable: z.enum(['Yes', 'No']).optional(),
  hostingProvider: z.string().optional(),
  currentWebsite: z.string().optional(),
  migrationRequired: z.boolean().optional(),
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
  } else if (data.domainOption === 'OPTION_2') {
    if (!data.preferredDomain) {
      ctx.addIssue({ path: ['preferredDomain'], message: 'Preferred Domain is required', code: z.ZodIssueCode.custom });
    }
  }
});

export default function CreateFamily() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Parse URL query parameter for default option
  const queryParams = new URLSearchParams(location.search);
  const initialOption = queryParams.get('domainOption') === 'OPTION_2' ? 'OPTION_2' : 'OPTION_1';

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
      migrationRequired: false,
      autoRenew: true,
      preferredExtension: '.com',
      registrationPeriod: '1 Year',
      purchaseAccount: 'FamilyHub Business Account'
    }
  });

  const watchAllFields = watch();
  const domainOption = watch('domainOption');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      console.log('Form Payload:', data);
      await new Promise(resolve => setTimeout(resolve, 1500)); // mock network request
      toast.success('Family created successfully! (Mock)');
    } catch (err) {
      toast.error('Error creating family');
    } finally {
      setSubmitting(false);
    }
  };

  const workflowStepsOption1 = [
    { label: 'Request Submitted', desc: 'Family details captured.', updatedBy: '-', date: '-' },
    { label: 'Pending Setup', desc: 'Awaiting technical review.', updatedBy: '-', date: '-' },
    { label: 'DNS Configuration', desc: 'DevOps provides instructions.', updatedBy: '-', date: '-' },
    { label: 'DNS Verification', desc: 'Verifying family DNS updates.', updatedBy: '-', date: '-' },
    { label: 'SSL Certificate', desc: 'Generating secure certificate.', updatedBy: '-', date: '-' },
    { label: 'Website Live', desc: 'Website is fully accessible.', updatedBy: '-', date: '-' }
  ];

  const workflowStepsOption2 = [
    { label: 'Request Submitted', desc: 'Domain request captured.', updatedBy: '-', date: '-' },
    { label: 'Domain Purchased', desc: 'DevOps purchases domain.', updatedBy: '-', date: '-' },
    { label: 'DNS Configuration', desc: 'Internal DNS mapping.', updatedBy: '-', date: '-' },
    { label: 'SSL Certificate', desc: 'Generating secure certificate.', updatedBy: '-', date: '-' },
    { label: 'Website Live', desc: 'Website is fully accessible.', updatedBy: '-', date: '-' }
  ];

  const currentWorkflow = domainOption === 'OPTION_1' ? workflowStepsOption1 : workflowStepsOption2;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900/50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-[1500px] mx-auto mb-8 flex items-center justify-between">
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
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => navigate('/families')}
            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="button"
            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Save Draft
          </button>
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-blue-600/20"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Family
          </button>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto flex flex-col xl:flex-row gap-8">
        
        {/* Left Column - Form */}
        <div className="flex-1 space-y-8">
          <form id="create-family-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Section 0: Family Details (Required Context) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-800/30">
                <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Family Details</h2>
                  <p className="text-sm text-gray-500">Basic information about the family and administrator.</p>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Family Name *</label>
                    <input {...register('familyName')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.familyName ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="e.g. Smith Family" />
                    {errors.familyName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.familyName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Family Head *</label>
                    <input {...register('familyHead')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.familyHead ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="Name of family head" />
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Admin Account</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Name *</label>
                    <input {...register('adminName')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.adminName ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Mobile</label>
                    <input {...register('adminMobile')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Email *</label>
                    <input type="email" {...register('adminEmail')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.adminEmail ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="admin@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Admin Password *</label>
                    <input type="password" {...register('adminPassword')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.adminPassword ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>

            {/* DOMAIN MANAGEMENT SUPER CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden relative">
              
              <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-start gap-4 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl shadow-sm">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Domain Management</h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Select how the family's root domain will be managed.
                  </p>
                </div>
              </div>
              
              <div className="p-8">
                {/* Visual Confirmation of Selected Option */}
                <div className="mb-8">
                  {domainOption === 'OPTION_1' ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Family Already Owns a Domain</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Our technical team will verify ownership and provide DNS instructions.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                        <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                      <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-gray-200 dark:bg-slate-700"></span>
                          Section 1: Domain Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Root Domain *</label>
                            <input {...register('rootDomain')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.rootDomain ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="Enter root domain (e.g. panga.com)" />
                            {errors.rootDomain && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.rootDomain.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Current Domain Registrar *</label>
                            <div className="relative">
                              <select {...register('currentRegistrar')} className={`appearance-none w-full px-4 py-2.5 rounded-xl border ${errors.currentRegistrar ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`}>
                                <option value="">Select Registrar</option>
                                <option value="GoDaddy">GoDaddy</option>
                                <option value="Cloudflare">Cloudflare</option>
                                <option value="Hostinger">Hostinger</option>
                                <option value="Namecheap">Namecheap</option>
                                <option value="AWS Route53">AWS Route53</option>
                                <option value="BigRock">BigRock</option>
                                <option value="Squarespace">Squarespace</option>
                                <option value="Other">Other</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                            {errors.currentRegistrar && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.currentRegistrar.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registrar Account Email <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <input type="email" {...register('registrarAccountEmail')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="admin@panga.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registrant / Owner Name <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <input {...register('registrantName')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Naresh Yadav" />
                          </div>
                          <div className="md:col-span-2 pt-4 border-t border-gray-50 dark:border-slate-800/50"></div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Technical Contact Name <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <input {...register('techContactName')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="John Smith" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Technical Contact Email <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <input type="email" {...register('techContactEmail')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="tech@panga.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Technical Contact Mobile <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <input {...register('techContactMobile')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-gray-200 dark:bg-slate-700"></span>
                          Section 2: DNS Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">DNS Access Available?</label>
                            <div className="flex gap-4">
                              <label className={`flex-1 flex items-center gap-3 p-4 cursor-pointer rounded-xl border-2 transition-all ${watchAllFields.dnsAccessAvailable === 'Yes' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 bg-white dark:bg-slate-800'}`}>
                                <input type="radio" value="Yes" {...register('dnsAccessAvailable')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600" />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Yes</span>
                                  <span className="text-xs text-gray-500">I can access the DNS records</span>
                                </div>
                              </label>
                              <label className={`flex-1 flex items-center gap-3 p-4 cursor-pointer rounded-xl border-2 transition-all ${watchAllFields.dnsAccessAvailable === 'No' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 bg-white dark:bg-slate-800'}`}>
                                <input type="radio" value="No" {...register('dnsAccessAvailable')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600" />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900 dark:text-white text-sm">No</span>
                                  <span className="text-xs text-gray-500">Tech team will coordinate setup</span>
                                </div>
                              </label>
                            </div>
                            <AnimatePresence>
                              {watchAllFields.dnsAccessAvailable === 'No' && (
                                <motion.p 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-sm text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-2"
                                >
                                  <Info className="w-4 h-4" /> Our technical team will coordinate with the domain owner to complete the setup.
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Hosting Provider <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <div className="relative">
                              <select {...register('hostingProvider')} className="appearance-none w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all">
                                <option value="">Select Provider</option>
                                <option value="AWS">AWS</option>
                                <option value="Azure">Azure</option>
                                <option value="DigitalOcean">DigitalOcean</option>
                                <option value="Hostinger">Hostinger</option>
                                <option value="GoDaddy Hosting">GoDaddy Hosting</option>
                                <option value="Cloudflare Pages">Cloudflare Pages</option>
                                <option value="Vercel">Vercel</option>
                                <option value="Netlify">Netlify</option>
                                <option value="Other">Other</option>
                                <option value="Unknown">Unknown</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Current Website <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                            <input type="url" {...register('currentWebsite')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="https://panga.com" />
                          </div>
                          <div className="md:col-span-2 mt-2">
                            <label className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="flex items-center h-5 mt-0.5">
                                <input type="checkbox" {...register('migrationRequired')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">Migration Required? (Yes)</span>
                                <span className="text-sm text-gray-500 mt-0.5">The family already has an existing website that needs to be migrated.</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-6 flex items-center gap-2">
                          <span className="w-6 h-[1px] bg-gray-200 dark:bg-slate-700"></span>
                          Section 3: Notes
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Special Instructions</label>
                          <textarea {...register('specialInstructions')} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all resize-none" placeholder="Example: The family website is currently hosted on GoDaddy. DNS changes must be scheduled after 8 PM."></textarea>
                        </div>
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
                        <div className="flex items-start gap-3 p-4 mb-8 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Preferred Domain *</label>
                            <input {...register('preferredDomain')} className={`w-full px-4 py-2.5 rounded-xl border ${errors.preferredDomain ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} bg-white dark:bg-slate-800 outline-none transition-all`} placeholder="e.g. panga.com" />
                            {errors.preferredDomain && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.preferredDomain.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Preferred Extension</label>
                            <div className="relative">
                              <select {...register('preferredExtension')} className="appearance-none w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all">
                                <option value=".com">.com</option>
                                <option value=".in">.in</option>
                                <option value=".org">.org</option>
                                <option value=".family">.family</option>
                                <option value=".net">.net</option>
                                <option value=".co">.co</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Alternative Domain 1</label>
                            <input {...register('alternativeDomain1')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="e.g. panga-family.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Alternative Domain 2</label>
                            <input {...register('alternativeDomain2')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="e.g. thepangas.com" />
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Registration Period</label>
                            <div className="relative">
                              <select {...register('registrationPeriod')} className="appearance-none w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all">
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="5 Years">5 Years</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Purchase Account</label>
                            <div className="relative">
                              <select {...register('purchaseAccount')} className="appearance-none w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all">
                                <option value="FamilyHub Business Account">FamilyHub Business Account</option>
                                <option value="Customer Account">Customer Account</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                            </div>
                          </div>
                          <div className="md:col-span-2 pt-2">
                            <label className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">Auto Renew</span>
                                <span className="text-sm text-gray-500 mt-0.5">Automatically renew this domain before expiration.</span>
                              </div>
                              <div className="relative inline-block w-12 h-6 rounded-full">
                                <input type="checkbox" {...register('autoRenew')} className="peer sr-only" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </div>
                            </label>
                          </div>
                          <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Billing Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Billing Email</label>
                                <input type="email" {...register('billingEmail')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="billing@example.com" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Billing Phone</label>
                                <input {...register('billingPhone')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="+1 (555) 000-0000" />
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
                          <textarea {...register('internalNotes')} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-slate-800 outline-none transition-all resize-none" placeholder="Any internal instructions for DevOps..."></textarea>
                        </div>
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
            
            {/* DOMAIN SUMMARY CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-5 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Domain Summary Card
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800 border-dashed">
                  <span className="text-sm text-gray-500">Root Domain</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 max-w-[150px] truncate">
                    {domainOption === 'OPTION_1' ? (watchAllFields.rootDomain || '-') : (watchAllFields.preferredDomain || '-')}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800 border-dashed">
                  <span className="text-sm text-gray-500">Ownership</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {domainOption === 'OPTION_1' ? 'Family Owned' : 'FamilyHub Managed'}
                  </span>
                </div>
                
                {domainOption === 'OPTION_1' ? (
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800 border-dashed">
                    <span className="text-sm text-gray-500">Registrar</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{watchAllFields.currentRegistrar || '-'}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800 border-dashed">
                      <span className="text-sm text-gray-500">Registration Period</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{watchAllFields.registrationPeriod || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800 border-dashed">
                      <span className="text-sm text-gray-500">Auto Renew</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{watchAllFields.autoRenew ? 'Yes' : 'No'}</span>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="text-xs text-gray-500 mb-1">DNS Status</div>
                    <div className="text-sm font-semibold text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="text-xs text-gray-500 mb-1">SSL Status</div>
                    <div className="text-sm font-semibold text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending</div>
                  </div>
                  <div className="col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50 flex justify-between items-center">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide">Website Status</div>
                    <div className="text-sm font-bold text-blue-700 dark:text-blue-300">Pending Setup</div>
                  </div>
                </div>
              </div>
            </div>

            {/* DOMAIN WORKFLOW */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-5 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" /> Domain Workflow
                </h3>
              </div>
              <div className="p-6">
                <div className="relative pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-6">
                  {currentWorkflow.map((step, index) => (
                    <div key={index} className="relative">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-[3px] shadow-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600`}></div>
                      
                      {/* Timeline Content */}
                      <div className="-mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{step.label}</div>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Pending</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{step.desc}</p>
                        <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-50 dark:border-slate-700">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {step.date}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3"/> {step.updatedBy}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WHAT HAPPENS NEXT */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden text-white">
              <div className="px-6 py-5 border-b border-slate-700/50">
                <h3 className="font-bold flex items-center gap-2">
                  <Hash className="w-5 h-5 text-blue-400" /> What Happens Next?
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {domainOption === 'OPTION_1' ? (
                    <>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">1</span> Family submits domain.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">2</span> Family is created.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">3</span> DevOps provides DNS instructions.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">4</span> Family updates DNS.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">5</span> DNS is verified.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">6</span> SSL is generated.</li>
                      <li className="flex items-start gap-3 text-sm text-blue-300 font-medium"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">7</span> Website becomes Live.</li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">1</span> Domain request submitted.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">2</span> DevOps purchases domain.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">3</span> DNS configured.</li>
                      <li className="flex items-start gap-3 text-sm text-slate-300"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">4</span> SSL generated.</li>
                      <li className="flex items-start gap-3 text-sm text-blue-300 font-medium"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">5</span> Website becomes Live.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
