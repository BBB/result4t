import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";

const reverseString = (a: string) => a.split("").reverse().join("");
const toString = <T extends { toString(): string }>(a: T) => a.toString();

describe("right", () => {
  it("should contain a value", () => {
    const result = Result.success("right");
    expect(result).toHaveProperty("inner");
    expect(result.flatten()).toEqual("right");
  });
});

describe("left", () => {
  it("should contain a value", () => {
    const result = Result.failure("left");
    expect(result).toHaveProperty("inner");
    expect(result.flatten()).toEqual("left");
  });
});

describe("map", () => {
  it("should transform a value on the right", () => {
    const result = Result.success("right").map(reverseString);
    expect(result.flatten()).toEqual("thgir");
  });
  it("should not transform a value on the left", () => {
    const result = Result.failure<string, string>("left").map(reverseString);
    expect(result.flatten()).toEqual("left");
  });
});

describe("mapLeft", () => {
  it("should transform a value on the left", () => {
    const result = Result.failure<string, string>("left").mapLeft(
      reverseString
    );
    expect(result.flatten()).toEqual("tfel");
  });
  it("should not transform a value on the right", () => {
    const result = Result.success<string, string>("right").mapLeft(
      reverseString
    );
    expect(result.flatten()).toEqual("right");
  });
});

describe("fold", () => {
  it("should transform a value on the left", () => {
    const result = Result.failure<string, number>("left").fold(
      reverseString,
      toString
    );
    expect(result).toEqual("tfel");
  });
  it("should transform a value on the right", () => {
    const result = Result.success<number, string>("right").fold(
      toString,
      reverseString
    );
    expect(result).toEqual("thgir");
  });
});

describe("getOrElse", () => {
  it("should transform a value on the left", () => {
    const error = new Error("Oops");
    const result = Result.failure<string, number>("left").getOrElse(
      () => error
    );
    expect(result).toEqual(error);
  });
  it("should return a value on the right", () => {
    const result = Result.success<number, string>("right").getOrElse(
      () => new Error("Oops")
    );
    expect(result).toEqual("right");
  });
});
