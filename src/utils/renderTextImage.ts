// slot-tools の src/utils/renderTextImage.ts と同じもの

export interface RenderTextImageOptions {
  fontSize?: number;
  maxTextWidth?: number;
  padding?: number;
  minHeight?: number;
}

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_MAX_TEXT_WIDTH = 600;
const DEFAULT_PADDING = 24;
const DEFAULT_MIN_HEIGHT = 80;
const FONT_FAMILY = "'Noto Sans JP', 'Yu Gothic', sans-serif";

function wrapLine(context: CanvasRenderingContext2D, line: string, maxWidth: number): string[] {
  if (line.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const char of line) {
    const next = `${current}${char}`;
    if (current.length > 0 && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = char;
      continue;
    }
    current = next;
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

/** テキストを白背景の PNG 画像にする */
export async function renderTextImage(text: string, options: RenderTextImageOptions = {}): Promise<Blob> {
  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;
  const maxTextWidth = options.maxTextWidth ?? DEFAULT_MAX_TEXT_WIDTH;
  const padding = options.padding ?? DEFAULT_PADDING;
  const minHeight = options.minHeight ?? DEFAULT_MIN_HEIGHT;
  const lineHeight = Math.round(fontSize * 1.6);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("画像生成に失敗しました。");
  }

  context.font = `400 ${fontSize}px ${FONT_FAMILY}`;

  const sourceLines = text.split(/\r?\n/);
  const wrappedLines = sourceLines.flatMap((line) => wrapLine(context, line, maxTextWidth));
  const printableLines = wrappedLines.length > 0 ? wrappedLines : [""];
  const widestLineWidth = printableLines.reduce(
    (max, line) => Math.max(max, context.measureText(line).width),
    0,
  );

  const width = Math.ceil(Math.max(240, widestLineWidth + padding * 2));
  const height = Math.ceil(Math.max(minHeight, printableLines.length * lineHeight + padding * 2));
  const devicePixelRatio = Math.min(3, Math.max(1, window.devicePixelRatio || 1));

  canvas.width = Math.ceil(width * devicePixelRatio);
  canvas.height = Math.ceil(height * devicePixelRatio);

  const drawingContext = canvas.getContext("2d");
  if (!drawingContext) {
    throw new Error("画像生成に失敗しました。");
  }

  drawingContext.scale(devicePixelRatio, devicePixelRatio);
  drawingContext.fillStyle = "#ffffff";
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.fillStyle = "#111827";
  drawingContext.font = `400 ${fontSize}px ${FONT_FAMILY}`;
  drawingContext.textBaseline = "top";

  printableLines.forEach((line, index) => {
    drawingContext.fillText(line, padding, padding + index * lineHeight);
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
  });
  if (!blob) {
    throw new Error("画像生成に失敗しました。");
  }
  return blob;
}
