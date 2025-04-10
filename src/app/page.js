'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./screens/WelcomePage";
import LoginPage from "./screens/LoginPage";
import SignUpPage from "./screens/SignUpPage";
import HomePage  from "./screens/HomePage";
import Wallet from "./screens/Wallet";
import ResetPassword from "./screens/ResentPassword";
import ReferralPage from "./screens/ReferralPage";
import VideoPage from "./screens/VideoPage";
import ProfilePage from "./screens/ProfilePage";
import MineCenter from "./screens/Minecenter";
import LeaderDashboard from "./screens/LeaderDashboard";
import GamingPage from "./screens/GamingPage";
import AdminPanel from "./screens/AdminPanel";
import TasksPage from "./screens/TasksPage";
import MarketPage from "./screens/MarketPage";
import SettingPage from "./screens/SettingPage";
import SpinToWinPage from "./screens/SpinToWinPage";
import BugReportPage from "./screens/BugReportPage";
import RewordPage from "./screens/RewordPage";
import DailyStreakPage from "./screens/DailyStreakPage";
import MissionsPage from "./screens/MissionsPage";
import AccountUpgradePage from "./screens/AccountUpgradePage";
import NewsPage from "./screens/NewsPage";
import QuizzesPage from "./screens/QuizzesPage";
import AichatPage from "./screens/Aichat";
import MiningPage from "./screens/MiningTools";
import Donate from "./screens/Donate";
import Tutorials from "./screens/Tutorials";
import faqPage from "./screens/faqPage";
import supportPage from "./screens/supportPage";
import analyticsPage from "./screens/analyticsPage";
import Communitypage from "./screens/communitypage";


// Navigations 
function Page() {
  return (
    <Router>
      <Routes>
        <Route  path = "/" element={<WelcomePage/>} />
        <Route   path = "/Login" element={<LoginPage/>}/>
        <Route  path = "/SignUp" element={<SignUpPage/>}/>
        <Route  path = "/Wallet" element={<Wallet/>}/>
        <Route  path = "/Resentpassword" element={<ResetPassword/>}/>
        <Route  path = "/Home" element={<HomePage/>}/>
        <Route  path = "/ReferralPage" element={<ReferralPage/>}/>
        <Route  path = "/videos" element={<VideoPage/>}/>
        <Route  path = "/ProfilePage" element={<ProfilePage/>}/>
        <Route  path = "/MineCennter" element={<MineCenter/>}/>
        <Route  path = "/LeaderBoard" element={<LeaderDashboard/>}/>
        <Route  path = "/GamingPage" element={<GamingPage/>}/>
        <Route  path = "/AdminPanel" element={<AdminPanel/>}/>
        <Route  path = "/Tasks" element={<TasksPage/>}/>
        <Route  path = "/Market" element={<MarketPage/>}/>
        <Route  path = "/Settings" element={<SettingPage/>}/>
        <Route  path = "/SpinPage" element={<SpinToWinPage/>}/>
        <Route  path = "/report" element={<BugReportPage/>}/>
        <Route  path = "/Reword" element ={<RewordPage/>}/>
        <Route  path = "/streak" element ={<DailyStreakPage/>}/>
        <Route  path = "/missions" element ={<MissionsPage/>}/>
        <Route  path = "/upgradeAccount" element ={<AccountUpgradePage/>}/>
        <Route  path = "/NewsPage" element ={<NewsPage/>}/>
        <Route  path = "/QuizzesPage" element ={<QuizzesPage/>}/>
        <Route  path = "/Aichat" element ={<AichatPage/>}/>
        <Route  path = "/MiningTools" element ={<MiningPage/>}/>
        <Route  path = "/Donate" element ={<Donate/>}/>
        <Route  path = "/Tutorials" element ={<Tutorials/>}/>
        <Route  path = "/faq" element ={<faqPage/>}/>
        <Route  path = "/support" element ={<supportPage/>}/>
        <Route  path ="/analystics" element = {<analyticsPage/>}/>
        <Route  path ="/community" element = {<Communitypage/>}/>
      </Routes>
    </Router>

  );
}


export default Page;