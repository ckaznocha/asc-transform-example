# `asc` Transform Example

This repo is an an example of an AssemblyScript compiler transform. It's goal
is to successfully and a field to an interface and a class implementing that
interface such that the field can be read at runtime.

## Setup

checkout the repo and install the dependencies:

```bash
git clone https://github.com/ckaznocha/asc-transform-example.git
cd asc-transform-example
npm i
```

## Running the Example

```bash
npm run test
```

### Expected Output

```bash
> asc-transform-example@1.0.0 test
> npm run asbuild:debug && node tests


> asc-transform-example@1.0.0 asbuild:debug
> npm run build-transform && asc assembly/index.ts --target debug --transform ./build/transform.mjs


> asc-transform-example@1.0.0 build-transform
> tsc -p transform

interface 'AdderIface' instance member: 'add'
interface 'AdderIface' instance member: 'foo'
class 'Adder' instance member: 'add'
class 'Adder' instance member: 'foo'
added field 'foo': 'bar'
ok
```

### Actual Output

```bash
> asc-transform-example@1.0.0 test
> npm run asbuild:debug && node tests


> asc-transform-example@1.0.0 asbuild:debug
> npm run build-transform && asc assembly/index.ts --target debug --transform ./build/transform.mjs


> asc-transform-example@1.0.0 build-transform
> tsc -p transform

interface 'AdderIface' instance member: 'add'
interface 'AdderIface' instance member: 'foo'
class 'Adder' instance member: 'add'
class 'Adder' instance member: 'foo'
wasm://wasm/8f32392e:1


RuntimeError: unreachable
    at assembly/index/AdderIface#get:foo (wasm://wasm/8f32392e:wasm-function[53]:0x1070)
    at assembly/index/do_add (wasm://wasm/8f32392e:wasm-function[70]:0x12fd)
    at assembly/index/add (wasm://wasm/8f32392e:wasm-function[71]:0x1360)
    at file:///{...}/asc-transform-example/tests/index.js:3:20

Node.js v22.4.0
```
