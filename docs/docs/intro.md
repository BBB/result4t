---
id: intro
title: Quick setup guide
tags:
  - Guide
  - First launch
  - Getting started
sidebar_position: 1
---

## Installation

The package is available at `result4t` and `@ollierelph/result4t` install from whichever you see fit using your
preferred too.

## Usage

The most common use case is to wrap unsafe promise calls and make them *safe*

```ts

import {TaskResult} from "result4t";

class ReadFileIssue {
}

type Path = string

const readFile = (path: Path) => TaskResult.fromPromise(() => {
  return fs.readFile(path)
}, (err: unknown) => new ReadFileIssue())

```

Calling readfile will return a `TaskResult<Buffer, ReadFileIssue>`, this is a computation that will give you either a
Buffer, or a ReadFileIssue depending on the state of the disk.

### Execution

In order execute this computation, you will need to call `.run()` on the value.

```ts
const result: Result<Buffer, ReadFileIssue> = await readFile("/tmp/foo.txt").run()
```

or you can call `.runThrowFailure()` to minic the behaviour of a promise - you lose the failure typing though

### The Goal

The goal when building your application should be only to have a single `.run()` at the top of the stack, the rest of your application should happen within a Task chain:


```ts
import {TaskResult} from "result4t";
import fs from "fs/promises";


class ReadFileIssue {
  type = "ReadFileIssue" as const;

  constructor(public path: string) {
  }
}

type Path = string

const readFile = (path: Path) => TaskResult.fromPromise(() => {
  // function that returns a Promise<T> and throws and unknown
  return fs.readFile(path)
}, (err: unknown) => new ReadFileIssue(path))

readFile("/tmp/foo.txt")
  .map((content: Buffer) => content.toString("utf-8"))
  .peek((text: string) => {
    // print the text to the screen
  })
  .peekFailure((reason: ReadFileIssue) => {
    // report the issue
  }).run()
  .catch(err => {
      // undexpected error
  })
```

`map` and `mapFailure` can be used to transform (map from one value to another) the success anf failure cases

`peek` and `peekFailure` can be used for side-effects at the boundary of a program.

`flatMap` and `flatMapFailure` can be used to join 2 `TaskResult` together:

```ts
import {TaskResult} from "result4t";
import fs from "fs/promises";

class MyApplicationIssue {
  constructor(public inner: ReadFileIssue | WriteFileIssue) {
  }
}

class ReadFileIssue {
  type = "ReadFileIssue" as const;

  constructor(public path: string) {
  }
}

class WriteFileIssue {
  type = "WriteFileIssue" as const;


  constructor(public path: string) {
  }
}

type Path = string;

const readFile = (path: Path) =>
  TaskResult.fromPromise(
    () => {
      // function that returns a Promise<T> and throws and unknown
      return fs.readFile(path);
    },
    (err: unknown) => new ReadFileIssue(path),
  );

const writeFile = (path: Path, content: string) =>
  TaskResult.fromPromise(
    () => {
      // function that returns a Promise<T> and throws and unknown
      return fs.writeFile(path, content);
    },
    (err: unknown) => new WriteFileIssue(path),
  );

readFile("/tmp/foo.txt")
  .mapFailure((err) => new MyApplicationIssue(err))
  .map((content: Buffer) => content.toString("utf-8"))

  .flatMap((text: string) =>
    writeFile("/tmp/foo2.txt", text).mapFailure(
      (err) => new MyApplicationIssue(err),
    ),
  )
  .peekFailure((reason) => {
    // report the issue
  })
  .run()
  .catch((err) => {
    // unexpected error
  });

```

### Taking it further

The aim with these `TaskResult.fromPromise` calls is to then describe all the errors you need to handle in your domain with specific types:

```ts
import {TaskResult} from "result4t";
import fs from "fs/promises";

class ReadFileIssue {
  type = "ReadFileIssue" as const;

  constructor(public path: string) {
  }
}
class FileNotFound {
  type = "FileNotFound" as const;

  constructor(public path: string) {
  }
}

const isError = (it: unknown): it is Error => it instanceof Error

const readFile = (path: Path) =>
  TaskResult.fromPromise(
    () => {
      // function that returns a Promise<T> and throws and unknown
      return fs.readFile(path);
    },
    (err: unknown) => isError(err) && err.message.includes("ENOENT: no such file or directory") ? new FileNotFound(path) : new ReadFileIssue(path),
  );
```

Now you can handle those specific cases correctly:

```ts
const result: TaskResult<Buffer, ReadFileIssue> = readFile("/tmp/foo.txt")
.flatMapFailure((err) => {
    if (err instanceof FileNotFound) {
        return TaskResult.success(Buffer.from(""))
    }
    return TaskResult.failure(err)
})
```
