const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
	currentIndex: 0,
	isPlaying: false,
	isRandom: false,
	isRepeat: false,
	listListened: [],
	config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
	songs: [
		{
			name: 'Qua Khung Cửa Sổ',
			singer: 'Chillies',
			path:
				'./assets/music/Qua Khung Cửa Sổ - Chillies [Official Music Video].mp3',
			image: './assets/img/quakhungcuaso.jpg',
		},
		{
			name: 'D.A.D (Instrumental Version)',
			singer: 'Nbhd Nick',
			path: './assets/music/ES_D.A.D (Instrumental Version) - Nbhd Nick.mp3',
			image: './assets/img/Trending.jpg',
		},
		{
			name: 'Short Shorts',
			singer: 'Timothy Infinite',
			path: './assets/music/ES_Short Shorts - Timothy Infinite.mp3',
			image: './assets/img/Trending.jpg',
		},
		{
			name: 'Chẳng Nói Nên Lời ( Acoustic Version )',
			singer: 'Hoàng Dũng',
			path:
				'./assets/music/Chẳng Nói Nên Lời - Acoustic Session _ Hoàng Dũng.mp3',
			image: './assets/img/changnoinenloi.jpg',
		},
		{
			name: 'Hôm Nay Em Cưới Rồi (Lofi Ver.)',
			singer: 'Khải Đăng - Freak D',
			path:
				'./assets/music/Hôm Nay Em Cưới Rồi (Lofi Ver.) - Khải Đăng x Freak D.mp3',
			image: './assets/img/homnayemcuoiroi.jpg',
		},
		{
			name: 'Late Nights Melancholy',
			singer: 'Rude Boy & White Cherry',
			path:
				'./assets/music/Rude Boy & White Cherry - Late Night Melancholy.mp3',
			image: './assets/img/Trending.jpg',
		},
		{
			name: 'Ông Trời Làm Tội Anh Chưa ?',
			singer: 'QNT ft Tuấn Cry',
			path:
				'./assets/music/ÔNG TRỜI LÀM TỘI ANH CHƯA - MINH HANH x RASTZ x QNT ft. TUẤN CRY.mp3',
			image: './assets/img/ongtroilamtoianhchua.jpg',
		},
		{
			name: 'Độ Đúng Đời',
			singer: 'Thiện Hưng',
			path:
				'./assets/music/ĐỘ ĐÚNG ĐỜI - THIỆN HƯNG ft. ĐỘ MIXI _ LYRIC AUDIO.mp3',
			image: './assets/img/dodungdoi.jpg',
		},
		// {
		// 	name: 'Anh Không Thề Gì Đâu Anh Làm',
		// 	singer: 'Phúc Du',
		// 	path:
		// 		'./assets/music/ANH KHÔNG THỀ GÌ ĐÂU ANH LÀM. #AKTGĐ - PHÚC DU [OFFICIAL MUSIC VIDEO].mp3',
		// 	image: './assets/img/anhkhongthe.webp',
		// },
	],
	setConfig: function (key, value) {
		this.config[key] = value;
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
	},

	render: function () {
		const htmls = this.songs.map((song, index) => {
			return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}"
                    data-index=${index}                
                >
					<div
						class="thumb"
						style="
							background-image: url(${song.image});
						"
					></div>
					<div class="body">
						<h3 class="title">${song.name}</h3>
						<p class="author">${song.singer}</p>
					</div>
					<div class="option">
						<i class="fas fa-ellipsis-h"></i>
					</div>
				</div>
            `;
		});

		playlist.innerHTML = htmls.join('');
	},

	defineProperties: function () {
		Object.defineProperty(this, 'currentSong', {
			get: function () {
				return this.songs[this.currentIndex];
			},
		});
	},

	handleEvents: function () {
		const cdWidth = cd.offsetWidth;
		const _this = this;

		// Xử lý CD quay/ dừng khi play/ pause
		const cdRotateAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
			duration: 15000, // 15s
			iterations: Infinity,
		});

		cdRotateAnimate.pause();

		document.onscroll = function () {
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			const newCdWidth = cdWidth - scrollTop;

			cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
			cd.style.opacity = newCdWidth / cdWidth;
		};

		playBtn.onclick = function () {
			if (_this.isPlaying) {
				audio.pause();
			} else {
				audio.play();
			}
		};

		// Khi bài hát play
		audio.onplay = function () {
			_this.isPlaying = true;
			player.classList.add('playing');
			cdRotateAnimate.play();
		};

		// Khi bài hát pause
		audio.onpause = function () {
			_this.isPlaying = false;
			player.classList.remove('playing');
			cdRotateAnimate.pause();
		};

		// Khi tiến độ bài hát thay đổi
		audio.ontimeupdate = function () {
			if (audio.duration) {
				const progressPercent = Math.floor(
					(audio.currentTime / audio.duration) * 100
				);

				progress.value = progressPercent;
			}
		};

		// Xử lý khi tua bài hát
		progress.onchange = function (e) {
			const seekTime = (audio.duration / 100) * e.target.value;
			audio.currentTime = seekTime;
		};

		// Khi next bài hát
		nextBtn.onclick = function () {
			if (_this.isRandom) {
				_this.playRandomSong();
			} else {
				_this.nextSong();
			}
			audio.play();
			_this.render();
			_this.scrollToActiveSong();
		};

		// Khi next bài hát
		prevBtn.onclick = function () {
			if (_this.isRandom) {
				_this.playRandomSong();
			} else {
				_this.prevSong();
			}
			audio.play();
			_this.render();
			_this.scrollToActiveSong();
		};

		// Random bài hát
		randomBtn.onclick = function () {
			_this.isRandom = !_this.isRandom;
			_this.setConfig('isRandom', _this.isRandom);
			randomBtn.classList.toggle('active', _this.isRandom);
		};

		repeatBtn.onclick = function () {
			_this.isRepeat = !_this.isRepeat;
			_this.setConfig('isRepeat', _this.isRepeat);
			repeatBtn.classList.toggle('active', _this.isRepeat);
		};

		audio.onended = function () {
			if (_this.isRepeat) {
				audio.play();
			} else {
				nextBtn.click();
			}
		};

		playlist.onclick = function (e) {
			const songNode = e.target.closest('.song:not(.active)');

			if (songNode || e.target.closest('.option')) {
				if (songNode) {
					_this.currentIndex = Number(songNode.dataset.index);
					_this.loadCurrentSong();
					_this.render();
					audio.play();
				}

				if (e.target.closest('.option')) {
					console.log('Display Options');
				}
			}
		};
	},

	scrollToActiveSong: function () {
		setTimeout(() => {
			$('.song.active').scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}, 500);
	},

	loadCurrentSong: function () {
		heading.textContent = this.currentSong.name;
		cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
		audio.src = this.currentSong.path;
	},

	loadConfig: function () {
		this.isRandom = this.config.isRandom;
		this.isRepeat = this.config.isRepeat;
	},

	nextSong: function () {
		this.currentIndex++;

		if (this.currentIndex >= this.songs.length) {
			this.currentIndex = 0;
		}

		this.loadCurrentSong();
	},

	prevSong: function () {
		this.currentIndex--;

		if (this.currentIndex < 0) {
			this.currentIndex = this.songs.length - 1;
		}

		this.loadCurrentSong();
	},

	playRandomSong: function () {
		let newIndex;

		do {
			newIndex = Math.floor(Math.random() * this.songs.length);
		} while (newIndex === this.currentIndex);

		this.currentIndex = newIndex;
		this.loadCurrentSong();
	},

	playRepeatSong: function () {
		this.currentIndex = this.currentIndex;
		this.loadCurrentSong();
	},

	start: function () {
		this.loadConfig();

		this.defineProperties();

		this.handleEvents();

		this.loadCurrentSong();

		this.render();

		repeatBtn.classList.toggle('active', this.isRepeat);
		randomBtn.classList.toggle('active', this.isRandom);
	},
};

app.start();
