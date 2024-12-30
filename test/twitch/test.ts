// test/twitch/test.ts
import fs from "fs";
import {
  validateStreamer,
  getStreamerDetails,
  searchStreamer,
} from "../../src/services/Twitch/twitch.js";

async function testTwitchFunctions() {
  // console.log(await searchStreamer("derdelphin04"));
  fs.writeFileSync("testSearchStreamer.json", JSON.stringify(await searchStreamer("derdelphin04"), null, 2));
  // console.log(await validateStreamer("derdelphin04"));
  fs.writeFileSync("testValidateStreamer.json", JSON.stringify(await validateStreamer("derdelphin04"), null, 2));
  // console.log(await getStreamerDetails("derdelphin04"));
  fs.writeFileSync("testStreamerDetails.json", JSON.stringify(await getStreamerDetails("derdelphin04"), null, 2));
}

testTwitchFunctions();
