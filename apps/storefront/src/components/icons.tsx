// Inline SVG icons (no icon-library dependency in the storefront bundle).
type IconProps = React.SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path d="M12 15V4" strokeLinecap="round" />
      <path d="m8 7 4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.25.69-1.45 1.32-1.99 1.36-.53.04-1.02.23-3.45-.72-2.91-1.15-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.97 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.25.6.84 2.07.91 2.22.07.14.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.37-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.69-.81.88-1.08.18-.28.37-.23.62-.14.25.09 1.6.76 1.87.9.28.14.46.21.53.32.07.12.07.66-.18 1.35Z" />
    </svg>
  );
}

/**
 * Amazon "a + smile" mark (official Icon variant, trimmed to the on-canvas paths).
 * Two-tone by design — white letterform + orange smile — so the brand cue reads on the
 * dark primary button. Fills are fixed (not currentColor) to preserve the trademark colours.
 */
export function AmazonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fillRule="evenodd" aria-hidden="true" {...props}>
      <path
        fill="#FF9900"
        d="M28.312 28.26C25.003 30.7 20.208 32 16.08 32c-5.8 0-11.002-2.14-14.945-5.703-.3-.28-.032-.662.34-.444C5.73 28.33 11 29.82 16.426 29.82a29.73 29.73 0 0 0 11.406-2.332c.56-.238 1.03.367.48.773m1.376-1.575c-.42-.54-2.796-.255-3.86-.13-.325.04-.374-.243-.082-.446 1.9-1.33 4.994-.947 5.356-.5s-.094 3.56-1.87 5.044c-.273.228-.533.107-.4-.196.4-.996 1.294-3.23.87-3.772"
      />
      <path
        fill="#FFFFFF"
        d="M18.43 13.864c0 1.692.043 3.103-.812 4.605-.7 1.22-1.8 1.973-3.005 1.973-1.667 0-2.644-1.27-2.644-3.145 0-3.7 3.316-4.373 6.462-4.373v.94m4.38 10.584c-.287.257-.702.275-1.026.104-1.44-1.197-1.704-1.753-2.492-2.895-2.382 2.43-4.074 3.157-7.158 3.157-3.658 0-6.498-2.254-6.498-6.767 0-3.524 1.905-5.924 4.63-7.097 2.357-1.038 5.65-1.22 8.165-1.5V8.9c0-1.032.08-2.254-.53-3.145-.525-.8-1.54-1.13-2.437-1.13-1.655 0-3.127.85-3.487 2.608-.073.4-.36.776-.757.794L7 7.555c-.354-.08-.75-.366-.647-.9C7.328 1.54 11.945 0 16.074 0c2.113 0 4.874.562 6.54 2.162 2.113 1.973 1.912 4.605 1.912 7.47V16.4c0 2.034.843 2.925 1.637 4.025.275.4.336.86-.018 1.154a184.26 184.26 0 0 0-3.328 2.883l-.006-.012"
      />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

export function ReturnIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M4 9h11a5 5 0 0 1 0 10H9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m7 6-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" strokeLinejoin="round" />
      <path d="m9 11.5 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
