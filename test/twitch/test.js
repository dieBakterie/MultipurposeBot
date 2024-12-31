// test/twitch/test.js
import {
  validateStreamer,
  getTwitchStreamDetails,
  searchStreamer,
} from "../../src/services/Twitch/twitch.js";

async function testTwitch() {
  console.log(await searchStreamer("derdelphin04"));
  console.log(await validateStreamer("derdelphin04"));
  console.log(await getTwitchStreamDetails("derdelphin04"));
}

testTwitch();
