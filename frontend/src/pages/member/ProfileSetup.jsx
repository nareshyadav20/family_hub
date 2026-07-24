import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronRight, ArrowLeft, CheckCircle, Save, BookOpen, Shield, FileText } from 'lucide-react';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(2);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    // Stage 2: Education & Career
    education: '', school: '', college: '', degree: '', occupation: '', company: '', designation: '', skills: '', linkedin: '',
    // Stage 3: Personal & Documents
    biography: '', languages: '', hobbies: '', interests: '', emergencyContact: '', emergencyPhone: '', aadhaar: '', pan: '', passport: '',
    address: '', dob: '', phone: '',
    // Stage 4: Finance, Privacy
    bank: '', account: '', ifsc: '', bloodGroup: '', medicalNotes: '', visibilityProfile: true, visibilityPhone: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (submitFinal = false) => {
    setSaving(true);
    let nextStage = stage + 1;
    let completion = stage * 25; 
    
    if (submitFinal) {
        completion = 100;
        nextStage = 4;
    }

    try {
      const res = await axios.put(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/member/profile`, {
        currentStage: nextStage,
        profileCompletion: completion,
        ...formData
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local storage so the dashboard knows it's completed
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...storedUser, 
        profileCompletion: completion, 
        currentProfileStep: submitFinal ? 'Completed' : `Stage ${nextStage}`,
        isProfileCompleted: submitFinal || completion === 100
      };
      if (submitFinal || completion === 100) updatedUser.status = 'ACTIVE';
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success(submitFinal ? 'Profile fully completed and submitted for review!' : `Stage ${stage} Saved!`);
      
      if (submitFinal) {
        navigate('/member/dashboard');
      } else {
        setStage(nextStage);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to save profile progress.';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-500 pt-8 px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#FAF8FF] rounded-full transition-colors text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1F2430] mb-2 tracking-tight">Complete Your Profile</h1>
          <p className="text-sm text-slate-500">You are currently at {(stage - 1) * 25}% completion.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 h-2 w-full">
         <div className="bg-emerald-500 h-full flex-1 rounded-l-full transition-all"></div>
         <div className={`h-full flex-1 transition-all ${stage >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
         <div className={`h-full flex-1 transition-all ${stage >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
         <div className={`h-full flex-1 rounded-r-full transition-all ${stage >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E9E5F8]">
        
        {stage === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><BookOpen className="text-[#7C5CFC]" /> Stage 2: Education & Career</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Highest Qualification</label>
                <input type="text" name="education" value={formData.education} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="e.g. Master's Degree" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">University / College</label>
                <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="University Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="Current Workplace" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Key Skills</label>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="Comma separated skills" />
              </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-[#E9E5F8] mt-6">
               <button onClick={() => { handleSave(false).then(() => navigate('/member/dashboard')); }} className="font-semibold text-slate-500">Save & Skip for now</button>
               <button onClick={() => handleSave(false)} disabled={saving} className="bg-[#7C5CFC] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-[24px] shadow-lg flex items-center gap-2">
                 {saving ? 'Saving...' : 'Save & Continue'} <ChevronRight size={18} />
               </button>
            </div>
          </div>
        )}

        {stage === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><FileText className="text-amber-500" /> Stage 3: Personal & Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Biography</label>
                <textarea name="biography" value={formData.biography} onChange={handleChange} rows={3} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="Tell the family a bit about yourself..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Hobbies</label>
                <input type="text" name="hobbies" value={formData.hobbies} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Languages Spoken</label>
                <input type="text" name="languages" value={formData.languages} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Aadhaar (ID)</label>
                <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="Full Address" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#FCFBFF] border border-[#E9E5F8] rounded-[24px] px-4 py-3" placeholder="Mobile Number" />
              </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-[#E9E5F8] mt-6">
               <button onClick={() => { handleSave(false).then(() => navigate('/member/dashboard')); }} className="font-semibold text-slate-500">Save & Skip for now</button>
               <button onClick={() => handleSave(false)} disabled={saving} className="bg-[#7C5CFC] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-[24px] shadow-lg flex items-center gap-2">
                 {saving ? 'Saving...' : 'Save & Continue'} <ChevronRight size={18} />
               </button>
            </div>
          </div>
        )}

        {stage === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><Shield className="text-emerald-500" /> Stage 4: Privacy & Review</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 bg-[#FCFBFF] p-6 rounded-[24px] border border-[#E9E5F8]">
                  <h3 className="font-bold text-lg mb-4">Privacy Options</h3>
                  
                   <div className="space-y-4">
                     <label className="flex items-center gap-3 font-medium cursor-pointer">
                        <input type="checkbox" name="visibilityProfile" checked={formData.visibilityProfile} onChange={handleChange} className="w-5 h-5 rounded text-[#7C5CFC]" />
                        Allow Extended Family to View Full Profile
                     </label>
                     <label className="flex items-center gap-3 font-medium cursor-pointer">
                        <input type="checkbox" name="visibilityPhone" checked={formData.visibilityPhone} onChange={handleChange} className="w-5 h-5 rounded text-[#7C5CFC]" />
                        Make Mobile Number Visible in Directory
                     </label>
                  </div>
               </div>
               
               <div className="md:col-span-2 bg-[#FCFBFF] p-6 rounded-[24px] border border-[#E9E5F8] mt-4">
                  <h3 className="font-bold text-lg mb-4">Medical & Blood Group</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-semibold mb-2">Blood Group</label>
                       <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-white border border-[#E9E5F8] rounded-[24px] px-4 py-3">
                         <option value="">Select Blood Group</option>
                         <option value="A+">A+</option><option value="A-">A-</option>
                         <option value="B+">B+</option><option value="B-">B-</option>
                         <option value="O+">O+</option><option value="O-">O-</option>
                         <option value="AB+">AB+</option><option value="AB-">AB-</option>
                       </select>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-[#E9E5F8] mt-6">
               <button onClick={() => setStage(3)} className="font-semibold text-slate-500">Back</button>
               <button onClick={() => handleSave(true)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-[24px] shadow-lg flex items-center gap-2">
                 {saving ? 'Submitting...' : 'Submit Final Profile'} <CheckCircle size={18} />
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
