import { useState, useEffect } from 'react';

function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [debugMessage, setDebugMessage] = useState('PWA: 리스너 초기화');

  useEffect(() => {
    setDebugMessage('PWA: 설치 이벤트 대기 중...');
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setDebugMessage('PWA: 설치 가능!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = setTimeout(() => {
        if(window.matchMedia('(display-mode: standalone)').matches) {
            setDebugMessage('PWA: 이미 독립 실행형 모드');
        } else if (!deferredPrompt) {
            setDebugMessage('PWA: 5초 후 이벤트 없음');
        }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt]); // deferredPrompt를 의존성 배열에 추가

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setDebugMessage('PWA: 프롬프트 닫힘');
  };

  return (
    <div className="flex items-center space-x-2">
        <p className="text-xs text-gray-400">{debugMessage}</p>
        {deferredPrompt && (
            <button
                onClick={handleInstallClick}
                className="px-3 py-1 bg-accent text-white text-sm rounded-md animate-pulse"
            >
                앱 설치
            </button>
        )}
    </div>
  );
}

export default InstallPWAButton;