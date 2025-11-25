class Blockchain {
    constructor() {
        this.chain = [];
        this.transactions = [];
        this.createBlock(1, '0');
    }

    createBlock(proof, previous_hash) {
        const timestamp = new Date().toISOString();
        const block = {
            'index': this.chain.length + 1,
            'timestamp': timestamp,
            'proof': proof,
            'previous_hash': previous_hash,
            'transactions': [...this.transactions],
            'hash': '0'.repeat(64)
        };
        
        this.transactions = [];
        this.chain.push(block);
        
        return this.hash(block).then(realHash => {
            block.hash = realHash;
            return block;
        });
    }

    get_previous_block() {
        return this.chain[this.chain.length - 1];
    }

    hash(block) {
        const blockCopy = {...block};
        blockCopy.hash = '';
        const encodedBlock = JSON.stringify(blockCopy, Object.keys(blockCopy).sort());
        return this.sha256(encodedBlock);
    }

    sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        return crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        });
    }

    async addMusicTransaction(musicData) {
        const previous_block = this.get_previous_block();
        const proof = previous_block.proof + 1;
        
        this.transactions.push({
            'type': 'music_creation',
            'music_id': musicData.id,
            'name': musicData.nome,
            'timestamp': new Date().toISOString()
        });

        const previous_hash = previous_block.hash;
        const newBlock = await this.createBlock(proof, previous_hash);
        
        return newBlock;
    }

    async getMusicHash(musicId) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        for (let block of this.chain) {
            for (let transaction of block.transactions) {
                if (transaction.music_id === musicId && block.hash && block.hash !== '0'.repeat(64)) {
                    return {
                        hash: block.hash,
                        timestamp: block.timestamp,
                        blockIndex: block.index
                    };
                }
            }
        }
        return null;
    }
}

const blockchain = new Blockchain();

const formatBlockchainDate = (timestamp) => {
    try {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('pt-BR', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    } catch (error) {
        return 'Data inválida';
    }
};

const getAudioDuration = (audioUrl) => {
    return new Promise((resolve) => {
        const audio = new Audio();
        
        const timeout = setTimeout(() => {
            console.warn(`Timeout ao carregar áudio: ${audioUrl}`);
            audio.src = '';
            resolve(generateRandomDuration());
        }, 5000);

        audio.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            const duration = Math.floor(audio.duration);
            console.log(`Duração obtida com sucesso: ${audioUrl} - ${duration}s`);
            audio.src = '';
            resolve(duration);
        });

        audio.addEventListener('error', (e) => {
            clearTimeout(timeout);
            console.warn(`Erro ao carregar áudio: ${audioUrl}, usando duração padrão`);
            audio.src = '';
            resolve(generateRandomDuration());
        });

        audio.preload = 'metadata';
        audio.src = audioUrl;
        audio.load();
    });
};

const generateRandomDuration = () => {
    return Math.floor(Math.random() * (360 - 180) + 180);
};

// Dados dos episódios
let episodesData = [
    {
        id: 1,
        nome: "1. A Hegemonia",
        autor: "Carlos Silva",
        data: "12 Nov 2025",
        descricao: "Descrição do episódio",
        audio: "audios/a1.mp3",
        imageGradient: "from-purple-500 to-blue-500",
        bannerGradient: "gradient-1",
        defaultDuration: 300
    },
    {
        id: 2,
        nome: "2. Gramsci para co", 
        autor: "Maria Santos",
        data: "5 Nov 2025",
        descricao: "Como as ideias",
        audio: "audios/a1.mp3",
        imageGradient: "from-pink-500 to-purple-500",
        bannerGradient: "gradient-2",
        defaultDuration: 270
    },
    {
        id: 3,
        nome: "3. O Conceito",
        autor: "João Pereira",
        data: "29 Out 2025",
        descricao: "Análise do conceito de.",
        audio: "audios/a1.mp3",
        imageGradient: "from-green-500 to-blue-500",
        bannerGradient: "gradient-3",
        defaultDuration: 288
    },
    {
        id: 4,
        nome: "4. Intelectuais Orgânicos",
        autor: "Ana Costa",
        data: "22 Out 2025",
        descricao: "O papel dos intelectuais orgânicos na transformação social.",
        audio: "audios/a1.mp3",
        imageGradient: "from-yellow-500 to-red-500",
        bannerGradient: "gradient-4",
        defaultDuration: 312
    },
    {
        id: 5,
        nome: "5. Bloco Histórico",
        autor: "Pedro Almeida",
        data: "15 Out 2025",
        descricao: "Compreendendo o conceito de bloco histórico em Gramsci.",
        audio: "audios/a1.mp3",
        imageGradient: "from-blue-500 to-purple-500",
        bannerGradient: "gradient-5",
        defaultDuration: 282
    }
];

async function initializeBlockchainWithMusics() {
    console.log('Inicializando blockchain...');
    
    for (let episode of episodesData) {
        try {
            await blockchain.addMusicTransaction(episode);
            console.log(`Música ${episode.id} registrada`);
        } catch (error) {
            console.error(`Erro ao registrar música ${episode.id}:`, error);
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    await updateEpisodesWithBlockchainData();
    await updateEpisodesWithRealAudioDurations();
    
    console.log('Blockchain inicializado!');
}

async function updateEpisodesWithBlockchainData() {
    console.log('Atualizando dados do blockchain...');
    
    for (let episode of episodesData) {
        try {
            const blockchainData = await blockchain.getMusicHash(episode.id);
            
            if (blockchainData) {
                episode.blockchainHash = blockchainData.hash;
                episode.blockchainDate = formatBlockchainDate(blockchainData.timestamp);
                episode.blockIndex = blockchainData.blockIndex;
            } else {
                episode.blockchainHash = '00000000000000000000000000000000';
                episode.blockchainDate = episode.data;
                episode.blockIndex = 0;
            }
        } catch (error) {
            console.error(`Erro no episódio ${episode.id}:`, error);
        }
    }
    
    // Reaplica a pesquisa se estiver pesquisando
    if (window.searchSystem && window.searchSystem.reapplySearchIfNeeded) {
        window.searchSystem.reapplySearchIfNeeded();
    }
}

async function updateEpisodesWithRealAudioDurations() {
    console.log('Obtendo durações reais dos áudios...');
    
    const durationPromises = episodesData.map(async (episode) => {
        try {
            const actualDuration = await getAudioDuration(episode.audio);
            episode.actualDuration = actualDuration;
            episode.audioDuration = actualDuration;
            return { episodeId: episode.id, success: true, duration: actualDuration };
        } catch (error) {
            episode.actualDuration = episode.defaultDuration;
            episode.audioDuration = episode.defaultDuration;
            return { episodeId: episode.id, success: false, duration: episode.defaultDuration };
        }
    });
    
    await Promise.allSettled(durationPromises);
    
    
    if (window.searchSystem && window.searchSystem.reapplySearchIfNeeded) {
        window.searchSystem.reapplySearchIfNeeded();
    }
}
 
async function initializeBlockchainWithMusics() {
    console.log('Inicializando blockchain...');
    
    for (let episode of episodesData) {
        try {
            await blockchain.addMusicTransaction(episode);
            console.log(`Música ${episode.id} registrada`);
        } catch (error) {
            console.error(`Erro ao registrar música ${episode.id}:`, error);
        }
    }
     
    await new Promise(resolve => setTimeout(resolve, 7900));
    await updateEpisodesWithBlockchainData();
    await updateEpisodesWithRealAudioDurations();
    
    console.log('Blockchain inicializado!');
}

const audioManager = (() => {
    const audioElement = document.getElementById('audio-element');
    const player = document.getElementById('audio-player');
    const currentTrack = document.getElementById('current-track');
    const currentPodcast = document.getElementById('current-podcast');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const playerPlayBtn = document.getElementById('player-play-btn');
    const currentEpisodeImage = document.getElementById('current-episode-image');
    const closePlayerBtn = document.getElementById('close-player-btn');
    const backwardBtn = document.getElementById('backward-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeLevel = document.getElementById('volume-level');
    const volumeContainer = document.getElementById('volume-container');
    
    let isPlaying = false;
    let currentEpisode = null;
    let progressInterval;
    let isDragging = false;
    let isRepeating = false;
    let volume = 70;
    let isMuted = false;

    const getNextEpisode = () => {
        if (!currentEpisode) return episodesData[0];
        
        // SEMPRE ordem sequencial - shuffle removido
        const currentIndex = episodesData.findIndex(ep => ep.id === currentEpisode);
        const nextIndex = (currentIndex + 1) % episodesData.length;
        return episodesData[nextIndex];
    };

    const playNextEpisode = () => {
        if (isRepeating) {
            play();
            return;
        }
        
        const nextEpisode = getNextEpisode();
        if (nextEpisode) {
            console.log(`Indo para: "${nextEpisode.nome}" (Sequencial)`);
            
            loadEpisode(nextEpisode);
            play();
            
            if (window.episodeManager) {
                window.episodeManager.playEpisode(nextEpisode);
            }
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    const updateProgress = () => {
        if (audioElement.duration && !isDragging) {
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            currentTime.textContent = formatTime(audioElement.currentTime);
        }
    };
    
    const setDuration = () => {
        if (audioElement.duration) {
            duration.textContent = formatTime(audioElement.duration);
        } else {
            const currentEpisodeData = episodesData.find(ep => ep.id === currentEpisode);
            if (currentEpisodeData && currentEpisodeData.actualDuration) {
                duration.textContent = formatTime(currentEpisodeData.actualDuration);
            } else {
                duration.textContent = "5:00";
            }
        }
    };
    
    const setupProgressBar = () => {
        let isMouseDown = false;
        const seek = (clientX) => {
            const rect = progressContainer.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const totalDuration = audioElement.duration || 300;
            const newTime = percent * totalDuration;
            audioElement.currentTime = newTime;
            progressBar.style.width = `${percent * 100}%`;
            currentTime.textContent = formatTime(newTime);
        };
        
        progressContainer.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            isDragging = true;
            progressContainer.classList.add('dragging');
            seek(e.clientX);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                seek(e.clientX);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isMouseDown = false;
            isDragging = false;
            progressContainer.classList.remove('dragging');
        });
    };
    
    const setupVolumeControls = () => {
        const setVolume = (newVolume) => {
            volume = Math.max(0, Math.min(100, newVolume));
            audioElement.volume = volume / 100;
            if (volumeContainer.classList.contains('vertical')) {
                volumeLevel.style.height = `${volume}%`;
                volumeLevel.style.width = '100%';
            } else {
                volumeLevel.style.width = `${volume}%`;
                volumeLevel.style.height = '100%';
            }
            
            if (volume === 0) {
                isMuted = true;
                volumeBtn.querySelector('i').className = 'fa-solid fa-volume-xmark text-lg';
            } else {
                isMuted = false;
                volumeBtn.querySelector('i').className = 'fa-solid fa-volume-high text-lg';
            }
        };
        
        const toggleMute = () => {
            isMuted = !isMuted;
            if (isMuted) {
                audioElement.volume = 0;
                volumeBtn.querySelector('i').className = 'fa-solid fa-volume-xmark text-lg';
                if (volumeContainer.classList.contains('vertical')) {
                    volumeLevel.style.height = '0%';
                } else {
                    volumeLevel.style.width = '0%';
                }
            } else {
                audioElement.volume = volume / 100;
                volumeBtn.querySelector('i').className = 'fa-solid fa-volume-high text-lg';
                if (volumeContainer.classList.contains('vertical')) {
                    volumeLevel.style.height = `${volume}%`;
                } else {
                    volumeLevel.style.width = `${volume}%`;
                }
            }
        };
        
        const handleVolumeClick = (e) => {
            const rect = volumeContainer.getBoundingClientRect();
            
            if (volumeContainer.classList.contains('vertical')) {
                
                const clickY = rect.bottom - e.clientY; 
                const newVolume = (clickY / rect.height) * 100;
                setVolume(newVolume);
            } else {
                
                const clickX = e.clientX - rect.left;
                const newVolume = (clickX / rect.width) * 100;
                setVolume(newVolume);
            }
        };
        
        volumeBtn.addEventListener('click', toggleMute);
        volumeContainer.addEventListener('click', handleVolumeClick);
        
         const updateVolumeOrientation = () => {
            const isVertical = window.innerWidth < 768; // Mobile
            if (isVertical) {
                volumeContainer.classList.add('vertical');
                volumeLevel.style.height = `${volume}%`;
                volumeLevel.style.width = '100%';
            } else {
                volumeContainer.classList.remove('vertical');
                volumeLevel.style.width = `${volume}%`;
                volumeLevel.style.height = '100%';
            }
        };
        
         updateVolumeOrientation();
        window.addEventListener('resize', updateVolumeOrientation);
        
        setVolume(volume);
    };
    
    const setupRepeatControl = () => {
        const toggleRepeat = () => {
            isRepeating = !isRepeating;
            const icon = repeatBtn.querySelector('i');
            audioElement.loop = isRepeating;
            
            if (isRepeating) {
                icon.classList.remove('text-gray-400');
                icon.classList.add('text-green-500');
                console.log('Modo repeat ativado');
            } else {
                icon.classList.remove('text-green-500');
                icon.classList.add('text-gray-400');
                console.log('Modo repeat desativado');
            }
        };
        
        repeatBtn.addEventListener('click', toggleRepeat);
    };

    const setupShuffleControl = () => {
        // Shuffle completamente desativado
        shuffleBtn.style.opacity = '0.5';
        shuffleBtn.style.cursor = 'not-allowed';
        shuffleBtn.title = 'Shuffle desativado';
        
        const icon = shuffleBtn.querySelector('i');
        icon.classList.add('text-gray-400');
        icon.classList.remove('text-green-500');
        
        // Não fazer nada quando clicar
        shuffleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Shuffle desativado');
        });
    };
    
    const closePlayer = () => {
        pause();
        player.classList.add('hidden');
        updatePlayButton();
    };
    
    const updatePlayerInfo = (episodeData) => {
        currentTrack.textContent = episodeData.nome;
        currentPodcast.textContent = episodeData.autor || 'Podcast Gramsci';
        currentEpisodeImage.className = `w-10 h-10 bg-gradient-to-br ${episodeData.imageGradient} rounded-full`;
    };
    
    const loadEpisode = (episodeData) => {
        try {
            if (isPlaying) {
                pause();
            }
            
            console.log(`Carregando: ${episodeData.nome}`);
            audioElement.src = episodeData.audio;
            
            // Atualiza as informações do player incluindo o autor
            updatePlayerInfo(episodeData);
            
            currentEpisode = episodeData.id;
            player.classList.remove('hidden');
            
            audioElement.addEventListener('loadedmetadata', setDuration, { once: true });
            
        } catch (error) {
            console.error('Erro ao carregar episódio:', error);
            player.classList.remove('hidden');
        }
    };
    
    const play = async () => {
        try {
            if (!audioElement.src) return;        
            await audioElement.play();
            isPlaying = true;
            updatePlayButton();
            progressInterval = setInterval(updateProgress, 1000);
            
        } catch (error) {
            console.error('Erro ao reproduzir:', error);
            isPlaying = true;
            updatePlayButton();
            progressInterval = setInterval(updateProgress, 1000);
        }
    };
    
    const pause = () => {
        try {
            audioElement.pause();
        } catch (error) {
            console.error('Erro ao pausar:', error);
        }
        isPlaying = false;
        updatePlayButton();
        clearInterval(progressInterval);
    };
    
    const updatePlayButton = () => {
        const icon = isPlaying ? 'fa-pause' : 'fa-play';
        playerPlayBtn.innerHTML = `<i class="fa-solid ${icon} text-lg"></i>`;
    };
    
    const togglePlayPause = () => {
        isPlaying ? pause() : play();
    };
    
    const forward = () => {
        if (audioElement.duration) {
            audioElement.currentTime = Math.min(audioElement.currentTime + 15, audioElement.duration);
            updateProgress();
        }
    };
    
    const backward = () => {
        audioElement.currentTime = Math.max(audioElement.currentTime - 15, 0);
        updateProgress();
    };

    const nextEpisode = () => {
        playNextEpisode();
    };
    
    const init = () => {
        playerPlayBtn.addEventListener('click', togglePlayPause);
        closePlayerBtn.addEventListener('click', closePlayer);
        backwardBtn.addEventListener('click', backward);
        forwardBtn.addEventListener('click', forward);
        
        setupProgressBar();
        setupVolumeControls();
        setupRepeatControl();
        setupShuffleControl();
        
        audioElement.addEventListener('timeupdate', updateProgress);
        
        audioElement.addEventListener('ended', () => {
            console.log('Episódio terminado, iniciando próximo...');
            playNextEpisode();
        });

        const nextEpisodeBtn = document.getElementById('forward-btn');
        if (nextEpisodeBtn) {
            nextEpisodeBtn.addEventListener('click', nextEpisode);
        }
    };

    return { 
        init, 
        loadEpisode, 
        play, 
        pause, 
        togglePlayPause,
        forward,
        backward,
        nextEpisode
    };
})();

window.episodeManager = {
    playEpisode: function(episodeData) {
        audioManager.loadEpisode(episodeData);
        audioManager.play();
        
        this.updateActiveEpisode(episodeData.id);
    },
    
    updateActiveEpisode: function(episodeId) {
        const episodeElements = document.querySelectorAll('.episode');
        episodeElements.forEach(ep => {
            ep.classList.remove('episode-playing');
            if (ep.dataset.episodeId == episodeId) {
                ep.classList.add('episode-playing');
            }
        });
    },
    
    // Configurar listeners dos episódios
    setupEpisodeListeners: function() {
        const episodeElements = document.querySelectorAll('.episode');
        episodeElements.forEach(episode => {
            episode.addEventListener('click', () => {
                const episodeId = episode.dataset.episodeId;
                const episodeData = episodesData.find(ep => ep.id == episodeId);
                if (episodeData) {
                    this.playEpisode(episodeData);
                }
            });
        });
    }
};
 
function initializeSearchSystem() {
    const searchInput = document.getElementById('search-audio');
    const episodesContainer = document.getElementById('episodes-container');
    let originalEpisodesHTML = '';
    let isSearching = false; // Flag para controlar se está pesquisando
    let currentSearchTerm = ''; // Guarda o termo de pesquisa atual
    
    setTimeout(() => {
        originalEpisodesHTML = episodesContainer.innerHTML;
    }, 1000);
    
    function renderFilteredEpisodes(filteredEpisodes) {
        episodesContainer.innerHTML = '';
        
        if (filteredEpisodes.length === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message text-center text-gray-400 py-8';
            noResultsMessage.textContent = 'Nenhum episódio encontrado';
            episodesContainer.appendChild(noResultsMessage);
            return;
        }
        
        // Mantém a ordem original dos episódios
        const orderedFilteredEpisodes = filteredEpisodes.sort((a, b) => a.id - b.id);
        
        orderedFilteredEpisodes.forEach(episode => {
            const episodeElement = createEpisodeElement(episode);
            episodesContainer.appendChild(episodeElement);
        });
        
        setTimeout(() => {
            if (window.episodeManager && window.episodeManager.setupEpisodeListeners) {
                window.episodeManager.setupEpisodeListeners();
            }
        }, 100);
    }

    function createEpisodeElement(episode) {
        const episodeDiv = document.createElement('div');
        episodeDiv.className = `episode flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors episode-transition ${episode.bannerGradient ? 'active-banner' : ''}`;
        episodeDiv.dataset.episodeId = episode.id;
        
        const gradientClasses = episode.imageGradient || 'from-purple-500 to-blue-500';
        
        episodeDiv.innerHTML = `
            <div class="relative">
                <div class="w-12 h-12 bg-gradient-to-br ${gradientClasses} rounded-full flex items-center justify-center">
                    <i class="fa-solid fa-play text-white"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-red-500 mb-0 break-words leading-tight">${episode.nome}</p>
                <p class="text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap text-sm mt-1">${episode.descricao}</p>
                <div class="flex items-center gap-4 mt-1">
                    <span class="text-gray-500 text-xs">${episode.data}</span>
                    <span class="text-gray-500 text-xs">${formatTime(episode.audioDuration || episode.defaultDuration)}</span>
                </div>
            </div>
            <div class="text-right min-w-0 flex-shrink-0">
                <div class="text-green-500 text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap" title="${episode.blockchainHash}">
                    ${episode.blockchainHash ? episode.blockchainHash.substring(0, 16) + '...' : 'Carregando...'}
                </div>
                <div class="text-gray-500 text-xs mt-0.5">Bloco ${episode.blockIndex}</div>
                <div class="text-gray-500 text-xs mt-0.5">${episode.blockchainDate}</div>
            </div>
        `;
        
        return episodeDiv;
    }

    function filterEpisodes(searchTerm) {
        const filteredEpisodes = episodesData.filter(episode => {
            const episodeTitle = episode.nome.toLowerCase();
            const episodeDescription = episode.descricao.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            return episodeTitle.includes(searchLower) || 
                   episodeDescription.includes(searchLower);
        });
        
        // Ordena os episódios filtrados pela ordem original (por ID)
        const orderedFilteredEpisodes = filteredEpisodes.sort((a, b) => a.id - b.id);
        
        renderFilteredEpisodes(orderedFilteredEpisodes);
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        currentSearchTerm = searchTerm;
        
        if (searchTerm.length > 0) {
            isSearching = true;
            filterEpisodes(searchTerm);
        } else {
            isSearching = false;
            episodesContainer.innerHTML = originalEpisodesHTML;
            
            setTimeout(() => {
                if (window.episodeManager && window.episodeManager.setupEpisodeListeners) {
                    window.episodeManager.setupEpisodeListeners();
                }
            }, 100);
        }
    });
    
    searchInput.addEventListener('search', function() {
        if (this.value === '') {
            isSearching = false;
            episodesContainer.innerHTML = originalEpisodesHTML;
            setTimeout(() => {
                if (window.episodeManager && window.episodeManager.setupEpisodeListeners) {
                    window.episodeManager.setupEpisodeListeners();
                }
            }, 100);
        }
    });
    
    function reapplySearchIfNeeded() {
        if (isSearching && currentSearchTerm.length > 0) {
            console.log('Reaplicando pesquisa após atualização...');
            filterEpisodes(currentSearchTerm);
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Retorna a função para reaplicar pesquisa
    return {
        reapplySearchIfNeeded,
        isSearching: () => isSearching
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando aplicação de áudio');

    window.audioManager = audioManager;
    window.episodesData = episodesData;
    
    audioManager.init();
    initializeSearchSystem();
    
    try {
        await initializeBlockchainWithMusics();
        console.log('Sistema de áudio carregado com sucesso!');
        console.log('Reprodução sequencial ativada - os episódios tocarão automaticamente em sequência');
        console.log('Shuffle desativado - reprodução apenas em ordem sequencial');
        console.log('Sistema de pesquisa ativado - digite para filtrar episódios');
    } catch (error) {
        console.error('Erro fatal:', error);
    }
});