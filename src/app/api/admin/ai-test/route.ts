import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, message } = await request.json();
    const query = (message || '').toLowerCase();

    let reply = '';

    if (query.includes('preço') || query.includes('quanto') || query.includes('valor') || query.includes('corte') || query.includes('barba') || query.includes('combo')) {
      reply =
        'Opa, tudo certo, meu irmão? Nossos valores aqui na Barbearia do Alemão 777 são:\n\n✂️ Corte: R$ 40,00\n🧔 Barboterapia (toalha quente): R$ 35,00\n🔥 Combo Corte + Barba: R$ 75,00\n👑 Combo Completo (Corte + Barba + Sobrancelha): R$ 90,00\n✨ Sobrancelha navalhada: R$ 20,00\n\nBora garantir seu horário hoje ou prefere marcar para o final de semana?';
    } else if (query.includes('horario') || query.includes('horário') || query.includes('abre') || query.includes('funciona') || query.includes('sabado') || query.includes('sábado')) {
      reply =
        'Estamos atendendo de Segunda a Sábado, das 09:00 às 19:00! Barbeiros Alemão e Johann na ativa. Qual horário fica melhor para você dar aquele tapa no visual?';
    } else if (query.includes('onde') || query.includes('endereço') || query.includes('endereco') || query.includes('local') || query.includes('fica')) {
      reply =
        'Estamos localizados na Rua Espanha, 360 - Jardim Casqueiro, Cubatão/SP! Bem fácil de chegar e com estacionamento tranquilo na frente.';
    } else {
      reply =
        `Fala parceiro! Aqui é o assistente virtual da Barbearia do Alemão 777. Posso te ajudar a agendar um horário com o Alemão ou com o Johann, conferir a tabela de preços ou tirar qualquer dúvida. Como posso te ajudar hoje?`;
    }

    return NextResponse.json({
      success: true,
      reply,
      tokensUsed: 42,
      latencyMs: 310,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar mensagem do agente de IA' }, { status: 500 });
  }
}
