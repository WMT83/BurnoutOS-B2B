import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Survey from './pages/Survey';
import Admin from './pages/Admin';
import Landing from './pages/Landing';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/diagnostic/survey/:token" element={<Survey />} />
        <Route path="/diagnostic/admin" element={<Admin />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
