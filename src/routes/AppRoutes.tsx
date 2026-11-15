import { Navigate, Route, Routes } from 'react-router-dom';
import { AboutUsPage } from '../pages/AboutUsPage';
import { EngineerDashboardPage } from '../pages/EngineerDashboardPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ReportIssuePage } from '../pages/ReportIssuePage';
import { TrackComplaintPage } from '../pages/TrackComplaintPage';
import { WaterAwarenessPage } from '../pages/WaterAwarenessPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/report" element={<ReportIssuePage />} />
      <Route path="/track" element={<TrackComplaintPage />} />
      <Route path="/engineer" element={<EngineerDashboardPage />} />
      <Route path="/awareness" element={<WaterAwarenessPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
