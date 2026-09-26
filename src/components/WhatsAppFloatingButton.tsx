'use client';

import { openWhatsApp } from '@/lib/whatsapp';

export default function WhatsAppFloatingButton({ phone }: { phone: string }) {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = 'Olá! Gostaria de agendar um horário na Barbearia do Alemão.';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Clique simples: abre o WhatsApp numa aba nova e leva esta aba para /obrigado.
    // Ctrl/Cmd/clique do meio seguem o comportamento padrão do navegador (abrir em nova aba).
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      openWhatsApp(phone, message);
    }
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.55)] transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer border border-white/10 group active:scale-95"
      title="Fale Conosco no WhatsApp"
      aria-label="Fale Conosco no WhatsApp"
    >
      {/* Dynamic pulse effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] -z-10 opacity-75 animate-ping group-hover:animate-none duration-1000" />
      
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-6 h-6 fill-current text-white"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.638 1.967 14.16 .943 11.536.943c-5.439 0-9.864 4.373-9.868 9.803-.001 1.73.457 3.417 1.32 4.927l-.995 3.636 3.731-.967zm12.333-7.553c-.321-.16-1.9-.93-2.193-1.037-.293-.108-.507-.16-.721.16-.215.322-.829 1.038-1.015 1.253-.186.215-.372.242-.693.082-1.08-.54-1.868-.992-2.613-1.636-.595-.515-.992-1.127-1.1-1.314-.108-.186-.012-.287.08-.378.084-.08.186-.216.279-.322.096-.108.127-.186.19-.312.062-.125.031-.24-.015-.347-.046-.108-.431-1.027-.591-1.408-.156-.378-.328-.328-.45-.333l-.382-.008c-.275 0-.721.102-.997.4-.276.3-.15 1.15.115 1.737.265.589 1.238 2.063 2.763 2.723.363.157.646.25.867.32.366.115.699.098.963.059.294-.043.931-.38 1.062-.748.132-.369.132-.684.093-.748-.039-.064-.153-.102-.475-.262z" />
      </svg>
    </a>
  );
}
