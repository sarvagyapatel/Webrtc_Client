import { useEffect, useState } from "react"

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);


    useEffect(() => {
        const socket = new WebSocket('/ws');
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }
    }, []);

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
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
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
            document.body.appendChild(video);
            // stream.getTracks().forEach((track) => {
            //     pc?.addTrack(track);
            // });
            pc?.addTrack(stream.getTracks()[0])
            console.log(stream)
            
        });
    }

    return <div>
        Sender
        <button onClick={initiateConn}> Send data </button>
    </div>
}