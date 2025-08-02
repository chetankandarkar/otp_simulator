import { Routes, Route } from 'react-router-dom';
import GenerateOtp from './pages/GenerateOtp';
import Success from './pages/Success';
import { GoogleOAuthProvider } from '@react-oauth/google';
import About from './pages/About';
import UnlockUser from './pages/UnlockUser';
import ValidateOtp from './pages/Validateotp';
import Home from './pages/Home';
import Footer from './pages/Footer';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;


function App() {
  return (
    <GoogleOAuthProvider clientId= {clientId}>
    <div style={{ minHeight: '100vh', position: 'relative', paddingBottom: '40px' }}>
    <Routes>
        <Route path="/generateotp" element={<GenerateOtp />} />
        <Route path="/validateotp" element={<ValidateOtp />} />
        <Route path="/success" element={<Success />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/unlockuser" element={<UnlockUser />} />
    </Routes>
    <Footer />
   </div>
 </GoogleOAuthProvider>

  );
}

export default App;
