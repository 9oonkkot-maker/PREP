import {z} from 'zod';
import type {Dataset} from '../domain/types';
import {validateSeed} from '../domain/seed';
import {CafeDB,dataTables,readAll} from '../storage/db';
export interface Backup{format:'prep-cafe-backup';backupVersion:1;appVersion:string;createdAt:string;rulesVersion:1;counts:Record<string,number>;data:Dataset}
const envelope=z.object({format:z.literal('prep-cafe-backup'),backupVersion:z.literal(1),appVersion:z.string(),createdAt:z.string().datetime(),rulesVersion:z.literal(1),counts:z.record(z.string(),z.number().int().nonnegative()),data:z.unknown()});
export async function createBackup(database:CafeDB):Promise<Backup>{const {data}=await readAll(database);return {format:'prep-cafe-backup',backupVersion:1,appVersion:'0.3.0',createdAt:new Date().toISOString(),rulesVersion:1,counts:Object.fromEntries(dataTables.map(name=>[name,data[name].length])),data};}
export function parseBackup(value:unknown):Backup{
 const raw=envelope.safeParse(value);if(!raw.success)throw new Error('이 프로그램에서 지원하는 JSON 백업이 아닙니다. 파일 형식과 버전을 확인해 주세요.');
 const data=validateSeed(raw.data.data);for(const table of dataTables)if(raw.data.counts[table]!==data[table].length)throw new Error(`${table}: 백업의 기록 건수가 맞지 않습니다.`);
 const actuals=new Set<string>();for(const e of data.inventory_events){if(e.counted_quantity!=null){const key=`${e.date}/${e.material_id}`;if(actuals.has(key))throw new Error('같은 날짜·재료의 실측이 중복되어 있습니다.');actuals.add(key);if(Number(e.counted_quantity)<0)throw new Error('실측 수량은 음수일 수 없습니다.');}}
 return {...raw.data,data} as Backup;
}
export async function restoreBackup(database:CafeDB,value:unknown,expected:number){
 const backup=parseBackup(value);
 await database.transaction('rw',database.tables,async()=>{
  const meta=await database.app_meta.get('app');if(!meta||meta.revision!==expected)throw new Error('복원 요약 이후 현재 기록이 변경되었습니다. 백업 파일을 다시 선택해 주세요.');
  for(const name of dataTables){await database.table(name).clear();await database.table(name).bulkAdd(backup.data[name].map((r:any)=>name==='recipes'?{...r,channel_only:r.channel_only??''}:r));}
  await database.table('dataset_meta').put({id:'dataset',meta:backup.data.meta,settings:backup.data.settings});
  await database.app_meta.put({...meta,initialized:true,revision:meta.revision+1,savedAt:new Date().toISOString(),rulesVersion:1});
 });
}
export function backupFilename(now=new Date()){const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now).replace(/[- :]/g,'').replace('T','');return `prep_backup_${stamp.slice(0,8)}_${stamp.slice(8)}.json`;}
