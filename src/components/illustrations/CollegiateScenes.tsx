"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PillTag } from "@/components/ui/PillTag";

/**
 * 1. CAFE DISCUSSION ILLUSTRATION (Left Group in Reference)
 * Two students enjoying coffee, donut, and friendly conversation.
 */
export function CafeDiscussionIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto max-w-[320px] select-none", className)}
    >
      {/* Hanging lights */}
      <path d="M70 0v50M70 50l-12 18h24L70 50z" stroke="#1A1D20" strokeWidth="2" fill="#FFF7F6" />
      <path d="M210 0v35M210 35l-10 15h20L210 35z" stroke="#1A1D20" strokeWidth="2" fill="#FFF7F6" />

      {/* Bistro Table */}
      <ellipse cx="140" cy="180" rx="35" ry="12" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2.5" />
      <path d="M140 192v50M125 242l15-6 15 6" stroke="#1A1D20" strokeWidth="2.5" strokeLinecap="round" />

      {/* Coffee cup on table */}
      <rect x="150" y="165" width="16" height="12" rx="3" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <path d="M166 168c3 0 5 2 5 4s-2 4-5 4" stroke="#1A1D20" strokeWidth="1.5" />
      {/* Steam */}
      <path d="M154 160c-1-3 1-5 0-7M160 161c-1-3 1-5 0-7" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Plant vase */}
      <path d="M125 174h8l-2 8h-4z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="1.5" />
      <path d="M129 174c-4-8-10-6-10-6s2 8 8 6M129 172c4-8 10-6 10-6s-2 8-8 6M129 168v-8" stroke="#1A1D20" strokeWidth="1.5" fill="#1A1D20" />

      {/* Left Male Student */}
      {/* Chair */}
      <path d="M50 160v60M75 160v60M42 220h40M45 160h32l-6-40H52z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Pants */}
      <path d="M60 170c-4 15-8 35-12 55l20 5c6-20 12-40 14-60z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      <path d="M72 170c2 20 8 38 18 52l18-12c-12-14-16-28-18-40z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      {/* Shoes */}
      <path d="M44 225c-5 3-10 8-10 12h22c-2-6-6-10-12-12z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <path d="M106 210c4 4 10 7 14 8l-6 12c-8-3-12-8-15-14z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      {/* Torso & Powder Blue Sweater */}
      <path d="M50 125c5-8 18-10 32-6 8 18 10 35 4 52-12 2-24-2-32-8-2-12-3-26-4-38z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Arm holding drink */}
      <path d="M78 128c6 10 16 18 22 25l-8 8c-6-6-14-14-18-24z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2" />
      {/* Cup with straw */}
      <path d="M96 148l4 24h14l4-24z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <path d="M95 156h24" stroke="#F59E0B" strokeWidth="4" />
      <path d="M107 148v-14l6-6" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Head & Hair */}
      <path d="M64 88c0-12 8-20 20-18 8 2 14 10 12 22-2 10-8 16-16 16s-16-8-16-20z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M62 82c-4-4-2-12 6-16 12-6 24-2 26 8 2 8-4 12-8 12-4 0-6-6-12-6s-10 4-12 2z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="78" cy="92" r="1.5" fill="#1A1D20" />
      <path d="M84 96c-2 2-5 2-7 0" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right Female Student */}
      {/* Chair */}
      <path d="M225 155v65M250 155v65M220 220h38M225 155h30l-4-35h-22z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Legs & Powder Blue Pants */}
      <path d="M192 188c-12 18-20 34-26 50l18 4c6-14 14-28 24-42z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2" />
      <path d="M196 182c-8 16-10 32-10 48l16 2c2-14 6-28 12-40z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2" />
      {/* Shoes */}
      <path d="M162 238c-4 3-8 7-8 10h18c-1-4-5-8-10-10z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <path d="M184 232c-3 3-6 7-6 10h16c-1-4-4-8-10-10z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      {/* Torso & Black Top */}
      <path d="M204 128c8-6 22-6 30 2 2 18 0 36-6 50-10 2-20-2-26-8-2-14 0-28 2-44z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Arm holding donut */}
      <path d="M210 134c-6 10-12 18-18 22l6 8c8-6 14-14 18-24z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      {/* Donut */}
      <ellipse cx="190" cy="138" rx="10" ry="10" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="190" cy="138" r="4" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="1.5" />
      <circle cx="186" cy="134" r="1" fill="#F59E0B" />
      <circle cx="194" cy="134" r="1" fill="#F59E0B" />
      <circle cx="192" cy="142" r="1" fill="#F59E0B" />
      {/* Head & amber Hair with Glasses */}
      <path d="M214 90c0-12 8-20 20-18 8 2 14 10 12 22-2 10-8 16-16 16s-16-8-16-20z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M210 82c-4 12-2 26 0 36 6 2 12-2 14-6 2-10 0-20-4-30-2-6-6-8-10 0z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      <path d="M216 76c8-8 24-8 28 2 4 10 2 26-2 36-4 4-8 4-10 0 2-8 2-16 0-24-4-6-10-8-16-14z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      {/* Glasses */}
      <circle cx="222" cy="92" r="5" stroke="#1A1D20" strokeWidth="1.5" fill="none" />
      <circle cx="234" cy="92" r="5" stroke="#1A1D20" strokeWidth="1.5" fill="none" />
      <path d="M227 92h2" stroke="#1A1D20" strokeWidth="1.5" />
      <path d="M225 102c2 2 5 2 7 0" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 2. TEAMWORK LAPTOP ILLUSTRATION (Center Group in Reference)
 * Three students collaborating around laptops and smartphones.
 */
export function TeamworkLaptopIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto max-w-[340px] select-none", className)}
    >
      {/* Soft ground shadow */}
      <ellipse cx="170" cy="245" rx="140" ry="18" fill="#BEE3ED" fillOpacity="0.4" />

      {/* Speech bubbles with dots */}
      <g transform="translate(130, 25)">
        <path d="M0 16a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v4a12 12 0 0 1-12 12h-8l-8 8v-8H12A12 12 0 0 1 0 20z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
        <circle cx="16" cy="16" r="2" fill="#1A1D20" />
        <circle cx="24" cy="16" r="2" fill="#1A1D20" />
        <circle cx="32" cy="16" r="2" fill="#1A1D20" />
      </g>

      <g transform="translate(235, 35)">
        <path d="M0 12a10 10 0 0 1 10-10h16a10 10 0 0 1 10 10v2a10 10 0 0 1-10 10h-4l-6 6v-6H10A10 10 0 0 1 0 14z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.5" fill="#1A1D20" />
        <circle cx="18" cy="12" r="1.5" fill="#1A1D20" />
        <circle cx="24" cy="12" r="1.5" fill="#1A1D20" />
      </g>

      {/* 1. Left Student (amber Shirt, Phone in Hand) */}
      {/* Black Pants */}
      <path d="M125 150c-6 24-16 52-28 78l22 8c14-26 22-54 26-80z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      <path d="M110 234c-6 4-12 8-12 12h24c-1-5-6-9-12-12z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      {/* Torso & amber Shirt */}
      <path d="M115 105c10-6 24-4 32 4 4 16 2 32-4 46-12 2-24-2-30-8-2-12 0-28 2-42z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Arm with Smartphone */}
      <path d="M136 118c4 10 8 18 12 24l-6 6c-6-6-10-14-12-22z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <rect x="144" y="132" width="12" height="20" rx="3" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="1.8" />
      {/* Head & Hair */}
      <path d="M124 68c0-10 8-18 18-16 8 2 12 10 10 20-2 10-8 14-14 14s-14-8-14-18z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M122 62c-2-4 0-10 6-12 10-4 20-2 22 6 2 8-2 10-6 10-4 0-6-4-12-4s-8 2-10 0z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="136" cy="72" r="1.5" fill="#1A1D20" />
      <path d="M138 78c-2 2-4 2-6 0" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" />

      {/* 2. Center Student (Powder Blue Shirt, Working on Laptop) */}
      {/* Black Pants */}
      <path d="M170 155c-2 26-4 54-6 80l22 2c4-26 6-54 8-80z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      <path d="M192 155c4 24 10 50 16 76l20-6c-8-24-14-48-18-72z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Shoes */}
      <path d="M162 236c-4 3-8 6-8 10h20c-1-4-5-8-12-10z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <path d="M224 226c-2 4-4 8-4 12h20c-1-5-6-9-16-12z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      {/* Torso & Powder Blue Top */}
      <path d="M162 100c8-6 24-6 32 2 4 18 2 34-4 52-12 2-24 0-30-6-2-16 0-32 2-48z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Arms on Laptop */}
      <path d="M164 116c10 12 22 20 34 22l-4 8c-14-2-26-12-36-24z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2" />
      {/* amber Laptop */}
      <path d="M174 138l28-2 6 18-34 2z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      <path d="M168 156l38-2 4 4-38 2z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="1.5" />
      {/* Head & Hair */}
      <path d="M168 62c0-10 8-18 18-16 8 2 12 10 10 20-2 10-8 14-14 14s-14-8-14-18z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M166 56c-2-4 0-10 6-12 10-4 20-2 22 6 2 8-2 10-6 10-4 0-6-4-12-4s-8 2-10 0z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="178" cy="66" r="1.5" fill="#1A1D20" />
      <path d="M180 72c-2 2-4 2-6 0" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" />

      {/* 3. Right Female Student (Leaning in, Explaining) */}
      {/* Black Pants */}
      <path d="M228 140c4 24 10 52 16 78l20-4c-6-26-12-52-16-76z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      <path d="M242 140c8 22 18 46 28 68l18-8c-12-20-22-44-30-66z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Shoes */}
      <path d="M242 218c-3 3-6 7-6 10h18c-1-4-5-8-12-10z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <path d="M284 204c-3 3-6 7-6 10h18c-1-4-5-8-12-10z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      {/* Torso & White/Powder Top */}
      <path d="M220 88c8-6 22-6 30 2 2 18 0 34-4 48-10 2-20 0-26-6-4-14-2-30 0-44z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Arm Pointing at Laptop */}
      <path d="M224 104c-12 12-24 20-36 24l-2-6c10-4 22-12 32-22z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="184" cy="126" r="2.5" fill="#F59E0B" />
      {/* Head & amber Hair */}
      <path d="M226 50c0-10 8-18 18-16 8 2 12 10 10 20-2 10-8 14-14 14s-14-8-14-18z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M222 44c-2 10 0 22 2 30 4 2 10-2 12-6 2-8 0-16-4-24-2-4-6-6-10 0z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      <path d="M228 38c8-6 20-6 24 2 4 8 2 20-2 28-4 4-6 4-8 0 2-6 2-12 0-18-4-4-8-6-14-12z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="236" cy="54" r="1.5" fill="#1A1D20" />
      <path d="M238 60c-2 2-4 2-6 0" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 3. COUNSELING & GUIDANCE ILLUSTRATION (Right Group in Reference)
 * Students discussing with laptop, calculator, and advisory callouts.
 */
export function CounselingGuidanceIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto max-w-[340px] select-none", className)}
    >
      {/* Floating Accents */}
      {/* Calculator */}
      <rect x="180" y="24" width="16" height="22" rx="2" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="1.8" />
      <rect x="183" y="27" width="10" height="4" fill="#BEE3ED" />
      <circle cx="185" cy="35" r="1" fill="#1A1D20" />
      <circle cx="188" cy="35" r="1" fill="#1A1D20" />
      <circle cx="191" cy="35" r="1" fill="#1A1D20" />
      <circle cx="185" cy="39" r="1" fill="#1A1D20" />
      <circle cx="188" cy="39" r="1" fill="#1A1D20" />
      <circle cx="191" cy="39" r="1" fill="#1A1D20" />

      {/* Exclamation badge */}
      <circle cx="245" cy="38" r="8" fill="#F59E0B" stroke="#1A1D20" strokeWidth="1.5" />
      <path d="M245 34v4M245 41v1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

      {/* Ruler/Triangle */}
      <path d="M255 58l18 12-16 4z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="1.5" />

      {/* Speech bubbles */}
      <g transform="translate(130, 48)">
        <path d="M0 12a10 10 0 0 1 10-10h16a10 10 0 0 1 10 10v2a10 10 0 0 1-10 10h-4l-6 6v-6H10A10 10 0 0 1 0 14z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.5" fill="#1A1D20" />
        <circle cx="18" cy="12" r="1.5" fill="#1A1D20" />
        <circle cx="24" cy="12" r="1.5" fill="#1A1D20" />
      </g>

      {/* 1. Left Student (Chin in Hand, Thinking) */}
      <path d="M96 150c-4 24-10 50-18 74l20 6c8-22 14-48 18-72z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      <path d="M82 226c-4 3-8 6-8 10h20c-1-4-5-8-12-10z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      {/* Torso & Powder Blue Sweater */}
      <path d="M92 108c8-6 22-6 30 2 2 16 0 32-4 46-10 2-20 0-26-6-2-14 0-28 0-42z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Arm to Chin */}
      <path d="M102 126c2-8 6-16 10-22l6 4c-4 8-8 16-10 24z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      {/* amber Laptop on Lap */}
      <path d="M110 142l26-10 4 14-28 8z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      {/* Head & Hair */}
      <path d="M104 68c0-10 8-18 18-16 8 2 12 10 10 20-2 10-8 14-14 14s-14-8-14-18z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M102 62c-2-4 0-10 6-12 10-4 20-2 22 6 2 8-2 10-6 10-4 0-6-4-12-4s-8 2-10 0z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="116" cy="72" r="1.5" fill="#1A1D20" />
      <path d="M118 78c-2 2-4 2-6 0" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" />

      {/* 2. Top Right Student (Glasses, Explaining with Hands) */}
      <path d="M185 140c6 22 14 46 22 68l18-6c-8-22-16-44-22-66z" fill="#BEE3ED" stroke="#1A1D20" strokeWidth="2.5" />
      <path d="M222 204c-3 3-6 7-6 10h18c-1-4-5-8-12-10z" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      {/* Black Top */}
      <path d="M180 92c8-6 22-6 30 2 2 16 0 32-4 46-10 2-20 0-26-6-2-14 0-28 0-42z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Open Laptop on lap */}
      <path d="M174 122l28-6 4 14-30 6z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      {/* Waving Hands */}
      <path d="M172 106c-8-6-14-14-16-22l6-4c4 6 8 12 14 18z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      {/* Head with Round Glasses & amber Hair */}
      <path d="M188 54c0-10 8-18 18-16 8 2 12 10 10 20-2 10-8 14-14 14s-14-8-14-18z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M184 48c-2 8 0 18 2 26 4 2 8-2 10-4 2-6 0-14-2-20-2-4-6-6-10-2z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      <path d="M190 42c6-6 18-6 22 2 4 6 2 16-2 24-4 2-6 2-8 0 2-6 2-10 0-14-4-4-8-6-12-12z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="196" cy="58" r="4.5" stroke="#1A1D20" strokeWidth="1.5" fill="none" />
      <circle cx="207" cy="58" r="4.5" stroke="#1A1D20" strokeWidth="1.5" fill="none" />
      <path d="M200.5 58h2" stroke="#1A1D20" strokeWidth="1.5" />
      <circle cx="196" cy="58" r="1.2" fill="#1A1D20" />
      <circle cx="207" cy="58" r="1.2" fill="#1A1D20" />

      {/* 3. Bottom Right Student (Pointing at Browser Window) */}
      <path d="M220 180c4 16 8 34 12 50l18-4c-4-16-8-32-12-48z" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Browser card/window in hand */}
      <rect x="180" y="152" width="34" height="24" rx="3" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2" />
      <path d="M180 159h34" stroke="#1A1D20" strokeWidth="1.5" />
      <circle cx="184" cy="155.5" r="1" fill="#F59E0B" />
      <circle cx="188" cy="155.5" r="1" fill="#1A1D20" />
      <rect x="184" y="163" width="12" height="8" rx="1" fill="#F59E0B" />
      <path d="M200 165h10M200 168h8" stroke="#1A1D20" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arm pointing */}
      <path d="M214 174c-8-4-16-8-22-10l2-6c8 2 14 6 22 10z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      {/* Head */}
      <path d="M228 132c0-8 6-14 14-12 6 2 10 8 8 16-2 8-6 12-12 12s-10-6-10-16z" fill="#FFF7F6" stroke="#1A1D20" strokeWidth="2" />
      <path d="M226 126c-2-4 0-8 4-10 8-2 16 0 18 6 2 6-2 8-4 8-4 0-4-4-10-4s-6 2-8 0z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      <circle cx="236" cy="136" r="1.5" fill="#1A1D20" />
    </svg>
  );
}

/**
 * 4. COMPLETE HERO COLLEGIATE BANNER (Matches Uploaded Reference Exactly)
 * Full width panoramic illustrated scene with headline, 3 character groups, floating squiggles, and interactive capsule pill tags.
 */
export function HeroCollegiateBanner({
  title = "Illustration Scene suitable for your project",
  subtitle,
  tags = [
    "College",
    "Discussion",
    "Student",
    "Counseling",
    "Graduation",
    "Teamwork",
    "Laboratorium",
  ],
  activeTag,
  onTagClick,
  className,
}: {
  title?: string;
  subtitle?: string;
  tags?: string[];
  activeTag?: string;
  onTagClick?: (tag: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl bg-[#FFF7F6] dark:bg-[#1A1C22] border border-[#F0E4E2] dark:border-[#2B2C35] p-6 sm:p-8 md:p-10 relative overflow-hidden transition-all shadow-xs",
        className
      )}
    >
      {/* Floating Red Star Accent (from reference) */}
      <div className="absolute top-6 right-1/3 text-[#F59E0B] select-none text-xl sm:text-2xl animate-pulse">
        ✦
      </div>

      {/* Floating Spiral Squiggle (from reference) */}
      <svg
        className="absolute bottom-16 right-28 w-12 h-16 text-[#1A1D20]/60 dark:text-white/40 hidden md:block"
        viewBox="0 0 40 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M20 5c-8 6-12 18-4 26 8 8 18 0 12-10-6-10-18-6-18 6 0 14 14 24 22 28" />
      </svg>

      {/* Floating Smartphone Outline (from reference) */}
      <div className="absolute bottom-12 right-12 hidden lg:block rotate-12 opacity-80">
        <div className="w-9 h-16 rounded-lg border-2 border-[#F59E0B] bg-white/60 dark:bg-black/30 p-1 flex flex-col justify-between">
          <div className="w-3 h-0.5 bg-[#F59E0B] mx-auto rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full border border-[#F59E0B] mx-auto" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Title Header */}
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1A1D20] dark:text-[#F4EBE9] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* 3 Character Groups Panoramic Illustration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-4 items-center justify-items-center py-2 sm:py-4">
          {/* Group 1: Discussion */}
          <div className="w-full flex flex-col items-center">
            <CafeDiscussionIllustration className="max-h-[220px]" />
          </div>

          {/* Group 2: Teamwork Laptop */}
          <div className="w-full flex flex-col items-center">
            <TeamworkLaptopIllustration className="max-h-[220px]" />
          </div>

          {/* Group 3: Counseling & Advising */}
          <div className="w-full flex flex-col items-center">
            <CounselingGuidanceIllustration className="max-h-[220px]" />
          </div>
        </div>

        {/* Bottom Capsule Pill Tags (from reference) */}
        {tags && tags.length > 0 && (
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {tags.map((tag) => (
              <PillTag
                key={tag}
                label={tag}
                active={activeTag === tag}
                onClick={() => onTagClick?.(tag)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 5. RESUME & CAREER ILLUSTRATION
 * Student reviewing ATS resume draft with verified badge and graduation cap.
 */
export function ResumeCareerIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto max-w-[280px] select-none", className)}
    >
      {/* Resume Document Sheet */}
      <rect x="60" y="30" width="130" height="170" rx="8" fill="#FFFFFF" stroke="#1A1D20" strokeWidth="2.5" />
      {/* Header bar */}
      <rect x="74" y="45" width="45" height="8" rx="2" fill="#F59E0B" />
      <rect x="74" y="58" width="80" height="4" rx="1" fill="#BEE3ED" />
      <line x1="74" y1="72" x2="175" y2="72" stroke="#F0E4E2" strokeWidth="1.5" />

      {/* Experience & Skills lines */}
      <rect x="74" y="80" width="30" height="5" rx="1" fill="#1A1D20" />
      <rect x="74" y="90" width="95" height="3" rx="1" fill="#1A1D20" fillOpacity="0.4" />
      <rect x="74" y="96" width="85" height="3" rx="1" fill="#1A1D20" fillOpacity="0.4" />
      <rect x="74" y="102" width="70" height="3" rx="1" fill="#1A1D20" fillOpacity="0.4" />

      <line x1="74" y1="115" x2="175" y2="115" stroke="#F0E4E2" strokeWidth="1.5" />
      <rect x="74" y="122" width="35" height="5" rx="1" fill="#1A1D20" />
      <rect x="74" y="132" width="90" height="3" rx="1" fill="#1A1D20" fillOpacity="0.4" />
      <rect x="74" y="138" width="75" height="3" rx="1" fill="#1A1D20" fillOpacity="0.4" />

      {/* Pill badges on resume */}
      <rect x="74" y="152" width="22" height="8" rx="4" fill="#BEE3ED" />
      <rect x="100" y="152" width="26" height="8" rx="4" fill="#F59E0B" />
      <rect x="130" y="152" width="20" height="8" rx="4" fill="#FAECE9" />

      {/* Graduation Cap */}
      <path d="M185 45l35-12 35 12-35 12z" fill="#1A1D20" stroke="#1A1D20" strokeWidth="2" />
      <path d="M202 54v14c0 6 8 10 18 10s18-4 18-10V54" fill="#F59E0B" stroke="#1A1D20" strokeWidth="2" />
      <path d="M255 45v20" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="255" cy="67" r="2.5" fill="#F59E0B" />

      {/* 100% ATS Verified Stamp */}
      <circle cx="165" cy="175" r="22" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M156 175l6 6 12-12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
