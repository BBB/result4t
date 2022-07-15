import { Either } from "./Either";

type TaskEither<L, R> = () => Promise<Either<L, R>>;

export class Task<L = never, R = never> {
  constructor(private inner: TaskEither<L, R>) {}

  map<R2 = never>(param: (a: R) => R2): Task<L, R2> {
    return new Task(() => this.inner().then((either) => either.map(param)));
  }

  mapLeft<L2 = never>(param: (a: L) => L2): Task<L2, R> {
    return new Task(() => this.inner().then((either) => either.mapLeft(param)));
  }

  run() {
    return this.inner();
  }
}
