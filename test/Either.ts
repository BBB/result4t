import { describe, expect, it } from "vitest";
import { Either } from "../src/Either";

const reverseString = (a: string) => a.split("").reverse().join("");
const toString = <T extends { toString(): string }>(a: T) => a.toString();

describe("right", () => {
  it("should contain a value", () => {
    const result = Either.right("right");
    expect(result).toHaveProperty("inner");
    expect(result.flatten()).toEqual("right");
  });
});

describe("left", () => {
  it("should contain a value", () => {
    const result = Either.left("left");
    expect(result).toHaveProperty("inner");
    expect(result.flatten()).toEqual("left");
  });
});

describe("map", () => {
  it("should transform a value on the right", () => {
    const result = Either.right("right").map(reverseString);
    expect(result.flatten()).toEqual("thgir");
  });
  it("should not transform a value on the left", () => {
    const result = Either.left<string, string>("left").map(reverseString);
    expect(result.flatten()).toEqual("left");
  });
});

describe("mapLeft", () => {
  it("should transform a value on the left", () => {
    const result = Either.left<string, string>("left").mapLeft(reverseString);
    expect(result.flatten()).toEqual("tfel");
  });
  it("should not transform a value on the right", () => {
    const result = Either.right<string, string>("right").mapLeft(reverseString);
    expect(result.flatten()).toEqual("right");
  });
});

describe("fold", () => {
  it("should transform a value on the left", () => {
    const result = Either.left<string, number>("left").fold(
      reverseString,
      toString
    );
    expect(result).toEqual("tfel");
  });
  it("should transform a value on the right", () => {
    const result = Either.right<number, string>("right").fold(
      toString,
      reverseString
    );
    expect(result).toEqual("thgir");
  });
});
