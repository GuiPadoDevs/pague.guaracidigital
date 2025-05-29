import React, { useRef, useState, useEffect } from 'react';

export default function WebcamCapture({ onCapture, label = "Capturar Imagem" }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [streaming, setStreaming] = useState(false);
    const [preview, setPreview] = useState(null);
    const [videoReady, setVideoReady] = useState(false);
    const [shouldStart, setShouldStart] = useState(false);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    useEffect(() => {
        if (shouldStart && videoRef.current) {
            const start = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const video = videoRef.current;
                    video.srcObject = stream;
                    video.play();
                    video.addEventListener('canplay', () => setVideoReady(true), { once: true });
                    setStreaming(true);
                } catch (err) {
                    alert("Não foi possível acessar a câmera. Verifique se a permissão foi concedida ou se o dispositivo possui câmera.");
                    setShouldStart(false);
                }
            };
            start();
        }
    }, [shouldStart]);

    const captureImage = () => {
        if (!videoReady) {
            alert("Aguardando a câmera carregar. Tente novamente.");
            return;
        }

        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 300, 225);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setPreview(dataUrl);
        onCapture(dataUrl);

        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        setStreaming(false);
        setVideoReady(false);
        setShouldStart(false);
    };

    const handleMouseOver = (e) => {
        e.target.style.backgroundColor = '#0052cc';
        e.target.style.boxShadow = '0 8px 16px rgba(0, 99, 247, 0.6)';
        e.target.style.transform = 'translateY(-2px)';
    };

    const handleMouseOut = (e) => {
        e.target.style.backgroundColor = '#0063F7';
        e.target.style.boxShadow = '0 4px 8px rgba(0, 99, 247, 0.4)';
        e.target.style.transform = 'translateY(0)';
    };

    return (
        <div style={{ marginTop: '10px' }}>
            {!streaming && (
                <button
                    type="button"
                    onClick={() => setShouldStart(true)}
                    style={{
                        ...uploadButtonStyle,
                        // width: isMobile ? 'auto' : '200px'
                    }}
                >
                    {label}
                </button>
            )}

            {(shouldStart || streaming) && (
                <div style={isMobile ? {} : containerDesktopStyle}>
                    {!isMobile && (
                        <div style={cameraStatusStyle}>
                            🟢 Câmera Ativa
                        </div>
                    )}

                    <div style={videoWrapperStyle}>
                        <video
                            ref={videoRef}
                            width="100%"
                            height="100%"
                            style={desktopVideoStyle}
                            autoPlay
                            muted
                        />
                    </div>

                    <button
                        type="button"
                        onClick={captureImage}
                        style={{
                            ...uploadButtonStyle,
                            marginTop: '12px',
                            // width: isMobile ? 'auto' : '200px'
                        }}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        Tirar Foto
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} width="300" height="225" style={{ display: 'none' }} />

            {preview && (
                <img
                    src={preview}
                    alt="Prévia da selfie"
                    style={{
                        ...imagePreviewStyle,
                        marginTop: '10px'
                    }}
                />
            )}
        </div>
    );
}

const uploadButtonStyle = {
    display: 'inline-block',
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#0063F7',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    border: 'none',
    outline: 'none',
    boxShadow: '0 14px 20px rgba(0, 99, 247, 0.4)'
};

const imagePreviewStyle = {
    width: '100%',
    maxWidth: '300px',
    borderRadius: '8px',
    objectFit: 'cover'
};

const containerDesktopStyle = {
    marginTop: '20px',
    backgroundColor: '#0f172a',
    padding: '24px 16px',
    borderRadius: '16px',
    boxShadow: '0 0 12px rgba(0, 99, 247, 0.4)',
    textAlign: 'center',
    maxWidth: '520px',
    marginInline: 'auto',
    position: 'relative'
};

const videoWrapperStyle = {
    width: '100%',
    maxWidth: '480px',
    aspectRatio: '4 / 3',
    border: '2px solid #0063F7',
    borderRadius: '12px',
    overflow: 'hidden',
    marginInline: 'auto',
};

const desktopVideoStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
};

const cameraStatusStyle = {
    position: 'absolute',
    top: '10px',
    left: '16px',
    backgroundColor: '#0f172a',
    color: '#00ff88',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '8px',
    zIndex: 10,
};
