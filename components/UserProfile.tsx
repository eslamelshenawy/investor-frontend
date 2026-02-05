import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../src/services/api';
import {
  Users,
  UserPlus,
  Heart,
  Image as ImageLucide,
  Briefcase,
  Calendar,
  Globe,
  Plus,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Loader2,
  Camera,
  Eye,
  Edit3,
  Check,
  X,
  MoreVertical,
  FileText
} from 'lucide-react';

// --- Types ---
interface ProfileData {
  id: string;
  email: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
  bio?: string;
  bioAr?: string;
  phone?: string;
  location?: string;
  locationAr?: string;
  skills?: string;
  coverImage?: string;
  emailVerified: boolean;
  createdAt: string;
  _count: {
    contents: number;
    followers: number;
    following: number;
    comments: number;
    dashboards: number;
    favorites: number;
  };
  recentContent?: Array<{
    id: string;
    type: string;
    title: string;
    titleAr: string;
    excerptAr?: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
  }>;
  totalViews?: number;
  totalLikes?: number;
}

interface NetworkUser {
  id: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  role: string;
  followedAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'مستخدم',
  ANALYST: 'محلل',
  EXPERT: 'خبير',
  WRITER: 'كاتب',
  DESIGNER: 'مصمم',
  EDITOR: 'محرر',
  CONTENT_MANAGER: 'مدير محتوى',
  ADMIN: 'مشرف',
  SUPER_ADMIN: 'مشرف عام',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `منذ ${days} يوم`;
    const months = Math.floor(days / 30);
    return `منذ ${months} شهر`;
  } catch {
    return dateStr;
  }
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function getAvatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `${window.location.origin}${avatar}`;
}

function parseSkills(skills?: string | null): string[] {
  if (!skills) return [];
  try { return JSON.parse(skills); } catch { return []; }
}

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Profile data from API
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Network data (lazy loaded)
  const [network, setNetwork] = useState<{ followers: NetworkUser[]; following: NetworkUser[] } | null>(null);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkTab, setNetworkTab] = useState<'followers' | 'following'>('followers');

  // Inline edit states
  const [editingBio, setEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState('');
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState('');
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsValue, setSkillsValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch profile on mount
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setProfile(res.data as unknown as ProfileData);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Lazy fetch network when friends tab opened
  const fetchNetwork = useCallback(async () => {
    if (network) return;
    setNetworkLoading(true);
    try {
      const res = await api.getMyNetwork();
      if (res.success && res.data) {
        setNetwork(res.data);
      }
    } catch { /* ignore */ }
    setNetworkLoading(false);
  }, [network]);

  useEffect(() => {
    if (activeTab === 'Friends') fetchNetwork();
  }, [activeTab, fetchNetwork]);

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    try {
      const uploadRes = await api.uploadFile(file);
      if (uploadRes.success && uploadRes.data) {
        const avatarUrl = uploadRes.data.url;
        const updateRes = await api.updateProfile({ avatar: avatarUrl });
        if (updateRes.success && user) {
          updateUser({ ...user, avatar: avatarUrl });
          setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : prev);
        }
      }
    } catch { /* ignore */ }
    setUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // Cover upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) return;
    setUploadingCover(true);
    try {
      const uploadRes = await api.uploadFile(file);
      if (uploadRes.success && uploadRes.data) {
        const coverUrl = uploadRes.data.url;
        await api.updateProfile({ coverImage: coverUrl });
        setProfile(prev => prev ? { ...prev, coverImage: coverUrl } : prev);
      }
    } catch { /* ignore */ }
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Save bio
  const saveBio = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile({ bioAr: bioValue });
      if (res.success) {
        setProfile(prev => prev ? { ...prev, bioAr: bioValue } : prev);
        setEditingBio(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  // Save location
  const saveLocation = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile({ locationAr: locationValue });
      if (res.success) {
        setProfile(prev => prev ? { ...prev, locationAr: locationValue } : prev);
        setEditingLocation(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  // Save skills
  const saveSkills = async () => {
    setSaving(true);
    try {
      const skillsArr = skillsValue.split('،').map(s => s.trim()).filter(Boolean);
      const skillsJson = JSON.stringify(skillsArr);
      const res = await api.updateProfile({ skills: skillsJson });
      if (res.success) {
        setProfile(prev => prev ? { ...prev, skills: skillsJson } : prev);
        setEditingSkills(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const avatarSrc = getAvatarUrl(profile?.avatar ?? user?.avatar);
  const coverSrc = getAvatarUrl(profile?.coverImage);
  const skills = parseSkills(profile?.skills);
  const counts = profile?._count;

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-pulse" dir="rtl">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6" />
        <div className="bg-white rounded-3xl overflow-hidden mb-8">
          <div className="h-48 md:h-64 bg-gray-200" />
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-6 gap-6">
              <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white" />
              <div className="flex-1 pt-16 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fadeIn" dir="rtl">
      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

      {/* Page Header */}
      <div className="mb-6 text-right">
        <h2 className="text-xl font-bold text-gray-900">الملف الشخصي</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 justify-start">
          <span>الرئيسية</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-gray-900">ملف المستخدم</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Cover Image */}
        <div className="h-48 md:h-64 relative bg-gradient-to-r from-blue-100 via-indigo-100 to-emerald-50">
          {coverSrc ? (
            <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop"
              alt="Cover"
              className="w-full h-full object-cover opacity-40"
            />
          )}
          <button
            onClick={() => !uploadingCover && coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-white/80 backdrop-blur text-gray-800 p-2 rounded-xl shadow-lg hover:bg-white transition-all"
          >
            {uploadingCover ? <Loader2 size={18} className="animate-spin" /> : <ImageLucide size={18} />}
          </button>
        </div>

        {/* Profile Info & Stats */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-black">
                    {(profile?.nameAr || profile?.name || user?.nameAr || user?.name || 'U').charAt(0)}
                  </div>
                )}
              </div>
              <div
                onClick={() => !uploading && avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? <Loader2 className="text-white animate-spin" size={24} /> : <Camera className="text-white" size={24} />}
              </div>
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-right flex-1 pt-12 md:pt-16">
              <h3 className="text-2xl font-black text-gray-900 leading-none">
                {profile?.nameAr || profile?.name || user?.nameAr || user?.name || 'مستخدم'}
              </h3>
              <p className="text-blue-600 font-bold mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block text-xs uppercase tracking-widest">
                {ROLE_LABELS[profile?.role || user?.role || ''] || 'مستخدم'}
              </p>
            </div>

            {/* Stats - Dynamic */}
            <div className="flex gap-8 md:gap-12 py-2">
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{formatNumber(counts?.contents ?? 0)}</p>
                <p className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                  <ImageLucide size={12} /> منشورات
                </p>
              </div>
              <div className="text-center border-x border-gray-100 px-8">
                <p className="text-xl font-black text-gray-900">{formatNumber(counts?.followers ?? 0)}</p>
                <p className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                  <Users size={12} /> متابعون
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{formatNumber(counts?.following ?? 0)}</p>
                <p className="text-xs text-gray-400 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                  <UserPlus size={12} /> أتابعهم
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-t border-gray-100 pt-4 overflow-x-auto no-scrollbar gap-8">
            {[
              { id: 'Profile', label: 'البيانات الشخصية', icon: MoreVertical },
              { id: 'Friends', label: `المتابعون (${(counts?.followers ?? 0) + (counts?.following ?? 0)})`, icon: Users },
              { id: 'Gallery', label: `المنشورات (${counts?.contents ?? 0})`, icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-800'}`}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right">

        {/* --- Profile Section --- */}
        {activeTab === 'Profile' && (
          <>
            <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
              {/* Bio */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">نبذة عني <div className="w-2 h-2 bg-blue-600 rounded-full" /></span>
                  {!editingBio && (
                    <button onClick={() => { setBioValue(profile?.bioAr || profile?.bio || ''); setEditingBio(true); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit3 size={14} />
                    </button>
                  )}
                </h4>
                {editingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={bioValue}
                      onChange={e => setBioValue(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:border-blue-400"
                      rows={4}
                      maxLength={500}
                      placeholder="اكتب نبذة عنك..."
                      dir="rtl"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingBio(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={16} /></button>
                      <button onClick={saveBio} disabled={saving} className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {profile?.bioAr || profile?.bio || 'لم يتم إضافة نبذة بعد...'}
                  </p>
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600 justify-start">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0"><Briefcase size={16} /></div>
                    <span>{ROLE_LABELS[profile?.role || ''] || 'مستخدم'} في رادار المستثمر</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 justify-start">
                    <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0"><Calendar size={16} /></div>
                    <span>انضم في {profile?.createdAt ? formatDate(profile.createdAt) : '—'}</span>
                  </div>
                  {/* Location - editable */}
                  <div className="flex items-center gap-3 text-sm text-gray-600 justify-start group">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0"><Globe size={16} /></div>
                    {editingLocation ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          value={locationValue}
                          onChange={e => setLocationValue(e.target.value)}
                          className="flex-1 p-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                          placeholder="مثال: الرياض، السعودية"
                          dir="rtl"
                        />
                        <button onClick={() => setEditingLocation(false)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                        <button onClick={saveLocation} disabled={saving} className="text-blue-600 hover:text-blue-700 disabled:opacity-50">
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                      </div>
                    ) : (
                      <span className="flex-1 flex items-center gap-2">
                        {profile?.locationAr || profile?.location || 'لم يتم تحديد الموقع'}
                        <button onClick={() => { setLocationValue(profile?.locationAr || profile?.location || ''); setEditingLocation(true); }} className="text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                          <Edit3 size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center justify-between">
                  <span>الخبرات والمهارات</span>
                  {!editingSkills && (
                    <button onClick={() => { setSkillsValue(skills.join('، ')); setEditingSkills(true); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit3 size={14} />
                    </button>
                  )}
                </h4>
                {editingSkills ? (
                  <div className="space-y-3">
                    <textarea
                      value={skillsValue}
                      onChange={e => setSkillsValue(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:border-blue-400"
                      rows={3}
                      placeholder="التحليل المالي، التداول، إدارة المحافظ (فصل بفاصلة عربية ،)"
                      dir="rtl"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingSkills(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={16} /></button>
                      <button onClick={saveSkills} disabled={saving} className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-start">
                    {skills.length > 0 ? skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 hover:border-blue-200 hover:text-blue-600 cursor-default transition-all">
                        {skill}
                      </span>
                    )) : (
                      <p className="text-gray-400 text-sm">لم يتم إضافة مهارات بعد...</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
              {/* Recent Content */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-black text-gray-900">آخر التحليلات المنشورة</h4>
                  {(profile?.recentContent?.length ?? 0) > 0 && (
                    <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                      عرض الكل <ChevronRight size={14} className="rtl:rotate-180" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {(profile?.recentContent?.length ?? 0) > 0 ? profile!.recentContent!.map(p => (
                    <div key={p.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group cursor-pointer">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-gray-800 group-hover:text-blue-700">{p.titleAr || p.title}</h5>
                        <span className="text-[10px] bg-white px-2 py-1 rounded-md text-gray-400 font-bold whitespace-nowrap">
                          {p.publishedAt ? timeAgo(p.publishedAt) : ''}
                        </span>
                      </div>
                      {p.excerptAr && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.excerptAr}</p>}
                      <div className="flex items-center gap-3 mt-3 justify-start">
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Eye size={12} /> {formatNumber(p.viewCount)} مشاهدة
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Heart size={12} /> {formatNumber(p.likeCount)} إعجاب
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <MessageSquare size={12} /> {p.commentCount} تعليق
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400">
                      <FileText size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">لا توجد منشورات بعد</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4"><Eye size={20} /></div>
                  <h5 className="text-2xl font-black mb-1">{formatNumber(profile?.totalViews ?? 0)}</h5>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">إجمالي المشاهدات</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4"><TrendingUp size={20} /></div>
                  <h5 className="text-2xl font-black mb-1">{formatNumber(profile?.totalLikes ?? 0)}</h5>
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">إجمالي الإعجابات</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- Friends/Network Section --- */}
        {activeTab === 'Friends' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                <button
                  onClick={() => setNetworkTab('followers')}
                  className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${networkTab === 'followers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  المتابعون ({counts?.followers ?? 0})
                </button>
                <button
                  onClick={() => setNetworkTab('following')}
                  className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${networkTab === 'following' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  أتابعهم ({counts?.following ?? 0})
                </button>
              </div>
            </div>

            {networkLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 animate-pulse flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(networkTab === 'followers' ? network?.followers : network?.following)?.map(person => {
                  const personAvatar = getAvatarUrl(person.avatar);
                  return (
                    <div key={person.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gray-50">
                          {personAvatar ? (
                            <img src={personAvatar} alt={person.nameAr || person.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-black">
                              {(person.nameAr || person.name || '?').charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">
                          {person.nameAr || person.name}
                        </h5>
                        <p className="text-[11px] text-blue-500 mt-1.5 font-bold uppercase tracking-wide">
                          {ROLE_LABELS[person.role] || person.role}
                        </p>
                      </div>
                      <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  );
                })}
                {(networkTab === 'followers' ? network?.followers : network?.following)?.length === 0 && (
                  <div className="lg:col-span-3 text-center py-12 text-gray-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{networkTab === 'followers' ? 'لا يوجد متابعون بعد' : 'لا تتابع أحد بعد'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- Gallery Section (User Content) --- */}
        {activeTab === 'Gallery' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-black text-gray-900">المنشورات والتحليلات</h4>
            </div>
            {(profile?.recentContent?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile!.recentContent!.map(item => (
                  <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase">{item.type}</span>
                        <span className="text-[10px] text-gray-400">{item.publishedAt ? timeAgo(item.publishedAt) : ''}</span>
                      </div>
                      <h5 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">
                        {item.titleAr || item.title}
                      </h5>
                      {item.excerptAr && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.excerptAr}</p>}
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-3 border-t border-gray-50">
                        <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(item.viewCount)}</span>
                        <span className="flex items-center gap-1"><Heart size={12} /> {formatNumber(item.likeCount)}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {item.commentCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold">لا توجد منشورات بعد</p>
                <p className="text-xs mt-1">ابدأ بنشر تحليلاتك ومقالاتك</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
