import { describe, expect, it } from "vitest";
import { Either } from "../src/Either";

const reverseString = (a: string) => a.split("").reverse().join("");

describe("right", () => {
  it("should contain a value", () => {
    const result = Either.right("right");
    expect(result).toHaveProperty("value");
    expect(result.flatten()).toEqual("right");
  });
});

describe("left", () => {
  it("should contain a value", () => {
    const result = Either.left("left");
    expect(result).toHaveProperty("value");
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
