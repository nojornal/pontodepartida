const episodeManager = (() => {
    let currentBannerIndex = 0;
    let currentEpisodes = [];
    let currentBannerEpisode = null; 
    const bannerContent = document.getElementById('banner-content');
    const podcastImage = document.getElementById('podcast-image');
    const bannerArea = document.getElementById('banner-area');
    const bannerTitle = document.getElementById('banner-title');
    const bannerAuthor = document.getElementById('banner-author');
    const bannerDescription = document.getElementById('banner-description');
    const mainPlayBtn = document.getElementById('main-play-btn');
    const hintLeft = document.getElementById('banner-hint-left');
    const hintRight = document.getElementById('banner-hint-right');
    let bannerTimeout;
    
    const initializeEpisodeOrder = () => {
        currentEpisodes = [...episodesData].slice(0, 3); // Primeiros 3 episódios
        console.log('Ordem FIXA inicializada:', currentEpisodes.map(ep => ep.id));
        currentBannerEpisode = getRandomBannerEpisode(); // Banner continua aleatório
    };
    
    const getRandomBannerEpisode = (excludeIds = []) => {
        const availableEpisodes = episodesData.filter(ep => !excludeIds.includes(ep.id));
        if (availableEpisodes.length === 0) return episodesData[0];
        
        const randomIndex = Math.floor(Math.random() * availableEpisodes.length);
        return availableEpisodes[randomIndex];
    };
    
    const getNextEpisode = (currentIndex) => {
        const nextIndex = (currentIndex + 1) % episodesData.length;
        return episodesData[nextIndex];
    };
    
    const renderEpisodes = () => {
        const container = document.getElementById('episodes-container');
        container.innerHTML = '';
        
        while (currentEpisodes.length < 3) {
            const lastEpisode = currentEpisodes[currentEpisodes.length - 1];
            const lastIndex = episodesData.findIndex(ep => ep.id === lastEpisode.id);
            const nextEpisode = getNextEpisode(lastIndex);
            currentEpisodes.push(nextEpisode);
        }
        
        for (let i = 0; i < 3; i++) {
            const episode = currentEpisodes[i];
            const episodeElement = document.createElement('div');
            
            let displayDuration;
            if (episode.actualDuration) {
                displayDuration = formatDurationDisplay(episode.actualDuration);
            } else if (episode.formattedDurationMinutes) {
                displayDuration = episode.formattedDurationMinutes;
            } else {
                displayDuration = formatDurationMinutes(episode.defaultDuration);
            }
            
            const shortHash = getShortHash(episode.blockchainHash);
            const displayDate = episode.blockchainDate || episode.data;
            const displayInfo = `ID:${shortHash} - ${displayDate} - ${displayDuration}`;
            
            episodeElement.className = `episode episode-transition py-4 border-b border-gray-700 hover:bg-gray-800 rounded-lg px-4 cursor-pointer group relative ${i === 0 ? 'active-banner' : ''}`;
            episodeElement.dataset.episode = episode.id;
            episodeElement.dataset.position = i;
            
            episodeElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 flex-1">
                        <!-- Ícone de play que aparece no hover -->
                        <div class="play-icon opacity-0 group-hover:opacity-100 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center transition-all duration-200 play-btn"
                             data-episode-id="${episode.id}">
                            <i class="fa-solid fa-play text-white text-xs ml-0.5"></i>
                        </div>
                        
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-white text-lg truncate">${episode.nome}</h3>
                            <p class="text-gray-400 text-sm mt-1">${displayInfo}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-400 text-sm">${displayDuration}</span>
                        <button class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200">
                            <i class="fa-solid fa-ellipsis text-lg"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Descrição do episódio -->
                <p class="text-gray-300 text-sm mt-2 leading-relaxed">${episode.descricao}</p>
            `;
            
            container.appendChild(episodeElement);
        }
        
        setupEpisodeListeners();
        
        console.log('Episódios atuais no carrossel (ORDEM FIXA):', currentEpisodes.slice(0, 3).map(ep => ep.nome));
    };
    
    const rotateEpisodes = () => {
        const removedEpisode = currentEpisodes.shift();
        const lastEpisode = currentEpisodes[currentEpisodes.length - 1];
        const lastIndex = episodesData.findIndex(ep => ep.id === lastEpisode.id);
        const nextEpisode = getNextEpisode(lastIndex);
        currentEpisodes.push(nextEpisode);
        
        console.log(`Rotacionado (ORDEM FIXA): Removido "${removedEpisode.nome}", Adicionado "${nextEpisode.nome}"`);
        
        renderEpisodes();
    };
    
    const rotateToEpisode = (targetEpisodeId) => {
        const targetEpisode = episodesData.find(ep => ep.id === targetEpisodeId);
        if (!targetEpisode) return;
        
        const currentPosition = currentEpisodes.findIndex(ep => ep.id === targetEpisodeId);
        
        if (currentPosition === -1) {
            // ALTERAÇÃO: Substituir o último episódio mantendo a ordem
            currentEpisodes[2] = targetEpisode;
            console.log(`Episódio ${targetEpisode.nome} adicionado ao carrossel`);
        } else if (currentPosition > 0) {
            const rotationsNeeded = currentPosition;
            for (let i = 0; i < rotationsNeeded; i++) {
                rotateEpisodes();
            }
        }
        
        renderEpisodes();
    };
    
const setupEpisodeListeners = () => {
        const episodes = document.querySelectorAll('.episode');
        const playButtons = document.querySelectorAll('.play-btn');
        
        episodes.forEach(episode => {
            episode.addEventListener('click', (e) => {
                if (!e.target.closest('.play-btn')) {
                    const position = parseInt(episode.dataset.position);
                    const episodeId = parseInt(episode.dataset.episode);
                    
                    if (position === 0) {
                        rotateEpisodes();
                    } else if (position === 1 || position === 2) {
                        rotateToEpisode(episodeId);
                    }
                }
            });
        });
        
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const episodeElement = button.closest('.episode');
                const episodeId = parseInt(button.getAttribute('data-episode-id'));
                const episodeData = episodesData.find(ep => ep.id === episodeId);
                
                const position = parseInt(episodeElement.dataset.position);
                
                if (position === 0) {
                    rotateEpisodes();
                } else if (position === 1 || position === 2) {
                    rotateToEpisode(episodeId);
                }
                
                if (episodeData && window.audioManager) {
                    playEpisode(episodeData, episodeElement);
                }
            });
        });
    };
    
    const playEpisode = (episodeData, episodeElement = null) => {
        window.audioManager.loadEpisode(episodeData);
        window.audioManager.play();
        
        document.querySelectorAll('.episode').forEach(ep => {
            ep.classList.remove('episode-playing', 'bg-gray-700');
        });
        
        if (episodeElement) {
            episodeElement.classList.add('episode-playing', 'bg-gray-700');
        } else {
            const targetElement = document.querySelector(`[data-episode="${episodeData.id}"]`);
            if (targetElement) {
                targetElement.classList.add('episode-playing', 'bg-gray-700');
            }
        }
        
        updateBanner(episodeData);
        currentBannerEpisode = episodeData; 
        
        console.log(`Tocando: ${episodeData.nome}`);
    };
    
    const updateBanner = (episode) => {
        bannerTitle.textContent = episode.nome;
        
        if (bannerAuthor) {
            bannerAuthor.textContent = `por ${episode.autor}`;
        }
        
        bannerDescription.textContent = episode.descricao;
        podcastImage.className = `w-48 h-48 md:w-64 md:h-64 ${episode.bannerGradient} rounded-full shadow-lg flex-shrink-0 banner-transition`;
        updateNavigationHints();
        
        currentBannerEpisode = episode;
        currentBannerIndex = episodesData.findIndex(ep => ep.id === episode.id);
    };
    
    const nextBanner = () => {
        const currentEpisodeId = currentBannerEpisode ? currentBannerEpisode.id : episodesData[0].id;
        const nextEpisode = getRandomBannerEpisode([currentEpisodeId]);
        
        changeBanner(nextEpisode);
    };
    
   
    const prevBanner = () => {
        const currentEpisodeId = currentBannerEpisode ? currentBannerEpisode.id : episodesData[0].id;
        const prevEpisode = getRandomBannerEpisode([currentEpisodeId]);
        
        changeBanner(prevEpisode);
    };
    
    const changeBanner = (episode) => {
        currentBannerEpisode = episode;
        currentBannerIndex = episodesData.findIndex(ep => ep.id === episode.id);
        
        bannerContent.classList.remove('banner-visible');
        bannerContent.classList.add('banner-hidden');
        
        setTimeout(() => {
            updateBanner(episode);
            bannerContent.classList.remove('banner-hidden');
            bannerContent.classList.add('banner-visible');
            resetAutoRotation();
        }, 300);
    };
    
    const updateNavigationHints = () => {
        hintLeft.style.opacity = '1'; 
        hintRight.style.opacity = '1'; 
    };
    
    const setupBannerNavigation = () => {
        bannerArea.addEventListener('mousemove', (e) => {
            const bannerRect = bannerArea.getBoundingClientRect();
            const relativeX = e.clientX - bannerRect.left;
            const bannerWidth = bannerRect.width;
            const threshold = bannerWidth / 3;
            
            clearTimeout(bannerTimeout);
            
            if (relativeX < threshold) {
                setTimeout(prevBanner, 500);
            } else if (relativeX > bannerWidth - threshold) {
                setTimeout(nextBanner, 500);
            } else {
                resetAutoRotation();
            }
        });
        
        bannerArea.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                nextBanner();
            }
        });
    };
    
    const setupBannerPlay = () => {
        mainPlayBtn.addEventListener('click', () => {
            if (currentBannerEpisode && window.audioManager) {
                playEpisode(currentBannerEpisode);
                
                const isInCarousel = currentEpisodes.some(ep => ep.id === currentBannerEpisode.id);
                if (!isInCarousel) {
                    currentEpisodes[2] = currentBannerEpisode;
                    renderEpisodes();
                }
                
                rotateToEpisode(currentBannerEpisode.id);
            }
        });
    };
    
    const resetAutoRotation = () => {
        clearTimeout(bannerTimeout);
        startAutoRotation();
    };
    
    const startAutoRotation = () => {
        bannerTimeout = setTimeout(() => {
            nextBanner(); 
        
        }, 8000);
    };
    
    const init = () => {
        if (typeof episodesData === 'undefined') {
            setTimeout(init, 100);
            return;
        }
        
        initializeEpisodeOrder(); 
        renderEpisodes();
        setupBannerNavigation();
        setupBannerPlay();
        updateNavigationHints();
        startAutoRotation();
        const randomBannerEpisode = getRandomBannerEpisode();
        updateBanner(randomBannerEpisode);
        
        console.log('Sistema de carrossel FIXO inicializado');
        console.log('Episódios disponíveis:', episodesData.length);
        console.log('Ordem FIXA do carrossel:', currentEpisodes.map(ep => ep.nome));
        console.log('Episódio inicial do banner (ALEATÓRIO):', randomBannerEpisode.nome);
    };
    
    return {
        init,
        nextBanner,
        prevBanner,
        rotateEpisodes,
        rotateToEpisode,
        playEpisode
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    episodeManager.init();
});

const formatDurationDisplay = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDurationMinutes = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0 min';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
};

const getShortHash = (hash) => {
    if (!hash || typeof hash !== 'string') return '000';
    return hash.substring(0, 3).toUpperCase();
};