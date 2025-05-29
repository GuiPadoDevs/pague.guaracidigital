import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { IMaskInput } from 'react-imask';
import { useParams } from 'react-router-dom';

import WebcamCapture from './WebcamCaptura.jsx';
import PrivacyPolicyNotice from './PrivacyPolicyNotice.jsx';

const schema = z.object({
    nome: z.string().min(3, 'Nome muito curto'),
    email: z.string().email('E-mail inválido'),
    telefone: z.string().min(14, 'Telefone incompleto'),
});

export default function PaymentForm() {
    const { id: linkId } = useParams();
    const [progress, setProgress] = useState(0);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [selfiePreview, setSelfiePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selfieBase64, setSelfieBase64] = useState(null);
    const fotoRef = useRef(null);
    const selfieRef = useRef(null);
    const [accepted, setAccepted] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    useEffect(() => {
        const pingBackend = async () => {
            try {
                // await axios.get('https://payment-link-server-v2.vercel.app/api/ping');
                await axios.get('http://172.17.1.11:3001/api/ping');
                console.log('Servidor acordado');
                setIsLoading(false);
            } catch (err) {
                console.warn('Falha ao acordar servidor:', err);
            }
        };

        pingBackend();
    }, []);

    // const handleFileChange = (e, setPreview) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => setPreview(reader.result);
    //         reader.readAsDataURL(file);
    //     }
    // };

    const onSubmit = async (data) => {
        if (!fotoRef.current?.files[0] || !selfieBase64) {
            alert('Por favor, selecione as imagens.');
            return;
        }

        function dataURLtoFile(dataUrl, filename) {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new File([u8arr], filename, { type: mime });
        }


        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));

        const fotoFile = isMobileDevice() && fotoRef.current.compressedFile
            ? fotoRef.current.compressedFile
            : fotoRef.current.files[0];
        formData.append('fotoDocumento', fotoFile);

        if (selfieBase64) {
            const selfieFile = dataURLtoFile(selfieBase64, 'selfie.jpg');
            formData.append('selfieDocumento', selfieFile);
        }

        formData.append('linkId', linkId);

        try {
            // TODO: Fazer dinamico link producao e local

            // -> URL Local
            // const response = await axios.post('http://localhost:3001/api/submit-payment', formData, {
            //     onUploadProgress: (e) =>
            //     setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
            //     headers: {
            //     'Content-Type': 'multipart/form-data',
            //     },
            // });

            // -> URL Producao
            console.log(formData);
            // const response = await axios.post('https://payment-link-server-v2.vercel.app/api/submit-payment', formData, {
            const response = await axios.post('http://172.17.1.11:3001/api/submit-payment', formData, {
                onUploadProgress: (e) =>
                    setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            const { redirectUrl } = response.data;

            if (redirectUrl) {
                if (redirectUrl) {
                    const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://${redirectUrl}`;
                    window.location.assign(fullUrl);
                }
            } else {
                alert('Pagamento enviado com sucesso!');
            }
        } catch (err) {
            console.error('Erro ao enviar pagamento:', err);
            alert('Erro ao enviar pagamento. Tente novamente.\n' + err.message);
        }
};

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Carregando...
        </div>;
    }

    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    const compressImage = (file, maxWidth = 1024, quality = 0.7) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

    const handleFileChange = async (e, setPreview) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let processedFile = file;
        if (isMobileDevice()) {
            processedFile = await compressImage(file);
        }

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(processedFile);

        fotoRef.current.compressedFile = processedFile; // guardando versão compactada
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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f9f9f9',
            fontFamily: 'Arial, sans-serif',
            overflowY: 'hidden'
        }}>
            {!accepted && <PrivacyPolicyNotice onAccept={() => setAccepted(true)} />}

            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                filter: !accepted ? 'blur(2px)' : 'none' }}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{
                        width: '100%',
                        maxWidth: '480px',
                        padding: '30px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        fontFamily: 'Arial, sans-serif'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        maxWidth: '150px',
                        margin: '0 auto'
                    }}>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{
                                width: '210px',
                                height: 'auto',
                                display: 'block',
                            }}
                        />
                    </div>
                    <h1 style={{
                        color: '#0063F7',
                        textAlign: 'center',
                        marginBottom: '20px',
                        fontSize: '24px',
                    }}>
                        Finalizar Pagamento
                    </h1>

                    <div style={fieldContainer}>
                        <label style={labelStyle}>Nome Completo</label>
                        <input
                            {...register('nome')}
                            style={inputFocused === 'nome' ? {...inputStyle, ...inputFocusStyle} : inputStyle}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                        />
                        {errors.nome && <span style={errorStyle}>{errors.nome.message}</span>}
                    </div>

                    <div style={fieldContainer}>
                        <label style={labelStyle}>E-mail</label>
                        <input
                            type="email"
                            {...register('email')}
                            style={inputFocused === 'email' ? {...inputStyle, ...inputFocusStyle} : inputStyle}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                        />
                        {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
                    </div>

                    <div style={fieldContainer}>
                        <label style={labelStyle}>Telefone</label>
                        <Controller
                            name="telefone"
                            control={control}
                            render={({ field }) => (
                                <IMaskInput
                                    {...field}
                                    mask="(00) 00000-0000"
                                    placeholder="(00) 00000-0000"
                                    style={inputFocused === 'telefone' ? {...inputStyle, ...inputFocusStyle} : inputStyle}
                                        onFocus={() => setInputFocused(true)}
                                        onBlur={() => setInputFocused(false)}
                                />
                            )}
                        />
                        {errors.telefone && <span style={errorStyle}>{errors.telefone.message}</span>}
                    </div>

                    <div style={fieldContainer}>
                        <label style={labelStyle}>Documento oficial com foto</label>
                        <label style={uploadButtonStyle}>
                            Selecionar Foto
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={fotoRef}
                                onChange={(e) => handleFileChange(e, setFotoPreview)}
                                required
                                style={{ display: 'none' }}
                                onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut}
                            />
                        </label>
                        {fotoPreview && (
                            <img src={fotoPreview} alt="Documento" style={imagePreviewStyle} />
                        )}
                    </div>

                    <div style={fieldContainer}>
                        <label style={labelStyle}>Selfie com Documento</label>
                        {isMobileDevice() ? (
                            <>
                                <label style={uploadButtonStyle}>
                                    Tirar Selfie
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        ref={selfieRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setSelfieBase64(reader.result);
                                                    setSelfiePreview(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        required
                                        style={{ display: 'none' }}
                                        onMouseOver={handleMouseOver}
                                        onMouseOut={handleMouseOut}
                                    />
                                </label>
                                {selfiePreview && (
                                    <img src={selfiePreview} alt="Selfie" style={imagePreviewStyle} />
                                )}
                            </>
                        ) : (
                            <WebcamCapture
                                label="Tirar Selfie"
                                onCapture={(dataUrl) => {
                                    setSelfieBase64(dataUrl);
                                    setSelfiePreview(dataUrl);
                                }}
                            />
                        )}
                    </div>

                    {progress > 0 && (
                        <progress
                            value={progress}
                            max="100"
                            style={{ width: '100%', height: '20px', marginTop: '10px' }}
                        />
                    )}

                    <button
                        type="submit"
                        style={{
                            marginTop: '20px',
                            padding: '14px',
                            backgroundColor: '#0063F7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            boxShadow: '0 14px 20px rgba(0, 99, 247, 0.4)'
                        }}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        Concluir
                    </button>
                </form>
                <a
                    href="https://wa.me/5514991155447"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        backgroundColor: '#25D366',
                        borderRadius: '50%',
                        padding: '12px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        transition: 'transform 0.3s',
                        cursor: 'pointer',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    aria-label="Fale conosco pelo WhatsApp"
                >
                    <img
                        src="/WhatsApp_Logo.png"
                        alt="WhatsApp"
                        style={{
                            width: '50px',
                            height: '50px',
                        }}
                    />
                </a>

            </div>
        </div>
    );
}

// Styles
const inputStyle = {
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#ffffff',
    color: '#000000',
    outline: 'none',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
};

const inputFocusStyle = {
    borderColor: '#0063F7',
    boxShadow: '0 0 8px rgba(0, 99, 247, 0.5)',
};

const fieldContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
};

const labelStyle = {
    fontSize: '14px',
    color: '#222',
    fontWeight: '600',
    marginBottom: '6px',
    textShadow: '0 1px 1px rgba(0,0,0,0.05)',
};

const errorStyle = {
    color: 'red',
    fontSize: '12px',
    marginTop: '4px'
};

const imagePreviewStyle = {
    width: '100%',
    maxWidth: '300px',
    marginTop: '10px',
    borderRadius: '8px',
    objectFit: 'cover'
};

const uploadButtonStyle = {
    display: 'inline-block',
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
    boxShadow: '0 8px 20px rgba(0, 99, 247, 0.4)'
};
