import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Survey from './pages/Survey';
import Admin from './pages/Admin';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/diagnostic/survey/:token" element={<Survey />} />
        <Route path="/diagnostic/admin" element={<Admin />} />
        <Route path="/" element={<Navigate to="/diagnostic/admin" replace />} />
        <Route path="*" element={<Navigate to="/diagnostic/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
