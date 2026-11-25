import { strToU8, zipSync } from "fflate";

const rawFiles = import.meta.glob("./skill/uncommon/**/*", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
export const skillFiles: Record<string, string> = Object.fromEntries(
  Object.entries(rawFiles)
    .map(([path, content]) => [path.replace("./skill/uncommon/", ""), content])
    .sort(([a], [b]) =>
      a === "SKILL.md" ? -1 : b === "SKILL.md" ? 1 : a.localeCompare(b),
    ),
);
export const skillMarkdown = skillFiles["SKILL.md"] ?? "";

export function downloadSkill() {
  const entries = Object.fromEntries(
    Object.entries(skillFiles).map(([name, content]) => [
      `uncommon/${name}`,
      strToU8(content),
    ]),
  );
  const bytes = zipSync(entries, { level: 6 });
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "uncommon.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
