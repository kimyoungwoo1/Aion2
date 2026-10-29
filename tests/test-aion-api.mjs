import assert from 'node:assert/strict';
import { lookupOfficialCharacter, OfficialAionLookupError } from '../src/aion-api.js';

const fakeCharacterId = 'lrXpidRveDSY43S2JfjQroCKsrsLSBAF45nfGpK5kwY%3D';
const officialSearch = {
  list: [{ characterId: fakeCharacterId, name: '<strong>솜구름</strong>', race: 2, serverId: 2018 }]
};
const officialDetail = {
  profile: {
    characterName: '솜구름', className: '호법성', combatPower: 600596,
    characterLevel: 50, serverId: 2018, raceId: 2
  },
  stat: { statList: [{ type: 'STR', value: 259 }, { type: 'ItemLevel', value: 5447 }] }
};

const requests = [];
const fetcher = async (rawUrl) => {
  const url = new URL(rawUrl);
  requests.push(url);
  if (url.pathname.includes('/search/')) {
    assert.equal(url.searchParams.get('keyword'), '솜구름');
    assert.equal(url.searchParams.get('serverId'), '2018');
    assert.equal(url.searchParams.get('race'), '2');
    return new Response(JSON.stringify(officialSearch), {status: 200});
  }
  assert.equal(url.searchParams.get('characterId'), 'lrXpidRveDSY43S2JfjQroCKsrsLSBAF45nfGpK5kwY=');
  assert.equal(url.searchParams.get('serverId'), '2018');
  return new Response(JSON.stringify(officialDetail), {status: 200});
};

const result = await lookupOfficialCharacter('솜구름', 2018, { fetcher });
assert.deepEqual(result, {className: '호법성', itemLevel: 5447, naddolK: 600.6});
assert.equal(requests.length, 2, '공식 API 호출은 검색 1회 + 상세 1회여야 합니다.');

async function mustFail(fetcher, phrase) {
  let error;
  try { await lookupOfficialCharacter('솜구름', 2018, { fetcher }); }
  catch (e) { error = e; }
  assert(error instanceof OfficialAionLookupError);
  assert.match(error.message, phrase);
}

await mustFail(async () => new Response(JSON.stringify({list: [{...officialSearch.list[0], serverId: 2017}]})), /찾지 못했습니다/);
await mustFail(async (rawUrl) => new Response(JSON.stringify(
  new URL(rawUrl).pathname.includes('/search/') ? officialSearch :
    {...officialDetail, profile: {...officialDetail.profile, characterName: '다른캐릭터'}}
)), /일치하지 않습니다/);
await mustFail(async (rawUrl) => new Response(JSON.stringify(
  new URL(rawUrl).pathname.includes('/search/') ? officialSearch :
    {...officialDetail, stat: {statList: []}}
)), /누락되거나 올바르지/);
await mustFail(async (rawUrl) => new Response(JSON.stringify(
  new URL(rawUrl).pathname.includes('/search/') ? officialSearch :
    {...officialDetail, profile: {...officialDetail.profile, combatPower: 0}}
)), /누락되거나 올바르지/);
await mustFail(async () => new Response('invalid-json'), /JSON/);

console.log('PASS: 2 direct official API requests, valid parse, exact match, fail-closed.');
