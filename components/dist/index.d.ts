import * as react_jsx_runtime from 'react/jsx-runtime';
import * as _asciidoctor_core_types from '@asciidoctor/core/types';
import * as react from 'react';
import { ReactNode, ReactElement } from 'react';
import { TabsProps, TabsTriggerProps, TabsListProps, TabsContentProps } from '@radix-ui/react-tabs';
import { SetRequired } from 'type-fest';

declare const AsciiDocBlocks: {
    Admonition: ({ node }: {
        node: _asciidoctor_core_types.Block;
    }) => react_jsx_runtime.JSX.Element;
    Listing: ({ node }: {
        node: _asciidoctor_core_types.Block;
    }) => react_jsx_runtime.JSX.Element;
    Table: ({ node }: {
        node: _asciidoctor_core_types.Table;
    }) => react_jsx_runtime.JSX.Element;
    Section: ({ node }: {
        node: _asciidoctor_core_types.Section;
    }) => react_jsx_runtime.JSX.Element;
};

type BadgeColor = 'default' | 'destructive' | 'notice' | 'neutral' | 'purple' | 'blue';
type BadgeVariant = 'default' | 'solid';
interface BadgeProps {
    color?: BadgeColor;
    className?: string;
    children: React.ReactNode;
    variant?: BadgeVariant;
}
declare const badgeColors: Record<BadgeVariant, Record<BadgeColor, string>>;
declare const Badge: ({ className, children, color, variant, }: BadgeProps) => react_jsx_runtime.JSX.Element;

declare const buttonSizes: readonly ["sm", "icon", "base"];
declare const variants: readonly ["primary", "secondary", "ghost", "danger"];
type ButtonSize = typeof buttonSizes[number];
type Variant = typeof variants[number];
type ButtonStyleProps = {
    size?: ButtonSize;
    variant?: Variant;
};
declare const buttonStyle: ({ size, variant, }?: ButtonStyleProps) => string;
interface ButtonProps extends React.ComponentPropsWithRef<'button'>, ButtonStyleProps {
    innerClassName?: string;
    loading?: boolean;
}
declare const Button: react.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const spinnerSizes: readonly ["base", "lg"];
declare const spinnerVariants: readonly ["primary", "secondary", "ghost", "danger"];
type SpinnerSize = typeof spinnerSizes[number];
type SpinnerVariant = typeof spinnerVariants[number];
interface SpinnerProps {
    className?: string;
    size?: SpinnerSize;
    variant?: SpinnerVariant;
}
declare const Spinner: ({ className, size, variant, }: SpinnerProps) => react_jsx_runtime.JSX.Element;
type Props$1 = {
    isLoading: boolean;
    children?: ReactNode;
    minTime?: number;
};
/** Loading spinner that shows for a minimum of `minTime` */
declare const SpinnerLoader: ({ isLoading, children, minTime }: Props$1) => react_jsx_runtime.JSX.Element;

type TabsRootProps = SetRequired<TabsProps, 'defaultValue'>;
declare const Tabs: {
    Root: ({ className, ...props }: TabsRootProps) => react_jsx_runtime.JSX.Element;
    Trigger: ({ children, className, ...props }: TabsTriggerProps) => react_jsx_runtime.JSX.Element;
    List: ({ className, ...props }: TabsListProps) => react_jsx_runtime.JSX.Element;
    Content: ({ className, ...props }: TabsContentProps) => react_jsx_runtime.JSX.Element;
};

type CheckboxProps = {
    indeterminate?: boolean;
    children?: React.ReactNode;
    className?: string;
} & Omit<React.ComponentProps<'input'>, 'type'>;
/** Checkbox component that handles label, styling, and indeterminate state */
declare const Checkbox: ({ indeterminate, children, className, ...inputProps }: CheckboxProps) => react_jsx_runtime.JSX.Element;

type Props = {
    icon?: ReactElement;
    title: string;
    body?: string;
} & ({
    buttonText: string;
    buttonTo: string;
} | {
    buttonText: string;
    onClick: () => void;
} | {
    buttonText?: never;
});
declare function EmptyMessage(props: Props): react_jsx_runtime.JSX.Element;

type ListboxItem<Value extends string = string> = {
    value: Value;
} & ({
    label: string;
    labelString?: never;
} | {
    label: ReactNode;
    labelString: string;
});
interface ListboxProps<Value extends string = string> {
    selected: Value | null;
    onChange: (value: Value) => void;
    items: ListboxItem<Value>[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    hasError?: boolean;
    name?: string;
    isLoading?: boolean;
}
declare const Listbox: <Value extends string = string>({ name, selected, items, placeholder, className, onChange, hasError, disabled, isLoading, ...props }: ListboxProps<Value>) => react_jsx_runtime.JSX.Element;

export { AsciiDocBlocks, Badge, BadgeColor, BadgeProps, BadgeVariant, Button, ButtonProps, ButtonSize, Checkbox, CheckboxProps, EmptyMessage, Listbox, ListboxItem, ListboxProps, Spinner, SpinnerLoader, SpinnerSize, SpinnerVariant, Tabs, TabsRootProps, Variant, badgeColors, buttonSizes, buttonStyle, spinnerSizes, spinnerVariants, variants };
