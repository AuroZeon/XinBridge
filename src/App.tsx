import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MoodCheckIn from './pages/MoodCheckIn'
import Chat from './pages/Chat'
import Breathing from './pages/Breathing'
import Caregiver from './pages/Caregiver'
import SymptomTracker from './pages/SymptomTracker'
import DoctorQuestions from './pages/DoctorQuestions'
import HopeLibrary from './pages/HopeLibrary'
import QuickSOS from './pages/QuickSOS'
import SleepSupport from './pages/SleepSupport'

function App() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mood" element={<MoodCheckIn />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/breathing/cool" element={<Breathing mode="coolDown" />} />
        <Route path="/breathing" element={<Breathing />} />
        <Route path="/caregiver" element={<Caregiver />} />
        <Route path="/symptoms" element={<SymptomTracker />} />
        <Route path="/doctor" element={<DoctorQuestions />} />
        <Route path="/hope" element={<HopeLibrary />} />
        <Route path="/sos" element={<QuickSOS />} />
        <Route path="/sleep" element={<SleepSupport />} />
      </Routes>
    </div>
  )
}

export default App
