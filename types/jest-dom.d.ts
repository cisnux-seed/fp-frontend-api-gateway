import '@testing-library/jest-dom';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveClass(className: string): R;
            toHaveTextContent(text: string | RegExp): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toHaveValue(value: string | number): R;
            toBeVisible(): R;
            toBeChecked(): R;
            toHaveFocus(): R;
            toHaveAttribute(attr: string, value?: string): R;
            toHaveStyle(style: string | object): R;
            toBeEmptyDOMElement(): R;
            toBeInvalid(): R;
            toBeValid(): R;
            toBeRequired(): R;
        }
    }
}