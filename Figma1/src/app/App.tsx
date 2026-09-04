import React, { useState, useRef, useEffect } from "react";
import { clsx as cn } from "clsx";
import {
  LayoutDashboard, Calendar, Heart, TestTube2, Scan, Pill,
  Receipt, Shield, Settings, ChevronDown, ChevronRight, ChevronLeft,
  Bell, HelpCircle, Search, X, Plus, Download,
  Eye, Edit, Check, CheckCircle, TrendingUp, TrendingDown,
  AlertCircle, Info, AlertTriangle, RefreshCw, Phone, MapPin,
  Star, Navigation, Zap, Crown, CreditCard, FileText, Lock,
  ArrowRight, Smartphone, Globe, Languages, HeartPulse, Dumbbell,
  Apple, Target, Flame, BadgeCheck, CalendarCheck, CalendarX,
  ChevronUp, MoreHorizontal, SlidersHorizontal, Sparkles,
  UserPlus, FlaskConical, FileImage, Droplets, ClipboardList,
  ExternalLink, Upload, ShieldCheck, BellOff, User,
  Stethoscope, Building2, Activity, TrendingDown as Trending
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════

const PATIENT = { name:"Arjun Mehta", firstName:"Arjun", phid:"PCT-2026-1054", age:34, gender:"Male", dob:"12 Jun 1992", blood:"B+", mobile:"+91 98201 44712", email:"arjun.mehta@gmail.com", city:"Bengaluru", state:"Karnataka" };

const DOCTORS = [
  { id:"D001", name:"Dr. Priya Sharma",    specialty:"Cardiologist",        exp:15, hospital:"CityCare Multispeciality", location:"Bengaluru", fee:800,  rating:4.9, reviews:324, avail:"Mon, Wed, Fri", verified:true,  gender:"Female", lang:["English","Hindi","Kannada"], about:"Senior cardiologist with 15 years of experience in interventional cardiology and heart failure management. MBBS, MD, DM (Cardiology), AIIMS Delhi.", next:"18 Aug 2026", slots:["10:00 AM","10:30 AM","11:00 AM","03:00 PM","03:30 PM"] },
  { id:"D002", name:"Dr. Kiran Rao",       specialty:"General Physician",   exp:8,  hospital:"Apollo Hospitals",         location:"Bengaluru", fee:400,  rating:4.7, reviews:218, avail:"Mon–Sat",      verified:true,  gender:"Male",   lang:["English","Kannada","Telugu"],  about:"Family physician with 8 years of experience in general medicine, preventive care and chronic disease management.", next:"19 Aug 2026", slots:["09:00 AM","09:30 AM","11:30 AM","02:00 PM"] },
  { id:"D003", name:"Dr. Anjali Kapoor",   specialty:"Dermatologist",       exp:12, hospital:"Fortis Healthcare",         location:"Mumbai",    fee:600,  rating:4.8, reviews:156, avail:"Tue, Thu, Sat",verified:true,  gender:"Female", lang:["English","Hindi","Marathi"],   about:"Experienced dermatologist specialising in medical dermatology, cosmetic procedures and dermato-surgery.", next:"20 Aug 2026", slots:["10:00 AM","11:00 AM","04:00 PM","04:30 PM"] },
  { id:"D004", name:"Dr. Suresh Nair",     specialty:"Orthopaedic Surgeon", exp:20, hospital:"Manipal Hospital",          location:"Bengaluru", fee:1000, rating:4.6, reviews:289, avail:"Mon, Wed, Sat", verified:true,  gender:"Male",   lang:["English","Kannada","Malayalam"],about:"Senior orthopaedic surgeon specialising in joint replacement, sports medicine and spine surgery.", next:"21 Aug 2026", slots:["08:30 AM","09:00 AM","02:00 PM","02:30 PM"] },
  { id:"D005", name:"Dr. Meena Reddy",     specialty:"Gynaecologist",       exp:10, hospital:"Narayana Health",           location:"Hyderabad", fee:500,  rating:4.8, reviews:201, avail:"Mon–Fri",       verified:true,  gender:"Female", lang:["English","Telugu","Hindi"],    about:"Gynaecologist and obstetrician with expertise in high-risk pregnancies, laparoscopy and reproductive health.", next:"22 Aug 2026", slots:["10:00 AM","11:00 AM","03:30 PM","04:00 PM"] },
  { id:"D006", name:"Dr. Rajesh Patel",    specialty:"Neurologist",         exp:18, hospital:"NIMHANS",                  location:"Bengaluru", fee:900,  rating:4.7, reviews:176, avail:"Mon, Tue, Thu",  verified:true,  gender:"Male",   lang:["English","Hindi","Gujarati"],  about:"Neurologist with expertise in epilepsy, stroke management, headache disorders and neurodegenerative diseases.", next:"25 Aug 2026", slots:["09:30 AM","10:00 AM","03:00 PM","04:00 PM"] },
];

const HOSPITALS = [
  { id:"H001", name:"CityCare Multispeciality Hospital", location:"MG Road, Bengaluru", depts:["Cardiology","Orthopaedics","Neurology","Obs & Gynae","Oncology"], beds:250, rating:4.8, verified:true, nabh:true, emergency:true, insurance:["Star Health","Bajaj Allianz","HDFC ERGO","Max Bupa"], contact:"+91 80-4567-8901" },
  { id:"H002", name:"Apollo Hospitals",                  location:"Jayanagar, Bengaluru", depts:["General Medicine","Cardiology","Dermatology","Paediatrics"], beds:400, rating:4.9, verified:true, nabh:true, emergency:true, insurance:["All major insurers"], contact:"+91 80-2222-3333" },
  { id:"H003", name:"Fortis Healthcare",                 location:"Andheri West, Mumbai", depts:["Oncology","Cardiology","Dermatology","Neurology"], beds:350, rating:4.7, verified:true, nabh:true, emergency:true, insurance:["Star Health","Cigna","United India"], contact:"+91 22-6767-6767" },
  { id:"H004", name:"Manipal Hospital",                  location:"HAL Airport Road, Bengaluru", depts:["Orthopaedics","Neurology","Urology","Nephrology"], beds:300, rating:4.6, verified:true, nabh:false, emergency:true, insurance:["HDFC ERGO","New India","Bajaj Allianz"], contact:"+91 80-2502-4444" },
];

const MY_APPOINTMENTS = [
  { id:"APT-8821", doctor:"Dr. Priya Sharma", specialty:"Cardiology", hospital:"CityCare Multispeciality", date:"18 Aug 2026", time:"10:30 AM", type:"In-person", status:"upcoming", fee:800, apptId:"APT-CCH-8821" },
  { id:"APT-7713", doctor:"Dr. Kiran Rao",    specialty:"General Medicine", hospital:"Apollo Hospitals",    date:"28 Jul 2026", time:"09:00 AM", type:"In-person", status:"completed", fee:400, apptId:"APT-APL-7713" },
  { id:"APT-6609", doctor:"Dr. Anjali Kapoor",specialty:"Dermatology",     hospital:"Fortis Healthcare",   date:"15 Jul 2026", time:"11:00 AM", type:"In-person", status:"cancelled", fee:600, apptId:"APT-FRT-6609" },
];

const LAB_REPORTS = [
  { id:"LR001", test:"Complete Blood Count (CBC)",   lab:"Dr. Lal PathLabs",  date:"28 Jul 2026", status:"ready",      orderedBy:"Dr. Kiran Rao" },
  { id:"LR002", test:"Lipid Profile",                lab:"Dr. Lal PathLabs",  date:"28 Jul 2026", status:"ready",      orderedBy:"Dr. Kiran Rao" },
  { id:"LR003", test:"Thyroid Stimulating Hormone",  lab:"SRL Diagnostics",   date:"10 Aug 2026", status:"processing", orderedBy:"Dr. Kiran Rao" },
  { id:"LR004", test:"Fasting Blood Glucose",        lab:"Metropolis",         date:"10 Aug 2026", status:"ordered",    orderedBy:"Dr. Priya Sharma" },
];

const RADIOLOGY_REPORTS = [
  { id:"RD001", study:"Chest X-Ray (PA View)",    facility:"CityCare Imaging Centre", date:"28 Jul 2026", status:"ready", orderedBy:"Dr. Kiran Rao" },
  { id:"RD002", study:"2D Echocardiography",       facility:"CityCare Imaging Centre", date:"05 Aug 2026", status:"ready", orderedBy:"Dr. Priya Sharma" },
];

const PRESCRIPTIONS_DATA = [
  { id:"RX001", doctor:"Dr. Kiran Rao", hospital:"Apollo Hospitals", date:"28 Jul 2026", meds:[
    { name:"Atorvastatin 10mg",    dose:"1 tablet",     freq:"Once at night",  dur:"90 days",  notes:"Take with or without food" },
    { name:"Levothyroxine 25 mcg", dose:"1 tablet",     freq:"Once in morning",dur:"90 days",  notes:"Take on empty stomach, 30 mins before food" },
    { name:"Vitamin D3 60000 IU",  dose:"1 capsule",    freq:"Once a week",    dur:"12 weeks", notes:"Take after food" },
  ]},
];

const INSURANCE_DATA = [
  { id:"INS001", provider:"Star Health Insurance", policyNo:"STAR-2847-2026", memberId:"MEM-77291", type:"Individual Health Plan", sumInsured:"₹5,00,000", premium:"₹12,400 / yr", validFrom:"01 Apr 2026", validUntil:"31 Mar 2027", status:"active" },
];

const PAYMENTS_DATA = [
  { id:"PAY001", date:"28 Jul 2026", provider:"Dr. Kiran Rao",    service:"OPD Consultation", amount:"₹400",  status:"paid",    receipt:"REC-APL-28072026" },
  { id:"PAY002", date:"05 Aug 2026", provider:"CityCare Imaging", service:"Echocardiography", amount:"₹2,200",status:"paid",    receipt:"REC-CCH-05082026" },
  { id:"PAY003", date:"18 Aug 2026", provider:"Dr. Priya Sharma", service:"OPD Consultation", amount:"₹800",  status:"pending", receipt:null },
];

const NOTIFICATIONS_DATA = [
  { id:1, cat:"appointments", title:"Appointment Reminder",       message:"You have an appointment with Dr. Priya Sharma tomorrow at 10:30 AM.", time:"Today, 08:00 AM", read:false },
  { id:2, cat:"reports",      title:"Lab Report Ready",           message:"Your Lipid Profile report is now available. Tap to view.", time:"28 Jul 2026, 04:15 PM", read:false },
  { id:3, cat:"reports",      title:"Lab Report Ready",           message:"Your CBC report is now available.", time:"28 Jul 2026, 04:00 PM", read:true },
  { id:4, cat:"appointments", title:"Appointment Confirmed",      message:"Appointment with Dr. Kiran Rao on 28 Jul 2026 at 09:00 AM has been confirmed.", time:"25 Jul 2026, 02:30 PM", read:true },
  { id:5, cat:"payments",     title:"Payment Successful",         message:"₹400 paid to Apollo Hospitals for consultation with Dr. Kiran Rao.", time:"28 Jul 2026, 09:15 AM", read:true },
  { id:6, cat:"insurance",    title:"Insurance Policy Active",    message:"Your Star Health policy STAR-2847-2026 is active until 31 Mar 2027.", time:"01 Apr 2026, 10:00 AM", read:true },
];

const AVATAR_PALETTE = ["bg-[#1D4ED8] text-white","bg-[#0D9488] text-white","bg-[#7C3AED] text-white","bg-[#D97706] text-white","bg-[#DC2626] text-white","bg-[#059669] text-white"];

// ═══════════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════

type ButtonVariant = "primary"|"secondary"|"outline"|"danger"|"ghost";
type ButtonSize    = "sm"|"md"|"lg";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant; size?: ButtonSize;
  leftIcon?: React.ReactNode; rightIcon?: React.ReactNode;
  loading?: boolean; fullWidth?: boolean;
}
const BTN_V: Record<ButtonVariant,string> = {
  primary:  "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] focus:ring-blue-300 shadow-sm",
  secondary:"bg-[#0D9488] text-white hover:bg-[#0F766E] focus:ring-teal-300 shadow-sm",
  outline:  "bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#F9FAFB] focus:ring-blue-200",
  danger:   "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-red-300 shadow-sm",
  ghost:    "bg-transparent text-[#374151] hover:bg-[#F3F4F6] focus:ring-blue-200",
};
const BTN_S: Record<ButtonSize,string> = {
  sm:"h-7 px-3 text-xs gap-1.5 rounded-md",
  md:"h-9 px-4 text-sm gap-2 rounded-lg",
  lg:"h-11 px-5 text-sm gap-2 rounded-xl",
};
const Button: React.FC<ButtonProps> = ({variant="primary",size="md",leftIcon,rightIcon,loading,fullWidth,children,className,disabled,...rest}) => (
  <button disabled={disabled||loading} className={cn(
    "inline-flex items-center justify-center font-medium transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer",
    "disabled:opacity-55 disabled:cursor-not-allowed select-none",
    BTN_V[variant], BTN_S[size], fullWidth&&"w-full", className
  )} {...rest}>
    {loading?<span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />:leftIcon&&<span className="flex-shrink-0 flex">{leftIcon}</span>}
    <span>{children}</span>
    {!loading&&rightIcon&&<span className="flex-shrink-0 flex">{rightIcon}</span>}
  </button>
);

type BadgeVariant = "default"|"success"|"warning"|"error"|"info"|"neutral"|"premium";
const BADGE_S: Record<BadgeVariant,string> = {
  default: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
  success: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]",
  warning: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
  error:   "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
  info:    "bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]",
  neutral: "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]",
  premium: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white border-0",
};
const Badge: React.FC<{variant?: BadgeVariant; children: React.ReactNode; className?: string}> = ({variant="default",children,className}) => (
  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",BADGE_S[variant],className)}>{children}</span>
);

const AV_S: Record<string,string> = {xs:"w-6 h-6 text-[9px]",sm:"w-8 h-8 text-xs",md:"w-9 h-9 text-sm",lg:"w-11 h-11 text-base",xl:"w-14 h-14 text-lg","2xl":"w-20 h-20 text-2xl"};
const Avatar: React.FC<{name:string;size?:"xs"|"sm"|"md"|"lg"|"xl"|"2xl";className?:string}> = ({name,size="md",className}) => {
  const initials = name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();
  const color = AVATAR_PALETTE[name.charCodeAt(0)%AVATAR_PALETTE.length];
  return <div className={cn("rounded-full flex items-center justify-center font-semibold flex-shrink-0",AV_S[size],color,className)}>{initials}</div>;
};

const Card: React.FC<{children:React.ReactNode;className?:string;padding?:"none"|"sm"|"md"|"lg";hover?:boolean}> = ({children,className,padding="md",hover}) => {
  const pads={none:"",sm:"p-4",md:"p-5",lg:"p-6"};
  return <div className={cn("bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)]",pads[padding],hover&&"hover:shadow-md hover:border-[#BFDBFE] transition-all duration-200 cursor-pointer",className)}>{children}</div>;
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:string; error?:string; hint?:string;
  leftIcon?:React.ReactNode; rightIcon?:React.ReactNode;
}
const Input: React.FC<InputProps> = ({label,error,hint,leftIcon,rightIcon,className,...rest}) => (
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest">{label}</label>}
    <div className="relative">
      {leftIcon&&<div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] flex">{leftIcon}</div>}
      <input className={cn("w-full h-9 border rounded-lg text-sm text-[#111827] bg-white transition-colors","focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#1D4ED8] placeholder:text-[#9CA3AF]",leftIcon?"pl-9":"pl-3.5",rightIcon?"pr-9":"pr-3.5",error?"border-[#DC2626] bg-[#FEF2F2]":"border-[#D1D5DB] hover:border-[#94A3B8]",className)} {...rest} />
      {rightIcon&&<div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] flex">{rightIcon}</div>}
    </div>
    {error&&<span className="flex items-center gap-1.5 text-xs text-[#DC2626]"><AlertCircle className="w-3 h-3" />{error}</span>}
    {hint&&!error&&<span className="text-xs text-[#6B7280]">{hint}</span>}
  </div>
);

const Select: React.FC<InputProps&{children:React.ReactNode}> = ({label,error,children,className,...rest}) => (
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest">{label}</label>}
    <select className={cn("w-full h-9 px-3 border rounded-lg text-sm text-[#111827] bg-white transition-colors","focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#1D4ED8] cursor-pointer",error?"border-[#DC2626]":"border-[#D1D5DB] hover:border-[#94A3B8]",className)} {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}>{children}</select>
    {error&&<span className="flex items-center gap-1.5 text-xs text-[#DC2626]"><AlertCircle className="w-3 h-3" />{error}</span>}
  </div>
);

const SearchInput: React.FC<{value:string;onChange:(v:string)=>void;placeholder?:string;className?:string;large?:boolean}> = ({value,onChange,placeholder="Search...",className,large}) => (
  <div className={cn("relative",className)}>
    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]",large?"w-5 h-5":"w-4 h-4")} />
    <input type="search" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      className={cn("w-full border border-[#E2E8F0] rounded-xl text-[#111827] bg-white","focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#1D4ED8]","placeholder:text-[#9CA3AF]",large?"h-12 pl-11 text-base pr-4":"h-9 pl-9 text-sm",value?"pr-8":"pr-3")} />
    {value&&<button onClick={()=>onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"><X className="w-3.5 h-3.5" /></button>}
  </div>
);

interface TabItem { id:string; label:string; count?:number }
const Tabs: React.FC<{items:TabItem[];active:string;onChange:(id:string)=>void;className?:string}> = ({items,active,onChange,className}) => (
  <div className={cn("flex border-b border-[#E2E8F0] overflow-x-auto [&::-webkit-scrollbar]:hidden",className)}>
    {items.map(item=>(
      <button key={item.id} onClick={()=>onChange(item.id)}
        className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer",
          active===item.id?"border-[#1D4ED8] text-[#1D4ED8]":"border-transparent text-[#6B7280] hover:text-[#374151] hover:border-[#D1D5DB]")}>
        {item.label}
        {item.count!==undefined&&<span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",active===item.id?"bg-[#EFF6FF] text-[#1D4ED8]":"bg-[#F3F4F6] text-[#6B7280]")}>{item.count}</span>}
      </button>
    ))}
  </div>
);

type AlertVariant = "success"|"warning"|"error"|"info";
const ALERT_C: Record<AlertVariant,{Icon:React.ComponentType<any>;cls:string;icl:string}> = {
  success:{Icon:CheckCircle,  cls:"bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]", icl:"text-[#16A34A]"},
  warning:{Icon:AlertTriangle,cls:"bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]", icl:"text-[#D97706]"},
  error:  {Icon:AlertCircle,  cls:"bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]", icl:"text-[#DC2626]"},
  info:   {Icon:Info,         cls:"bg-[#F0F9FF] border-[#BAE6FD] text-[#075985]", icl:"text-[#0284C7]"},
};
const Alert: React.FC<{variant:AlertVariant;title?:string;children:React.ReactNode;onClose?:()=>void;className?:string}> = ({variant,title,children,onClose,className}) => {
  const {Icon,cls,icl}=ALERT_C[variant];
  return (
    <div className={cn("flex gap-3 p-4 rounded-xl border text-sm",cls,className)}>
      <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5",icl)} />
      <div className="flex-1 min-w-0">{title&&<p className="font-semibold mb-0.5">{title}</p>}<p className="leading-relaxed opacity-90">{children}</p></div>
      {onClose&&<button onClick={onClose} className="flex-shrink-0 opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>}
    </div>
  );
};

const Modal: React.FC<{isOpen:boolean;onClose:()=>void;title:string;children:React.ReactNode;footer?:React.ReactNode;size?:"sm"|"md"|"lg"}> = ({isOpen,onClose,title,children,footer,size="md"}) => {
  useEffect(()=>{if(isOpen)document.body.style.overflow="hidden";else document.body.style.overflow="";return()=>{document.body.style.overflow="";};},[isOpen]);
  if(!isOpen)return null;
  const sizes={sm:"max-w-sm",md:"max-w-lg",lg:"max-w-2xl"};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl w-full",sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">{children}</div>
        {footer&&<div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

const Skeleton: React.FC<{className?:string}> = ({className}) => <div className={cn("bg-[#E2E8F0] rounded animate-pulse",className)} />;

const StarRating: React.FC<{rating:number;size?:"sm"|"md"}> = ({rating,size="sm"}) => (
  <div className={cn("flex items-center gap-0.5",size==="sm"?"text-xs":"text-sm")}>
    {[1,2,3,4,5].map(i=>(
      <Star key={i} className={cn(size==="sm"?"w-3 h-3":"w-4 h-4",i<=Math.floor(rating)?"fill-[#F59E0B] text-[#F59E0B]":"text-[#D1D5DB]")} />
    ))}
  </div>
);

const ProBadge: React.FC<{className?:string}> = ({className}) => (
  <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[9px] font-bold rounded-full",className)}>
    <Crown className="w-2.5 h-2.5" />PRO
  </span>
);

// ═══════════════════════════════════════════════════════════════════
// PATIENT NAV
// ═══════════════════════════════════════════════════════════════════

const PATIENT_NAV = [
  { group:"HOME", items:[
    { id:"dashboard",    label:"Dashboard",          icon:LayoutDashboard, pro:false },
  ]},
  { group:"CARE", items:[
    { id:"find-doctor",  label:"Find a Doctor",      icon:Stethoscope,     pro:false },
    { id:"find-hospital",label:"Find a Hospital",    icon:Building2,       pro:false },
    { id:"appointments", label:"Appointments",       icon:CalendarCheck,   pro:false, badge:1 },
    { id:"records",      label:"Medical Records",    icon:FileText,        pro:false },
    { id:"prescriptions",label:"Prescriptions",      icon:ClipboardList,   pro:false },
    { id:"lab-reports",  label:"Lab Reports",        icon:FlaskConical,    pro:false, badge:2 },
    { id:"radiology",    label:"Radiology",          icon:FileImage,       pro:false },
  ]},
  { group:"HEALTH", items:[
    { id:"health-dashboard",label:"Health Dashboard",icon:HeartPulse,      pro:true  },
    { id:"health-plans",    label:"Personalized Plans",icon:Target,        pro:true  },
  ]},
  { group:"FINANCE", items:[
    { id:"insurance",    label:"Insurance",          icon:Shield,          pro:false },
    { id:"payments",     label:"Payments",           icon:CreditCard,      pro:false },
  ]},
  { group:"ACCOUNT", items:[
    { id:"notifications",label:"Notifications",      icon:Bell,            pro:false, badge:2 },
    { id:"consent",      label:"Consent & Privacy",  icon:ShieldCheck,     pro:false },
    { id:"settings",     label:"Settings",           icon:Settings,        pro:false },
  ]},
];

// ═══════════════════════════════════════════════════════════════════
// PATIENT SIDEBAR
// ═══════════════════════════════════════════════════════════════════

const PatientSidebar: React.FC<{activeNav:string;onNavChange:(id:string)=>void}> = ({activeNav,onNavChange}) => (
  <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden">
    {/* Logo */}
    <div className="flex items-center gap-3 px-5 h-[57px] border-b border-[#E2E8F0] flex-shrink-0">
      <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        <Heart className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[#0F172A] font-bold text-[13px] leading-tight">Healthcare Platform</p>
        <p className="text-[#94A3B8] text-[9px] font-semibold tracking-[0.15em] uppercase">Patient Portal</p>
      </div>
    </div>
    {/* Nav */}
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5" style={{scrollbarWidth:"none"}}>
      {PATIENT_NAV.map(group=>(
        <div key={group.group}>
          <p className="text-[9px] font-bold text-[#CBD5E1] uppercase tracking-[0.18em] px-3 mb-1.5">{group.group}</p>
          <ul className="space-y-0.5">
            {group.items.map(item=>{
              const isActive = activeNav===item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button onClick={()=>onNavChange(item.id)} className={cn(
                    "w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-150 text-left cursor-pointer",
                    isActive?"bg-[#EFF6FF] text-[#1D4ED8] font-semibold":"text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#374151] font-medium"
                  )}>
                    <Icon className={cn("w-4 h-4 flex-shrink-0",isActive?"text-[#1D4ED8]":"text-[#94A3B8]")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.pro && <ProBadge />}
                    {item.badge&&!item.pro&&(
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",isActive?"bg-[#BFDBFE] text-[#1D4ED8]":"bg-[#F1F5F9] text-[#94A3B8]")}>{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
    {/* Profile footer */}
    <div className="border-t border-[#E2E8F0] p-3 flex-shrink-0">
      <button onClick={()=>onNavChange("profile")} className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer",
        activeNav==="profile"?"bg-[#EFF6FF]":"hover:bg-[#F8FAFC]"
      )}>
        <Avatar name={PATIENT.name} size="sm" />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12px] font-semibold text-[#111827] truncate">{PATIENT.name}</p>
          <p className="text-[10px] text-[#94A3B8] font-mono truncate">{PATIENT.phid}</p>
        </div>
      </button>
    </div>
  </aside>
);

// ═══════════════════════════════════════════════════════════════════
// PATIENT HEADER
// ═══════════════════════════════════════════════════════════════════

const PatientHeader: React.FC<{activeNav:string;onNavChange:(id:string)=>void}> = ({activeNav,onNavChange}) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser]   = useState(false);
  const [search, setSearch]       = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(notifRef.current&&!notifRef.current.contains(e.target as Node))setShowNotif(false);
      if(userRef.current&&!userRef.current.contains(e.target as Node))setShowUser(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);
  const unread = NOTIFICATIONS_DATA.filter(n=>!n.read).length;
  return (
    <header className="h-[57px] bg-white border-b border-[#E2E8F0] flex items-center px-5 gap-4 flex-shrink-0 z-20">
      <div className="flex-1 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search doctors, hospitals, specialties..." />
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Location */}
        <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[13px] text-[#374151] transition-colors cursor-pointer">
          <MapPin className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span className="font-medium">{PATIENT.city}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={()=>setShowNotif(!showNotif)} className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors cursor-pointer">
            <Bell className="w-[18px] h-[18px]" />
            {unread>0&&<span className="absolute top-[7px] right-[7px] w-[9px] h-[9px] bg-[#DC2626] rounded-full border-2 border-white" />}
          </button>
          {showNotif&&(
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-30">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
                <p className="text-sm font-semibold text-[#111827]">Notifications</p>
                {unread>0&&<Badge variant="error">{unread} new</Badge>}
              </div>
              <div className="divide-y divide-[#F8FAFC]" style={{maxHeight:300,overflowY:"auto"}}>
                {NOTIFICATIONS_DATA.slice(0,4).map(n=>(
                  <div key={n.id} className={cn("flex gap-3 px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer",!n.read&&"bg-[#FAFBFF]")}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:n.read?"transparent":"#1D4ED8"}} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#111827]">{n.title}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-[#F1F5F9] text-center">
                <button onClick={()=>{setShowNotif(false);onNavChange("notifications");}} className="text-xs text-[#1D4ED8] font-semibold hover:underline cursor-pointer">View all notifications</button>
              </div>
            </div>
          )}
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] cursor-pointer"><HelpCircle className="w-[18px] h-[18px]" /></button>
        <div className="w-px h-6 bg-[#E2E8F0] mx-1" />
        {/* User */}
        <div className="relative" ref={userRef}>
          <button onClick={()=>setShowUser(!showUser)} className="flex items-center gap-2.5 h-9 px-2 rounded-lg hover:bg-[#F3F4F6] transition-colors cursor-pointer">
            <Avatar name={PATIENT.name} size="sm" />
            <div className="text-left hidden sm:block">
              <p className="text-[12px] font-semibold text-[#111827]">{PATIENT.firstName}</p>
              <p className="text-[10px] text-[#9CA3AF]">Patient</p>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-[#9CA3AF] transition-transform",showUser&&"rotate-180")} />
          </button>
          {showUser&&(
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-[#E2E8F0] shadow-xl py-1.5 z-30">
              <div className="px-4 py-3 border-b border-[#F1F5F9] mb-1">
                <p className="text-sm font-semibold text-[#111827]">{PATIENT.name}</p>
                <p className="text-xs text-[#6B7280]">{PATIENT.email}</p>
              </div>
              {[{id:"profile",label:"My Profile",Icon:User},{id:"health-dashboard",label:"My Health",Icon:HeartPulse},{id:"appointments",label:"Appointments",Icon:CalendarCheck},{id:"records",label:"Medical Records",Icon:FileText},{id:"insurance",label:"Insurance",Icon:Shield},{id:"payments",label:"Payments",Icon:CreditCard},{id:"settings",label:"Settings",Icon:Settings}].map(({id,label,Icon})=>(
                <button key={id} onClick={()=>{onNavChange(id);setShowUser(false);}} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#374151] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                  <Icon className="w-4 h-4 text-[#6B7280]" />{label}
                </button>
              ))}
              <div className="border-t border-[#F1F5F9] mt-1 pt-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PATIENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════

const PatientDashboard: React.FC<{onNav:(id:string)=>void;onBookAppt:()=>void}> = ({onNav,onBookAppt}) => {
  const upcomingAppt = MY_APPOINTMENTS.find(a=>a.status==="upcoming");
  const [cancelModal, setCancelModal] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-[#1D4ED8] to-[#0D9488] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 80% 50%, white 0%, transparent 60%)"}} />
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium">{greeting}</p>
          <h1 className="text-2xl font-bold mt-0.5">{PATIENT.firstName} 👋</h1>
          <p className="text-blue-200 text-sm mt-1">Here's your health overview for today.</p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button onClick={onBookAppt} className="flex items-center gap-2 bg-white text-[#1D4ED8] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer shadow-sm">
              <CalendarCheck className="w-4 h-4" />Book Appointment
            </button>
            <button onClick={()=>onNav("find-doctor")} className="flex items-center gap-2 bg-white/20 text-white font-medium text-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-colors cursor-pointer">
              <Stethoscope className="w-4 h-4" />Find a Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {label:"Upcoming Appointment",value:"18 Aug 2026",sub:"Dr. Priya Sharma",Icon:CalendarCheck,iconC:"text-[#1D4ED8]",iconB:"bg-[#EFF6FF]",onClick:()=>onNav("appointments")},
          {label:"Active Prescriptions",value:"3 medicines",sub:"Prescribed 28 Jul",Icon:ClipboardList,iconC:"text-[#0D9488]",iconB:"bg-[#F0FDFA]",onClick:()=>onNav("prescriptions")},
          {label:"Pending Reports",value:"2 reports",sub:"1 processing, 1 ordered",Icon:FlaskConical,iconC:"text-[#D97706]",iconB:"bg-[#FFFBEB]",onClick:()=>onNav("lab-reports")},
          {label:"Insurance Status",value:"Active",sub:"Star Health · Till Mar 2027",Icon:Shield,iconC:"text-[#16A34A]",iconB:"bg-[#F0FDF4]",onClick:()=>onNav("insurance")},
        ].map(({label,value,sub,Icon,iconC,iconB,onClick})=>(
          <Card key={label} hover className="cursor-pointer" onClick={onClick}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{label}</p>
                <p className="text-lg font-bold text-[#0F172A] mt-1 leading-tight">{value}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{sub}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",iconB)}>
                <Icon className={cn("w-5 h-5",iconC)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left col (2/3) */}
        <div className="col-span-2 space-y-5">
          {/* Upcoming Appointment */}
          {upcomingAppt && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#0F172A]">Upcoming Appointment</h2>
                <button onClick={()=>onNav("appointments")} className="text-xs text-[#1D4ED8] font-semibold hover:underline cursor-pointer flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              <div className="flex items-start gap-4 p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl">
                <Avatar name={upcomingAppt.doctor} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">{upcomingAppt.doctor}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{upcomingAppt.specialty} · {upcomingAppt.hospital}</p>
                    </div>
                    <Badge variant="default">Upcoming</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2.5 text-sm text-[#374151]">
                    <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />{upcomingAppt.date}</span>
                    <span className="flex items-center gap-1.5"><Clock2 className="w-3.5 h-3.5 text-[#1D4ED8]" />{upcomingAppt.time}</span>
                    <Badge variant="neutral">{upcomingAppt.type}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>Reschedule</Button>
                <Button variant="ghost" size="sm" className="text-[#DC2626]" onClick={()=>setCancelModal(true)}>Cancel Appointment</Button>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                {label:"Book Appointment",Icon:CalendarCheck,color:"bg-[#EFF6FF] text-[#1D4ED8]",onClick:onBookAppt},
                {label:"Find Doctor",     Icon:Stethoscope,  color:"bg-[#F0FDFA] text-[#0D9488]",onClick:()=>onNav("find-doctor")},
                {label:"Find Hospital",  Icon:Building2,    color:"bg-[#F5F3FF] text-[#7C3AED]",onClick:()=>onNav("find-hospital")},
                {label:"Medical Records",Icon:FileText,     color:"bg-[#FFFBEB] text-[#D97706]",onClick:()=>onNav("records")},
                {label:"Upload Document",Icon:Upload,       color:"bg-[#FFF1F2] text-[#BE123C]",onClick:()=>{}},
                {label:"View Insurance", Icon:Shield,       color:"bg-[#F0FDF4] text-[#16A34A]",onClick:()=>onNav("insurance")},
              ].map(({label,Icon,color,onClick})=>(
                <button key={label} onClick={onClick} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl text-xs font-semibold transition-colors hover:opacity-90 cursor-pointer",color)}>
                  <Icon className="w-5 h-5" />{label}
                </button>
              ))}
            </div>
          </Card>

          {/* Health Overview (sample data) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">Health Overview</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Sample / patient-entered data — not medical advice</p>
              </div>
              <button onClick={()=>onNav("health-dashboard")} className="flex items-center gap-1 text-xs text-[#1D4ED8] font-semibold hover:underline cursor-pointer">
                Health Dashboard <ProBadge className="ml-1" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                {label:"Blood Pressure",value:"128/84",unit:"mmHg",Icon:Activity,c:"text-[#DC2626]",bg:"bg-[#FEF2F2]",trend:"up"},
                {label:"Heart Rate",   value:"72",   unit:"bpm",  Icon:HeartPulse,c:"text-[#1D4ED8]",bg:"bg-[#EFF6FF]",trend:"stable"},
                {label:"Weight",       value:"74",   unit:"kg",   Icon:Target,    c:"text-[#0D9488]",bg:"bg-[#F0FDFA]",trend:"down"},
                {label:"Blood Glucose",value:"98",   unit:"mg/dL",Icon:Droplets,  c:"text-[#D97706]",bg:"bg-[#FFFBEB]",trend:"stable"},
              ].map(({label,value,unit,Icon,c,bg,trend})=>(
                <div key={label} className={cn("p-3.5 rounded-xl border border-[#E2E8F0]",bg)}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("w-4 h-4",c)} />
                    <span className="text-[10px] text-[#94A3B8]">sample</span>
                  </div>
                  <p className="text-xl font-bold text-[#0F172A]">{value}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{unit}</p>
                  <p className="text-[10px] font-semibold mt-1.5 text-[#6B7280]">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right col (1/3) */}
        <div className="space-y-5">
          {/* Recent Activity */}
          <Card>
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                {icon:CalendarCheck,label:"Appointment Booked",sub:"Dr. Priya Sharma · 18 Aug",color:"bg-[#EFF6FF] text-[#1D4ED8]",time:"Today"},
                {icon:FlaskConical, label:"Lab Report Ready",  sub:"Lipid Profile available", color:"bg-[#FFFBEB] text-[#D97706]",time:"28 Jul"},
                {icon:ClipboardList,label:"Prescription Added", sub:"3 medicines by Dr. Kiran",color:"bg-[#F0FDFA] text-[#0D9488]",time:"28 Jul"},
                {icon:Shield,       label:"Insurance Verified",sub:"Star Health active",       color:"bg-[#F0FDF4] text-[#16A34A]",time:"01 Apr"},
              ].map(({icon:Icon,label,sub,color,time})=>(
                <div key={label} className="flex gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#374151] leading-tight">{label}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{sub}</p>
                  </div>
                  <p className="text-[10px] text-[#CBD5E1] font-mono flex-shrink-0">{time}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Health Tasks */}
          <Card>
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Health Tasks</h2>
            <div className="space-y-2.5">
              {[
                {label:"Review consent settings",  done:false,action:"consent"},
                {label:"Upload past medical history",done:false,action:"records"},
                {label:"Complete insurance profile",done:true, action:"insurance"},
                {label:"Verify mobile number",      done:true, action:"settings"},
              ].map(({label,done,action})=>(
                <div key={label} className={cn("flex items-center gap-3 p-2.5 rounded-lg transition-colors",done?"opacity-50":"hover:bg-[#F8FAFC] cursor-pointer")} onClick={()=>!done&&onNav(action)}>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",done?"bg-[#16A34A] border-[#16A34A]":"border-[#D1D5DB]")}>
                    {done&&<Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn("text-xs flex-1",done?"line-through text-[#94A3B8]":"text-[#374151] font-medium")}>{label}</span>
                  {!done&&<ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Premium upsell */}
          <div className="p-4 bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border border-[#FDE68A] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-[#D97706]" />
              <p className="text-sm font-bold text-[#92400E]">Healthcare Platform PRO</p>
            </div>
            <p className="text-xs text-[#92400E] leading-relaxed">Unlock full EMR access, advanced health analytics, personalized diet & fitness plans.</p>
            <button onClick={()=>onNav("premium")} className="mt-3 w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
              Upgrade to PRO
            </button>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      <Modal isOpen={cancelModal} onClose={()=>setCancelModal(false)} title="Cancel Appointment"
        footer={<><Button variant="outline" onClick={()=>setCancelModal(false)}>Keep Appointment</Button><Button variant="danger" onClick={()=>setCancelModal(false)}>Yes, Cancel</Button></>}>
        <div className="space-y-4">
          <Alert variant="warning">Cancelling within 24 hours of your appointment may not be eligible for a refund.</Alert>
          {upcomingAppt&&(
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <p className="text-sm font-bold text-[#374151]">{upcomingAppt.doctor}</p>
              <p className="text-xs text-[#94A3B8]">{upcomingAppt.specialty} · {upcomingAppt.date} · {upcomingAppt.time}</p>
            </div>
          )}
          <Input label="Reason for Cancellation (optional)" placeholder="e.g. Schedule conflict, feeling better..." />
        </div>
      </Modal>
    </div>
  );
};

// Inline Clock2 since we need it
const Clock2: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════
// FIND A DOCTOR
// ═══════════════════════════════════════════════════════════════════

const DoctorCard: React.FC<{doctor:typeof DOCTORS[0];onView:()=>void;onBook:()=>void}> = ({doctor,onView,onBook}) => (
  <Card hover className="flex flex-col gap-0">
    <div className="flex gap-4 p-5">
      <Avatar name={doctor.name} size="xl" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0F172A]">{doctor.name}</h3>
              {doctor.verified&&<BadgeCheck className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />}
            </div>
            <p className="text-xs text-[#0D9488] font-semibold mt-0.5">{doctor.specialty}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-[#0F172A]">₹{doctor.fee}</p>
            <p className="text-[10px] text-[#94A3B8]">per consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-[#64748B] flex-wrap">
          <span>{doctor.exp} yrs exp</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{doctor.hospital}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.location}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={doctor.rating} />
          <span className="text-xs font-semibold text-[#374151]">{doctor.rating}</span>
          <span className="text-xs text-[#94A3B8]">({doctor.reviews} reviews)</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {doctor.lang.map(l=><span key={l} className="text-[10px] bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full">{l}</span>)}
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between px-5 pb-5">
      <div>
        <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-widest">Next Available</p>
        <p className="text-sm font-bold text-[#1D4ED8] mt-0.5">{doctor.next}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onView} leftIcon={<Eye className="w-3.5 h-3.5" />}>Profile</Button>
        <Button variant="primary" size="sm" onClick={onBook} leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>Book</Button>
      </div>
    </div>
  </Card>
);

const FindDoctor: React.FC<{onViewDoctor:(d:typeof DOCTORS[0])=>void;onBook:(d:typeof DOCTORS[0])=>void}> = ({onViewDoctor,onBook}) => {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filtered = DOCTORS.filter(d =>
    (!search||d.name.toLowerCase().includes(search.toLowerCase())||d.specialty.toLowerCase().includes(search.toLowerCase())) &&
    (!specialty||d.specialty===specialty)
  );
  const specialties = [...new Set(DOCTORS.map(d=>d.specialty))];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">Find a Doctor</h1>
        <p className="text-sm text-[#64748B] mt-1">Search from our network of verified healthcare professionals.</p>
      </div>
      {/* Search bar */}
      <div className="flex gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search doctor, specialty or condition..." className="flex-1" large />
        <Button variant="outline" leftIcon={<SlidersHorizontal className="w-4 h-4" />} onClick={()=>setShowFilters(!showFilters)}>Filters</Button>
      </div>
      {/* Filters */}
      {showFilters&&(
        <Card padding="sm">
          <div className="grid grid-cols-5 gap-3">
            <Select label="Specialty" value={specialty} onChange={e=>setSpecialty((e.target as HTMLSelectElement).value)}>
              <option value="">All Specialties</option>
              {specialties.map(s=><option key={s}>{s}</option>)}
            </Select>
            <Select label="Location"><option>All Locations</option><option>Bengaluru</option><option>Mumbai</option><option>Hyderabad</option></Select>
            <Select label="Gender"><option>Any Gender</option><option>Male</option><option>Female</option></Select>
            <Select label="Experience"><option>Any</option><option>0-5 years</option><option>5-10 years</option><option>10+ years</option></Select>
            <Select label="Consultation Type"><option>Any</option><option>In-person</option></Select>
          </div>
        </Card>
      )}
      {/* Specialty quick filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All","Cardiologist","General Physician","Dermatologist","Orthopaedic Surgeon","Gynaecologist","Neurologist"].map(s=>(
          <button key={s} onClick={()=>setSpecialty(s==="All"?"":s)}
            className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
              (s==="All"&&!specialty)||(specialty===s)?"bg-[#1D4ED8] text-white border-[#1D4ED8]":"bg-white text-[#374151] border-[#E2E8F0] hover:border-[#1D4ED8] hover:text-[#1D4ED8]")}>
            {s}
          </button>
        ))}
      </div>
      <p className="text-xs text-[#94A3B8]">{filtered.length} doctor{filtered.length!==1?"s":""} found</p>
      <div className="space-y-4">
        {filtered.map(d=><DoctorCard key={d.id} doctor={d} onView={()=>onViewDoctor(d)} onBook={()=>onBook(d)} />)}
        {filtered.length===0&&(
          <Card className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-4"><Stethoscope className="w-7 h-7 text-[#94A3B8]" /></div>
            <p className="text-sm font-semibold text-[#374151]">No doctors found</p>
            <p className="text-xs text-[#94A3B8] mt-1">Try adjusting your search or filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DOCTOR PROFILE
// ═══════════════════════════════════════════════════════════════════

const DoctorProfile: React.FC<{doctor:typeof DOCTORS[0];onBack:()=>void;onBook:()=>void}> = ({doctor,onBack,onBook}) => {
  const [activeTab, setActiveTab] = useState("about");
  const [selectedDate, setSelectedDate] = useState("");
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#374151] cursor-pointer"><ChevronLeft className="w-4 h-4" />Back to Search</button>
      {/* Profile header */}
      <Card padding="lg">
        <div className="flex items-start gap-6">
          <Avatar name={doctor.name} size="2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-[#0F172A]">{doctor.name}</h1>
                  {doctor.verified&&(
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" />Verified Provider
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-[#0D9488] mt-0.5">{doctor.specialty}</p>
                <p className="text-sm text-[#64748B] mt-1">{doctor.hospital} · {doctor.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={doctor.rating} size="md" />
                  <span className="text-sm font-bold text-[#374151]">{doctor.rating}</span>
                  <span className="text-sm text-[#94A3B8]">({doctor.reviews} reviews)</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-[#0F172A]">₹{doctor.fee}</p>
                <p className="text-xs text-[#94A3B8]">per consultation</p>
                <Button variant="primary" size="lg" className="mt-3" leftIcon={<CalendarCheck className="w-4 h-4" />} onClick={onBook}>Book Appointment</Button>
              </div>
            </div>
            <div className="flex gap-4 mt-4 text-sm text-[#64748B] flex-wrap">
              <span className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4 text-[#94A3B8]" />{doctor.exp} years experience</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-[#94A3B8]" />{doctor.lang.join(", ")}</span>
            </div>
          </div>
        </div>
      </Card>
      {/* Tabs */}
      <Card padding="none">
        <Tabs items={[{id:"about",label:"About"},{id:"slots",label:"Available Slots"},{id:"reviews",label:"Reviews"}]} active={activeTab} onChange={setActiveTab} className="px-5" />
        <div className="p-5">
          {activeTab==="about"&&(
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-2">About</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{doctor.about}</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-2">Education</h3>
                  <div className="space-y-2">
                    {["MBBS — AIIMS Delhi","MD (Internal Medicine)","Fellowship in Cardiology"].map(e=>(
                      <div key={e} className="flex items-start gap-2 text-sm text-[#64748B]"><Check className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 flex-shrink-0" />{e}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-2">Hospital Affiliations</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-[#64748B]"><Building2 className="w-3.5 h-3.5 text-[#1D4ED8] mt-0.5 flex-shrink-0" />{doctor.hospital}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab==="slots"&&(
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {["Mon 18","Tue 19","Wed 20","Thu 21","Fri 22","Sat 23","Sun 24"].map((d,i)=>(
                  <button key={d} onClick={()=>setSelectedDate(d)}
                    className={cn("flex flex-col items-center py-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors",i===6?"opacity-40 cursor-not-allowed border-[#E2E8F0] text-[#94A3B8]":selectedDate===d?"bg-[#1D4ED8] border-[#1D4ED8] text-white":"border-[#E2E8F0] text-[#374151] hover:border-[#1D4ED8] hover:text-[#1D4ED8]")}>
                    {d.split(" ")[0]}<span className="text-base font-bold mt-0.5">{d.split(" ")[1]}</span>
                  </button>
                ))}
              </div>
              {selectedDate&&(
                <div>
                  <p className="text-xs font-bold text-[#374151] uppercase tracking-widest mb-3">Available Slots — {selectedDate} Aug</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.slots.map(s=>(
                      <button key={s} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#374151] hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:bg-[#EFF6FF] transition-colors cursor-pointer">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="primary" size="lg" fullWidth leftIcon={<CalendarCheck className="w-4 h-4" />} onClick={onBook}>Confirm & Book Appointment</Button>
            </div>
          )}
          {activeTab==="reviews"&&(
            <div className="space-y-4">
              <div className="flex items-center gap-6 p-4 bg-[#F8FAFC] rounded-xl">
                <div className="text-center"><p className="text-4xl font-bold text-[#0F172A]">{doctor.rating}</p><StarRating rating={doctor.rating} size="md" /><p className="text-xs text-[#94A3B8] mt-1">{doctor.reviews} reviews</p></div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(r=>(
                    <div key={r} className="flex items-center gap-2">
                      <span className="text-xs text-[#6B7280] w-2">{r}</span>
                      <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F59E0B] rounded-full" style={{width:`${r===5?72:r===4?18:r===3?6:4}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {[{name:"Rajesh K.",rating:5,date:"15 Jul 2026",text:"Very thorough and explained everything clearly. Highly recommend."},{name:"Priya S.",rating:5,date:"03 Jul 2026",text:"Excellent doctor. Very patient and knowledgeable."}].map(r=>(
                <div key={r.name} className="p-4 border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Avatar name={r.name} size="sm" /><span className="text-sm font-semibold text-[#374151]">{r.name}</span></div><span className="text-xs text-[#94A3B8]">{r.date}</span></div>
                  <StarRating rating={r.rating} />
                  <p className="text-sm text-[#64748B] mt-2">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// FIND A HOSPITAL
// ═══════════════════════════════════════════════════════════════════

const FindHospital: React.FC<{onView:(h:typeof HOSPITALS[0])=>void}> = ({onView}) => {
  const [search, setSearch] = useState("");
  const filtered = HOSPITALS.filter(h=>!search||h.name.toLowerCase().includes(search.toLowerCase())||h.location.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-[#0F172A]">Find a Hospital</h1><p className="text-sm text-[#64748B] mt-1">Discover verified hospitals and healthcare facilities near you.</p></div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search hospital name or location..." large />
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(h=>(
          <Card key={h.id} hover onClick={()=>onView(h)} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-2xl flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-[#1D4ED8]" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#0F172A]">{h.name}</h3>
                  {h.verified&&<BadgeCheck className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />}
                  {h.nabh&&<span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-1.5 py-0.5 rounded-full">NABH</span>}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{h.location}</p>
              </div>
              <StarRating rating={h.rating} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Departments</p>
              <div className="flex flex-wrap gap-1.5">
                {h.depts.slice(0,4).map(d=><span key={d} className="text-[11px] text-[#374151] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{d}</span>)}
                {h.depts.length>4&&<span className="text-[11px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">+{h.depts.length-4}</span>}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#64748B] border-t border-[#F1F5F9] pt-3">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{h.beds} beds</span>
              {h.emergency&&<span className="flex items-center gap-1 text-[#DC2626] font-semibold"><AlertCircle className="w-3.5 h-3.5" />24/7 Emergency</span>}
              <Button variant="outline" size="sm" onClick={e=>{e.stopPropagation();onView(h);}}>View Hospital</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// APPOINTMENT BOOKING FLOW
// ═══════════════════════════════════════════════════════════════════

const BookAppointment: React.FC<{initialDoctor?:typeof DOCTORS[0];onBack:()=>void;onConfirm:()=>void}> = ({initialDoctor,onBack,onConfirm}) => {
  const [step, setStep] = useState(initialDoctor?2:1);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0]|null>(initialDoctor||null);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const STEPS = ["Select Doctor","Select Hospital","Select Date","Select Time","Details","Payment","Confirmation"];

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,1500));
    setLoading(false);
    setConfirmed(true);
  };

  if (confirmed) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 bg-[#F0FDF4] rounded-3xl flex items-center justify-center mb-6"><CheckCircle className="w-12 h-12 text-[#16A34A]" /></div>
      <Badge variant="success" className="mb-4 text-sm px-4 py-2">Appointment Confirmed</Badge>
      <h1 className="text-2xl font-bold text-[#0F172A]">Appointment Booked!</h1>
      <p className="text-[#94A3B8] mt-2 text-sm max-w-sm">Your appointment has been confirmed. You'll receive a reminder before your appointment.</p>
      <div className="mt-6 p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm w-full max-w-md text-left">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[{l:"Doctor",v:selectedDoctor?.name||"Dr. Priya Sharma"},{l:"Specialty",v:selectedDoctor?.specialty||"Cardiology"},{l:"Hospital",v:selectedHospital||"CityCare Multispeciality"},{l:"Date",v:selectedDate||"18 Aug 2026"},{l:"Time",v:selectedTime||"10:30 AM"},{l:"Appointment ID",v:"APT-CCH-9912"},{l:"Payment",v:"₹"+(selectedDoctor?.fee||800)+" · Pending"}].map(({l,v})=>(
            <div key={l}><p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{l}</p><p className="text-sm font-semibold text-[#374151] mt-0.5">{v}</p></div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <Button variant="outline" leftIcon={<CalendarCheck className="w-4 h-4" />}>Add to Calendar</Button>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Download Confirmation</Button>
        <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onBack}>View Appointments</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
        <div><h1 className="text-xl font-bold text-[#0F172A]">Book an Appointment</h1><p className="text-sm text-[#64748B] mt-0.5">Step {step} of {STEPS.length} — {STEPS[step-1]}</p></div>
      </div>
      {/* Stepper */}
      <Card padding="sm">
        <div className="flex items-center justify-between overflow-x-auto">
          {STEPS.map((s,i)=>(
            <React.Fragment key={s}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",step>i+1?"bg-[#16A34A] text-white":step===i+1?"bg-[#1D4ED8] text-white":"bg-[#F1F5F9] text-[#94A3B8]")}>
                  {step>i+1?<Check className="w-3.5 h-3.5" />:i+1}
                </div>
                <span className={cn("text-xs font-semibold hidden xl:block whitespace-nowrap",step===i+1?"text-[#1D4ED8]":step>i+1?"text-[#16A34A]":"text-[#94A3B8]")}>{s}</span>
              </div>
              {i<STEPS.length-1&&<div className={cn("flex-1 h-px mx-1",step>i+1?"bg-[#16A34A]":"bg-[#E2E8F0]")} />}
            </React.Fragment>
          ))}
        </div>
      </Card>
      {/* Step Content */}
      <Card>
        {step===1&&(
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Select a Doctor</h3>
            <SearchInput value="" onChange={()=>{}} placeholder="Search doctor or specialty..." />
            <div className="space-y-3">
              {DOCTORS.slice(0,4).map(d=>(
                <div key={d.id} onClick={()=>{setSelectedDoctor(d);setStep(2);}} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",selectedDoctor?.id===d.id?"border-[#1D4ED8] bg-[#EFF6FF]":"border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#FAFBFF]")}>
                  <Avatar name={d.name} size="md" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#374151]">{d.name}</p><p className="text-xs text-[#94A3B8]">{d.specialty} · {d.hospital}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-[#374151]">₹{d.fee}</p><StarRating rating={d.rating} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step===2&&(
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Select Hospital</h3>
            {selectedDoctor&&<Alert variant="info">Selecting hospital for {selectedDoctor.name} ({selectedDoctor.specialty})</Alert>}
            <div className="space-y-3">
              {HOSPITALS.slice(0,3).map(h=>(
                <div key={h.id} onClick={()=>{setSelectedHospital(h.name);setStep(3);}} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",selectedHospital===h.name?"border-[#1D4ED8] bg-[#EFF6FF]":"border-[#E2E8F0] hover:border-[#BFDBFE]")}>
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-[#1D4ED8]" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#374151]">{h.name}</p><p className="text-xs text-[#94A3B8] flex items-center gap-1"><MapPin className="w-3 h-3" />{h.location}</p></div>
                  {h.nabh&&<Badge variant="success">NABH</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}
        {step===3&&(
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Select Date</h3>
            <div className="grid grid-cols-7 gap-2">
              {["Mon 18","Tue 19","Wed 20","Thu 21","Fri 22","Sat 23","Sun 24"].map((d,i)=>(
                <button key={d} onClick={()=>i<6&&setSelectedDate(d)}
                  className={cn("flex flex-col items-center py-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors",i===6?"opacity-40 cursor-not-allowed border-[#E2E8F0] text-[#94A3B8]":selectedDate===d?"bg-[#1D4ED8] border-[#1D4ED8] text-white":"border-[#E2E8F0] text-[#374151] hover:border-[#1D4ED8] hover:text-[#1D4ED8]")}>
                  {d.split(" ")[0]}<span className="text-lg font-bold mt-0.5">{d.split(" ")[1]}</span><span className="text-[9px] mt-0.5">{i===6?"Closed":"Aug"}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step===4&&(
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Select Time — {selectedDate} Aug 2026</h3>
            <div className="flex flex-wrap gap-2">
              {(selectedDoctor?.slots||["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","03:00 PM","03:30 PM"]).map(s=>(
                <button key={s} onClick={()=>setSelectedTime(s)}
                  className={cn("px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer",selectedTime===s?"bg-[#1D4ED8] border-[#1D4ED8] text-white":"border-[#E2E8F0] text-[#374151] hover:border-[#1D4ED8] hover:text-[#1D4ED8]")}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {step===5&&(
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Appointment Details</h3>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#94A3B8]">Doctor</span><span className="font-semibold text-[#374151]">{selectedDoctor?.name}</span></div>
              <div className="flex justify-between"><span className="text-[#94A3B8]">Hospital</span><span className="font-semibold text-[#374151]">{selectedHospital}</span></div>
              <div className="flex justify-between"><span className="text-[#94A3B8]">Date & Time</span><span className="font-semibold text-[#374151]">{selectedDate} Aug · {selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-[#94A3B8]">Type</span><span className="font-semibold text-[#374151]">In-person Consultation</span></div>
            </div>
            <Select label="Reason for Visit"><option>Select reason</option><option>General Consultation</option><option>Follow-up</option><option>Second Opinion</option><option>Specific Concern</option></Select>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#374151] uppercase tracking-widest">Describe your symptoms (optional)</label>
              <textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Briefly describe what brings you in..."
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:border-[#1D4ED8] placeholder:text-[#9CA3AF] resize-none" />
            </div>
          </div>
        )}
        {step===6&&(
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Payment</h3>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
              <div><p className="text-sm font-semibold text-[#374151]">Consultation Fee</p><p className="text-xs text-[#94A3B8]">{selectedDoctor?.name}</p></div>
              <p className="text-lg font-bold text-[#0F172A]">₹{selectedDoctor?.fee||800}</p>
            </div>
            <Alert variant="info">Payment will be collected at the hospital at the time of your appointment.</Alert>
            <div className="grid grid-cols-2 gap-3">
              {[{label:"Pay at Hospital",icon:Building2,sub:"Pay at counter",selected:true},{label:"Insurance Claim",icon:Shield,sub:"If applicable",selected:false}].map(opt=>(
                <div key={opt.label} className={cn("flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors",opt.selected?"border-[#1D4ED8] bg-[#EFF6FF]":"border-[#E2E8F0] opacity-50 cursor-not-allowed")}>
                  <opt.icon className={cn("w-5 h-5",opt.selected?"text-[#1D4ED8]":"text-[#94A3B8]")} />
                  <div><p className="text-sm font-semibold text-[#374151]">{opt.label}</p><p className="text-[11px] text-[#94A3B8]">{opt.sub}</p></div>
                  {opt.selected&&<Check className="w-4 h-4 text-[#1D4ED8] ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={()=>step===1?onBack():setStep(s=>s-1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>{step===1?"Cancel":"Back"}</Button>
        <Button variant="primary" loading={loading}
          onClick={()=>step===STEPS.length?handleConfirm():setStep(s=>s+1)}
          rightIcon={step<STEPS.length?<ChevronRight className="w-4 h-4" />:<CheckCircle className="w-4 h-4" />}>
          {step===STEPS.length?"Confirm Appointment":`Continue to ${STEPS[step]||"Review"}`}
        </Button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// APPOINTMENTS VIEW
// ═══════════════════════════════════════════════════════════════════

const PatientAppointments: React.FC<{onBook:()=>void}> = ({onBook}) => {
  const [tab, setTab] = useState("upcoming");
  const [cancelModal, setCancelModal] = useState<string|null>(null);
  const filtered = MY_APPOINTMENTS.filter(a=>{
    if(tab==="upcoming")return a.status==="upcoming";
    if(tab==="completed")return a.status==="completed";
    return a.status==="cancelled";
  });
  const STATUS_V: Record<string,BadgeVariant> = {upcoming:"default",completed:"success",cancelled:"neutral"};
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div><h1 className="text-xl font-bold text-[#0F172A]">My Appointments</h1><p className="text-sm text-[#64748B] mt-1">Manage your upcoming, completed and past appointments.</p></div>
        <Button variant="primary" size="sm" leftIcon={<CalendarCheck className="w-3.5 h-3.5" />} onClick={onBook}>Book New</Button>
      </div>
      <Card padding="none">
        <Tabs items={[{id:"upcoming",label:"Upcoming",count:MY_APPOINTMENTS.filter(a=>a.status==="upcoming").length},{id:"completed",label:"Completed",count:MY_APPOINTMENTS.filter(a=>a.status==="completed").length},{id:"cancelled",label:"Cancelled",count:MY_APPOINTMENTS.filter(a=>a.status==="cancelled").length}]} active={tab} onChange={setTab} className="px-5" />
        <div className="p-5 space-y-3">
          {filtered.map(a=>(
            <div key={a.id} className="flex items-start gap-4 p-4 border border-[#E2E8F0] rounded-xl hover:border-[#BFDBFE] hover:bg-[#FAFBFF] transition-colors">
              <Avatar name={a.doctor} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{a.doctor}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{a.specialty} · {a.hospital}</p>
                  </div>
                  <Badge variant={STATUS_V[a.status]||"neutral"}>{a.status.charAt(0).toUpperCase()+a.status.slice(1)}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5 text-[#94A3B8]" />{a.date}</span>
                  <span className="flex items-center gap-1"><Clock2 className="w-3.5 h-3.5 text-[#94A3B8]" />{a.time}</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />{a.type}</span>
                </div>
                {a.status==="upcoming"&&(
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Reschedule</Button>
                    <Button size="sm" variant="ghost" className="text-[#DC2626]" onClick={()=>setCancelModal(a.id)}>Cancel</Button>
                  </div>
                )}
                {a.status==="completed"&&<Button size="sm" variant="outline" className="mt-3">View Summary</Button>}
              </div>
            </div>
          ))}
          {filtered.length===0&&(
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-4"><CalendarX className="w-7 h-7 text-[#94A3B8]" /></div>
              <p className="text-sm font-semibold text-[#374151]">No {tab} appointments</p>
              {tab==="upcoming"&&<Button variant="primary" size="sm" className="mt-4" onClick={onBook} leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>Book an Appointment</Button>}
            </div>
          )}
        </div>
      </Card>
      <Modal isOpen={!!cancelModal} onClose={()=>setCancelModal(null)} title="Cancel Appointment"
        footer={<><Button variant="outline" onClick={()=>setCancelModal(null)}>Keep Appointment</Button><Button variant="danger" onClick={()=>setCancelModal(null)}>Confirm Cancellation</Button></>}>
        <div className="space-y-4">
          <Alert variant="warning">Are you sure you want to cancel this appointment? This action cannot be undone.</Alert>
          <Select label="Reason for Cancellation"><option value="">Select reason</option><option>Schedule conflict</option><option>Feeling better</option><option>Doctor unavailable</option><option>Other</option></Select>
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MEDICAL RECORDS
// ═══════════════════════════════════════════════════════════════════

const MedicalRecords: React.FC = () => {
  const [tab, setTab] = useState("visits");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">Medical Records</h1>
        <p className="text-sm text-[#64748B] mt-1">Your complete health history — securely stored and accessible only by you.</p>
      </div>
      <Alert variant="info"><span className="font-semibold">Privacy Protected:</span> Your medical information is shared only according to your consent settings and platform permissions.</Alert>
      <Card padding="none">
        <Tabs items={[{id:"visits",label:"Visits"},{id:"diagnoses",label:"Diagnoses"},{id:"prescriptions",label:"Prescriptions"},{id:"lab",label:"Lab Reports"},{id:"radiology",label:"Radiology"},{id:"documents",label:"Documents"}]} active={tab} onChange={setTab} className="px-5" />
        <div className="p-5">
          {tab==="visits"&&(
            <div className="space-y-3">
              {[{date:"28 Jul 2026",doctor:"Dr. Kiran Rao",hospital:"Apollo Hospitals",type:"OPD Consultation",diagnosis:"Dyslipidaemia, Hypothyroidism"},{date:"15 Jun 2026",doctor:"Dr. Anjali Kapoor",hospital:"Fortis Healthcare",type:"OPD Consultation",diagnosis:"Atopic Dermatitis"}].map((r,i)=>(
                <div key={i} className="flex items-start gap-4 p-4 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0"><Stethoscope className="w-5 h-5 text-[#1D4ED8]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#374151]">{r.type}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{r.doctor} · {r.hospital}</p>
                    <p className="text-xs text-[#94A3B8] mt-1">{r.date} · Diagnosis: {r.diagnosis}</p>
                  </div>
                  <div className="flex gap-2"><Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>View</Button><Button size="sm" variant="ghost" leftIcon={<Download className="w-3.5 h-3.5" />}>Download</Button></div>
                </div>
              ))}
            </div>
          )}
          {tab!=="visits"&&(
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-4"><FileText className="w-7 h-7 text-[#94A3B8]" /></div>
              <p className="text-sm font-semibold text-[#374151]">No {tab} records yet</p>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-xs">Records will appear here once your healthcare providers share them through the platform.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PRESCRIPTIONS
// ═══════════════════════════════════════════════════════════════════

const Prescriptions: React.FC = () => (
  <div className="space-y-5">
    <div><h1 className="text-xl font-bold text-[#0F172A]">Prescriptions</h1><p className="text-sm text-[#64748B] mt-1">Your medication history and active prescriptions.</p></div>
    {PRESCRIPTIONS_DATA.map(rx=>(
      <Card key={rx.id}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0FDFA] rounded-xl flex items-center justify-center"><ClipboardList className="w-5 h-5 text-[#0D9488]" /></div>
            <div><p className="text-sm font-bold text-[#374151]">Prescription · {rx.date}</p><p className="text-xs text-[#94A3B8]">{rx.doctor} · {rx.hospital}</p></div>
          </div>
          <div className="flex gap-2"><Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>View</Button><Button size="sm" variant="ghost" leftIcon={<Download className="w-3.5 h-3.5" />}>Download</Button></div>
        </div>
        <div className="space-y-2">
          {rx.meds.map((m,i)=>(
            <div key={i} className="grid grid-cols-4 gap-3 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm">
              <div><p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Medicine</p><p className="font-semibold text-[#374151] mt-0.5">{m.name}</p></div>
              <div><p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Dose</p><p className="font-medium text-[#374151] mt-0.5">{m.dose}</p></div>
              <div><p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Frequency</p><p className="font-medium text-[#374151] mt-0.5">{m.freq}</p></div>
              <div><p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Duration</p><p className="font-medium text-[#374151] mt-0.5">{m.dur}</p></div>
              {m.notes&&<p className="col-span-4 text-xs text-[#64748B] italic">Note: {m.notes}</p>}
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// LAB REPORTS
// ═══════════════════════════════════════════════════════════════════

const LabReports: React.FC = () => {
  const STATUS_V: Record<string,BadgeVariant> = {ready:"success",processing:"info",ordered:"neutral",reviewed:"default"};
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-[#0F172A]">Lab Reports</h1><p className="text-sm text-[#64748B] mt-1">View and download your laboratory investigation reports.</p></div>
      {LAB_REPORTS.filter(r=>r.status==="ready").length>0&&<Alert variant="success"><span className="font-semibold">{LAB_REPORTS.filter(r=>r.status==="ready").length} reports ready</span> — Your recent test results are available for review.</Alert>}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {["Test Name","Laboratory","Ordered By","Date","Status","Actions"].map(h=>(
                  <th key={h} className="text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest py-3 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {LAB_REPORTS.map(r=>(
                <tr key={r.id} className="hover:bg-[#FAFBFF] transition-colors">
                  <td className="py-3 px-5"><p className="text-sm font-semibold text-[#374151]">{r.test}</p></td>
                  <td className="py-3 px-5 text-sm text-[#64748B]">{r.lab}</td>
                  <td className="py-3 px-5 text-sm text-[#64748B]">{r.orderedBy}</td>
                  <td className="py-3 px-5 text-sm text-[#64748B]">{r.date}</td>
                  <td className="py-3 px-5"><Badge variant={STATUS_V[r.status]||"neutral"}>{r.status.charAt(0).toUpperCase()+r.status.slice(1)}</Badge></td>
                  <td className="py-3 px-5">
                    {r.status==="ready"&&<div className="flex gap-2"><Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>View</Button><Button size="sm" variant="ghost" leftIcon={<Download className="w-3.5 h-3.5" />}>Download</Button></div>}
                    {r.status!=="ready"&&<span className="text-xs text-[#94A3B8]">Not available yet</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// RADIOLOGY
// ═══════════════════════════════════════════════════════════════════

const Radiology: React.FC = () => (
  <div className="space-y-5">
    <div><h1 className="text-xl font-bold text-[#0F172A]">Radiology Reports</h1><p className="text-sm text-[#64748B] mt-1">View radiology and imaging study reports.</p></div>
    <Alert variant="info">Actual imaging files (DICOM/X-Ray images) are not available for direct download in this portal. Please contact your facility for image access.</Alert>
    <div className="space-y-3">
      {RADIOLOGY_REPORTS.map(r=>(
        <Card key={r.id} className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F5F3FF] rounded-xl flex items-center justify-center flex-shrink-0"><FileImage className="w-6 h-6 text-[#7C3AED]" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#374151]">{r.study}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{r.facility} · {r.orderedBy}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{r.date}</p>
          </div>
          <Badge variant="success">Ready</Badge>
          <div className="flex gap-2"><Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>View Report</Button><Button size="sm" variant="ghost" leftIcon={<Download className="w-3.5 h-3.5" />}>Download</Button></div>
        </Card>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// INSURANCE
// ═══════════════════════════════════════════════════════════════════

const Insurance: React.FC = () => (
  <div className="space-y-5">
    <div className="flex items-start justify-between">
      <div><h1 className="text-xl font-bold text-[#0F172A]">Insurance</h1><p className="text-sm text-[#64748B] mt-1">Manage your health insurance policies and claims.</p></div>
      <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Insurance</Button>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[{l:"Active Policies",v:1,Icon:Shield,c:"text-[#16A34A]",b:"bg-[#F0FDF4]"},{l:"Expiring Soon",v:0,Icon:AlertTriangle,c:"text-[#D97706]",b:"bg-[#FFFBEB]"},{l:"Claims Filed",v:0,Icon:FileText,c:"text-[#1D4ED8]",b:"bg-[#EFF6FF]"}].map(({l,v,Icon,c,b})=>(
        <Card key={l}><div className="flex items-center gap-3"><div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",b)}><Icon className={cn("w-5 h-5",c)} /></div><div><p className="text-xl font-bold text-[#0F172A]">{v}</p><p className="text-xs text-[#94A3B8]">{l}</p></div></div></Card>
      ))}
    </div>
    {INSURANCE_DATA.map(ins=>(
      <Card key={ins.id}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center"><Shield className="w-6 h-6 text-[#16A34A]" /></div>
            <div><p className="text-base font-bold text-[#0F172A]">{ins.provider}</p><p className="text-xs text-[#16A34A] font-semibold">Active</p></div>
          </div>
          <div className="flex gap-2"><Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>View</Button><Button size="sm" variant="ghost" leftIcon={<Edit className="w-3.5 h-3.5" />}>Edit</Button></div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          {[{l:"Policy Number",v:ins.policyNo},{l:"Plan Type",v:ins.type},{l:"Sum Insured",v:ins.sumInsured},{l:"Annual Premium",v:ins.premium},{l:"Valid From",v:ins.validFrom},{l:"Valid Until",v:ins.validUntil},{l:"Member ID",v:ins.memberId}].map(({l,v})=>(
            <div key={l}><p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{l}</p><p className="text-sm font-semibold text-[#374151] mt-0.5">{v}</p></div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════

const Payments: React.FC = () => {
  const STATUS_V: Record<string,BadgeVariant> = {paid:"success",pending:"warning",failed:"error",refunded:"info"};
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-[#0F172A]">Payments</h1><p className="text-sm text-[#64748B] mt-1">Your payment history, pending dues and receipts.</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[{l:"Total Paid",v:"₹2,600",Icon:CheckCircle,c:"text-[#16A34A]",b:"bg-[#F0FDF4]"},{l:"Pending",v:"₹800",Icon:AlertCircle,c:"text-[#D97706]",b:"bg-[#FFFBEB]"},{l:"Total Transactions",v:PAYMENTS_DATA.length,Icon:CreditCard,c:"text-[#1D4ED8]",b:"bg-[#EFF6FF]"}].map(({l,v,Icon,c,b})=>(
          <Card key={l}><div className="flex items-center gap-3"><div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",b)}><Icon className={cn("w-5 h-5",c)} /></div><div><p className="text-xl font-bold text-[#0F172A]">{v}</p><p className="text-xs text-[#94A3B8]">{l}</p></div></div></Card>
        ))}
      </div>
      <Card padding="none">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9]"><h2 className="text-sm font-bold text-[#0F172A]">Transaction History</h2></div>
        <table className="w-full">
          <thead><tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">{["Date","Provider","Service","Amount","Status","Receipt"].map(h=><th key={h} className="text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest py-3 px-5">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {PAYMENTS_DATA.map(p=>(
              <tr key={p.id} className="hover:bg-[#FAFBFF] transition-colors">
                <td className="py-3 px-5 text-sm text-[#374151]">{p.date}</td>
                <td className="py-3 px-5 text-sm font-semibold text-[#374151]">{p.provider}</td>
                <td className="py-3 px-5 text-sm text-[#64748B]">{p.service}</td>
                <td className="py-3 px-5 text-sm font-bold text-[#0F172A]">{p.amount}</td>
                <td className="py-3 px-5"><Badge variant={STATUS_V[p.status]||"neutral"}>{p.status.charAt(0).toUpperCase()+p.status.slice(1)}</Badge></td>
                <td className="py-3 px-5">{p.receipt?<Button size="sm" variant="ghost" leftIcon={<Download className="w-3.5 h-3.5" />}>Receipt</Button>:<span className="text-xs text-[#94A3B8]">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PREMIUM SCREEN
// ═══════════════════════════════════════════════════════════════════

const PremiumScreen: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Crown className="w-10 h-10 text-white" /></div>
      <h1 className="text-3xl font-bold text-[#0F172A]">Healthcare Platform PRO</h1>
      <p className="text-[#64748B] mt-2 max-w-md mx-auto">Unlock your complete health journey with AI-powered insights, advanced analytics and personalised care plans.</p>
    </div>
    <div className="grid grid-cols-3 gap-5">
      {[
        {title:"Free",price:"₹0",period:"Forever",badge:"Current Plan",badgeV:"neutral" as BadgeVariant,features:["Book appointments","View prescriptions","Access lab reports","Basic profile","Standard support"],cta:"Current Plan",disabled:true},
        {title:"PRO",price:"₹499",period:"per month",badge:"Most Popular",badgeV:"premium" as BadgeVariant,features:["Everything in Free","Full medical record access","Advanced health dashboard","Personalised health plans","Personalised diet plans","Personalised exercise plans","AI health insights","Priority support","Unlimited document storage"],cta:"Upgrade to PRO",disabled:false,highlight:true},
        {title:"PRO Annual",price:"₹4,499",period:"per year (₹375/mo)",badge:"Best Value",badgeV:"success" as BadgeVariant,features:["Everything in PRO","2 months free","Early access to new features","Dedicated health coach","Family plan add-on available"],cta:"Get Annual PRO",disabled:false},
      ].map(plan=>(
        <Card key={plan.title} className={cn("flex flex-col",plan.highlight&&"border-[#1D4ED8] shadow-lg ring-2 ring-[#1D4ED8] ring-offset-2")}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">{plan.title}</h2>
            <Badge variant={plan.badgeV}>{plan.badge}</Badge>
          </div>
          <div className="mb-5"><span className="text-3xl font-bold text-[#0F172A]">{plan.price}</span><span className="text-sm text-[#94A3B8] ml-1">/ {plan.period}</span></div>
          <ul className="space-y-2 flex-1 mb-6">
            {plan.features.map(f=>(
              <li key={f} className="flex items-start gap-2 text-sm text-[#374151]"><Check className="w-4 h-4 text-[#16A34A] mt-0.5 flex-shrink-0" />{f}</li>
            ))}
          </ul>
          <Button variant={plan.highlight?"primary":"outline"} fullWidth disabled={plan.disabled}>{plan.cta}</Button>
        </Card>
      ))}
    </div>
    <Alert variant="info" className="max-w-xl mx-auto">Healthcare-critical features (appointments, prescriptions, basic records) are always free. PRO unlocks advanced analytics, personalised plans and extended history access.</Alert>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// HEALTH DASHBOARD (PREMIUM)
// ═══════════════════════════════════════════════════════════════════

const HealthDashboard: React.FC<{onUpgrade:()=>void}> = ({onUpgrade}) => (
  <div className="space-y-5">
    <div className="flex items-start justify-between">
      <div><h1 className="text-xl font-bold text-[#0F172A]">Health Dashboard <ProBadge className="ml-2" /></h1><p className="text-sm text-[#64748B] mt-1">Track your health metrics, trends and goals in one place.</p></div>
    </div>
    <div className="relative">
      <div className="grid grid-cols-2 gap-5 opacity-40 pointer-events-none select-none">
        <Card><h3 className="text-sm font-bold text-[#0F172A] mb-4">Blood Pressure Trend (Sample)</h3><div className="h-32 bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] rounded-xl flex items-center justify-center text-[#94A3B8] text-sm">Chart area</div></Card>
        <Card><h3 className="text-sm font-bold text-[#0F172A] mb-4">Heart Rate Trend (Sample)</h3><div className="h-32 bg-gradient-to-r from-[#FFF1F2] to-[#FFE4E6] rounded-xl flex items-center justify-center text-[#94A3B8] text-sm">Chart area</div></Card>
        <Card><h3 className="text-sm font-bold text-[#0F172A] mb-4">Weight Trend (Sample)</h3><div className="h-32 bg-gradient-to-r from-[#F0FDFA] to-[#CCFBF1] rounded-xl flex items-center justify-center text-[#94A3B8] text-sm">Chart area</div></Card>
        <Card><h3 className="text-sm font-bold text-[#0F172A] mb-4">Blood Glucose Trend (Sample)</h3><div className="h-32 bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] rounded-xl flex items-center justify-center text-[#94A3B8] text-sm">Chart area</div></Card>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm border border-[#FDE68A] rounded-2xl p-8 text-center shadow-xl max-w-sm">
          <Crown className="w-12 h-12 text-[#D97706] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">PRO Feature</h3>
          <p className="text-sm text-[#64748B] mt-2 leading-relaxed">Upgrade to Healthcare Platform PRO to unlock your advanced health dashboard with trends, analytics and AI-powered insights.</p>
          <Button variant="primary" className="mt-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] border-0" onClick={onUpgrade} leftIcon={<Crown className="w-4 h-4" />}>Upgrade to PRO</Button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// HEALTH PLANS (PREMIUM)
// ═══════════════════════════════════════════════════════════════════

const HealthPlans: React.FC<{onUpgrade:()=>void}> = ({onUpgrade}) => (
  <div className="space-y-5">
    <div><h1 className="text-xl font-bold text-[#0F172A]">Personalized Plans <ProBadge className="ml-2" /></h1><p className="text-sm text-[#64748B] mt-1">AI-generated health, diet and exercise plans tailored to your health profile.</p></div>
    <div className="grid grid-cols-3 gap-5">
      {[{title:"Health Plan",Icon:HeartPulse,color:"from-[#EFF6FF] to-[#DBEAFE]",iconC:"text-[#1D4ED8]"},{title:"Diet Plan",Icon:Apple,color:"from-[#F0FDF4] to-[#DCFCE7]",iconC:"text-[#16A34A]"},{title:"Exercise Plan",Icon:Dumbbell,color:"from-[#FFFBEB] to-[#FEF3C7]",iconC:"text-[#D97706]"}].map(({title,Icon,color,iconC})=>(
        <div key={title} className={cn("bg-gradient-to-br rounded-2xl p-6 border border-[#E2E8F0]",color)}>
          <Icon className={cn("w-8 h-8 mb-3",iconC)} />
          <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
          <p className="text-xs text-[#64748B] mt-1">Personalized based on your health data, conditions and goals.</p>
          <div className="mt-4 p-3 bg-white/60 rounded-xl text-xs text-[#94A3B8] text-center">PRO feature — upgrade to access</div>
        </div>
      ))}
    </div>
    <Card className="text-center py-8">
      <Crown className="w-10 h-10 text-[#D97706] mx-auto mb-3" />
      <h3 className="text-base font-bold text-[#0F172A]">Unlock Personalized Plans</h3>
      <p className="text-sm text-[#64748B] mt-2 max-w-sm mx-auto">Get AI-powered health, diet and exercise plans tailored specifically to your health conditions and goals.</p>
      <p className="text-xs text-[#94A3B8] mt-2">Plans are based on your medical history and updated as your health evolves. Always consult your doctor before starting any new health plan.</p>
      <Button variant="primary" className="mt-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] border-0" onClick={onUpgrade} leftIcon={<Crown className="w-4 h-4" />}>Upgrade to PRO</Button>
    </Card>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// NOTIFICATIONS VIEW
// ═══════════════════════════════════════════════════════════════════

const NotificationsView: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const cats = ["all","appointments","reports","payments","insurance","platform"];
  const filtered = NOTIFICATIONS_DATA.filter(n=>filter==="all"||n.cat===filter);
  const CAT_ICON: Record<string,React.ComponentType<any>> = {appointments:CalendarCheck,reports:FlaskConical,payments:CreditCard,insurance:Shield,platform:Bell,medical:FileText};
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div><h1 className="text-xl font-bold text-[#0F172A]">Notifications</h1><p className="text-sm text-[#64748B] mt-1">{NOTIFICATIONS_DATA.filter(n=>!n.read).length} unread notifications.</p></div>
        <Button variant="ghost" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />}>Mark all read</Button>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors cursor-pointer",filter===c?"bg-[#1D4ED8] text-white border-[#1D4ED8]":"bg-white text-[#374151] border-[#E2E8F0] hover:border-[#1D4ED8]")}>{c}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(n=>{
          const Icon = CAT_ICON[n.cat]||Bell;
          return (
            <div key={n.id} className={cn("flex gap-4 p-4 rounded-xl border transition-colors",!n.read?"border-[#BFDBFE] bg-[#FAFBFF]":"border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]")}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",n.cat==="appointments"?"bg-[#EFF6FF] text-[#1D4ED8]":n.cat==="reports"?"bg-[#FFFBEB] text-[#D97706]":n.cat==="payments"?"bg-[#F0FDF4] text-[#16A34A]":"bg-[#F1F5F9] text-[#64748B]")}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#374151]">{n.title}</p>
                  {!n.read&&<span className="w-2 h-2 bg-[#1D4ED8] rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-sm text-[#64748B] mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[11px] text-[#94A3B8] mt-1.5 font-mono">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CONSENT & PRIVACY
// ═══════════════════════════════════════════════════════════════════

const ConsentPrivacy: React.FC = () => {
  const [consents, setConsents] = useState({sharing:true,records:true,provider:false,insurance:true,notifications:true,marketing:false});
  const ITEMS = [
    {key:"sharing"   as const,label:"Data Sharing Consent",     desc:"Allow Healthcare Platform to share anonymised health data for platform improvement and research.",updated:"01 Apr 2026"},
    {key:"records"   as const,label:"Medical Record Sharing",   desc:"Allow your treating doctors to view your medical records across linked healthcare providers.",updated:"01 Apr 2026"},
    {key:"provider"  as const,label:"Third-Party Provider Access",desc:"Allow approved third-party health service providers to access your health profile.",updated:"Not set"},
    {key:"insurance" as const,label:"Insurance Data Sharing",   desc:"Allow your insurance provider to access relevant medical records for claims processing.",updated:"01 Apr 2026"},
    {key:"notifications" as const,label:"Health Notifications", desc:"Receive appointment reminders, report availability and health task notifications.",updated:"01 Apr 2026"},
    {key:"marketing" as const,label:"Marketing Preferences",    desc:"Receive promotional offers, health tips and platform updates via email and notifications.",updated:"Not set"},
  ];
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-[#0F172A]">Consent & Privacy</h1><p className="text-sm text-[#64748B] mt-1">Manage how your health data is shared and used.</p></div>
      <Alert variant="info"><span className="font-semibold">Your Privacy Matters:</span> You can change your consent settings at any time. Changes take effect immediately.</Alert>
      <div className="space-y-3">
        {ITEMS.map(item=>(
          <Card key={item.key} className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-5 h-5 text-[#64748B]" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#374151]">{item.label}</p>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{item.desc}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-1.5">Last updated: {item.updated}</p>
                </div>
                <div className="flex-shrink-0">
                  <button onClick={()=>setConsents(c=>({...c,[item.key]:!c[item.key]}))}
                    className={cn("relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer",consents[item.key]?"bg-[#1D4ED8]":"bg-[#CBD5E1]")}>
                    <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",consents[item.key]&&"translate-x-5")} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PATIENT PROFILE
// ═══════════════════════════════════════════════════════════════════

const PatientProfile: React.FC = () => {
  const [tab, setTab] = useState("personal");
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div><h1 className="text-xl font-bold text-[#0F172A]">My Profile</h1><p className="text-sm text-[#64748B] mt-1">Manage your personal and healthcare information.</p></div>
        <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>Edit Profile</Button>
      </div>
      {/* Profile card */}
      <Card className="flex items-center gap-6 py-6 px-6">
        <Avatar name={PATIENT.name} size="2xl" />
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">{PATIENT.name}</h2>
          <p className="text-sm text-[#64748B] mt-0.5">{PATIENT.age} years · {PATIENT.gender} · {PATIENT.blood}</p>
          <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{PATIENT.phid}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{PATIENT.mobile}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{PATIENT.city}, {PATIENT.state}</span>
          </div>
        </div>
      </Card>
      <Card padding="none">
        <Tabs items={[{id:"personal",label:"Personal Info"},{id:"healthcare",label:"Healthcare"},{id:"emergency",label:"Emergency Contact"},{id:"preferences",label:"Preferences"},{id:"privacy",label:"Privacy"}]} active={tab} onChange={setTab} className="px-5" />
        <div className="p-6">
          {tab==="personal"&&(
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {[{l:"Full Name",v:PATIENT.name},{l:"Date of Birth",v:PATIENT.dob},{l:"Age",v:`${PATIENT.age} years`},{l:"Gender",v:PATIENT.gender},{l:"Blood Group",v:PATIENT.blood},{l:"Mobile",v:PATIENT.mobile},{l:"Email",v:PATIENT.email},{l:"City",v:PATIENT.city},{l:"State",v:PATIENT.state}].map(({l,v})=>(
                <div key={l}><p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{l}</p><p className="text-sm font-semibold text-[#374151] mt-1">{v}</p></div>
              ))}
            </div>
          )}
          {tab!=="personal"&&(
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-3"><User className="w-6 h-6 text-[#94A3B8]" /></div>
              <p className="text-sm font-semibold text-[#374151]">{tab.charAt(0).toUpperCase()+tab.slice(1)} Information</p>
              <p className="text-xs text-[#94A3B8] mt-1">Click Edit Profile to update this section.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

const PatientSettings: React.FC<{onNav:(id:string)=>void}> = ({onNav}) => {
  const sections = [
    {title:"Account",items:[{label:"Personal Information",Icon:User,action:"profile"},{label:"Security & Password",Icon:Lock,action:""},{label:"Two-Factor Authentication",Icon:Smartphone,action:""}]},
    {title:"Notifications",items:[{label:"Notification Preferences",Icon:Bell,action:""},{label:"Email Settings",Icon:FileText,action:""},{label:"SMS Settings",Icon:Smartphone,action:""}]},
    {title:"Privacy & Consent",items:[{label:"Consent & Privacy Settings",Icon:ShieldCheck,action:"consent"},{label:"Data Export",Icon:Download,action:""},{label:"Delete Account",Icon:AlertCircle,action:"",danger:true}]},
    {title:"Preferences",items:[{label:"Language",Icon:Languages,action:""},{label:"Accessibility",Icon:Globe,action:""}]},
  ];
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-[#0F172A]">Settings</h1><p className="text-sm text-[#64748B] mt-1">Manage your account preferences, security and privacy settings.</p></div>
      {sections.map(sec=>(
        <Card key={sec.title} padding="none">
          <div className="px-5 py-3 border-b border-[#F1F5F9]"><p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">{sec.title}</p></div>
          <div className="divide-y divide-[#F8FAFC]">
            {sec.items.map(item=>(
              <button key={item.label} onClick={()=>item.action&&onNav(item.action)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors text-left cursor-pointer">
                <item.Icon className={cn("w-4 h-4 flex-shrink-0",item.danger?"text-[#DC2626]":"text-[#64748B]")} />
                <span className={cn("text-sm font-medium flex-1",item.danger?"text-[#DC2626]":"text-[#374151]")}>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>
            ))}
          </div>
        </Card>
      ))}
      <Card className="flex items-center gap-3 hover:bg-[#FEF2F2] transition-colors cursor-pointer border-[#FECACA]">
        <div className="w-9 h-9 bg-[#FEF2F2] rounded-xl flex items-center justify-center"><ChevronLeft className="w-4 h-4 text-[#DC2626]" /></div>
        <span className="text-sm font-semibold text-[#DC2626]">Sign Out</span>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [bookingDoctor, setBookingDoctor] = useState<typeof DOCTORS[0]|undefined>(undefined);
  const [viewDoctor, setViewDoctor] = useState<typeof DOCTORS[0]|null>(null);
  const [viewHospital, setViewHospital] = useState<typeof HOSPITALS[0]|null>(null);

  const goTo = (id:string) => { setActiveNav(id); setViewDoctor(null); setViewHospital(null); };

  const handleBook = (d?:typeof DOCTORS[0]) => { setBookingDoctor(d); setActiveNav("book-appointment"); };

  const renderMain = () => {
    if (activeNav==="book-appointment") return <BookAppointment initialDoctor={bookingDoctor} onBack={()=>goTo("appointments")} onConfirm={()=>goTo("appointments")} />;
    if (viewDoctor&&activeNav==="doctor-profile") return <DoctorProfile doctor={viewDoctor} onBack={()=>goTo("find-doctor")} onBook={()=>handleBook(viewDoctor)} />;
    if (viewHospital&&activeNav==="hospital-profile") return (
      <div className="space-y-5">
        <button onClick={()=>goTo("find-hospital")} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#374151] cursor-pointer"><ChevronLeft className="w-4 h-4" />Back to Hospitals</button>
        <Card padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center flex-shrink-0"><Building2 className="w-8 h-8 text-[#1D4ED8]" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#0F172A]">{viewHospital.name}</h1>
                {viewHospital.verified&&<BadgeCheck className="w-5 h-5 text-[#1D4ED8]" />}
                {viewHospital.nabh&&<Badge variant="success">NABH Accredited</Badge>}
              </div>
              <p className="text-sm text-[#64748B] mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" />{viewHospital.location}</p>
              <div className="flex items-center gap-2 mt-2"><StarRating rating={viewHospital.rating} size="md" /><span className="text-sm font-bold text-[#374151]">{viewHospital.rating}</span></div>
              <div className="flex gap-2 mt-4"><Button variant="primary" leftIcon={<Stethoscope className="w-4 h-4" />} onClick={()=>goTo("find-doctor")}>Find Doctors</Button><Button variant="outline" leftIcon={<CalendarCheck className="w-4 h-4" />} onClick={()=>handleBook()}>Book Appointment</Button></div>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-5">
          <Card><h3 className="text-sm font-bold text-[#0F172A] mb-3">Departments</h3><div className="flex flex-wrap gap-2">{viewHospital.depts.map(d=><Badge key={d} variant="neutral">{d}</Badge>)}</div></Card>
          <Card><h3 className="text-sm font-bold text-[#0F172A] mb-3">Insurance Accepted</h3><div className="flex flex-wrap gap-2">{viewHospital.insurance.map(i=><Badge key={i} variant="success">{i}</Badge>)}</div></Card>
          <Card><h3 className="text-sm font-bold text-[#0F172A] mb-2">Emergency</h3><p className="text-sm text-[#DC2626] font-semibold flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />24/7 Emergency Services Available</p></Card>
          <Card><h3 className="text-sm font-bold text-[#0F172A] mb-2">Contact</h3><p className="text-sm text-[#374151] flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#94A3B8]" />{viewHospital.contact}</p></Card>
        </div>
      </div>
    );
    switch (activeNav) {
      case "dashboard":        return <PatientDashboard onNav={goTo} onBookAppt={()=>handleBook()} />;
      case "find-doctor":      return <FindDoctor onViewDoctor={d=>{setViewDoctor(d);setActiveNav("doctor-profile");}} onBook={handleBook} />;
      case "find-hospital":    return <FindHospital onView={h=>{setViewHospital(h);setActiveNav("hospital-profile");}} />;
      case "appointments":     return <PatientAppointments onBook={()=>handleBook()} />;
      case "records":          return <MedicalRecords />;
      case "prescriptions":    return <Prescriptions />;
      case "lab-reports":      return <LabReports />;
      case "radiology":        return <Radiology />;
      case "health-dashboard": return <HealthDashboard onUpgrade={()=>goTo("premium")} />;
      case "health-plans":     return <HealthPlans onUpgrade={()=>goTo("premium")} />;
      case "insurance":        return <Insurance />;
      case "payments":         return <Payments />;
      case "premium":          return <PremiumScreen />;
      case "notifications":    return <NotificationsView />;
      case "consent":          return <ConsentPrivacy />;
      case "settings":         return <PatientSettings onNav={goTo} />;
      case "profile":          return <PatientProfile />;
      default:                 return <PatientDashboard onNav={goTo} onBookAppt={()=>handleBook()} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <PatientSidebar activeNav={activeNav} onNavChange={goTo} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <PatientHeader activeNav={activeNav} onNavChange={goTo} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full max-w-[1200px]">{renderMain()}</div>
        </main>
      </div>
    </div>
  );
}
