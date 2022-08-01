import { Either } from "./Either";

type TaskEither<L, R> = () => Promise<Either<L, R>>;

export class Task<L = never, R = never> implements PromiseLike<Either<L, R>> {
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

  async runThrowLeft() {
    const result = await this.run();
    return result.getOrElse((err) => {
      throw err;
    });
  }

  then<TResult1 = Either<L, R>, TResult2 = never>(
    onfulfilled?:
      | ((value: Either<L, R>) => PromiseLike<TResult1> | TResult1)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => PromiseLike<TResult2> | TResult2)
      | undefined
      | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }
}
