/**
 * Prova social da Barbearia. Nunca invente depoimentos: só avaliações reais e autorizadas
 * (copiadas do Google Meu Negócio, WhatsApp, ou como o cliente escreveu).
 */

export type Testimonial = {
    name: string;
    role?: string;
    text: string;
    rating?: 1 | 2 | 3 | 4 | 5;
};

export const testimonials: Testimonial[] = [
    {
        name: 'Carlos Eduardo M.',
        role: 'Cliente Mensal',
        text: 'Frequento a Barbearia do Alemão 777 há mais de 3 anos e o padrão é sempre excepcional. O atendimento é no horário, o café é excelente e o agendamento online é incrivelmente rápido.',
        rating: 5,
    },
];
