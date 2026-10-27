'use strict';
// Browser-only replacement for the original Python / openpyxl workbook reader.
// SheetJS reads cached Excel formula results. Recalculate and save the workbook
// in Excel before uploading it. Nothing is sent to a server.
const $ = id => document.getElementById(id);
let viewerTemplate = '';
let activeWorkbook = null;
function notice(message, bad=false){$('status').textContent=message;$('status').classList.toggle('error',bad)}
function fail(error){const message=String(error?.message||error);$('errors').textContent=message;$('errors').classList.add('show');notice('Unable to load workbook',true);console.error(error)}
function clearError(){$('errors').textContent='';$('errors').classList.remove('show')}
const txt=value => value == null ? '' : String(value).trim();
function sheetCell(ws,row,col){const address=window.XLSX.utils.encode_cell({r:row-1,c:col-1}); const cell=ws[address];return cell?.v ?? null}
function lastUsed(ws,col){const range=window.XLSX.utils.decode_range(ws['!ref']||'A1');for(let row=range.e.r+1;row>=1;row--)if(txt(sheetCell(ws,row,col)))return row;return 0}
function number(value,context,errors){
 if(value===null||value===undefined||txt(value)===''){errors.push(`${context}: numeric value missing (recalculate/save formulas in Excel).`);return null}
 if(typeof value==='boolean'){errors.push(`${context}: expected a number.`);return null}
 const valueNumber=Number(value);if(!Number.isFinite(valueNumber)){errors.push(`${context}: invalid value '${value}'.`);return null}return valueNumber;
}
function parseWorkbook(bytes){
 if(!window.XLSX)throw Error('Excel library could not load. Check your internet connection and refresh.');
 const workbook=window.XLSX.read(bytes,{type:'array',cellFormula:true,cellNF:false,cellText:false});
 const errors=[],warnings=[];const required=['Point_Coordinates','Beam_Connections'];
 for(const name of required)if(!workbook.Sheets[name])errors.push(`Missing worksheet: ${name}`);
 if(errors.length)throw Error(errors.join('\n'));
 const pointSheet=workbook.Sheets.Point_Coordinates;const points=[];const seen=new Set();
 for(let r=2;r<=lastUsed(pointSheet,1);r++){
  const id=txt(sheetCell(pointSheet,r,1));
  if(!id){errors.push(`Point_Coordinates!A${r}: blank Point ID within the list.`);continue}
  if(seen.has(id)){errors.push(`Point_Coordinates!A${r}: duplicate Point ID '${id}'.`);continue}seen.add(id);
  const x=number(sheetCell(pointSheet,r,2),`Point_Coordinates!B${r}`,errors);
  const y=number(sheetCell(pointSheet,r,3),`Point_Coordinates!C${r}`,errors);
  const z=number(sheetCell(pointSheet,r,4),`Point_Coordinates!D${r}`,errors);
  if([x,y,z].every(v=>v!==null))points.push({point_id:id,x_mm:x,y_mm:y,z_mm:z});
 }
 if(!points.length)errors.push('Point_Coordinates has no valid points.');
 const coordinates=new Map(points.map(p=>[p.point_id,p]));const beams=[];const seenBeams=new Set();const beamSheet=workbook.Sheets.Beam_Connections;
 const lastBeam=Math.max(lastUsed(beamSheet,1),lastUsed(beamSheet,2),lastUsed(beamSheet,3));
 for(let r=2;r<=lastBeam;r++){
  const id=txt(sheetCell(beamSheet,r,1)),start=txt(sheetCell(beamSheet,r,2)),end=txt(sheetCell(beamSheet,r,3));
  let axis=txt(sheetCell(beamSheet,r,4)).toUpperCase();
  if(![id,start,end,axis].some(Boolean))continue;
  if(!id||!start||!end){errors.push(`Beam_Connections row ${r}: Beam ID and both Point IDs required.`);continue}
  if(seenBeams.has(id)){errors.push(`Beam_Connections row ${r}: duplicate Beam ID '${id}'.`);continue}seenBeams.add(id);
  if(!coordinates.has(start)||!coordinates.has(end)){errors.push(`Beam '${id}': unknown Point ID.`);continue}
  if(start===end){errors.push(`Beam '${id}': start and end are identical.`);continue}
  if(!axis){const a=coordinates.get(start),b=coordinates.get(end);axis=['X','Y','Z'].sort((l,r)=>Math.abs(b[r.toLowerCase()+'_mm']-a[r.toLowerCase()+'_mm'])-Math.abs(b[l.toLowerCase()+'_mm']-a[l.toLowerCase()+'_mm']))[0];warnings.push(`Beam '${id}': Axis inferred as ${axis}.`)}
  if(!['X','Y','Z'].includes(axis)){errors.push(`Beam '${id}': Axis must be X, Y or Z.`);continue}
  beams.push({beam_id:id,start_point:start,end_point:end,axis});
 }
 if(!beams.length)errors.push('Beam_Connections has no valid beams.');
 const measurements=[];const seenStates=new Set();
 for(const name of workbook.SheetNames){
  if(name==='State_Deflection_Template')continue;
  const ws=workbook.Sheets[name];if(txt(sheetCell(ws,1,1)).toLowerCase()!=='deployment state')continue;
  const state=txt(sheetCell(ws,1,3));if(!state){errors.push(`'${name}'!C1: missing deployment state name.`);continue}
  if(seenStates.has(state.toLowerCase())){errors.push(`'${name}'!C1: duplicate state '${state}'.`);continue}seenStates.add(state.toLowerCase());
  const ids=new Set();
  for(let r=3;r<=lastUsed(ws,1);r++){
   const id=txt(sheetCell(ws,r,1));if(!id)continue;
   if(!seen.has(id)){errors.push(`'${name}'!A${r}: unknown Point ID '${id}'.`);continue}
   if(ids.has(id)){errors.push(`'${name}'!A${r}: duplicate Point ID '${id}'.`);continue}ids.add(id);
   const entry={state,point_id:id};
   for(const [field,column,letter] of [['dx_mm',5,'E'],['dy_mm',9,'I'],['dz_mm',13,'M']]){
    const raw=sheetCell(ws,r,column);
    if(raw===null||txt(raw)===''){entry[field]=null;warnings.push(`'${name}' ${id}: ${field} missing cached value.`)}
    else entry[field]=number(raw,`'${name}'!${letter}${r}`,errors);
   }
   measurements.push(entry);
  }
  const missing=[...seen].filter(id=>!ids.has(id));if(missing.length)warnings.push(`'${name}' (${state}): ${missing.length} point(s) missing: ${missing.join(', ')}`);
 }
 if(!seenStates.size)errors.push("No state sheets found (A1 = 'Deployment State', C1 = state name).");
 if(errors.length)throw Error('Workbook validation failed:\n• '+errors.join('\n• '));
 return {points,beams,measurements,warnings};
}
async function showViewer(data,label){
 if(!viewerTemplate)throw Error('3D viewer template has not loaded.');
 // Protect the script boundary when embedding workbook-derived strings in HTML.
 const payload=JSON.stringify({points:data.points,beams:data.beams,measurements:data.measurements}).replace(/</g,'\\u003c');
 $('viewer').srcdoc=viewerTemplate.replace('__PAYLOAD__',payload);
 const stateCount=new Set(data.measurements.map(x=>x.state)).size;
 notice(`${label}: ${data.points.length} points · ${data.beams.length} beams · ${stateCount} states${data.warnings?.length?' · '+data.warnings.length+' warnings':''}`);
 if(data.warnings?.length){$('errors').textContent='Workbook warnings:\n• '+data.warnings.join('\n• ');$('errors').classList.add('show');$('errors').style.color='#fcd34d';$('errors').style.background='#33290e'}
}
async function restoreDemo(){clearError();$('errors').removeAttribute('style');try{const demo=await fetch('./demo-data.json').then(r=>{if(!r.ok)throw Error('Could not load demo-data.json');return r.json()});activeWorkbook=null;await showViewer(demo,'Demo.xlsx')}catch(e){fail(e)}}
async function loadFile(file){
 if(!file)return;clearError();$('errors').removeAttribute('style');notice(`Reading ${file.name}…`);
 try{const bytes=await file.arrayBuffer();const data=parseWorkbook(bytes);activeWorkbook=data;await showViewer(data,file.name)}catch(e){fail(e)}
 finally{$('file').value=''}
}
async function main(){
 try{const response=await fetch('./viewer-template.html');if(!response.ok)throw Error('Could not load viewer-template.html');viewerTemplate=await response.text();
 $('file').addEventListener('change',e=>loadFile(e.target.files?.[0]));$('demo').addEventListener('click',restoreDemo);
 await restoreDemo();
 }catch(e){fail(e)}
}
main();
