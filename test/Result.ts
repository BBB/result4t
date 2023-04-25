import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";

const reverseString = (a: string) => a.split("").reverse().join("");
const toString = <T extends { toString(): string }>(a: T) => a.toString();

describe("misc", () => {
  it("can mapFailure before a map", () => {
    const result = Result.success<"one" | "two", Error>("one")
      .mapFailure((_) => false)
      .flatMap((s) => {
        return Result.failure(true);
      })
      .map((_) => {});

    expect(result).toStrictEqual(Result.failure(true));
  });
  it("can change both sides in a flatMap when Failure share interface", () => {
    interface Failed {
      name: string;
    }
    class FailedTwo implements Failed {
      name = "FailedTwo" as string;
    }

    function getSuccess() {
      return Result.success<string, Failed>("success");
    }

    const result = getSuccess().flatMap((v) => {
      return Result.success<number, FailedTwo>(3);
    });
    expect(result).toStrictEqual(Result.success(3));
  });
});
describe("success", () => {
  it("should contain a value", () => {
    const result = Result.success("success");
    expect(result).toStrictEqual(Result.success("success"));
  });
  it("will be success", () => {
    const result = Result.success("success");
    expect(result.isSuccess()).toStrictEqual(true);
  });
  it("should filter out failure", () => {
    const result = Result.success<"success", "failure">("success");
    if (result.isSuccess()) {
      const str: "success" = result.get();
      expect(str).toStrictEqual("success");
      return;
    }
    const error: "failure" = result.get();
    expect(error).toStrictEqual("failure");
  });
});

describe("failure", () => {
  it("should contain a value", () => {
    const result = Result.failure("failure");
    expect(result).toStrictEqual(Result.failure("failure"));
  });
  it("will be failure", () => {
    const result = Result.failure("failure");
    expect(result.isFailure()).toStrictEqual(true);
  });
  it("should filter out success", () => {
    const result = Result.failure<"success", "failure">("failure");
    if (result.isSuccess()) {
      const str: "success" = result.get();
      expect(str).toStrictEqual("success");
      return;
    }
    const error: "failure" = result.get();
    expect(error).toStrictEqual("failure");
  });
});

describe("flatMap", () => {
  it("should contain a value", () => {
    const result = Result.success("failure").flatMap(() =>
      Result.failure("oh no")
    );
    expect(result).toStrictEqual(Result.failure("oh no"));
  });
});

describe("map", () => {
  it("should transform a success", () => {
    const result = Result.success("success").map(reverseString);
    expect(result).toStrictEqual(Result.success("sseccus"));
  });
  it("should not transform a failure", () => {
    const result = Result.failure<string, string>("failure").map(reverseString);
    expect(result).toStrictEqual(Result.failure("failure"));
  });
});

describe("mapFailure", () => {
  it("should transform a failure", () => {
    const result = Result.failure<string, string>("failure").mapFailure(
      reverseString
    );
    expect(result).toStrictEqual(Result.failure("eruliaf"));
  });
  it("should not transform a success", () => {
    const result = Result.success<string, string>("success").mapFailure(
      reverseString
    );
    expect(result).toStrictEqual(Result.success("success"));
  });
});

describe("fold", () => {
  it("should transform a failure", () => {
    const result = Result.failure<number, string>("failure").fold(
      toString,
      reverseString
    );
    expect(result).toEqual("eruliaf");
  });
  it("should transform a success", () => {
    const result = Result.success<string, number>("success").fold(
      reverseString,
      toString
    );
    expect(result).toEqual("sseccus");
  });
});

describe("getOrElse", () => {
  it("should transform a failure", () => {
    const error = new Error("Oops");
    const result = Result.failure<number, string>("failure").getOrElse(
      () => error
    );
    expect(result).toEqual(error);
  });
  it("should return a success", () => {
    const result = Result.success<string, number>("success").getOrElse(
      () => new Error("Oops")
    );
    expect(result).toEqual("success");
  });
});
