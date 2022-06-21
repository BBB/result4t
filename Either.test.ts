import { Either } from "./src/Either";

const val = Either.right(true)
  .map((v) => false as const)
  .map((v) => v.toString())
  .map((a) => a.toUpperCase())
  .mapLeft((v) => new Error())
  .fold(
    (l) => false,
    () => true
  );
