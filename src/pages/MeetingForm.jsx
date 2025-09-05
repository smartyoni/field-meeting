import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, storage } from '../firebase'
import { collection, doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { openDB } from 'idb'

const DB_NAME = 'FieldMeetingDB';
const STORE_NAME = 'buildings';

const initialProperty = {
  name: '',
  address: '',
  visitTime: '',
  contactType: '집주인',
  status: '확인전',
  photos: [],
  buildingInfo: {},
  visitNotes: [],
  customerReaction: ''
};

function MeetingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [customerName, setCustomerName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [purpose, setPurpose] = useState('전세')
  const [properties, setProperties] = useState([{...initialProperty}])
  const [uploading, setUploading] = useState(null)

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = useState(-1);

  useEffect(() => {
    if (!isNew) {
      const fetchMeeting = async () => {
        const docRef = doc(db, 'meetings', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setCustomerName(data.customerName)
          setDate(data.date)
          setPurpose(data.purpose)
          const fetchedProperties = data.properties.map(p => ({ ...initialProperty, ...p }))
          setProperties(fetchedProperties)
        } else {
          navigate('/')
        }
      }
      fetchMeeting()
    }
  }, [id, isNew, navigate])

  const handlePropertyChange = (index, field, value) => {
    const newProperties = [...properties]
    newProperties[index][field] = value
    
    if (field === 'address') {
      newProperties[index].buildingInfo = {}; // 주소 수동 변경 시 건물정보 초기화
      debouncedAddressSearch(value, index);
    } else {
      setAddressSuggestions([]);
    }
    setProperties(newProperties)
  }

  const debouncedAddressSearch = useCallback(
    debounce(async (query, index) => {
      if (query.length < 2) {
        setAddressSuggestions([]);
        return;
      }
      try {
        const db = await openDB(DB_NAME, 1);
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            setAddressSuggestions([]);
            return;
        }
        const allBuildings = await db.getAll(STORE_NAME);
        const suggestions = allBuildings.filter(b => 
          (b.name && b.name.includes(query)) || (b.address && b.address.includes(query))
        );
        setAddressSuggestions(suggestions);
        setActiveSuggestionBox(index);
      } catch (error) {
        console.error("Failed to search buildings", error);
      }
    }, 300), []
  );

  const handleSelectSuggestion = (propIndex, building) => {
    const newProperties = [...properties];
    const currentProp = newProperties[propIndex];
    currentProp.address = building.address || '';
    currentProp.name = currentProp.name || building.name || '';
    currentProp.buildingInfo = building;
    setProperties(newProperties);
    setAddressSuggestions([]);
    setActiveSuggestionBox(-1);
  }

  const handlePhotoUpload = async (index, file) => {
    if (!file || properties[index].photos.length >= 2) return
    setUploading(index)
    const storageRef = ref(storage, `photos/${id || 'new'}/${Date.now()}-${file.name}`)
    try {
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      const newProperties = [...properties]
      newProperties[index].photos.push(downloadURL)
      setProperties(newProperties)
    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setUploading(null)
    }
  }

  const removePhoto = async (propIndex, photoIndex) => {
    const photoURL = properties[propIndex].photos[photoIndex];
    try {
      const photoRef = ref(storage, photoURL);
      await deleteObject(photoRef);
    } catch (error) {
      console.error("Failed to delete photo from storage", error);
      // 그래도 UI에서는 삭제되도록 계속 진행
    }

    const newProperties = [...properties]
    newProperties[propIndex].photos.splice(photoIndex, 1)
    setProperties(newProperties)
  }

  const addProperty = () => {
    setProperties([...properties, { ...initialProperty }])
  }

  const removeProperty = (index) => {
    const newProperties = properties.filter((_, i) => i !== index)
    setProperties(newProperties)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const meetingData = {
      customerName,
      date,
      purpose,
      properties,
      updatedAt: serverTimestamp(),
    }

    try {
      if (isNew) {
        meetingData.createdAt = serverTimestamp()
        meetingData.status = '계획중'
        await addDoc(collection(db, 'meetings'), meetingData)
      } else {
        await setDoc(doc(db, 'meetings', id), meetingData, { merge: true })
      }
      navigate('/')
    } catch (error) {
      console.error("Error saving document: ", error)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button type="button" onClick={() => navigate(-1)} className="text-accent font-semibold">←</button>
          <h1 className="font-semibold text-text">{isNew ? '새 미팅' : '미팅 편집'}</h1>
          <button type="submit" disabled={uploading !== null} className="text-accent font-medium disabled:text-gray-400">저장</button>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label htmlFor="customerName" className="text-sm font-medium text-gray-500">고객명</label>
            <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border rounded-md" placeholder="김철수" required />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2 space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-500">날짜</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-md" required />
            </div>
            <div className="w-1/2 space-y-2">
              <label htmlFor="purpose" className="text-sm font-medium text-gray-500">목적</label>
              <select id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                <option>전세</option>
                <option>월세</option>
                <option>매매</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-text border-b pb-2">매물 정보</h3>
            {properties.map((prop, index) => (
              <div key={index} className="p-4 bg-secondary rounded-lg space-y-3 relative">
                <p className="font-medium text-sm">매물 {index + 1}</p>
                <input type="text" value={prop.name} onChange={(e) => handlePropertyChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md" placeholder="매물명 (예: 래미안아파트 25평)" required />
                <div className="relative">
                  <input type="text" value={prop.address} onChange={(e) => handlePropertyChange(index, 'address', e.target.value)} onFocus={() => setActiveSuggestionBox(index)} className="w-full p-2 border rounded-md" placeholder="주소 (예: 강남구 논현동)" autoComplete="off" />
                  {activeSuggestionBox === index && addressSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                      {addressSuggestions.map((b, i) => (
                        <li key={i} onMouseDown={() => handleSelectSuggestion(index, b)} className="p-2 hover:bg-gray-100 cursor-pointer">
                          <p className="font-medium">{b.name}</p>
                          <p className="text-sm text-gray-500">{b.address}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex space-x-2">
                    <input type="time" value={prop.visitTime} onChange={(e) => handlePropertyChange(index, 'visitTime', e.target.value)} className="w-1/2 p-2 border rounded-md" />
                    <select value={prop.contactType} onChange={(e) => handlePropertyChange(index, 'contactType', e.target.value)} className="w-1/2 p-2 border rounded-md bg-white">
                        <option>집주인</option>
                        <option>부동산</option>
                        <option>세입자</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">사진 (최대 2장)</label>
                    <div className="flex items-center space-x-2">
                        {prop.photos.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative">
                                <img src={photo} alt={`매물사진 ${photoIndex + 1}`} className="w-16 h-16 rounded-md object-cover" />
                                <button type="button" onClick={() => removePhoto(index, photoIndex)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">X</button>
                            </div>
                        ))}
                        {prop.photos.length < 2 && (
                            <label className="w-16 h-16 rounded-md border-2 border-dashed flex items-center justify-center text-gray-400 cursor-pointer">
                                +
                                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(index, e.target.files[0])} className="hidden" />
                            </label>
                        )}
                    </div>
                    {uploading === index && <p className='text-sm text-accent'>업로드 중...</p>}
                </div>
                {properties.length > 1 && (
                  <button type="button" onClick={() => removeProperty(index)} className="absolute top-2 right-2 text-red-500 font-bold">X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addProperty} className="w-full p-2 border-2 border-dashed rounded-lg text-accent">+ 매물 추가</button>
          </div>
        </div>
      </form>
    </div>
  )
}

function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default MeetingForm
