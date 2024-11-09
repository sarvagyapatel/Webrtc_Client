// import { useEffect } from "react"

// export const Reciever = () => {

//     useEffect(() => {
//         const socket = new WebSocket('wss://www.vps.sarvagyapatel.in/socket');
//         socket.onopen = () => {
//             socket.send(JSON.stringify({
//                 type: 'receiver'
//             }));
//         }
//         startReceiving(socket);
//     }, []);

// function startReceiving(socket: WebSocket) {
//     const video = document.createElement('video');
//     document.body.appendChild(video);
//     const pc = new RTCPeerConnection();


//     socket.onmessage = (event) => {
//         const message = JSON.parse(event.data);
//         if (message.type === 'createOffer') {
//             pc.setRemoteDescription(message.sdp).then(() => {
//                 pc.createAnswer().then((answer) => {
//                     pc.setLocalDescription(answer);
//                     socket.send(JSON.stringify({
//                         type: 'createAnswer',
//                         sdp: answer
//                     }));
//                 });
//             });
//         } else if (message.type === 'iceCandidate') {
//             console.log(message.candidate)
//             pc.addIceCandidate(message.candidate);
//         }
//     }

//     pc.ontrack = (event) => {
//         const obj = new MediaStream([event.track]);;
//         video.srcObject = obj
//         video.play();
//     }
// }

//     return <div>
//        <button className="w-36 h-10 bg-slate-600">recieve</button>
//     </div>
// }















import { useRef, useState } from "react";

function Reciever() {
    const [senderId, setSenderId] = useState("");
    const [receiverId, setReceiverId] = useState<string>("");
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
                owner: 'receiver'
            }));
        }

        socketInstance.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    };


    function startReceiving() {

        if (!socket) {
            alert("Socket not found");
            return;
        }


        const pc = new RTCPeerConnection();


        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            target: receiverId,
                            owner: 'receiver',
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                console.log(message.candidate)
                pc.addIceCandidate(message.candidate);
            }
        }

        const video = document.createElement("video") as HTMLVideoElement;
        video.setAttribute("autoplay", "true");
        video.setAttribute("playsinline", "true"); // Ensures it works on mobile devices without fullscreen
        video.setAttribute("muted", "true"); // Optional, mute the video if needed

        // Append the video element to the div referenced by videoContainerRef
        if (videoContainerRef.current) {
            videoContainerRef.current.appendChild(video);
        }

        // Define the type of the incoming event object for ontrack
        const onTrackHandler = (event: RTCTrackEvent): void => {
            // Ensure that the track is available and attach it to the video element
            const obj = new MediaStream([event.track]);
            video.srcObject = obj;
            video.play();
        };

        // Example: Assign the ontrack handler to the WebRTC PeerConnection
        pc.ontrack = onTrackHandler;
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
                    onClick={startReceiving}
                    className="w-36 bg-blue-600 border-blue-500 rounded-2xl"
                >
                    Receive Data
                </button>
            </div>
        </div>
    );
}

export default Reciever;
