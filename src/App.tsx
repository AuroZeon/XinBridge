import { Routes, Route } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import Home from './pages/Home'
import MoodCheckIn from './pages/MoodCheckIn'
import { WebLLMProvider } from './contexts/WebLLMContext'
import { MotionCalmProvider } from './contexts/MotionCalmContext'
import { AmbientDarkProvider } from './contexts/AmbientDarkContext'
import Chat from './pages/Chat'
import Breathing from './pages/Breathing'
import Caregiver from './pages/Caregiver'
import SymptomTracker from './pages/SymptomTracker'
import DoctorQuestions from './pages/DoctorQuestions'
import HopeLibrary from './pages/HopeLibrary'
import QuickSOS from './pages/QuickSOS'
import SleepSupport from './pages/SleepSupport'
import Games from './pages/Games'
import Gallery from './pages/Gallery'

function App() {
  return (
    <AmbientDarkProvider>
      <MotionCalmProvider>
        <div className="min-h-dvh bg-[var(--color-bg)]">
          <ScrollToTop />
          <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mood" element={<MoodCheckIn />} />
        <Route path="/chat" element={<WebLLMProvider><Chat /></WebLLMProvider>} />
        <Route path="/breathing/cool" element={<Breathing mode="coolDown" />} />
        <Route path="/breathing" element={<Breathing />} />
        <Route path="/caregiver" element={<Caregiver />} />
        <Route path="/symptoms" element={<SymptomTracker />} />
        <Route path="/doctor" element={<DoctorQuestions />} />
        <Route path="/hope" element={<HopeLibrary />} />
        <Route path="/sos" element={<QuickSOS />} />
        <Route path="/sleep" element={<SleepSupport />} />
        <Route path="/games" element={<Games />} />
        <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </div>
      </MotionCalmProvider>
    </AmbientDarkProvider>
  )
}

export default App
