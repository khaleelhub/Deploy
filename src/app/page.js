'use client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomePage from './screens/WelcomePage';
import LoginPage from './screens/LoginPage';
import SignUpPage from './screens/SignUpPage';
import HomePage from './screens/HomePage';
import Wallet from './screens/Wallet';
import ResetPassword from './screens/ResetPassword';
import ReferralPage from './screens/ReferralPage';
import VideoPage from './screens/VideoPage';
import ProfilePage from './screens/ProfilePage';
import MineCenter from './screens/Minecenter';
import LeaderDashboard from './screens/LeaderDashboard';
import GamingPage from './screens/GamingPage';
import AdminPanel from './screens/AdminPanel';
import TasksPage from './screens/TasksPage';
import MarketPage from './screens/MarketPage';
import SettingPage from './screens/SettingPage';
import SpinToWinPage from './screens/SpinToWinPage';
import BugReportPage from './screens/BugReportPage';
import RewardPage from './screens/RewardPage'; // renamed from RewordPage
import DailyStreakPage from './screens/DailyStreakPage';
import MissionsPage from './screens/MissionsPage';
import AccountUpgradePage from './screens/AccountUpgradePage';
import NewsPage from './screens/NewsPage';
import QuizzesPage from './screens/QuizzesPage';
import AichatPage from './screens/Aichat';
import MiningPage from './screens/MiningTools';
import Donate from './screens/Donate';
import Tutorials from './screens/Tutorials';
import FaqPage from './screens/FaqPage';


function Page() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/videos" element={<VideoPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/minecenter" element={<MineCenter />} />
        <Route path="/leaderboard" element={<LeaderDashboard />} />
        <Route path="/gaming" element={<GamingPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/spin" element={<SpinToWinPage />} />
        <Route path="/report" element={<BugReportPage />} />
        <Route path="/reward" element={<RewardPage />} />
        <Route path="/streak" element={<DailyStreakPage />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/upgrade" element={<AccountUpgradePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/aichat" element={<AichatPage />} />
        <Route path="/miningtools" element={<MiningPage />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/tutorials" element={<Tutorials />} />
        
      </Routes>
    </Router>
  );
}

export default Page;
