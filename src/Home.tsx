import Reciever from "./components/Reciever"
import Sender from "./components/Sender"

function Home() {
  return (
    <div className="flex flex-wrap w-full h-screen">
        <Sender />
        <Reciever />
    </div>
  )
}

export default Home