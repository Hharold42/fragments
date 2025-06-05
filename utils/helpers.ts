export function getRandomItem<T>(array: Array<T>) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function createArray(start: number, stop: number, step: number) {
  const result = [];
  for (let i = start; i < stop; i += step) {
    result.push(i);
  }
  return result;
}
