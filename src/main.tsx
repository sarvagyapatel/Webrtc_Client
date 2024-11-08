import ReactDOM from "react-dom/client";
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Sender } from './components/Sender'
import { Reciever } from './components/Reciever'
import Home from "./Home";


const router = createBrowserRouter([
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/sender",
    element: <Sender />
  },
  {
    path: "/receiver",
    element: <Reciever />
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);