import React, { useEffect, useState, useRef } from 'react';
import { SignJWT } from 'jose';
import { Maximize2, Minimize2, Loader2, RefreshCcw, BarChart3 } from 'lucide-react';

const METABASE_SITE_URL = "https://vague-ledge.metabaseapp.com";
const METABASE_SECRET_KEY = "358a8059cf120c265adab8a11c36d2a6c19fbc7814ea8ff5838dc5fc171258e9";

const DashboardEmbed: React.FC = () => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const secret = new TextEncoder().encode(METABASE_SECRET_KEY);
      const alg = 'HS256';

      const jwt = await new SignJWT({
        resource: { dashboard: 1 },
        params: {},
      })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('10m') // 10 minutes expiration
        .sign(secret);

      // Added theme=transparent to allow better blending if supported by Metabase theme settings
      const url = `${METABASE_SITE_URL}/embed/dashboard/${jwt}#bordered=false&titled=true&theme=transparent`;
      setIframeUrl(url);
    } catch (e) {
      console.error("Error generating token:", e);
      setError("حدث خطأ أثناء تهيئة لوحة القيادة. يرجى التحقق من الاتصال.");
      setLoading(false);
    }
  };

  useEffect(() => {
    generateToken();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleIframeLoad = () => {
    // Artificial small delay to ensure rendering frames are ready for smoother visual
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative transition-all duration-300 flex flex-col group ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none h-screen w-screen' : 'h-[800px] w-full hover:shadow-md'
      }`}
    >
      {/* Dashboard Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 text-gov-blue rounded-md">
            <BarChart3 size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-700">لوحة القيادة التفاعلية</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className="text-[10px] text-gray-400">
                {loading ? 'جاري التحديث...' : error ? 'خطأ' : 'محدث الآن'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button 
            onClick={() => { setIframeUrl(null); generateToken(); }}
            className="p-2 text-gray-400 hover:text-gov-blue hover:bg-blue-50 rounded-md transition-all duration-200"
            title="تحديث البيانات"
            aria-label="Refresh Dashboard"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            onClick={toggleFullscreen}
            className="p-2 text-gray-400 hover:text-gov-blue hover:bg-blue-50 rounded-md transition-all duration-200"
            title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-gray-50 w-full h-full">
        
        {/* Loading State Overlay */}
        {loading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/90 backdrop-blur-[2px] transition-opacity duration-500">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-100 border-t-gov-blue rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-50 rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-bold mt-6 animate-pulse">جاري تحميل البيانات...</p>
                <p className="text-gray-400 text-xs mt-1">يرجى الانتظار قليلاً</p>
            </div>
        )}

        {/* Error State */}
        {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white p-8 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4 ring-8 ring-red-50/50">
                    <RefreshCcw size={32} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">تعذر تحميل لوحة القيادة</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">{error}</p>
                <button 
                    onClick={() => { setIframeUrl(null); generateToken(); }}
                    className="px-6 py-2.5 bg-gov-blue text-white rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/10 flex items-center gap-2"
                >
                    <RefreshCcw size={16} />
                    إعادة المحاولة
                </button>
            </div>
        ) : iframeUrl ? (
            <iframe
                src={iframeUrl}
                className={`w-full h-full border-0 transition-opacity duration-700 ease-in-out ${loading ? 'opacity-0' : 'opacity-100'}`}
                allowTransparency
                allowFullScreen
                onLoad={handleIframeLoad}
            />
        ) : null}
      </div>
    </div>
  );
};

export default DashboardEmbed;