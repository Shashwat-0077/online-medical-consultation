"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const VideoCall = ({ roomId }) => {
    // State that affects rendering
    const [userId] = useState(`user-${Math.floor(Math.random() * 1000000)}`);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const [peerConnections, setPeerConnections] = useState({});

    // Refs for values that don't trigger re-renders and DOM elements
    const localVideoRef = useRef(null);
    const peerVideoRef = useRef(null);
    const socketRef = useRef(null);
    const streamRef = useRef(null);
    const peersRef = useRef({});

    // Initialize socket connection
    useEffect(() => {
        const socketUrl = "http://localhost:5000";
        console.log("Connecting to socket server at:", socketUrl);

        const newSocket = io(socketUrl, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;

        newSocket.on("connect", () => {
            console.log("Connected to socket server");
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            setError(
                "Failed to connect to the video server. Please try again later."
            );
        });

        return () => {
            console.log("Cleaning up socket connection");
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Get media stream
    useEffect(() => {
        if (!socketRef.current) return;

        console.log("Requesting media devices");
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                console.log("Got local media stream");
                streamRef.current = currentStream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = currentStream;
                }

                // Join the room once we have stream and socket
                socketRef.current.emit("join-room", roomId, userId);
                setConnected(true);
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
                setError(
                    "Could not access camera or microphone. Please check permissions."
                );
            });
    }, [roomId, userId]);

    // Handle socket events
    useEffect(() => {
        if (!socketRef.current || !roomId) return;

        // Remove old listeners before adding new ones
        socketRef.current.off("user-connected");
        socketRef.current.off("signal");
        socketRef.current.off("user-disconnected");

        // Handle new user connection
        socketRef.current.on("user-connected", (newUserId) => {
            console.log("New user connected:", newUserId);
            if (streamRef.current) {
                createPeer(newUserId);
            }
        });

        // Handle incoming signal
        socketRef.current.on("signal", ({ userId: signalUserId, signal }) => {
            console.log("Received signal from:", signalUserId);

            if (peersRef.current[signalUserId]) {
                console.log("Forwarding signal to existing peer");
                peersRef.current[signalUserId].signal(signal);
            } else {
                console.log("Creating new peer to answer signal");
                addPeer(signalUserId, signal);
            }
        });

        // Handle user disconnect
        socketRef.current.on("user-disconnected", (disconnectedUserId) => {
            console.log("User disconnected:", disconnectedUserId);
            if (peersRef.current[disconnectedUserId]) {
                peersRef.current[disconnectedUserId].destroy();

                // Remove from refs and state atomically
                delete peersRef.current[disconnectedUserId];
                setPeerConnections((prevPeers) => {
                    const newPeers = { ...prevPeers };
                    delete newPeers[disconnectedUserId];
                    return newPeers;
                });
            }
        });
    }, [roomId]);

    // Clean up media stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                console.log("Stopping media tracks");
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Create a peer connection (initiator)
    const createPeer = useCallback(
        (peerUserId) => {
            if (!streamRef.current || !socketRef.current) {
                console.error(
                    "Cannot create peer: prerequisites not available"
                );
                return;
            }

            console.log(
                "Creating peer connection as initiator for",
                peerUserId
            );
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: streamRef.current,
                config: {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" },
                    ],
                },
            });

            peer.on("signal", (signal) => {
                console.log("Local peer signaling to", peerUserId);
                socketRef.current.emit("signal", {
                    userId: userId,
                    roomId,
                    signal,
                });
            });

            peer.on("stream", (peerStream) => {
                console.log("Received stream from peer", peerUserId);
                if (peerVideoRef.current) {
                    console.log("Setting peer video source");
                    peerVideoRef.current.srcObject = peerStream;
                } else {
                    console.error("peerVideoRef is not available");
                }
            });

            peer.on("connect", () => {
                console.log("Peer connection established with", peerUserId);
            });

            peer.on("error", (err) => {
                console.error(
                    "Peer connection error with",
                    peerUserId,
                    ":",
                    err
                );
            });

            // Store peer in ref and update state
            peersRef.current[peerUserId] = peer;
            setPeerConnections((prev) => ({ ...prev, [peerUserId]: peer }));
        },
        [roomId, userId]
    );

    // Add a peer connection (non-initiator)
    const addPeer = useCallback(
        (peerUserId, incomingSignal) => {
            if (!streamRef.current || !socketRef.current) {
                console.error("Cannot add peer: prerequisites not available");
                return;
            }

            console.log("Creating peer connection as receiver for", peerUserId);
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: streamRef.current,
                config: {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" },
                    ],
                },
            });

            peer.on("signal", (signal) => {
                console.log("Answering peer signaling to", peerUserId);
                socketRef.current.emit("signal", {
                    userId: userId,
                    roomId,
                    signal,
                });
            });

            peer.on("stream", (peerStream) => {
                console.log("Received stream from peer", peerUserId);
                if (peerVideoRef.current) {
                    console.log("Setting peer video source");
                    peerVideoRef.current.srcObject = peerStream;
                } else {
                    console.error("peerVideoRef is not available");
                }
            });

            peer.on("connect", () => {
                console.log("Peer connection established with", peerUserId);
            });

            peer.on("error", (err) => {
                console.error(
                    "Peer connection error with",
                    peerUserId,
                    ":",
                    err
                );
            });

            // Process the incoming signal
            peer.signal(incomingSignal);

            // Store peer in ref and update state
            peersRef.current[peerUserId] = peer;
            setPeerConnections((prev) => ({ ...prev, [peerUserId]: peer }));
        },
        [roomId, userId]
    );

    // Media control functions
    const toggleAudio = useCallback(() => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                console.log("Audio track enabled:", audioTrack.enabled);
            }
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                console.log("Video track enabled:", videoTrack.enabled);
            }
        }
    }, []);

    const endCall = useCallback(() => {
        console.log("Ending call");
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Destroy all peer connections
        Object.values(peersRef.current).forEach((peer) => peer.destroy());
        peersRef.current = {};
        setPeerConnections({});

        // Disconnect socket
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        window.location.href = "/";
    }, []);

    if (error) {
        return (
            <div className="error-container">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="video-call-container">
            <h2>Room: {roomId}</h2>
            <div className="connection-info">
                Your ID: {userId}
                <br />
                Status:{" "}
                {connected ? "Connected to signaling server" : "Connecting..."}
                <br />
                Peer connections: {Object.keys(peerConnections).length}
            </div>
            <div className="video-grid">
                <div className="video-item">
                    <h3>You</h3>
                    <video
                        ref={localVideoRef}
                        muted
                        autoPlay
                        playsInline
                        style={{ width: "100%", maxWidth: "400px" }}
                    />
                </div>
                <div className="video-item">
                    <h3>Peer</h3>
                    {!peerVideoRef.current?.srcObject && connected && (
                        <div className="waiting-peer">
                            Waiting for someone to join...
                        </div>
                    )}
                    <video
                        ref={peerVideoRef}
                        autoPlay
                        playsInline
                        style={{ width: "100%", maxWidth: "400px" }}
                    />
                </div>
            </div>
            <div className="controls">
                <button onClick={toggleAudio}>Toggle Audio</button>
                <button onClick={toggleVideo}>Toggle Video</button>
                <button onClick={endCall}>End Call</button>
            </div>
        </div>
    );
};

export default VideoCall;
