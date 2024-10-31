
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {Sender} from './components/Sender'
import {Reciever} from './components/Reciever'
import App from './App'


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<App />}/>
    <Route path="/sender" element={<Sender />} />
    <Route path="/receiver" element={<Reciever />} />
  </Routes>
</BrowserRouter>
)
