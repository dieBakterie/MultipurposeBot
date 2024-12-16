import { validateStreamer, getTwitchStreamDetails, searchStreamer } from './services/validateTwitchStreamer.js';

console.log(await searchStreamer('derdelphin04'));
console.log(await validateStreamer('derdelphin04'));
console.log(await getTwitchStreamDetails('derdelphin04'));