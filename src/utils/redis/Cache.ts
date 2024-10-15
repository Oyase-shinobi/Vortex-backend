class Cache {
  private cache: Map<string, string>;

  constructor() {
    this.cache = new Map();
  }

  get = (key: string): string | undefined => {
    return this.cache.get(key);
  };

  set = (key: string, value: string) => {
    this.cache.set(key, value);
  };

  setMax = (key: string, value: string) => {
    const currentValue = this.get(key);
    if (currentValue === undefined) {
      this.set(key, value);
      return;
    }
    this.set(key, Math.max(Number(currentValue), Number(value)).toString());
  };
}

const cache = new Cache();

export default cache;
