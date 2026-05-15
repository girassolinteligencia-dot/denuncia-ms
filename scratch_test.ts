import { getPublicIntelligenceData } from './lib/actions/public-intelligence';

async function test() {
  const result = await getPublicIntelligenceData();
  console.log(JSON.stringify(result, null, 2));
}

test();
