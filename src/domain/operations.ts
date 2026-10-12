import {aggregate,consumption,D,koreanToday,validDate} from './calculations';
import type {Dataset,InventoryEvent,Numeric} from './types';
export const expenseCategories=['임차료','인건비','사업주 부담 보험료','수도광열비','관리비','통신·소프트웨어','광고비','소모품·청소비'];
export function bounds(date:string,mode:string){return mode==='day'?{start:date,end:date}:{start:`${date.slice(0,7)}-01`,end:`${date.slice(0,7)}-${new Date(Number(date.slice(0,4)),Number(date.slice(5,7)),0).getDate()}`};}
export function inside(date:string,range:{start:string;end:string}){return date>=range.start&&date<=range.end;}
export function validateExpense(date:string,category:string,amount:string,data:Dataset,today=koreanToday()){
  if(!validDate(date)||date<String(data.meta.start_date)||date>today)throw new Error('자료 시작일 이후, 오늘까지의 귀속일을 선택해 주세요.');
  if(!expenseCategories.includes(category))throw new Error('등록된 비용항목을 선택해 주세요.');
  if(!/^\d+$/.test(amount)||!Number.isSafeInteger(Number(amount)))throw new Error('비용은 0 이상의 원 단위 정수로 입력해 주세요.');
}
export function profitFor(data:Dataset,start:string,end:string){
  const sales=data.sales.filter(s=>inside(s.date,{start,end}));const costs=data.expenses.filter(e=>inside(e.date,{start,end}));const totals=aggregate(sales);
  const expense=costs.reduce((n,e)=>n.plus(e.amount),D(0));
  const days=data.calendar.filter(c=>inside(c.date,{start,end}));const closedDays=days.filter(c=>c.record_complete);const closedDates=new Set(closedDays.map(c=>c.date));
  const confirmed=aggregate(sales.filter(s=>closedDates.has(s.date)));const pending=aggregate(sales.filter(s=>!closedDates.has(s.date)));
  const fullCalendar=days.length===Math.round((Date.parse(`${end}T00:00:00Z`)-Date.parse(`${start}T00:00:00Z`))/86400000)+1;
  const status=totals.issues?'확인 필요':!fullCalendar||days.some(c=>!c.record_complete)?'입력 실적(잠정)':'마감 확인 기록';
  const profit=totals.profit===null?null:D(totals.profit).minus(expense).toString();
  const dates=[...new Set([...sales.map(s=>s.date),...costs.map(c=>c.date),...closedDays.map(c=>c.date)])].sort();
  return {totals,expense:expense.toString(),profit,ratio:profit===null||D(totals.revenue).eq(0)?null:D(profit).div(totals.revenue).times(100).toFixed(2),confirmed,pending,status,closedDays:closedDays.map(c=>c.date),dates,costs,sales};
}
export function inventoryFor(data:Dataset,asOf:string){
  const salesByDay=new Map<string,typeof data.sales>();for(const s of data.sales)if(s.date<=asOf){const list=salesByDay.get(s.date)??[];list.push(s);salesByDay.set(s.date,list);}
  const usageByDay=new Map([...salesByDay].map(([date,sales])=>[date,consumption(data,sales)]));
  return data.materials.map(material=>{
    const opening=data.opening_inventory.filter(r=>r.material_id===material.material_id&&r.date<=asOf).sort((a,b)=>b.date.localeCompare(a.date))[0];
    let balance=opening?D(opening.quantity):D(0),known=!!opening;
    let count:Numeric|null=null,countDate='',before:Numeric|null=null,adjustment:Numeric|null=null,lastInbound='';
    const events=data.inventory_events.filter(e=>e.material_id===material.material_id&&e.date<=asOf&&(!opening||e.date>=opening.date));
    const dates=[...new Set([...events.map(e=>e.date),...usageByDay.keys()].filter(d=>!opening||d>=opening.date))].sort();
    for(const date of dates){
      const day=events.filter(e=>e.date===date);
      for(const e of day.filter(e=>e.counted_quantity==null)){balance=balance.plus(e.quantity);if(e.event_type==='입고')lastInbound=date;}
      const usage=usageByDay.get(date);if(usage?.missing.length)known=false;
      balance=balance.minus(usage?.quantities[material.material_id]??0);
      for(const actual of day.filter(e=>e.counted_quantity!=null)){before=known?balance.toString():null;count=actual.counted_quantity!;countDate=date;adjustment=known?D(count).minus(balance).toString():null;balance=D(count);known=true;}
    }
    return {material,balance:known?balance.toString():null,count,countDate,before,adjustment,lastInbound,events:events.sort((a,b)=>b.date.localeCompare(a.date)),warning:!known?'사용량 또는 초기재고 확인 필요':balance.lt(0)?'음수 재고 확인 필요':''};
  });
}
export interface InventoryDraft {date:string;material_id:string;type:'입고'|'폐기'|'실측'|'실사조정';quantity:string;amount:string;mode:'unit'|'pack';reason:string}
export function makeInventory(input:InventoryDraft,data:Dataset,previous?:InventoryEvent,today=koreanToday()):InventoryEvent{
  const m=data.materials.find(m=>m.material_id===input.material_id);if(!m)throw new Error('기존 재료를 선택해 주세요.');
  if(!validDate(input.date)||input.date<String(data.meta.start_date)||input.date>today)throw new Error('자료 시작일 이후, 오늘까지의 실제 기록 날짜를 선택해 주세요.');
  const adjustment=input.type==='실사조정';const numeric=adjustment?/^-?\d+(\.\d+)?$/:/^\d+(\.\d+)?$/;
  if(!numeric.test(input.quantity))throw new Error('유효한 수량을 입력해 주세요.');
  let quantity=D(input.quantity);if(input.type!=='실측'&&!adjustment&&quantity.lte(0))throw new Error('입고·폐기 수량은 0보다 커야 합니다.');
  if(m.unit==='개'&&!quantity.isInteger())throw new Error('개 단위 수량은 정수로 입력해 주세요.');
  if(input.type==='입고'&&input.mode==='pack'){if(D(m.pack_quantity).lte(0))throw new Error('구매용량을 확인하거나 기준단위 수량으로 입력해 주세요.');quantity=quantity.times(m.pack_quantity);}
  if(input.amount!==''&&(!/^\d+$/.test(input.amount)||!Number.isSafeInteger(Number(input.amount))))throw new Error('구매금액은 0 이상의 원 단위 정수로 입력해 주세요.');
  if(input.type==='실측'&&quantity.lt(0))throw new Error('실측은 0 이상의 실제 수량입니다.');
  const base:InventoryEvent={...(previous??{}),event_id:previous?.event_id??`E-${crypto.randomUUID()}`,date:input.date,material_id:m.material_id,event_type:input.type==='실측'?'실사조정':input.type,quantity:quantity.toString(),unit:m.unit,reason:input.reason};
  delete base.counted_quantity;delete base.unit_cost;delete base.supplier_id;delete base.purchase_amount;
  if(input.type==='실측'){
    const stripped={...data,inventory_events:data.inventory_events.filter(e=>e.event_id!==previous?.event_id)};
    const current=inventoryFor(stripped,input.date).find(r=>r.material.material_id===m.material_id)!;
    return {...base,quantity:current.balance==null?'0':quantity.minus(current.balance).toString(),counted_quantity:quantity.toString()};
  }
  if(input.type==='폐기')return {...base,quantity:quantity.negated().toString()};
  if(input.type==='입고')return {...base,supplier_id:m.supplier_id,...(input.amount!==''?{unit_cost:D(input.amount).div(quantity).toString(),purchase_amount:input.amount}:{})};
  return base;
}
