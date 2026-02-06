/**
 * Campaigns Page - إدارة الحملات التفاعلية
 * For Content Managers: Create and manage polls, surveys, quizzes
 */

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Play,
  Pause,
  Square,
  Loader2,
  BarChart3,
  Users,
  Calendar,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';

interface Campaign {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  status: string;
  participantCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: { responses: number };
}

const TYPE_LABELS: Record<string, string> = {
  POLL: 'استطلاع رأي',
  SURVEY: 'استبيان',
  QUIZ: 'اختبار',
  CONTEST: 'مسابقة',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: 'gray' },
  ACTIVE: { label: 'نشط', color: 'emerald' },
  PAUSED: { label: 'متوقف', color: 'amber' },
  ENDED: { label: 'منتهي', color: 'red' },
};

const CampaignsPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    type: 'POLL',
    settings: JSON.stringify({
      questions: [
        { id: 'q1', text: 'ما رأيك في...؟', options: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'] },
      ],
    }, null, 2),
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const res = await api.getCampaigns();
    if (res.success && res.data) {
      setCampaigns(res.data);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.titleAr) return;
    setSaving(true);

    const res = await api.createCampaign({
      title: form.title || form.titleAr,
      titleAr: form.titleAr,
      description: form.description,
      descriptionAr: form.descriptionAr,
      type: form.type,
      settings: form.settings,
    });

    setSaving(false);

    if (res.success) {
      setShowCreate(false);
      setForm({ title: '', titleAr: '', description: '', descriptionAr: '', type: 'POLL', settings: JSON.stringify({ questions: [{ id: 'q1', text: 'ما رأيك في...؟', options: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'] }] }, null, 2) });
      loadCampaigns();
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await api.updateCampaignStatus(id, status);
    loadCampaigns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحملة؟')) return;
    await api.deleteCampaign(id);
    loadCampaigns();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Megaphone size={24} className="text-blue-600" />
              الحملات التفاعلية
            </h1>
            <p className="text-sm text-gray-500 mt-1">إنشاء وإدارة الاستطلاعات والمسابقات</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> حملة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-black text-gray-900">{campaigns.length}</p>
            <p className="text-xs text-gray-500 font-medium">إجمالي الحملات</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-black text-emerald-600">{campaigns.filter(c => c.status === 'ACTIVE').length}</p>
            <p className="text-xs text-gray-500 font-medium">حملات نشطة</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-black text-blue-600">{campaigns.reduce((sum, c) => sum + c.participantCount, 0)}</p>
            <p className="text-xs text-gray-500 font-medium">إجمالي المشاركين</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-black text-gray-900">{campaigns.filter(c => c.status === 'DRAFT').length}</p>
            <p className="text-xs text-gray-500 font-medium">مسودات</p>
          </div>
        </div>

        {/* Campaign List */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 mb-4">لا توجد حملات بعد</p>
            <button onClick={() => setShowCreate(true)} className="text-blue-600 font-bold text-sm hover:text-blue-700">
              إنشاء أول حملة
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(campaign => {
              const statusInfo = STATUS_LABELS[campaign.status] || STATUS_LABELS.DRAFT;
              return (
                <div key={campaign.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{campaign.titleAr}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {TYPE_LABELS[campaign.type] || campaign.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {campaign.participantCount} مشارك
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(campaign.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {campaign.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="تفعيل"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      {campaign.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'PAUSED')}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="إيقاف مؤقت"
                          >
                            <Pause size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'ENDED')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="إنهاء"
                          >
                            <Square size={16} />
                          </button>
                        </>
                      )}
                      {campaign.status === 'PAUSED' && (
                        <button
                          onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="استئناف"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">حملة جديدة</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">النوع</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="POLL">استطلاع رأي</option>
                  <option value="SURVEY">استبيان</option>
                  <option value="QUIZ">اختبار</option>
                  <option value="CONTEST">مسابقة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">العنوان بالعربية *</label>
                <input
                  value={form.titleAr}
                  onChange={e => setForm({ ...form, titleAr: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="عنوان الحملة"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">العنوان بالإنجليزية</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Campaign Title"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                <textarea
                  value={form.descriptionAr}
                  onChange={e => setForm({ ...form, descriptionAr: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20 resize-none"
                  placeholder="وصف مختصر للحملة"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الإعدادات (JSON)</label>
                <textarea
                  value={form.settings}
                  onChange={e => setForm({ ...form, settings: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-32 resize-none"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.titleAr}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  إنشاء الحملة
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
