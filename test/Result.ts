import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";

const reverseString = (a: string) => a.split("").reverse().join("");
const toString = <T extends { toString(): string }>(a: T) => a.toString();

describe("success", () => {
  it("should contain a value", () => {
    const result = Result.success("success");
    expect(result.get()).toEqual("success");
  });
});

describe("failure", () => {
  it("should contain a value", () => {
    const result = Result.failure("failure");
    expect(result.get()).toEqual("failure");
  });
});

describe("map", () => {
  it("should transform a success", () => {
    const result = Result.success("success").map(reverseString);
    expect(result.get()).toEqual("sseccus");
  });
  it("should not transform a failure", () => {
    const result = Result.failure<string, string>("failure").map(reverseString);
    expect(result.get()).toEqual("failure");
  });
});

describe("mapFailure", () => {
  it("should transform a failure", () => {
    const result = Result.failure<string, string>("failure").mapFailure(
      reverseString
    );
    expect(result.get()).toEqual("eruliaf");
  });
  it("should not transform a success", () => {
    const result = Result.success<string, string>("success").mapFailure(
      reverseString
    );
    expect(result.get()).toEqual("success");
  });
});

describe("fold", () => {
  it("should transform a failure", () => {
    const result = Result.failure<string, number>("failure").fold(
      reverseString,
      toString
    );
    expect(result).toEqual("eruliaf");
  });
  it("should transform a success", () => {
    const result = Result.success<number, string>("success").fold(
      toString,
      reverseString
    );
    expect(result).toEqual("sseccus");
  });
});

describe("getOrElse", () => {
  it("should transform a failure", () => {
    const error = new Error("Oops");
    const result = Result.failure<string, number>("failure").getOrElse(
      () => error
    );
    expect(result).toEqual(error);
  });
  it("should return a success", () => {
    const result = Result.success<number, string>("success").getOrElse(
      () => new Error("Oops")
    );
    expect(result).toEqual("success");
  });
});
