import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DeliveryManager } from '../src/systems/DeliveryManager';
test('owl appears by seventh letter even when random delivery never succeeds',()=>{
 const d=new DeliveryManager(()=>0.99);assert.deepEqual(Array.from({length:8},()=>d.next()),[false,false,false,false,false,false,true,false]);
});
test('owl can deliver common letters independently of their rarity',()=>{
 const d=new DeliveryManager(()=>0.01);assert.equal(d.next(),true);assert.equal(d.next(),true);
});
