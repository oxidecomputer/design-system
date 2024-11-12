// components/src/asciidoc/Admonition.tsx
import { Title, parse } from "@oxide/react-asciidoc";

// components/src/utils.ts
var titleCase = (text) => {
  return text.replace(
    /\w\S*/g,
    (text2) => text2.charAt(0).toUpperCase() + text2.substring(1).toLowerCase()
  );
};
var make = (tag) => (
  // only one argument here means string interpolations are not allowed
  (strings) => {
    const Comp = ({ className, children, ...rest }) => React.createElement(tag, { className: cn(strings[0], className), ...rest }, children);
    Comp.displayName = `classed.${tag}`;
    return Comp;
  }
);
var classed = {
  button: make("button"),
  div: make("div"),
  h1: make("h1"),
  h2: make("h2"),
  h3: make("h3"),
  h4: make("h4"),
  hr: make("hr"),
  header: make("header"),
  input: make("input"),
  label: make("label"),
  li: make("li"),
  main: make("main"),
  ol: make("ol"),
  p: make("p"),
  span: make("span"),
  table: make("table"),
  tbody: make("tbody"),
  td: make("td"),
  th: make("th"),
  tr: make("tr")
};

// components/src/asciidoc/Admonition.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var Admonition = ({ node }) => {
  const attrs = node.attributes;
  let icon;
  if (attrs.name === "caution") {
    icon = /* @__PURE__ */ jsx(Error12, {});
  } else if (attrs.name === "warning") {
    icon = /* @__PURE__ */ jsx(Warning12, {});
  } else {
    icon = /* @__PURE__ */ jsx(Error12, { className: "rotate-180" });
  }
  return /* @__PURE__ */ jsxs("div", { className: `admonitionblock ${attrs.name}`, children: [
    /* @__PURE__ */ jsx("div", { className: "admonition-icon", children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "admonition-content content", children: [
      /* @__PURE__ */ jsx(Title, { text: node.title }),
      /* @__PURE__ */ jsx("div", { children: titleCase(attrs.name.toString()) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Title, { text: node.title }),
        node.content && parse(node.content)
      ] })
    ] })
  ] });
};
var Error12 = ({ className }) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12Zm.083-9c.368 0 .667.299.667.667v2.666A.667.667 0 0 1 6.083 7h-.166a.667.667 0 0 1-.667-.667V3.667c0-.368.299-.667.667-.667h.166Zm0 5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667h-.166a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h.166Z",
        fill: "currentColor"
      }
    )
  }
);
var Warning12 = ({ className }) => /* @__PURE__ */ jsx(
  "svg",
  {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12Zm.083-9c.368 0 .667.299.667.667v2.666A.667.667 0 0 1 6.083 7h-.166a.667.667 0 0 1-.667-.667V3.667c0-.368.299-.667.667-.667h.166Zm0 5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667h-.166a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h.166Z",
        fill: "currentColor"
      }
    )
  }
);
var Admonition_default = Admonition;

// components/src/asciidoc/Table.tsx
import { Table as InnerTable } from "@oxide/react-asciidoc";
import { jsx as jsx2 } from "react/jsx-runtime";
var Table = ({ node }) => /* @__PURE__ */ jsx2("div", { className: "table-wrapper", children: /* @__PURE__ */ jsx2(InnerTable, { node }) });
var Table_default = Table;

// components/src/asciidoc/index.ts
var AsciiDocBlocks = {
  Admonition: Admonition_default,
  Table: Table_default
};

// components/src/ui/badge/Badge.tsx
import cn2 from "classnames";
import { jsx as jsx3 } from "react/jsx-runtime";
var badgeColors = {
  default: {
    default: `ring-1 ring-inset bg-accent-secondary text-accent ring-[rgba(var(--base-green-800-rgb),0.15)]`,
    destructive: `ring-1 ring-inset bg-destructive-secondary text-destructive ring-[rgba(var(--base-red-800-rgb),0.15)]`,
    notice: `ring-1 ring-inset bg-notice-secondary text-notice ring-[rgba(var(--base-yellow-800-rgb),0.15)]`,
    neutral: `ring-1 ring-inset bg-secondary text-secondary ring-[rgba(var(--base-neutral-700-rgb),0.15)]`,
    purple: `ring-1 ring-inset bg-[var(--base-purple-200)] text-[var(--base-purple-700)] ring-[rgba(var(--base-purple-800-rgb),0.15)]`,
    blue: `ring-1 ring-inset bg-info-secondary text-info ring-[rgba(var(--base-blue-800-rgb),0.15)]`
  },
  solid: {
    default: "bg-accent text-inverse",
    destructive: "bg-destructive text-inverse",
    notice: "bg-notice text-inverse",
    neutral: "bg-inverse-tertiary text-inverse",
    purple: "bg-[var(--base-purple-700)] text-inverse",
    blue: "bg-info text-inverse"
  }
};
var Badge = ({
  className,
  children,
  color = "default",
  variant = "default"
}) => {
  return /* @__PURE__ */ jsx3(
    "span",
    {
      className: cn2(
        "ox-badge",
        `variant-${variant}`,
        "inline-flex h-4 items-center whitespace-nowrap rounded-sm px-[3px] py-[1px] uppercase text-mono-sm",
        badgeColors[variant][color],
        className
      ),
      children: /* @__PURE__ */ jsx3("span", { children })
    }
  );
};

// components/src/ui/button/Button.tsx
import cn3 from "classnames";
import { forwardRef } from "react";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var buttonSizes = ["sm", "icon", "base"];
var variants = ["primary", "secondary", "ghost", "danger"];
var sizeStyle = {
  sm: "h-8 px-3 text-mono-sm svg:w-4",
  // meant for buttons that only contain a single icon
  icon: "h-8 w-8 text-mono-sm svg:w-4",
  base: "h-10 px-4 text-mono-sm svg:w-5"
};
var buttonStyle = ({
  size: size2 = "base",
  variant = "primary"
} = {}) => {
  return cn3(
    "ox-button inline-flex items-center justify-center rounded align-top elevation-1 disabled:cursor-not-allowed",
    `btn-${variant}`,
    sizeStyle[size2],
    variant === "danger" ? "focus:outline-destructive-secondary" : "focus:outline-accent-secondary"
  );
};
var noop = (e) => {
  e.stopPropagation();
  e.preventDefault();
};
var Button = forwardRef(
  ({
    type = "button",
    children,
    size: size2,
    variant,
    className,
    loading,
    innerClassName,
    disabled,
    onClick,
    // needs to be a spread because we sometimes get passed arbitrary <button>
    // props by the parent
    ...rest
  }, ref) => {
    const isDisabled = disabled || loading;
    return /* @__PURE__ */ jsxs2(
      "button",
      {
        className: cn3(buttonStyle({ size: size2, variant }), className, {
          "visually-disabled": isDisabled
        }),
        ref,
        type,
        onMouseDown: isDisabled ? noop : void 0,
        onClick: isDisabled ? noop : onClick,
        "aria-disabled": isDisabled,
        ...rest,
        children: [
          loading && /* @__PURE__ */ jsx4(Spinner, { className: "absolute", variant }),
          /* @__PURE__ */ jsx4("span", { className: cn3("flex items-center", innerClassName, { invisible: loading }), children })
        ]
      }
    );
  }
);

// components/src/ui/spinner/Spinner.tsx
import cn4 from "classnames";
import { useEffect, useRef, useState } from "react";
import { Fragment, jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var spinnerSizes = ["base", "lg"];
var spinnerVariants = ["primary", "secondary", "ghost", "danger"];
var Spinner = ({
  className,
  size: size2 = "base",
  variant = "primary"
}) => {
  const frameSize = size2 === "lg" ? 36 : 12;
  const center = size2 === "lg" ? 18 : 6;
  const radius = size2 === "lg" ? 16 : 5;
  const strokeWidth = size2 === "lg" ? 3 : 2;
  return /* @__PURE__ */ jsxs3(
    "svg",
    {
      width: frameSize,
      height: frameSize,
      viewBox: `0 0 ${frameSize + " " + frameSize}`,
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-labelledby": "Spinner",
      className: cn4("spinner", `spinner-${variant}`, `spinner-${size2}`, className),
      children: [
        /* @__PURE__ */ jsx5(
          "circle",
          {
            fill: "none",
            className: "bg",
            strokeWidth,
            strokeLinecap: "round",
            cx: center,
            cy: center,
            r: radius,
            strokeOpacity: 0.2
          }
        ),
        /* @__PURE__ */ jsx5(
          "circle",
          {
            className: "path",
            fill: "none",
            stroke: "currentColor",
            strokeWidth,
            strokeLinecap: "round",
            cx: center,
            cy: center,
            r: radius
          }
        )
      ]
    }
  );
};
var SpinnerLoader = ({ isLoading, children = null, minTime = 500 }) => {
  const [isVisible, setIsVisible] = useState(isLoading);
  const hideTimeout = useRef(null);
  const loadingStartTime = useRef(0);
  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      loadingStartTime.current = Date.now();
    } else {
      if (hideTimeout.current)
        clearTimeout(hideTimeout.current);
      const elapsedTime = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, minTime - elapsedTime);
      if (remainingTime === 0) {
        setIsVisible(false);
      } else {
        hideTimeout.current = setTimeout(() => setIsVisible(false), remainingTime);
      }
    }
    return () => {
      if (hideTimeout.current)
        clearTimeout(hideTimeout.current);
    };
  }, [isLoading, minTime]);
  return isVisible ? /* @__PURE__ */ jsx5(Spinner, {}) : /* @__PURE__ */ jsx5(Fragment, { children });
};

// components/src/ui/tabs/Tabs.tsx
import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import cn5 from "classnames";
import { jsx as jsx6 } from "react/jsx-runtime";
var Tabs = {
  Root: ({ className, ...props }) => /* @__PURE__ */ jsx6(Root, { ...props, className: cn5("ox-tabs", className) }),
  Trigger: ({ children, className, ...props }) => /* @__PURE__ */ jsx6(Trigger, { ...props, className: cn5("ox-tab", className), children: /* @__PURE__ */ jsx6("div", { children }) }),
  List: ({ className, ...props }) => /* @__PURE__ */ jsx6(List, { ...props, className: cn5("ox-tabs-list", className) }),
  Content: ({ className, ...props }) => /* @__PURE__ */ jsx6(Content, { ...props, className: cn5("ox-tabs-panel", className) })
};

// icons/react/Checkmark12Icon.tsx
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var Checkmark12Icon = ({
  title,
  titleId,
  ...props
}) => /* @__PURE__ */ jsxs4(
  "svg",
  {
    width: 12,
    height: 12,
    viewBox: "0 0 12 12",
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    "aria-labelledby": titleId,
    ...props,
    children: [
      title ? /* @__PURE__ */ jsx7("title", { id: titleId, children: title }) : null,
      /* @__PURE__ */ jsx7(
        "path",
        {
          fillRule: "evenodd",
          clipRule: "evenodd",
          d: "M10.492 2.651c.28.242.31.665.067.944L5.447 9.463a.667.667 0 0 1-.974.035L1.475 6.516a.667.667 0 0 1 0-.946l.237-.235a.667.667 0 0 1 .94 0l2.24 2.226L9.3 2.501a.667.667 0 0 1 .938-.068l.253.218Z",
          fill: "currentColor"
        }
      )
    ]
  }
);
var Checkmark12Icon_default = Checkmark12Icon;

// icons/react/SelectArrows6Icon.tsx
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
var SelectArrows6Icon = ({
  title,
  titleId,
  ...props
}) => /* @__PURE__ */ jsxs5(
  "svg",
  {
    width: 6,
    height: 14,
    viewBox: "0 0 6 14",
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    "aria-labelledby": titleId,
    ...props,
    children: [
      title ? /* @__PURE__ */ jsx8("title", { id: titleId, children: title }) : null,
      /* @__PURE__ */ jsx8(
        "path",
        {
          fillRule: "evenodd",
          clipRule: "evenodd",
          d: "M3.322.536a.375.375 0 0 0-.644 0L.341 4.432C.19 4.682.37 5 .662 5h4.676a.375.375 0 0 0 .321-.568L3.322.536Zm-.644 12.928a.375.375 0 0 0 .644 0l2.337-3.896A.375.375 0 0 0 5.338 9H.662a.375.375 0 0 0-.321.568l2.337 3.896Z",
          fill: "currentColor"
        }
      )
    ]
  }
);
var SelectArrows6Icon_default = SelectArrows6Icon;

// components/src/ui/checkbox/Checkbox.tsx
import cn6 from "classnames";
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
var Check = () => /* @__PURE__ */ jsx9(Checkmark12Icon_default, { className: "pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 fill-current text-accent" });
var Indeterminate = classed.div`absolute w-2 h-0.5 left-1 top-[7px] bg-accent pointer-events-none`;
var inputStyle = `
  appearance-none border border-default bg-default h-4 w-4 rounded-sm absolute left-0 outline-none
  disabled:cursor-not-allowed
  hover:border-hover hover:cursor-pointer
  checked:bg-accent-secondary checked:border-accent-secondary checked:hover:border-accent
  indeterminate:bg-accent-secondary indeterminate:border-accent hover:indeterminate:bg-accent-secondary-hover
`;
var Checkbox = ({
  indeterminate,
  children,
  className,
  ...inputProps
}) => /* @__PURE__ */ jsxs6("label", { className: "inline-flex items-center", children: [
  /* @__PURE__ */ jsxs6("span", { className: "relative h-4 w-4", children: [
    /* @__PURE__ */ jsx9(
      "input",
      {
        className: cn6(inputStyle, className),
        type: "checkbox",
        ref: (el) => el && (el.indeterminate = !!indeterminate),
        ...inputProps
      }
    ),
    inputProps.checked && !indeterminate && /* @__PURE__ */ jsx9(Check, {}),
    indeterminate && /* @__PURE__ */ jsx9(Indeterminate, {})
  ] }),
  children && /* @__PURE__ */ jsx9("span", { className: "ml-2.5 text-sans-md text-secondary", children })
] });

// components/src/ui/listbox/Listbox.tsx
import { FloatingPortal, flip, offset, size, useFloating } from "@floating-ui/react";
import { Listbox as Select } from "@headlessui/react";
import cn7 from "classnames";
import { Fragment as Fragment2, jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
var Listbox = ({
  name,
  selected,
  items,
  placeholder = "Select an option",
  className,
  onChange,
  hasError = false,
  disabled,
  isLoading = false,
  ...props
}) => {
  const { refs, floatingStyles } = useFloating({
    middleware: [
      offset(12),
      flip(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`
          });
        }
      })
    ]
  });
  const selectedItem = selected && items.find((i) => i.value === selected);
  const noItems = !isLoading && items.length === 0;
  const isDisabled = disabled || noItems;
  return /* @__PURE__ */ jsx10("div", { className: cn7("relative", className), children: /* @__PURE__ */ jsx10(
    Select,
    {
      value: selected,
      onChange: (val) => val !== null && onChange(val),
      disabled: isDisabled || isLoading,
      children: ({ open }) => /* @__PURE__ */ jsxs7(Fragment2, { children: [
        /* @__PURE__ */ jsxs7(
          Select.Button,
          {
            name,
            ref: refs.setReference,
            className: cn7(
              `flex h-10 w-full items-center justify-between
                    rounded border text-sans-md`,
              hasError ? "focus-error border-error-secondary hover:border-error" : "border-default hover:border-hover",
              open && "ring-2 ring-accent-secondary",
              open && hasError && "ring-error-secondary",
              isDisabled ? "cursor-not-allowed text-disabled bg-disabled !border-default" : "bg-default",
              isDisabled && hasError && "!border-error-secondary"
            ),
            ...props,
            children: [
              /* @__PURE__ */ jsx10("div", { className: "w-full px-3 text-left", children: selectedItem ? (
                // labelString is one line, which is what we need when label is a ReactNode
                selectedItem.labelString || selectedItem.label
              ) : /* @__PURE__ */ jsx10("span", { className: "text-quaternary", children: noItems ? "No items" : placeholder }) }),
              !isDisabled && /* @__PURE__ */ jsx10(SpinnerLoader, { isLoading }),
              /* @__PURE__ */ jsx10(
                "div",
                {
                  className: "ml-3 flex h-[calc(100%-12px)] items-center border-l px-3 border-secondary",
                  "aria-hidden": true,
                  children: /* @__PURE__ */ jsx10(SelectArrows6Icon_default, { className: "h-[14px] w-2 text-tertiary" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx10(FloatingPortal, { children: /* @__PURE__ */ jsx10(
          Select.Options,
          {
            ref: refs.setFloating,
            style: floatingStyles,
            className: "ox-menu pointer-events-auto z-50 overflow-y-auto !outline-none",
            children: items.map((item) => /* @__PURE__ */ jsx10(
              Select.Option,
              {
                value: item.value,
                className: "relative border-b border-secondary last:border-0",
                children: ({ active, selected: selected2 }) => /* @__PURE__ */ jsx10(
                  "div",
                  {
                    className: cn7(
                      "ox-menu-item text-secondary",
                      selected2 && "is-selected",
                      active && "is-highlighted"
                    ),
                    children: item.label
                  }
                )
              },
              item.value
            ))
          }
        ) })
      ] })
    }
  ) });
};
export {
  AsciiDocBlocks,
  Badge,
  Button,
  Checkbox,
  Listbox,
  Spinner,
  SpinnerLoader,
  Tabs,
  badgeColors,
  buttonSizes,
  buttonStyle,
  spinnerSizes,
  spinnerVariants,
  variants
};
//# sourceMappingURL=index.js.map