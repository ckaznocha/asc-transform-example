interface AdderIface {
  add(a: i32, b: i32): i32;
}

class Adder implements AdderIface {
  add(a: i32, b: i32): i32 {
    return a + b;
  }
}

function do_add(adder: AdderIface, a: i32, b: i32): i32 {
  // @ts-expect-error: 'foo' does not exist on 'AdderIface' in the source but
  // gets added by the transform at compile time.
  console.log(`added field 'foo': '${adder.foo}'`);

  return adder.add(a, b);
}

export function add(a: i32, b: i32): i32 {
  return do_add(new Adder(), a, b);
}
