import { Client, TablesDB, ID, Permission, Role } from "node-appwrite";

const clean=(v,max=2000)=>String(v??"").trim().slice(0,max);
const json=(res,status,body)=>res.json(body,status);

export default async ({req,res,log,error})=>{
  if(req.method!=="POST")return json(res,405,{message:"Method not allowed"});
  try{
    const body=req.bodyJson??JSON.parse(req.bodyRaw||"{}");
    if(body.website)return json(res,400,{message:"Invalid submission"});
    const kind=clean(body.kind,30), d=body.data||{};
    const name=clean(d.name,120), phone=clean(d.phone,25);
    if(!name||!phone)return json(res,400,{message:"নাম ও মোবাইল নম্বর প্রয়োজন।"});
    const endpoint=process.env.APPWRITE_FUNCTION_API_ENDPOINT||"https://cloud.appwrite.io/v1";
    const project=process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const key=req.headers["x-appwrite-key"];
    const databaseId=process.env.DATABASE_ID;
    const teamId=process.env.ADMIN_TEAM_ID;
    if(!project||!key||!databaseId||!teamId)throw new Error("Function environment is incomplete");
    const client=new Client().setEndpoint(endpoint).setProject(project).setKey(key);
    const db=new TablesDB(client);
    const referenceCode=`SA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    const privatePerms=[Permission.read(Role.team(teamId,["admin","caseworker"])),Permission.update(Role.team(teamId,["admin","caseworker"])),Permission.delete(Role.team(teamId,["admin","caseworker"]))];
    let tableId,data;
    if(kind==="application"){
      const category=clean(d.category,80),address=clean(d.address,1200),details=clean(d.details,4000);
      if(!category||!address||!details)return json(res,400,{message:"সব প্রয়োজনীয় তথ্য পূরণ করুন।"});
      tableId=process.env.APPLICATIONS_TABLE_ID;
      data={referenceCode,category,name,phone,address,details,status:"Pending",submittedAt:new Date().toISOString(),reviewedBy:"",decisionNote:""};
    }else if(kind==="volunteer"){
      const address=clean(d.address,1200),skills=clean(d.skills,2000);
      if(!address||!skills)return json(res,400,{message:"ঠিকানা ও দক্ষতার তথ্য প্রয়োজন।"});
      tableId=process.env.VOLUNTEERS_TABLE_ID;
      data={referenceCode,name,phone,address,skills,status:"Pending",submittedAt:new Date().toISOString()};
    }else return json(res,400,{message:"Unknown form type"});
    if(!tableId)throw new Error("Target table ID is missing");
    await db.createRow({databaseId,tableId,rowId:ID.unique(),data,permissions:privatePerms});
    return json(res,201,{ok:true,referenceCode});
  }catch(e){error(e?.message||String(e));return json(res,500,{message:"আবেদন জমা দেওয়া যায়নি। পরে আবার চেষ্টা করুন।"})}
};
