const axios = require('axios');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';
const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

const fetchTranscript = async (videoId, config) => {
    try {
        const identifier = videoId;
        const videoPageResponse = await axios.get(`https://www.youtube.com/watch?v=${identifier}`, {
            headers: {
                ...(config?.lang && { 'Accept-Language': config.lang }),
                'User-Agent': USER_AGENT,
            },
        });

        console.log(config);

        const videoPageBody = videoPageResponse.data;
        const captionsData = parseCaptionsData(videoPageBody, videoId);
        
        if (!captionsData) return;

        const transcriptURL = getTranscriptURL(captionsData, config, videoId);
        const transcriptResponse = await axios.get(transcriptURL, {
            headers: {
                ...(config?.lang && { 'Accept-Language': config.lang }),
                'User-Agent': USER_AGENT,
            },
        });

        const transcriptBody = transcriptResponse.data;
        return extractTranscripts(transcriptBody, config, captionsData);

    } catch (error) {
        console.log(error);
    }
};

const parseCaptionsData = (htmlBody, videoId, config) => {
    const splittedHTML = htmlBody.split('"captions":');

    if (splittedHTML.length <= 1) {
        if (htmlBody.includes('class="g-recaptcha"')) {
            console.log('Too many requests');
        }
        if (!htmlBody.includes('"playabilityStatus":')) {
            console.log('Video unavailable');
        }
        console.log('No captions data 1');
    }

    const captions = JSON.parse(splittedHTML[1].split(',"videoDetails')[0].replace('\n', ''));

    if (!captions) {
        console.log('No captions data 2');
    }
    if ((config === null || config === void 0 ? void 0 : config.lang) &&
        !captions.captionTracks.some((track) => track.languageCode === (config === null || config === void 0 ? void 0 : config.lang))) {
        console.log('No captions data 4');
    }
    
    return captions.playerCaptionsTracklistRenderer;
};


const getTranscriptURL = (captions, config, videoId) => {
    const langCode = config?.lang;
    const tracks = captions.captionTracks;

    if (langCode && !tracks.some(track => track.languageCode === langCode)) {
        throw new YoutubeTranscriptNotAvailableLanguageError(langCode, tracks.map(track => track.languageCode), videoId);
    }

    return (langCode 
        ? tracks.find(track => track.languageCode === langCode) 
        : tracks[0]
    ).baseUrl;
};

const extractTranscripts = (transcriptBody, config, captionsData) => {
    const results = [...transcriptBody.matchAll(RE_XML_TRANSCRIPT)];

    return results.map(result => ({
        text: result[3],
        duration: parseFloat(result[2]),
        offset: parseFloat(result[1]),
        lang: config?.lang || captionsData.captionTracks[0].languageCode,
    }));
};

const string = async (req, res) => {
    const videoId = req.params.id;

    try {
        const transcript = await fetchTranscript(videoId, req.query);
        res.json(transcript);
    } catch (error) {
        res.status(500).json(error);
    }
};

const plaintext = async (req, res) => {
    const videoId = req.params.id;

    try {
        const transcript = await fetchTranscript(videoId, req.query);
        res.json(transcript.map(t => t.text).join(' '));
    } catch (error) {
        res.status(500).json(error);
    }
};

const timestamps = async (req, res) => {
    const videoId = req.params.id;

    try {
        const transcript = await fetchTranscript(videoId, req.query);
        res.json(transcript.map(t => `[${t.offset}] ${t.text}`).join('\n'));
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { string, plaintext, timestamps };
