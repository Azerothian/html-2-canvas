import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import expect from "expect";

import UnitSize from "../utils/unit-size";


describe("size tests", () => {
  it("instance test", () => {
    const result = new UnitSize(1);
    // expect(result instanceof Number).toBeTruthy();
    expect(result instanceof UnitSize).toBeTruthy();
    expect(typeof result).toEqual("object");
    // expect(typeof result).toNotEqual("number");
  });
  it("equals test", () => {
    // console.log("test", UnitSize.zero() == UnitSize.zero()); //eslint-disable-line
    expect(UnitSize.zero().equals(UnitSize.zero())).toBeTruthy();
  });
  it("operator - multiply", async() => {
    let x = new UnitSize(10);
    let y = new UnitSize(10);
    let result = x * y;
    expect(result).toEqual(100);
    expect(typeof result).toEqual("number");
  });
  it("function - multiply", async() => {
    let x = new UnitSize(10);
    let result = new UnitSize(10).multiply(10, x);
    // console.log(typeof result);
    expect(result).toEqual(1000); // this does not do === compare
    expect(result instanceof UnitSize).toBeTruthy();
  });
  it("operator - greater", async() => {
    let x = new UnitSize(11);
    let y = new UnitSize(10);
    let result = x > y && y < 11;
    expect(result).toBeTruthy();
  });
  it("operator - add", async() => {
    let x = new UnitSize(10);
    let y = new UnitSize(10);
    let result = x + y;
    expect(result).toEqual(20);
    expect(typeof result).toEqual("number");
  });
  it("UnitSize.test", () => {
    expect(UnitSize.test("a")).toBeFalsy();
    expect(UnitSize.test("1")).toBeTruthy();
    expect(UnitSize.test("1.2")).toBeTruthy();
    expect(UnitSize.test("1.2px")).toBeTruthy();
    expect(UnitSize.test("1px")).toBeTruthy();
  });
  it("em test", () => {
    const testStructure = {
      parent: {
        parent: {
          format: {
            font: {
              size: new UnitSize("10px"),
            }
          }
        },
        format: {
          font: {
            size: new UnitSize("1.5em"),
          }
        }
      },
    };
    const result = new UnitSize("1em").valueOf(testStructure);
    expect(result).toEqual(15);

  });

  it("em test", () => {
    const size = new UnitSize("1.5em");
    const testStructure = {
      parent: {
        parent: {
          parent: {
            format: {
              font: {
                size: new UnitSize("10px"),
              },
            },
          },
          format: {
            font: {
              size: size,
            },
          },
        },
        format: {
          font: {
            size: size,
          },
        },
      },
    };
    const result = new UnitSize("1em").valueOf(testStructure);
    expect(result).toEqual(15);

  });
  it("object compare", () => { // issue with inheriting number and object compare
    const test = new UnitSize(33);
    const ob1 = {
      x: test,
    };
    const ob2 = {
      y: test,
    };
    expect(ob1.x === ob2.y).toBeTruthy();
  });
});
