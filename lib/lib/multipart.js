// lib/multipart.js
// A minimal multipart/form-data parser so we don't need `multer`.
// Handles text fields and file uploads. Good enough for a prototype;
// swap for `multer` or `busboy` if you outgrow it.

function parseContentType(header) {
  const parts = header.split(';').map((p) => p.trim());
  const boundaryPart = parts.find((p) => p.startsWith('boundary='));
  if (!boundaryPart) return null;
  return boundaryPart.slice('boundary='.length).replace(/^"|"$/g, '');
}

function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const fields = {};
  const files = {};

  let start = buffer.indexOf(boundaryBuf, 0);
  while (start !== -1) {
    const next = buffer.indexOf(boundaryBuf, start + boundaryBuf.length);
    if (next === -1) break;

    // Slice out this part's raw bytes (between boundaries), trim leading CRLF
    // and trailing CRLF before the next boundary marker.
    let partStart = start + boundaryBuf.length;
    if (buffer.slice(partStart, partStart + 2).toString() === '--') break; // end marker
    if (buffer.slice(partStart, partStart + 2).toString() === '\r\n') partStart += 2;
    let partEnd = next - 2; // strip trailing \r\n before next boundary
    const part = buffer.slice(partStart, partEnd);

    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const rawHeaders = part.slice(0, headerEnd).toString('utf8');
      const body = part.slice(headerEnd + 4);

      const dispositionMatch = rawHeaders.match(/Content-Disposition:\s*form-data;\s*(.*)/i);
      const nameMatch = rawHeaders.match(/name="([^"]+)"/i);
      const filenameMatch = rawHeaders.match(/filename="([^"]*)"/i);
      const typeMatch = rawHeaders.match(/Content-Type:\s*(.+)/i);

      if (nameMatch) {
        const fieldName = nameMatch[1];
        if (filenameMatch && filenameMatch[1] !== '') {
          files[fieldName] = {
            filename: filenameMatch[1],
            contentType: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
            data: body,
          };
        } else if (!filenameMatch) {
          fields[fieldName] = body.toString('utf8');
        }
      }
    }

    start = next;
  }

  return { fields, files };
}

module.exports = { parseContentType, parseMultipart };
