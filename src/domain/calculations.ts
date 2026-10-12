import Decimal from 'decimal.js';
import type { Dataset, Draft, Numeric, Sale } from './types';
Decimal.set({precision: 40, rounding: Decimal.ROUND_HALF_UP});
export const D = (v: Numeric) => new Decimal(v);
export const money = (v: Numeric | null) => v === null ? '확인 필요' : `${D(v).toDecimalPlaces(0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;
export const plain = (v: Numeric | null) => v === null ? '확인 필요' : D(v).toDecimalPlaces(4).toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const koreanToday = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
export function validDate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0,10) === s; }
export function validateDraft(input: Draft, data: Dataset, today = koreanToday()): Record<string,string> {
  const e: Record<string,string> = {};
  if (!validDate(input.date) || input.date < String(data.meta.start_date) || input.date > today) e.date = '자료 시작일 이후, 오늘까지의 실제 판매 날짜를 입력해 주세요.';
  if (!data.menus.some(m=>m.menu_id===input.menu_id)) e.menu_id='등록된 메뉴를 선택해 주세요.';
  if (!['매장','포장'].includes(input.channel)) e.channel='매장 또는 포장을 선택해 주세요.';
  for (const k of ['quantity','unit_price','discount_amount','payment_fee'] as const) {
    const value = input[k]; if (k==='payment_fee' && value==='') continue;
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || (k==='quantity' && Number(value)<=0)) e[k] = k==='quantity' ? '판매 수량은 1 이상의 정수로 입력해 주세요.' : '0 이상의 원 단위 정수를 입력해 주세요.';
  }
  if (!e.quantity && !e.unit_price && !e.discount_amount && D(input.discount_amount).gt(D(input.quantity).times(input.unit_price))) e.discount_amount='할인 총액은 판매 총액을 넘을 수 없습니다.';
  return e;
}
export function costFor(data: Dataset, menuId: string, date: string, channel: string, version?: string) {
  const menu=data.menus.find(m=>m.menu_id===menuId); const rv=version ?? menu?.recipe_version ?? '';
  const recipes=data.recipes.filter(r=>r.menu_id===menuId && r.recipe_version===rv && (!r.channel_only || r.channel_only===channel));
  let food=D(0), packaging=D(0); const reasons: string[]=[];
  if (!recipes.length) reasons.push('적용 레시피가 없습니다.');
  const parts=recipes.map(r=>{
    const mat=data.materials.find(m=>m.material_id===r.material_id);
    const price=data.price_history.filter(p=>p.material_id===r.material_id && p.effective_date<=date).sort((a,b)=>b.effective_date.localeCompare(a.effective_date))[0];
    if (!mat || mat.unit!==r.unit || !price || D(price.pack_quantity).lte(0)) {reasons.push(`${mat?.name ?? r.material_id}: 사용량 단위 또는 당시 가격 확인 필요`); return {...r,name:mat?.name ?? r.material_id,cost:null};}
    const cost=D(price.pack_price).div(price.pack_quantity).times(r.quantity);
    if (['I10','I11'].includes(r.material_id)) packaging=packaging.plus(cost); else food=food.plus(cost);
    return {...r,name:mat.name,cost:cost.toString()};
  });
  return {food:reasons.length ? null : food.toString(), packaging:reasons.length ? null : packaging.toString(),recipeVersion:rv, reasons,parts};
}
export function makeSale(input: Draft, data: Dataset, previous?: Sale, today = koreanToday()): Sale {
  const errors=validateDraft(input,data,today); if(Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const same=previous && previous.date===input.date && previous.menu_id===input.menu_id && previous.channel===input.channel;
  const cost=costFor(data,input.menu_id,input.date,input.channel);
  return {sale_id:previous?.sale_id ?? `S-${crypto.randomUUID()}`,date:input.date,menu_id:input.menu_id,channel:input.channel,quantity:Number(input.quantity),unit_price:input.unit_price,discount_amount:input.discount_amount,net_sales:D(input.quantity).times(input.unit_price).minus(input.discount_amount).toString(),payment_fee:input.payment_fee===''?null:input.payment_fee,recipe_version:same ? previous.recipe_version:cost.recipeVersion,unit_food_cost_snapshot:same ? previous.unit_food_cost_snapshot:cost.food,unit_packaging_cost_snapshot:same ? previous.unit_packaging_cost_snapshot:cost.packaging};
}
export function saleResult(s: Sale) {
  const reasons:string[]=[];
  if (s.payment_fee == null) reasons.push('결제수수료 미입력');
  if (s.unit_food_cost_snapshot == null) reasons.push('당시 식재료 원가 미확인');
  if (s.unit_packaging_cost_snapshot == null) reasons.push('당시 포장 원가 미확인');
  if (!D(s.unit_price).times(s.quantity).minus(s.discount_amount).eq(s.net_sales)) reasons.push('원본 순매출과 수량·단가·할인 불일치');
  const food=s.unit_food_cost_snapshot == null ? null:D(s.unit_food_cost_snapshot).times(s.quantity).toString();
  const packaging=s.unit_packaging_cost_snapshot == null ? null:D(s.unit_packaging_cost_snapshot).times(s.quantity).toString();
  const profit=reasons.length ? null:D(s.net_sales).minus(food!).minus(packaging!).minus(s.payment_fee!).toString();
  return {reasons,food,packaging,profit};
}
export function aggregate(sales: Sale[]) {
  const sum=(get:(s:Sale)=>Numeric|null):string|null=>sales.some(s=>get(s)==null)?null:sales.reduce((t,s)=>t.plus(get(s)!),D(0)).toString();
  const revenue=sum(s=>s.net_sales)!; const profit=sum(s=>saleResult(s).profit);
  return {quantity:sales.reduce((t,s)=>t+s.quantity,0),hall:sales.filter(s=>s.channel==='매장').reduce((t,s)=>t+s.quantity,0),togo:sales.filter(s=>s.channel==='포장').reduce((t,s)=>t+s.quantity,0),revenue,food:sum(s=>saleResult(s).food),packaging:sum(s=>saleResult(s).packaging),fee:sum(s=>s.payment_fee),profit,ratio:profit==null || D(revenue).eq(0)?null:D(profit).div(revenue).times(100).toDecimalPlaces(2).toFixed(2),issues:sales.filter(s=>saleResult(s).reasons.length).length};
}
export function consumption(data: Dataset, sales: Sale[]) {
  const quantities: Record<string,string>={}; const missing: string[]=[];
  for (const s of sales) {
    const recipes=data.recipes.filter(r=>r.menu_id===s.menu_id && r.recipe_version===s.recipe_version && (!r.channel_only || r.channel_only===s.channel));
    if(!recipes.length) missing.push(s.sale_id);
    for(const r of recipes) {
      const m=data.materials.find(m=>m.material_id===r.material_id);
      if(!m || m.unit!==r.unit) {missing.push(s.sale_id);continue;}
      quantities[r.material_id]=D(quantities[r.material_id]??0).plus(D(r.quantity).times(s.quantity)).toString();
    }
  }
  return {quantities,missing};
}
export function recordStatus(data:Dataset,date:string){const c=data.calendar.find(c=>c.date===date);return c?.record_complete?'마감 확인':c?'입력 실적(잠정)':'영업·마감 상태 미확인';}
