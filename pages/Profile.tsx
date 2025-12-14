import React, { useState } from 'react';
import { WALLET_HISTORY } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Star, MapPin, Award, ChevronRight, CreditCard, Settings, LogOut, ShieldCheck, Mail, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data for the chart
const data = [
  { name: 'Mon', amount: 45 },
  { name: 'Tue', amount: 30 },
  { name: 'Wed', amount: 65 },
  { name: 'Thu', amount: 40 },
  { name: 'Fri', amount: 85 },
  { name: 'Sat', amount: 120 },
  { name: 'Sun', amount: 95 },
];

export const Profile: React.FC = () => {
  const { user, logout, verifyUser } = useAuth();
  const [verificationState, setVerificationState] = useState<'idle' | 'sending' | 'pending_code' | 'verifying' | 'uploading' | 'success'>('idle');
  const [emailCode, setEmailCode] = useState('');

  if (!user) return null;

  // Verification Handlers
  const handleSendEmailCode = () => {
    setVerificationState('sending');
    setTimeout(() => {
        setVerificationState('pending_code');
    }, 1500);
  };

  const handleVerifyEmail = () => {
    if (emailCode.length < 4) return;
    setVerificationState('verifying');
    setTimeout(() => {
        setVerificationState('success');
        // Delay context update so user sees success message
        setTimeout(() => {
            verifyUser();
        }, 2000);
    }, 1500);
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setVerificationState('uploading');
          setTimeout(() => {
              setVerificationState('success');
              setTimeout(() => {
                  verifyUser();
              }, 2000);
          }, 2000);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-400"></div>
        <div className="px-6 pb-6">
            <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="relative">
                    <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover" />
                    {user.isVerified && (
                        <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                            <CheckCircle size={20} className="text-blue-500 fill-blue-50" />
                        </div>
                    )}
                </div>
                <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Edit Profile
                </button>
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                    {user.isVerified && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-blue-200">
                             Verified
                        </span>
                    )}
                </div>
                <p className="text-slate-500 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> {user.location}
                </p>
                <div className="flex items-center gap-4 text-sm mt-3">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded font-medium">
                        <Star size={14} className="fill-amber-500 text-amber-500" /> {user.rating} Rating
                    </span>
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                        <Award size={14} /> {user.jobsCompleted} Gigs Completed
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
              
              {/* VERIFICATION SECTION - Display if not verified */}
              {!user.isVerified && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                             <ShieldCheck size={24} />
                          </div>
                          <div>
                              <h2 className="font-bold text-slate-800">Verification Required</h2>
                              <p className="text-sm text-slate-600">
                                  {user.role === 'client' ? 'Verify your email to verify your profile.' : 'Upload your ID to start accepting gigs.'}
                              </p>
                          </div>
                      </div>
                      
                      <div className="p-6">
                          {user.role === 'client' ? (
                              // CLIENT VERIFICATION (Email)
                              <div>
                                  {verificationState === 'idle' && (
                                      <div className="flex flex-col gap-4">
                                          <p className="text-sm text-slate-600">We need to verify your email address before you can fully utilize the platform.</p>
                                          <button 
                                              onClick={handleSendEmailCode}
                                              className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium w-full sm:w-auto px-6"
                                          >
                                              <Mail size={18} /> Send Verification Code
                                          </button>
                                      </div>
                                  )}

                                  {verificationState === 'sending' && (
                                       <div className="flex flex-col items-center justify-center py-4">
                                           <Loader2 className="animate-spin text-brand-600 mb-2" size={32} />
                                           <p className="text-sm text-slate-500">Sending verification code...</p>
                                       </div>
                                  )}

                                  {verificationState === 'pending_code' && (
                                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                                              <Mail size={16} className="mt-0.5" />
                                              <div>
                                                  A code has been sent to your email. (Mock: Enter any 4 digits)
                                              </div>
                                          </div>
                                          <div>
                                              <label className="block text-sm font-semibold text-slate-700 mb-1">Verification Code</label>
                                              <input 
                                                  type="text" 
                                                  placeholder="e.g. 1234" 
                                                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none tracking-widest font-mono text-center text-lg"
                                                  value={emailCode}
                                                  onChange={(e) => setEmailCode(e.target.value)}
                                                  maxLength={4}
                                              />
                                          </div>
                                          <button 
                                              onClick={handleVerifyEmail}
                                              disabled={emailCode.length < 4}
                                              className="w-full bg-brand-600 text-white py-2.5 rounded-lg hover:bg-brand-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-100"
                                          >
                                              Verify Email
                                          </button>
                                          <button onClick={() => setVerificationState('idle')} className="text-xs text-slate-500 hover:text-slate-800 underline w-full text-center">
                                              Resend Code
                                          </button>
                                      </div>
                                  )}

                                  {verificationState === 'verifying' && (
                                       <div className="flex flex-col items-center justify-center py-4">
                                           <Loader2 className="animate-spin text-brand-600 mb-2" size={32} />
                                           <p className="text-sm text-slate-500">Verifying code...</p>
                                       </div>
                                  )}
                              </div>
                          ) : (
                              // ATUMWA VERIFICATION (ID Upload)
                              <div>
                                  {verificationState === 'idle' && (
                                      <div className="space-y-4">
                                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                              <input 
                                                  type="file" 
                                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                  accept="image/*"
                                                  onChange={handleIdUpload}
                                              />
                                              <div className="bg-brand-50 text-brand-600 p-4 rounded-full mb-3">
                                                  <Upload size={32} />
                                              </div>
                                              <h3 className="font-bold text-slate-800 mb-1">Upload Government ID</h3>
                                              <p className="text-sm text-slate-500 max-w-xs">
                                                  Please upload a clear photo of your driver's license or passport.
                                              </p>
                                          </div>
                                          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                                              <AlertCircle size={12} /> Your data is securely encrypted.
                                          </p>
                                      </div>
                                  )}
                                  
                                  {verificationState === 'uploading' && (
                                       <div className="flex flex-col items-center justify-center py-8">
                                           <Loader2 className="animate-spin text-brand-600 mb-3" size={40} />
                                           <p className="text-slate-600 font-medium">Verifying your document...</p>
                                       </div>
                                  )}
                              </div>
                          )}

                          {/* Common Success State for both roles */}
                          {verificationState === 'success' && (
                                <div className="flex flex-col items-center justify-center py-6 text-green-600 animate-in zoom-in duration-300">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle size={28} />
                                    </div>
                                    <p className="font-bold text-lg">Verification Successful!</p>
                                    <p className="text-sm text-slate-500">Updating profile...</p>
                                </div>
                          )}
                      </div>
                  </div>
              )}

              {/* Wallet / Earnings Section */}
              {user.role !== 'client' && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-lg font-bold text-slate-800">Weekly Earnings</h2>
                          <span className="text-2xl font-bold text-brand-600">$480.00</span>
                      </div>
                      
                      {/* Chart */}
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                      </div>
                  </div>
              )}

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 mb-4">Recent Transactions</h3>
                 <div className="space-y-4">
                    {WALLET_HISTORY.map(t => (
                        <div key={t.id} className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {t.type === 'credit' ? '+' : '-'}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{t.description}</p>
                                    <p className="text-xs text-slate-500">{t.date}</p>
                                </div>
                            </div>
                            <span className={`font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-slate-800'}`}>
                                {t.type === 'credit' ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                            </span>
                        </div>
                    ))}
                 </div>
              </div>
          </div>

          {/* Quick Actions / Settings */}
          <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Account</h3>
                <ul className="space-y-2">
                    <li className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 text-slate-700">
                            <CreditCard size={18} /> Payment Methods
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                    </li>
                    <li className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 text-slate-700">
                            <Settings size={18} /> Preferences
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                    </li>
                    <li 
                      onClick={logout}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group text-red-600"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} /> Sign Out
                        </div>
                    </li>
                </ul>
              </div>

              {user.role === 'atumwa' && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
                    <p className="text-slate-300 text-sm mb-4">Get lower fees and priority access to high-value gigs.</p>
                    <button className="w-full bg-white text-slate-900 py-2 rounded-lg font-bold text-sm hover:bg-slate-100">
                        Upgrade Now
                    </button>
                </div>
              )}
          </div>
      </div>
    </div>
  );
};