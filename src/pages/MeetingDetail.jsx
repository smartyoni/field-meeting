import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState(null)

  useEffect(() => {
    // 임시 데이터
    const mockMeeting = {
      id: '1',
      customerName: '김철수',
      date: '2024-09-06',
      purpose: '전세',
      status: '진행중',
      properties: [
        {
          id: 'prop_1',
          name: '래미안아파트',
          area_sqm: 84,
          area_pyeong: 25,
          address: '강남구 논현동',
          visitTime: '14:00',
          contact: '010-1234-5678',
          contactType: '집주인',
          status: '볼수있음',
          rent: '전세 5억',
          notes: ['채광 정말 좋음', '리모델링 깔끔함'],
          customerReaction: '매우 만족'
        },
        {
          id: 'prop_2',
          name: '힐스테이트',
          area_sqm: 76,
          area_pyeong: 23,
          address: '강남구 역삼동',
          visitTime: '15:30',
          contact: '010-5678-9012',
          contactType: '부동산',
          status: '확인중',
          rent: '전세 4.5억',
          notes: [],
          customerReaction: ''
        },
        {
          id: 'prop_3',
          name: '자이아파트',
          area_sqm: 93,
          area_pyeong: 28,
          address: '강남구 삼성동',
          visitTime: '16:30',
          contact: '010-9876-5432',
          contactType: '집주인',
          status: '보류',
          rent: '전세 5.5억',
          notes: [],
          customerReaction: ''
        }
      ]
    }
    
    if (id === '1') {
      setMeeting(mockMeeting)
    }
  }, [id])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '볼수있음':
        return 'text-success'
      case '확인중':
        return 'text-warning'
      case '보류':
        return 'text-error'
      default:
        return 'text-muted'
    }
  }

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`
  }

  if (!meeting) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-muted">미팅을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="text-accent font-semibold"
          >
            ← 
          </button>
          <div>
            <h1 className="font-semibold text-text">{meeting.customerName}님 미팅</h1>
            <p className="text-sm text-muted">
              {formatDate(meeting.date)} • {meeting.purpose}
            </p>
          </div>
        </div>
        <Link 
          to={`/meeting/${id}/edit`}
          className="text-accent font-medium"
        >
          편집
        </Link>
      </div>

      {/* 매물 리스트 */}
      <div className="p-4 space-y-4">
        {meeting.properties.map((property, index) => (
          <div key={property.id} className="bg-secondary rounded-lg p-4 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-text">
                  {property.name} {property.area_pyeong}평
                </h3>
                <p className="text-sm text-muted">
                  {property.address} • {property.visitTime}
                </p>
                <p className="text-sm text-muted">
                  {property.rent}
                </p>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
            </div>

            {/* 연락처 */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted">
                {property.contactType}: {property.contact}
              </div>
              <button
                onClick={() => handleCall(property.contact)}
                className="px-3 py-1 bg-accent text-white text-sm rounded-md"
              >
                전화
              </button>
            </div>

            {/* 메모 및 고객 반응 */}
            {(property.notes.length > 0 || property.customerReaction) && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                {property.notes.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted font-medium mb-1">메모</p>
                    {property.notes.map((note, noteIndex) => (
                      <p key={noteIndex} className="text-sm text-text">• {note}</p>
                    ))}
                  </div>
                )}
                {property.customerReaction && (
                  <div>
                    <p className="text-xs text-muted font-medium mb-1">고객 반응</p>
                    <p className="text-sm text-text">{property.customerReaction}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4">
        <button className="w-full bg-accent text-white py-3 rounded-lg font-medium">
          보고서 생성
        </button>
      </div>
    </div>
  )
}

export default MeetingDetail