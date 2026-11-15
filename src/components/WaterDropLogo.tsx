export function WaterDropLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18 3C18 3 7.5 14.2 7.5 21.75C7.5 27.687 12.201 32.5 18 32.5C23.799 32.5 28.5 27.687 28.5 21.75C28.5 14.2 18 3 18 3Z"
        fill="#0284C7"
      />
      <path
        d="M18 5.4C18 5.4 26.2 14.9 26.2 21.75C26.2 26.38 22.52 30.15 18 30.15C16.25 30.15 14.63 29.58 13.3 28.61C15.95 29.15 19.05 28.25 21.05 25.85C23.15 23.33 23.4 18.85 18 11.2V5.4Z"
        fill="#0F172A"
        fillOpacity="0.22"
      />
      <path
        d="M13.2 21.5C13.2 18.8 14.85 15.65 16.4 13.5"
        stroke="#E0F2FE"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
