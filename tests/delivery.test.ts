import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DeliveryManager } from '../src/systems/DeliveryManager';
test('owl appears by seventh letter even when random delivery never succeeds',()=>{
 const d=new DeliveryManager(()=>0.99);assert.deepEqual(Array.from({length:8},()=>d.next()),['jar','jar','jar','jar','jar','jar','owl','jar']);
});
test('owl can deliver common letters independently of their rarity',()=>{
 const d=new DeliveryManager(()=>0.01);assert.equal(d.next(),'owl');assert.equal(d.next(),'owl');
});

test('wand is a separate delivery path',()=>{assert.equal(new DeliveryManager(()=>0.3).next(),'wand');});
