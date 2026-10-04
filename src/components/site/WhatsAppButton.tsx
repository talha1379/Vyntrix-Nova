export const WHATSAPP_URL =
  "https://wa.me/923444256330?text=Hello%20VyntrixNova%2C%20I%20would%20like%20to%20discuss%20a%20project%20with%20your%20team.";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-18px_rgba(37,211,102,0.9)] transition-[transform,box-shadow,opacity] duration-(--motion-standard) ease-(--ease-standard) hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-18px_rgba(37,211,102,0.95)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 fill-current">
        <path d="M16 3.2a12.8 12.8 0 0 0-10.9 19.5L3.3 28.8l6.3-1.7A12.8 12.8 0 1 0 16 3.2Zm0 23.2c-2 0-4-.5-5.7-1.6l-.4-.2-3.7 1 1-3.6-.2-.4A10.4 10.4 0 1 1 16 26.4Zm5.7-7.8c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.7.1-.2.1-.4 0-.6-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.7.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    </a>
  );
}
