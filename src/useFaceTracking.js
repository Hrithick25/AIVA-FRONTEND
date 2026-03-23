import { useState, useEffect, useRef } from "react";
import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";

export function useFaceTracking() {
    const [facePos, setFacePos] = useState({ x: 0, y: 0 }); // Normalized -1 to 1
    const videoRef = useRef(null);
    const requestRef = useRef(null);
    const faceDetectorRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);
    const initErrorLoggedRef = useRef(false);

    useEffect(() => {
        let active = true;

        async function init() {
            try {
                // 1. Load MediaPipe Wasm files
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                const faceDetector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                });

                if (!active) return;
                faceDetectorRef.current = faceDetector;

                // 2. Access webcam for real-time tracking
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    if (!initErrorLoggedRef.current) {
                        initErrorLoggedRef.current = true;
                        console.warn("Face tracking disabled: camera APIs not available in this browser/context.");
                    }
                    return;
                }

                let deviceId;
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoInputs = devices.filter((d) => d.kind === "videoinput");
                    if (videoInputs.length > 0) {
                        deviceId = videoInputs[0].deviceId;
                    }
                } catch (e) {
                }

                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: deviceId
                            ? { width: 320, height: 240, deviceId: { exact: deviceId } }
                            : { width: 320, height: 240, facingMode: "user" },
                    });
                } catch (e) {
                    if (!initErrorLoggedRef.current) {
                        initErrorLoggedRef.current = true;
                        const name = e && typeof e === "object" ? e.name : "";
                        if (name === "NotFoundError" || name === "DevicesNotFoundError") {
                            console.warn("Face tracking disabled: no camera device found.");
                        } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
                            console.warn("Face tracking disabled: camera permission denied.");
                        } else {
                            console.warn("Face tracking disabled: unable to access camera.");
                            console.error(e);
                        }
                    }
                    return;
                }

                if (!active) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                const video = document.createElement("video");
                video.srcObject = stream;
                video.playsInline = true;
                video.muted = true;
                video.width = 320;
                video.height = 240;
                videoRef.current = video;

                // 3. Start detecting once video is ready
                video.onloadeddata = () => {
                    if (!active) return;
                    video.play().then(() => {
                        if (active) detect();
                    });
                };
            } catch (err) {
                if (!initErrorLoggedRef.current) {
                    initErrorLoggedRef.current = true;
                    console.error("Face tracking initialization error:", err);
                }
            }
        }

        function detect() {
            if (!active) return;

            const video = videoRef.current;
            const faceDetector = faceDetectorRef.current;

            if (video && faceDetector && video.readyState >= 2) {
                const startTimeMs = performance.now();
                if (lastVideoTimeRef.current !== video.currentTime) {
                    lastVideoTimeRef.current = video.currentTime;

                    try {
                        const detections = faceDetector.detectForVideo(video, startTimeMs);
                        if (detections.detections && detections.detections.length > 0) {
                            const face = detections.detections[0];
                            const bbox = face.boundingBox;

                            // Extract face center relative to video dimensions (0 to 1)
                            const normX = (bbox.originX + bbox.width / 2) / video.width;
                            const normY = (bbox.originY + bbox.height / 2) / video.height;

                            // Convert to -1 to 1 range.
                            // Real-camera is unmirrored. If user moves right, normX decreases towards 0.
                            // (0.5 - normX) maps an unmirrored right movement to positive X, matching lookAt expectations.
                            const mappedX = (0.5 - normX) * 2;
                            const mappedY = (0.5 - normY) * 2;

                            setFacePos({ x: mappedX, y: mappedY });
                        }
                    } catch (e) {
                        console.error("Face Detection Error", e);
                    }
                }
            }
            requestRef.current = requestAnimationFrame(detect);
        }

        init();

        return () => {
            active = false;
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (faceDetectorRef.current) {
                faceDetectorRef.current.close();
            }
        };
    }, []);

    return facePos;
}
