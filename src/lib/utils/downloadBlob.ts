export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  let anchor: HTMLAnchorElement | null = null;

  try {
    anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor?.remove();
    // Revoke after the click task so browser download handlers can consume the object URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
