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
    description: "Máximo nivel de beneficios, experiencias y condiciones preferenciales.",
  },
];

const MONEY_STEP_AHORRO = 100000;
const MONEY_STEP_CONSUMO = 10000;
const AHORRO_DAILY_CAP = 80;
const MANTENER_CAP = 500;

const formatNumber = (value) =>
  new Intl.NumberFormat("es-AR").format(Math.max(0, Number(value) || 0));

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Number(value) || 0));

const clampCount = (value) => {
  const parsedValue = Number(value) || 0;
  return Math.min(Math.max(parsedValue, 0), 5);
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
  const [consumoMensual, setConsumoMensual] = useState("");

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

  const puntosAhorro = useMemo(() => {
    const puntos = Math.floor((Number(ahorroPesificado) || 0) / MONEY_STEP_AHORRO);
    return Math.min(puntos, AHORRO_DAILY_CAP);
  }, [ahorroPesificado]);

  const puntosConsumo = useMemo(() => {
    return Math.floor((Number(consumoMensual) || 0) / MONEY_STEP_CONSUMO);
  }, [consumoMensual]);

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
  const ahorroCompletado = puntosAhorro >= AHORRO_DAILY_CAP;

  const pma = useMemo(() => {
    if (!proximoNivel) {
      return {
        meta: "Mantener nivel",
        title: "Cliente en Nivel 3",
        points: 0,
        action:
          "El cliente ya alcanzó el máximo nivel. La prioridad comercial es sostener sus hábitos de uso, tenencia e inversión para conservar beneficios.",
        pitch:
          "Ya estás en el máximo nivel del programa. La clave ahora es mantener tu vínculo con Macro para seguir accediendo a las mejores recompensas.",
      };
    }

    const candidates = [];

    if (!mantener.clienteSelecta) {
      candidates.push({
        meta: "Mantener tus productos",
        title: "Regularizar condición Selecta",
        points: 25,
        priority: 4,
        action:
          "Validar que el cliente cuente con Servicio Macro Selecta activo para sumar 25 puntos.",
        pitch:
          "Activando tu condición Selecta sumás puntos y fortalecés tu perfil dentro del programa.",
      });
    }

    if (!mantener.sueldo && !solicitar.altaSueldo) {
      candidates.push({
        meta: "Solicitar productos",
        title: "Alta de acreditación de sueldo/haberes",
        points: 200,
        priority: 1,
        action:
          "Recomendar el alta de acreditación de sueldo/haberes. Es una de las acciones de mayor impacto para acelerar el salto de nivel.",
        pitch:
          "Si traés tu sueldo a Macro, sumás 200 puntos este mes y quedás mucho más cerca de desbloquear un mejor nivel.",
      });
    }

    if (!mantener.sueldo && solicitar.altaSueldo && !mantener.sueldo) {
      candidates.push({
        meta: "Mantener tus productos",
        title: "Mantener acreditación de sueldo/haberes",
        points: 100,
        priority: 2,
        action:
          "Una vez dada de alta la acreditación, sostenerla como producto activo suma 100 puntos dentro de la meta de tenencia.",
        pitch:
          "Manteniendo tu sueldo acreditado en Macro, reforzás tu vínculo mensual y seguís sumando para mejorar tu nivel.",
      });
    }

    if (!solicitar.seguroHogar) {
      candidates.push({
        meta: "Solicitar productos",
        title: "Alta de Seguro Hogar",
        points: 100,
        priority: 2,
        action:
          "Ofrecer Seguro Hogar si el cliente aún no lo tiene. Suma 100 puntos en el mes y puede acercarlo al próximo nivel.",
        pitch:
          "Con el alta de Seguro Hogar sumás 100 puntos este mes y podés acercarte al próximo nivel de recompensas.",
      });
    }

    if (!solicitar.altaTarjeta) {
      candidates.push({
        meta: "Solicitar productos",
        title: "Alta de Tarjeta de Crédito",
        points: 50,
        priority: 3,
        action:
          "Ofrecer alta de Tarjeta de Crédito titular y/o adicional si todavía no fue realizada.",
        pitch:
          "Con el alta de una tarjeta de crédito Macro sumás 50 puntos y ampliás tus posibilidades de acceder a más beneficios.",
      });
    }

    const prestamosActuales = clampCount(mantener.prestamos);
    if (prestamosActuales < 5 && !mantenerCompletado) {
      candidates.push({
        meta: "Mantener tus productos",
        title: "Sumar préstamo en regularidad",
        points: 25,
        priority: 5,
        action:
          "Si corresponde comercialmente, evaluar préstamo en regularidad. Cada préstamo suma 25 puntos, con tope de 5.",
        pitch:
          "Un préstamo activo y en regularidad también suma puntos todos los meses dentro de tu vínculo con Macro.",
      });
    }

    const debitosActuales = clampCount(mantener.debitos);
    if (debitosActuales < 5 && !mantenerCompletado) {
      candidates.push({
        meta: "Mantener tus productos",
        title: "Adherir débitos automáticos",
        points: 25,
        priority: 3,
        action:
          "Recomendar adhesión de débitos automáticos. Cada débito suma 25 puntos, con tope de 5.",
        pitch:
          "Si adherís servicios al débito automático, sumás puntos todos los meses y te acercás al próximo nivel.",
      });
    }

    const segurosActuales = clampCount(mantener.seguros);
    if (segurosActuales < 5 && !mantenerCompletado) {
      candidates.push({
        meta: "Mantener tus productos",
        title: "Sumar seguros activos",
        points: 25,
        priority: 4,
        action:
          "Revisar oportunidad de sumar seguros activos. Cada seguro suma 25 puntos, con tope de 5.",
        pitch:
          "Cada seguro activo suma puntos mensuales y fortalece tu nivel dentro del programa.",
      });
    }

    const ahorroRestante = AHORRO_DAILY_CAP - puntosAhorro;
    if (ahorroRestante > 0) {
      const puntosAUsar = Math.min(puntosFaltantes, ahorroRestante);
      const montoNecesario = puntosAUsar * MONEY_STEP_AHORRO;

      candidates.push({
        meta: "Ahorrar e invertir",
        title: "Incrementar saldo vista o inversiones",
        points: puntosAUsar,
        priority: 2,
        action: `Para sumar ${formatNumber(
          puntosAUsar
        )} puntos, el cliente debería incrementar aproximadamente ${formatMoney(
          montoNecesario
        )} en saldo vista, plazo fijo o FCI. La meta tiene tope de 80 puntos diarios.`,
        pitch: `Si incrementás tu saldo o inversiones en aproximadamente ${formatMoney(
          montoNecesario
        )}, podés sumar ${formatNumber(
          puntosAUsar
        )} puntos y acercarte al próximo nivel.`,
      });
    }

    const montoConsumoNecesario = puntosFaltantes * MONEY_STEP_CONSUMO;
    candidates.push({
      meta: "Comprar y pagar",
      title: "Concentrar consumos y pagos en Macro",
      points: puntosFaltantes,
      priority: 3,
      action: `Como esta meta no tiene tope, el cliente podría sumar los ${formatNumber(
        puntosFaltantes
      )} puntos faltantes concentrando aproximadamente ${formatMoney(
        montoConsumoNecesario
      )} en consumos, pagos, recargas o débitos.`,
      pitch: `Si concentrás aproximadamente ${formatMoney(
        montoConsumoNecesario
      )} en consumos, pagos o recargas con Macro, podrías sumar los puntos necesarios para alcanzar ${proximoNivel.name}.`,
    });

    const rankedCandidates = candidates.sort((a, b) => {
      const aReaches = a.points >= puntosFaltantes ? 0 : 1;
      const bReaches = b.points >= puntosFaltantes ? 0 : 1;

      if (aReaches !== bReaches) return aReaches - bReaches;
      if (a.priority !== b.priority) return a.priority - b.priority;

      return b.points - a.points;
    });

    return rankedCandidates[0];
  }, [
    proximoNivel,
    puntosFaltantes,
    mantener,
    solicitar,
    puntosAhorro,
    mantenerCompletado,
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
    setConsumoMensual("");
  };

  return (
    <main className="app">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Banco Macro · Sistema de Niveles</span>
          <h1>Calculadora Comercial Loyalty</h1>
          <p>
            Simulá el avance de un cliente, identificá su brecha para subir de
            nivel y obtené una próxima mejor acción comercial.
          </p>
        </div>

        <div className="hero-card">
          <span className="hero-card-label">Resultado actual</span>
          <h2>{nivelActual.name}</h2>
          <p>{nivelActual.description}</p>

          <div className="hero-points">
            <strong>{formatNumber(totalPuntos)}</strong>
            <span>puntos acumulados</span>
          </div>
        </div>
      </section>

      <section className="main-grid">
        <section className="calculator-panel">
          <div className="panel-header">
            <div>
              <h2>Datos del cliente</h2>
              <p>Cargá la situación actual para calcular nivel y brecha.</p>
            </div>

            <button onClick={resetCalculator} className="secondary-button">
              Reiniciar
            </button>
          </div>

          <div className="macro-section">
            <div className="section-family">Tenencia</div>

            <div className="goal-card">
              <div className="goal-header">
                <div>
                  <span>Meta 01</span>
                  <h3>Mantener tus productos</h3>
                </div>
                <strong>Tope {MANTENER_CAP} pts</strong>
              </div>

              <label className="check-row">
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

              <label className="check-row">
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

              <div className="input-grid">
                <label>
                  Préstamos
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={mantener.prestamos}
                    onChange={(e) =>
                      setMantener({
                        ...mantener,
                        prestamos: e.target.value,
                      })
                    }
                  />
                  <small>25 pts c/u · Tope 5</small>
                </label>

                <label>
                  Débitos automáticos
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={mantener.debitos}
                    onChange={(e) =>
                      setMantener({
                        ...mantener,
                        debitos: e.target.value,
                      })
                    }
                  />
                  <small>25 pts c/u · Tope 5</small>
                </label>

                <label>
                  Seguros
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={mantener.seguros}
                    onChange={(e) =>
                      setMantener({
                        ...mantener,
                        seguros: e.target.value,
                      })
                    }
                  />
                  <small>25 pts c/u · Tope 5</small>
                </label>
              </div>
            </div>

            <div className="goal-card">
              <div className="goal-header">
                <div>
                  <span>Meta 02</span>
                  <h3>Solicitar productos</h3>
                </div>
                <strong>Altas del mes</strong>
              </div>

              <label className="check-row">
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

              <label className="check-row">
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

              <label className="check-row">
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

            <div className="goal-card">
              <div className="goal-header">
                <div>
                  <span>Meta 03</span>
                  <h3>Ahorrar e invertir</h3>
                </div>
                <strong>Tope 80 pts diarios</strong>
              </div>

              <p className="goal-copy">
                Considera saldo vista e inversiones en Banco Macro: caja de
                ahorro, plazo fijo y FCI. Cargar monto total pesificado.
              </p>

              <label className="money-input">
                Volumen total acumulado diario
                <input
                  type="number"
                  min="0"
                  value={ahorroPesificado}
                  onChange={(e) => setAhorroPesificado(e.target.value)}
                  placeholder="Ej: 2.500.000"
                />
                <small>Cada $100.000 = 1 punto</small>
              </label>
            </div>

            <div className="goal-card">
              <div className="goal-header">
                <div>
                  <span>Meta 04</span>
                  <h3>Comprar y pagar</h3>
                </div>
                <strong>Sin tope</strong>
              </div>

              <p className="goal-copy">
                Considera consumos con TC, TD, PCT, débitos automáticos, pago de
                servicios y recargas. Cargar volumen mensual pesificado.
              </p>

              <label className="money-input">
                Volumen total acumulado mensual
                <input
                  type="number"
                  min="0"
                  value={consumoMensual}
                  onChange={(e) => setConsumoMensual(e.target.value)}
                  placeholder="Ej: 850.000"
                />
                <small>Cada $10.000 = 1 punto</small>
              </label>
            </div>
          </div>
        </section>

        <aside className="result-panel">
          <div className="result-card primary-result">
            <span>Nivel actual</span>
            <h2>{nivelActual.name}</h2>
            <p>{nivelActual.range}</p>
          </div>

          <div className="progress-block">
            <div className="progress-top">
              <span>Progreso hacia Nivel 3</span>
              <strong>{Math.round(progresoNivel3)}%</strong>
            </div>

            <div className="progress-bar">
              <div style={{ width: `${progresoNivel3}%` }} />
            </div>
          </div>

          {proximoNivel ? (
            <div className="gap-card">
              <span>Brecha comercial</span>
              <h3>
                Faltan {formatNumber(puntosFaltantes)} puntos para{" "}
                {proximoNivel.name}
              </h3>
              <p>
                Objetivo inmediato: identificar la acción más simple para cerrar
                la brecha y desbloquear mejores recompensas.
              </p>
            </div>
          ) : (
            <div className="gap-card success">
              <span>Brecha comercial</span>
              <h3>Cliente en máximo nivel</h3>
              <p>
                La oportunidad está en sostener principalidad, recurrencia y uso
                mensual.
              </p>
            </div>
          )}

          <div className="pma-card">
            <span>Próxima mejor acción</span>
            <h3>{pma.title}</h3>
            <div className="pma-meta">{pma.meta}</div>
            <p>{pma.action}</p>
          </div>

          <div className="pitch-card">
            <span>Speech sugerido</span>
            <p>“{pma.pitch}”</p>
          </div>

          <div className="breakdown-card">
            <h3>Detalle de puntos</h3>

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
              <span>Total</span>
              <strong>{formatNumber(totalPuntos)} pts</strong>
            </div>
          </div>

          <div className="levels-card">
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
        </aside>
      </section>
    </main>
  );
}

export default App;