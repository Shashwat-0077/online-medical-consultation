"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const VideoCall = ({ roomId }) => {
    const [socket, setSocket] = useState(null);
    const [peers, setPeers] = useState({});
    const [stream, setStream] = useState(null);
    const [userId, setUserId] = useState("");
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    // Use refs for pieces of state that shouldn't trigger re-renders
    const peersRef = useRef({});
    const localVideoRef = useRef(null);
    const peerVideoRef = useRef(null);
    const socketRef = useRef(null);
    const streamRef = useRef(null);
    const userIdRef = useRef("");

    // Initialize socket connection - only once
    useEffect(() => {
        const newUserId = `user-${Math.floor(Math.random() * 1000000)}`;
        setUserId(newUserId);
        userIdRef.current = newUserId;

        const socketUrl = "http://localhost:5000";
        console.log("Connecting to socket server at:", socketUrl);

        const newSocket = io(socketUrl, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);
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
    }, []); // Empty dependency array - run only once

    // Get media stream - only when socket is available and once
    useEffect(() => {
        if (!socket) return;

        console.log("Requesting media devices");
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                console.log("Got local media stream");
                setStream(currentStream);
                streamRef.current = currentStream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = currentStream;
                }

                // Once we have the stream and socket connection, join the room
                socket.emit("join-room", roomId, userIdRef.current);
                setConnected(true);
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
                setError(
                    "Could not access camera or microphone. Please check permissions."
                );
            });
    }, [socket, roomId]); // Only re-run if socket or roomId changes

    // Handle socket events - separate from state updates
    useEffect(() => {
        if (!socket || !roomId) return;

        // IMPORTANT: Remove old listeners before adding new ones
        socket.off("user-connected");
        socket.off("signal");
        socket.off("user-disconnected");

        // Handle new user connection
        socket.on("user-connected", (newUserId) => {
            console.log("New user connected:", newUserId);
            if (streamRef.current) {
                // Create a new peer connection
                createPeer(newUserId);
            }
        });

        // Handle incoming signal
        socket.on("signal", ({ userId: signalUserId, signal }) => {
            console.log("Received signal from:", signalUserId);

            if (peersRef.current[signalUserId]) {
                console.log("Forwarding signal to existing peer");
                peersRef.current[signalUserId].signal(signal);
            } else {
                console.log("Creating new peer to answer signal");
                // This is an offer, create a new peer to answer
                addPeer(signalUserId, signal);
            }
        });

        // Handle user disconnect
        socket.on("user-disconnected", (disconnectedUserId) => {
            console.log("User disconnected:", disconnectedUserId);
            if (peersRef.current[disconnectedUserId]) {
                peersRef.current[disconnectedUserId].destroy();

                // Use functional updates to avoid capturing stale state
                setPeers((prevPeers) => {
                    const newPeers = { ...prevPeers };
                    delete newPeers[disconnectedUserId];
                    return newPeers;
                });

                // Also update the ref
                const newPeersRef = { ...peersRef.current };
                delete newPeersRef[disconnectedUserId];
                peersRef.current = newPeersRef;
            }
        });
    }, [socket, roomId]);

    // Clean up media stream on component unmount
    useEffect(() => {
        return () => {
            if (stream) {
                console.log("Stopping media tracks");
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    // Create a peer connection (initiator) - use callback to avoid recreating on render
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
                    userId: userIdRef.current,
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

            // Store the peer in both state and ref
            peersRef.current[peerUserId] = peer;
            setPeers((prevPeers) => ({
                ...prevPeers,
                [peerUserId]: peer,
            }));
        },
        [roomId]
    );

    // Add a peer connection (non-initiator) - use callback to avoid recreating on render
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
                    userId: userIdRef.current,
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

            // Important: process the incoming signal
            peer.signal(incomingSignal);

            // Store the peer in both state and ref
            peersRef.current[peerUserId] = peer;
            setPeers((prevPeers) => ({
                ...prevPeers,
                [peerUserId]: peer,
            }));
        },
        [roomId]
    );

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                console.log("Audio track enabled:", audioTrack.enabled);
            }
        }
    }, []);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                console.log("Video track enabled:", videoTrack.enabled);
            }
        }
    }, []);

    // End call
    const endCall = useCallback(() => {
        console.log("Ending call");
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Disconnect all peers
        Object.values(peersRef.current).forEach((peer) => peer.destroy());
        peersRef.current = {};
        setPeers({});

        // Leave room
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
                Peer connections: {Object.keys(peers).length}
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
