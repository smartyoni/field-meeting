import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { toPng } from 'html-to-image'
import Report from '../components/Report'
import SmsModal from '../components/SmsModal'

function MeetingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef()

  const [showSmsModal, setShowSmsModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState('')

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const docRef = doc(db, 'meetings', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setMeeting({ ...docSnap.data(), id: docSnap.id })
        } else {
          setMeeting(null)
        }
      } catch (error) {
        console.error("Error fetching document: ", error)
      }
      setLoading(false)
    }
    fetchMeeting()
  }, [id])

  const handleOpenSmsModal = (contact) => {
    setSelectedContact(contact)
    setShowSmsModal(true)
  }

  const handleGenerateReport = async () => {
    if (!reportRef.current) return
    setIsGenerating(true)
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2, fetchRequestInit: { mode: 'cors' } })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `미팅보고서_${meeting.customerName}.png`, { type: blob.type })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${meeting.customerName}님 미팅 결과 보고서`, text: `미팅 결과 보고서입니다.` })
      } else {
        const link = document.createElement('a')
        link.download = `미팅보고서_${meeting.customerName}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error('oops, something went wrong!', err)
      alert('보고서 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '볼수있음': return 'text-green-600'
      case '확인중': return 'text-yellow-600'
      case '보류': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const handleCall = (phone) => {
    if (phone) window.location.href = `tel:${phone}`
  }

  if (loading) {
    return <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center"><p className="text-muted">Loading...</p></div>
  }

  if (!meeting) {
    return <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center"><p className="text-muted">미팅을 찾을 수 없습니다</p></div>
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
      <SmsModal show={showSmsModal} onClose={() => setShowSmsModal(false)} contact={selectedContact} customerName={meeting.customerName} />
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}><Report ref={reportRef} meeting={meeting} /></div>

      <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/')} className="text-accent font-semibold">←</button>
          <div>
            <h1 className="font-semibold text-text">{meeting.customerName}님 미팅</h1>
            <p className="text-sm text-muted">{formatDate(meeting.date)} • {meeting.purpose}</p>
          </div>
        </div>
        <Link to={`/meeting/${id}/edit`} className="text-accent font-medium">편집</Link>
      </div>

      <div className="p-4 space-y-4">
        {meeting.properties.map((property, index) => (
          <div key={index} className="bg-secondary rounded-lg p-4 border border-gray-100 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-text">{property.name}</h3>
                <p className="text-sm text-muted">{property.address} • {property.visitTime}</p>
                {property.rent && <p className="text-sm text-muted">{property.rent}</p>}
              </div>
              <span className={`text-sm font-medium ${getStatusColor(property.status)}`}>{property.status}</span>
            </div>

            {property.contact &&
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted">{property.contactType}: {property.contact}</div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenSmsModal(property.contact)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">문자</button>
                    <button onClick={() => handleCall(property.contact)} className="px-3 py-1 bg-accent text-white text-sm rounded-md">전화</button>
                  </div>
                </div>
            }

            {property.buildingInfo && Object.keys(property.buildingInfo).length > 1 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted font-medium mb-1">건물 정보</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {Object.entries(property.buildingInfo).map(([key, value]) => {
                    if (key === 'id' || !value) return null;
                    return (
                      <div key={key}>
                        <span className="text-gray-500">{key}: </span>
                        <span className="text-text">{value}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {property.photos && property.photos.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted font-medium mb-1">현장 사진</p>
                <div className="flex space-x-2 overflow-x-auto">
                  {property.photos.map((photo, photoIndex) => (
                    <img key={photoIndex} src={photo} alt={`현장사진 ${photoIndex + 1}`} className="w-24 h-24 rounded-md object-cover flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}

            {(property.visitNotes?.length > 0 || property.customerReaction) && (
              <div className="border-t pt-3">
                {property.visitNotes?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted font-medium mb-1">메모</p>
                    {property.visitNotes.map((note, noteIndex) => <p key={noteIndex} className="text-sm text-text">• {note}</p>)}
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

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4">
        <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full bg-accent text-white py-3 rounded-lg font-medium disabled:bg-gray-400">
          {isGenerating ? '보고서 생성 중...' : '보고서 생성 및 공유'}
        </button>
      </div>
    </div>
  )
}

export default MeetingDetail
