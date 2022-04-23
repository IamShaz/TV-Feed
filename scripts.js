let titleCount = 0
let navCount = 0;
const shows = [];
const title = 'View the latest and most popular TV shows';
const spinner = document.getElementById('spinner');
const controller = document.getElementById('controller');
const left = document.getElementById('left');
const right = document.getElementById('right');
const power = document.getElementById('power');
const powerBtn = power.querySelector('img');
const remoteScreen = document.getElementById('remote-screen');
const tvRemote = document.getElementById('tv-remote');
const filter = document.getElementById('search-filters')
const filterBtn = document.getElementById('filter-btn');
const remotePowerBtn = document.getElementById('remote-power');
const infoBtn = document.getElementById('info-btn');
const genreFilter = document.getElementById('filter-genre');
const showContainer = document.getElementById('show-container');
const showContainerImg = showContainer.querySelector('img');
const video = document.getElementById('video');
const closeBtnVideo = video.querySelector('.close');
const tvFeed = document.getElementById('feed');
const showName = document.getElementById('show-name');
const showOverview = document.getElementById('show-overview');
const feedBtn = tvFeed.querySelector('button');

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = `api_key=`;
const API_LANG = '&language=en-US';
const URL_GENRES = `${BASE_URL}/genre/tv/list?${API_KEY}${API_LANG}`;
const URL_POPULAR = `${BASE_URL}/discover/tv?${API_KEY}${API_LANG}`;

const showImage = (URL_IMG, imgPath, name, noise) => {
    showContainerImg.src = !noise ? URL_IMG + imgPath : showContainerImg.src = imgPath;
    showContainerImg.alt = name;
}

const fetchData = (url, cb) => {
    const callError = () => {
        document.getElementById('screen-wrapper').classList.add('hidden');
        showImage(null, './noise.jpg', '', true);
    }

    fetch(url).then(res => {
        if (!res.ok) callError();
        return res.json();
    }).then(data => cb(data)).catch(() => callError());
}

const createNode = (parent, type, text, id = null, value = null) => {
    let node = document.createElement(type);
    node.innerHTML = text;
    if (id) node.id = id;
    if (value) node.value = value;
    parent.appendChild(node);
}

const toggleClass = (obj, addClass, removeClass) => {
    obj.classList.add(addClass);
    obj.classList.remove(removeClass);
}

const showInfo = (name, overview) => {
    showName.innerHTML = name;
    showOverview.innerHTML = overview;
}

const videoInfo = (opacity, src, name, classType) => {
    const frame = video.querySelector('iframe');
    showContainerImg.style.opacity = opacity;
    frame.src = src;
    frame.title = name;
    [frame, video].forEach(el => el.classList[classType]('hidden'));
}

const closeVideo = () => videoInfo(1, '', '', 'add');

const playVideo = (key, name) => {
    const videoUrl = `https://www.youtube.com/embed/${key}`;

    spinner.classList.remove('hidden');
    setTimeout(() => spinner.classList.add('hidden'), 2000);

    videoInfo(0.3, videoUrl, name, 'remove');
}

const displayVideos = (data) => {
    let buttons = [];
    let currentButtons = [...tvFeed.querySelectorAll('button')];
    if (currentButtons.length !== 0) currentButtons.map(btn => btn.remove());

    for (let i = 0; i < 3; i++) {
        let vid = data.results[i];
        if (vid !== undefined && vid.site === 'YouTube') {
            let vidBtn = document.createElement('button');
            vidBtn.innerHTML = vid.name;
            buttons.push(vidBtn);
            tvFeed.appendChild(vidBtn);
            vidBtn.addEventListener('click', () => playVideo(vid.key, vid.name));
        }
    }
}

const getVideos = (showId) => {
    const URL_TRAILER = `${BASE_URL}/tv/${showId}/videos?${API_KEY}${API_LANG}`;
    fetchData(URL_TRAILER, displayVideos);
}

const displayShows = (data) => {
    const URL_IMG = 'https://image.tmdb.org/t/p/original/';
    const noisePath = './noise.jpg';
    const show = data.results[navCount];

    shows.length = 0;
    shows.push(data);

    if (navCount >= 0) {
        if (navCount === 19) navCount = 19;
        let imgPath = show.backdrop_path;
        let name = show.name;
        let overview = show.overview;
        let showId = show.id;

        imgPath !== null ? showImage(URL_IMG, imgPath, name, false) : showImage(null, noisePath, name, true);

        showInfo(name, overview);

        if (overview.length < 700) {
            getVideos(showId);
        } else {
            let buttons = [...tvFeed.querySelectorAll('button')];
            buttons.map(btn => btn.remove());
        }
    } else {
        navCount = 0;
    }
}

const toggleInfo = () => {
    if (tvFeed.classList.contains('hidden')) {
        toggleClass(tvFeed, 'show', 'hidden');
        infoBtn.classList.add('active');
    } else {
        toggleClass(tvFeed, 'hidden', 'show');
        infoBtn.classList.remove('active');
    }
}

const filterShows = () => {
    let url = `${URL_POPULAR}&with_genres=${genreFilter.value}&sort_by=first_air_date.desc&vote_average.gte=5&with_origin_country=US|CA&with_original_language=en`;
    fetchData(url, displayShows);

    spinner.classList.remove('hidden');
    setTimeout(() => spinner.classList.add('hidden'), 1500);

    closeVideo();

    remoteScreen.classList.add('hidden');
    toggleClass(infoBtn, ('show', 'active'), 'hidden');
    toggleClass(tvFeed, 'show', 'hidden');
    toggleClass(controller, 'show', 'hidden');
    toggleClass(showContainer, 'show', 'hidden');

    navCount = 0;
    navCount === 0 ? left.setAttribute('disabled', '') : left.removeAttribute('disabled');
    navCount === 19 ? right.setAttribute('disabled', '') : right.removeAttribute('disabled');
}

const displayGenres = (data) => {
    createNode(genreFilter, 'option', 'All', null, null);
    data.genres.map(genre => createNode(genreFilter, 'option', genre.name, null, genre.id));
}

const showRemoteTitle = () => remoteScreen.querySelector('p').style.opacity = 1;

const typingTitle = showRemoteTitle => {
    if (titleCount < title.length) {
        remoteScreen.querySelector('h2').innerHTML += title.charAt(titleCount);
        titleCount++;
        setTimeout(typingTitle, 70);
    }
    setTimeout(showRemoteTitle, 1750);
};

const powerTv = () => {
    power.classList.add('hidden');
    toggleClass(remoteScreen, 'show', 'hidden');
    toggleClass(tvRemote, 'slide-up', 'slide-down');
    fetchData(URL_GENRES, displayGenres);
    typingTitle(showRemoteTitle);
}

const powerDownTv = () => {
    navCount = 0;
    showContainer.querySelector('img').src = '';
    power.classList.remove('hidden');
    toggleClass(remoteScreen, 'hidden', 'show');
    toggleClass(tvRemote, 'slide-down', 'slide-up');
    toggleClass(showContainer, 'hidden', 'show');
    toggleClass(tvFeed, 'hidden', 'show');
    toggleClass(infoBtn, 'hidden', 'active');
    toggleClass(controller, 'hidden', 'show');
}

const changeShow = (arrow) => {
    spinner.classList.remove('hidden');
    setTimeout(() => spinner.classList.add('hidden'), 1000);

    if (arrow === left) navCount--;
    if (arrow === right) navCount++;

    navCount === 0 ? left.setAttribute('disabled', '') : left.removeAttribute('disabled');
    navCount === 19 ? right.setAttribute('disabled', '') : right.removeAttribute('disabled');

    closeVideo();
    displayShows(shows[0]);
}

closeBtnVideo.addEventListener('click', closeVideo);
infoBtn.addEventListener('click', toggleInfo);
filterBtn.addEventListener('click', filterShows);
remotePowerBtn.addEventListener('click', powerDownTv);
powerBtn.addEventListener('click', powerTv);
left.addEventListener('click', () => changeShow(left));
right.addEventListener('click', () => changeShow(right));
