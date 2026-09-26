import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const SECRET_KEYS = ['accessToken', 'apiKey', 'appSecret', 'token', 'secret'];
const MASK = '••••••••••••••••';

/** Nunca devolve chaves/tokens reais para o navegador. */
function maskSecrets<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const out: Record<string, unknown> = Array.isArray(obj) ? ([...obj] as unknown as Record<string, unknown>) : { ...(obj as Record<string, unknown>) };
  for (const [k, v] of Object.entries(out)) {
    if (SECRET_KEYS.includes(k) && typeof v === 'string' && v) out[k] = MASK;
    else if (v && typeof v === 'object') out[k] = maskSecrets(v);
  }
  return out as T;
}

/** Se o painel mandar de volta o valor mascarado, mantém o segredo que já estava salvo. */
function keepMaskedSecrets(incoming: any, current: any): any {
  if (!incoming || typeof incoming !== 'object') return incoming;
  const out: any = Array.isArray(incoming) ? [...incoming] : { ...incoming };
  for (const [k, v] of Object.entries(out)) {
    if (SECRET_KEYS.includes(k) && typeof v === 'string' && v.includes('•')) out[k] = current?.[k] ?? '';
    else if (v && typeof v === 'object') out[k] = keepMaskedSecrets(v, current?.[k]);
  }
  return out;
}

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
    }

    const config = maskSecrets((tenant.themeConfig as Record<string, any>) || {});

    return NextResponse.json({
      success: true,
      whatsappConfig: config.whatsappConfig || {
        type: 'meta',
        status: 'connected',
        phoneNumberId: '109283746591028',
        wabaId: '987654321098765',
        accessToken: '••••••••••••••••••••••••••••••••',
        webhookVerifyToken: 'barbearia_alemao_777_verify_token',
        phone: '+55 (13) 97424-9209',
        connectedAt: new Date().toISOString(),
      },
      aiConfig: config.aiConfig || {
        enabled: true,
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: '••••••••••••••••',
        autoReply: true,
        maxMessagesPerConversation: 3,
        systemPrompt:
          'Você é o assistente virtual oficial da Barbearia do Alemão 777 em Cubatão/SP. Atenda os clientes de forma descontraída, ágil e educada. Ajude com dúvidas sobre preços (Corte R$ 40, Barba R$ 35, Combo Completo R$ 90), horários disponíveis (Seg a Sáb 09h às 19h) e localização (Rua Espanha, 360 - Jd. Casqueiro). Se o cliente desejar falar com o barbeiro ou agendar um horário personalizado, ofereça o link do site ou transfira para o Kawe.',
        knowledge: [
          {
            id: '1',
            title: 'Tabela de Serviços e Preços',
            content:
              'Corte: R$ 40,00 | Barba com toalha quente: R$ 35,00 | Combo Completo (Corte + Barba + Sobrancelha): R$ 90,00 | Sobrancelha na navalha: R$ 20,00 | Pezinho: R$ 15,00. Pagamentos: Pix, Dinheiro, Cartões de Débito e Crédito.',
          },
          {
            id: '2',
            title: 'Horário de Funcionamento & Localização',
            content:
              'Segunda a Sábado, das 09:00 às 19:00. Endereço: Rua Espanha, 360 - Jardim Casqueiro, Cubatão/SP. Barbeiro: Kawe (Alemão).',
          },
          {
            id: '3',
            title: 'Regras de Agendamento',
            content:
              'Tolerância de atraso: 10 minutos. Cancelamentos ou reagendamentos devem ser avisados com pelo menos 1h de antecedência.',
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/crm-config:', error);
    return NextResponse.json({ error: 'Erro ao carregar configurações' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { whatsappConfig, aiConfig } = body;

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
    }

    const currentThemeConfig = (tenant.themeConfig as Record<string, any>) || {};
    const updatedThemeConfig = {
      ...currentThemeConfig,
      ...(whatsappConfig ? { whatsappConfig: keepMaskedSecrets(whatsappConfig, currentThemeConfig.whatsappConfig) } : {}),
      ...(aiConfig ? { aiConfig: keepMaskedSecrets(aiConfig, currentThemeConfig.aiConfig) } : {}),
    };

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        themeConfig: updatedThemeConfig,
      },
    });

    return NextResponse.json({
      success: true,
      tenant: { ...updatedTenant, themeConfig: maskSecrets(updatedTenant.themeConfig) },
      message: 'Configurações do CRM salvas com sucesso',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/crm-config:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações do CRM' }, { status: 500 });
  }
}
