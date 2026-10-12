import 'fake-indexeddb/auto';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {validateSeed} from '../src/domain/seed';
import {D} from '../src/domain/calculations';
import {bounds,inventoryFor,profitFor,validateExpense} from '../src/domain/operations';
import {CafeDB,initialize,readAll} from '../src/storage/db';
import {mutateRecord} from '../src/storage/mutations';
import type {Dataset} from '../src/domain/types';
const raw=JSON.parse(readFileSync('data/매장운영데이터.json','utf8'));const sample=validateSeed(raw);
export function fixture():Dataset{return {...sample,calendar:[{date:'2026-10-12',is_open:true,record_complete:true,weather:'',note:''}],sales:[{sale_id:'test',date:'2026-10-12',menu_id:'M02',channel:'포장',quantity:10,unit_price:'4800',discount_amount:'3000',net_sales:'45000',payment_fee:'675',recipe_version:'R1',unit_food_cost_snapshot:'600',unit_packaging_cost_snapshot:'160'}],expenses:[{expense_id:'cost',date:'2026-10-12',category:'임차료',amount:'20000',recognition:'귀속일'}],opening_inventory:[{material_id:'I02',date:'2026-10-12',quantity:'1000',unit:'ml'}],inventory_events:[{event_id:'in',date:'2026-10-12',material_id:'I02',event_type:'입고',quantity:'3000',unit:'ml'},{event_id:'waste',date:'2026-10-12',material_id:'I02',event_type:'폐기',quantity:'-100',unit:'ml'}]};}
describe('기간 손익·비용',()=>{
 it('FRD 예시 손익 16,725원, 월계획 중복 없음',()=>{const d=fixture();const r=profitFor(d,'2026-10-12','2026-10-12');expect(r.profit).toBe('16725');expect(r.expense).toBe('20000');expect(r.ratio).toBe('37.17');});
 it('같은 금액의 비용 추가·수정·삭제 차이 정확',()=>{const d=fixture();const before=profitFor(d,'2026-10-12','2026-10-12');const next={...d,expenses:[...d.expenses,{...d.expenses[0],expense_id:'extra',amount:'5000'}]};expect(D(before.profit!).minus(profitFor(next,'2026-10-12','2026-10-12').profit!).toString()).toBe('5000');expect(profitFor({...d,expenses:[]},'2026-10-12','2026-10-12').profit).toBe('36725');});
 it('휴무일 귀속 비용·매출 없음의 손실 유지',()=>{const d={...fixture(),sales:[],calendar:[{date:'2026-10-12',is_open:false,record_complete:true,weather:'',note:''}]};expect(profitFor(d,'2026-10-12','2026-10-12').profit).toBe('-20000');});
 it('미마감 실제 입력과 미래 미입력·부분월 구분',()=>{const d=fixture();expect(profitFor(d,'2026-10-01','2026-10-31').status).toBe('입력 실적(잠정)');expect(profitFor({...d,calendar:[]},'2026-10-12','2026-10-12').pending.revenue).toBe('45000');expect(profitFor(d,'2026-10-13','2026-10-31').dates).toHaveLength(0);});
 it('수수료 누락 시 전체 손익 확인 필요',()=>{const d=fixture();d.sales[0].payment_fee=null;expect(profitFor(d,'2026-10-12','2026-10-12').profit).toBeNull();});
 it('윤년·달력 월 범위',()=>{expect(bounds('2024-02-01','month').end).toBe('2024-02-29');expect(bounds('2026-02-01','month').end).toBe('2026-02-28');});
 it.each(['-1','1.1','abc',''])('잘못된 비용 %s 차단',amount=>expect(()=>validateExpense('2026-10-12','임차료',amount,sample,'2026-10-12')).toThrow());
 it('0은 실제 비용값이며 미래 귀속일·모르는 항목 차단',()=>{expect(()=>validateExpense('2026-10-12','임차료','0',sample,'2026-10-12')).not.toThrow();expect(()=>validateExpense('2026-10-13','임차료','1',sample,'2026-10-12')).toThrow();expect(()=>validateExpense('2026-10-12','unknown','1',sample,'2026-10-12')).toThrow();});
});
describe('장부 잔량·실측 기준점',()=>{
 it('입고·판매 소모·폐기를 모두 반영',()=>{const r=inventoryFor(fixture(),'2026-10-12').find(r=>r.material.material_id==='I02')!;expect(r.balance).toBe('1900');});
 it('실측은 한 번 적용하고 과거 수정에도 실제 수량 보존',()=>{const d=fixture();d.inventory_events.push({event_id:'actual',date:'2026-10-12',material_id:'I02',event_type:'실사조정',quantity:'-100',unit:'ml',counted_quantity:'1800'});const r=inventoryFor(d,'2026-10-12').find(r=>r.material.material_id==='I02')!;expect(r.balance).toBe('1800');expect(r.adjustment).toBe('-100');d.sales[0].quantity=9;const next=inventoryFor(d,'2026-10-12').find(r=>r.material.material_id==='I02')!;expect(next.balance).toBe('1800');expect(next.adjustment).toBe('-300');});
 it('미래 변동 제외·실측 이후 변동은 새 기준에서 계산',()=>{const d=fixture();d.inventory_events.push({event_id:'actual',date:'2026-10-12',material_id:'I02',event_type:'실사조정',quantity:'-100',unit:'ml',counted_quantity:'1800'},{event_id:'next',date:'2026-10-13',material_id:'I02',event_type:'입고',quantity:'100',unit:'ml'});expect(inventoryFor(d,'2026-10-12').find(r=>r.material.material_id==='I02')!.balance).toBe('1800');expect(inventoryFor(d,'2026-10-13').find(r=>r.material.material_id==='I02')!.balance).toBe('1900');});
 it('원가 금액만 누락하면 레시피 소모량 유지',()=>{const d=fixture();d.sales[0].unit_food_cost_snapshot=null;expect(inventoryFor(d,'2026-10-12').find(r=>r.material.material_id==='I02')!.balance).toBe('1900');});
 it('음수 잔량은 자동 0 보정 안 함',()=>{const d=fixture();d.inventory_events=[];const r=inventoryFor(d,'2026-10-12').find(r=>r.material.material_id==='I02')!;expect(r.balance).toBe('-1000');expect(r.warning).toContain('음수');});
 it('실측 없는 조정은 증감으로 반영',()=>{const d=fixture();d.inventory_events.push({event_id:'adjust',date:'2026-10-12',material_id:'I02',event_type:'실사조정',quantity:'50',unit:'ml'});expect(inventoryFor(d,'2026-10-12').find(r=>r.material.material_id==='I02')!.balance).toBe('1950');});
 it('원본 재료 11개 결과·실측 시점 차이는 같은 시점에서 계산',()=>{const rows=inventoryFor(sample,'2026-09-18');expect(rows).toHaveLength(11);for(const r of rows)if(r.count!==null&&r.before!==null)expect(D(r.count).minus(r.before).toString()).toBe(r.adjustment);});
});
describe('비용 실제 저장·원자성',()=>{
 it('등록·수정·삭제·재열기·원본 기준정보 보존',async()=>{const db=new CafeDB(`cost-${crypto.randomUUID()}`);try{await initialize(db,async()=>raw);const row={expense_id:'new',date:'2026-10-12',category:'광고비',amount:'5000',recognition:'지정 귀속일의 비용'};await mutateRecord(db,'expenses',row,'new',0);await mutateRecord(db,'expenses',{...row,amount:'6000'},'new',1,true);db.close();await db.open();expect((await db.table('expenses').get('new')).amount).toBe('6000');await expect(mutateRecord(db,'expenses',null,'new',1)).rejects.toThrow('다른 창');await mutateRecord(db,'expenses',null,'new',2);expect((await readAll(db)).data.expenses).toHaveLength(3560);}finally{await db.delete();}});
 it('비용 쓰기 후 저장 실패는 전체 롤백',async()=>{const db=new CafeDB(`fail-${crypto.randomUUID()}`);try{await initialize(db,async()=>raw);db.app_meta.hook('updating',()=>{throw new Error('injected storage failure');});await expect(mutateRecord(db,'expenses',{expense_id:'new',date:'2026-10-12',category:'광고비',amount:'5000',recognition:'귀속일'},'new',0)).rejects.toThrow();expect(await db.table('expenses').get('new')).toBeUndefined();expect((await db.app_meta.get('app'))!.revision).toBe(0);}finally{await db.delete();}});
});
