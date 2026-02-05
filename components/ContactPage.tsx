/**
 * Contact Page - تواصل معنا
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Send, ArrowLeft,
  CheckCircle2, Loader2, MessageSquare,
} from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate send
    setTimeout(() => {
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5C] to-[#004080] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <MessageSquare size={40} className="mx-auto mb-4 text-white/80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            نسعد بتواصلك معنا. أرسل لنا رسالتك وسنرد عليك في أقرب وقت.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <Mail size={24} className="text-blue-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">البريد الإلكتروني</h3>
              <p className="text-sm text-gray-500">info@al-investor.com</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <Phone size={24} className="text-emerald-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">الهاتف</h3>
              <p className="text-sm text-gray-500" dir="ltr">+966 XX XXX XXXX</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <MapPin size={24} className="text-red-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">الموقع</h3>
              <p className="text-sm text-gray-500">المملكة العربية السعودية</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {status === 'sent' ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال رسالتك بنجاح</h3>
                <p className="text-gray-500 mb-6">سنتواصل معك في أقرب وقت ممكن</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="email@example.com"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="موضوع الرسالة"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3 bg-[#002B5C] text-white rounded-xl font-bold hover:bg-[#003A7A] disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? (
                    <><Loader2 size={18} className="animate-spin" /> جاري الإرسال...</>
                  ) : (
                    <><Send size={18} /> إرسال الرسالة</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
