(() => {
  const BYSQUARE_VERSION = 0x02; // 1.2.0
  const PAYMENT_ORDER = 0x01;
  const BASE32HEX_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUV";
  const CRC32_TABLE = buildCrc32Table();

  function buildCrc32Table() {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = (value & 1) ? (0xEDB88320 ^ (value >>> 1)) : (value >>> 1);
      }
      table[index] = value >>> 0;
    }
    return table;
  }

  function encodeBase32Hex(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || []);
    const output = [];
    let buffer = 0;
    let bitsLeft = 0;
    for (let index = 0; index < bytes.length; index += 1) {
      buffer = (buffer << 8) | bytes[index];
      bitsLeft += 8;
      while (bitsLeft >= 5) {
        bitsLeft -= 5;
        output.push(BASE32HEX_CHARS[(buffer >> bitsLeft) & 0b11111]);
      }
    }
    if (bitsLeft > 0) {
      output.push(BASE32HEX_CHARS[(buffer << (5 - bitsLeft)) & 0b11111]);
    }
    return output.join("");
  }

  function crc32(bytes) {
    const input = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(String(bytes || ""));
    let crc = 0 ^ (-1);
    for (let index = 0; index < input.length; index += 1) {
      crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ input[index]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function buildBysquareHeader() {
    return new Uint8Array([
      (0x00 << 4) | BYSQUARE_VERSION,
      0x00,
    ]);
  }

  function buildPayloadLength(length) {
    const header = new ArrayBuffer(2);
    new DataView(header).setUint16(0, length, true);
    return new Uint8Array(header);
  }

  function addChecksum(tabbedPayload) {
    const payloadBytes = new TextEncoder().encode(tabbedPayload);
    const checksum = new ArrayBuffer(4);
    new DataView(checksum).setUint32(0, crc32(payloadBytes), true);
    return Uint8Array.from([
      ...new Uint8Array(checksum),
      ...payloadBytes,
    ]);
  }

  function stripDiacritics(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function sanitize(value, options = {}) {
    const text = String(value ?? "")
      .replace(/\t/g, " ")
      .replace(/[\r\n]+/g, " ")
      .trim();
    if (!text) return "";
    const normalized = options.deburr ? stripDiacritics(text) : text;
    return normalized.replace(/\s{2,}/g, " ");
  }

  function serializePayment(model) {
    const payment = model?.payment || {};
    const beneficiary = payment.beneficiary || {};
    return [
      sanitize(model?.invoiceId),
      "1",
      String(PAYMENT_ORDER),
      Number.isFinite(Number(payment.amount)) ? String(Number(payment.amount)) : "",
      sanitize(payment.currencyCode || "EUR"),
      sanitize(payment.paymentDueDate),
      sanitize(payment.variableSymbol),
      sanitize(payment.constantSymbol),
      sanitize(payment.specificSymbol),
      sanitize(payment.originatorsReferenceInformation),
      sanitize(payment.paymentNote, { deburr: true }),
      "1",
      sanitize(payment.iban),
      sanitize(payment.bic),
      "0",
      "0",
      sanitize(beneficiary.name, { deburr: true }),
      sanitize(beneficiary.street, { deburr: true }),
      sanitize(beneficiary.city, { deburr: true }),
    ].join("\t");
  }

  function asUint8Array(value) {
    if (value instanceof Uint8Array) return value;
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    return new Uint8Array(value || []);
  }

  function encodePayment(model) {
    if (!window.LZMA1?.compress) {
      throw new Error("LZMA1 runtime is not available.");
    }
    const tabbedPayload = serializePayment(model);
    const payloadChecked = addChecksum(tabbedPayload);
    const payloadCompressed = asUint8Array(window.LZMA1.compress(payloadChecked));
    const lzmaBody = payloadCompressed.subarray(13);
    const output = new Uint8Array([
      ...buildBysquareHeader(),
      ...buildPayloadLength(payloadChecked.byteLength),
      ...lzmaBody,
    ]);
    return encodeBase32Hex(output);
  }

  window.PayBySquareEncoder = {
    encodePayment,
  };
})();
