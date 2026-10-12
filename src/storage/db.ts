import Dexie, { type Table } from 'dexie';
import type { AppMeta, Dataset, Sale } from '../domain/types';
import { validateSeed } from '../domain/seed';
export const dataTables=['suppliers','materials','menus','recipes','price_history','calendar','sales','opening_inventory','inventory_events','expenses','monthly_expense_plan'] as const;
export class CafeDB extends Dexie {
  sales!:Table<Sale,string>; app_meta!:Table<AppMeta,string>;
  constructor(name='prep-cafe-v1') {super(name);this.version(1).stores({suppliers:'supplier_id',materials:'material_id,supplier_id',menus:'menu_id,category',recipes:'[recipe_version+menu_id+material_id+channel_only],menu_id',price_history:'[material_id+effective_date],material_id',calendar:'date',sales:'sale_id,date,menu_id,&[date+menu_id+channel]',opening_inventory:'[material_id+date]',inventory_events:'event_id,date,[material_id+date]',expenses:'expense_id,date,category',monthly_expense_plan:'[month+category]',dataset_meta:'id',app_meta:'id'});}
}
export const db=new CafeDB();
export async function initialize(database:CafeDB,load:()=>Promise<unknown>) {
  await database.open();
  const m=await database.app_meta.get('app'); if(m?.initialized) return;
  const counts=await Promise.all(dataTables.map(t=>database.table(t).count()));
  if(counts.some(Boolean)) throw new Error('기존 자료가 있으나 초기 상태를 확인할 수 없습니다. 자동으로 덮어쓰지 않습니다.');
  const data=validateSeed(await load());
  await database.transaction('rw',database.tables,async()=>{
    if((await database.app_meta.get('app'))?.initialized) return;
    if((await Promise.all(dataTables.map(t=>database.table(t).count()))).some(Boolean)) throw new Error('다른 창에서 자료가 변경되었습니다. 다시 열어 주세요.');
    for(const name of dataTables) {
      const rows=data[name].map((r:any)=>name==='recipes'?{...r,channel_only:r.channel_only??''}:r);
      await database.table(name).bulkAdd(rows);
    }
    await database.table('dataset_meta').put({id:'dataset',meta:data.meta,settings:data.settings});
    await database.app_meta.put({id:'app',initialized:true,revision:0,savedAt:new Date().toISOString(),rulesVersion:1});
  });
}
export async function readAll(database:CafeDB=db) {
  return database.transaction('r',database.tables,async()=>{
    const result:Record<string,unknown>={}; for(const name of dataTables) result[name]=await database.table(name).toArray();
    const info=await database.table('dataset_meta').get('dataset'); const meta=await database.app_meta.get('app');
    if(!info || !meta?.initialized) throw new Error('저장 자료의 상태를 확인할 수 없습니다.');
    return {data:{...result,meta:info.meta,settings:info.settings} as unknown as Dataset,meta};
  });
}
async function checkRevision(database:CafeDB,expected:number){const meta=await database.app_meta.get('app');if(!meta || meta.revision!==expected) throw new Error('다른 창에서 기록이 바뀌었습니다. 입력을 보관한 뒤 다시 불러와 주세요.');return meta;}
export async function saveSale(database:CafeDB,sale:Sale,expected:number,edit:boolean) {
  await database.transaction('rw',database.sales,database.app_meta,async()=>{
    const meta=await checkRevision(database,expected);
    if(edit && !await database.sales.get(sale.sale_id)) throw new Error('수정할 기록이 없어졌습니다. 다시 불러와 주세요.');
    const duplicate=await database.sales.where('[date+menu_id+channel]').equals([sale.date,sale.menu_id,sale.channel]).first();
    if(duplicate && duplicate.sale_id!==sale.sale_id) throw new Error('같은 날짜·메뉴·채널의 기록이 있습니다. 기존 기록을 수정해 주세요.');
    if(edit) await database.sales.put(sale); else await database.sales.add(sale);
    await database.app_meta.put({...meta,revision:meta.revision+1,savedAt:new Date().toISOString()});
  });
}
export async function deleteSales(database:CafeDB,ids:string[],expected:number) {
  await database.transaction('rw',database.sales,database.app_meta,async()=>{
    const meta=await checkRevision(database,expected);
    if(!ids.length || new Set(ids).size!==ids.length || (await database.sales.bulkGet(ids)).some(s=>!s)) throw new Error('삭제 대상을 다시 확인해 주세요.');
    await database.sales.bulkDelete(ids);
    await database.app_meta.put({...meta,revision:meta.revision+1,savedAt:new Date().toISOString()});
  });
}
