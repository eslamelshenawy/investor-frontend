/**
 * Verify Email Page - تأكيد البريد الإلكتروني
 * Handles email verification token from URL
 */

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { api } from '../src/services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verify = async () => {
      const response = await api.verifyEmail(token);
      if (response.success) {
        setStatus('success');
        setMessage(response.data?.messageAr || 'تم تأكيد البريد الإلكتروني بنجاح');
      } else {
        setStatus('error');
        setMessage(response.errorAr || 'رمز التأكيد غير صالح أو منتهي الصلاحية');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">جارٍ التأكيد...</h1>
            <p className="text-gray-500 text-sm">يتم التحقق من بريدك الإلكتروني</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">تم التأكيد!</h1>
            <p className="text-gray-600 text-sm mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              الذهاب للصفحة الرئيسية
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">فشل التأكيد</h1>
            <p className="text-gray-600 text-sm mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              العودة للصفحة الرئيسية
            </Link>
          </>
        )}

        {status === 'no-token' && (
          <>
            <Mail size={48} className="mx-auto mb-4 text-amber-500" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">رابط غير صالح</h1>
            <p className="text-gray-600 text-sm mb-6">لم يتم العثور على رمز التأكيد في الرابط</p>
            <Link
              to="/"
              className="inline-block bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              العودة للصفحة الرئيسية
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
