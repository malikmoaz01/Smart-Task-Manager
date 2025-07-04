import './App.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Footer from './Components/Footer';
import Categories from './Components/Category';
import Deadlines from './Components/Deadline';
import Reminders from './Components/Reminder';
import Login from './Components/Login';
import Signup from './Components/Signup';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Categories />} />
        <Route path="/deadlines" element={<Deadlines />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
