import { lazy, Suspense, useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Logo from "./components/Logo";
import WalletButton from "./components/WalletButton";
import { useSourceWatch } from "./context/SourceWatchContext";
import "./styles.css";

const Home = lazy(() => import("./pages/Home"));
const Sources = lazy(() => import("./pages/Sources"));
const Register = lazy(() => import("./pages/Register"));
const SourceDetail = lazy(() => import("./pages/SourceDetail"));
const ReportDetail = lazy(() => import("./pages/ReportDetail"));
const About = lazy(() => import("./pages/About"));

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => window.scrollTo(0, 0), [pathname]); return null; }

export default function App() {
  const { wallet } = useSourceWatch();
  return <div className="app-shell">
    <header className="topbar"><Link to="/"><Logo /></Link><nav><Link to="/sources">Monitors</Link><Link to="/about">How it works</Link><Link to="/register" className="nav-create">+ Add source</Link></nav><WalletButton /></header>
    {wallet.error && <div className="wallet-error">{wallet.error}</div>}
    <ScrollTop />
    <main><Suspense fallback={<div className="loading-screen"><span className="loader" />Loading SourceWatch…</div>}><Routes><Route path="/" element={<Home />} /><Route path="/sources" element={<Sources />} /><Route path="/register" element={<Register />} /><Route path="/source/:id" element={<SourceDetail />} /><Route path="/report/:id" element={<ReportDetail />} /><Route path="/about" element={<About />} /><Route path="*" element={<Home />} /></Routes></Suspense></main>
    <footer><Link to="/"><Logo /></Link><span>Semantic change monitoring powered by GenLayer consensus.</span><a href="https://genlayer.com" target="_blank" rel="noreferrer">GenLayer ↗</a></footer>
  </div>;
}
