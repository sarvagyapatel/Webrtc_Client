import { useEffect } from "react"

export const Reciever = () => {
    
    useEffect(() => {
        const socket = new WebSocket('/ws');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);
    }, []);

    function startReceiving(socket: WebSocket) {
        const video = document.createElement('video');
        document.body.appendChild(video);
        const pc = new RTCPeerConnection();
  

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
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

        pc.ontrack = (event) => {
            const obj = new MediaStream([event.track]);;
            video.srcObject = obj
            video.play();
        }
    }

    return <div>

    </div>
}