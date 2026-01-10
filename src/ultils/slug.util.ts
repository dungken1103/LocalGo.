import slugify from 'slugify';

export function generateSlug(name: string): string {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

  const random = Math.random().toString(36).substring(2, 8);

  return `${baseSlug}-${random}`;
}
