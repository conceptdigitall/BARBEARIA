/**
 * Abre o WhatsApp em uma aba nova e leva a aba atual para /obrigado (página de conversão).
 * Usado pelo botão flutuante de WhatsApp, o CTA principal do site.
 */
export function openWhatsApp(phone: string, message: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    window.location.href = '/obrigado';
}
