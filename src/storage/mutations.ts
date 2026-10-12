import {CafeDB} from './db';
import type {InventoryEvent} from '../domain/types';
export async function mutateRecord(database:CafeDB,table:'expenses'|'inventory_events',row:Record<string,unknown>|null,id:string,expected:number,edit=false){
  await database.transaction('rw',database.table(table),database.app_meta,async()=>{
    const meta=await database.app_meta.get('app');if(!meta||meta.revision!==expected)throw new Error('다른 창에서 기록이 바뀌었습니다. 다시 불러와 주세요.');
    if((edit||!row)&&!await database.table(table).get(id))throw new Error('대상 기록이 없습니다. 다시 불러와 주세요.');
    if(row&&table==='inventory_events'&&row.counted_quantity!=null){const rows=await database.table(table).where('[material_id+date]').equals([String(row.material_id),String(row.date)]).toArray() as InventoryEvent[];if(rows.some(e=>e.event_id!==id&&e.counted_quantity!=null))throw new Error('같은 재료·날짜의 실측이 있습니다. 기존 실측을 수정해 주세요.');}
    if(!row)await database.table(table).delete(id);else if(edit)await database.table(table).put(row);else await database.table(table).add(row);
    await database.app_meta.put({...meta,revision:meta.revision+1,savedAt:new Date().toISOString()});
  });
}
