<h2 align="center">result4t</h2>

<p align="center">
Available now
</p>

`pnpm add @ollierelph/result4t` or `pnpm add result4t`

## What's this?

`result4t` takes some pointers from the wonderful [result4k](https://github.com/fork-handles/forkhandles/tree/trunk/result4k)

It's a replacement for `Promise` that gives us a stringly-typed error mode.

## An example

```typescript
import fs from "node:fs"

const readFileAndReverse = () => fs.readFile("./boom.txt")
    .then(contents => contents.split('\n').reverse().join('\n'))

readFileAndReverse()
    .then((reversedFile) => {
        console.log(reversedFile)
    })
    .catch((error: unknown) => {
        console.error(error)
    })
```

in `result4t`:

```typescript
import fs from "node:fs"
import {TaskResult} from "./TaskResult";

const readFileAndReverse = () => TaskResult.ofPromise(
    () => fs.readFile("./boom.txt"),
    (err: unknown) => new Error("Unable to find file")
).map(contents => contents.split('\n').reverse().join('\n'))

readFileAndReverse()
    .peek((reversedFile) => {
        console.log(reversedFile)
        process.exit(0)
    })
    .peekLeft((error) => {
        console.error(error)
        process.exit(1)
    })
```
