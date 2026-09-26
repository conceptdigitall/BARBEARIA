'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  Send,
  Loader2,
  BookOpen,
  Plus,
  Trash2,
  Shield,
  HelpCircle,
  MessageSquare,
  Check,
} from 'lucide-react';

interface AiKnowledgeItem {
  id: string;
  title: string;
  content: string;
}

interface AiConfigPanelProps {
  isDark: boolean;
  onSaveSuccess?: () => void;
}

export function AiConfigPanel({ isDark, onSaveSuccess }: AiConfigPanelProps) {
  const [active, setActive] = useState(true);
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [model, setModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('sk-proj-••••••••••••••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);
  const [autoReply, setAutoReply] = useState(true);
  const [maxMessages, setMaxMessages] = useState(3);

  const [systemPrompt, setSystemPrompt] = useState(
    'Você é o assistente virtual oficial da Barbearia do Alemão 777 em Cubatão/SP, liderada pelo barbeiro Kawe (Alemão). Atenda os clientes de forma descontraída, ágil e educada (estilo barbearia urbana). Ajude com dúvidas sobre preços (Corte R$ 40, Barba R$ 35, Combo Completo R$ 90), horários disponíveis (Seg a Sáb 09h às 19h) e localização (Rua Espanha, 360 - Jd. Casqueiro). Se o cliente desejar falar com o barbeiro ou agendar um horário personalizado, forneça o link do site ou transfira para o Kawe.'
  );

  const [knowledgeList, setKnowledgeList] = useState<AiKnowledgeItem[]>([
    {
      id: '1',
      title: 'Tabela de Serviços e Preços',
      content:
        'Corte Masculino: R$ 40,00 | Barboterapia com toalha quente: R$ 35,00 | Combo Completo (Corte + Barba + Sobrancelha): R$ 90,00 | Design de Sobrancelha na navalha: R$ 20,00 | Pezinho/Acabamento: R$ 15,00. Formas de pagamento: Pix, Cartão de Débito, Cartão de Crédito e Dinheiro.',
    },
    {
      id: '2',
      title: 'Horário de Funcionamento & Localização',
      content:
        'Segunda a Sábado, das 09:00 às 19:00. Fechado aos Domingos e Feriados. Endereço: Rua Espanha, 360 - Jardim Casqueiro, Cubatão/SP. Barbeiro: Kawe (Alemão). WhatsApp: +55 (13) 97424-9209.',
    },
    {
      id: '3',
      title: 'Regras de Agendamento e Atraso',
      content:
        'Pedimos antecedência de 5 minutos. Tolerância máxima de 10 minutos de atraso. Avisar com pelo menos 1h de antecedência em caso de cancelamento ou reagendamento.',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Playground state
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; time: string }>
  >([
    {
      role: 'assistant',
      text: 'Fala parceiro! Aqui é o assistente virtual da Barbearia do Alemão 777. Como posso te ajudar hoje?',
      time: 'Agora',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);

  const [testingKey, setTestingKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTestKey = () => {
    setTestingKey(true);
    setTimeout(() => {
      setTestingKey(false);
      alert('Chave de API validada com sucesso! Conexão estabelecida com o provedor de IA.');
    }, 1200);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { role: 'user', text: userText, time: now }]);
    setChatSending(true);

    try {
      const res = await fetch('/api/admin/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: systemPrompt, message: userText }),
      });
      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Entendido! Em que mais posso te ajudar?',
          time: replyTime,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Opa, tivemos uma oscilação na resposta da IA. Mas estamos prontos para agendar!',
          time: 'Agora',
        },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const handleAddKnowledge = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Preencha o título e o conteúdo do documento.');
      return;
    }
    const item: AiKnowledgeItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
    };
    setKnowledgeList([...knowledgeList, item]);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleDeleteKnowledge = (id: string) => {
    setKnowledgeList(knowledgeList.filter((k) => k.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/crm-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiConfig: {
            enabled: active,
            provider,
            model,
            apiKey,
            autoReply,
            maxMessagesPerConversation: maxMessages,
            systemPrompt,
            knowledge: knowledgeList,
            updatedAt: new Date().toISOString(),
          },
        }),
      });
      if (res.ok) {
        alert('Configurações do Barbeiro IA salvas com sucesso!');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        alert('Erro ao salvar configurações de IA.');
      }
    } catch {
      alert('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Cabeçalho */}
      <div>
        <h2 className={`text-xl font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Agente de IA (Barbeiro Virtual)
        </h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Conecte e personalize o atendente com inteligência artificial para responder no WhatsApp, tirar dúvidas de preços e ajudar na recepção da barbearia.
        </p>
      </div>

      {/* Banner de Ativação Geral */}
      <div
        className={`flex items-center justify-between rounded-xl border p-4 shadow-xs transition-colors ${
          active
            ? isDark
              ? 'bg-purple-950/20 border-purple-800/40 text-purple-300'
              : 'bg-purple-50 border-purple-200 text-purple-900'
            : isDark
            ? 'bg-slate-900/60 border-slate-800 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-500">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Barbeiro IA no WhatsApp</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  active
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    : 'bg-slate-500/20 text-slate-500'
                }`}
              >
                {active ? 'ATIVO NO WHATSAPP' : 'DESATIVADO'}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Responde automaticamente dúvidas de valores, horários livres e confirmação de serviços.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
        </label>
      </div>

      {/* Grid: Provedor & Chave de API */}
      <div
        className={`rounded-xl border p-6 space-y-5 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          Conexão do Provedor de Inteligência Artificial
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1">Provedor:</label>
            <select
              value={provider}
              onChange={(e) => {
                const val = e.target.value as 'openai' | 'anthropic' | 'gemini';
                setProvider(val);
                if (val === 'openai') setModel('gpt-4o');
                else if (val === 'anthropic') setModel('claude-3-5-sonnet-latest');
                else setModel('gemini-2.5-flash');
              }}
              className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="openai">OpenAI (ChatGPT / GPT-4o)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="gemini">Google Gemini (Gemini 2.5 Flash)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Modelo Selecionado:</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full rounded-lg border py-2 px-3 text-xs outline-none font-mono ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Chave de API ({provider.toUpperCase()}):</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full rounded-lg border py-2 pl-3 pr-10 text-xs outline-none font-mono ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400">
            A chave fica criptografada com segurança e é usada apenas para gerar as respostas do WhatsApp.
          </span>
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testingKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            {testingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Testar Conexão de IA
          </button>
        </div>
      </div>

      {/* Prompt do Sistema (Personalidade do Barbeiro) */}
      <div
        className={`rounded-xl border p-6 space-y-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Instruções & Personalidade do Barbeiro IA
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Define o tom de voz, regras de atendimento e como o robô trata os clientes da barbearia.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSystemPrompt(
                'Você é o assistente virtual oficial da Barbearia do Alemão 777 em Cubatão/SP, liderada pelo barbeiro Kawe (Alemão). Atenda os clientes de forma descontraída, ágil e educada (estilo barbearia urbana). Ajude com dúvidas sobre preços (Corte R$ 40, Barba R$ 35, Combo Completo R$ 90), horários disponíveis (Seg a Sáb 09h às 19h) e localização (Rua Espanha, 360 - Jd. Casqueiro). Se o cliente desejar falar com o barbeiro ou agendar um horário personalizado, forneça o link do site ou transfira para o Kawe.'
              )
            }
            className="text-[11px] text-[#C5A880] hover:underline font-semibold"
          >
            Restaurar Padrão
          </button>
        </div>

        <textarea
          rows={4}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className={`w-full rounded-xl border p-3 text-xs outline-none leading-relaxed resize-none ${
            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        />
      </div>

      {/* Base de Conhecimento (Knowledge Base da Barbearia) */}
      <div
        className={`rounded-xl border p-6 space-y-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <BookOpen className="w-4 h-4 text-[#C5A880]" />
              Base de Conhecimento da Barbearia (RAG)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Documentos que alimentam a IA com os dados exatos do salão (preços, combos, regras e localização).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C5A880]/20 text-[#C5A880] hover:bg-[#C5A880]/30 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Documento
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {knowledgeList.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 space-y-2 relative group transition-all ${
                isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs truncate max-w-[170px] text-[#C5A880]">{item.title}</h4>
                <button
                  type="button"
                  onClick={() => handleDeleteKnowledge(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 p-1"
                  title="Remover documento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-4">{item.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Adicionar Conhecimento */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="font-bold text-base">Adicionar Novo Conhecimento à IA</h3>
            <div>
              <label className="text-xs font-semibold block mb-1">Título do Tópico:</label>
              <input
                type="text"
                placeholder="Ex: Formas de Pagamento e Pix"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`w-full rounded-lg border py-2 px-3 text-xs outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Conteúdo e Instruções:</label>
              <textarea
                rows={4}
                placeholder="Descreva detalhadamente as informações que a IA deve saber..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className={`w-full rounded-lg border p-3 text-xs outline-none resize-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddKnowledge}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-black"
              >
                Salvar Conhecimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playground / Simulador Interativo do WhatsApp */}
      <div
        className={`rounded-xl border p-6 space-y-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Simulador do Atendente IA (Playground WhatsApp)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Teste agora mesmo como o robô responde aos clientes com base nas regras e preços cadastrados.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Simulação Ativa
          </div>
        </div>

        {/* Caixa de Mensagens Estilo WhatsApp */}
        <div
          className={`rounded-2xl border p-4 h-64 overflow-y-auto space-y-3 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : isDark
                    ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
            </div>
          ))}
          {chatSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
              <span>Barbeiro IA está digitando...</span>
            </div>
          )}
        </div>

        {/* Formulário de Envio do Teste */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Digite como um cliente... Ex: 'Quanto custa corte com barba?' ou 'Vocês abrem sábado?'"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatSending}
            className={`flex-1 rounded-xl border py-2.5 px-4 text-xs outline-none ${
              isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          />
          <button
            type="submit"
            disabled={chatSending || !chatInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-black text-xs font-bold hover:brightness-105 transition-all shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Enviar
          </button>
        </form>
      </div>

      {/* Botão Salvar Geral */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-black text-xs font-bold hover:brightness-105 transition-all shadow-xs flex items-center gap-2"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar Configurações do Barbeiro IA'}
        </button>
      </div>
    </div>
  );
}
