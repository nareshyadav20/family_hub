import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../services/api'; // Or use axios

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error('Password does not meet complexity requirements');
      return;
    }

    setLoading(true);
    try {
      // Typically the token is available if we got here
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/v1/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Password changed successfully');
        
        // Update user state so next route navigation doesn't catch mustChangePassword
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            user.mustChangePassword = false;
            user.isTemporaryPassword = false;
            localStorage.setItem('user', JSON.stringify(user));
          } catch(e) {}
        }
        
        // Ensure all other tabs logout or are fine. In our flow, we redirect to dashboard
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Change Temporary Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            For security reasons, you must change your password during your first login before accessing the dashboard.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <ul className="mt-2 text-xs text-gray-500 space-y-1">
                <li className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : ''}`}><Check className="w-3 h-3 mr-1" /> Minimum 8 characters</li>
                <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}><Check className="w-3 h-3 mr-1" /> At least 1 uppercase letter</li>
                <li className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600' : ''}`}><Check className="w-3 h-3 mr-1" /> At least 1 lowercase letter</li>
                <li className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}><Check className="w-3 h-3 mr-1" /> At least 1 number</li>
                <li className={`flex items-center ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''}`}><Check className="w-3 h-3 mr-1" /> At least 1 special character</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
