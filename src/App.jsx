import { useMemo, useState } from "react";
import "./index.css";

const LEVELS = [
  {
    id: 1,
    name: "Nivel 1",
    range: "0 - 299 pts",
    min: 0,
    max: 299,
    description: "Nivel de entrada al programa.",
  },
  {
    id: 2,
    name: "Nivel 2",
    range: "300 - 899 pts",
    min: 300,
    max: 899,
    description: "Acceso a mejores recompensas y beneficios diferenciales.",
  },
  {
    id: 3,
    name: "Nivel 3",
    range: "900 - 1999 pts",
    min: 900,
    max: 1999,
    description:
      "Máximo nivel de beneficios, experiencias y condiciones preferenciales.",
  },
];

const MONEY_STEP_AHORRO = 100000;
const MONEY_STEP_CONSUMO = 10000;
const AHORRO_DAILY_CAP = 80;
const DIAS_HABILES_CAP = 25;
const MANTENER_CAP = 500;

const REWARDS_URL = "https://www.macro.com.ar/cadapasocuenta";

const formatNumber = (value) =>
  new Intl.NumberFormat("es-AR").format(Math.max(0, Number(value) || 0));

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Number(value) || 0));

const formatInputAmount = (value) => {
  const cleanValue = String(value || "").replace(/\D/g, "");
  if (!cleanValue) return "";
  return new Intl.NumberFormat("es-AR").format(Number(cleanValue));
};

const parseAmount = (value) => {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
};

const clampCount = (value) => {
  const parsedValue = Number(value) || 0;
  return Math.min(Math.max(parsedValue, 0), 5);
};

const clampBusinessDays = (value) => {
  const parsedValue = Number(value) || 0;
  return Math.min(Math.max(parsedValue, 0), DIAS_HABILES_CAP);
};

const normalizeProductCount = (value) => {
  const cleanValue = String(value || "").replace(/\D/g, "");
  if (cleanValue === "") return "";
  return String(Math.min(Number(cleanValue), 5));
};

const normalizeBusinessDays = (value) => {
  const cleanValue = String(value || "").replace(/\D/g, "");
  if (cleanValue === "") return "";
  return String(Math.min(Number(cleanValue), DIAS_HABILES_CAP));
};

function App() {
  const [mantener, setMantener] = useState({
    clienteSelecta: true,
    sueldo: false,
    prestamos: 0,
    debitos: 0,
    seguros: 0,
  });

  const [solicitar, setSolicitar] = useState({
    altaSueldo: false,
    altaTarjeta: false,
    seguroHogar: false,
  });

  const [ahorroPesificado, setAhorroPesificado] = useState("");
  const [diasHabilesAhorro, setDiasHabilesAhorro] = useState("");
  const [consumoMensual, setConsumoMensual] = useState("");

  const ahorroNumber = parseAmount(ahorroPesificado);
  const diasHabilesNumber = clampBusinessDays(diasHabilesAhorro);
  const consumoNumber = parseAmount(consumoMensual);

  const puntosMantener = useMemo(() => {
    const clienteSelecta = mantener.clienteSelecta ? 25 : 0;
    const sueldo = mantener.sueldo ? 100 : 0;
    const prestamos = clampCount(mantener.prestamos) * 25;
    const debitos = clampCount(mantener.debitos) * 25;
    const seguros = clampCount(mantener.seguros) * 25;

    return Math.min(
      clienteSelecta + sueldo + prestamos + debitos + seguros,
      MANTENER_CAP
    );
  }, [mantener]);

  const puntosSolicitar = useMemo(() => {
    return (
      (solicitar.altaSueldo ? 200 : 0) +
      (solicitar.altaTarjeta ? 50 : 0) +
      (solicitar.seguroHogar ? 100 : 0)
    );
  }, [solicitar]);

  const puntosAhorroDiarios = useMemo(() => {
    const puntos = Math.floor(ahorroNumber / MONEY_STEP_AHORRO);
    return Math.min(puntos, AHORRO_DAILY_CAP);
  }, [ahorroNumber]);

  const puntosAhorro = useMemo(() => {
    return puntosAhorroDiarios * diasHabilesNumber;
  }, [puntosAhorroDiarios, diasHabilesNumber]);

  const puntosConsumo = useMemo(() => {
    return Math.floor(consumoNumber / MONEY_STEP_CONSUMO);
  }, [consumoNumber]);

  const totalPuntos =
    puntosMantener + puntosSolicitar + puntosAhorro + puntosConsumo;

  const nivelActual = useMemo(() => {
    if (totalPuntos >= 900) return LEVELS[2];
    if (totalPuntos >= 300) return LEVELS[1];
    return LEVELS[0];
  }, [totalPuntos]);

  const proximoNivel = useMemo(() => {
    if (totalPuntos < 300) return LEVELS[1];
    if (totalPuntos < 900) return LEVELS[2];
    return null;
  }, [totalPuntos]);

  const puntosFaltantes = proximoNivel ? proximoNivel.min - totalPuntos : 0;
  const progresoNivel3 = Math.min((totalPuntos / 900) * 100, 100);
  const mantenerCompletado = puntosMantener >= MANTENER_CAP;
  const ahorroCompletado =
    puntosAhorroDiarios >= AHORRO_DAILY_CAP &&
    diasHabilesNumber >= DIAS_HABILES_CAP;

  const pma = useMemo(() => {
    if (!proximoNivel) {
      return {
        meta: "Mantener nivel",
        title: "Sostener la principalidad del cliente",
        points: 0,
        action:
          "El cliente ya alcanzó el máximo nivel. La prioridad comercial es sostener saldos, inversiones, consumos y productos activos para conservar sus recompensas.",
      };
    }

    const candidates = [];

    const addCandidate = (candidate) => {
      if (candidate.points > 0) {
        candidates.push(candidate);
      }
    };

    if (!ahorroCompletado) {
      const puntosDiariosDisponibles = AHORRO_DAILY_CAP - puntosAhorroDiarios;
      const diasDisponibles = DIAS_HABILES_CAP - diasHabilesNumber;

      if (puntosDiariosDisponibles > 0) {
        const puntosAUsar = Math.min(
          puntosFaltantes,
          puntosDiariosDisponibles * Math.max(diasHabilesNumber, 1)
        );

        const puntosDiariosNecesarios = Math.ceil(
          puntosAUsar / Math.max(diasHabilesNumber, 1)
        );

        const montoNecesario = puntosDiariosNecesarios * MONEY_STEP_AHORRO;

        addCandidate({
          meta: "Ahorrar e invertir",
          title: "Potenciar saldo vista o inversiones",
          points: puntosAUsar,
          priority: 1,
          action: `El cliente puede acercarse al próximo nivel incrementando aproximadamente ${formatMoney(
            montoNecesario
          )} de volumen diario en saldo vista, plazo fijo o FCI. Esta meta suma hasta 80 puntos diarios y se multiplica por los días hábiles cargados.`,
        });
      }

      if (ahorroNumber === 0) {
        addCandidate({
          meta: "Ahorrar e invertir",
          title: "Activar el hábito de ahorro e inversión",
          points: Math.min(80, puntosFaltantes),
          priority: 2,
          action:
            "El cliente todavía no registra volumen en ahorro o inversión. Una buena acción comercial es proponerle comenzar con saldo vista, plazo fijo o FCI para sumar puntos diarios durante el mes.",
        });
      }

      if (puntosAhorroDiarios >= AHORRO_DAILY_CAP && diasDisponibles > 0) {
        const puntosPorDiasAdicionales = Math.min(
          puntosFaltantes,
          AHORRO_DAILY_CAP * diasDisponibles
        );

        const diasNecesarios = Math.ceil(
          puntosPorDiasAdicionales / AHORRO_DAILY_CAP
        );

        addCandidate({
          meta: "Ahorrar e invertir",
          title: "Sostener el saldo más días hábiles",
          points: puntosPorDiasAdicionales,
          priority: 1,
          action: `El cliente ya alcanzó el tope diario de 80 puntos. La oportunidad es sostener ese volumen por más días hábiles: con ${diasNecesarios} día/s adicional/es podría sumar hasta ${formatNumber(
            puntosPorDiasAdicionales
          )} puntos más.`,
        });
      }

      if (
        ahorroNumber > 0 &&
        puntosAhorroDiarios < AHORRO_DAILY_CAP &&
        diasHabilesNumber > 0
      ) {
        const puntosSugeridos = Math.min(
          puntosFaltantes,
          (AHORRO_DAILY_CAP - puntosAhorroDiarios) * diasHabilesNumber
        );

        addCandidate({
          meta: "Ahorrar e invertir",
          title: "Maximizar la meta financiera mensual",
          points: puntosSugeridos,
          priority: 2,
          action: `El cliente ya tiene volumen financiero, pero aún puede mejorar su puntaje diario. Si incrementa saldo vista o inversiones, puede sumar hasta ${formatNumber(
            puntosSugeridos
          )} puntos adicionales considerando los días hábiles cargados.`,
        });
      }
    }

    if (!mantener.clienteSelecta) {
      addCandidate({
        meta: "Mantener tus productos",
        title: "Regularizar condición Selecta",
        points: 25,
        priority: 5,
        action:
          "Validar que el cliente cuente con Servicio Macro Selecta activo para sumar 25 puntos.",
      });
    }

    if (!mantener.sueldo && !solicitar.altaSueldo) {
      addCandidate({
        meta: "Solicitar productos",
        title: "Alta de acreditación de sueldo/haberes",
        points: 200,
        priority: 2,
        action:
          "Recomendar el alta de acreditación de sueldo/haberes. Es una acción de alto impacto porque suma 200 puntos en el mes.",
      });
    }

    if (!solicitar.seguroHogar) {
      addCandidate({
        meta: "Solicitar productos",
        title: "Alta de Seguro Hogar",
        points: 100,
        priority: 3,
        action:
          "Ofrecer Seguro Hogar si el cliente aún no lo tiene. Suma 100 puntos y puede acelerar el salto de nivel.",
      });
    }

    if (!solicitar.altaTarjeta) {
      addCandidate({
        meta: "Solicitar productos",
        title: "Alta de Tarjeta de Crédito",
        points: 50,
        priority: 4,
        action:
          "Ofrecer alta de Tarjeta de Crédito titular y/o adicional si todavía no fue realizada.",
      });
    }

    const debitosActuales = clampCount(mantener.debitos);
    if (debitosActuales < 5 && !mantenerCompletado) {
      addCandidate({
        meta: "Mantener tus productos",
        title: "Adherir débitos automáticos",
        points: 25,
        priority: 4,
        action:
          "Recomendar adhesión de débitos automáticos. Cada débito suma 25 puntos, con tope de 5.",
      });
    }

    const segurosActuales = clampCount(mantener.seguros);
    if (segurosActuales < 5 && !mantenerCompletado) {
      addCandidate({
        meta: "Mantener tus productos",
        title: "Sumar seguros activos",
        points: 25,
        priority: 5,
        action:
          "Revisar oportunidad de sumar seguros activos. Cada seguro suma 25 puntos, con tope de 5.",
      });
    }

    const prestamosActuales = clampCount(mantener.prestamos);
    if (prestamosActuales < 5 && !mantenerCompletado) {
      addCandidate({
        meta: "Mantener tus productos",
        title: "Sumar préstamo en regularidad",
        points: 25,
        priority: 6,
        action:
          "Si corresponde comercialmente, evaluar préstamo en regularidad. Cada préstamo suma 25 puntos, con tope de 5.",
      });
    }

    const montoConsumoNecesario = puntosFaltantes * MONEY_STEP_CONSUMO;
    addCandidate({
      meta: "Comprar y pagar",
      title: "Concentrar consumos y pagos en Macro",
      points: puntosFaltantes,
      priority: 3,
      action: `Como esta meta no tiene tope, el cliente podría sumar los ${formatNumber(
        puntosFaltantes
      )} puntos faltantes concentrando aproximadamente ${formatMoney(
        montoConsumoNecesario
      )} en consumos, pagos, recargas o débitos.`,
    });

    const rankedCandidates = candidates.sort((a, b) => {
      const aReaches = a.points >= puntosFaltantes ? 0 : 1;
      const bReaches = b.points >= puntosFaltantes ? 0 : 1;

      if (aReaches !== bReaches) return aReaches - bReaches;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.points - a.points;
    });

    const dynamicIndex =
      Math.abs(
        totalPuntos +
          puntosAhorro +
          puntosAhorroDiarios +
          puntosConsumo +
          diasHabilesNumber
      ) % Math.min(rankedCandidates.length, 3);

    return rankedCandidates[dynamicIndex] || rankedCandidates[0];
  }, [
    proximoNivel,
    puntosFaltantes,
    mantener,
    solicitar,
    puntosAhorro,
    puntosAhorroDiarios,
    puntosConsumo,
    totalPuntos,
    ahorroNumber,
    diasHabilesNumber,
    mantenerCompletado,
    ahorroCompletado,
  ]);

  const resetCalculator = () => {
    setMantener({
      clienteSelecta: true,
      sueldo: false,
      prestamos: 0,
      debitos: 0,
      seguros: 0,
    });

    setSolicitar({
      altaSueldo: false,
      altaTarjeta: false,
      seguroHogar: false,
    });

    setAhorroPesificado("");
    setDiasHabilesAhorro("");
    setConsumoMensual("");
  };

  return (
    <main className="app">
      <section className="hero compact-hero">
        <div className="hero-content compact-hero-content">
          <span className="eyebrow">Banco Macro · Sistema de Niveles</span>
          <h1>Calculadora Niveles y Recompensas</h1>
          <p>
            Simulá el avance del cliente y detectá la acción sugerida para
            ayudarlo a subir de nivel.
          </p>
        </div>

        <div className="breakdown-card top-breakdown-card">
          <h3>Puntos por meta</h3>

          <div>
            <span>Mantener productos</span>
            <strong>{formatNumber(puntosMantener)} pts</strong>
          </div>

          <div>
            <span>Solicitar productos</span>
            <strong>{formatNumber(puntosSolicitar)} pts</strong>
          </div>

          <div>
            <span>Ahorrar e invertir</span>
            <strong>{formatNumber(puntosAhorro)} pts</strong>
          </div>

          <div>
            <span>Comprar y pagar</span>
            <strong>{formatNumber(puntosConsumo)} pts</strong>
          </div>

          <div className="total-row">
            <span>Total puntos</span>
            <strong>{formatNumber(totalPuntos)} pts</strong>
          </div>
        </div>
      </section>

      <section className="sticky-progress">
        <div className="sticky-left">
          <div className="mini-level">
            <strong>{nivelActual.name}</strong>
          </div>

          <div className="sticky-progress-content">
            <div className="progress-copy">
              <span>Progreso hacia Nivel 3</span>
              <strong>{Math.round(progresoNivel3)}%</strong>
            </div>

            <div className="progress-bar sticky-bar">
              <div style={{ width: `${progresoNivel3}%` }} />
            </div>

            <div className="level-checkpoints">
              {LEVELS.map((level) => (
                <div
                  key={level.id}
                  className={`checkpoint ${
                    nivelActual.id >= level.id ? "unlocked" : ""
                  }`}
                >
                  <span>{level.id}</span>
                  <small>{level.name}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky-right">
          <div>
            <span>Puntos</span>
            <strong>{formatNumber(totalPuntos)}</strong>
          </div>

          <div>
            <span>Próximo objetivo</span>
            <strong>{proximoNivel ? proximoNivel.name : "Sostener"}</strong>
          </div>

          <div>
            <span>Puntos faltantes</span>
            <strong>
              {proximoNivel ? `${formatNumber(puntosFaltantes)} pts` : "0 pts"}
            </strong>
          </div>
        </div>
      </section>

      <section className="main-grid">
        <section className="calculator-panel compact-panel">
          <div className="panel-header">
            <div>
              <h2>Tablero de metas</h2>
              <p>
                Cargá la situación actual del cliente y calculá puntos por
                tenencia y uso.
              </p>
            </div>

            <button onClick={resetCalculator} className="secondary-button">
              Reiniciar
            </button>
          </div>

          <div className="macro-section">
            <div className="section-family">Tenencia</div>

            <div className="goal-card compact-goal">
              <div className="goal-header">
                <div>
                  <h3>Mantener tus productos</h3>
                </div>
                <strong>Tope {MANTENER_CAP} pts</strong>
              </div>

              <label className="check-row compact-row">
                <input
                  type="checkbox"
                  checked={mantener.clienteSelecta}
                  onChange={(e) =>
                    setMantener({
                      ...mantener,
                      clienteSelecta: e.target.checked,
                    })
                  }
                />
                <span>Cliente Macro Selecta</span>
                <strong>25 pts</strong>
              </label>

              <label className="check-row compact-row">
                <input
                  type="checkbox"
                  checked={mantener.sueldo}
                  onChange={(e) =>
                    setMantener({ ...mantener, sueldo: e.target.checked })
                  }
                />
                <span>Acreditación de Sueldo/Haberes</span>
                <strong>100 pts</strong>
              </label>

              <div className="input-grid compact-input-grid">
                <label>
                  Préstamos
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mantener.prestamos}
                    onChange={(e) =>
                      setMantener({
                        ...mantener,
                        prestamos: normalizeProductCount(e.target.value),
                      })
                    }
                  />
                  <small>25 pts c/u · Tope 5</small>
                </label>

                <label>
                  Débitos automáticos
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mantener.debitos}
                    onChange={(e) =>
                      setMantener({
                        ...mantener,
                        debitos: normalizeProductCount(e.target.value),
                      })
                    }
                  />
                  <small>25 pts c/u · Tope 5</small>
                </label>

                <label>
                  Seguros
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mantener.seguros}
                    onChange={(e) =>
                      setMantener({
                        ...mantener,
                        seguros: normalizeProductCount(e.target.value),
                      })
                    }
                  />
                  <small>25 pts c/u · Tope 5</small>
                </label>
              </div>
            </div>

            <div className="goal-card compact-goal">
              <div className="goal-header">
                <div>
                  <h3>Solicitar productos</h3>
                </div>
                <strong>Altas del mes</strong>
              </div>

              <label className="check-row compact-row">
                <input
                  type="checkbox"
                  checked={solicitar.altaSueldo}
                  onChange={(e) =>
                    setSolicitar({
                      ...solicitar,
                      altaSueldo: e.target.checked,
                    })
                  }
                />
                <span>Alta de acreditación de Sueldo/Haberes</span>
                <strong>200 pts</strong>
              </label>

              <label className="check-row compact-row">
                <input
                  type="checkbox"
                  checked={solicitar.altaTarjeta}
                  onChange={(e) =>
                    setSolicitar({
                      ...solicitar,
                      altaTarjeta: e.target.checked,
                    })
                  }
                />
                <span>Alta de Tarjeta de Crédito titular y/o adicional</span>
                <strong>50 pts</strong>
              </label>

              <label className="check-row compact-row">
                <input
                  type="checkbox"
                  checked={solicitar.seguroHogar}
                  onChange={(e) =>
                    setSolicitar({
                      ...solicitar,
                      seguroHogar: e.target.checked,
                    })
                  }
                />
                <span>Seguro Hogar</span>
                <strong>100 pts</strong>
              </label>
            </div>
          </div>

          <div className="macro-section">
            <div className="section-family">Uso</div>

            <div className="usage-grid">
              <div className="goal-card compact-goal">
                <div className="goal-header">
                  <div>
                    <h3>Ahorrar e invertir</h3>
                  </div>
                  <strong>Tope 80 pts diarios</strong>
                </div>

                <p className="goal-copy">
                  Saldo vista, plazo fijo y FCI. Cargar monto total pesificado.
                </p>

                <label className="money-input">
                  Volumen diario
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ahorroPesificado}
                    onChange={(e) =>
                      setAhorroPesificado(formatInputAmount(e.target.value))
                    }
                    placeholder="Ej: 8.000.000"
                  />
                  <small>Cada $100.000 = 1 punto · Tope 80 pts diarios</small>
                </label>

                <label className="money-input">
                  Días hábiles del mes
                  <input
                    type="text"
                    inputMode="numeric"
                    value={diasHabilesAhorro}
                    onChange={(e) =>
                      setDiasHabilesAhorro(
                        normalizeBusinessDays(e.target.value)
                      )
                    }
                    placeholder="Ej: 5"
                  />
                  <small>Tope 25 días hábiles</small>
                </label>
              </div>

              <div className="goal-card compact-goal">
                <div className="goal-header">
                  <div>
                    <h3>Comprar y pagar</h3>
                  </div>
                  <strong>Sin tope</strong>
                </div>

                <p className="goal-copy">
                  TC, TD, PCT, débitos, servicios y recargas.
                </p>

                <label className="money-input">
                  Volumen mensual
                  <input
                    type="text"
                    inputMode="numeric"
                    value={consumoMensual}
                    onChange={(e) =>
                      setConsumoMensual(formatInputAmount(e.target.value))
                    }
                    placeholder="Ej: 850.000"
                  />
                  <small>Cada $10.000 = 1 punto</small>
                </label>
              </div>
            </div>
          </div>
        </section>

        <aside className="result-panel compact-result-panel">
          <div className="levels-card featured-levels">
            <h3>Progresión de niveles</h3>

            {LEVELS.map((level) => (
              <div
                key={level.id}
                className={`level-row ${
                  nivelActual.id === level.id ? "active" : ""
                }`}
              >
                <span>{level.name}</span>
                <strong>{level.range}</strong>
              </div>
            ))}
          </div>

          <div className="pma-card">
            <span>Acción sugerida</span>
            <h3>{pma.title}</h3>
            <div className="pma-meta">{pma.meta}</div>
            <p>{pma.action}</p>
          </div>

          <div className="rewards-card">
            <span>Recompensas por nivel</span>
            <h3>Consultá los beneficios disponibles</h3>
            <p>
              Accedé al detalle actualizado de recompensas, beneficios y
              condiciones por nivel.
            </p>
            <a href={REWARDS_URL} target="_blank" rel="noreferrer">
              Ver recompensas
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;