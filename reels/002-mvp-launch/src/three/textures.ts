import * as THREE from "three";
import { C, MONO, SANS } from "../theme";

const canvas = (w: number, h: number) => {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d")!;
  return { el, ctx };
};

const toTexture = (el: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(el);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
};

/** Paper base with subtle fibre speckle (deterministic). */
const paper = (ctx: CanvasRenderingContext2D, w: number, h: number, color = C.paper) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  let s = 42;
  for (let i = 0; i < 1600; i++) {
    s = (s * 16807) % 2147483647;
    const x = (s % 1000) / 1000;
    s = (s * 16807) % 2147483647;
    const y = (s % 1000) / 1000;
    ctx.fillStyle = `rgba(90, 80, 60, ${0.03 + (i % 5) * 0.012})`;
    ctx.fillRect(x * w, y * h, 2, 2);
  }
};

const bar = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
};

const header = (ctx: CanvasRenderingContext2D, w: number, title: string, sub: string, accent: string) => {
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, w, 120);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 120, w, 8);
  ctx.fillStyle = C.paper;
  ctx.font = `900 46px "${SANS}"`;
  ctx.fillText(title, 36, 70);
  ctx.font = `500 20px "${MONO}"`;
  ctx.fillStyle = "rgba(243,236,221,0.65)";
  ctx.fillText(sub, 38, 104);
};

export const W = 600;
export const H = 800;

/** A bank statement: dated rows, descriptions and amounts as abstract marks (no fake figures). */
export const bankStatement = () => {
  const { el, ctx } = canvas(W, H);
  paper(ctx, W, H);
  header(ctx, W, "BANK STATEMENT", "ACCOUNT ···· 0421   MONTHLY", C.yellow);
  for (let r = 0; r < 12; r++) {
    const y = 170 + r * 50;
    if (r % 2 === 0) {
      ctx.fillStyle = "rgba(20,32,47,0.05)";
      ctx.fillRect(24, y - 14, W - 48, 44);
    }
    bar(ctx, 40, y, 70, 14, "rgba(20,32,47,0.45)");
    bar(ctx, 140, y, 150 + ((r * 53) % 140), 14, "rgba(20,32,47,0.28)");
    bar(ctx, W - 40 - 90, y, 90, 14, r % 3 === 0 ? "rgba(232,102,79,0.7)" : "rgba(20,32,47,0.55)");
  }
  return toTexture(el);
};

/** Empty journal with debit / credit columns — transaction strips land on it. */
export const journal = () => {
  const { el, ctx } = canvas(W, H);
  paper(ctx, W, H);
  header(ctx, W, "JOURNAL", "DATE · ACCOUNT · DEBIT · CREDIT", C.yellow);
  ctx.strokeStyle = "rgba(20,32,47,0.18)";
  ctx.lineWidth = 2;
  for (let r = 0; r < 12; r++) {
    ctx.beginPath();
    ctx.moveTo(24, 200 + r * 50);
    ctx.lineTo(W - 24, 200 + r * 50);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(232,102,79,0.4)";
  [380, 490].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 140);
    ctx.lineTo(x, H - 30);
    ctx.stroke();
  });
  return toTexture(el);
};

/** One transaction strip (a row lifted off the bank statement). */
export const txnStrip = (i: number) => {
  const { el, ctx } = canvas(W, 80);
  paper(ctx, W, 80, C.white);
  ctx.fillStyle = i % 3 === 0 ? C.coral : C.yellow;
  ctx.fillRect(0, 0, 12, 80);
  bar(ctx, 36, 33, 60, 14, "rgba(20,32,47,0.5)");
  bar(ctx, 120, 33, 140 + ((i * 47) % 100), 14, "rgba(20,32,47,0.3)");
  bar(ctx, i % 2 ? 390 : 500, 33, 70, 14, "rgba(20,32,47,0.6)");
  return toTexture(el);
};

/** Financial statements: sections, subtotal rules and a double-underlined total. */
export const statement = (title: string, accent: string) => {
  const { el, ctx } = canvas(W, H);
  paper(ctx, W, H);
  header(ctx, W, title, "GENERATED AUTOMATICALLY", accent);
  let y = 180;
  for (let section = 0; section < 3; section++) {
    bar(ctx, 40, y, 180, 16, "rgba(20,32,47,0.6)");
    y += 44;
    for (let r = 0; r < 3; r++) {
      bar(ctx, 70, y, 140 + ((section * 3 + r) * 37) % 120, 12, "rgba(20,32,47,0.28)");
      bar(ctx, W - 40 - 80, y, 80, 12, "rgba(20,32,47,0.45)");
      y += 34;
    }
    ctx.fillStyle = "rgba(20,32,47,0.4)";
    ctx.fillRect(W - 140, y - 8, 100, 2);
    y += 24;
  }
  ctx.fillStyle = C.ink;
  ctx.fillRect(W - 160, y + 20, 120, 18);
  ctx.fillRect(W - 160, y + 46, 120, 4);
  ctx.fillRect(W - 160, y + 54, 120, 4);
  return toTexture(el);
};

/** Feature card for the "assumptions backlog" tower. */
export const featureCard = (label: string, i: number) => {
  const { el, ctx } = canvas(640, 160);
  paper(ctx, 640, 160, i % 2 ? C.paper : C.paperShade);
  ctx.strokeStyle = "rgba(20,32,47,0.35)";
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 620, 140);
  ctx.setLineDash([]);
  ctx.fillStyle = C.coral;
  ctx.font = `600 22px "${MONO}"`;
  ctx.fillText("ASSUMED", 34, 52);
  ctx.fillStyle = C.ink;
  ctx.font = `800 50px "${SANS}"`;
  ctx.fillText(label, 34, 116);
  return toTexture(el);
};
