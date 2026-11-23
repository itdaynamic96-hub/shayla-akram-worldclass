import test from "node:test";
import assert from "node:assert/strict";
import { extractYouTubeId, normalizeVideos, embedUrl } from "../site-overrides/assets/youtube.mjs";
test("accepts watch, short, embed and shorts URLs",()=>{
  for (const url of ["https://www.youtube.com/watch?v=abcdefghijk","https://youtu.be/abcdefghijk","https://www.youtube.com/embed/abcdefghijk","https://youtube.com/shorts/abcdefghijk"]) assert.equal(extractYouTubeId(url),"abcdefghijk");
});
test("rejects non-YouTube and unsafe URLs",()=>{
  for (const url of ["http://youtube.com/watch?v=abcdefghijk","https://youtube.com.evil.test/watch?v=abcdefghijk","javascript:alert(1)","not a url"]) assert.equal(extractYouTubeId(url),null);
});
test("normalizes metadata and blocks duplicate IDs",()=>{
  assert.deepEqual(normalizeVideos([{title:"Test",url:"https://youtu.be/abcdefghijk"}]),[{id:"abcdefghijk",title:"Test",description:"",url:"https://www.youtube.com/watch?v=abcdefghijk"}]);
  assert.throws(()=>normalizeVideos([{title:"A",url:"https://youtu.be/abcdefghijk"},{title:"B",url:"https://youtu.be/abcdefghijk"}]),/একই ভিডিও/);
});
test("uses privacy-enhanced embed host",()=>assert.equal(embedUrl("abcdefghijk"),"https://www.youtube-nocookie.com/embed/abcdefghijk"));
