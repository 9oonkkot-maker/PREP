import 'fake-indexeddb/auto';
import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {validateSeed} from '../src/domain/seed';
import {makeInventory,inventoryFor,profitFor,type InventoryDraft} from '../src/domain/operations';
import {CafeDB,initialize,readAll,dataTables} from '../src/storage/db';
import {mutateRecord} from '../src/storage/mutations';
import {createBackup,parseBackup,restoreBackup,backupFilename} from '../src/backup/service';
const raw=JSON.parse(readFileSync('data/매장운영데이터.json','utf8'));const data=validateSeed(raw);
const draft:InventoryDraft={date:'2026-10-12',material_id:'I02',type:'입고',quantity:'10',amount:'28000',mode:'pack',reason:'test'};
const make=(extra:Partial<InventoryDraft>={})=>makeInventory({...draft,...extra},data,undefined,'2026-10-12');
it('우유 10묶음 환산과 총금액 단가',()=>{const r=make();expect(r.quantity).toBe('10000');expect(r.unit_cost).toBe('2.8');});
it('구매금액 생략·0 보존',()=>{expect(make({amount:''}).unit_cost).toBeUndefined();expect(make({amount:'0'}).unit_cost).toBe('0');});
it('폐기는 양수 입력을 음수로 저장',()=>expect(make({type:'폐기',quantity:'100',amount:''}).quantity).toBe('-100'));
it('실측 0 허용·기준점 적용',()=>{const r=make({type:'실측',quantity:'0',amount:''});expect(r.counted_quantity).toBe('0');expect(inventoryFor({...data,inventory_events:[...data.inventory_events,r]},draft.date).find(x=>x.material.material_id==='I02')!.balance).toBe('0');});
it.each([{quantity:'0'},{quantity:'-1'},{quantity:'abc'},{amount:'1.2'},{date:'2026-10-13'},{material_id:'bad'}])('입고 오류 차단 %j',extra=>expect(()=>make(extra)).toThrow());
it('개 단위 분수는 차단, ml 소수는 허용',()=>{expect(()=>make({material_id:'I10',quantity:'1.5',mode:'unit'})).toThrow();expect(make({quantity:'1.5',mode:'unit'}).quantity).toBe('1.5');});
it('입고 구매금액은 손익에 중복 반영하지 않음',()=>{const r=make();expect(profitFor({...data,inventory_events:[...data.inventory_events,r]},draft.date,draft.date).profit).toBe(profitFor(data,draft.date,draft.date).profit);});
it('백업 파일명 한국 날짜·시각',()=>expect(backupFilename(new Date('2026-10-11T16:02:03Z'))).toBe('prep_backup_20261012_010203.json'));
async function withDB(fn:(db:CafeDB)=>Promise<void>){const db=new CafeDB(`epic3-${crypto.randomUUID()}`);try{const small=structuredClone(raw);small.sales=small.sales.slice(0,16);small.expenses=small.expenses.slice(0,8);small.inventory_events=small.inventory_events.slice(0,8);await initialize(db,async()=>small);await fn(db);}finally{await db.delete();}}
it('입고 등록·수정·재열기·삭제 저장',()=>withDB(async db=>{const r=make();await mutateRecord(db,'inventory_events',r,r.event_id,0);await mutateRecord(db,'inventory_events',{...r,quantity:'12000'},r.event_id,1,true);db.close();await db.open();expect((await db.table('inventory_events').get(r.event_id)).quantity).toBe('12000');await mutateRecord(db,'inventory_events',null,r.event_id,2);expect((await readAll(db)).data.inventory_events).toHaveLength(8);}));
it('같은 날 실측 중복·오래된 수정 차단',()=>withDB(async db=>{const r=make({type:'실측',quantity:'1800',amount:''});await mutateRecord(db,'inventory_events',r,r.event_id,0);await expect(mutateRecord(db,'inventory_events',{...r,event_id:'another'},'another',1)).rejects.toThrow('실측');await expect(mutateRecord(db,'inventory_events',r,r.event_id,0,true)).rejects.toThrow('다른 창');}));
it('재고 쓰기 실패는 기록과 저장번호 모두 복구',()=>withDB(async db=>{const r=make();db.app_meta.hook('updating',()=>{throw Error('storage failure');});await expect(mutateRecord(db,'inventory_events',r,r.event_id,0)).rejects.toThrow();expect(await db.table('inventory_events').get(r.event_id)).toBeUndefined();expect((await db.app_meta.get('app'))!.revision).toBe(0);}));
it('전체 백업 왕복·정밀한 숫자·기준정보 보존',()=>withDB(async db=>{const backup=await createBackup(db);expect(Object.keys(backup.counts)).toHaveLength(11);const r=make();await mutateRecord(db,'inventory_events',r,r.event_id,0);await restoreBackup(db,JSON.parse(JSON.stringify(backup)),1);expect((await readAll(db)).data).toEqual(backup.data);expect((await db.app_meta.get('app'))!.revision).toBe(2);}));
it('잘못된 버전·건수·연결·원본 JSON 차단',()=>withDB(async db=>{const b=await createBackup(db);expect(()=>parseBackup(raw)).toThrow();expect(()=>parseBackup({...b,backupVersion:2})).toThrow();expect(()=>parseBackup({...b,counts:{...b.counts,sales:1}})).toThrow();const bad=structuredClone(b);bad.data.sales[0].menu_id='invalid';expect(()=>parseBackup(bad)).toThrow();}));
it('잘못된 복원·동시 변경은 현재 기록 유지',()=>withDB(async db=>{const b=await createBackup(db);await expect(restoreBackup(db,{...b,rulesVersion:2},0)).rejects.toThrow();await expect(restoreBackup(db,b,1)).rejects.toThrow();expect((await readAll(db)).data).toEqual(b.data);}));
it('복원 중 모든 표 삭제 이후 실패도 전체 복구',()=>withDB(async db=>{const b=await createBackup(db);db.app_meta.hook('updating',()=>{throw Error('restore storage failure');});await expect(restoreBackup(db,b,0)).rejects.toThrow();const after=await readAll(db);expect(after.data).toEqual(b.data);expect(after.meta.revision).toBe(0);}));
it('기록 없는 유효 백업 복원 후 샘플 재주입 방지',()=>withDB(async db=>{const b=await createBackup(db);for(const t of dataTables){(b.data[t] as unknown[])=[];b.counts[t]=0;}await restoreBackup(db,b,0);db.close();await initialize(db,async()=>{throw Error('must not reseed');});expect((await readAll(db)).data.sales).toHaveLength(0);}));

