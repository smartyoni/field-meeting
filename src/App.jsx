import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MeetingList from './pages/MeetingList'
import MeetingDetail from './pages/MeetingDetail'
import MeetingForm from './pages/MeetingForm'
import DataManagement from './pages/DataManagement' // 추가
import './styles/App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<MeetingList />} />
          <Route path="/data" element={<DataManagement />} /> // 추가
          <Route path="/meeting/new" element={<MeetingForm />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
          <Route path="/meeting/:id/edit" element={<MeetingForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
