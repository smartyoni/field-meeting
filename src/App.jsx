import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MeetingList from './pages/MeetingList'
import MeetingDetail from './pages/MeetingDetail'
import './styles/App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<MeetingList />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App