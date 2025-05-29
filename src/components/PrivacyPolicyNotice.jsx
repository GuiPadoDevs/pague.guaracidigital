import React, { useState, useEffect } from 'react';

const PrivacyPolicyNotice = ({ onAccept }) => {
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleAccept = () => {
        document.body.style.overflow = 'auto';
        onAccept();
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.banner}>
                <p style={styles.message}>
                    Utilizamos cookies para melhorar sua experiência em nosso site e direcionar conteúdos relevantes para você. Ao continuar, você concorda e aceita nossa Política de Privacidade. Se preferir, informe quais cookies você permite utilizarmos clicando aqui.
                    {!expanded && (
                        <>
                            {' '}
                            <button style={styles.linkButton} onClick={() => setExpanded(true)}>
                                Saber mais
                            </button>
                        </>
                    )}
                </p>

                {expanded && (
                    <div style={styles.expandedText}>
                        <p>
                            Seus dados serão utilizados exclusivamente para processar o pagamento e verificar sua identidade
                            de forma segura. As informações são armazenadas temporariamente e não serão compartilhadas com
                            terceiros sem sua autorização. Para mais detalhes, consulte os termos completos da nossa política.
                        </p>
                    </div>
                )}

                <button style={styles.acceptButton} onClick={handleAccept}>
                    Aceito
                </button>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTop: '1px solid #ccc',
        zIndex: 9999,
        overflowX: 'hidden',
    },
    banner: {
        width: '100%',
        maxWidth: '900px',
        padding: '1rem 34px',
        boxSizing: 'border-box',
        overflowWrap: 'break-word',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        // paddingLeft: 'calc(1rem + env(safe-area-inset-left))',
        // paddingRight: 'calc(1rem + env(safe-area-inset-right))',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        fontSize: '14px',
        margin: '0 auto',
    },
    message: {
        margin: 0,
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: '14px',
        padding: 0,
    },
    expandedText: {
        backgroundColor: '#f8f8f8',
        padding: '0.5rem',
        borderRadius: '4px',
        fontSize: '13px',
    },
    acceptButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default PrivacyPolicyNotice;
