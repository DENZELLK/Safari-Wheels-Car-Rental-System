import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout'; // Import AdminLayout
import Home from './pages/Home';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Locations from './pages/Locations';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with Navigation and Footer */}
        <Route path="/" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Home />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/privacy" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <PrivacyPolicy />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/terms" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <TermsOfService />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/faq" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <FAQ />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/cars" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Cars />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/cars/:id" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <CarDetails />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/locations" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Locations />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/about" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <About />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/contact" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Contact />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/profile" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Profile />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/login" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Login />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/register" element={
          <div className="App flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Register />
            </main>
            <Footer />
          </div>
        } />

        {/* Admin routes with AdminLayout (no Navigation/Footer) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* Add more admin routes here if needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;