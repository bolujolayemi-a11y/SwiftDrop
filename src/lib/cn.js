
export function cn(...inputs) {
  const classes = [];

  for (const input of inputs) {
    if (!input) continue;

    // Handle string inputs (e.g., cn("class-a", "class-b"))
    if (typeof input === 'string') {
      classes.push(input);
    }
    // Handle array inputs (e.g., conditional arrays)
    else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    }
    // Handle object inputs (e.g., cn({ 'bg-blue-500': isActive }))
    else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  // Join classes and normalize whitespace
  const rawResult = classes.join(' ').replace(/\s+/g, ' ').trim();
  
  // Deduplicate overlapping primitive class types manually
  return rawResult
    .split(' ')
    .filter((value, index, self) => self.indexOf(value) === index)
    .join(' ');
}