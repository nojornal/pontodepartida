const shareModal = document.getElementById('share-modal');

function sharePodcast() {
    const podcastTitle = document.getElementById('banner-title').textContent;
    const podcastDescription = document.getElementById('banner-description').textContent;
    const currentUrl = window.location.href;
    
    const podcastImage = document.getElementById('podcast-image');
    let imageUrl = '';
    
    if (podcastImage) {
        const currentGradient = Array.from(podcastImage.classList).find(cls => 
            cls.startsWith('gradient-')
        );
        if (currentGradient) {
            imageUrl = getGradientImageUrl(currentGradient);
        }
    }
    
    showShareModal(podcastTitle, currentUrl, imageUrl, podcastDescription);
}

function showShareModal(title, url, imageUrl, description) { 
    if (!shareModal) return;

    shareModal.classList.remove('hidden');
    
    setTimeout(() => {
        const modalContent = document.getElementById('share-modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }
    }, 10);
 
    let currentHandleEsc;
    
    const setupEscListener = () => {
        document.removeEventListener('keydown', currentHandleEsc); 
        currentHandleEsc = (e) => {
            if (e.key === 'Escape') {
                hideShareModal();
                document.removeEventListener('keydown', currentHandleEsc);
            }
        };
        document.addEventListener('keydown', currentHandleEsc);
    };

    setupEscListener();
    
    
    const closeModalElements = shareModal.querySelectorAll('.close-share-modal, #close-modal-x');
    
    closeModalElements.forEach(button => {
        button.removeEventListener('click', hideShareModal);
        button.addEventListener('click', hideShareModal);
    });
    
    shareModal.removeEventListener('click', handleOverlayClick);
    shareModal.addEventListener('click', handleOverlayClick);

    function handleOverlayClick(e) {
        if (e.target === shareModal) {
            hideShareModal();
        }
    }

    const shareOptions = shareModal.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.onclick = () => { 
            document.removeEventListener('keydown', currentHandleEsc); 
            const platform = option.dataset.platform;
            
            switch(platform) {
                case 'whatsapp':
                    shareToWhatsAppStatus(title, url, imageUrl, description); 
                    break;
                case 'instagram':
                    shareToInstagramDirect(title, url, imageUrl, description); 
                    break;
                case 'copy':
                    copyToClipboard(url);
                    break;
            }
            hideShareModal();
        };
    });
}

function hideShareModal() {
    if (!shareModal) return;
    
    const modalContent = document.getElementById('share-modal-content');
    if (modalContent) {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
    }
    
    setTimeout(() => {
        shareModal.classList.add('hidden');
    }, 300);
}

function shareToWhatsAppStatus(title, url, imageUrl, description) { 
    createShareImage(title, url, imageUrl, 'whatsapp-status', description) 
        .then(imageDataUrl => {
            const statusUrl = `whatsapp://send?text=${encodeURIComponent(`Confira: ${title}\n${description}\n${url}`)}`;
            window.location.href = statusUrl;
            
            setTimeout(() => {
                if (!document.hidden) { 
                    showShareNotification('Não foi possível abrir o WhatsApp diretamente. Imagem gerada, mas você precisará salvar e postar no Status manualmente.');
                }
            }, 1000);
        })
        .catch(error => {
            console.error('Erro ao criar imagem:', error);
            showShareNotification('Erro ao preparar compartilhamento');
        });
}

function shareToInstagramDirect(title, url, imageUrl, description) {
    createShareImage(title, url, imageUrl, 'instagram-direct', description) 
        .then(imageDataUrl => {
            const instagramUrl = `instagram://library?LocalIdentifier=${encodeURIComponent(imageDataUrl)}`;
            window.location.href = instagramUrl;
            
            setTimeout(() => {
                if (!document.hidden) { 
                    downloadImageForSharing(imageDataUrl, title);
                    showShareNotification('Imagem baixada! Agora você pode compartilhar no Instagram Direct manualmente.');
                }
            }, 1000);
        })
        .catch(error => {
            console.error('Erro ao criar imagem:', error);
            showShareNotification('Erro ao preparar imagem');
        });
}

function downloadImageForSharing(dataUrl, title) {
    try {
        const link = document.createElement('a');
        const fileName = `podcast-${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
        link.download = fileName;
        link.href = dataUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erro ao baixar imagem:', error);
        showShareNotification('Erro ao baixar imagem');
    }
}


function createShareImage(title, url, imageUrl, type, description) { 
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 1080;
            canvas.height = 1920;
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#8B5CF6');
            gradient.addColorStop(1, '#3B82F6');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            
            ctx.font = 'bold 60px Arial, sans-serif';
            const titleLines = wrapText(ctx, title, canvas.width * 0.8, 60);
            let yPosition = canvas.height * 0.25; 
            
            titleLines.forEach(line => {
                ctx.fillText(line, canvas.width / 2, yPosition);
                yPosition += 70;
            });
            
            ctx.font = '35px Arial, sans-serif'; 
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            
            const descriptionLines = wrapText(ctx, description, canvas.width * 0.8, 35);
            yPosition += 50; 
            
            descriptionLines.forEach(line => {
                ctx.fillText(line, canvas.width / 2, yPosition);
                yPosition += 45;
            });
            
            ctx.font = '30px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            yPosition += 50; 
            ctx.fillText('Ouça agora:', canvas.width / 2, yPosition);
            
            ctx.font = '25px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            const urlLines = wrapText(ctx, url, canvas.width * 0.9, 25);
            yPosition += 50; 
            
            urlLines.forEach(line => {
                ctx.fillText(line, canvas.width / 2, yPosition);
                yPosition += 35;
            });
            
            ctx.font = '20px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText('Compartilhe este podcast', canvas.width / 2, canvas.height - 50);
            
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (error) {
            reject(error);
        }
    });
}

function wrapText(ctx, text, maxWidth, fontSize) {
    if (!text || typeof text !== 'string') {
        return [''];
    }
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}


function getGradientImageUrl(gradientClass) {
    const gradientMap = {
        'gradient-1': ['#8B5CF6', '#3B82F6'],
        'gradient-2': ['#EC4899', '#8B5CF6'],
        'gradient-3': ['#10B981', '#3B82F6'],
        'gradient-4': ['#F59E0B', '#EF4444'],
        'gradient-5': ['#6366F1', '#8B5CF6']
    };
    
    const colors = gradientMap[gradientClass] || gradientMap['gradient-1'];
    return createGradientImageUrl(colors[0], colors[1]);
}

function createGradientImageUrl(color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    const grd = ctx.createLinearGradient(0, 0, 400, 400);
    grd.addColorStop(0, color1);
    grd.addColorStop(1, color2);
    
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 400, 400);
    
    return canvas.toDataURL('image/jpeg', 0.8);
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showShareNotification('Link copiado!');
            })
            .catch(() => {
                copyToClipboardFallback(text);
            });
    } else {
        copyToClipboardFallback(text);
    }
}

function copyToClipboardFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showShareNotification('Link copiado!');
    } catch (err) {
        console.error('Falha ao copiar:', err);
        showShareNotification('Erro ao copiar link');
    }
    
    document.body.removeChild(textArea);
}

function showShareNotification(message) {
    const existingNotification = document.querySelector('.share-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'share-notification fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 font-medium text-sm animate-fade-in';
    notification.textContent = message;
    notification.style.animation = 'fadeIn 0.3s ease-in-out';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.removeEventListener('click', sharePodcast);
        button.addEventListener('click', sharePodcast);
    });
});

if (!document.querySelector('#share-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'share-notification-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(style);
}