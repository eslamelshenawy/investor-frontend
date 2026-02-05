import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check, AlertTriangle } from 'lucide-react';

const TwoFactorSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'backup' | 'disable'>('status');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get2FAStatus().then(res => {
      if (res.success && res.data) setEnabled(res.data.enabled);
      setLoading(false);
    });
  }, []);

  const startSetup = async () => {
    setSaving(true);
    setError('');
    const res = await api.setup2FA();
    setSaving(false);
    if (res.success && res.data) {
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep('verify');
    } else {
      setError(res.errorAr || 'حدث خطأ');
    }
  };

  const verifyAndEnable = async () => {
    if (token.length < 6) { setError('أدخل رمز من 6 أرقام'); return; }
    setSaving(true);
    setError('');
    const res = await api.verify2FA(token);
    setSaving(false);
    if (res.success && res.data) {
      setBackupCodes(res.data.backupCodes || []);
      setEnabled(true);
      setStep('backup');
    } else {
      setError(res.errorAr || 'الرمز غير صحيح');
    }
  };

  const disableTwoFactor = async () => {
    if (token.length < 6) { setError('أدخل رمز من 6 أرقام'); return; }
    setSaving(true);
    setError('');
    const res = await api.disable2FA(token);
    setSaving(false);
    if (res.success) {
      setEnabled(false);
      setStep('status');
      setToken('');
    } else {
      setError(res.errorAr || 'الرمز غير صحيح');
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 lg:p-8" dir="rtl">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 animate-fadeIn" dir="rtl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">المصادقة الثنائية (2FA)</h2>
        <p className="text-sm text-gray-500 mt-1">أضف طبقة حماية إضافية لحسابك</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Status */}
        {step === 'status' && (
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${enabled ? 'bg-green-50' : 'bg-gray-50'}`}>
                {enabled ? <ShieldCheck size={28} className="text-green-600" /> : <Shield size={28} className="text-gray-400" />}
              </div>
              <div>
                <h3 className="font-black text-gray-900">
                  {enabled ? 'المصادقة الثنائية مفعّلة' : 'المصادقة الثنائية غير مفعّلة'}
                </h3>
                <p className="text-sm text-gray-500">
                  {enabled
                    ? 'حسابك محمي بطبقة أمان إضافية'
                    : 'فعّل المصادقة الثنائية لحماية حسابك'}
                </p>
              </div>
            </div>

            {enabled ? (
              <button
                onClick={() => { setStep('disable'); setToken(''); setError(''); }}
                className="px-6 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <ShieldOff size={16} /> تعطيل المصادقة الثنائية
              </button>
            ) : (
              <button
                onClick={startSetup}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                تفعيل المصادقة الثنائية
              </button>
            )}
          </div>
        )}

        {/* Setup - QR Code */}
        {step === 'verify' && (
          <div className="p-8">
            <h3 className="font-black text-gray-900 text-lg mb-2">إعداد المصادقة الثنائية</h3>
            <p className="text-sm text-gray-500 mb-6">امسح الرمز بتطبيق المصادقة (Google Authenticator أو Authy)</p>

            <div className="flex flex-col items-center gap-6 mb-6">
              {qrCode && (
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">أو أدخل الرمز يدوياً:</p>
                <code className="bg-gray-50 px-4 py-2 rounded-lg text-sm font-mono text-gray-700 select-all border border-gray-200">{secret}</code>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">أدخل الرمز من التطبيق</label>
                <input
                  type="text"
                  value={token}
                  onChange={e => { setToken(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-center text-xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="000000"
                  maxLength={6}
                  dir="ltr"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={verifyAndEnable} disabled={saving} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  تأكيد وتفعيل
                </button>
                <button onClick={() => { setStep('status'); setError(''); }} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes */}
        {step === 'backup' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-amber-500" />
              <h3 className="font-black text-gray-900 text-lg">احفظ رموز الاسترداد</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">احفظ هذه الرموز في مكان آمن. يمكنك استخدامها للدخول إذا فقدت جهازك.</p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                {backupCodes.map((code, i) => (
                  <code key={i} className="bg-white px-4 py-2 rounded-lg text-sm font-mono text-gray-800 text-center border border-gray-100">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={copyBackupCodes} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2">
                {copied ? <><Check size={16} className="text-green-600" /> تم النسخ</> : <><Copy size={16} /> نسخ الرموز</>}
              </button>
              <button onClick={() => setStep('status')} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">
                تم
              </button>
            </div>
          </div>
        )}

        {/* Disable */}
        {step === 'disable' && (
          <div className="p-8">
            <h3 className="font-black text-gray-900 text-lg mb-2">تعطيل المصادقة الثنائية</h3>
            <p className="text-sm text-gray-500 mb-6">أدخل الرمز من تطبيق المصادقة للتأكيد</p>

            <div className="space-y-4">
              <input
                type="text"
                value={token}
                onChange={e => { setToken(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-center text-xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="000000"
                maxLength={6}
                dir="ltr"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={disableTwoFactor} disabled={saving} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  تأكيد التعطيل
                </button>
                <button onClick={() => { setStep('status'); setError(''); }} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettings;
