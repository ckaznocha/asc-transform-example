# `asc` Transform Example

This repo is an an example of an AssemblyScript compiler transform. Its goal
is to successfully add a field to an interface and a class implementing that
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

### Output

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
