import { useRef, useState } from "react";

function TwoWay() {

    const [receiverId, setReceiverId] = useState<string>("");
    const [senderId, setSenderId] = useState("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const videoContainerRefSend = useRef<HTMLDivElement>(null);
    const videoContainerRefReceive = useRef<HTMLDivElement>(null);
    const [akg, setAkg] = useState<string>("connect");

    // Configure RTCPeerConnection with STUN and TURN servers
    const pc = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: ["turn:68.183.81.222:3478", "turn:www.vps.sarvagyapatel.in:3478"],
                username: "user", 
                credential: "Ayushsingh$12"
            }
        ]
    });

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

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                target: receiverId,
                owner: 'sender',
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    target: receiverId,
                    owner: 'sender',
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        };

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        };

        // Capture both video and audio from the user's media devices
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            if (videoContainerRefSend.current) {
                videoContainerRefSend.current.appendChild(video);
            }

            // Add all tracks (audio and video) to the RTCPeerConnection
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });
    };

    const receiveVideo = async () => {
        if (!socket) {
            alert("Socket not found");
            return;
        }

        socket.send(JSON.stringify({
            target: receiverId,
            owner: 'receiver'
        }));

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'createOffer') {
                try {
                    await pc.setRemoteDescription(message.sdp);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socket.send(JSON.stringify({
                        target: receiverId,
                        owner: 'receiver',
                        type: 'createAnswer',
                        sdp: answer
                    }));
                } catch (error) {
                    console.error("Error handling createOffer:", error);
                }
            } else if (message.type === 'iceCandidate') {
                try {
                    if (message.candidate) {
                        await pc.addIceCandidate(message.candidate);
                    }
                } catch (error) {
                    console.error("Error adding ICE candidate:", error);
                }
            }
        };

        const video = document.createElement("video");
        video.setAttribute("autoplay", "true");
        video.setAttribute("playsinline", "true");

        if (videoContainerRefReceive.current) {
            videoContainerRefReceive.current.appendChild(video);
        }

        pc.ontrack = (event) => {
            const stream = new MediaStream([event.track]);

            // Assign the received media stream (video and audio) to the video element
            if (event.track.kind === "video") {
                video.srcObject = stream;
            }
        };
    };

    return (
        <div className="flex flex-wrap gap-36 p-20">
            <div className="flex flex-col gap-36 border-black border-2 p-10 rounded-2xl w-fit">
                <div className="flex flex-col gap-10">
                    <div>
                        <input
                            type="text"
                            name="sender_name"
                            placeholder="sender name"
                            className="w-36 border-blue-600 border-2 p-2 rounded-2xl"
                            onChange={(e) => {
                                e.preventDefault();
                                setSenderId(e.target.value);
                            }}
                        />
                    </div>

                    <input
                        type="text"
                        name="receiver_name"
                        placeholder="receiver name"
                        className="w-36 border-blue-600 border-2 p-2 rounded-2xl"
                        onChange={(e) => {
                            e.preventDefault();
                            setReceiverId(e.target.value);
                        }}
                    />
                    <button
                        onClick={() => connect()}
                        className="w-36 bg-orange-600 border-orange-500 rounded-2xl p-2"
                    >
                        {akg}
                    </button>
                </div>

                <div className="w-full h-fit text-gray-950" ref={videoContainerRefSend}></div>

                <div className="flex">
                    <button
                        onClick={sendVideo}
                        className="w-36 bg-blue-600 border-blue-500 rounded-2xl p-2"
                    >
                        Send Data
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-36 border-black border-2 p-10 rounded-2xl justify-end">
                <div className="w-full h-fit text-gray-950" ref={videoContainerRefReceive}></div>

                <div className="flex">
                    <button
                        onClick={receiveVideo}
                        className="w-36 bg-blue-600 border-blue-500 rounded-2xl p-2"
                    >
                        Receive Data
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TwoWay;
