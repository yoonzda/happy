export function normalizeDetailItem(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      title: String(raw.title || '').trim(),
      description: String(raw.description || '').trim(),
    };
  }

  const text = String(raw || '').trim();
  if (!text) {
    return { title: '', description: '' };
  }

  const sepIdx = text.indexOf(' - ');
  if (sepIdx > -1) {
    return {
      title: text.slice(0, sepIdx).trim(),
      description: text.slice(sepIdx + 3).trim(),
    };
  }

  return { title: text, description: '' };
}

export function normalizeDetailList(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map(normalizeDetailItem)
    .filter((item) => item.title || item.description);
}

export function normalizeProjectImages(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((raw) => {
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return {
          src: String(raw.src || '').trim(),
          caption: String(raw.caption || '').trim(),
        };
      }
      return {
        src: String(raw || '').trim(),
        caption: '',
      };
    })
    .filter((item) => Boolean(item.src));
}
