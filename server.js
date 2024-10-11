const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(express.json());
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/transcript/string/:id', (req, res) => {
    const videoId = req.params.id;

    YoutubeTranscript.fetchTranscript(videoId)
        .then(transcript => {
            res.json(transcript);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching transcript' });
        });
});

app.get('/transcript/plaintext/:id', (req, res) => {
    const videoId = req.params.id;

    YoutubeTranscript.fetchTranscript(videoId)
        .then(transcript => {
            res.json(transcript.map(t => t.text).join(' '));
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching transcript' });
        });
});

app.get('/transcript/timestamps/:id', (req, res) => {
    const videoId = req.params.id;

    YoutubeTranscript.fetchTranscript(videoId)
        .then(transcript => {
            const formattedTranscript = transcript.map(t => `[${t.offset}] ${t.text}`).join('\n');
            res.send(formattedTranscript);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching transcript' });
        });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
