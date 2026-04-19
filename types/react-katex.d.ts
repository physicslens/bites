declare module "react-katex" {
  import * as React from "react";

  export interface BlockMathProps {
    math: string;
    errorColor?: string;
    throwOnError?: boolean;
    renderError?: (e: Error) => React.ReactNode;
    trust?: boolean;
    macros?: Record<string, string>;
    delimiters?: Array<{ left: string; right: string; display: boolean }>;
  }

  export function BlockMath(props: BlockMathProps): React.ReactElement;
  export function InlineMath(props: BlockMathProps): React.ReactElement;
  const _default: {
    BlockMath: typeof BlockMath;
    InlineMath: typeof InlineMath;
  };
  export default _default;
}
