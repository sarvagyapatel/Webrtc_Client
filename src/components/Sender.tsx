// import { useEffect, useState } from "react"

// export const Sender = () => {
//     const [socket, setSocket] = useState<WebSocket | null>(null);


//     useEffect(() => {
//         const socket = new WebSocket('wss://www.vps.sarvagyapatel.in/socket');
//         setSocket(socket);
// socket.onopen = () => {
//     socket.send(JSON.stringify({
//         type: 'sender'
//     }));
// }
//     }, []);

// const initiateConn = async () => {

//     if (!socket) {
//         alert("Socket not found");
//         return;
//     }

//     const pc = new RTCPeerConnection();

//     pc.onnegotiationneeded = async () => {
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
//         socket?.send(JSON.stringify({
//             type: 'createOffer',
//             sdp: pc.localDescription
//         }));
//     }

//     pc.onicecandidate = (event) => {
//         if (event.candidate) {
//             socket?.send(JSON.stringify({
//                 type: 'iceCandidate',
//                 candidate: event.candidate
//             }));
//         }
//     }

//     socket.onmessage = async (event) => {              
//         const message = JSON.parse(event.data);         
//         if (message.type === 'createAnswer') {          
//             await pc.setRemoteDescription(message.sdp); 
//         } else if (message.type === 'iceCandidate') {    
//             pc.addIceCandidate(message.candidate);      
//         }                                                
//     }                 


//     getCameraStreamAndSend(pc);
// }

// const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
//     navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
//         const video = document.createElement('video');
//         video.srcObject = stream;
//         video.play();
//         // this is wrong, should propogate via a component
//         document.body.appendChild(video);
//         // stream.getTracks().forEach((track) => {
//         //     pc?.addTrack(track);
//         // });
//         pc?.addTrack(stream.getTracks()[0])
//         console.log(stream)

//     });
// }

//     return <div>
//         Sender
//         <button onClick={initiateConn}> Send data </button>
//     </div>
// }





import { useRef, useState } from "react";

function Sender() {
    const [receiverId, setReceiverId] = useState<string>("");
    const [senderId, setSenderId] = useState("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);


    const connect = async () => {
        if (!senderId) {
            console.error("Sender ID is required to connect");
            return;
        }

        const socketInstance = new WebSocket(`wss://www.vps.sarvagyapatel.in/ws?clientId=${senderId}`);

        setSocket(socketInstance);

        socketInstance.onopen = () => {
            socketInstance.send(JSON.stringify({
                target: receiverId,
                owner: 'sender'
            }));
        }

        socketInstance.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    };


    const initiateConn = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }

        const pc = new RTCPeerConnection();

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                target: receiverId,
                owner: 'sender',
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    target: receiverId,
                    owner: 'sender',
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }


        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            if (videoContainerRef.current) {
                videoContainerRef.current.appendChild(video);
            }

            pc?.addTrack(stream.getTracks()[0])
            console.log(stream)

        });
    }



    return (
        <div className="flex flex-col gap-36">
            <div className="flex flex-row gap-10">
        <div>
          <input
            type="text"
            name="sender_name"
            placeholder="sender name"
            className="w-28 border-blue-600"
            onChange={(e) => {
              e.preventDefault();
              setSenderId(e.target.value);
            }}
          />
          <button
            onClick={() => connect()}
            className="w-36 bg-orange-600 border-orange-500 rounded-2xl"
          >
            Connect
          </button>
        </div>

        <input
          type="text"
          name="receiver_name"
          placeholder="receiver name"
          className="w-28 border-blue-600"
          onChange={(e) => {
            e.preventDefault();
            setReceiverId(e.target.value);
          }}
        />
      </div>

            <div className="w-full h-fit text-gray-950" ref={videoContainerRef}>

            </div>

            <div className="flex">
                <button
                    onClick={initiateConn}
                    className="w-36 bg-blue-600 border-blue-500 rounded-2xl"
                >
                    Send Data
                </button>
            </div>
        </div>
    );
}

export default Sender;
