import './App.css'
import Navbar from './components/Navbar/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login/Login'
import Hero from './components/Hero/Hero'
import AboutHero from './components/About/AboutHero'
import SuccessStories from './components/Achievements/SuccessStories'
import YouTubeVideos from './components/YouTubeVideos/YouTubeVideos'
import AllAchievers from './components/Achievements/AllAchievers'
import Testimonials from './components/Testimonals/Testimonials'
import WriteReview from './components/Testimonals/WriteReview'
import AllReviews from './components/Testimonals/AllReviews'
import { ReviewsProvider } from './components/context/ReviewsContext'

import Footer from './components/Footer/Footer'
import Admin from './components/Admin/Admin'
import AdminPanel from './components/AdminPanel/AdminPanel'
import RequireAuth from './components/Auth/RequireAuth'
import AptitudeTest from './components/AptitudeTest/AptitudeTest'
import CareerAptitudeTest from './components/AptitudeTest/CareerAptitudeTest'

function App() {

  return (
    <> 
      <BrowserRouter>
        <ReviewsProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<>
              <Hero />
              <AboutHero />
              <SuccessStories />
              <Testimonials />
              <YouTubeVideos />
              
              <Footer />
            </>} />
            <Route path="/login" element={<Login />} />
            <Route path="/allachievers" element={<AllAchievers />} />
            <Route path="/writereview" element={<WriteReview />} />
            <Route path="/allreviews" element={<AllReviews />} />
            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
            <Route path="/admin-panel" element={<RequireAuth><AdminPanel /></RequireAuth>} />
            <Route path="/aptitude-test" element={<AptitudeTest />} />
            <Route path="/career-aptitude-test" element={<CareerAptitudeTest />} />
            </Routes>
        </ReviewsProvider>
      </BrowserRouter>
    </>
  )
}

export default App
