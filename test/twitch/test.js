// test/twitch/test.js
import {
  validateAndFetchStreamerDetails,
  getTwitchStreamDetails,
  searchStreamer,
  getTwitchStreamerDetails,
} from "../../src/services/Twitch/twitch.js";

async function testTwitch() {
  console.log(await searchStreamer("derdelphin04"));
  /* console.log(await validateAndFetchStreamerDetails("derdelphin04"));
  console.log(await getTwitchStreamDetails("411852372")); */
  console.log(await getTwitchStreamerDetails("411852372"));
}

testTwitch();
