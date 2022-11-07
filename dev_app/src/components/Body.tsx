/*
 * Author: Alexandre Havrileck (Oxyno-zeta)
 * Date: 30/10/16
 * Licence: See Readme
 */

import _ from "lodash";
import React, { ChangeEvent, useCallback, useRef, useState } from "react";
// @ts-ignore
import { JsonTree } from "react-editable-json-tree";

const styles = {
  table: {
    width: "100%",
  },
  cell: {
    verticalAlign: "top",
  },
  code: {
    backgroundColor: "#e0e0e0",
    border: "1px lightgrey solid",
  },
  container: {
    margin: "0 15px",
    minWidth: "200px",
  },
  customInput: {
    backgroundColor: "black",
    color: "yellow",
    border: "1px solid green",
  },
};

const defaultJson = {
  error: new Error("error"),
  func: () => {
    console.log("test");
  },
  text: "text",
  int: 100,
  boolean: true,
  null: null,
  // eslint-disable-next-line object-shorthand
  undefined: undefined,
  object: {
    text: "text",
    int: 100,
    boolean: true,
  },
  array: [1, 2, 3, { string: "test" }],
};

type ReadOnlyCallback = (
  name: string,
  value: unknown,
  keyPath: string
) => boolean;

function Body() {
  //region State

  const [json, setJson] = useState(_.cloneDeep(defaultJson));
  const [deltaUpdateString, setDeltaUpdateString] = useState("{}");
  const [readOnlyTreeProp, setReadOnlyTreeProp] = useState<
    boolean | (() => ReadOnlyCallback)
  >(false);
  const [globalUpdateString, setGlobalUpdateString] = useState("{}");

  const [checkedCustomInput, setCheckedCustomInput] = useState(false);
  const [checkedMinusMenu, setCheckedMinusMenu] = useState(false);
  const [checkedReadOnly, setCheckedReadOnly] = useState(false);
  const [checkedReadOnlyFunction, setCheckedReadOnlyFunction] = useState(false);
  const [checkedReadOnlyBoolean, setCheckedReadOnlyBoolean] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  //endregion
  //region Memos

  const customInputElement = checkedCustomInput ? (
    <input style={styles.customInput} />
  ) : undefined;
  const minusMenuElement = checkedMinusMenu ? (
    <button type="button">Remove</button>
  ) : undefined;

  //endregion
  //region Callbacks

  const onFullyUpdate = useCallback((newJson: object) => {
    setGlobalUpdateString(JSON.stringify(newJson, null, 4));
  }, []);

  const onDeltaUpdate = useCallback((deltaUpdate: object) => {
    setDeltaUpdateString(JSON.stringify(deltaUpdate, null, 4));
  }, []);

  const handleCheck = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      return (event: ChangeEvent<HTMLInputElement>) => {
        setter(event.target.checked);
      };
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!textareaRef.current) return;

    const jsonString = textareaRef.current.value;
    if (!jsonString) return;

    try {
      setJson(JSON.parse(jsonString));
    } catch (e) {
      // Nothing
      // eslint-disable-next-line no-console
      console.error(e);
      return;
    }
    // Reset value
    textareaRef.current.value = "";
  }, []);

  const handleResetToDefault = useCallback(() => {
    setJson(_.cloneDeep(defaultJson));
  }, []);

  const setReadOnlyTreePropWithBoolean = useCallback((newValue: boolean) => {
    setReadOnlyTreeProp(newValue);
  }, []);

  const setReadOnlyTreePropWithFunction = useCallback((newValue: boolean) => {
    if (newValue) {
      setReadOnlyTreeProp(
        (): ReadOnlyCallback => (name, value, keyPath) =>
          keyPath[keyPath.length - 1] === "text"
      );
    } else {
      setReadOnlyTreeProp((): ReadOnlyCallback => () => false);
    }
  }, []);

  const handleChangeReadOnly = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCheckedReadOnly(event.target.checked);
      if (!event.target.checked) {
        setReadOnlyTreeProp(false);
      } else {
        // Reapply the "child" readonly fields
        if (checkedReadOnlyBoolean) setReadOnlyTreePropWithBoolean(true);
        else if (checkedReadOnlyFunction) setReadOnlyTreePropWithFunction(true);
      }
    },
    [
      checkedReadOnlyBoolean,
      checkedReadOnlyFunction,
      setReadOnlyTreePropWithBoolean,
      setReadOnlyTreePropWithFunction,
    ]
  );

  const handleChangeReadOnlyBoolean = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCheckedReadOnlyBoolean(event.target.checked);
      setReadOnlyTreePropWithBoolean(event.target.checked);
    },
    [setReadOnlyTreePropWithBoolean]
  );

  const handleChangeReadOnlyFunction = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCheckedReadOnlyFunction(event.target.checked);
      setReadOnlyTreePropWithFunction(event.target.checked);
    },
    [setReadOnlyTreePropWithFunction]
  );

  const handleClearGlobalUpdateString = useCallback(() => {
    setGlobalUpdateString("{}");
  }, []);

  const handleClearDeltaUpdateString = useCallback(() => {
    setDeltaUpdateString("{}");
  }, []);

  //endregion
  //region Render

  return (
    <div>
      <div style={styles.container}>
        <span>
          <input type="checkbox" onChange={handleChangeReadOnly} />
          Read Only
        </span>
        <span>
          <input
            type="checkbox"
            onChange={handleChangeReadOnlyBoolean}
            disabled={!checkedReadOnly || checkedReadOnlyFunction}
          />
          Read Only Boolean
        </span>
        <span>
          <input
            type="checkbox"
            onChange={handleChangeReadOnlyFunction}
            disabled={!checkedReadOnly || checkedReadOnlyBoolean}
          />
          Read Only Function (read only for all &apos;text&apos; key)
        </span>
        <span>
          <input
            type="checkbox"
            onChange={handleCheck(setCheckedCustomInput)}
          />
          Custom input
        </span>
        <span>
          <input type="checkbox" onChange={handleCheck(setCheckedMinusMenu)} />
          Custom minus menu
        </span>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>
              <span>Result</span>
            </th>
            <th>
              <span>
                Global Update{" "}
                <button type="button" onClick={handleClearGlobalUpdateString}>
                  Clear
                </button>
              </span>
            </th>
            <th>
              <span>
                Delta Update{" "}
                <button type="button" onClick={handleClearDeltaUpdateString}>
                  Clear
                </button>
              </span>
            </th>
            <th>
              <span>Put Your Json</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.cell}>
              <div style={styles.container}>
                <JsonTree
                  data={json}
                  onFullyUpdate={onFullyUpdate}
                  onDeltaUpdate={onDeltaUpdate}
                  readOnly={readOnlyTreeProp}
                  inputElement={customInputElement}
                  minusMenuElement={minusMenuElement}
                  logger={console}
                />
              </div>
            </td>
            <td style={styles.cell}>
              <div style={styles.container}>
                <pre style={styles.code}>{globalUpdateString}</pre>
              </div>
            </td>
            <td style={styles.cell}>
              <div style={styles.container}>
                <pre style={styles.code}>{deltaUpdateString}</pre>
              </div>
            </td>
            <td style={styles.cell}>
              <div style={styles.container}>
                <textarea ref={textareaRef} rows={15} cols={40} />
                <div>
                  <button type="button" onClick={handleSubmit}>
                    Submit
                  </button>
                  <button type="button" onClick={handleResetToDefault}>
                    Default
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  //endregion
}

export default Body;
