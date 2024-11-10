import { useRef, useState } from "react";

function TwoWay() {

    const [receiverId, setReceiverId] = useState<string>("");
    const [senderId, setSenderId] = useState("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const videoContainerRefSend = useRef<HTMLDivElement>(null);
    const videoContainerRefReceive = useRef<HTMLDivElement>(null);
    const [akg, setAkg] = useState<string>("connect");


    const connect = async () => {
        if (!senderId) {
            console.error("Sender ID is required to connect");
            return;
        }

        const socketInstance = new WebSocket(`wss://www.vps.sarvagyapatel.in/ws?clientId=${senderId}`);

        setSocket(socketInstance);

        socketInstance.onerror = (error) => {
            console.error("WebSocket error:", error);
            return;
        };
        setAkg("connected");
    };


    const sendVideo = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }

        socket.send(JSON.stringify({
            target: receiverId,
            owner: 'sender'
        }));

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



        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            if (videoContainerRefSend.current) {
                videoContainerRefSend.current.appendChild(video);
            }

            pc?.addTrack(stream.getTracks()[0])
            console.log(stream)

        });


    }


    const receiveVideo = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }

        socket.send(JSON.stringify({
            target: receiverId,
            owner: 'receiver'
        }));

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
        if (videoContainerRefReceive.current) {
            videoContainerRefReceive.current.appendChild(video);
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
        <div className="flex flex-row gap-36">
            <div className="flex flex-col gap-36 border-black">
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
                            {akg}
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

                <div className="w-full h-fit text-gray-950" ref={videoContainerRefSend}>

                </div>

                <div className="flex">
                    <button
                        onClick={sendVideo}
                        className="w-36 bg-blue-600 border-blue-500 rounded-2xl"
                    >
                        Send Data
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-36 border-black">
                <div className="w-full h-fit text-gray-950" ref={videoContainerRefReceive}>

                </div>

                <div className="flex">
                    <button
                        onClick={receiveVideo}
                        className="w-36 bg-blue-600 border-blue-500 rounded-2xl"
                    >
                        Receive Data
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TwoWay