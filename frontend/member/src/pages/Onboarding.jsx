import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Check, ShieldCheck, Lock, User, Briefcase, Phone, FileText, Settings } from 'lucide-react';

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
    // Profile
    photo: '', title: '', dob: '', bloodGroup: '', maritalStatus: '',
    // Contact
    email: '', whatsapp: '', address: '', city: '', state: '', country: '', pinCode: '',
    // Education & Career
    education: '', occupation: '', company: '', designation: '', skills: '',
    // Personal
    biography: '', hobbies: '', languages: '', interests: '', socialLinks: '',
    // Emergency
    emergencyContact: '', emergencyPhone: '', emergencyRelation: '', medicalNotes: '',
    // Privacy
    showMobile: true, showEmail: false, showDob: true, allowMessages: true, showOnPublic: false, allowPhotoTagging: true
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing invitation token");
      setLoading(false);
      return;
    }
    axios.get(`http://localhost:5000/api/v1/auth/invite/verify-token?token=${token}`)
      .then((res) => {
        if (res.data.valid) {
           setInviteData(res.data.user);
           toast.success("Token verified!");
        }
      })
      .catch((err) => {
        toast.error("Invalid or expired invitation");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const next = () => setStep(s => Math.min(12, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleComplete = async () => {
    setSubmitting(true);
    // In a real app this would post the complete form data.
    setTimeout(() => {
       toast.success("Profile fully generated!");
       setSubmitting(false);
       setStep(12);
    }, 1500);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium animate-pulse">Verifying secure link...</div>;
  if (!inviteData && !loading) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium flex-col gap-4"><h2>Invitation Expired or Invalid</h2><button onClick={() => navigate('/member/login')} className="px-4 py-2 bg-slate-900 text-white rounded-lg">Go to Login</button></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-10 px-4">
      {step < 12 && (
        <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">FamilyHub Onboarding</h2>
           <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Step {step} of 11</div>
        </div>
      )}
      
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Progress Bar */}
         {step < 12 && (
           <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
             <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 11) * 100}%` }}></div>
           </div>
         )}
         
         <div className="p-8 md:p-10">
           
           {/* Step 1: Welcome */}
           {step === 1 && (
             <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={36} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to the Family!</h1>
                <p className="text-slate-500 text-lg">You've been securely invited to join the <strong>FamilyHub Directory</strong>. Please accept the invitation to setup your profile.</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-left border border-slate-100 dark:border-slate-800 my-6">
                   <p className="text-sm text-slate-500">Invited By: <span className="font-semibold text-slate-900 dark:text-white">Family Admin</span></p>
                   <p className="text-sm text-slate-500 mt-1">Pending Association: <span className="font-semibold text-slate-900 dark:text-white">{inviteData.firstName} (Phone: {inviteData.phone})</span></p>
                </div>
                <div className="flex gap-4 justify-center mt-8">
                  <button className="px-6 py-3 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">Decline</button>
                  <button onClick={next} className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">Accept & Continue</button>
                </div>
             </div>
           )}

           {/* Step 2: OTP Verification */}
           {step === 2 && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3"><Lock className="text-blue-500" /> Verify Your Number</h2>
                <p className="text-slate-500">We've sent a 6-digit OTP to your registered mobile number <strong>{inviteData.phone}</strong>.</p>
                <div>
                   <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full text-center tracking-[1em] text-2xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="------" maxLength={6} />
                </div>
                <button onClick={next} className="w-full py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">Verify OTP</button>
             </div>
           )}

           {/* Step 3: Password */}
           {step === 3 && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold">Secure Your Account</h2>
                <p className="text-slate-500">Create a strong password to access your family dashboard in the future.</p>
                <div className="space-y-4">
                  <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl px-4 py-3" />
                  <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl px-4 py-3" />
                </div>
                <div className="flex justify-between pt-4">
                   <button onClick={prev} className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-700">Back</button>
                   <button onClick={next} className="px-8 py-3 rounded-xl font-bold bg-slate-900 text-white">Save & Continue</button>
                </div>
             </div>
           )}

           {/* Step 4: Basic Profile */}
           {step === 4 && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold"><User className="inline text-blue-500 mr-2"/> Basic Profile</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <option>Select</option><option>A+</option><option>O+</option><option>B+</option><option>AB+</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                   <button onClick={prev} className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-700">Back</button>
                   <button onClick={next} className="px-8 py-3 rounded-xl font-bold bg-slate-900 text-white">Next</button>
                </div>
             </div>
           )}

           {/* Steps 5-10 Compressed for rendering limits, showing structural navigation and form fields concept */}
           {step >= 5 && step <= 10 && (
              <div className="space-y-6 min-h-[300px]">
                 <h2 className="text-2xl font-bold text-slate-900">
                    {step === 5 && 'Contact Information'}
                    {step === 6 && 'Education & Career'}
                    {step === 7 && 'Personal Information'}
                    {step === 8 && 'Emergency Contact'}
                    {step === 9 && 'Documents (Optional)'}
                    {step === 10 && 'Privacy Settings'}
                 </h2>
                 <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-center">
                    Render respective fields for Step {step} here.
                 </div>
                 
                 <div className="flex justify-between pt-8 mt-auto border-t border-slate-100 dark:border-slate-800">
                   <button onClick={prev} className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-700">Back</button>
                   <button onClick={next} className="px-8 py-3 rounded-xl font-bold bg-slate-900 text-white shadow-lg">Next Section</button>
                </div>
              </div>
           )}

           {/* Step 11: Review & Submit */}
           {step === 11 && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold">Review & Submit</h2>
                <div className="bg-slate-50 p-6 rounded-xl space-y-3">
                  <p className="font-semibold text-slate-800 text-lg border-b pb-2">Final Check</p>
                  <p className="text-slate-600 text-sm">Please ensure all your information is correct before submitting. This will update your branch in the Family Tree and notify the Admin.</p>
                </div>
                <div className="flex justify-between pt-4">
                   <button onClick={prev} className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-700">Go Back</button>
                   <button onClick={handleComplete} disabled={submitting} className="px-8 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30">
                     {submitting ? 'Submitting...' : 'Complete Profile'}
                   </button>
                </div>
             </div>
           )}

           {/* Step 12: Success */}
           {step === 12 && (
             <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">You're All Set!</h1>
                <p className="text-slate-500 text-lg">Your profile has been completed successfully and awaiting any pending Admin approvals if applicable.</p>
                
                <button onClick={() => navigate('/member/dashboard')} className="mt-8 px-8 py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/40 w-full sm:w-auto mx-auto block transition-all">
                  Proceed to Dashboard
                </button>
             </div>
           )}

         </div>
      </div>
    </div>
  );
}
