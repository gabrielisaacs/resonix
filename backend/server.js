// Backend server
import express from 'express';
import {
  playlistRouter,
  tracksRouter,
} from './routes';

const app = express();

app.set('query parser', 'extended');
app.use('/playlists', playlistRouter);
app.use('/tracks', tracksRouter);

app.listen(process.env.RXSERVER || 5000, () => {
  console.log('resonix server listening on port',
    process.env.RXSERVER || 5000);
});