import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

function MeetingList() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const meetingsData = []
      querySnapshot.forEach((doc) => {
        meetingsData.push({ ...doc.data(), id: doc.id })
      })
      setMeetings(meetingsData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching meetings: ", error)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-text">미팅 노트</h1>
        <div className="flex items-center space-x-2">
          <Link 
            to="/data"
            className="w-8 h-8 flex items-center justify-center text-lg"
          >
            ⚙️
          </Link>
          <Link 
            to="/meeting/new" 
            className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-lg font-semibold"
          >
            +
          </Link>
        </div>
      </div>

      {/* 미팅 리스트 */}
      <div className="p-4 space-y-3">
        {loading ? (
            <div className="text-center py-12 text-muted">Loading...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>등록된 미팅이 없습니다</p>
            <p className="text-sm mt-1">+ 버튼을 눌러 새 미팅을 추가하세요</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
              <div className="bg-secondary rounded-lg p-4 border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted">
                      {formatDate(meeting.date)}
                    </span>
                    <span className="text-muted">•</span>
                    <span className="font-medium text-text">
                      {meeting.customerName}님
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    meeting.status === '진행중' 
                      ? 'bg-yellow-400 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {meeting.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted">
                  <span>{meeting.purpose}</span>
                  <span>•</span>
                  <span>{meeting.properties.length}개 매물</span>
                </div>
                
                <div className="mt-2 text-sm text-muted truncate">
                  {meeting.properties.map((prop, index) => (
                    <span key={index}>
                      {prop.name}
                      {index < Math.min(meeting.properties.length - 1, 1) && ', '}
                    </span>
                  ))}
                  {meeting.properties.length > 2 && (
                    <span> 외 {meeting.properties.length - 2}곳</span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default MeetingList