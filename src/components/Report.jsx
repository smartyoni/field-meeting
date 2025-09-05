import React from 'react';

const Report = React.forwardRef(({ meeting }, ref) => {
  if (!meeting) return null;

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    <div ref={ref} className="w-[400px] bg-white p-6 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text">미팅 결과 보고서</h1>
        <p className="text-sm text-muted">{formatDate(meeting.date)}</p>
      </div>

      <div className="mb-6 p-4 bg-secondary rounded-lg">
        <h2 className="text-lg font-semibold text-text">고객 정보</h2>
        <div className="mt-2 text-text">
          <p><span className="font-medium">고객명:</span> {meeting.customerName}님</p>
          <p><span className="font-medium">목적:</span> {meeting.purpose}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text mb-2">브리핑 매물</h2>
        {meeting.properties.map((property, index) => (
          <div key={index} className="mb-4 border-t pt-4">
            <h3 className="text-md font-semibold text-accent">{index + 1}. {property.name}</h3>
            <p className="text-sm text-muted mb-2">{property.address}</p>
            
            {property.photos && property.photos.length > 0 && (
              <div className="my-3">
                <p className="text-sm font-medium text-gray-600 mb-1">현장 사진</p>
                <div className="flex space-x-2">
                  {property.photos.map((photo, photoIndex) => (
                    <img 
                      key={photoIndex} 
                      src={photo} 
                      alt={`현장사진 ${photoIndex + 1}`} 
                      className="w-32 h-32 rounded-md object-cover border"
                      crossOrigin="anonymous" // Important for html-to-image
                    />
                  ))}
                </div>
              </div>
            )}

            {property.visitNotes && property.visitNotes.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">현장 메모</p>
                <ul className="list-disc list-inside text-sm text-text">
                  {property.visitNotes.map((note, i) => <li key={i}>{note}</li>)}
                </ul>
              </div>
            )}

            {property.customerReaction && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">고객 반응</p>
                <p className="text-sm text-text">{property.customerReaction}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6 border-t pt-4">
        <p className="text-xs text-muted">본 보고서는 미팅 노트를 통해 생성되었습니다.</p>
      </div>
    </div>
  );
});

export default Report;
