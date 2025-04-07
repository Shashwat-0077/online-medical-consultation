class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            });
        }
    }

    async createOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(
                new RTCSessionDescription(offer)
            );
            return offer;
        }
    }

    async createAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(
                new RTCSessionDescription(offer)
            );
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(
                new RTCSessionDescription(answer)
            );
            return answer;
        }
    }

    async setRemoteAnswer(answer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        }
    }

    async reset() {
        if (this.peer) {
            // Remove all tracks
            this.peer.getSenders().forEach((sender) => {
                try {
                    this.peer.removeTrack(sender);
                } catch (err) {
                    console.warn("Failed to remove track:", err);
                }
            });

            // Remove all event listeners
            this.peer.ontrack = null;
            this.peer.onicecandidate = null;
            this.peer.onnegotiationneeded = null;
            this.peer.onconnectionstatechange = null;

            // Close connection
            this.peer.close();
        }

        // Reinitialize peer
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });
    }
}

const peer = new PeerService();
export default peer;
