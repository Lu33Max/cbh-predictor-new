export function truncateTimeMonth(str: string): string {
  return str.slice(0, 7)
}

export function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName];
}