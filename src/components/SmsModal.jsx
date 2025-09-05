import React from 'react';

const templates = [
  {
    name: "방문 예정 알림",
    message: "안녕하세요. OOO부동산입니다. 잠시 후 방문 예정이니 확인 부탁드립니다."
  },
  {
    name: "도착 알림", 
    message: "안녕하세요. 매물 앞에 도착했습니다."
  },
  {
    name: "공동현관 비밀번호 요청",
    message: "안녕하세요. 공동현관 앞에 도착했습니다. 비밀번호 다시 한번 부탁드립니다."
  },
  {
    name: "미팅 종료 안내",
    message: "오늘 미팅은 이것으로 마치겠습니다. 검토 후 궁금한 점 있으시면 편하게 연락주세요."
  }
];

function SmsModal({ show, onClose, contact, customerName }) {
  if (!show) {
    return null;
  }

  const handleSendSms = (message) => {
    const processedMessage = message.replace("OOO", customerName);
    const smsLink = `sms:${contact}?body=${encodeURIComponent(processedMessage)}`;
    window.location.href = smsLink;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-text">문자 템플릿 선택</h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {templates.map((template, index) => (
              <button 
                key={index}
                onClick={() => handleSendSms(template.message)}
                className="w-full text-left p-3 bg-secondary rounded-md hover:bg-gray-200"
              >
                <p className="font-medium text-text">{template.name}</p>
                <p className="text-sm text-muted">{template.message}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t text-right">
            <button onClick={onClose} className="text-muted">닫기</button>
        </div>
      </div>
    </div>
  );
}

export default SmsModal;
