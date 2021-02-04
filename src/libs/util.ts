export function deepCopyArray(arr: Array<any>) {
  const out: Array<any> = [];
  for (let i of arr) {
    if (i && typeof i === "object") {
      if (i instanceof Array) {
        out.push(deepCopyArray(i));
      } else {
        out.push(deepCopy(i));
      }
    } else {
      out.push(i);
    }
  }
  return out;
}

export function deepCopy<T = Object>(obj: Object): T {
  const out = {};
  for (let i in obj) {
    if (obj[i] && typeof obj[i] === "object") {
      if (obj[i] instanceof Array) {
        out[i] = deepCopyArray(obj[i]);
      } else {
        out[i] = deepCopy(obj[i]);
      }
    } else {
      out[i] = obj[i];
    }
  }
  return <T>out;
}

export function matches(a: Object, b: Object): boolean {
  for (let i in b) {
    if (!(i in a)) continue;
    if (typeof b[i] !== typeof a[i]) return false;
    if (b[i] && typeof b[i] === "object") {
      if (!matches(b[i], a[i])) return false;
    }
  }
  return true;
}

export function assign(a: Object, b: Object): void {
  for (let i in b) {
    if (
      i in a &&
      a[i] &&
      typeof a[i] === "object" &&
      b[i] &&
      typeof b[i] === "object"
    ) {
      assign(a[i], b[i]);
    } else {
      a[i] = b[i];
    }
  }
}
