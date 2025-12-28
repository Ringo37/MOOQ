import { Tooltip } from "@mantine/core";
import { forwardRef } from "react";
import { Link, type LinkProps } from "react-router";

type PaginationLinkProps = LinkProps & {
  disabled?: boolean;
  label?: string;
};

export const PaginationLink = forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>(function PaginationLink({ disabled, label, children, ...props }, ref) {
  if (disabled) {
    return (
      <span style={{ pointerEvents: "none", opacity: 0.5 }}>{children}</span>
    );
  }

  const link = (
    <Link ref={ref} {...props}>
      {children}
    </Link>
  );

  return label ? (
    <Tooltip label={label} withArrow style={{ zIndex: 400 }}>
      <span>{link}</span>
    </Tooltip>
  ) : (
    link
  );
});
