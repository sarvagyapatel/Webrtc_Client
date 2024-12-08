import { useRef, useState } from "react";

function TwoWay() {
    const [receiverId, setReceiverId] = useState<string>("");
    const [senderId, setSenderId] = useState("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const videoContainerRefSend = useRef<HTMLDivElement>(null);
    const videoContainerRefReceive = useRef<HTMLDivElement>(null);
    const [akg, setAkg] = useState<string>("connect");

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

    const pcReceive = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: ["turn:68.183.81.222:3478", "turn:www.vps.sarvagyapatel.in:3478"],
                username: "user",
                credential: "Ayushsingh$12"
            }
        ]
    });
;
;

    const receiveVideo = async (socketGet: WebSocket | null) => {
        if (!socketGet) {
            alert("Socket not found");
            return;
        }

        socketGet.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'createOffer') {
                try {
                    await pcReceive.setRemoteDescription(message.sdp);
                    const answer = await pcReceive.createAnswer();
                    await pcReceive.setLocalDescription(answer);

                    socketGet.send(JSON.stringify({
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
                        await pcReceive.addIceCandidate(message.candidate);
                    }
                } catch (error) {
                    console.error("Error adding ICE candidate:", error);
                }
            }
        };

        const remoteStream = new MediaStream();
        pcReceive.ontrack = (event) => {
            remoteStream.addTrack(event.track);
            if(videoContainerRefReceive.current===null) return;
            const videoElement = videoContainerRefReceive.current.children[0] as HTMLVideoElement;
            videoElement.srcObject = remoteStream;
        };
    };


    const connect = async () => {
        if (!senderId) {
            console.error("Sender ID is required to connect");
            return;
        }

        const socketInstance = new WebSocket(`wss://www.vps.sarvagyapatel.in/ws?clientId=${senderId}&roomId=1`);
        setSocket(socketInstance);

        socketInstance.onerror = (error) => {
            console.error("WebSocket error:", error);
            return;
        };
        setAkg("connected");

        const video = document.createElement("video");
        video.setAttribute("autoplay", "true");
        video.setAttribute("playsinline", "true");
        video.setAttribute("muted", "false");

        if (videoContainerRefReceive.current) {
            videoContainerRefReceive.current.appendChild(video);
        }



        socketInstance.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'createOffer') {
                try {
                    await pcReceive.setRemoteDescription(message.sdp);
                    const answer = await pcReceive.createAnswer();
                    await pcReceive.setLocalDescription(answer);

                    socketInstance.send(JSON.stringify({
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
                        await pcReceive.addIceCandidate(message.candidate);
                    }
                } catch (error) {
                    console.error("Error adding ICE candidate:", error);
                }
            }
        };
        const remoteStream = new MediaStream();
        pcReceive.ontrack = (event) => {
            remoteStream.addTrack(event.track);
            if(videoContainerRefReceive.current===null) return;
            const videoElement = videoContainerRefReceive.current.children[0] as HTMLVideoElement;
            videoElement.srcObject = remoteStream;
        };
    };



    const sendVideo = async (socketGet: WebSocket | null) => {
        if (!socketGet) {
            alert("Socket not found");
            return;
        }

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketGet?.send(JSON.stringify({
                target: receiverId,
                owner: 'sender',
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketGet?.send(JSON.stringify({
                    target: receiverId,
                    owner: 'sender',
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        };

        socketGet.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await pc.setRemoteDescription(message.sdp);
                receiveVideo(socketGet);
            }
        };

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.play();

            if (videoContainerRefSend.current && videoContainerRefSend.current.children.length===0) {
                videoContainerRefSend.current.appendChild(video);
            }
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });
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
                        onClick={(e) => {
                            e.preventDefault();
                            sendVideo(socket)
                        }}
                        className="w-36 bg-blue-600 border-blue-500 rounded-2xl p-2"
                    >
                        Send Data
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-36 border-black border-2 p-10 rounded-2xl justify-end">
                <div className="w-full h-fit text-gray-950" ref={videoContainerRefReceive}></div>
            </div>
        </div>
    );
}

export default TwoWay;
