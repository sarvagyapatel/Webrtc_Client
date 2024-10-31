import './App.css'
import { Link } from 'react-router-dom'

function App() {

  return (
    <>
      <div>
        <Link to="sender" ><button>Sender</button></Link>
        <Link to="receiver" ><button>Reciever</button></Link>
      </div>
    </>
  )
}

export default App
