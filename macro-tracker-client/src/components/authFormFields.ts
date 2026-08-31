export function getFormFieldValue(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement)) {
    throw new Error(`Missing form field: ${name}`);
  }
  return field.value;
}

export function getCheckboxValue(form: HTMLFormElement, name: string): boolean {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement)) {
    return false;
  }
  return field.checked;
}
