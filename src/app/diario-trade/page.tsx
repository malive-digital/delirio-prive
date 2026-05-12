"use client";

import { useEffect, useMemo, useState } from "react";

type TradeStatus = "win" | "loss" | "breakeven";
type StudyStatus = "pendente" | "em-andamento" | "concluido";
type TodoStatus = "aberto" | "feito";

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

type TradeEntry = {
  id: string;
  date: string;
  asset: string;
  setup: string;
  direction: "Compra" | "Venda";
  result: string;
  status: TradeStatus;
  emotion: string;
  notes: string;
};

type StudyItem = {
  id: string;
  title: string;
  topic: string;
  status: StudyStatus;
  notes: string;
};

type TodoItem = {
  id: string;
  text: string;
  status: TodoStatus;
};

type TradeJournalData = {
  identity: string;
  checklist: ChecklistItem[];
  trades: TradeEntry[];
  studies: StudyItem[];
  todos: TodoItem[];
};

const STORAGE_KEY = "trade-journal-v1";

const defaultChecklist: ChecklistItem[] = [
  { id: "trend", label: "Tendencia principal confirmada", checked: false },
  { id: "setup", label: "Setup apareceu conforme meu plano", checked: false },
  { id: "risk", label: "Risco por operacao definido", checked: false },
  { id: "stop", label: "Stop e alvo marcados antes da entrada", checked: false },
  { id: "news", label: "Noticias e horario do mercado verificados", checked: false },
  { id: "emotion", label: "Estou calmo e sem operar por impulso", checked: false },
];

const starterData: TradeJournalData = {
  identity:
    "Eu sou um trader disciplinado. Eu sigo meu plano, aceito o risco antes da entrada e protejo meu capital antes de buscar lucro.",
  checklist: defaultChecklist,
  trades: [],
  studies: [
    {
      id: "study-1",
      title: "Revisar meus 3 setups principais",
      topic: "Setup",
      status: "pendente",
      notes: "Separar exemplos de entradas boas e entradas que devo evitar.",
    },
  ],
  todos: [
    { id: "todo-1", text: "Preparar o plano do dia antes do mercado abrir", status: "aberto" },
    { id: "todo-2", text: "Revisar as operacoes no fim do pregão", status: "aberto" },
  ],
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getToday = () => new Date().toISOString().slice(0, 10);

function loadJournalData(): TradeJournalData {
  if (typeof window === "undefined") return starterData;

  const rawData = window.localStorage.getItem(STORAGE_KEY);
  if (!rawData) return starterData;

  try {
    const parsedData = JSON.parse(rawData) as Partial<TradeJournalData>;

    return {
      identity: parsedData.identity || starterData.identity,
      checklist: Array.isArray(parsedData.checklist) ? parsedData.checklist : starterData.checklist,
      trades: Array.isArray(parsedData.trades) ? parsedData.trades : [],
      studies: Array.isArray(parsedData.studies) ? parsedData.studies : starterData.studies,
      todos: Array.isArray(parsedData.todos) ? parsedData.todos : starterData.todos,
    };
  } catch {
    return starterData;
  }
}

export default function TradeJournalPage() {
  const [data, setData] = useState<TradeJournalData>(starterData);
  const [tradeForm, setTradeForm] = useState({
    date: getToday(),
    asset: "",
    setup: "",
    direction: "Compra" as TradeEntry["direction"],
    result: "",
    status: "win" as TradeStatus,
    emotion: "",
    notes: "",
  });
  const [studyForm, setStudyForm] = useState({ title: "", topic: "", notes: "" });
  const [todoText, setTodoText] = useState("");

  useEffect(() => {
    setData(loadJournalData());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const checklistProgress = useMemo(() => {
    const checkedCount = data.checklist.filter((item) => item.checked).length;
    return Math.round((checkedCount / Math.max(data.checklist.length, 1)) * 100);
  }, [data.checklist]);

  const stats = useMemo(() => {
    const wins = data.trades.filter((trade) => trade.status === "win").length;
    const losses = data.trades.filter((trade) => trade.status === "loss").length;
    const breakevens = data.trades.filter((trade) => trade.status === "breakeven").length;
    const completedStudies = data.studies.filter((study) => study.status === "concluido").length;
    const doneTodos = data.todos.filter((todo) => todo.status === "feito").length;
    const winRate = data.trades.length ? Math.round((wins / data.trades.length) * 100) : 0;

    return { wins, losses, breakevens, winRate, completedStudies, doneTodos };
  }, [data.trades, data.studies, data.todos]);

  const updateChecklist = (id: string) => {
    setData((currentData) => ({
      ...currentData,
      checklist: currentData.checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const resetChecklist = () => {
    setData((currentData) => ({
      ...currentData,
      checklist: currentData.checklist.map((item) => ({ ...item, checked: false })),
    }));
  };

  const addTrade = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tradeForm.asset.trim() || !tradeForm.setup.trim()) return;

    const trade: TradeEntry = {
      id: createId(),
      ...tradeForm,
      asset: tradeForm.asset.trim(),
      setup: tradeForm.setup.trim(),
      emotion: tradeForm.emotion.trim(),
      notes: tradeForm.notes.trim(),
    };

    setData((currentData) => ({ ...currentData, trades: [trade, ...currentData.trades] }));
    setTradeForm({
      date: getToday(),
      asset: "",
      setup: "",
      direction: "Compra",
      result: "",
      status: "win",
      emotion: "",
      notes: "",
    });
  };

  const addStudy = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studyForm.title.trim()) return;

    const study: StudyItem = {
      id: createId(),
      title: studyForm.title.trim(),
      topic: studyForm.topic.trim() || "Geral",
      status: "pendente",
      notes: studyForm.notes.trim(),
    };

    setData((currentData) => ({ ...currentData, studies: [study, ...currentData.studies] }));
    setStudyForm({ title: "", topic: "", notes: "" });
  };

  const addTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!todoText.trim()) return;

    const todo: TodoItem = { id: createId(), text: todoText.trim(), status: "aberto" };
    setData((currentData) => ({ ...currentData, todos: [todo, ...currentData.todos] }));
    setTodoText("");
  };

  const removeTrade = (id: string) => {
    setData((currentData) => ({
      ...currentData,
      trades: currentData.trades.filter((trade) => trade.id !== id),
    }));
  };

  const cycleStudyStatus = (id: string) => {
    const nextStatus: Record<StudyStatus, StudyStatus> = {
      pendente: "em-andamento",
      "em-andamento": "concluido",
      concluido: "pendente",
    };

    setData((currentData) => ({
      ...currentData,
      studies: currentData.studies.map((study) =>
        study.id === id ? { ...study, status: nextStatus[study.status] } : study
      ),
    }));
  };

  const toggleTodo = (id: string) => {
    setData((currentData) => ({
      ...currentData,
      todos: currentData.todos.map((todo) =>
        todo.id === id ? { ...todo, status: todo.status === "feito" ? "aberto" : "feito" } : todo
      ),
    }));
  };

  return (
    <main className="trade-journal-page">
      <section className="trade-hero" aria-labelledby="trade-title">
        <div>
          <p className="eyebrow">Diario de trade</p>
          <h1 id="trade-title">Painel diario para operar com clareza</h1>
          <p>
            Checklist antes da entrada, registro das operacoes, estudos, identidade do trader e tarefas do dia em um
            painel simples.
          </p>
        </div>
        <div className="trade-hero__score" aria-label="Checklist completo">
          <strong>{checklistProgress}%</strong>
          <span>checklist pronto</span>
        </div>
      </section>

      <section className="trade-metrics" aria-label="Resumo do diario">
        <article>
          <span>Operacoes</span>
          <strong>{data.trades.length}</strong>
        </article>
        <article>
          <span>Taxa de acerto</span>
          <strong>{stats.winRate}%</strong>
        </article>
        <article>
          <span>Wins / Losses / 0x0</span>
          <strong>
            {stats.wins}/{stats.losses}/{stats.breakevens}
          </strong>
        </article>
        <article>
          <span>Estudos concluidos</span>
          <strong>{stats.completedStudies}</strong>
        </article>
        <article>
          <span>Tarefas feitas</span>
          <strong>
            {stats.doneTodos}/{data.todos.length}
          </strong>
        </article>
      </section>

      <div className="trade-grid">
        <section className="trade-panel trade-panel--identity" aria-labelledby="identity-title">
          <div className="trade-panel__header">
            <div>
              <p className="eyebrow">Eu sou</p>
              <h2 id="identity-title">Minha identidade no mercado</h2>
            </div>
          </div>
          <textarea
            value={data.identity}
            onChange={(event) => setData((currentData) => ({ ...currentData, identity: event.target.value }))}
            rows={6}
            aria-label="Texto eu sou"
          />
        </section>

        <section className="trade-panel" aria-labelledby="checklist-title">
          <div className="trade-panel__header">
            <div>
              <p className="eyebrow">Antes da operacao</p>
              <h2 id="checklist-title">Checklist de verificacoes</h2>
            </div>
            <button className="trade-icon-button" type="button" onClick={resetChecklist} title="Limpar checklist">
              Limpar
            </button>
          </div>
          <div className="trade-checklist">
            {data.checklist.map((item) => (
              <label key={item.id} className={item.checked ? "is-checked" : ""}>
                <input checked={item.checked} type="checkbox" onChange={() => updateChecklist(item.id)} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="trade-panel trade-panel--wide" aria-labelledby="entry-title">
          <div className="trade-panel__header">
            <div>
              <p className="eyebrow">Registro</p>
              <h2 id="entry-title">Nova operacao</h2>
            </div>
          </div>
          <form className="trade-form" onSubmit={addTrade}>
            <label>
              Data
              <input
                type="date"
                value={tradeForm.date}
                onChange={(event) => setTradeForm({ ...tradeForm, date: event.target.value })}
              />
            </label>
            <label>
              Ativo
              <input
                placeholder="WIN, WDO, PETR4..."
                value={tradeForm.asset}
                onChange={(event) => setTradeForm({ ...tradeForm, asset: event.target.value })}
              />
            </label>
            <label>
              Setup
              <input
                placeholder="Rompimento, pullback..."
                value={tradeForm.setup}
                onChange={(event) => setTradeForm({ ...tradeForm, setup: event.target.value })}
              />
            </label>
            <label>
              Direcao
              <select
                value={tradeForm.direction}
                onChange={(event) =>
                  setTradeForm({ ...tradeForm, direction: event.target.value as TradeEntry["direction"] })
                }
              >
                <option>Compra</option>
                <option>Venda</option>
              </select>
            </label>
            <label>
              Resultado
              <input
                placeholder="Ex: +R$ 120 ou -35 pts"
                value={tradeForm.result}
                onChange={(event) => setTradeForm({ ...tradeForm, result: event.target.value })}
              />
            </label>
            <label>
              Status
              <select
                value={tradeForm.status}
                onChange={(event) => setTradeForm({ ...tradeForm, status: event.target.value as TradeStatus })}
              >
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="breakeven">0x0</option>
              </select>
            </label>
            <label>
              Emocional
              <input
                placeholder="Calmo, ansioso, confiante..."
                value={tradeForm.emotion}
                onChange={(event) => setTradeForm({ ...tradeForm, emotion: event.target.value })}
              />
            </label>
            <label className="trade-form__full">
              Observacoes
              <textarea
                rows={4}
                placeholder="O que vi, por que entrei, o que posso melhorar..."
                value={tradeForm.notes}
                onChange={(event) => setTradeForm({ ...tradeForm, notes: event.target.value })}
              />
            </label>
            <button className="button button--primary" type="submit">
              Salvar operacao
            </button>
          </form>
        </section>

        <section className="trade-panel trade-panel--wide" aria-labelledby="history-title">
          <div className="trade-panel__header">
            <div>
              <p className="eyebrow">Historico</p>
              <h2 id="history-title">Operacoes registradas</h2>
            </div>
          </div>
          <div className="trade-list">
            {data.trades.length === 0 ? (
              <p className="trade-empty">Nenhuma operacao salva ainda.</p>
            ) : (
              data.trades.map((trade) => (
                <article key={trade.id} className={`trade-entry trade-entry--${trade.status}`}>
                  <div>
                    <strong>
                      {trade.asset} · {trade.direction}
                    </strong>
                    <span>
                      {trade.date} · {trade.setup}
                    </span>
                  </div>
                  <div>
                    <span className="trade-badge">{trade.status}</span>
                    <strong>{trade.result || "Sem valor"}</strong>
                  </div>
                  {(trade.emotion || trade.notes) && (
                    <p>
                      {trade.emotion && <b>{trade.emotion}: </b>}
                      {trade.notes}
                    </p>
                  )}
                  <button type="button" onClick={() => removeTrade(trade.id)}>
                    Remover
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="trade-panel" aria-labelledby="study-title">
          <div className="trade-panel__header">
            <div>
              <p className="eyebrow">Evolucao</p>
              <h2 id="study-title">Estudos</h2>
            </div>
          </div>
          <form className="trade-stack-form" onSubmit={addStudy}>
            <input
              placeholder="Estudo ou aula"
              value={studyForm.title}
              onChange={(event) => setStudyForm({ ...studyForm, title: event.target.value })}
            />
            <input
              placeholder="Topico"
              value={studyForm.topic}
              onChange={(event) => setStudyForm({ ...studyForm, topic: event.target.value })}
            />
            <textarea
              rows={3}
              placeholder="Anotacoes principais"
              value={studyForm.notes}
              onChange={(event) => setStudyForm({ ...studyForm, notes: event.target.value })}
            />
            <button className="button button--ghost" type="submit">
              Adicionar estudo
            </button>
          </form>
          <div className="trade-compact-list">
            {data.studies.map((study) => (
              <article key={study.id}>
                <button type="button" onClick={() => cycleStudyStatus(study.id)}>
                  {study.status}
                </button>
                <div>
                  <strong>{study.title}</strong>
                  <span>{study.topic}</span>
                  {study.notes && <p>{study.notes}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="trade-panel" aria-labelledby="todo-title">
          <div className="trade-panel__header">
            <div>
              <p className="eyebrow">Execucao</p>
              <h2 id="todo-title">To do list</h2>
            </div>
          </div>
          <form className="trade-inline-form" onSubmit={addTodo}>
            <input
              placeholder="Nova tarefa"
              value={todoText}
              onChange={(event) => setTodoText(event.target.value)}
            />
            <button className="button button--ghost" type="submit">
              Adicionar
            </button>
          </form>
          <div className="trade-todo-list">
            {data.todos.map((todo) => (
              <label key={todo.id} className={todo.status === "feito" ? "is-done" : ""}>
                <input checked={todo.status === "feito"} type="checkbox" onChange={() => toggleTodo(todo.id)} />
                <span>{todo.text}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
