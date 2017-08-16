import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import expect from "expect";

import Size from "../utils/size";


describe("size tests", () => {
  it("instance test", () => {
    const result = new Size(1);
    expect(result instanceof Number).toBeTruthy();
    expect(result instanceof Size).toBeTruthy();
    expect(typeof result).toEqual("object");
    expect(typeof result).toNotEqual("number");
  });
  it("equals test", () => {
    // console.log("test", Size.zero() == Size.zero()); //eslint-disable-line
    expect(Size.zero().equals(Size.zero())).toBeTruthy();
  });
  it("operator - multiply", async() => {
    let x = new Size(10);
    let y = new Size(10);
    let result = x * y;
    expect(result).toEqual(100);
    expect(typeof result).toEqual("number");
  });
  it("function - multiply", async() => {
    let x = new Size(10);
    let result = new Size(10).multiply(10, x);
    // console.log(typeof result);
    expect(result).toEqual(1000); // this does not do === compare
    expect(result instanceof Size).toBeTruthy();
  });
  it("operator - greater", async() => {
    let x = new Size(11);
    let y = new Size(10);
    let result = x > y && y < 11;
    expect(result).toBeTruthy();
  });
  it("operator - add", async() => {
    let x = new Size(10);
    let y = new Size(10);
    let result = x + y;
    expect(result).toEqual(20);
    expect(typeof result).toEqual("number");
  });
  it("Size.test", () => {
    expect(Size.test("a")).toBeFalsy();
    expect(Size.test("1")).toBeTruthy();
    expect(Size.test("1.2")).toBeTruthy();
    expect(Size.test("1.2px")).toBeTruthy();
    expect(Size.test("1px")).toBeTruthy();
  });
  it("em test", () => {
    const testStructure = {
      parent: {
        parent: {
          format: {
            font: {
              size: new Size("10px"),
            }
          }
        },
        format: {
          font: {
            size: new Size("1.5em"),
          }
        }
      },
    };
    const result = new Size("1em").valueOf(testStructure);
    expect(result).toEqual(15);

  });

  it("em test", () => {
    const testStructure = {
      parent: {
        parent: {
          parent: {
            format: {
              font: {
                size: new Size("10px"),
              }
            }
          },
          format: {}
        },
        format: {
          font: {
            size: new Size("1.5em"),
          }
        }
      }
    };
    const result = new Size("1em").valueOf(testStructure);
    expect(result).toEqual(15);

  });

});
